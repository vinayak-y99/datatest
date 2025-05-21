# Resume
from fastapi import HTTPException, UploadFile, File
from pydantic import BaseModel
from typing import Optional, List, Dict, Union, Any, Tuple
import io
from app.models.base import DashboardContent
from sqlalchemy.orm import Session
import fitz
import docx
from bson import ObjectId
import wave
import pyaudio
import sounddevice as sd
import threading
import speech_recognition as sr
import google.generativeai as genai
from app.database.mongo_connection import insert_data, find_one
import queue
import time
import logging
from datetime import datetime
from app.core.Config import GOOGLE_API_KEY
from app.services.resume.prompt_engineering import (
    Resume_GENERATE_QA_PROMPT,
    Resume_GENERATE_SIMILAR_QA_PROMPT,
    Resume_EVALUATE_QA_PROMPT,
    Resume_QUESTION_STARTERS,
    Resume_KEY_INFORMATION,
)

logger = logging.getLogger(__name__)

class ResumeProcessorllm:
    def __init__(self):
        self.interviewer_lines = []
        self.candidate_lines = []
        self.status = "success"
        self.data = None
        self.error = None

    # Initialize Gemini
    # Configure with your API key
    genai.configure(api_key=GOOGLE_API_KEY)

    # Then initialize with the correct model name
    model = genai.GenerativeModel("gemini-1.5-pro")  # Try this updated model name

    async def upload_file(
        file: UploadFile = File(...),
    ) -> Dict[str, Union[List[str], str]]:
        try:
            content = await file.read()
            await file.seek(0)

            if file.filename.endswith(".pdf"):
                text = ResumeProcessorllm.extract_text_from_pdf(content)
            elif file.filename.endswith(".docx"):
                text = ResumeProcessorllm.extract_text_from_docx(file.file)
            else:
                raise HTTPException(status_code=400, detail="Unsupported file type")

            # Use LLM to extract resume information instead of regex
            resume_info = ResumeProcessorllm.extract_resume_info_with_llm(text)
            return {"resume_info": resume_info, "text": text}
        except Exception as e:
            raise HTTPException(
                status_code=500, detail=f"Error processing file: {str(e)}"
            )

    def extract_text_from_pdf(file: bytes) -> str:
        try:
            doc = fitz.open(stream=file, filetype="pdf")
            text = ""
            for page in doc:
                text += page.get_text()
            doc.close()
            return text
        except Exception as e:
            raise HTTPException(
                status_code=400, detail=f"Error extracting PDF text: {str(e)}"
            )

    def extract_resume_info_with_llm(text: str) -> Dict[str, str]:
        """Extract resume information using LLM instead of regex patterns"""
        try:
            # Create a prompt for the LLM to extract the required information
            prompt = f"""
            Extract the following information from this resume text:
            {Resume_KEY_INFORMATION}
            
            Format your response as JSON with these exact keys: name, experience, location, contact_info
            
            Resume text:
            {text[:5000]}  # Limit text length to avoid token limits
            """

            # Generate response from the model
            response = ResumeProcessorllm.model.generate_content(prompt)

            # Try to parse the response as structured data
            response_text = response.text.strip()

            # If the response is in JSON format, parse it directly
            if response_text.startswith("{") and response_text.endswith("}"):
                import json

                try:
                    return json.loads(response_text)
                except:
                    pass

            # Otherwise, extract the information manually
            info = {}

            # Extract name
            name_prompt = f"What is the full name of the person in this resume? Only respond with the name, nothing else.\n\nResume:\n{text[:2000]}"
            name_response = ResumeProcessorllm.model.generate_content(name_prompt)
            info["name"] = name_response.text.strip()

            # Extract experience
            exp_prompt = f"Summarize the work experience from this resume including job titles, companies, and years. Be concise.\n\nResume:\n{text[:3000]}"
            exp_response = ResumeProcessorllm.model.generate_content(exp_prompt)
            info["experience"] = exp_response.text.strip()

            # Extract location
            loc_prompt = f"What is the location (city and country) mentioned in this resume? Only respond with the location, nothing else.\n\nResume:\n{text[:2000]}"
            loc_response = ResumeProcessorllm.model.generate_content(loc_prompt)
            info["location"] = loc_response.text.strip()

            # Extract contact info
            contact_prompt = f"Extract the email address and phone number from this resume. Format as 'Email: X, Phone: Y'.\n\nResume:\n{text[:2000]}"
            contact_response = ResumeProcessorllm.model.generate_content(contact_prompt)
            info["contact_info"] = contact_response.text.strip()

            return info

        except Exception as e:
            print(f"Error extracting resume info with LLM: {str(e)}")
            # Fallback to empty values if LLM extraction fails
            return {"name": "", "experience": "", "location": "", "contact_info": ""}

    def extract_text_from_docx(file: Union[bytes, Any]) -> str:
        try:
            if isinstance(file, bytes):
                file = io.BytesIO(file)
            doc = docx.Document(file)
            return "\n".join(
                [paragraph.text for paragraph in doc.paragraphs if paragraph.text]
            )
        except Exception as e:
            raise HTTPException(
                status_code=400, detail=f"Error extracting DOCX text: {str(e)}"
            )

    def extract_resume_sections(text: str) -> Dict[str, str]:
        try:
            # Use LLM to identify and extract resume sections
            prompt = f"""
            Divide this resume into logical sections (like Education, Experience, Skills, etc.).
            Format your response as a JSON object where keys are section names and values are the section content.
            
            Resume:
            {text[:5000]}  # Limit text length to avoid token limits
            """

            response = ResumeProcessorllm.model.generate_content(prompt)
            response_text = response.text.strip()

            # Try to parse as JSON
            if response_text.startswith("{") and response_text.endswith("}"):
                import json

                try:
                    return json.loads(response_text)
                except:
                    pass

            # Fallback to simple section extraction if JSON parsing fails
            sections = {}
            lines = [line.strip() for line in text.split("\n") if line.strip()]
            current_section = "General"
            current_content = []

            for line in lines:
                if line.isupper() or (len(line) < 30 and line.endswith(":")):
                    # This might be a section header
                    if current_section and current_content:
                        sections[current_section] = "\n".join(current_content).strip()
                    current_section = line.replace(":", "").strip()
                    current_content = []
                else:
                    current_content.append(line)

            # Add the last section
            if current_section and current_content:
                sections[current_section] = "\n".join(current_content).strip()

            return sections

        except Exception as e:
            print(f"Error extracting resume sections with LLM: {str(e)}")
            # Fallback to empty dict if extraction fails
            return {"General": text}

    def extract_keywords(text: str) -> List[str]:
        try:
            # Configure with your API key
            genai.configure(api_key=GOOGLE_API_KEY)
            
            # Initialize with the correct model name
            model = genai.GenerativeModel("gemini-1.5-pro")
            
            prompt = f"""
            Extract the most important keywords from this resume text. 
            Focus on technical skills, tools, programming languages, and domain expertise.
            Return only a list of keywords, separated by commas.
            
            Resume text:
            {text[:5000]}  # Limit text to avoid token limits
            """
            
            response = model.generate_content(prompt)
            keywords = [kw.strip() for kw in response.text.split(',')]
            return keywords
        except Exception as e:
            print(f"Error extracting keywords: {str(e)}")
            return []

    def extract_candidate_info(text: str) -> Dict[str, str]:
        try:
            # Configure with your API key
            genai.configure(api_key=GOOGLE_API_KEY)
            
            # Initialize with the correct model name
            model = genai.GenerativeModel("gemini-1.5-pro")
            
            prompt = f"""
            Extract the following candidate information from this resume text:
            - name: Full name of the candidate
            - email: Email address
            - phone: Phone number
            - location: Current location
            
            Format your response ONLY as a valid JSON object with these exact keys.
            Do not include any explanations, markdown formatting, or additional text.
            
            Resume text:
            {text[:5000]}
            """
            
            response = model.generate_content(prompt)
            response_text = response.text.strip()
            
            # Clean up the response to ensure it's valid JSON
            # Remove any markdown code block indicators
            response_text = response_text.replace("```json", "").replace("```", "").strip()
            
            # Try to parse as JSON
            import json
            try:
                return json.loads(response_text)
            except json.JSONDecodeError:
                # If JSON parsing fails, try individual prompts for each field
                info = {}
                
                # Extract name with dedicated prompt
                name_prompt = f"What is the full name of the person in this resume? Only respond with the name, nothing else.\n\nResume:\n{text[:2000]}"
                name_response = model.generate_content(name_prompt)
                info["name"] = name_response.text.strip()
                
                # Extract email with dedicated prompt
                email_prompt = f"What is the email address in this resume? Only respond with the email address, nothing else.\n\nResume:\n{text[:2000]}"
                email_response = model.generate_content(email_prompt)
                info["email"] = email_response.text.strip()
                
                # Extract phone with dedicated prompt
                phone_prompt = f"What is the phone number in this resume? Only respond with the phone number, nothing else.\n\nResume:\n{text[:2000]}"
                phone_response = model.generate_content(phone_prompt)
                info["phone"] = phone_response.text.strip()
                
                # Extract location with dedicated prompt
                location_prompt = f"What is the location (city, state, country) mentioned in this resume? Only respond with the location, nothing else.\n\nResume:\n{text[:2000]}"
                location_response = model.generate_content(location_prompt)
                info["location"] = location_response.text.strip()
                
                return info
            
        except Exception as e:
            print(f"Error extracting candidate info: {str(e)}")
            return {"name": "", "email": "", "phone": "", "location": ""}
    
    def extract_name_advanced(text: str) -> str:
        try:
            # Configure with your API key
            genai.configure(api_key=GOOGLE_API_KEY)
            
            # Initialize with the correct model name
            model = genai.GenerativeModel("gemini-1.5-pro")
            
            # First attempt - direct question
            prompt1 = f"""
            What is the full name of the person in this resume? 
            Only respond with the name, nothing else.
            
            Resume text:
            {text[:3000]}
            """
            
            response1 = model.generate_content(prompt1)
            name = response1.text.strip()
            
            # If first attempt seems unsuccessful (too long or too short), try a different prompt
            if len(name.split()) > 5 or len(name.split()) < 1:
                prompt2 = f"""
                Analyze this resume and extract ONLY the candidate's full name.
                The name is likely at the top of the resume or in the header section.
                Respond with ONLY the first and last name, no titles, no explanations.
                
                Resume text:
                {text[:3000]}
                """
                
                response2 = model.generate_content(prompt2)
                name = response2.text.strip()
            
            return name if name else "Unknown Candidate"
            
        except Exception as e:
            print(f"Error extracting name: {str(e)}")
            return "Unknown Candidate"
    
    def generate_dashboard(
    text: Union[str, bytes],
    scale: int,
    dashboard_index: int,
    prompt: Optional[str] = None) -> Dict[str, str]:
        try:
            if isinstance(text, bytes):
                text = text.decode("utf-8")

            if prompt:
                dashboard_content = ResumeProcessorllm.extract_content_for_dashboard(prompt, text)
                print("Generated dashboard content:", dashboard_content)
            else:
                sections = ResumeProcessorllm.extract_resume_sections(text)
                selected_sections = list(sections.items())[:scale]
                if dashboard_index < len(selected_sections):
                    dashboard_content = f"{selected_sections[dashboard_index][0]}:\n{selected_sections[dashboard_index][1]}"
                else:
                    dashboard_content = "No content available for this dashboard index"

            if not dashboard_content.strip():
                dashboard_content = "Content could not be extracted from the provided text"

            return {"status": "success", "content": dashboard_content.strip()}
        except Exception as e:
            return {"status": "error", "error": str(e)}

    def extract_content_for_dashboard(prompt: str, text: str) -> str:
        try:
            llm_prompt = f"""
            Extract the most relevant information from this resume based on this search query: "{prompt}"
            
            Resume:
            {text[:5000]}
            
            Return only the extracted information, formatted clearly.
            If no exact match is found, return the most relevant section.
            """

            response = ResumeProcessorllm.model.generate_content(llm_prompt)
            extracted_content = response.text.strip()
            
            if not extracted_content:
                sections = ResumeProcessorllm.extract_resume_sections(text)
                first_section = list(sections.items())[0]
                extracted_content = f"{first_section[0]}:\n{first_section[1]}"

            return extracted_content

        except Exception as e:
            print(f"Error extracting dashboard content with LLM: {str(e)}")
            return "Could not extract content from resume"

    async def get_dashboard_content(dashboard_id: str, db: Session) -> Dict[str, Any]:
        try:
            # Use synchronous SQLAlchemy query
            dashboard_content = db.query(DashboardContent).filter(DashboardContent.id == dashboard_id).first()

            if not dashboard_content:
                return {"status": "error","message": "Dashboard content not found"}
            return {
                "status": "success",
                "data": {
                    "id": str(dashboard_content.id),
                    "prompt": dashboard_content.prompt,
                    "content": dashboard_content.content,
                    "status": dashboard_content.status,
                    "created_at": dashboard_content.created_at.isoformat() if dashboard_content.created_at else None,
                    "metadata": {
                        "sections_count": len(dashboard_content.content.split('\n\n')) if dashboard_content.content else 0,
                        "content_length": len(dashboard_content.content) if dashboard_content.content else 0}}}

        except Exception as e:
            logger.error(f"Error retrieving dashboard content: {str(e)}")
            return {"status": "error","message": f"Error retrieving dashboard: {str(e)}"}


    def generate_qa(dashboard_content: str, num_qa: int) -> str:
        try:
            qa_prompt = Resume_GENERATE_QA_PROMPT.format(num_qa=num_qa, dashboard_content=dashboard_content)
            generate_qa_response = ResumeProcessorllm.model.generate_content(qa_prompt)
            qa_text = generate_qa_response.text.strip()

            formatted_qa = []
            lines = qa_text.split("\n")
            current_qa_pair = []
            qa_pairs = []
            
            for line in lines:
                line = line.strip()
                if not line:
                    continue

                if line.startswith("Q"):
                    if current_qa_pair:
                        formatted_qa.extend(current_qa_pair)
                        qa_pairs.append({
                            "question": current_qa_pair[0].split(":", 1)[1].strip(),
                            "answer": current_qa_pair[1].split(":", 1)[1].strip() if len(current_qa_pair) > 1 else ""
                        })
                        current_qa_pair = []
                    
                    q_number = len(qa_pairs) + 1
                    formatted_line = f"Q{q_number}:{line.split(':', 1)[1].strip() if ':' in line else line[1:].strip()}"
                    current_qa_pair.append(formatted_line)
                    
                elif line.startswith("A"):
                    a_number = len(qa_pairs) + 1
                    formatted_line = f"A{a_number}:{line.split(':', 1)[1].strip() if ':' in line else line[1:].strip()}"
                    current_qa_pair.append(formatted_line)

            if current_qa_pair:
                formatted_qa.extend(current_qa_pair)
                qa_pairs.append({
                    "question": current_qa_pair[0].split(":", 1)[1].strip(),
                    "answer": current_qa_pair[1].split(":", 1)[1].strip() if len(current_qa_pair) > 1 else ""
                })

            current_time = datetime.utcnow()

            qa_data = {
                "job_id": None,
                "questions": qa_pairs,
                "question_categories": {
                    "technical": [],
                    "behavioral": [],
                    "experience": [],
                    "role_specific": qa_pairs
                },
                "difficulty_distribution": {
                    "easy": qa_pairs[:len(qa_pairs)//3],
                    "medium": qa_pairs[len(qa_pairs)//3:2*len(qa_pairs)//3],
                    "hard": qa_pairs[2*len(qa_pairs)//3:]
                },
                "generated_at": current_time,
                "last_updated": current_time,
                "meta_data": {
                    "num_pairs": num_qa,
                    "dashboard_content_length": len(dashboard_content)
                }
            }

            result = insert_data("ai_generated_questions", qa_data)
            
            formatted_text = "\n".join(formatted_qa)
            return {
                "formatted_qa": formatted_text,
                "qa_id": str(result.inserted_id),
                "metadata": {
                    "total_questions": len(qa_pairs),
                    "generated_at": current_time.isoformat()
                }
            }

        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error generating Q&A: {str(e)}"
            )

    def get_audio_qa_content(qa_id: str) -> Dict[str, Any]:
        def datetime_handler(obj):
            if isinstance(obj, datetime):
                return obj.isoformat()
            raise TypeError(f'Object of type {type(obj)} is not JSON serializable')
        try:
            object_id = ObjectId(qa_id)
            qa_data = find_one("ai_generated_questions", {"_id": object_id, "type": "Similar QA"})
            
            if not qa_data:
                return {
                    "status": "error",
                    "message": "Audio QA content not found"
                }

            formatted_qa_data = {
                "status": "success",
                "data": {
                    "qa_id": str(qa_data["_id"]),
                    "type": qa_data.get("type", ""),
                    "primary_content": qa_data.get("primary_content", ""),
                    "original_qa": qa_data.get("original_qa", ""),
                    "questions": qa_data.get("questions", []),
                    "meta_data": qa_data.get("meta_data", {}),
                    "question_categories": {
                        "technical": qa_data.get("question_categories", {}).get("technical", []),
                        "behavioral": qa_data.get("question_categories", {}).get("behavioral", []),
                        "experience": qa_data.get("question_categories", {}).get("experience", []),
                        "role_specific": qa_data.get("question_categories", {}).get("role_specific", [])
                    },
                    "difficulty_distribution": qa_data.get("difficulty_distribution", {}),
                    "timestamps": {
                        "created_at": datetime_handler(qa_data.get("created_at")),
                        "generated_at": datetime_handler(qa_data.get("generated_at")),
                        "last_updated": datetime_handler(qa_data.get("last_updated"))
                    }
                }
            }

            return formatted_qa_data

        except Exception as e:
            logger.error(f"Error retrieving audio QA content from MongoDB: {str(e)}")
            return {
                "status": "error",
                "message": f"Error retrieving audio QA content: {str(e)}"
            }

    def get_qa_content(qa_id: str) -> Dict[str, Any]:
        def datetime_handler(obj):
            if isinstance(obj, datetime):
                return obj.isoformat()
            raise TypeError(f'Object of type {type(obj)} is not JSON serializable')

        try:
            # Find by ObjectId
            object_id = ObjectId(qa_id)
            qa_data = find_one("ai_generated_questions", {"_id": object_id})
            
            if not qa_data:
                return {
                    "status": "error",
                    "message": "QA content not found"
                }

            formatted_qa_data = {
                "status": "success",
                "data": {
                    "qa_id": str(qa_data["_id"]),
                    "type": qa_data.get("type", ""),
                    "primary_content": qa_data.get("primary_content", ""),
                    "questions": qa_data.get("questions", []),
                    "metadata": {
                        "total_questions": len(qa_data.get("questions", [])),
                        "categories": {
                            "technical": len(qa_data.get("question_categories", {}).get("technical", [])),
                            "behavioral": len(qa_data.get("question_categories", {}).get("behavioral", [])),
                            "experience": len(qa_data.get("question_categories", {}).get("experience", [])),
                            "role_specific": len(qa_data.get("question_categories", {}).get("role_specific", []))
                        }
                    },
                    "difficulty_distribution": qa_data.get("difficulty_distribution", {}),
                    "timestamps": {
                        "created_at": datetime_handler(qa_data.get("created_at")) if qa_data.get("created_at") else None,
                        "generated_at": datetime_handler(qa_data.get("generated_at")) if qa_data.get("generated_at") else None,
                        "last_updated": datetime_handler(qa_data.get("last_updated")) if qa_data.get("last_updated") else None
                    }
                }
            }

            return formatted_qa_data

        except Exception as e:
            logger.error(f"Error retrieving QA content from MongoDB: {str(e)}")
            return {
                "status": "error",
                "message": f"Error retrieving QA content: {str(e)}"
            }


class TranscriptionState(BaseModel):
    is_recording: bool = False
    interviewer_lines: List[str] = []
    candidate_lines: List[str] = []
    current_question_id: int = 0
    last_answer_time: float = 0


class TranscriberResponse(BaseModel):
    status: str
    data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None


class GenerateQARequest(BaseModel):
    num_pairs: int


class InitializeRequest(BaseModel):
    api_key: str


class Resume_DualInputTranscriber:
    _instance = None
    _state = TranscriptionState()
    model = None
    is_recording = False
    is_initialized = False

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(Resume_DualInputTranscriber, cls).__new__(cls)
        return cls._instance

    def __init__(self):
        if not hasattr(self, "initialized"):
            self.recognizer = sr.Recognizer()
            self.audio = pyaudio.PyAudio()
            self.mic_queue = queue.Queue()
            self.speaker_queue = queue.Queue()
            self.text_queue = queue.Queue()
            self.initialized = True

    async def initialize(cls, api_key: str) -> Dict[str, Any]:
        try:
            if cls._instance is None:
                cls._instance = cls()
            genai.configure(api_key=api_key)
            cls.model = genai.GenerativeModel("gemini-pro")
            cls.is_initialized = True
            return {
                "status": "success",
                "data": {"message": "Initialized successfully"},
            }
        except Exception as e:
            return {"status": "error", "error": str(e)}

    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def _is_question(text: str) -> bool:
        text_lower = text.lower().strip()
        return (
            any(text_lower.startswith(starter) for starter in Resume_QUESTION_STARTERS)
            or "?" in text
        )

    async def clear_transcription() -> Dict[str, Any]:
        if not Resume_DualInputTranscriber.is_initialized:
            return {"status": "error", "error": "Transcriber not initialized"}
        try:
            Resume_DualInputTranscriber._state = TranscriptionState()
            return {
                "status": "success",
                "data": {
                    "message": "Transcription cleared",
                    "text": Resume_DualInputTranscriber._get_combined_text(),
                },
            }
        except Exception as e:
            return {"status": "error", "error": str(e)}

    async def evaluate_qa(cls) -> Dict[str, Any]:
        if not cls.is_initialized:
            return {"status": "error", "error": "Transcriber not initialized"}
        try:
            state = cls._state
            questions = state.interviewer_lines
            answers = state.candidate_lines

            if len(questions) != len(answers) or not questions:
                return {
                    "status": "success",
                    "explanation": "Invalid Q&A format - No valid question-answer pairs found",
                    "mark": "❌",
                    "score": "0%",
                }

            prompt = Resume_EVALUATE_QA_PROMPT.format(question=questions[-1], answer=answers[-1])
            response = cls.model.generate_content(prompt)
            response_text = response.text

            score_line = next((line for line in response_text.split("\n") if line.startswith("SCORE:")),"",)
            explanation_line = next((line for line in response_text.split("\n") if line.startswith("EXPLANATION:")),"",)

            score = score_line.replace("SCORE:", "").strip()
            explanation = explanation_line.replace("EXPLANATION:", "").strip()
            current_time = datetime.now()

            # Store evaluation in MongoDB
            evaluation_data = {
                "type": "Evaluation",
                "primary_content": explanation,
                "score": score,
                "feedback": {
                    "strengths": [],
                    "weaknesses": [],
                    "suggestions": []
                },
                "created_at": current_time,
                "question": questions[-1],
                "answer": answers[-1],
                "evaluation_metrics": {
                    "clarity": score,
                    "relevance": score,
                    "completeness": score
                },
                "status": "completed",
                "metadata": {
                    "evaluation_type": "automated",
                    "model_version": "gemini-pro",
                    "timestamp": current_time.isoformat()
                }
            }

            # Insert into MongoDB
            result = insert_data("candidate_evaluations", evaluation_data)
            eval_id = str(result.inserted_id)

            return {
                "status": "success",
                "explanation": explanation,
                "mark": "✅" if score and int(score.rstrip('%')) >= 60 else "❌",
                "score": f"{score}%" if score else "0%",
                "eval_id": eval_id
            }

        except Exception as e:
            return {
                "status": "success",
                "explanation": "Invalid Q&A format",
                "mark": "❌",
                "score": "0%"
            }


    def get_evaluation_qa_content(eval_id: str) -> Dict[str, Any]:
        def datetime_handler(obj):
            if isinstance(obj, datetime):
                return obj.isoformat()
            raise TypeError(f'Object of type {type(obj)} is not JSON serializable')
        try:
            object_id = ObjectId(eval_id)
            eval_data = find_one("candidate_evaluations", {"_id": object_id, "type": "Evaluation"})
            
            if not eval_data:
                return {
                    "status": "error",
                    "message": "Evaluation content not found"
                }

            formatted_eval_data = {
                "status": "success",
                "data": {
                    "eval_id": str(eval_data["_id"]),
                    "type": eval_data.get("type", ""),
                    "primary_content": eval_data.get("primary_content", ""),
                    "score": eval_data.get("score", "0%"),
                    "feedback": eval_data.get("feedback", ""),
                    "question": eval_data.get("question", ""),
                    "answer": eval_data.get("answer", ""),
                    "created_at": datetime_handler(eval_data.get("created_at"))
                }
            }

            return formatted_eval_data

        except Exception as e:
            logger.error(f"Error retrieving evaluation content from MongoDB: {str(e)}")
            return {
                "status": "error",
                "message": f"Error retrieving evaluation content: {str(e)}"}

    def generate_similar_qa(num_pairs: int, original_qa: str) -> Tuple[str, str]:
        if not original_qa.strip():
            return "", "Please record a Q&A pair first before generating similar ones."
        
        try:
            qa_prompt = Resume_GENERATE_SIMILAR_QA_PROMPT.format(
                original_qa=original_qa,
                num_pairs=num_pairs
            )
            response = Resume_DualInputTranscriber.model.generate_content(qa_prompt)
            generated_text = response.text

            # Parse QA pairs from generated text
            qa_pairs = []
            lines = generated_text.split('\n')
            current_qa = {}
            
            for line in lines:
                line = line.strip()
                if line.startswith('Q'):
                    if current_qa:
                        qa_pairs.append(current_qa)
                    current_qa = {"question": line.split(':', 1)[1].strip()}
                elif line.startswith('A') and current_qa:
                    current_qa["answer"] = line.split(':', 1)[1].strip()
            
            if current_qa:
                qa_pairs.append(current_qa)

            current_time = datetime.now()

            # Create MongoDB document following schema
            qa_data = {
                "type": "Similar QA",
                "primary_content": generated_text,
                "questions": qa_pairs,
                "question_categories": {
                    "technical": [],
                    "behavioral": [],
                    "experience": [],
                    "role_specific": qa_pairs
                },
                "difficulty_distribution": {
                    "easy": qa_pairs[:len(qa_pairs)//3],
                    "medium": qa_pairs[len(qa_pairs)//3:2*len(qa_pairs)//3],
                    "hard": qa_pairs[2*len(qa_pairs)//3:]
                },
                "meta_data": {
                    "num_pairs": num_pairs,
                    "original_qa_length": len(original_qa)
                },
                "created_at": current_time,
                "generated_at": current_time,
                "last_updated": current_time,
                "original_qa": original_qa
            }

            # Insert into MongoDB
            result = insert_data("ai_generated_questions", qa_data)
            qa_id = str(result.inserted_id)

            return original_qa, {
                "generated_text": generated_text,
                "qa_id": qa_id,
                "metadata": {
                    "total_questions": len(qa_pairs),
                    "generated_at": current_time.isoformat()
                }
            }

        except Exception as e:
            return original_qa, f"Error generating Q&A pairs: {str(e)}"

    def _transcribe_mic(self):
        while Resume_DualInputTranscriber.is_recording:
            try:
                with sr.Microphone() as source:
                    self.recognizer.adjust_for_ambient_noise(source, duration=0.5)
                    print("Listening to microphone...")
                    try:
                        audio = self.recognizer.listen(
                            source, timeout=5, phrase_time_limit=10
                        )
                        text = self.recognizer.recognize_google(audio)
                        if text:
                            self.mic_queue.put(text)
                            print("Mic transcribed:", text)

                            # Add directly to the state
                            Resume_DualInputTranscriber._state.interviewer_lines.append(text)
                    except sr.WaitTimeoutError:
                        print("No speech detected")
                    except sr.UnknownValueError:
                        print("Speech not understood")
                    except sr.RequestError as e:
                        print(f"Could not request results; {str(e)}")
            except Exception as e:
                print(f"Microphone transcription error: {str(e)}")
                time.sleep(1)

    def find_loopback_device(self):
        """Find a suitable loopback device with improved detection"""
        try:
            devices = sd.query_devices()
            print("\nScanning available audio devices:")

            # Print all devices for debugging
            for i, device in enumerate(devices):
                print(f"\nDevice {i}: {device['name']}")
                print(f"  Input channels: {device['max_input_channels']}")
                print(f"  Output channels: {device['max_output_channels']}")
                print(f"  Default samplerate: {device['default_samplerate']}")
                print(f"  Is default input: {i == sd.default.device[0]}")
                print(f"  Is default output: {i == sd.default.device[1]}")

            # Strategy 1: Try to find a loopback device
            for i, device in enumerate(devices):
                if any(name in device["name"].lower() for name in ["loopback", "cable input", "virtual", "blackhole"]):
                    print(f"\nFound loopback device: {device['name']}")
                    return i
            
            # Strategy 2: Try to use the default input device
            default_input = sd.default.device[0]
            if default_input is not None and default_input >= 0:
                device = devices[default_input]
                if device["max_input_channels"] > 0:
                    print(f"\nUsing default input device: {device['name']}")
                    return default_input

            # Strategy 3: Find any device with input capabilities
            for i, device in enumerate(devices):
                if device["max_input_channels"] > 0:
                    print(f"\nUsing first available input device: {device['name']}")
                    return i

            print("\nNo suitable audio device found!")
            return None

        except Exception as e:
            print(f"\nError while scanning audio devices: {str(e)}")
            return None

    def _transcribe_speaker(self):
        """Transcribe system audio with improved error handling"""
        RATE = 44100
        CHUNK = 1024 * 4

        while Resume_DualInputTranscriber.is_recording:
            try:
                # Find appropriate device
                device_id = self.find_loopback_device()
                if device_id is None:
                    print("\nPlease check your audio setup:")
                    print("1. Make sure you have a virtual audio cable installed")
                    print("2. Check if your microphone is properly connected")
                    print("3. Verify system permissions for audio access")
                    raise Exception("No suitable audio device found")

                device_info = sd.query_devices(device_id)
                print(f"\nInitializing audio capture with device: {device_info['name']}")

                # Configure stream with device's native parameters
                stream = sd.RawInputStream(
                    device=device_id,
                    channels=1,  # Force mono
                    samplerate=int(device_info["default_samplerate"]),
                    blocksize=CHUNK,
                    dtype="int16",
                )

                with stream:
                    print("Successfully started audio capture stream")
                    while Resume_DualInputTranscriber.is_recording:
                        try:
                            raw_data, overflowed = stream.read(CHUNK)
                            if overflowed:
                                print("Audio buffer overflow detected")
                                continue

                            # Process audio data...
                            audio_bytes = io.BytesIO()
                            with wave.open(audio_bytes, "wb") as wav_file:
                                wav_file.setnchannels(1)
                                wav_file.setsampwidth(2)
                                wav_file.setframerate(RATE)
                                wav_file.writeframes(raw_data)

                            # Perform speech recognition
                            audio_bytes.seek(0)
                            audio = sr.AudioData(
                                audio_bytes.read(), sample_rate=RATE, sample_width=2
                            )
                            text = self.recognizer.recognize_google(audio)
                            if text:
                                self.speaker_queue.put(text)
                                print("Transcribed:", text)

                        except sr.UnknownValueError:
                            pass  # No speech detected
                        except sr.RequestError as e:
                            print(f"Speech recognition service error: {str(e)}")
                        except Exception as e:
                            print(f"Error during audio processing: {str(e)}")

            except Exception as e:
                print(f"\nSpeaker transcription error: {str(e)}")
                print(f"Error type: {type(e).__name__}")
                print("Waiting before retry...")
                time.sleep(2)

    async def start_recording() -> Dict[str, Any]:
        if not Resume_DualInputTranscriber.is_initialized:
            return {"status": "error", "error": "Transcriber not initialized"}
        try:
            instance = Resume_DualInputTranscriber.get_instance()
            if not Resume_DualInputTranscriber.is_recording:
                Resume_DualInputTranscriber.is_recording = True

                # Start transcription threads
                mic_thread = threading.Thread(
                    target=instance._transcribe_mic, daemon=True
                )
                speaker_thread = threading.Thread(
                    target=instance._transcribe_speaker, daemon=True
                )

                mic_thread.start()
                speaker_thread.start()

                return {
                    "status": "success",
                    "data": {"message": "Recording started successfully"},
                }
            return {"status": "error", "error": "Already recording"}
        except Exception as e:
            return {"status": "error", "error": f"Failed to start recording: {str(e)}"}

    async def stop_recording() -> Dict[str, Any]:
        if not Resume_DualInputTranscriber.is_initialized:
            return {"status": "error", "error": "Transcriber not initialized"}
        try:
            if Resume_DualInputTranscriber.is_recording:
                Resume_DualInputTranscriber.is_recording = False
                return {"status": "success", "data": {"message": "Recording stopped"}}
            return {"status": "error", "error": "Not recording"}
        except Exception as e:
            return {"status": "error", "error": str(e)}

    def _get_combined_text() -> str:
        """Combine interviewer and candidate text with improved formatting"""
        combined_text = ["Interviewer:"]
        state = Resume_DualInputTranscriber._state

        for i, question in enumerate(state.interviewer_lines):
            combined_text.append(question)
            if i < len(state.candidate_lines):
                answer = state.candidate_lines[i]
                if answer:
                    answer = answer.rstrip()
                    if not answer.endswith((".", "!", "?")):
                        answer += "."
                    combined_text.append(answer)

        return "\n".join(combined_text)
