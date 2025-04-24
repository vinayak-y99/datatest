from fastapi import APIRouter, File, UploadFile, Form, HTTPException, Depends
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, Dict, Union, List, Any, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.database.connection import get_db
from app.models.base import JobDescription, DashboardContent
import sounddevice as sd
from app.services.job_description.llm_service import DocumentProcessor, DualInputTranscriber
import time
import wave
import fitz
import io
import docx
import re
import queue
import pyaudio
import threading
from app.services.job_description.prompt_engineering import JobAnalysisPrompts
from app.services.job_description.prompt_engineering import GENERATE_QA_PROMPT, GENERATE_SIMILAR_QA_PROMPT, EVALUATE_QA_PROMPT, QUESTION_STARTERS
import speech_recognition as sr
import google.generativeai as genai
from app.core.Config import GOOGLE_API_KEY
from app.utils.helpers import extract_keywords
from app.database.mongo_connection import insert_data, update_one, get_collection, find_one
from bson import ObjectId
from datetime import datetime
import logging


logger = logging.getLogger(__name__)

class InitializeRequest(BaseModel):
    api_key: str


class GenerateQARequest(BaseModel):
    num_pairs: int
    original_qa: str


job_description_router = APIRouter()

processor = DocumentProcessor()
transcriber = DualInputTranscriber()


