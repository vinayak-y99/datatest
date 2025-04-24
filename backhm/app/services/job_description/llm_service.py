from langchain_google_genai import ChatGoogleGenerativeAI
import google.generativeai as genai
from app.core.Config import logger, GOOGLE_API_KEY, MODEL_TEMPERATURE
from fastapi import  HTTPException, UploadFile, File
from pydantic import BaseModel
from typing import Optional, List, Dict, Union, Any, Tuple
import io
import fitz
import docx
import re
import wave
import pyaudio
import sounddevice as sd
import numpy as np
import threading
import speech_recognition as sr
import google.generativeai as genai
import queue
import time
import datetime
from app.core.Config import GOOGLE_API_KEY
from app.services.job_description.prompt_engineering import (
    GENERATE_QA_PROMPT,
    GENERATE_SIMILAR_QA_PROMPT,
    EVALUATE_QA_PROMPT,
    QUESTION_STARTERS
)


class JDLLMService:
    def __init__(self):
        if not GOOGLE_API_KEY:
            raise ValueError("GOOGLE_API_KEY not found in environment variables")
            
        genai.configure(api_key=GOOGLE_API_KEY)
        # Using Gemini Pro 2.0 model
        self.gemini_model = genai.GenerativeModel("gemini-1.0-pro-latest")
        self.langchain_model = ChatGoogleGenerativeAI(
            model="gemini-1.0-pro-latest",
            google_api_key=GOOGLE_API_KEY,
            temperature=MODEL_TEMPERATURE
        )
    
    async def analyze_job_description(self, job_description: str):
        try:
            prompt = f"Analyze the following job description:\n\n{job_description}"
            response = self.gemini_model.generate_content(prompt)
            return response.text
        except Exception as e:
            logger.error(f"Analysis failed: {str(e)}")
            raise
    
    async def create_dashboards(self, data: dict):
        try:
            prompt = f"Create dashboards for the following data:\n\n{str(data)}"
            response = self.gemini_model.generate_content(prompt)
            return {
                "dashboards": response.text,
                "selection_threshold": 75,
                "rejection_threshold": 50
            }
        except Exception as e:
            logger.error(f"Dashboard creation failed: {str(e)}")
            raise

class DocumentProcessor:
    def __init__(self):
        self.interviewer_lines = []
        self.candidate_lines = []
        self.status = "success"
        self.data = None
        self.error = None

    # Configure with your API key
    genai.configure(api_key=GOOGLE_API_KEY)


