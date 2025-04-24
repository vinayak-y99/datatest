from fastapi import FastAPI,APIRouter, Depends, HTTPException, Path, Query,Body, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..database.connection import get_db
from ..models.base import Interview, Candidate,Report,UserFeedback,Discussion,Resume,CandidateEvaluation,JobDescription,Candidate, JobDescription, CandidateEvaluation, Interview, Resume,ResumeEvaluation, ResumeAnalytics, Skill, JobRequiredSkills, User
from ..models.mongo_schema import create_interview_transcription_collection as mongo_db
from app.database.mongo_connection import find_one
import json
from bson import json_util, ObjectId
from datetime import datetime
import logging
from typing import Dict, List
from datetime import datetime, timedelta
from app.models.base import * 

# Initialize FastAPI app
app  = FastAPI()

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

clientpanel_router = APIRouter()
# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app.include_router(clientpanel_router, prefix="/api")


def get_db_session():
    db = get_db()
    try:
        session = next(db)
        yield session
    except Exception as e:
        logger.error(f"Database connection error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database connection failed: {str(e)}")
    finally:
        session.close()


## DASHBOARD
# 1. Hiring Processes Endpoints
@clientpanel_router.get("/hiring_processes", response_model=List[Dict])
def get_hiring_processes(db: Session = Depends(get_db_session)):
    try:
        jobs = db.query(JobDescription).all()
        processes = []
        for job in jobs:
            start_date = job.created_at
            processes.append({
                "id": job.job_id,
                "title": job.title,
                "stage": job.status or "Unknown",
                "candidates": db.query(Candidate).filter(Candidate.job_id == job.job_id).count(),
                "progress": int(job.threshold_score * 1) if job.threshold_score else 0,
                "startDate": start_date.strftime("%Y-%m-%d") if start_date else "Not Started",
                "bgColor": job.activity_type or "gray",
                "textGradient": f"from-{job.activity_type or 'gray'}-500 to-{job.activity_type or 'gray'}-700"
            })
        return processes
    except Exception as e:
        logger.error(f"Error fetching hiring processes: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch hiring processes: {str(e)}")

@clientpanel_router.post("/add_hiring_process", response_model=Dict)
def add_hiring_process(process_data: Dict = Body(...), db: Session = Depends(get_db_session)):
    try:
        new_job = JobDescription(
            title=process_data.get("title", "Untitled"),
            description=process_data.get("description", ""),
            status=process_data.get("stage", "Open"),
            threshold_score=process_data.get("progress", 0) / 100,
            created_at=datetime.strptime(process_data.get("startDate", datetime.utcnow().strftime("%Y-%m-%d")), "%Y-%m-%d"),
            job_match_benchmark=process_data.get("job_match_benchmark", 0.7),
            high_score_threshold=process_data.get("high_score_threshold", 0.9),
            high_match_threshold=process_data.get("high_match_threshold", 0.85),
            mid_score_threshold=process_data.get("mid_score_threshold", 0.7),
            mid_match_threshold=process_data.get("mid_match_threshold", 0.65),
            critical_skill_importance=process_data.get("critical_skill_importance", 0.8),
            experience_score_multiplier=process_data.get("experience_score_multiplier", 1.0),
            activity_type=process_data.get("bgColor", "blue")
        )
        db.add(new_job)
        db.commit()
        db.refresh(new_job)
        return {
            "processId": new_job.job_id,
            "message": "Hiring process added successfully"
        }
    except Exception as e:
        db.rollback()
        logger.error(f"Error adding hiring process: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to add hiring process: {str(e)}")

@clientpanel_router.post("/update_process_progress", response_model=Dict)
def update_process_progress(data: Dict = Body(...), db: Session = Depends(get_db_session)):
    try:
        process = db.query(JobDescription).filter(JobDescription.job_id == data["processId"]).first()
        if not process:
            raise HTTPException(status_code=404, detail="Process not found")
        process.threshold_score = data.get("newProgress", 0) / 100
        db.commit()
        return {"message": "Process progress updated successfully"}
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating process progress: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to update process progress: {str(e)}")

