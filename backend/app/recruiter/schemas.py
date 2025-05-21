from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List, Dict, Any, Union
from enum import Enum
from pydantic import validator

class InterviewStatus(str, Enum):
    SCHEDULED = "scheduled"
    COMPLETED = "completed"
    ON_HOLD = "on_hold"
    CANCELLED = "cancelled"
    IN_PROGRESS = "in_progress"

class CandidateBase(BaseModel):
    name: str
    email: str
    resume_url: str
    job_id: int

class CandidateCreate(CandidateBase):
    pass

class Candidate(CandidateBase):
    candidate_id: int
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class InterviewBase(BaseModel):
    candidate_id: int
    job_id: int
    interviewer_id: int  # maps to user_id in Interview model
    scheduled_time: datetime  # maps to interview_date in Interview model

class InterviewCreate(InterviewBase):
    status: Optional[InterviewStatus] = InterviewStatus.SCHEDULED
    notes: Optional[str] = None

class Interview(InterviewBase):
    interview_id: int
    status: InterviewStatus
    interview_score: Optional[float] = 0
    feedback: Optional[Dict[str, Any]] = Field(default_factory=dict)
    notes: Optional[str] = None

    class Config:
        from_attributes = True

class CollaboratorBase(BaseModel):
    user_id: int
    evaluation_id: int
    role: str

class Collaborator(CollaboratorBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class SkillAssessmentBase(BaseModel):
    candidate_id: int
    job_id: int
    score: float
    feedback: Optional[Union[str, Dict[str, Any]]] = None
    strengths: Optional[str]
    weaknesses: Optional[str]

    @validator('feedback')
    def validate_feedback(cls, v):
        if isinstance(v, str):
            return {"text": v}
        return v

class SkillAssessmentCreate(SkillAssessmentBase):
    pass

class SkillAssessment(SkillAssessmentBase):
    evaluation_id: int
    evaluation_type: str
    evaluation_date: datetime

    class Config:
        from_attributes = True

class EvaluationStats(BaseModel):
    total_evaluations: int
    average_score: float
    evaluation_breakdown: Dict[str, int]

class Configuration(BaseModel):
    filterOptions: Dict[str, List[str]]
    searchConfig: Dict[str, Any]
    chartConfig: Dict[str, bool]

class CandidateDecisionCreate(BaseModel):
    candidate_id: int
    job_id: int
    decision: str  # 'Selected', 'Rejected', 'Hold'
    reason: Optional[str] = None

class CandidateDecision(BaseModel):
    candidate_id: int
    job_id: int
    decision: str
    reason: Optional[str]
    status: str
    decision_date: datetime

    class Config:
        from_attributes = True

class DecisionMakingResponse(BaseModel):
    candidate: Dict[str, Any]
    similar_candidates: List[Dict[str, Any]]
    team_members: List[Dict[str, Any]]
    consistency_metrics: Dict[str, Any]
    historical_performance: Dict[str, Any]
    risk_metrics: Dict[str, Any]

class DecisionAnalytics(BaseModel):
    totalInterviews: int
    selected: int
    rejected: int
    hold: int

class CandidateStatusUpdate(BaseModel):
    candidateId: int
    action: str  # 'select', 'reject', or 'hold'

    @validator('action')
    def validate_action(cls, v):
        valid_actions = {'select', 'reject', 'hold'}
        if v.lower() not in valid_actions:
            raise ValueError(f'Invalid action. Must be one of: {", ".join(valid_actions)}')
        return v.lower()

    class Config:
        from_attributes = True