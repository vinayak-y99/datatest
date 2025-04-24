from sqlalchemy import Column,Integer,String,ForeignKey,DateTime,Float,Text,Boolean,JSON
from sqlalchemy.orm import relationship, declarative_base
from datetime import datetime
from app.database.connection import engine
from sqlalchemy.orm import registry

mapper_registry = registry()
mapper_registry.configure()
Base = declarative_base()


# --- DashboardContent Table ---
class DashboardContent(Base):
    __tablename__ = 'dashboard_contents'
    
    id = Column(Integer, primary_key=True)
    prompt = Column(String(500))
    text = Column(Text)
    content = Column(Text)
    status = Column(String(50))
    created_at = Column(DateTime, default=datetime.now)

# --- Admins Table (kept separate for enterprise security) ---
class Admin(Base):
    __tablename__ = "admins"
    admin_id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)
    activity_type = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# --- AuditTrail Table ---
class AuditTrail(Base):
    __tablename__ = "audit_trails"
    
    audit_id = Column(Integer, primary_key=True, autoincrement=True)
    organization_id = Column(Integer, ForeignKey("organizations.organization_id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    action = Column(String, nullable=False)
    details = Column(Text, nullable=True)
    activity_type = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="audit_trails")
    organization = relationship("Organization", back_populates="audit_trails")

# --- Organizations Table ---
class Organization(Base):
    __tablename__ = "organizations"
    organization_id = Column(Integer, primary_key=True, autoincrement=True)
    organization_name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    username = Column(String, nullable=False)
    password_hash = Column(String, nullable=False)
    activity_type = Column(String, nullable=True)
    industry = Column(String, nullable=True)
    size = Column(String, nullable=True)
    description = Column(String, nullable=True)
    website = Column(String, nullable=True)
    address = Column(String, nullable=True)
    city = Column(String, nullable=True)
    country = Column(String, nullable=True)
    postal_code = Column(String, nullable=True)
    tax_id = Column(String, nullable=True)
    logo = Column(String, nullable=True)  # Store as base64 string
    additional_information = Column(String, nullable=True)
    company_email = Column(String, nullable=True)
    company_phone = Column(String, nullable=True)
    plan_from = Column(DateTime, nullable=True)
    plan_to = Column(DateTime, nullable=True)
    dbname = Column(String, nullable=True)
    status = Column(String, nullable=True)
    subscription_plan = Column(String, nullable=True)
    payment_status = Column(String, default="Pending")
    subscription_duration = Column(String, default="Monthly")
    renewal_date = Column(DateTime, nullable=True)
    active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    audit_trails = relationship("AuditTrail", back_populates="organization")

# --- ATS Integration Table (kept separate for enterprise integration) ---
class ATSIntegration(Base):
    __tablename__ = "ats_integration"
    integration_id = Column(Integer, primary_key=True, autoincrement=True)
    organization_id = Column(Integer, ForeignKey("organizations.organization_id"))
    organization_name = Column(String, nullable=False)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    job_descriptions = Column(JSON, nullable=False)
    resumes = Column(JSON, nullable=False)
    activity_type = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    organization = relationship("Organization")
    user = relationship("User")

# --- Roles Table ---
class Role(Base):
    __tablename__ = "roles"
    role_id = Column(Integer, primary_key=True, autoincrement=True)
    role_name = Column(String, nullable=False)
    activity_type = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# --- Role Permissions Table (kept separate for enterprise access control) ---
class RolePermission(Base):
    __tablename__ = "role_permissions"
    role_permission_id = Column(Integer, primary_key=True, autoincrement=True)
    role_id = Column(Integer, ForeignKey("roles.role_id"), nullable=False)
    permission_name = Column(String, nullable=False)
    activity_type = Column(String, nullable=True)

    role = relationship("Role")

# --- Users Table ---
class User(Base):
    __tablename__ = "users"
    user_id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    username = Column(String, nullable=False)
    role = Column(String, nullable=False)
    role_id = Column(Integer, ForeignKey("roles.role_id"))
    organization_id = Column(Integer, ForeignKey("organizations.organization_id"))
    activity_type = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    role_relation = relationship("Role")
    organization = relationship("Organization")
    job_assignments = relationship("JobRecruiterAssignment", back_populates="user")
    audit_trails = relationship("AuditTrail", back_populates="user")

# --- Subscription Plans Table ---
class SubscriptionPlan(Base):
    __tablename__ = "subscription_plans"
    plan_id = Column(Integer, primary_key=True, autoincrement=True)
    plan_name = Column(String, nullable=False)
    price_per_interview = Column(Float, nullable=False)
    max_interviews = Column(Integer, nullable=False)
    activity_type = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

# --- Payments Table ---
class Payment(Base):
    __tablename__ = "payments"
    payment_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    plan_id = Column(Integer, ForeignKey("subscription_plans.plan_id"), nullable=False)
    payment_date = Column(DateTime, default=datetime.utcnow)
    amount_paid = Column(Float, nullable=False)
    status = Column(String(20), nullable=False)
    activity_type = Column(String, nullable=True)

    user = relationship("User")
    plan = relationship("SubscriptionPlan")

# --- Job Descriptions Table ---
class JobDescription(Base):
    __tablename__ = "job_descriptions"
    job_id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String, nullable=True)
    description = Column(Text, nullable=False)
    raw_text = Column(Text, nullable=True)
    source_file = Column(String, nullable=True)
    keywords = Column(Text, nullable=True)
    status = Column(String, nullable=True)
    department = Column(String, nullable=True)
    required_skills = Column(Text, nullable=True)
    experience_level = Column(String, nullable=True)
    education_requirements = Column(String, nullable=True)
    threshold_score = Column(Float, nullable=False)
    activity_type = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # New columns for evaluation thresholds (no defaults, required)
    job_match_benchmark = Column(Float, nullable=True)  # Baseline job match percentage
    high_score_threshold = Column(Float, nullable=True)  # Threshold for "SELECT"
    high_match_threshold = Column(Float, nullable=True)  # Job match for "SELECT"
    mid_score_threshold = Column(Float, nullable=True)  # Threshold for "REVIEW"
    mid_match_threshold = Column(Float, nullable=True)  # Job match for "REVIEW"
    critical_skill_importance = Column(Float, nullable=True)  # Importance level for critical skills
    experience_score_multiplier = Column(Float, nullable=True)  # Multiplier for experience relevance
    
    # Relationships
    recordings = relationship("Recording", back_populates="job_description")
    required_skills_relation = relationship("JobRequiredSkills", back_populates="job_description")
    candidates = relationship("Candidate", back_populates="job_description")
    recruiter_assignment = relationship("JobRecruiterAssignment", back_populates="job_description", uselist=False)