# 2. Pending Evaluations Endpoints
# Existing endpoint (with minor tweak for clarity)
# backend - /pending_evaluations endpoint
@clientpanel_router.get("/pending_evaluations", response_model=Dict)
def get_pending_evaluations(db: Session = Depends(get_db_session)):
    try:
        evaluations = db.query(CandidateEvaluation).filter(CandidateEvaluation.score == 0).all()
        evaluation_data = []
        for eval in evaluations:
            due_date = eval.evaluation_date
            evaluation_data.append({
                "id": eval.evaluation_id,
                "name": eval.candidate.name if eval.candidate else "Unknown",
                "position": eval.job.title if eval.job else "Unknown",
                "evaluator": "Automated" if eval.evaluation_type == "automated" else "Manual",
                "status": "Pending" if Candidate.status == "Shortlisted" else "Completed",  # Adjust based on your logic
                "dueDate": due_date.strftime("%Y-%m-%d") if due_date else "Not Set"
            })
        logger.info(f"Fetched {len(evaluation_data)} pending evaluations")
        return {"evaluations": evaluation_data}
    except Exception as e:
        logger.error(f"Error fetching pending evaluations: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch pending evaluations: {str(e)}")

# 3. Top Candidates Endpoints
@clientpanel_router.get("/top_candidates", response_model=Dict)
def get_top_candidates(db: Session = Depends(get_db_session)):
    try:
        candidates = db.query(Candidate).filter(Candidate.status == "Shortlisted").all()
        candidate_data = []
        for cand in candidates:
            interview = db.query(Interview).filter(Interview.candidate_id == cand.candidate_id).first()
            candidate_data.append({
                "id": cand.candidate_id,
                "name": cand.name,
                "position": cand.job_description.title if cand.job_description else "Unknown",
                "rating": db.query(func.avg(CandidateEvaluation.score)).filter(CandidateEvaluation.candidate_id == cand.candidate_id).scalar() or 0,
                "stage": cand.status,
                "interviewDate": (
                    interview.interview_date.strftime("%Y-%m-%d") if interview and interview.interview_date
                    else cand.updated_at.strftime("%Y-%m-%d") if cand.updated_at
                    else "Not Scheduled"
                )
            })
        return {"candidates": candidate_data}
    except Exception as e:
        logger.error(f"Error fetching top candidates: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch top candidates: {str(e)}")

# 4. Active Jobs Endpoints
@clientpanel_router.get("/active_jobs", response_model=Dict)
def get_active_jobs(db: Session = Depends(get_db_session)):
    try:
        jobs = db.query(JobDescription).filter(JobDescription.status == "Open").all()
        job_data = []
        for job in jobs:
            created_at = job.created_at
            job_data.append({
                "id": job.job_id,
                "title": job.title,
                "department": job.department or "Unknown",
                "location": job.experience_level or "Not Specified",
                "applicants": db.query(Candidate).filter(Candidate.job_id == job.job_id).count(),
                "newApplicants": db.query(Candidate).filter(
                    Candidate.job_id == job.job_id,
                    Candidate.created_at > (datetime.utcnow() - timedelta(days=7))
                ).count(),
                "daysActive": (datetime.utcnow() - created_at).days if created_at else 0,
                "priority": (
                    "High" if job.critical_skill_importance and job.critical_skill_importance > 0.8 else 
                    "Medium" if job.critical_skill_importance and job.critical_skill_importance > 0.5 else "Low"
                ),
                "status": job.status
            })
        return {"jobs": job_data}
    except Exception as e:
        logger.error(f"Error fetching active jobs: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch active jobs: {str(e)}")

@clientpanel_router.post("/update_job_status", response_model=Dict)
def update_job_status(data: Dict = Body(...), db: Session = Depends(get_db_session)):
    try:
        job = db.query(JobDescription).filter(JobDescription.job_id == data["jobId"]).first()
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        job.status = data.get("newStatus", job.status)
        db.commit()
        return {"message": "Job status updated successfully"}
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating job status: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to update job status: {str(e)}")

# 5. Pending Interviews Endpoints
@clientpanel_router.get("/pending_interviews", response_model=Dict)
def get_pending_interviews(db: Session = Depends(get_db_session)):
    try:
        interviews = db.query(Interview).filter(Interview.status.in_(["Rescheduled", "Pending", "Scheduling"])).all()
        interview_data = []
        for inter in interviews:
            interview_date = inter.interview_date
            interview_data.append({
                "id": inter.interview_id,
                "candidateName": inter.candidate.name if inter.candidate else "Unknown",
                "position": inter.job.title if inter.job else "Unknown",
                "interviewType": inter.activity_type or "Not Specified",
                "date": interview_date.strftime("%Y-%m-%d") if interview_date else "Not Set",
                "time": interview_date.strftime("%H:%M") if interview_date else "Not Set",
                "interviewers": [inter.user.name] if inter.user else ["Unknown"],
                "status": inter.status
            })
        return {"interviews": interview_data}
    except Exception as e:
        logger.error(f"Error fetching pending interviews: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch pending interviews: {str(e)}")

