from fastapi import APIRouter, File, UploadFile, Form, HTTPException, Depends
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, Dict, List, Any
# from app.services.resume.prompt_engineering import Resume_GENERATE_QA_PROMPT,Resume_GENERATE_SIMILAR_QA_PROMPT,Resume_EVALUATE_QA_PROMPT,Resume_QUESTION_STARTERS
from app.services.resume.llm_service import ResumeProcessorllm, Resume_DualInputTranscriber
from app.models.base import ResumeAnalytics, Candidate, JobDescription, ThresholdScore
from app.database.mongo_connection import insert_data
from app.core.Config import GOOGLE_API_KEY
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.base import Resume
from datetime import datetime
# import speech_recognition as sr
import google.generativeai as genai
# import sounddevice as sd
import json
import logging


logger = logging.getLogger(__name__)


class InitializeRequest(BaseModel):
    api_key: str


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
    original_qa: str


resume_evaluation_router = APIRouter()

processor = ResumeProcessorllm()


class ResumeProcessor:
    def __init__(self):
        self.interviewer_lines = []
        self.candidate_lines = []
        self.status = "success"
        self.data = None
        self.error = None

    genai.configure(api_key=GOOGLE_API_KEY)

    # Then initialize with the correct model name
    model = genai.GenerativeModel("gemini-1.5-pro")