# --- Job Recruiter Assignments Table ---
class JobRecruiterAssignment(Base):
    __tablename__ = "job_recruiter_assignments"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    job_id = Column(Integer, ForeignKey("job_descriptions.job_id"), nullable=False, unique=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    assigned_date = Column(DateTime, nullable=False, default=datetime.utcnow)
    
    # Relationships
    job_description = relationship("JobDescription", back_populates="recruiter_assignment")
    user = relationship("User", back_populates="job_assignments")

# --- Job Required Skills Table ---
class JobRequiredSkills(Base):
    __tablename__ = "job_required_skills"
    id = Column(Integer, primary_key=True)
    job_id = Column(Integer, ForeignKey("job_descriptions.job_id"))
    skill_id = Column(Integer, ForeignKey("skills.skill_id"))
    importance = Column(Float, nullable=True)
    selection_weight = Column(Float, nullable=True)
    rejection_weight = Column(Float, nullable=True)
    activity_type = Column(String, nullable=True)

    job_description = relationship("JobDescription", back_populates="required_skills_relation")
    skill = relationship("Skill")

# --- Skills Table (kept separate for enterprise skill management) ---
class Skill(Base):
    __tablename__ = "skills"
    skill_id = Column(Integer, primary_key=True, autoincrement=True)
    skill_name = Column(String, unique=True, nullable=False)
    skill_type = Column(String, nullable=True)  # Technical, Soft, Domain
    activity_type = Column(String, nullable=True)

# --- Candidates Table ---
class Candidate(Base):
    __tablename__ = "candidates"
    candidate_id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    resume_url = Column(String, nullable=False)
    job_id = Column(Integer, ForeignKey("job_descriptions.job_id"))
    status = Column(String(20), nullable=False)
    activity_type = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Added fields
    years_of_experience = Column(Integer, nullable=True)  # For yearsOfExperience
    education_level = Column(String, nullable=True)  # For educationLevel
    certifications = Column(JSON, nullable=True)  # For certifications (list of strings)
    salary_expectation = Column(String, nullable=True)  # For salaryExpectation
    notice_period = Column(String, nullable=True)  # For noticePeriod

    job_description = relationship("JobDescription", back_populates="candidates")
    resumes = relationship("Resume", back_populates="candidate")

# --- Candidate Evaluations Table ---
class CandidateEvaluation(Base):
    __tablename__ = "candidate_evaluations"
    evaluation_id = Column(Integer, primary_key=True, autoincrement=True)
    candidate_id = Column(Integer, ForeignKey("candidates.candidate_id"), nullable=False)
    job_id = Column(Integer, ForeignKey("job_descriptions.job_id"), nullable=False)
    interview_id = Column(Integer, ForeignKey("interviews.interview_id"), nullable=True)
    score = Column(Float, nullable=False)
    feedback = Column(Text, nullable=True)
    strengths = Column(Text, nullable=True)
    weaknesses = Column(Text, nullable=True)
    recommendation = Column(String, nullable=True)
    evaluation_type = Column(String, nullable=False, default="automated")
    activity_type = Column(String, nullable=True)
    evaluation_date = Column(DateTime, default=datetime.utcnow)

    candidate = relationship("Candidate")
    job = relationship("JobDescription")
    interview = relationship("Interview")

# --- Collaborators Table ---
class Collaborators(Base):
    __tablename__ = "collaborators"
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    evaluation_id = Column(Integer, ForeignKey("candidate_evaluations.evaluation_id"), nullable=False)
    role = Column(String, nullable=False)
    activity_type = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")
    evaluation = relationship("CandidateEvaluation")

# --- Interviews Table ---
class Interview(Base):
    __tablename__ = "interviews"
    interview_id = Column(Integer, primary_key=True, autoincrement=True)
    candidate_id = Column(Integer, ForeignKey("candidates.candidate_id"), nullable=False)
    job_id = Column(Integer, ForeignKey("job_descriptions.job_id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    interview_score = Column(Integer, nullable=False)
    interview_date = Column(DateTime, nullable=False)
    feedback = Column(JSON, nullable=True)
    status = Column(String(20), nullable=False, default="Scheduled")
    activity_type = Column(String, nullable=True)

    candidate = relationship("Candidate")
    job = relationship("JobDescription")
    user = relationship("User")

# --- Reports Table (kept separate for enterprise reporting) ---
class Report(Base):
    __tablename__ = "reports"
    report_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    report_type = Column(String, nullable=False)
    report_data = Column(Text, nullable=False)
    activity_type = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")

# --- Notifications Table ---
class NotificationandAllerts(Base):
    __tablename__ = "notifications_and_alerts"
    notification_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    message = Column(String, nullable=False)
    read_status = Column(Boolean, default=False)
    activity_type = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")

# --- Discussions Table ---
class Discussion(Base):
    __tablename__ = "discussions"
    discussion_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    job_id = Column(Integer, ForeignKey("job_descriptions.job_id"), nullable=False)
    message = Column(Text, nullable=False)
    activity_type = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")
    job = relationship("JobDescription")

# --- Resumes Table ---
class Resume(Base):
    __tablename__ = "resumes"
    resume_id = Column(Integer, primary_key=True)
    job_id = Column(Integer, ForeignKey("job_descriptions.job_id"))
    candidate_id = Column(Integer, ForeignKey("candidates.candidate_id"), unique = True)
    resume_url = Column(String, nullable=False)
    upload_date = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    version = Column(Integer, nullable=False, default=1)
    parsed_data = Column(Text, nullable=True)
    activity_type = Column(String, nullable=True)

    # Relationships
    candidate = relationship("Candidate", back_populates="resumes")
    recordings = relationship("Recording", back_populates="resume")
    evaluations = relationship("ResumeEvaluation", back_populates="resume")
    analytics = relationship("ResumeAnalytics", back_populates="resume", cascade="all, delete-orphan", lazy="joined")

# --- Resume Evaluation Table ---
class ResumeEvaluation(Base):
    __tablename__ = "resume_evaluations"
    evaluation_id = Column(Integer, primary_key=True)
    resume_id = Column(Integer, ForeignKey("resumes.resume_id"))
    evaluator_id = Column(Integer, ForeignKey("users.user_id"), nullable=True)
    score = Column(Float, nullable=True)
    strengths = Column(Text, nullable=True)
    weaknesses = Column(Text, nullable=True)
    feedback = Column(Text, nullable=True)
    evaluation_type = Column(String, nullable=False, default="automated")
    activity_type = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    resume = relationship("Resume", back_populates="evaluations")
    evaluator = relationship("User", foreign_keys=[evaluator_id])

# --- Resume Analytics Table (kept separate for enterprise analytics) ---
class ResumeAnalytics(Base):
    __tablename__ = "resume_analytics"
    analytics_id = Column(Integer, primary_key=True, autoincrement=True)
    resume_id = Column(Integer, ForeignKey("resumes.resume_id"), nullable=False)
    ai_generated_question = Column(String, nullable=False)
    answer_text = Column(Text, nullable=True)
    score = Column(Float, nullable=True)
    strengths = Column(Text, nullable=True)
    weaknesses = Column(Text, nullable=True)
    insights = Column(Text, nullable=True)
    activity_type = Column(String, nullable=True)
    generated_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    resume = relationship("Resume", back_populates="analytics")

# --- Threshold Scores Table ---
class ThresholdScore(Base):
    __tablename__ = "threshold_scores"
    threshold_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=True)
    job_id = Column(Integer, ForeignKey("job_descriptions.job_id"), nullable=True)
    selection_score = Column(Float, nullable=False)
    rejection_score = Column(Float, nullable=False)
    threshold_value = Column(Float, nullable=False)
    threshold_result = Column(JSON, nullable=True)
    threshold_prompts = Column(Text, nullable=True)
    custom_prompts = Column(Text, nullable=True)
    sample_prompts_history = Column(Text, nullable=True)
    activity_type = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    threshold_history = Column(JSON, nullable=True)

    job = relationship("JobDescription", foreign_keys=[job_id])
    user = relationship("User", foreign_keys=[user_id])

# --- User Feedback Table ---
class UserFeedback(Base):
    __tablename__ = "user_feedback"
    feedback_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    feedback_type = Column(String, nullable=False)  # Bug, Feature Request, General
    feedback_text = Column(Text, nullable=False)
    rating = Column(Integer, nullable=True)  # 1-5 star rating
    status = Column(String, nullable=False, default="Pending")  # Pending, In Progress, Resolved
    activity_type = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User")

# --- Recordings Table ---
class Recording(Base):
    __tablename__ = "recordings"
    recording_id = Column(Integer, primary_key=True)
    resume_id = Column(Integer, ForeignKey("resumes.resume_id"))
    jd_id = Column(Integer, ForeignKey("job_descriptions.job_id"), nullable=True)
    speaker_type = Column(String, nullable=False)
    transcript_text = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    resume = relationship("Resume", back_populates="recordings")
    job_description = relationship("JobDescription", back_populates="recordings")

#--- Question Responses Table for canditates ---
class QuestionResponses(Base):
    __tablename__ = "question_responses"
    id = Column(Integer, primary_key=True, autoincrement=True)
    candidate_id = Column(Integer, ForeignKey("candidates.candidate_id"), nullable=False)
    question = Column(String, nullable=False)
    response = Column(Text, nullable=False)
    score = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationship
    candidate = relationship("Candidate")


# Create all tables in the database
Base.metadata.create_all(bind=engine)
