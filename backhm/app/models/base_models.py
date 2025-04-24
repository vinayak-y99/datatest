from pydantic import BaseModel, EmailStr, ConfigDict
from sqlalchemy import Enum
from typing import List, Dict, Any, Optional, Union
from datetime import datetime


class SkillData(BaseModel):
    importance: float
    selection_score: float
    rejection_score: float
    rating: float

class JobAnalysisResponse(BaseModel):
    roles: List[str]
    skills_data: Dict[str, Any]
    formatted_data: Dict[str, Any]
    selection_threshold: float
    rejection_threshold: float
    status: str
    raw_response: str
    selected_prompts: str
    basic_info: Dict[str, str]
class DashboardResponse(BaseModel):
    status: str
    message: str
    dashboards: List[Dict[str, Any]]
    selection_threshold: float
    rejection_threshold: float
    number_of_dashboards: int

class ErrorResponse(BaseModel):
    status: str
    message: str

class AnalysisResult(BaseModel):
    success: bool
    data: Union[JobAnalysisResponse, ErrorResponse]


# Subscription Models
class SubscriptionPlanCreate(BaseModel):
    plan_name: str
    price_per_interview: float
    max_interviews: int
    activity_type: str

class SubscriptionPlanResponse(SubscriptionPlanCreate):
    plan_id: int

    class Config:
        orm_mode = True

class SubscriptionPlanUpdate(BaseModel):
    plan_name: str | None = None
    price_per_interview: float | None = None
    max_interviews: int | None = None
    activity_type: str | None = None

class PaymentCreate(BaseModel):
    user_id: int
    plan_id: int
    amount_paid: float
    status: str
    activity_type: str

class PaymentResponse(BaseModel):
    payment_id: int
    user_id: int
    plan_id: int
    amount_paid: float
    status: str
    activity_type: str
    payment_date: datetime

    class Config:
        orm_mode = True

class PaymentDetailResponse(PaymentResponse):
    pass  # Add more fields if needed

class PaymentUpdate(BaseModel):
    status: str | None = None
    activity_type: str | None = None

class OrganizationUpdate(BaseModel):
    organization_name: Optional[str]
    email: Optional[str]
    username: Optional[str]
    password: Optional[str]
    industry: Optional[str]
    size: Optional[str]
    description: Optional[str]
    website: Optional[str]
    address: Optional[str]
    city: Optional[str]
    country: Optional[str]
    postal_code: Optional[str]
    tax_id: Optional[str]
    logo: Optional[str]
    additional_information: Optional[str]
    company_email: Optional[str]
    company_phone: Optional[str]
    subscription_plan: Optional[str]
    subscription_duration: Optional[str]
    dbname: Optional[str]
    status: Optional[str]

class OrganizationStatusUpdate(BaseModel):
    active: bool

# User Models
class UserBase(BaseModel):
    """Base schema for user"""

    name: str
    email: str


# User Models
class UserResponse(BaseModel):
    name: str
    email: str
    role_id: Optional[int] = None
    user_id: int
    username: Optional[str] = None
    credentials: Optional[Dict[str, Any]] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True,
        alias_generator=lambda string: string.replace("_", ""),
    )


class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    username: Optional[str] = None
    credentials: Dict[str, Any] = {}
    role_id: Optional[int] = None
    organization_id: Optional[int] = None


class RoleBase(BaseModel):
    """Base schema for role data"""

    role_name: str
    credentials: dict


class RoleCreate(BaseModel):
    name: str
    permissions: Dict[str, Any] = {}


class RoleResponse(BaseModel):
    role_id: int
    role_name: str
    permissions: Dict[str, Any] = {}

    class Config:
        orm_mode = True


# Department Enum
class DepartmentEnum(str, Enum):
    """Enum representing different departments"""

    HR = "HR"
    CLIENT = "CLIENT"
    RECRUITMENT = "RECRUITMENT"
    TECHNICAL = "TECHNICAL"
    ADMIN = "ADMIN"


# Organization Models
class OrganizationBase(BaseModel):
    """Base schema for organization data"""

    organization_name: str
    username: str
    email: str
    password: str


class OrganizationCreate(BaseModel):
    organization_name: str
    email: str
    username: str
    password: str
    industry: Optional[str] = None
    size: Optional[str] = None
    description: Optional[str] = None
    website: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    postal_code: Optional[str] = None
    tax_id: Optional[str] = None
    additional_information: Optional[str] = None
    company_email: Optional[str] = None
    company_phone: Optional[str] = None
    subscription_plan: Optional[str] = None
    subscription_duration: Optional[str] = "Monthly"
    dbname: Optional[str] = None
    status: Optional[str] = "Active"


class OrganizationResponse(OrganizationBase):
    """Schema for organization response data"""

    organization_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class OrganizationUserResponse(BaseModel):
    """Schema for users in an organization"""

    user_id: int
    name: str
    email: str
    username: str
    role_id: int
    role_name: str
    organization_id: int
    organization_name: str

    model_config = ConfigDict(from_attributes=True)
    prompt: Optional[str] = None