@resume_evaluation_router.post("/upload-document")
async def upload_document(
    candidate_name: str = Form(None),
    candidate_email: str = Form(None),
    job_id: int = Form(None),
    candidate_id: int = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    try:
        # Log all input parameters for debugging
        logger.debug(f"Input parameters: job_id={job_id}, candidate_id={candidate_id}, candidate_name={candidate_name}, candidate_email={candidate_email}, file={file.filename}")
        
        # Get dynamic threshold score from ThresholdScore table
        threshold_score = None
        
        if job_id is not None:
            # Try to get threshold score for this specific job
            job_threshold = db.query(ThresholdScore).filter(ThresholdScore.job_id == job_id).order_by(ThresholdScore.created_at.desc()).first()
            
            if job_threshold:
                threshold_score = job_threshold.threshold_value
                logger.info(f"Using job-specific threshold score for job_id {job_id}: {threshold_score}")
        
        # If no job-specific threshold found, try to get a general threshold
        if threshold_score is None:
            general_threshold = db.query(ThresholdScore).order_by(ThresholdScore.created_at.desc()).first()
            
            if general_threshold:
                threshold_score = general_threshold.threshold_value
                logger.info(f"Using general threshold score: {threshold_score}")
            else:
                # Default fallback value if no thresholds found in database
                threshold_score = None
                logger.info(f"No threshold scores found, using default: {threshold_score}")
        
        try:
            # Try to get the most recent threshold score
            threshold_record = db.query(ThresholdScore).order_by(ThresholdScore.created_at.desc()).first()
            if threshold_record:
                threshold_score = threshold_record.threshold_value
                logger.info(f"Using dynamic threshold score: {threshold_score}")
            else:
                logger.info(f"No threshold scores found, using default: {threshold_score}")
        except Exception as thresh_error:
            logger.warning(f"Error retrieving threshold score: {str(thresh_error)}")
            logger.info(f"Using default threshold score: {threshold_score}")
        
        if job_id is not None:
            # Check if the job exists
            job_exists = db.query(JobDescription).filter(JobDescription.job_id == job_id).first()
            
            if not job_exists:
                logger.warning(f"Job ID {job_id} does not exist in database")
                # Try to get any existing job
                existing_job = db.query(JobDescription).first()
                if existing_job:
                    job_id = existing_job.job_id
                    logger.info(f"Using existing job_id: {job_id}")
                else:
                    # Create a default job with dynamic threshold
                    new_job = JobDescription(
                        title=f"Default Job Position",
                        description="This is a default job description created automatically.",
                        raw_text="Default job description",
                        status="Active",
                        threshold_score=threshold_score)
                    db.add(new_job)
                    db.flush()
                    job_id = new_job.job_id
                    logger.info(f"Created default job with ID: {job_id} and threshold: {threshold_score}")
        else:
            # If job_id is None, try to get any existing job
            existing_job = db.query(JobDescription).first()
            if existing_job:
                job_id = existing_job.job_id
                logger.info(f"Using existing job_id: {job_id}")
            else:
                # Create a default job with dynamic threshold
                new_job = JobDescription(
                    title=f"Default Job Position",
                    description="This is a default job description created automatically.",
                    raw_text="Default job description",
                    status="Active",
                    threshold_score=threshold_score
                )
                db.add(new_job)
                db.flush()
                job_id = new_job.job_id
                logger.info(f"Created default job with ID: {job_id} and threshold: {threshold_score}")
        
        # Make sure file is an UploadFile object with read method
        if not hasattr(file, 'read'):
            return JSONResponse(content={"status": "error", "error": "Invalid file object"},status_code=400)
            
        content = await file.read()
        await file.seek(0)
        
        if file.filename.endswith('.pdf'):
            text = ResumeProcessorllm.extract_text_from_pdf(content)
        elif file.filename.endswith('.docx'):
            text = ResumeProcessorllm.extract_text_from_docx(content)
        else:
            return JSONResponse(content={"status": "error", "error": "Unsupported file type"},status_code=400)

        keywords = ResumeProcessorllm.extract_keywords(text)
        
        # Improved name and email extraction
        extracted_info = ResumeProcessorllm.extract_candidate_info(text)
        logger.debug(f"Extracted info from resume: {extracted_info}")
        
        # Use provided values or extracted values, with fallbacks
        candidate_name = candidate_name or extracted_info.get('name')
        if not candidate_name or candidate_name == "Unknown Candidate":
            # Try harder to extract a name from the resume
            candidate_name = ResumeProcessorllm.extract_name_advanced(text) or "Unknown Candidate"
            logger.debug(f"Advanced name extraction result: {candidate_name}")
            
        candidate_email = candidate_email or extracted_info.get('email')
        if not candidate_email:
            candidate_email = f"candidate_{int(datetime.now().timestamp())}@placeholder.com"
        
        # Check if candidate exists by ID or email
        candidate = None
        if candidate_id:
            candidate = db.query(Candidate).filter(Candidate.candidate_id == candidate_id).first()
            logger.debug(f"Found candidate by ID: {candidate}")
        
        # If not found by ID, check by email
        if not candidate and candidate_email:
            candidate = db.query(Candidate).filter(Candidate.email == candidate_email).first()
            logger.debug(f"Found candidate by email: {candidate}")
        
        if candidate:
            # Update existing candidate
            if candidate_name and candidate.name != candidate_name and candidate_name != "Unknown Candidate":
                candidate.name = candidate_name
            
            # IMPORTANT: Update job_id if provided and different
            if job_id is not None:
                # Double-check that the job exists before updating
                job_exists = db.query(JobDescription).filter(JobDescription.job_id == job_id).first()
                if job_exists:
                    candidate.job_id = job_id
                    logger.info(f"Updated candidate {candidate.candidate_id} with job_id: {job_id}")
                else:
                    logger.warning(f"Attempted to update candidate with non-existent job_id: {job_id}")
                    # This should not happen due to our earlier checks, but just in case
            
            # Update resume_url
            candidate.resume_url = file.filename
            candidate.updated_at = datetime.now()
            
            db.flush()
            candidate_id = candidate.candidate_id
        else:
            # Create a new candidate
            try:
                # IMPORTANT: Ensure job_id is valid and exists
                job_exists = db.query(JobDescription).filter(JobDescription.job_id == job_id).first()
                if not job_exists:
                    logger.warning(f"Attempted to create candidate with non-existent job_id: {job_id}")
                    # This should not happen due to our earlier checks, but just in case
                    
                # Create the candidate with a valid job_id
                candidate = Candidate(
                    name=candidate_name,
                    email=candidate_email,
                    job_id=job_id,
                    status="Pending",
                    resume_url=file.filename
                )
                db.add(candidate)
                db.flush()  # Get the ID without committing
                candidate_id = candidate.candidate_id
                logger.info(f"Created new candidate {candidate_id} with job_id: {job_id}")
            except Exception as e:
                logger.error(f"Error creating candidate: {str(e)}")
                return JSONResponse(content={"status": "error", "error": f"Error creating candidate: {str(e)}"},status_code=400)
        
        # Check if resume already exists for this candidate
        existing_resume = None
        if candidate_id:
            existing_resume = db.query(Resume).filter(Resume.candidate_id == candidate_id).first()
            logger.debug(f"Found existing resume: {existing_resume}")
        
        if existing_resume:
            # Update existing resume
            existing_resume.resume_url = file.filename
            # IMPORTANT: Ensure job_id is updated in the resume
            if job_id is not None:
                existing_resume.job_id = job_id
                existing_resume.is_active = True
                existing_resume.version += 1
                existing_resume.parsed_data = text
                existing_resume.upload_date = datetime.now()
                db.flush()
                resume_doc = existing_resume
                logger.info(f"Updated existing resume {resume_doc.resume_id} with job_id: {job_id}")
        else:
            resume_doc = Resume(
                resume_id=candidate_id,
                candidate_id=candidate_id,
                job_id=job_id,
                resume_url=file.filename,
                parsed_data=text,
                upload_date=datetime.now(),
                is_active=True,
                activity_type="upload"
            )
            db.add(resume_doc)
            logger.info(f"Created new resume with job_id: {job_id}")
        
        # Commit the transaction
        db.commit()
        
        # Verify the job_id was saved correctly
        db.refresh(resume_doc)
        db.refresh(candidate)
        logger.info(f"After commit - Resume job_id: {resume_doc.job_id}, Candidate job_id: {candidate.job_id}")
        
        # Double-check the database directly
        direct_resume = db.query(Resume).filter(Resume.resume_id == resume_doc.resume_id).first()
        direct_candidate = db.query(Candidate).filter(Candidate.candidate_id == candidate.candidate_id).first()
        logger.info(f"Direct DB check - Resume job_id: {direct_resume.job_id}, Candidate job_id: {direct_candidate.job_id}")

        return JSONResponse(
            content={
                "status": "success",
                "data": {
                    "keywords": keywords,
                    "text": text[:500] + "...",
                    "document_id": resume_doc.resume_id,
                    "candidate_id": candidate.candidate_id,
                    "candidate_name": candidate.name,
                    "candidate_email": candidate.email,
                    "job_id": resume_doc.job_id,
                    "threshold_score": threshold_score}},status_code=200)

    except Exception as e:
        # Rollback if needed
        try:
            if db and hasattr(db, 'rollback'):
                db.rollback()
        except Exception as rollback_error:
            logger.error(f"Error during rollback: {str(rollback_error)}")
            
        logger.error(f"Error in upload_document: {str(e)}")
        return JSONResponse(
            content={"status": "error", "error": f"Error processing file: {str(e)}"},
            status_code=500)

@resume_evaluation_router.post("/generate-dashboard")
async def generate_dashboard(
    file: UploadFile = File(...),
    scale: int = Form(...),
    dashboard_index: int = Form(...),
    prompt: Optional[str] = Form(None),
    db: Session = Depends(get_db),
) -> JSONResponse:
    try:
        content = await file.read()
        await file.seek(0)

        if file.filename.endswith(".pdf"):
            text = ResumeProcessorllm.extract_text_from_pdf(content)
        elif file.filename.endswith(".docx"):
            text = ResumeProcessorllm.extract_text_from_docx(content)
        else:
            return JSONResponse(
                content={"status": "error", "error": "Unsupported file type"},
                status_code=400
            )

        # First create a Resume record
        resume = Resume(
            resume_url=file.filename,
            parsed_data=text,
            is_active=True,
            version=1
        )
        db.add(resume)
        db.commit()
        db.refresh(resume)

        response = ResumeProcessorllm.generate_dashboard(
            text=text, 
            scale=scale, 
            dashboard_index=dashboard_index, 
            prompt=prompt
        )

        # Create ResumeAnalytics record with correct fields from schema
        dashboard_record = ResumeAnalytics(
            resume_id=resume.resume_id,
            ai_generated_question=prompt if prompt else "Dashboard Analysis",
            answer_text=response.get("content", ""),
            score=None,
            strengths=None,
            weaknesses=None,
            insights=json.dumps({
                "scale": scale,
                "index": dashboard_index,
                "filename": file.filename
            }),
            activity_type="dashboard_generation",
            generated_at=datetime.utcnow()
        )

        db.add(dashboard_record)
        db.commit()
        db.refresh(dashboard_record)

        return JSONResponse(
            content={
                "status": "success",
                "data": {
                    "content": response.get("content", ""),
                    "analytics_id": dashboard_record.analytics_id,
                    "resume_id": resume.resume_id
                }
            }
        )

    except Exception as e:
        if "db" in locals():
            db.rollback()
        return JSONResponse(
            content={"status": "error", "error": str(e)}, 
            status_code=500
        )

@resume_evaluation_router.get("/get-dashboard/{dashboard_id}")
async def get_dashboard(dashboard_id: str, db: Session = Depends(get_db)) -> JSONResponse:
    result = await ResumeProcessorllm.get_dashboard_content(dashboard_id, db)
    return JSONResponse(
        content=result,
        status_code=200 if result["status"] == "success" else 404 if "not found" in result.get("message", "") else 500)

@resume_evaluation_router.post("/generate-qa")
async def generate_qa(
    dashboard_content: str = Form(...),
    num_qa: int = Form(default=5),
    db: Session = Depends(get_db)
) -> JSONResponse:
    try:
        resume = Resume(
            resume_url="qa_generation",
            parsed_data=dashboard_content,
            is_active=True,
            version=1
        )
        db.add(resume)
        db.commit()
        db.refresh(resume)

        qa_response = ResumeProcessorllm.generate_qa(dashboard_content, num_qa)
        
        # Extract the formatted_qa string from the response dictionary
        qa_content = qa_response["formatted_qa"] if isinstance(qa_response, dict) else str(qa_response)

        qa_record = ResumeAnalytics(
            resume_id=resume.resume_id,
            ai_generated_question=f"Generated {num_qa} Q&A pairs",
            answer_text=qa_content,  # Use the string content instead of dict
            score=0.0,
            insights=json.dumps({
                "num_qa": num_qa, 
                "dashboard_content_length": len(dashboard_content),
                "qa_id": qa_response.get("qa_id"),
                "metadata": qa_response.get("metadata")
            }),
            activity_type="qa_generation",
            generated_at=datetime.utcnow()
        )

        db.add(qa_record)
        db.commit()
        db.refresh(qa_record)

        return JSONResponse(
            content={
                "status": "success",
                "data": {
                    "content": qa_content,
                    "qa_id": qa_record.analytics_id,
                    "resume_id": resume.resume_id,
                    "mongo_qa_id": qa_response.get("qa_id")
                }
            }
        )

    except Exception as e:
        if "db" in locals():
            db.rollback()
        return JSONResponse(
            content={"status": "error", "error": str(e)},
            status_code=500
        )

@resume_evaluation_router.get("/get-qa/{qa_id}")
async def get_qa(qa_id: str) -> JSONResponse:
    result = ResumeProcessorllm.get_qa_content(qa_id)
    return JSONResponse(content=result,status_code=200 if result["status"] == "success" else 404 if "not found" in result.get("message", "") else 500)

@resume_evaluation_router.post("/initialize")
async def initialize_transcriber(request: InitializeRequest) -> JSONResponse:
    try:
        if not request.api_key:
            raise HTTPException(status_code=400, detail="API key is required")
        response = await Resume_DualInputTranscriber.initialize(request.api_key)
        return JSONResponse(
            content=response,
            status_code=200 if response["status"] == "success" else 400,
        )
    except Exception as e:
        return JSONResponse(
            content={"status": "error", "error": str(e)}, status_code=500
        )


@resume_evaluation_router.post("/start-recording")
async def start_recording(db: Session = Depends(get_db)) -> JSONResponse:
    try:
        response = await Resume_DualInputTranscriber.start_recording(
            Resume_DualInputTranscriber, db
        )
        logger.info(f"Start recording response: {response}")
        return JSONResponse(
            content=response,
            status_code=200 if response["status"] == "success" else 400,
        )
    except Exception as e:
        return JSONResponse(
            content={"status": "error", "error": str(e)}, status_code=500
        )


@resume_evaluation_router.post("/stop-recording")
async def stop_recording(db: Session = Depends(get_db)) -> JSONResponse:
    try:
        # Pass DualInputTranscriber as the first argument explicitly
        response = await Resume_DualInputTranscriber.stop_recording(
            Resume_DualInputTranscriber, db
        )
        return JSONResponse(
            content=response,
            status_code=200 if response["status"] == "success" else 400,
        )
    except Exception as e:
        return JSONResponse(
            content={"status": "error", "error": str(e)}, status_code=500
        )


@resume_evaluation_router.post("/clear-transcription")
async def clear_transcription() -> JSONResponse:
    try:
        response = await Resume_DualInputTranscriber.clear_transcription()
        return JSONResponse(
            content=response,
            status_code=200 if response["status"] == "success" else 400,
        )
    except Exception as e:
        return JSONResponse(
            content={"status": "error", "error": str(e)}, status_code=500
        )

@resume_evaluation_router.post("/evaluate-qa")
async def evaluate_qa() -> JSONResponse:
    try:
        response = await Resume_DualInputTranscriber.evaluate_qa(Resume_DualInputTranscriber)
        return JSONResponse(
            content={
                "status": "success",
                "data": {
                    "explanation": response.get("explanation", "Invalid Q&A format"),
                    "mark": response.get("mark", "❌"),
                    "score": response.get("score", "0%"),
                    "eval_id": response.get("eval_id", ""),
                },
            }
        )
    except Exception as e:
        return JSONResponse(
            content={
                "status": "success",
                "data": {
                    "explanation": "Invalid Q&A format",
                    "mark": "❌",
                    "score": "0%",
                },
            }
        )

@resume_evaluation_router.get("/get-evaluation/{eval_id}")
async def get_evaluation(eval_id: str) -> JSONResponse:
    result = Resume_DualInputTranscriber.get_evaluation_qa_content(eval_id)
    return JSONResponse(content=result,status_code=200 if result["status"] == "success" else 404 if "not found" in result.get("message", "") else 500)


@resume_evaluation_router.post("/generate_QA_from_audio")
async def generate_qa_from_audio(request: GenerateQARequest):
    try:
        original_qa, result = Resume_DualInputTranscriber.generate_similar_qa(request.num_pairs, request.original_qa)
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

@resume_evaluation_router.get("/get-audio-qa/{qa_id}")
async def get_audio_qa(qa_id: str) -> JSONResponse:
    result = ResumeProcessorllm.get_audio_qa_content(qa_id)
    return JSONResponse(content=result,status_code=200 if result["status"] == "success" else 404 if "not found" in result.get("message", "") else 500)
