from pydantic import BaseModel
from typing import Optional, List, Dict, Any, Union, Literal
from datetime import date

class RoleResponse(BaseModel):
    id: int
    title: str
    assignedTo: str
    department: Optional[str] = None
    status: str
    dateAssigned: Optional[str] = None
    
    class Config:
        from_attributes = True  

class RoleCreate(BaseModel):
    title: str
    assignedTo: str
    department: Optional[str] = None
    status: Literal['Open', 'Filled', 'Closed'] = 'Open'  

    class Config:
        from_attributes = True

class InterviewResponse(BaseModel):
    id: int
    candidate: str
    interviewDate: Optional[str] = None
    role: str
    interviewer: str
    status: str
    
    class Config:
        from_attributes = True

class InterviewCreate(BaseModel):
    candidate: str
    interviewDate: Optional[str] = None
    role: str
    interviewer: str
    candidateEmail: Optional[str] = None
    status: Literal['Scheduled', 'Completed', 'Cancelled'] = 'Scheduled'

    class Config:
        from_attributes = True

class TeamMemberResponse(BaseModel):
    id: int
    name: str
    role: str
    available: bool
    
    class Config:
        from_attributes = True

class TeamMemberUpdate(BaseModel):
    available: bool

    class Config:
        from_attributes = True

class AssignmentHistoryResponse(BaseModel):
    id: int
    role: str
    assignedTo: str
    date: str
    
    class Config:
        from_attributes = True

class FeedbackItem(BaseModel):
    interviewer: str
    notes: str

class SalaryInfo(BaseModel):
    current: str
    expected: str

class OfferInfo(BaseModel):
    status: str
    amount: str
    benefits: str

class CandidateResponse(BaseModel):
    id: int
    name: str
    position: str
    status: str
    score: Optional[float] = None

    class Config:
        from_attributes = True 

class EvaluationResponse(BaseModel):
    id: int
    candidateId: int
    interviewerId: int
    interviewerName: str
    interviewerRole: str
    score: float
    feedback: str
    timestamp: str
    
    class Config:
        from_attributes = True

class DiscussionResponse(BaseModel):
    id: int
    candidateId: int
    userId: int
    userName: str
    message: str
    timestamp: str
    
    class Config:
        from_attributes = True

class DiscussionCreate(BaseModel):
    candidateId: int
    userId: int
    message: str
    
    class Config:
        from_attributes = True

class EvaluationCreate(BaseModel):
    interviewerId: int
    interviewId: Optional[int] = None
    score: float
    feedback: str
    strengths: Optional[str] = None
    weaknesses: Optional[str] = None
    recommendation: Optional[str] = None