@clientpanel_router.post("/schedule_interview", response_model=Dict)
def schedule_interview(interview_data: Dict = Body(...), db: Session = Depends(get_db_session)):
    try:
        candidate = db.query(Candidate).filter(Candidate.name == interview_data["candidateName"]).first()
        if not candidate:
            raise HTTPException(status_code=404, detail="Candidate not found")
        job = db.query(JobDescription).filter(JobDescription.title == interview_data["position"]).first()
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        
        interview_date_str = f"{interview_data.get('date', datetime.utcnow().strftime('%Y-%m-%d'))} {interview_data.get('time', '00:00')}"
        interview_date = datetime.strptime(interview_date_str, "%Y-%m-%d %H:%M")
        
        new_interview = Interview(
            candidate_id=candidate.candidate_id,
            job_id=job.job_id,
            user_id=interview_data.get("user_id", 1),  # Replace with actual user ID from auth
            interview_score=interview_data.get("interview_score", 0),
            interview_date=interview_date,
            status=interview_data.get("status", "Scheduled"),
            activity_type=interview_data.get("interviewType", "Standard")
        )
        db.add(new_interview)
        db.commit()
        db.refresh(new_interview)
        return {
            "interviewId": new_interview.interview_id,
            "message": "Interview scheduled successfully"
        }
    except Exception as e:
        db.rollback()
        logger.error(f"Error scheduling interview: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to schedule interview: {str(e)}")

# 6. Recruiters Endpoints
@clientpanel_router.get("/recruiters", response_model=Dict)
def get_recruiters(db: Session = Depends(get_db_session)):
    try:
        recruiters = db.query(User).filter(User.role == "Recruiter").all()
        recruiter_data = []
        for user in recruiters:
            active_jobs = db.query(JobDescription).filter(JobDescription.status == "Open").all()
            recruiter_data.append({
                "id": user.user_id,
                "name": user.name,
                "title": user.role,
                "availability": user.activity_type or "Available",
                "activeCandidates": db.query(Candidate).filter(Candidate.job_id.in_(
                    [job.job_id for job in active_jobs]
                )).count(),
                "assignedPositions": [job.title for job in active_jobs]
            })
        return {"recruiters": recruiter_data}
    except Exception as e:
        logger.error(f"Error fetching recruiters: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch recruiters: {str(e)}")
    
# Add this to your existing backend code, inside the clientpanel_router section

@clientpanel_router.get("/technical_panel", response_model=Dict)
def get_technical_panel(db: Session = Depends(get_db_session)):
    try:
        # Fetch users who might be part of the technical panel (e.g., role = "Recruiter" or "Interviewer")
        panelists = db.query(User).filter(User.role.in_(["Recruiter", "Interviewer"])).all()
        if not panelists:
            return {"panelists": []}  # Return empty list if no panelists found

        panelist_data = []
        for panelist in panelists:
            # Count interviews assigned to this user
            assigned_interviews = db.query(Interview).filter(Interview.user_id == panelist.user_id).count()
            panelist_data.append({
                "id": panelist.user_id,
                "name": panelist.name,
                "department": panelist.organization.organization_name if panelist.organization else "Unknown",
                "expertise": "Technical" if panelist.role == "Interviewer" else "Recruitment",  # Customize as needed
                "availability": panelist.activity_type or "Available",
                "assignedInterviews": assigned_interviews
            })
        return {"panelists": panelist_data}
    except Exception as e:
        logger.error(f"Error fetching technical panel: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch technical panel: {str(e)}")
        
@clientpanel_router.get("/interviews/")
def get_interviews(db: Session = Depends(get_db)):
    interviews = db.query(Interview).all()
    return interviews

@clientpanel_router.get("/average_score/")
def get_average_score(db: Session = Depends(get_db)):
    # Query the average interview score for shortlisted candidates with score > 70
    avg_score = db.query(func.avg(Interview.interview_score))\
                  .join(Candidate, Candidate.candidate_id == Interview.candidate_id)\
                  .filter(Interview.interview_score > 70)\
                  .filter(Candidate.status == "Shortlisted")\
                  .scalar()  # This will return the average value
    
    return {"average_score": avg_score}

@clientpanel_router.get("/total-shortlisted/")
def get_total_shortlisted(db: Session = Depends(get_db)):
    total_shortlisted = db.query(func.count()).filter(Candidate.status == "Shortlisted").scalar()

    return {"total_shortlisted": total_shortlisted}