# Then initialize with the correct model name
    model = genai.GenerativeModel('gemini-1.5-pro')  # Try this updated model name
    async def upload_file(file: UploadFile = File(...)) -> Dict[str, Union[List[str], str]]:
        try:
            content = await file.read()
            await file.seek(0)
            
            if file.filename.endswith('.pdf'):
                text = DocumentProcessor.extract_text_from_pdf(content)
            elif file.filename.endswith('.docx'):
                text = DocumentProcessor.extract_text_from_docx(file.file)
            else:
                raise HTTPException(status_code=400, detail="Unsupported file type")

            keywords = DocumentProcessor.extract_keywords(text)
            return {"keywords": keywords, "text": text}
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")
    def extract_text_from_pdf(file: bytes) -> str:
        try:
            doc = fitz.open(stream=file, filetype="pdf")
            text = ""
            for page in doc:
                text += page.get_text()
            doc.close()
            return text
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error extracting PDF text: {str(e)}")
    def extract_text_from_docx(file: Union[bytes, Any]) -> str:
        try:
            if isinstance(file, bytes):
                file = io.BytesIO(file)
            
            doc = docx.Document(file)
            return "\n".join([paragraph.text for paragraph in doc.paragraphs if paragraph.text])
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error extracting DOCX text: {str(e)}")

    def extract_keywords(text: str) -> List[str]:
        # Common job skills and technologies to look for
        tech_skills = [
            "Python", "Java", "JavaScript", "C++", "C#", "Ruby", "PHP", "Swift", "Kotlin", 
            "Go", "Rust", "SQL", "NoSQL", "MongoDB", "MySQL", "PostgreSQL", "Oracle", 
            "AWS", "Azure", "GCP", "Docker", "Kubernetes", "Linux", "Windows", "MacOS",
            "Git", "GitHub", "GitLab", "CI/CD", "DevOps", "Agile", "Scrum", "Kanban",
            "Machine Learning", "AI", "Data Science", "Big Data", "Hadoop", "Spark",
            "React", "Angular", "Vue", "Node.js", "Django", "Flask", "Spring", "ASP.NET",
            "REST", "GraphQL", "Microservices", "Cloud", "Serverless", "Blockchain"
        ]
        
        # Find all words that match tech skills (case insensitive)
        found_skills = []
        for skill in tech_skills:
            if re.search(r'\b' + re.escape(skill) + r'\b', text, re.IGNORECASE):
                found_skills.append(skill)
        
        # Extract job roles
        role_pattern = r'\b(Software Engineer|Developer|Architect|Manager|Director|Analyst|Specialist|Consultant|Administrator|DevOps|SRE|Data Scientist|ML Engineer|Full Stack|Frontend|Backend)\b'
        roles = re.findall(role_pattern, text)
        
        # Extract experience levels
        experience_pattern = r'\b(\d+[-\s]?\d*\+?\s*years?)\b'
        experience = re.findall(experience_pattern, text.lower())
        
        # Combine all findings
        keywords = list(set(found_skills + roles + experience))
        return keywords

    def extract_jd_sections(text: str) -> Dict[str, str]:
        lines = [line.strip() for line in text.split('\n') if line.strip()]
        section_header_pattern = re.compile(r'^([^:]+):(.*)$')

        sections = {}
        current_section = None
        current_content = []

        for line in lines:
            header_match = section_header_pattern.match(line)
            if header_match:
                if current_section and current_content:
                    sections[current_section] = '\n'.join(current_content).strip()
                current_section = header_match.group(1).strip()
                initial_content = header_match.group(2).strip()
                current_content = [initial_content] if initial_content else []
            elif current_section:
                current_content.append(line)

        if current_section and current_content:
            sections[current_section] = '\n'.join(current_content).strip()

        return sections

    def generate_dashboard(text: Union[str, bytes], scale: int, dashboard_index: int, prompt: Optional[str] = None) -> Dict[str, str]:
        try:
            if isinstance(text, bytes):
                text = text.decode('utf-8')

            if prompt:
                dashboard_content = DocumentProcessor.extract_content_for_dashboard(prompt, text)
            else:
                sections = DocumentProcessor.extract_jd_sections(text)
                selected_sections = list(sections.items())[:scale]
                if dashboard_index < len(selected_sections):
                    dashboard_content = f"{selected_sections[dashboard_index][0]}:\n{selected_sections[dashboard_index][1]}"
                else:
                    dashboard_content = "No content available for this dashboard index"

            return {
                "status": "success",
                "content": dashboard_content.strip()
            }
        except Exception as e:
            return {"status": "error", "error": str(e)}

    def extract_content_for_dashboard(prompt: str, text: str) -> str:
        sections = DocumentProcessor.extract_jd_sections(text)
        match = re.search(r"for (.+)", prompt)

        if match and sections:
            keyword = match.group(1).strip().lower()
            relevant_sections = []
            for section_title, content in sections.items():
                if keyword in section_title.lower() or keyword in content.lower():
                    relevant_sections.append(f"{section_title}:\n{content}")

            if relevant_sections:
                return "\n\n".join(relevant_sections[:2])

        return "No relevant content found"

    def generate_qa(dashboard_content: str, num_qa: int) -> str:
        try:
            qa_prompt = GENERATE_QA_PROMPT.format(num_qa=num_qa, dashboard_content=dashboard_content)
            generate_qa_response = DocumentProcessor.model.generate_content(qa_prompt)
            qa_text = generate_qa_response.text.strip()

            formatted_qa = []
            lines = qa_text.split('\n')
            current_qa_pair = []

            for line in lines:
                line = line.strip()
                if not line:
                    continue

                if line.startswith('Q'):
                    if current_qa_pair:
                        formatted_qa.extend(current_qa_pair)
                        current_qa_pair = []
                    line = re.sub(r'^Q\s*(\d+)\s*:', r'Q\1:', line)
                    current_qa_pair.append(line)

                elif line.startswith('A'):
                    line = re.sub(r'^A\s*(\d+)\s*:', r'A\1:', line)
                    current_qa_pair.append(line)

            if current_qa_pair:
                formatted_qa.extend(current_qa_pair)

            return '\n'.join(formatted_qa)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error generating Q&A: {str(e)}")


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
        if not hasattr(self, 'initialized'):
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
            cls.model = genai.GenerativeModel('gemini-pro')
            cls.is_initialized = True
            return {"status": "success", "data": {"message": "Initialized successfully"}}
        except Exception as e:
            return {"status": "error", "error": str(e)}

    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def _is_question(text: str) -> bool:
        
        text_lower = text.lower().strip()
        return any(text_lower.startswith(starter) for starter in QUESTION_STARTERS) or '?' in text
    

    async def start_recording() -> Dict[str, Any]:
        if not DualInputTranscriber.is_initialized:
            return {"status": "error", "error": "Transcriber not initialized"}
        try:
            instance = DualInputTranscriber.get_instance()
            if not DualInputTranscriber.is_recording:
                DualInputTranscriber.is_recording = True
                
                # Start transcription threads
                mic_thread = threading.Thread(target=instance._transcribe_mic, daemon=True)
                speaker_thread = threading.Thread(target=instance._transcribe_speaker, daemon=True)
                
                mic_thread.start()
                speaker_thread.start()
                
                return {"status": "success", "data": {"message": "Recording started successfully"}}
            return {"status": "error", "error": "Already recording"}
        except Exception as e:
            return {"status": "error", "error": f"Failed to start recording: {str(e)}"}

    async def stop_recording() -> Dict[str, Any]:
        if not DualInputTranscriber.is_initialized:
            return {"status": "error", "error": "Transcriber not initialized"}
        
        try:
            if DualInputTranscriber.is_recording:
                DualInputTranscriber.is_recording = False
                return {"status": "success", "data": {"message": "Recording stopped"}}
            return {"status": "error", "error": "Not recording"}
        except Exception as e:
            return {"status": "error", "error": str(e)}

    async def clear_transcription() -> Dict[str, Any]:
        if not DualInputTranscriber.is_initialized:
            return {"status": "error", "error": "Transcriber not initialized"}
        
        try:
            DualInputTranscriber._state = TranscriptionState()
            return {
                "status": "success",
                "data": {
                    "message": "Transcription cleared",
                    "text": DualInputTranscriber._get_combined_text()
                }
            }
        except Exception as e:
            return {"status": "error", "error": str(e)}

    async def evaluate_qa() -> Dict[str, Any]:
        if not DualInputTranscriber.is_initialized:
            return {"status": "error", "error": "Transcriber not initialized"}
        
        try:
            state = DualInputTranscriber._state
            questions = state.interviewer_lines
            answers = state.candidate_lines

            if len(questions) != len(answers):
                return {
                    "status": "success",
                    "explanation": "Invalid Q&A format - Mismatch between questions and answers",
                    "mark": "❌",
                    "score": "0%"
                }

            if not questions:
                return {
                    "status": "success",
                    "explanation": "Invalid Q&A format - No question-answer pairs found",
                    "mark": "❌",
                    "score": "0%"
                }

            prompt = EVALUATE_QA_PROMPT.format(
                question=questions[-1],
                answer=answers[-1]
            )

            response = DualInputTranscriber.model.generate_content(prompt)
            response_text = response.text

            score_line = next((line for line in response_text.split('\n') if line.startswith('SCORE:')), '')
            explanation_line = next((line for line in response_text.split('\n') if line.startswith('EXPLANATION:')), '')

            score = score_line.replace('SCORE:', '').strip()
            explanation = explanation_line.replace('EXPLANATION:', '').strip()

            return {
                "status": "success",
                "explanation": explanation or "Invalid Q&A format",
                "mark": "✅" if score and int(score.rstrip('%')) >= 60 else "❌",
                "score": f"{score}%" if score else "0%"
            }
        except Exception as e:
            return {
                "status": "success",
                "explanation": "Invalid Q&A format",
                "mark": "❌",
                "score": "0%"
            }

    def generate_similar_qa(num_pairs: int, original_qa: str) -> Tuple[str, str]:
        if not original_qa.strip():
            return "", "Please record a Q&A pair first before generating similar ones."
        try:
            qa_prompt = GENERATE_SIMILAR_QA_PROMPT.format(
                original_qa=original_qa,
                num_pairs=num_pairs
            )
            response = DocumentProcessor.model.generate_content(qa_prompt)
            return original_qa, response.text
        except Exception as e:
            return original_qa, f"Error generating Q&A pairs: {str(e)}"
        
    def _update_mongodb_document(self):
        """Periodically update the MongoDB document with the current transcription"""
        last_update_time = time.time()
        
        while DualInputTranscriber.is_recording:
            try:
                # Update every 2 seconds
                current_time = time.time()
                if current_time - last_update_time >= 2:
                    # Get the latest active recording
                    from app.database.mongo_connection import find_one, update_one
                    
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
            
    def _transcribe_mic(self):
        while DualInputTranscriber.is_recording:
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
                            DualInputTranscriber._state.interviewer_lines.append(text)
                            
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
                if any(name in device['name'].lower() for name in ['loopback', 'cable input', 'virtual', 'blackhole']):
                    print(f"\nFound loopback device: {device['name']}")
                    return i

            # Strategy 2: Try to use the default input device
            default_input = sd.default.device[0]
            if default_input is not None and default_input >= 0:
                device = devices[default_input]
                if device['max_input_channels'] > 0:
                    print(f"\nUsing default input device: {device['name']}")
                    return default_input

            # Strategy 3: Find any device with input capabilities
            for i, device in enumerate(devices):
                if device['max_input_channels'] > 0:
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
                    samplerate=int(device_info['default_samplerate']),
                    blocksize=CHUNK,
                    dtype='int16'
                )

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
                            with wave.open(audio_bytes, 'wb') as wav_file:
                                wav_file.setnchannels(1)
                                wav_file.setsampwidth(2)
                                wav_file.setframerate(RATE)
                                wav_file.writeframes(raw_data)

                            # Perform speech recognition
                            audio_bytes.seek(0)
                            audio = sr.AudioData(
                                audio_bytes.read(),
                                sample_rate=RATE,
                                sample_width=2
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
        
    def _get_combined_text() -> str:
        """Combine interviewer and candidate text with improved formatting"""
        combined_text = ["Interviewer:"]
        state = DualInputTranscriber._state
        
        for i, question in enumerate(state.interviewer_lines):
            combined_text.append(question)
            if i < len(state.candidate_lines):
                answer = state.candidate_lines[i]
                if answer:
                    answer = answer.rstrip()
                    if not answer.endswith(('.', '!', '?')):
                        answer += '.'
                    combined_text.append(answer)
        
        return "\n".join(combined_text)