class DocumentProcessor:
    def __init__(self):
        self.interviewer_lines = []
        self.candidate_lines = []
        self.status = "success"
        self.data = None
        self.error = None

    # Initialize Gemini
    # Configure with your API key
    genai.configure(api_key=GOOGLE_API_KEY)

    # Try listing available models first
    # models = genai.list_models()
    # for model in models:
    #     print(model.name)

    # Then initialize with the correct model name
    model = genai.GenerativeModel("gemini-1.5-pro")

    async def extract_structured_job_info(self, text: str) -> Dict[str, Any]:
        try:
            # Use JobAnalysisPrompts from prompt_engineering.py
            prompt = JobAnalysisPrompts.get_analysis_template().format(context=text)

            # Use the model from DocumentProcessor
            response = DocumentProcessor.model.generate_content(prompt)
            response_text = response.text

            # Parse the response to extract structured information
            structured_info = {
                "job_title": self.extract_job_title(text, response_text),
                "department": self.extract_department(text, response_text),
                "required_skills": self.extract_skills(response_text),
                "experience_level": self.extract_experience(text),
                "education": self.extract_education(text),
                "keywords": extract_keywords(text, response_text),
            }

            return structured_info
        except Exception as e:
            print(f"Error extracting structured info: {str(e)}")
            # Return basic info if AI extraction fails
            return {
                "job_title": self.extract_basic_job_title(text),
                "keywords": extract_keywords(text),
                "required_skills": [],
                "experience_level": "",
                "education": "",
                "department": "",
            }

    def extract_basic_job_title(text: str) -> str:
        title_patterns = [
            r"Job Title:?\s*([^\n]+)",
            r"Position:?\s*([^\n]+)",
            r"Role:?\s*([^\n]+)",
        ]

        for pattern in title_patterns:
            match = re.search(pattern, text)
            if match:
                return match.group(1).strip()

        return ""

    def extract_job_title(self, text: str, ai_response: str = None) -> str:
        # If AI response is provided, try to find "Role: [title]" in it
        if ai_response:
            role_match = re.search(r"Role:\s*([^\n]+)", ai_response)
            if role_match:
                return role_match.group(1).strip()

        # Fallback to basic extraction
        return self.extract_basic_job_title(text)

    def extract_department(text: str, ai_response: str) -> str:
        dept_patterns = [
            r"Department:?\s*([^\n]+)",
            r"Industry Type:?\s*([^\n]+)",
            r"Division:?\s*([^\n]+)",
        ]

        for pattern in dept_patterns:
            match = re.search(pattern, text)
            if match:
                return match.group(1).strip()

        return ""

    def extract_skills(ai_response: str) -> List[str]:
        skills = []
        skill_matches = re.findall(r"- ([^:]+):", ai_response)

        for skill in skill_matches:
            skills.append(skill.strip())

        return skills

    def extract_experience(text: str) -> str:
        exp_patterns = [
            r"(\d+[-\s]?\d*\+?\s*years?)[^\n]*experience",
            r"Experience:?\s*(\d+[-\s]?\d*\+?\s*years?)",
            r"(\d+\+?\s*years)[^\n]*required",
        ]

        for pattern in exp_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(1).strip()

        return ""

    def extract_education(text: str) -> str:
        edu_patterns = [
            r"Education:?\s*([^\n]+)",
            r"Degree:?\s*([^\n]+)",
            r"Bachelor\'?s degree in ([^\n]+)",
            r"Master\'?s degree in ([^\n]+)",
        ]

        for pattern in edu_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(1).strip()

        return ""

    def extract_keywords(self, text: str, ai_response: str) -> List[str]:
        # Get skills from AI response
        skills = self.extract_skills(ai_response)
        # Add job title
        job_title = self.extract_job_title(text, ai_response)
        if job_title and job_title != "Untitled Position":
            skills.append(job_title)
        # Add experience level
        experience = self.extract_experience(text)
        if experience:
            skills.append(experience)
        # Add education
        education = self.extract_education(text)
        if education:
            skills.append(education)
        # Add department
        department = self.extract_department(text, ai_response)
        if department:
            skills.append(department)
        # Add additional keywords from text
        additional_keywords = DocumentProcessor.extract_keywords(text)
        # Combine all keywords and remove duplicates
        all_keywords = list(set(skills + additional_keywords))
        return all_keywords

    async def upload_file(files: List[UploadFile] = File(...), db: Session = Depends(get_db), user_id: int = None) -> Dict[str, Union[List[Dict[str, Union[List[str], str]]], str]]:
        try:
            results = []
            for file in files:
                try:
                    content = await file.read()
                    await file.seek(0)

                    if file.filename.endswith(".pdf"):
                        text = DocumentProcessor.extract_text_from_pdf(content)
                    elif file.filename.endswith(".docx"):
                        text = DocumentProcessor.extract_text_from_docx(file.file)
                    else:
                        raise HTTPException(status_code=400,detail=f"Unsupported file type for {file.filename}",)

                    # Extract basic information without AI initially
                    keywords = DocumentProcessor.extract_keywords(text)

                    # Create a new JobDescription record with basic information
                    job_description = JobDescription(
                        title=file.filename,  # Use filename as default title
                        description=text,
                        raw_text=text,
                        source_file=file.filename,
                        keywords=(", ".join(keywords) if isinstance(keywords, list) else keywords),
                        status="Active",
                        threshold_score=70.0,  # Default threshold score
                    )

                    try:
                        db.add(job_description)
                        db.commit()
                        db.refresh(job_description)
                        
                        # If user_id is provided, create a ThresholdScore record
                        if user_id:
                            from app.models.base import ThresholdScore
                            
                            # Create LLM service to process job description
                            from app.services.llm_service import LLMService
                            llm_service = LLMService()
                            
                            # Process job description to get threshold scores
                            _, _, _, (selection_score, rejection_score), _ = await llm_service.process_job_description(text)
                            
                            # Create threshold score record
                            threshold_score = ThresholdScore(
                                user_id=user_id,
                                job_id=job_description.job_id,
                                selection_score=selection_score,
                                rejection_score=rejection_score,
                                threshold_value=job_description.threshold_score,  # Use the default threshold score
                                activity_type="job_upload"
                            )
                            
                            db.add(threshold_score)
                            db.commit()
                            db.refresh(threshold_score)
                        
                    except Exception as db_error:
                        db.rollback()
                        print(f"Error in database operation: {str(db_error)}")
                        return {
                            "status": "error", 
                            "message": f"Database error: {str(db_error)}"
                        }

                    results.append(
                        {
                            "filename": file.filename,
                            "keywords": keywords,
                            "text": text,
                            "id": str(job_description.job_id) if hasattr(job_description, "job_id") else None,
                        }
                    )
                except Exception as file_error:
                    print(f"Error processing file {file.filename}: {str(file_error)}")
                    results.append({
                        "filename": file.filename,
                        "error": str(file_error),
                        "status": "error"
                    })

            return {"status": "success", "results": results}
        except Exception as e:
            import traceback
            print(f"Exception in upload_file: {str(e)}")
            print(traceback.format_exc())
            return {"status": "error", "message": f"Error processing files: {str(e)}"}

    async def delete_job_description(job_id: int, db: Session) -> Dict[str, str]:
        try:
            # Query the job description by job_id  (not id)
            job_description = (
                db.query(JobDescription).filter(JobDescription.job_id == job_id).first()
            )

            # Check if job description exists
            if not job_description:
                return {
                    "status": "error",
                    "message": f"Job description with ID {job_id} not found",
                }

            db.delete(job_description)
            print("Job description deleted from database", job_description)
            db.commit()
            print(
                "Job description committed to database after deleted", job_description
            )

            return {
                "status": "success",
                "message": f"Job description with ID {job_id} deleted successfully",
            }
        except Exception as e:
            db.rollback()
            return {
                "status": "error",
                "message": f"Error deleting job description: {str(e)}",
            }

    async def update_job_description(
        job_id: int, updated_data: dict, db: Session
    ) -> Dict[str, str]:
        try:
            # Query the job description by job_id
            job_description = (
                db.query(JobDescription).filter(JobDescription.job_id == job_id).first()
            )

            if not job_description:
                return {
                    "status": "error",
                    "message": f"Job description with ID {job_id} not found",
                }

            # Update fields
            for key, value in updated_data.items():
                if hasattr(job_description, key):
                    setattr(job_description, key, value)

            db.commit()
            db.refresh(job_description)

            return {
                "status": "success",
                "message": f"Job description with ID {job_id} updated successfully",
                "data": {
                    "id": str(job_description.job_id),
                    "title": job_description.title,
                    "description": job_description.description,
                    "keywords": job_description.keywords,
                },
            }
        except Exception as e:
            db.rollback()
            return {
                "status": "error",
                "message": f"Error updating job description: {str(e)}",
            }

    @staticmethod
    async def get_user_job_descriptions(user_id: int, db: Session) -> Dict[str, Any]:
        try:
            # Import necessary models
            from app.models.base import JobDescription, ThresholdScore
            
            # Query job descriptions associated with the user through ThresholdScore
            job_descriptions_query = db.query(JobDescription).join(
                ThresholdScore, JobDescription.job_id == ThresholdScore.job_id
            ).filter(
                ThresholdScore.user_id == user_id
            ).order_by(JobDescription.created_at.desc())
            
            # Execute the query
            job_descriptions_db = job_descriptions_query.all()
            
            if not job_descriptions_db:
                return {"status": "success", "data": [], "message": f"No job descriptions found for user ID {user_id}"}
            
            # Process the results
            job_descriptions = []
            for jd in job_descriptions_db:
                job_data = {
                    "id": str(jd.job_id),
                    "title": jd.title or "",
                    "description": jd.description or "",
                    "keywords": jd.keywords or "",
                    "status": jd.status or "Active",
                    "threshold_score": jd.threshold_score or 70.0
                }
                
                # Add optional fields if they exist and have values
                optional_fields = [
                    "department", "required_skills", "experience_level", 
                    "education_requirements", "raw_text", "source_file"
                ]
                
                for field in optional_fields:
                    if hasattr(jd, field) and getattr(jd, field) is not None:
                        job_data[field] = getattr(jd, field)
                    else:
                        job_data[field] = "Not specified"
                
                # Handle date fields
                if hasattr(jd, "created_at") and jd.created_at:
                    job_data["created_at"] = jd.created_at.isoformat()
                elif hasattr(jd, "createdat") and jd.createdat:
                    job_data["created_at"] = jd.createdat.isoformat()
                
                if hasattr(jd, "updated_at") and jd.updated_at:
                    job_data["updated_at"] = jd.updated_at.isoformat()
                elif hasattr(jd, "updatedat") and jd.updatedat:
                    job_data["updated_at"] = jd.updatedat.isoformat()
                
                job_descriptions.append(job_data)
            
            return {"status": "success", "data": job_descriptions}
        except Exception as e:
            import traceback
            error_details = traceback.format_exc()
            print(f"Error details: {error_details}")
            return {"status": "error", "message": f"Error fetching job descriptions: {str(e)}"}

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

    def extract_keywords(text: str) -> List[str]:
        titles = re.findall(r"\b[A-Z][A-Za-z\s]*\b", text)
        return list(set(titles))

    def extract_jd_sections(text: str) -> Dict[str, str]:
        lines = [line.strip() for line in text.split("\n") if line.strip()]
        section_header_pattern = re.compile(r"^([^:]+):(.*)$")

        sections = {}
        current_section = None
        current_content = []

        for line in lines:
            header_match = section_header_pattern.match(line)
            if header_match:
                if current_section and current_content:
                    sections[current_section] = "\n".join(current_content).strip()
                current_section = header_match.group(1).strip()
                initial_content = header_match.group(2).strip()
                current_content = [initial_content] if initial_content else []
            elif current_section:
                current_content.append(line)

        if current_section and current_content:
            sections[current_section] = "\n".join(current_content).strip()

        return sections

    def generate_dashboard(
    text: Union[str, bytes],
    scale: int,
    dashboard_index: int,
    prompt: Optional[str] = None,
    db: Session = None
) -> Dict[str, str]:
        try:
            if isinstance(text, bytes):
                text = text.decode("utf-8")

            if prompt:
                dashboard_content = DocumentProcessor.extract_content_for_dashboard(prompt, text, db)
                print("dashboard content", dashboard_content)
            else:
                sections = DocumentProcessor.extract_jd_sections(text)
                selected_sections = list(sections.items())[:scale]
                if dashboard_index < len(selected_sections):
                    dashboard_content = f"{selected_sections[dashboard_index][0]}:\n{selected_sections[dashboard_index][1]}"
                else:
                    dashboard_content = "No content available for this dashboard index"
                
            return {"status": "success", "content": dashboard_content.strip()}
        except Exception as e:
            return {"status": "error", "error": str(e)}

    def extract_content_for_dashboard(prompt: str, text: str, db: Session) -> str:
        sections = DocumentProcessor.extract_jd_sections(text)
        
        # Create dashboard content record using the model
        dashboard_content = DashboardContent(prompt=prompt,text=text,created_at=datetime.now())
        
        if not sections:
            dashboard_content.status = 'no_sections'
            dashboard_content.content = "Content successfully extracted but no sections found"
            db.add(dashboard_content)
            db.commit()
            return dashboard_content.content
            
        # Rest of the logic remains the same, just update the model instead of dict
        if not prompt:
            first_section = list(sections.items())[0]
            content = f"{first_section[0]}:\n{first_section[1]}"
            dashboard_content.content = content
            dashboard_content.status = 'default_section'
            db.add(dashboard_content)
            db.commit()
            return content

        # Extract search terms and find matching sections
        search_terms = prompt.lower().split()
        if "for" in search_terms:
            search_terms = search_terms[search_terms.index("for")+1:]
        
        relevant_sections = []
        for section_title, content in sections.items():
            title_lower = section_title.lower()
            content_lower = content.lower()
            
            if any(term in title_lower or term in content_lower for term in search_terms):
                relevant_sections.append(f"{section_title}:\n{content}")

        if relevant_sections:
            content = "\n\n".join(relevant_sections[:2])
            dashboard_content.content = content
            dashboard_content.status = 'matched_sections'
            db.add(dashboard_content)
            db.commit()
            return content
        
        first_section = list(sections.items())[0]
        content = f"{first_section[0]}:\n{first_section[1]}"
        dashboard_content.content = content
        dashboard_content.status = 'fallback_section'
        db.add(dashboard_content)
        db.commit()
        return content

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
            qa_prompt = GENERATE_QA_PROMPT.format(num_qa=num_qa, dashboard_content=dashboard_content)
            generate_qa_response = DocumentProcessor.model.generate_content(qa_prompt)
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
                        # Extract question and answer without regex
                        q_parts = current_qa_pair[0].split(":", 1)
                        a_parts = current_qa_pair[1].split(":", 1) if len(current_qa_pair) > 1 else ["", ""]
                        
                        qa_pairs.append({
                            "question": q_parts[1].strip() if len(q_parts) > 1 else "",
                            "answer": a_parts[1].strip() if len(a_parts) > 1 else ""
                        })
                        current_qa_pair = []
                    
                    # Format question number dynamically
                    q_number = len(qa_pairs) + 1
                    formatted_line = f"Q{q_number}:{line.split(':', 1)[1].strip() if ':' in line else line[1:].strip()}"
                    current_qa_pair.append(formatted_line)
                    
                elif line.startswith("A"):
                    # Format answer number dynamically
                    a_number = len(qa_pairs) + 1
                    formatted_line = f"A{a_number}:{line.split(':', 1)[1].strip() if ':' in line else line[1:].strip()}"
                    current_qa_pair.append(formatted_line)

            # Handle last QA pair
            if current_qa_pair:
                formatted_qa.extend(current_qa_pair)
                q_parts = current_qa_pair[0].split(":", 1)
                a_parts = current_qa_pair[1].split(":", 1) if len(current_qa_pair) > 1 else ["", ""]
                
                qa_pairs.append({
                    "question": q_parts[1].strip() if len(q_parts) > 1 else "",
                    "answer": a_parts[1].strip() if len(a_parts) > 1 else ""
                })

            # Categorize questions based on content
            technical_questions = []
            behavioral_questions = []
            experience_questions = []
            role_specific_questions = []

            for qa in qa_pairs:
                question_lower = qa["question"].lower()
                if any(keyword in question_lower for keyword in ["technical", "technology", "programming", "code", "tool"]):
                    technical_questions.append(qa)
                elif any(keyword in question_lower for keyword in ["behavior", "situation", "challenge", "team"]):
                    behavioral_questions.append(qa)
                elif any(keyword in question_lower for keyword in ["experience", "worked", "previous", "project"]):
                    experience_questions.append(qa)
                else:
                    role_specific_questions.append(qa)
            
            current_time = datetime.now()
            # Prepare MongoDB document
            qa_data = {
            "job_id": None,
            "questions": qa_pairs,
            "question_categories": {
                "technical": technical_questions,
                "behavioral": behavioral_questions,
                "experience": experience_questions,
                "role_specific": role_specific_questions
            },
            "difficulty_distribution": {
                "easy": qa_pairs[:len(qa_pairs)//3],
                "medium": qa_pairs[len(qa_pairs)//3:2*len(qa_pairs)//3],
                "hard": qa_pairs[2*len(qa_pairs)//3:]
            },
            "generated_at": current_time,
            "last_updated": current_time
        }

            # Insert into MongoDB
            result = insert_data("ai_generated_questions", qa_data)
            
            formatted_text = "\n".join(formatted_qa)
            return {
                "formatted_qa": formatted_text,
                "qa_id": str(result.inserted_id),
                "metadata": {
                    "total_questions": len(qa_pairs),
                    "categories": {
                        "technical": len(technical_questions),
                        "behavioral": len(behavioral_questions),
                        "experience": len(experience_questions),
                        "role_specific": len(role_specific_questions)
                    },
                    "generated_at": current_time.isoformat()  # Convert to ISO format string
                }
            }

        except Exception as e:
            raise HTTPException(status_code=500,detail=f"Error generating Q&A: {str(e)}")

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


class DualInputTranscriber:
    _instance = None
    _state = TranscriptionState()
    model = None
    is_recording = False
    is_initialized = False

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(DualInputTranscriber, cls).__new__(cls)
        return cls._instance

    def __init__(self):
        if not hasattr(self, "initialized"):
            self.recognizer = sr.Recognizer()
            self.audio = pyaudio.PyAudio()
            self.mic_queue = queue.Queue()
            self.speaker_queue = queue.Queue()
            self.text_queue = queue.Queue()
            self.initialized = True

    async def initialize(api_key: str) -> Dict[str, Any]:
        try:
            # Initialize the singleton instance if needed
            if DualInputTranscriber._instance is None:
                DualInputTranscriber._instance = DualInputTranscriber()
            
            # Configure the API
            genai.configure(api_key=api_key)
            DualInputTranscriber.model = genai.GenerativeModel("gemini-pro")
            DualInputTranscriber.is_initialized = True
            
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
        return (any(text_lower.startswith(starter) for starter in QUESTION_STARTERS) or "?" in text)

    async def start_recording(cls, db: Session) -> Dict[str, Any]:
        if not cls.is_initialized:
            return {"status": "error", "error": "Transcriber not initialized"}
        try:
            instance = cls.get_instance(cls)
            if not cls.is_recording:
                cls.is_recording = True

                # Create MongoDB recording document
                recording_data = {
                    "status": "Active",
                    "speaker_type": "system",
                    "transcript_text": "",
                    "interviewer_text": "",
                    "candidate_text": "",
                    "created_at": datetime.now(),
                    "interview_type": "job_description"
                }
                
                logger.info(f"Attempting to insert interview data into MongoDB: {recording_data}")
                
                # Insert into MongoDB
                result = insert_data("interview_transcriptions", recording_data)
                recording_id = str(result.inserted_id)

                logger.info(f"Successfully inserted data into MongoDB with ID: {recording_id}")
                
                # Start transcription threads
                mic_thread = threading.Thread(target=instance._transcribe_mic, daemon=True)
                speaker_thread = threading.Thread(target=instance._transcribe_speaker, daemon=True)
                update_thread = threading.Thread(target=instance._update_mongodb_document, daemon=True)

                mic_thread.start()
                speaker_thread.start()
                update_thread.start()

                return {
                    "status": "success",
                    "data": {
                        "message": "Recording started successfully",
                        "recording_id": recording_id,
                    },
                }
            return {"status": "error", "error": "Already recording"}
        except Exception as e:
            return {"status": "error", "error": f"Failed to start recording: {str(e)}"}

    async def stop_recording(cls, db: Session) -> Dict[str, Any]:
        if not cls.is_initialized:
            return {"status": "error", "error": "Transcriber not initialized"}
        try:
            if cls.is_recording:
                cls.is_recording = False

                # Combine interviewer and candidate lines into a single transcript
                combined_transcript = "\n".join(
                    [
                        f"Interviewer: {line}"
                        for line in cls._state.interviewer_lines
                    ]
                    + [
                        f"Candidate: {line}"
                        for line in cls._state.candidate_lines
                    ]
                )

                # Find the active recording in MongoDB
                collection = get_collection("interview_transcriptions")
                active_recording = collection.find_one({
                    "status": "Active",
                    "interview_type": "job_description"
                }, sort=[("created_at", -1)])
                
                if active_recording:
                    logger.info(f"Found active recording in MongoDB with ID: {active_recording['_id']}")
                    
                    # Update the MongoDB document
                    update_one(
                        "interview_transcriptions",
                        {"_id": active_recording["_id"]},
                        {"$set": {
                            "status": "Completed",
                            "transcript_text": combined_transcript,
                            "interviewer_text": "\n".join(cls._state.interviewer_lines),
                            "candidate_text": "\n".join(cls._state.candidate_lines),
                            "updated_at": datetime.now()
                        }}
                    )
                    
                    logger.info(f"Updated MongoDB document with transcript data")
                    
                    return {
                        "status": "success",
                        "data": {
                            "message": "Recording stopped",
                            "recording_id": str(active_recording["_id"])
                        }
                    }

                return {
                    "status": "success",
                    "data": {
                        "message": "Recording stopped, but no active recording found in database"
                    },
                }
            return {"status": "error", "error": "Not recording"}
        except Exception as e:
            logger.error(f"Error stopping recording: {str(e)}")
            return {"status": "error", "error": str(e)}

    def _update_mongodb_document(self):
        """Periodically update the MongoDB document with the current transcription"""
        last_update_time = time.time()
        
        while DualInputTranscriber.is_recording:
            try:
                # Update every 2 seconds
                current_time = time.time()
                if current_time - last_update_time >= 2:
                    # Get the latest active recording
                    active_recording = find_one(
                        "interview_transcriptions", 
                        {
                            "status": "Active",
                            "interview_type": "job_description"
                        }
                    )
                    
                    if active_recording:
                        # Combine interviewer and candidate lines
                        interviewer_text = "\n".join(DualInputTranscriber._state.interviewer_lines)
                        candidate_text = "\n".join(DualInputTranscriber._state.candidate_lines)
                        
                        combined_transcript = ""
                        for i, question in enumerate(DualInputTranscriber._state.interviewer_lines):
                            combined_transcript += f"Interviewer: {question}\n"
                            if i < len(DualInputTranscriber._state.candidate_lines):
                                combined_transcript += f"Candidate: {DualInputTranscriber._state.candidate_lines[i]}\n"
                        
                        # Update the MongoDB document
                        update_one(
                            "interview_transcriptions",
                            {"_id": active_recording["_id"]},
                            {
                                "$set": {
                                    "transcript_text": combined_transcript,
                                    "interviewer_text": interviewer_text,
                                    "candidate_text": candidate_text,
                                    "updated_at": datetime.now()
                                }
                            }
                        )
                        
                        print(f"Updated MongoDB document with {len(DualInputTranscriber._state.interviewer_lines)} interviewer lines and {len(DualInputTranscriber._state.candidate_lines)} candidate lines")
                        
                    last_update_time = current_time
                    
                time.sleep(0.5)  # Sleep to prevent high CPU usage
                
            except Exception as e:
                print(f"Error updating MongoDB document: {str(e)}")
                time.sleep(2)  # Wait longer on error
    
    async def clear_transcription() -> Dict[str, Any]:
        if not DualInputTranscriber.is_initialized:
            return {"status": "error", "error": "Transcriber not initialized"}

        try:
            DualInputTranscriber._state = TranscriptionState()
            return {
                "status": "success",
                "data": {
                    "message": "Transcription cleared",
                    "text": DualInputTranscriber._get_combined_text(),
                },
            }
        except Exception as e:
            return {"status": "error", "error": str(e)}

    async def evaluate_qa(cls) -> Dict[str, Any]:
        if not cls.is_initialized:
            return {"status": "error", "error": "Transcriber not initialized"}
        try:
            # Get latest transcription from MongoDB
            latest_transcription = find_one(
                "interview_transcriptions",
                {"status": "Completed"},
                sort=[("created_at", -1)]
            )

            # Print for debugging
            print("Latest transcription:", latest_transcription)

            # Get Q&A pairs
            state = cls._state
            questions = state.interviewer_lines
            answers = state.candidate_lines

            print("Current Q&A state:")
            print("Questions:", questions)
            print("Answers:", answers)

            if not questions or not answers:
                return {
                    "status": "error",
                    "explanation": "No Q&A pairs found",
                    "mark": "❌",
                    "score": "0%"
                }

            # Get latest Q&A pair
            current_qa = {
                "question": questions[-1],
                "answer": answers[-1]
            }

            # Generate AI evaluation
            prompt = f"""
            Evaluate this Q&A pair:
            Question: {current_qa['question']}
            Answer: {current_qa['answer']}
            
            Rate the answer's quality, relevance, and completeness.
            
            Provide evaluation in this format:
            SCORE: (number between 0-100)
            EXPLANATION: (detailed feedback)
            """

            response = cls.model.generate_content(prompt)
            response_text = response.text

            print("AI Response:", response_text)

            # Parse response with better error handling
            score = "0"
            explanation = "No evaluation generated"

            for line in response_text.split('\n'):
                if "SCORE:" in line:
                    score = line.replace("SCORE:", "").strip().rstrip('%')
                elif "EXPLANATION:" in line:
                    explanation = line.replace("EXPLANATION:", "").strip()

            # Create evaluation document
            evaluation_data = {
                "evaluation_id": len(questions),
                "type": "Evaluation",
                "primary_content": explanation,
                "score": score,
                "feedback": f"Mark: {'✅' if int(float(score)) >= 60 else '❌'}",
                "created_at": datetime.now(),
                "question": current_qa['question'],
                "answer": current_qa['answer'],
                "ai_response": response_text,
                "transcription_id": str(latest_transcription["_id"]) if latest_transcription else None
            }

            # Insert into MongoDB and get ID
            result = insert_data("candidate_evaluations", evaluation_data)
            eval_id = str(result.inserted_id)

            print("Stored evaluation with ID:", eval_id)

            # Verify storage
            stored_eval = find_one("candidate_evaluations", {"_id": ObjectId(eval_id)})
            print("Verified stored evaluation:", stored_eval)

            return {
                "status": "success",
                "explanation": explanation,
                "mark": "✅" if int(float(score)) >= 60 else "❌",
                "score": f"{score}%",
                "eval_id": eval_id,
                "data": evaluation_data
            }

        except Exception as e:
            print(f"Evaluation error: {str(e)}")
            logger.error(f"Evaluation error: {str(e)}")
            return {
                "status": "error",
                "explanation": f"Error during evaluation: {str(e)}",
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
            qa_prompt = GENERATE_SIMILAR_QA_PROMPT.format(original_qa=original_qa, num_pairs=num_pairs)
            response = DocumentProcessor.model.generate_content(qa_prompt)
            generated_text = response.text

            # Parse QA pairs
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
                "meta_data": {
                    "num_pairs": num_pairs,
                    "original_qa_length": len(original_qa)
                },
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
                "created_at": current_time,
                "generated_at": current_time,
                "last_updated": current_time,
                "original_qa": original_qa
            }

            # Insert into MongoDB
            result = insert_data("ai_generated_questions", qa_data)
            
            # Store the MongoDB document ID for reference
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
        while DualInputTranscriber.is_recording:
            print("\n avaliable microphones:")
            try:
                with sr.Microphone() as source:
                    # Increase ambient noise adjustment duration
                    print("Adjusting for ambient noise...")
                    self.recognizer.adjust_for_ambient_noise(source, duration=1.5)
                    
                    # Increase energy threshold to filter out background noise
                    self.recognizer.energy_threshold = 300  # Default is 300
                    
                    print("Listening to microphone...")
                    try:
                        # Increase timeout and phrase time limit
                        audio = self.recognizer.listen(
                            source, timeout=10, phrase_time_limit=15
                        )
                        print("Audio captured, recognizing...")
                        text = self.recognizer.recognize_google(audio)
                        if text:
                            self.mic_queue.put(text)
                            print("Mic transcribed:", text)
                            # Add directly to the state
                            DualInputTranscriber._state.interviewer_lines.append(text)
                    except sr.WaitTimeoutError:
                        print("No speech detected - please speak louder")
                    except sr.UnknownValueError:
                        print("Speech not understood - please speak more clearly")
                    except sr.RequestError as e:
                        print(f"Could not request results; {str(e)}")
            except Exception as e:
                print(f"Microphone transcription error: {str(e)}")
                time.sleep(1)

    def _process_queues(self):
        """Process the mic and speaker queues to update state"""
        while DualInputTranscriber.is_recording:
            try:
                # Process mic queue (interviewer)
                if not self.mic_queue.empty():
                    text = self.mic_queue.get(block=False)
                    if text:
                        print(f"Processing interviewer text: {text}")
                        DualInputTranscriber._state.interviewer_lines.append(text)
                        
                # Process speaker queue (candidate)
                if not self.speaker_queue.empty():
                    text = self.speaker_queue.get(block=False)
                    if text:
                        print(f"Processing candidate text: {text}")
                        DualInputTranscriber._state.candidate_lines.append(text)
                        
                time.sleep(0.1)  # Small delay to prevent CPU hogging
            except queue.Empty:
                pass  # Queue is empty, continue
            except Exception as e:
                print(f"Error processing queues: {str(e)}")
                time.sleep(0.5)

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
                if any(
                    name in device["name"].lower()
                    for name in ["loopback", "cable input", "virtual", "blackhole"]
                ):
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

        while DualInputTranscriber.is_recording:
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
                    dtype="int16")

                with stream:
                    print("Successfully started audio capture stream")
                    while DualInputTranscriber.is_recording:
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
                            audio = sr.AudioData(audio_bytes.read(), sample_rate=RATE, sample_width=2)
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

    def _get_combined_text() -> str:
        combined_text = ["Interviewer:"]
        state = DualInputTranscriber._state

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

@job_description_router.get("/job-descriptions/list/")
async def list_job_descriptions(db: Session = Depends(get_db)):
    try:
        # Query all job descriptions
        job_descriptions = db.query(JobDescription).all()
        
        # Convert to list of dictionaries
        return [
            {
                "job_id": jd.job_id,
                "title": jd.title,
                "description": jd.description,
                "required_skills": jd.required_skills,
                "department": jd.department,
                "experience_level": jd.experience_level,
                "education_requirements": jd.education_requirements,
                "status": jd.status,
                "threshold_score": jd.threshold_score,
                "created_at": jd.created_at.isoformat() if jd.created_at else None
            }
            for jd in job_descriptions
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@job_description_router.post("/upload-documents")
async def upload_documents(files: List[UploadFile] = File(...), db: Session = Depends(get_db)) -> JSONResponse:
    try:
        result = await DocumentProcessor.upload_file(files, db)
        if result.get("status") == "error":
            return JSONResponse(content=result,status_code=500)
        return JSONResponse(content=result, status_code=200)
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"Error details: {error_details}")
        return JSONResponse(content={"status": "error", "message": f"Error processing files: {str(e)}"},status_code=500)

@job_description_router.delete("/delete-job-description/{job_id}")
async def delete_job_description(job_id: int, db: Session = Depends(get_db)) -> JSONResponse:
    result = await DocumentProcessor.delete_job_description(job_id, db)
    status_code = (200 if result["status"] == "success" else 404 if "not found" in result.get("message", "") else 500)
    return JSONResponse(content=result, status_code=status_code)

@job_description_router.put("/update-job-description/{job_id}")
async def update_job_description(job_id: int, updated_data: dict, db: Session = Depends(get_db)) -> JSONResponse:
    result = await DocumentProcessor.update_job_description(job_id, updated_data, db)
    status_code = (200 if result["status"] == "success" else 404 if "not found" in result.get("message", "") else 500)
    return JSONResponse(content=result, status_code=status_code)

@job_description_router.get("/User-job-descriptions/{user_id}")
async def get_user_job_descriptions_endpoint(user_id: int, db: Session = Depends(get_db)) -> JSONResponse:
    result = await DocumentProcessor.get_user_job_descriptions(user_id, db)
    status_code = 200 if result["status"] == "success" else 500
    return JSONResponse(content=result, status_code=status_code)

@job_description_router.post("/Generate-dashboards")
async def generate_dashboard(
    file: UploadFile = File(...),
    scale: int = Form(...),
    dashboard_index: int = Form(...),
    prompt: Optional[str] = Form(None),
    db: Session = Depends(get_db)
) -> JSONResponse:
    try:
        content = await file.read()
        await file.seek(0)
        
        if file.filename.endswith(".pdf"):
            text = DocumentProcessor.extract_text_from_pdf(content)
        elif file.filename.endswith(".docx"):
            text = DocumentProcessor.extract_text_from_docx(content)
        else:
            return JSONResponse(content={"status": "error", "error": "Unsupported file type"}, status_code=400)
            
        response = DocumentProcessor.generate_dashboard(
            text=text, 
            scale=scale, 
            dashboard_index=dashboard_index, 
            prompt=prompt,
            db=db
        )
        return JSONResponse(content=response)
    except Exception as e:
        return JSONResponse(content={"status": "error", "error": str(e)}, status_code=500)

@job_description_router.get("/Get-dashboard/{dashboard_id}")
async def get_dashboard(dashboard_id: str, db: Session = Depends(get_db)) -> JSONResponse:
    result = await DocumentProcessor.get_dashboard_content(dashboard_id, db)
    return JSONResponse(
        content=result,
        status_code=200 if result["status"] == "success" else 404 if "not found" in result.get("message", "") else 500)

@job_description_router.post("/generate-QA")
async def generate_qa(dashboard_content: str = Form(...), num_qa: int = Form(default=5)) -> JSONResponse:
    try:
        result = DocumentProcessor.generate_qa(dashboard_content, num_qa)
        return JSONResponse(
            content={
                "status": "success",
                "content": result["formatted_qa"],
                "qa_id": result["qa_id"],
                "metadata": result["metadata"]})
    except Exception as e:
        return JSONResponse(content={"status": "error", "error": str(e)},status_code=500)

@job_description_router.get("/Get-qa/{qa_id}")
async def get_qa(qa_id: str) -> JSONResponse:
    result = DocumentProcessor.get_qa_content(qa_id)
    return JSONResponse(content=result,status_code=200 if result["status"] == "success" else 404 if "not found" in result.get("message", "") else 500)

@job_description_router.post("/initialize-transcribe")
async def initialize_transcriber(request: InitializeRequest) -> JSONResponse:
    try:
        if not request.api_key:
            raise HTTPException(status_code=400, detail="API key is required")
        response = await DualInputTranscriber.initialize(request.api_key)
        return JSONResponse(content=response,status_code=200 if response["status"] == "success" else 400,)
    except Exception as e:
        return JSONResponse(content={"status": "error", "error": str(e)}, status_code=500)

@job_description_router.post("/start_Recording")
async def start_recording(db: Session = Depends(get_db)) -> JSONResponse:
    try:
        response = await DualInputTranscriber.start_recording(DualInputTranscriber, db)
        logger.info(f"Start recording response: {response}")
        return JSONResponse(content=response,status_code=200 if response["status"] == "success" else 400)
    except Exception as e:
        return JSONResponse(content={"status": "error", "error": str(e)}, status_code=500)

@job_description_router.post("/stop_Recording")
async def stop_recording(db: Session = Depends(get_db)) -> JSONResponse:
    try:
        # Pass DualInputTranscriber as the first argument explicitly
        response = await DualInputTranscriber.stop_recording(DualInputTranscriber, db)
        return JSONResponse(content=response,status_code=200 if response["status"] == "success" else 400)
    except Exception as e:
        return JSONResponse(content={"status": "error", "error": str(e)}, status_code=500)

@job_description_router.post("/clear_Transcription")
async def clear_transcription() -> JSONResponse:
    try:
        response = await DualInputTranscriber.clear_transcription()
        return JSONResponse(content=response,status_code=200 if response["status"] == "success" else 400,)
    except Exception as e:
        return JSONResponse(content={"status": "error", "error": str(e)}, status_code=500)

@job_description_router.post("/generate_QA_from_audio")
async def generate_qa_from_audio(request: GenerateQARequest):
    try:
        original_qa, result = DualInputTranscriber.generate_similar_qa(request.num_pairs, request.original_qa)
        if isinstance(result, dict):
            return JSONResponse(
                content={
                    "status": "success",
                    "data": {
                        "original": original_qa,
                        "generated": result["generated_text"],
                        "qa_id": result["qa_id"],
                        "metadata": result["metadata"]}},status_code=200)
        else:
            # Handle error case where result is error message string
            return JSONResponse(content={
                    "status": "success",
                    "data": {"original": original_qa,"generated": result}},status_code=200)
            
    except Exception as e:
        return JSONResponse(content={"status": "error", "error": str(e)},status_code=500)

@job_description_router.get("/Get-audio-qa/{qa_id}")
async def get_audio_qa(qa_id: str) -> JSONResponse:
    result = DocumentProcessor.get_audio_qa_content(qa_id)
    return JSONResponse(
        content=result,
        status_code=200 if result["status"] == "success" else 404 if "not found" in result.get("message", "") else 500
    )

@job_description_router.post("/evaluate_QA")
async def evaluate_qa() -> JSONResponse:
    try:
        response = await DualInputTranscriber.evaluate_qa()
        return JSONResponse(
            content={
                "status": "success",
                "explanation": response.get("explanation", "Invalid Q&A format"),
                "mark": response.get("mark", "❌"),
                "score": response.get("score", "0%"),
                "eval_id": response.get("eval_id", "")})
    except Exception as e:
        return JSONResponse(
            content={
                "status": "success",
                "explanation": "Invalid Q&A format",
                "mark": "❌",
                "score": "0%"})


@job_description_router.get("/Get-evaluation/{eval_id}")
async def get_evaluation(eval_id: str) -> JSONResponse:
    result = DualInputTranscriber.get_evaluation_qa_content(eval_id)
    return JSONResponse(content=result,status_code=200 if result["status"] == "success" else 404 if "not found" in result.get("message", "") else 500)