@clientpanel_router.get("/resumes/")
def get_resumes(db: Session = Depends(get_db)):
    # Fetch all resumes with necessary joins
    resumes = (
        db.query(
            Resume.job_id,
            Resume.candidate_id,
            Resume.resume_url,
            Resume.upload_date,  # Use Resume.upload_date instead of JobDescription.created_at
            Candidate.name.label("candidate_name"),
            JobDescription.title.label("role"),
        )
        .join(Candidate, Resume.candidate_id == Candidate.candidate_id)
        .join(JobDescription, Resume.job_id == JobDescription.job_id)
        .all()
    )

    # Format the response
    resume_data = [
        {
            "job_id": resume.job_id,
            "candidate_id": resume.candidate_id,
            "candidate_name": resume.candidate_name,
            "resume_url": resume.resume_url,
            "role": resume.role,  # Maps to JobDescription.title
            "upload_date": resume.upload_date.isoformat() if resume.upload_date else "Not available",  # Fallback if None
            "actions": {
                "delete": f"/resumes/delete/{resume.candidate_id}"  # Endpoint to delete resume
            }
        }
        for resume in resumes
    ]

    return resume_data


@clientpanel_router.post("/interviews/")
def create_interview(interview_data: dict, db: Session = Depends(get_db)):
    logger.info(f"Received interview data: {interview_data}")
    try:
        # Validate required fields
        required_fields = ["candidate_id", "job_id", "user_id", "interview_date"]
        for field in required_fields:
            if field not in interview_data or interview_data[field] is None:
                logger.error(f"Missing required field: {field}")
                raise HTTPException(status_code=400, detail=f"Missing required field: {field}")

        # Check if candidate, job, and user exist
        candidate = db.query(Candidate).filter(Candidate.candidate_id == interview_data["candidate_id"]).first()
        if not candidate:
            logger.error(f"Candidate not found: {interview_data['candidate_id']}")
            raise HTTPException(status_code=404, detail="Candidate not found")
        
        job = db.query(JobDescription).filter(JobDescription.job_id == interview_data["job_id"]).first()
        if not job:
            logger.error(f"Job not found: {interview_data['job_id']}")
            raise HTTPException(status_code=404, detail="Job not found")
        
        user = db.query(User).filter(User.user_id == interview_data["user_id"]).first()
        if not user:
            logger.error(f"User not found: {interview_data['user_id']}")
            raise HTTPException(status_code=404, detail="User not found")

        # Parse interview_date
        try:
            interview_date = datetime.fromisoformat(interview_data["interview_date"].replace("Z", "+00:00") if "Z" in interview_data["interview_date"] else interview_data["interview_date"] + ":00")
        except ValueError as e:
            logger.error(f"Invalid interview_date format: {interview_data['interview_date']}")
            raise HTTPException(status_code=400, detail=f"Invalid interview_date format: {str(e)}")

        # Create new interview
        new_interview = Interview(
            candidate_id=interview_data["candidate_id"],
            job_id=interview_data["job_id"],
            user_id=interview_data["user_id"],
            interview_date=interview_date,
            interview_score=interview_data.get("interview_score"),
            feedback=json.dumps(interview_data["feedback"]) if interview_data.get("feedback") else None,
            status=interview_data.get("status", "Scheduled"),
            activity_type="Scheduled Interview"
        )
        
        db.add(new_interview)
        db.commit()
        db.refresh(new_interview)
        
        logger.info(f"Interview scheduled successfully: {new_interview.interview_id}")
        return {"message": "Interview scheduled successfully", "interview_id": new_interview.interview_id}
    except HTTPException as e:
        db.rollback()
        raise e
    except Exception as e:
        db.rollback()
        logger.error(f"Error scheduling interview: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error scheduling interview: {str(e)}")
    
@clientpanel_router.get("/interview/mongo/{mongo_id}")
def get_mongo_interview(mongo_id: str = Path(..., description="MongoDB ObjectId as string")):
    try:
        # Convert the string to ObjectId for MongoDB query
        object_id = ObjectId(mongo_id)
        
        # Query MongoDB using the ObjectId
        # Pass the collection name 'interview_transcriptions' and the query
        interview = find_one("interview_transcriptions", {"_id": object_id})
        
        if not interview:
            raise HTTPException(status_code=404, detail="Interview not found in MongoDB")
        
        # Convert MongoDB document to JSON-serializable format
        interview_json = json.loads(json_util.dumps(interview))
        return interview_json
        
    except Exception as e:
        # If ObjectId conversion fails or any other error occurs
        raise HTTPException(status_code=500, detail=f"Error retrieving interview: {str(e)}")

# @clientpanel_router.get("/interview/{interview_id}")
# def get_interview(
#     interview_id: str = Path(..., description="Interview ID - string for MongoDB, integer for SQL"),
#     db_type: str = Query("sql", description="Database type: 'sql' or 'mongo'")
# ):
#     if db_type.lower() == "mongo":
#         try:
#             # Convert the string to ObjectId for MongoDB query
#             object_id = ObjectId(interview_id)
            
