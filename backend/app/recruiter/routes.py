from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from pydantic import BaseModel, Field

from ..database.connection import get_db
from ..models.base import User, Interview
from . import services
from . import schemas
from . import recruiter_router

@recruiter_router.get("/skills-assessment", response_model=Dict[str, List[Dict[str, Any]]])
async def get_skills_assessment(
    candidate_id: int = Query(None),
    db: Session = Depends(get_db)
):
    """Get skills assessment for a candidate or all candidates"""
    return await services.get_skills_assessment(db, candidate_id)

@recruiter_router.get("/collaborators", response_model=List[Dict[str, Any]])
async def get_collaborators(db: Session = Depends(get_db)):
    """Get all collaborators"""
    return await services.get_collaborators(db)

@recruiter_router.get("/scheduled-interviews", response_model=List[Dict[str, Any]])
async def get_scheduled_interviews(
    status: str = Query(None),
    from_date: datetime = Query(None),
    to_date: datetime = Query(None),
    db: Session = Depends(get_db)
):
    """Get scheduled interviews with optional filters"""
    return await services.get_scheduled_interviews(db, status, from_date, to_date)

@recruiter_router.get("/evaluation-stats", response_model=Dict[str, Dict[str, str]])
async def get_evaluation_stats(db: Session = Depends(get_db)):
    """Get evaluation statistics"""
    return await services.get_evaluation_stats(db)

@recruiter_router.get("/configurations", response_model=schemas.Configuration)
async def get_configurations():
    """Get application configurations"""
    return {
        "filterOptions": {
            "status": ["All", "Confirmed", "Pending"],
            "skills": ["All", "React", "TypeScript", "Next.js", "Docker", "Kubernetes", "AWS"],
            "experience": ["All", "0-2 years", "2-5 years", "5+ years"]
        },
        "searchConfig": {
            "placeholder": "Search candidates...",
            "filters": True,
            "sorting": True
        },
        "chartConfig": {
            "showLegend": True,
            "enableAnimation": True,
            "responsiveness": True,
            "tooltips": True
        }
    }

@recruiter_router.post("/schedule-interview", response_model=schemas.Interview)
async def schedule_interview(
    interview: schemas.InterviewCreate,
    db: Session = Depends(get_db)
):
    """Schedule a new interview"""
    return await services.create_interview(db, interview)

@recruiter_router.post("/candidates", response_model=schemas.Candidate)
async def create_candidate(
    candidate: schemas.CandidateCreate,
    db: Session = Depends(get_db)
):
    """Create a new candidate"""
    return await services.create_candidate(db, candidate)

@recruiter_router.get("/candidates", response_model=List[schemas.Candidate])
async def get_candidates(
    search: str = Query(None),
    status: str = Query(None),
    db: Session = Depends(get_db)
):
    """Get all candidates with optional filters"""
    return await services.get_candidates(db, search, status)

@recruiter_router.post("/skill-assessments", response_model=schemas.SkillAssessment)
async def create_skill_assessment(
    assessment: schemas.SkillAssessmentCreate,
    db: Session = Depends(get_db)
):
    """Create a new skill assessment"""
    return await services.create_skill_assessment(db, assessment)

@recruiter_router.patch("/interviews/{interview_id}/status", response_model=schemas.Interview)
async def update_interview_status(
    interview_id: int,
    status: schemas.InterviewStatus,
    db: Session = Depends(get_db)
):
    """Update interview status"""
    interview = db.query(Interview).filter(Interview.interview_id == interview_id).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
    
    interview.status = status.value
    db.commit()
    db.refresh(interview)
    
    return schemas.Interview(
        interview_id=interview.interview_id,
        candidate_id=interview.candidate_id,
        job_id=interview.job_id,
        interviewer_id=interview.user_id,
        scheduled_time=interview.interview_date,
        status=interview.status,
        interview_score=interview.interview_score,
        feedback=interview.feedback or {},
        notes=None  # Set notes to None until migration is done
    )

class CriteriaScore(BaseModel):
    technical_depth: Optional[float] = Field(None, alias="Technical depth")
    real_world_examples: Optional[float] = Field(None, alias="Real-world examples")
    best_practices: Optional[float] = Field(None, alias="Best practices")
    architecture_knowledge: Optional[float] = Field(None, alias="Architecture knowledge")
    state_patterns: Optional[float] = Field(None, alias="State patterns")
    performance_considerations: Optional[float] = Field(None, alias="Performance considerations")
    problem_solving: Optional[float] = Field(None, alias="Problem-solving")
    debugging_approach: Optional[float] = Field(None, alias="Debugging approach")
    solution_implementation: Optional[float] = Field(None, alias="Solution implementation")

    class Config:
        allow_population_by_field_name = True

class Question(BaseModel):
    id: int
    weightage: float
    criteriaScores: Dict[str, float]
    text: Optional[str] = None
    criteria: Optional[List[str]] = None
    category: Optional[str] = None
    avgScore: Optional[float] = None

class EvaluationData(BaseModel):
    questions: List[Question]
    strengths: List[str]
    improvements: Optional[List[str]] = Field(default_factory=list)
    recommendation: Optional[str] = None
    overall_score: Optional[float] = None

@recruiter_router.post("/interviews/{interview_id}/evaluation", response_model=schemas.Interview)
async def update_interview_evaluation_scores(
    interview_id: int,
    evaluation_data: EvaluationData,
    db: Session = Depends(get_db)
):
    """Update interview evaluation scores and feedback"""
    return await services.update_interview_evaluation(db, interview_id, evaluation_data.dict())

@recruiter_router.get("/decision-making/{candidate_id}/{job_id}", response_model=schemas.DecisionMakingResponse)
async def get_decision_making_data(
    candidate_id: int,
    job_id: int,
    db: Session = Depends(get_db)
):
    """Get all data needed for decision making page"""
    return await services.get_decision_making_data(db, candidate_id, job_id)

@recruiter_router.post("/candidate-decisions", response_model=schemas.CandidateDecision)
async def create_candidate_decision(
    decision: schemas.CandidateDecisionCreate,
    db: Session = Depends(get_db)
):
    """Create a decision record for a candidate"""
    # Using a fixed user_id=1 for development
    return await services.make_candidate_decision(db, decision, user_id=1)

@recruiter_router.get("/decision-analytics", response_model=schemas.DecisionAnalytics)
async def get_decision_analytics(db: Session = Depends(get_db)):
    """Get decision analytics data"""
    return await services.get_decision_analytics(db)

@recruiter_router.post("/candidates/status", response_model=Dict[str, Any])
async def update_candidate_status_post(
    status_update: schemas.CandidateStatusUpdate,
    db: Session = Depends(get_db)
):
    """Update candidate status based on action (POST method)"""
    return await services.update_candidate_status(db, status_update)

@recruiter_router.put("/candidates/status", response_model=Dict[str, Any])
async def update_candidate_status_put(
    status_update: schemas.CandidateStatusUpdate,
    db: Session = Depends(get_db)
):
    """Update candidate status based on action (PUT method)"""
    return await services.update_candidate_status(db, status_update) 