# Admin Models
class AdminCreate(BaseModel):
    """Schema for creating a new admin"""

    username: str
    email: EmailStr
    password: str
    mobile: str
    role: str = "ADMIN"  # Default value


class AdminResponse(BaseModel):
    """Schema for admin response data"""

    admin_id: int
    username: str
    email: str
    mobile: str
    department: str
    is_active: bool = True
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Authentication Models
class OTPRequest(BaseModel):
    """Schema for OTP request"""

    email: EmailStr
    mobile: str
    role: Optional[str] = None


class LoginRequest(BaseModel):
    """Schema for login request"""

    email: str
    password: str


class SkillData(BaseModel):
    importance: float
    selection_score: float
    rejection_score: float
    rating: float


class SkillCategory(BaseModel):
    skills: Dict[str, Dict[str, float]]
    achievements: Dict[str, Dict[str, float]]
    activities: Dict[str, Dict[str, float]]


class JobAnalysisResponse(BaseModel):
    roles: List[str]
    skills_data: Dict[str, Any]
    formatted_data: Dict[str, Any]
    selection_threshold: float
    rejection_threshold: float
    status: str
    raw_response: str
    selected_prompts: str
    basic_info: Dict[str, str]
    data: Dict[str, Any]


class DashboardResponse(BaseModel):
    status: str
    message: str
    dashboards: List[Dict[str, Any]]
    selection_threshold: float
    rejection_threshold: float
    number_of_dashboards: int


class ErrorResponse(BaseModel):
    status: str
    message: str


class AnalysisResult(BaseModel):
    success: bool
    data: Union[JobAnalysisResponse, ErrorResponse]


class EvaluationResult(BaseModel):
    technical_score: int
    clarity_score: int
    completeness_score: int
    overall_score: int
    decision: str
    strengths: str
    improvements: str


class AudioTranscription(BaseModel):
    text: str
    clarity: str
    error: Optional[str] = None


class RoleSkills(BaseModel):
    skills: Dict[str, SkillData]


class RecordingRequest(BaseModel):
    source: str = "microphone"


class QAGenerateRequest(BaseModel):
    num_pairs: int
    original_qa: str


class QAEvaluateRequest(BaseModel):
    qa_text: str


class DashboardGenerationRequest(BaseModel):
    scale: int
    dashboard_index: int
    prompt: Optional[str] = None


class FeedbackCreate(BaseModel):
    candidate_id: int
    score: float
    feedback: str


class FeedbackResponse(BaseModel):
    evaluation_id: int
    candidate_id: int
    score: float
    feedback: str
    evaluation_date: datetime


class CandidateEvaluationBase(BaseModel):
    # Add all the fields that your CandidateEvaluation model has
    candidate_id: int
    feedback: str
    # ... other fields ...


class CandidateEvaluationCreate(CandidateEvaluationBase):
    pass


class CandidateEvaluationResponse(CandidateEvaluationBase):
    id: int

    class Config:
        from_attributes = True  # This enables ORM model conversion


class CollaboratorResponse(BaseModel):
    id: Optional[int] = None
    name: str
    email: Optional[str] = None


class QuestionResponseCreate(BaseModel):
    candidateId: int
    question: str
    response: str
    score: Optional[float] = None


class QuestionResponses(BaseModel):
    analytics_id: int
    resume_id: int
    ai_generated_question: str
    answer_text: str
    score: Optional[float] = None
    generated_at: datetime


class QuestionResponseSchema(BaseModel):
    analytics_id: int
    resume_id: int
    ai_generated_question: str
    answer_text: str
    score: Optional[float] = None
    generated_at: datetime

# Define input model for the new endpoint
class JobDetailsInput(BaseModel):
    position_title: str
    location: Optional[str] = None
    position_type: Optional[str] = None
    required_experience: str
    office_timings: Optional[str] = None
    description: str
    requirements: Optional[List[str]] = None
    responsibilities: Optional[List[str]] = None
    qualifications: Optional[List[str]] = None
    skills: Optional[List[str]] = None

class SkillData(BaseModel):
    importance: float
    selection_score: float
    rejection_score: float
    rating: int

class BasicInfo(BaseModel):
    position_title: str
    required_experience: str
    location: Optional[str] = None
    position_type: Optional[str] = None
    office_timings: Optional[str] = None

class QualificationData(BaseModel):
    importance: float
    selection_score: float
    rejection_score: float
    rating: int

class RequirementData(BaseModel):
    importance: float
    selection_score: float
    rejection_score: float
    rating: int


class SkillsData(BaseModel):
    skills: Dict[str, SkillData]
    qualifications: Dict[str, QualificationData]
    requirements: Dict[str, RequirementData]

class JobRequestData(BaseModel):
    roles: List[str]
    skills_data: Dict[str, SkillsData]
    formatted_data: Optional[Dict[str, Any]] = None
    content: str
    selection_threshold: float
    rejection_threshold: float
    basic_info: BasicInfo
    selected_prompts: Optional[str] = None