#             # Query MongoDB using the ObjectId
#             interview = find_one("interview_transcriptions", {"_id": object_id})
            
#             if not interview:
#                 raise HTTPException(status_code=404, detail="Interview not found in MongoDB")
            
#             # Convert MongoDB document to JSON-serializable format
#             return json.loads(json_util.dumps(interview))
            
#         except Exception as e:
#             # If ObjectId conversion fails or any other error occurs
#             raise HTTPException(status_code=500, detail=f"Error retrieving interview: {str(e)}")
#     else:
#         # SQL database lookup
#         try:
#             db_session = next(get_db())
#             # Validate that the ID is an integer
#             try:
#                 int_id = int(interview_id)
#             except ValueError:
#                 raise HTTPException(status_code=400, detail="For SQL database, interview_id must be an integer")
                
#             interview = db_session.query(Interview).filter(Interview.interview_id == int_id).first()
#             if not interview:
#                 raise HTTPException(status_code=404, detail="Interview not found")
#             return interview
#         except Exception as e:
#             if isinstance(e, HTTPException):
#                 raise e
#             raise HTTPException(status_code=500, detail=f"Error retrieving interview: {str(e)}")


@clientpanel_router.get("/success-rate/")
def get_success_rate(db: Session = Depends(get_db)):
    # Get the total number of candidates who scored above 70
    total_high_scorers = (
        db.query(CandidateEvaluation)
        .filter(CandidateEvaluation.score > 70)
        .count()
    )

    # Get the number of high scorers who were hired
    hired_high_scorers = (
        db.query(Candidate)
        .join(CandidateEvaluation, Candidate.candidate_id == CandidateEvaluation.candidate_id)
        .filter(CandidateEvaluation.score > 70, Candidate.status == "Shortlisted")
        .count()
    )

    # Calculate success rate (avoid division by zero)
    success_rate = (hired_high_scorers / total_high_scorers * 100) if total_high_scorers > 0 else 0

    return {"success_rate": f"{success_rate:.2f}%"}



##Interview Tracking 

@clientpanel_router.get("/interviews_by_date")
def get_interviews_by_date(db: Session = Depends(get_db)):
    try:
        current_date = datetime.now()
        print(f"Current date: {current_date}")
        
        interviews = db.query(Interview).all()
        
        upcoming = []
        completed = []
        all_interviews = []
        
        for interview in interviews:
            interview_dict = {
                "id": interview.interview_id,
                "candidate": interview.candidate.name if interview.candidate else "",
                "position": interview.job.title if interview.job else "",
                "date": interview.interview_date.strftime("%Y-%m-%d"),
                "time": interview.interview_date.strftime("%H:%M"),
                "interviewer": interview.user.username if interview.user else "",
                "status": interview.status,
                "currentStage": interview.interview_score or 0,
                "feedback": interview.feedback
            }
            
            all_interviews.append(interview_dict)
            
            print(f"Interview date: {interview.interview_date}, Status: {interview.status}")
            if interview.interview_date > current_date:
                upcoming.append(interview_dict)
            else:
                completed.append(interview_dict)
                
        print(f"Upcoming: {len(upcoming)}, Completed: {len(completed)}")
        return {
            "upcoming": upcoming,
            "completed": completed,
            "all": all_interviews
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching interviews: {str(e)}")

# DECISION SUPPORT 
@clientpanel_router.get("/candidates")
def get_all_candidates(db: Session = Depends(get_db)) -> List[Dict]:
    try:
        candidates = db.query(Candidate).all()
        if not candidates:
            logger.info("No candidates found")
            return []

        result = [
            {
                "candidate_id": cand.candidate_id,
                "name": cand.name,
                "position": db.query(JobDescription).filter(JobDescription.job_id == cand.job_id).first().title if cand.job_id else "Unknown",
                "years_of_experience": cand.years_of_experience,
            }
            for cand in candidates
        ]
        return result
    except Exception as e:
        logger.error(f"Error fetching candidates: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@clientpanel_router.get("/candidate/{candidate_id}")
def get_candidate(candidate_id: int, db: Session = Depends(get_db)) -> Dict:
    try:
        logger.info(f"Fetching data for candidate_id: {candidate_id}")

        # Fetch candidate
        candidate = db.query(Candidate).filter(Candidate.candidate_id == candidate_id).first()
        if not candidate:
            logger.warning(f"Candidate with ID {candidate_id} not found")
            raise HTTPException(status_code=404, detail="Candidate not found")

        # Fetch job
        job = db.query(JobDescription).filter(JobDescription.job_id == candidate.job_id).first()
        if not job:
            logger.warning(f"Job not found for job_id: {candidate.job_id}")
            raise HTTPException(status_code=404, detail="Job not found")

        # Fetch related data
        evaluations = db.query(CandidateEvaluation).filter(CandidateEvaluation.candidate_id == candidate_id).all()
        interviews = db.query(Interview).filter(Interview.candidate_id == candidate_id).all()
        resume_evals = (
            db.query(ResumeEvaluation)
            .join(Resume, ResumeEvaluation.resume_id == Resume.resume_id)
            .join(Candidate, Resume.candidate_id == Candidate.candidate_id)
            .filter(Candidate.candidate_id == candidate_id)
            .all()
        )

        # Calculate total score
        all_scores = [
            score for score in (
                [e.score for e in evaluations if e.score is not None] +
                [i.interview_score for i in interviews if i.interview_score is not None] +
                [r.score for r in resume_evals if r.score is not None]
            )
        ]
        total_score = round(sum(all_scores) / len(all_scores), 2) if all_scores else 0

        # Fetch required skills
        required_skills = db.query(JobRequiredSkills).filter(JobRequiredSkills.job_id == candidate.job_id).all()
        total_skills_weight = sum(rs.importance for rs in required_skills if rs.importance is not None) or 1
        matched_skills_weight = 0

        # Improve job match percentage calculation
        for eval in evaluations:
            if eval.strengths:
                strengths = eval.strengths.lower()
                for rs in required_skills:
                    skill = db.query(Skill).filter(Skill.skill_id == rs.skill_id).first()
                    if skill and skill.skill_name.lower() in strengths:
                        matched_skills_weight += rs.importance if rs.importance is not None else 0
        job_match_percentage = round((matched_skills_weight / total_skills_weight * 100), 2) if total_skills_weight > 0 else 0

        # Improve culture fit and potential score calculation
        culture_fit_score = next(
            (e.score for e in evaluations if e.feedback and "culture" in e.feedback.lower() and e.score is not None),
            0
        )
        potential_score = next(
            (e.score for e in evaluations if e.feedback and "potential" in e.feedback.lower() and e.score is not None),
            0
        )

        # Experience relevance
        experience_relevance = min(
            candidate.years_of_experience * job.experience_score_multiplier if candidate.years_of_experience else 0,
            100
        )

        # Strengths and improvement areas
        strengths = [{"category": "Evaluation", "score": e.score or 0, "details": e.strengths} for e in evaluations if e.strengths]
        improvement_areas = [{"category": "Evaluation", "score": e.score or 0, "details": e.weaknesses} for e in evaluations if e.weaknesses]

        # Core competencies
        core_competencies = [
            {
                "name": skill.skill_name,
                "score": next((e.score for e in evaluations if e.strengths and skill.skill_name.lower() in e.strengths.lower()), 0),
                "benchmark": rs.selection_weight * 100 if rs.selection_weight is not None else job.job_match_benchmark
            }
            for rs in required_skills
            if (skill := db.query(Skill).filter(Skill.skill_id == rs.skill_id).first())
        ]

        # Evaluation details
        evaluation_details = {
            f"interview_{i+1}": {
                "score": interview.interview_score or 0,
                "passed": (interview.interview_score or 0) > job.threshold_score,
                "evaluator": interview.user.username if interview.user else "Unknown",
                "notes": (
                    interview.feedback.get("notes", "No feedback")
                    if isinstance(interview.feedback, dict)
                    else json.loads(interview.feedback).get("notes", "No feedback")
                    if interview.feedback and isinstance(interview.feedback, str)
                    else "No feedback"
                )
            }
            for i, interview in enumerate(interviews)
        }
        for e, eval in enumerate(evaluations):
            evaluation_details[f"evaluation_{e+1}"] = {
                "score": eval.score or 0,
                "passed": (eval.score or 0) > job.threshold_score,
                "evaluator": "System" if eval.evaluation_type == "automated" else "Manual",
                "notes": eval.feedback or "No feedback"
            }

        # Evaluation history
        evaluation_history = [
            {"date": i.interview_date.strftime("%Y-%m-%d"), "stage": "Interview", "score": i.interview_score or 0, "outcome": "Passed" if (i.interview_score or 0) > job.threshold_score else "Failed"}
            for i in interviews
        ] + [
            {"date": e.evaluation_date.strftime("%Y-%m-%d"), "stage": e.evaluation_type.capitalize(), "score": e.score or 0, "outcome": "Passed" if (e.score or 0) > job.threshold_score else "Failed"}
            for e in evaluations
        ]

        # Skill gap analysis
        critical_gaps = [
            skill.skill_name
            for rs in required_skills
            if (skill := db.query(Skill).filter(Skill.skill_id == rs.skill_id).first()) and
            not any(skill.skill_name.lower() in e.strengths.lower() for e in evaluations if e.strengths) and
            rs.importance > job.critical_skill_importance
        ]
        developable_skills = [
            skill.skill_name
            for rs in required_skills
            if (skill := db.query(Skill).filter(Skill.skill_id == rs.skill_id).first()) and
            not any(skill.skill_name.lower() in e.strengths.lower() for e in evaluations if e.strengths) and
            rs.importance <= job.critical_skill_importance
        ]
        gap_percentage = round((len(critical_gaps) + len(developable_skills)) / len(required_skills) * 100, 2) if required_skills else 0

        # Thresholds
        thresholds = {
            "passingScore": job.threshold_score,
            "jobMatchBenchmark": job.job_match_benchmark,
            "highScoreThreshold": job.high_score_threshold,
            "highMatchThreshold": job.high_match_threshold,
            "midScoreThreshold": job.mid_score_threshold,
            "midMatchThreshold": job.mid_match_threshold,
            "criticalSkillImportance": job.critical_skill_importance
        }

        # Improved recommendation logic
        if total_score == job.high_score_threshold and job_match_percentage >= job.high_match_threshold:
            recommendation = {
                "status": "SELECT",
                "message": "Strong candidate",
                "detailedReasoning": f"Total Score: {total_score} >= {job.high_score_threshold}, Job Match: {job_match_percentage}% >= {job.high_match_threshold}%",
                "color": "text-emerald-500"
            }
        elif total_score >= job.mid_score_threshold and job_match_percentage >= job.mid_match_threshold:
            recommendation = {
                "status": "REVIEW",
                "message": "Potential candidate",
                "detailedReasoning": f"Total Score: {total_score} >= {job.mid_score_threshold}, Job Match: {job_match_percentage}% >= {job.mid_match_threshold}%",
                "color": "text-orange-500"
            }
        else:
            recommendation = {
                "status": "REJECT",
                "message": "Does not meet requirements",
                "detailedReasoning": f"Total Score: {total_score} < {job.mid_score_threshold} or Job Match: {job_match_percentage}% < {job.mid_match_threshold}%",
                "color": "text-red-500"
            }

        # Handle certifications
        certifications = (candidate.certifications
            if isinstance(candidate.certifications, list)
            else json.loads(candidate.certifications)
            if candidate.certifications and isinstance(candidate.certifications, str)
            else []
        )

        # Response
        response = {
            "name": candidate.name,
            "position": job.title,
            "yearsOfExperience": candidate.years_of_experience,
            "educationLevel": candidate.education_level,
            "totalScore": total_score,
            "jobMatchPercentage": job_match_percentage,
            "cultureFitScore": culture_fit_score,
            "potentialScore": potential_score,
            "experienceRelevance": experience_relevance,
            "strengths": strengths,
            "improvementAreas": improvement_areas,
            "coreCompetencies": core_competencies,
            "evaluationDetails": evaluation_details,
            "evaluationHistory": evaluation_history,
            "skillGapAnalysis": {"gapPercentage": gap_percentage, "criticalGaps": critical_gaps, "developableSkills": developable_skills},
            "certifications": certifications,
            "salaryExpectation": candidate.salary_expectation,
            "noticePeriod": candidate.notice_period,
            "thresholds": thresholds,
            "recommendation": recommendation
        }
        return response
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    
@clientpanel_router.post("/candidate/{candidate_id}/decision")
def update_candidate_decision(
    candidate_id: int,
    decision_data: Dict = Body(...),
    db: Session = Depends(get_db)
):
    try:
        candidate = db.query(Candidate).filter(Candidate.candidate_id == candidate_id).first()
        if not candidate:
            raise HTTPException(status_code=404, detail="Candidate not found")

        candidate.status = decision_data["decision"]
        candidate.updated_at = datetime.fromisoformat(decision_data["updatedAt"])

        new_evaluation = CandidateEvaluation(
            candidate_id=candidate_id,
            job_id=candidate.job_id,
            score=0,
            feedback=decision_data["feedback"],
            evaluation_type="decision",
            evaluation_date=datetime.utcnow()
        )
        db.add(new_evaluation)
        db.commit()
        db.refresh(candidate)
        return {"message": "Decision updated successfully"}
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating decision: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error updating decision: {str(e)}")    

@clientpanel_router.get("/reports")
def get_reports(db: Session = Depends(get_db)):
    try:
        reports = db.query(Report).all()
        formatted_reports = [
            {
                "id": report.report_id,
                "title": f"{report.report_type} Report",
                "content": report.report_data,
                "author": report.user.username if report.user else "Unknown",
                "date": report.created_at.strftime("%Y-%m-%d"),
                "status": "pending",  # You might want to add a status field to Report model
                "sharedWith": []  # You might want to add a relationship for shared users
            }
            for report in reports
        ]
        return {"reports": formatted_reports}
    except Exception as e:
        logger.error(f"Error fetching reports: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching reports: {str(e)}")

@clientpanel_router.get("/discussions")
def get_discussions(db: Session = Depends(get_db)):
    try:
        discussions = db.query(Discussion).all()
        # Group discussions by topic (assuming message contains the initial topic)
        discussion_dict = {}
        for disc in discussions:
            if disc.discussion_id not in discussion_dict:
                discussion_dict[disc.discussion_id] = {
                    "id": disc.discussion_id,
                    "topic": disc.message[:50] + "..." if len(disc.message) > 50 else disc.message,
                    "participants": {disc.user.username} if disc.user else set(),
                    "messages": [{
                        "sender": disc.user.username if disc.user else "Unknown",
                        "content": disc.message,
                        "timestamp": disc.created_at.isoformat()
                    }],
                    "lastActivity": disc.created_at.isoformat()
                }
            else:
                discussion_dict[disc.discussion_id]["participants"].add(disc.user.username if disc.user else "Unknown")
                discussion_dict[disc.discussion_id]["messages"].append({
                    "sender": disc.user.username if disc.user else "Unknown",
                    "content": disc.message,
                    "timestamp": disc.created_at.isoformat()
                })
                discussion_dict[disc.discussion_id]["lastActivity"] = max(
                    discussion_dict[disc.discussion_id]["lastActivity"],
                    disc.created_at.isoformat()
                )

        formatted_discussions = list(discussion_dict.values())
        for disc in formatted_discussions:
            disc["participants"] = list(disc["participants"])
        return {"discussions": formatted_discussions}
    except Exception as e:
        logger.error(f"Error fetching discussions: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching discussions: {str(e)}")

@clientpanel_router.get("/feedback_history")
def get_feedback_history(db: Session = Depends(get_db)):
    try:
        feedback_items = db.query(UserFeedback).all()
        formatted_feedback = [
            {
                "id": feedback.feedback_id,
                "content": feedback.feedback_text,
                "from": feedback.user.username if feedback.user else "Unknown",
                "to": "All Collaborators",  # Adjust based on your requirements
                "date": feedback.created_at.isoformat(),
                "status": feedback.status.lower()
            }
            for feedback in feedback_items
        ]
        return {"feedbackHistory": formatted_feedback}
    except Exception as e:
        logger.error(f"Error fetching feedback history: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching feedback history: {str(e)}")

# Add POST endpoints for creating new entries
@clientpanel_router.post("/create_discussion")
def create_discussion(
    topic: str = Body(...),
    db: Session = Depends(get_db),
):
    try:
        current_user_id = 1  # Replace with actual user authentication
        new_discussion = Discussion(
            user_id=current_user_id,
            job_id=1,  # Pass this as a parameter if needed
            message=topic
        )
        db.add(new_discussion)
        db.commit()
        db.refresh(new_discussion)
        return {
            "success": True,
            "discussion_id": new_discussion.discussion_id,
            "message": "Discussion created successfully"
        }
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating discussion: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error creating discussion: {str(e)}")

@clientpanel_router.post("/send_message")
def send_message(
    discussionId: int = Body(...),
    content: str = Body(...),
    db: Session = Depends(get_db)
):
    try:
        current_user_id = 1  # Replace with actual user authentication
        new_message = Discussion(
            user_id=current_user_id,
            job_id=1,  # Adjust as needed
            message=content,
            discussion_id=discussionId  # Assumes Discussion model supports parent discussion_id
        )
        db.add(new_message)
        db.commit()
        db.refresh(new_message)
        return {
            "success": True,
            "discussion_id": new_message.discussion_id,
            "message": "Message sent successfully"
        }
    except Exception as e:
        db.rollback()
        logger.error(f"Error sending message: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error sending message: {str(e)}")

@clientpanel_router.post("/send_feedback")
def send_feedback(
    content: str = Body(...),
    db: Session = Depends(get_db)
):
    try:
        current_user_id = 1  # Replace with actual user authentication
        new_feedback = UserFeedback(
            user_id=current_user_id,
            feedback_type="General",
            feedback_text=content,
            status="Pending"
        )
        db.add(new_feedback)
        db.commit()
        db.refresh(new_feedback)
        return {
            "success": True,
            "feedback_id": new_feedback.feedback_id,
            "message": "Feedback sent successfully"
        }
    except Exception as e:
        db.rollback()
        logger.error(f"Error sending feedback: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error sending feedback: {str(e)}")