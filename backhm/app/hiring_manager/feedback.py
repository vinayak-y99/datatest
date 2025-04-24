from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel, validator
from datetime import datetime
from typing import List, Optional, Dict
from app.database.connection import get_db
from app.models.base import JobDescription, UserFeedback, User

# Define Pydantic models
class FeedbackCreate(BaseModel):
    feedback_type: str
    feedback_text: str
    rating: Optional[int] = None

    @validator("feedback_type")
    def validate_feedback_type(cls, v):
        valid_types = {"Bug", "Feature Request", "General"}
        if v not in valid_types:
            raise ValueError(f"Feedback type must be one of: {', '.join(valid_types)}")
        return v

    @validator("feedback_text")
    def validate_feedback_text(cls, v):
        if not v or len(v.strip()) == 0:
            raise ValueError("Feedback text cannot be empty")
        return v

    @validator("rating")
    def validate_rating(cls, v):
        if v is not None and not (1 <= v <= 5):
            raise ValueError("Rating must be between 1 and 5")
        return v

class FeedbackUpdate(BaseModel):
    status: str

    @validator("status")
    def validate_status(cls, v):
        valid_statuses = {"Pending", "In Progress", "Resolved"}
        if v not in valid_statuses:
            raise ValueError(f"Status must be one of: {', '.join(valid_statuses)}")
        return v

class FeedbackResponse(BaseModel):
    feedback_id: int
    user_id: int
    feedback_type: str
    feedback_text: str
    rating: Optional[int] = None
    status: str = "Pending"
    created_at: datetime

    class Config:
        from_attributes = True

# Router with tags
feedback_router = APIRouter()

# Reusable Utility Functions
def fetch_job_description_titles(db: Session) -> List[str]:
    job_descriptions = db.query(JobDescription.title)\
                        .filter(JobDescription.status == 'active')\
                        .order_by(JobDescription.title)\
                        .all()
    
    print(f"Found {len(job_descriptions)} job descriptions")
    return [jd[0] for jd in job_descriptions]

async def fetch_user_by_id(db: Session, user_id: int) -> User:
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail=f"User with ID {user_id} not found")
    return user

async def fetch_feedback_by_id(db: Session, feedback_id: int) -> UserFeedback:
    feedback = db.query(UserFeedback).filter(UserFeedback.feedback_id == feedback_id).first()
    if not feedback:
        raise HTTPException(status_code=404, detail=f"Feedback with ID {feedback_id} not found")
    return feedback

async def fetch_feedback_by_user(db: Session, user_id: int) -> List[UserFeedback]:
    return db.query(UserFeedback)\
             .filter(UserFeedback.user_id == user_id)\
             .order_by(UserFeedback.created_at.desc())\
             .all()

async def create_feedback_entry(db: Session, feedback: FeedbackCreate, user_id: int) -> UserFeedback:
    feedback_status = feedback.status if feedback.status else "Pending"
    new_feedback = UserFeedback(
        user_id=user_id,
        feedback_type=feedback.feedback_type,
        feedback_text=feedback.feedback_text,
        rating=feedback.rating,
        status=feedback_status,
        activity_type="feedback_submission",
        created_at=datetime.utcnow()
    )
    db.add(new_feedback)
    db.commit()
    db.refresh(new_feedback)
    return new_feedback

async def update_feedback_status(db: Session, feedback_id: int, status: str) -> UserFeedback:
    feedback = await fetch_feedback_by_id(db, feedback_id)
    feedback.status = status
    feedback.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(feedback)
    return feedback

async def get_feedback_summary_data(db: Session) -> Dict:
    feedback_by_type = dict(db.query(UserFeedback.feedback_type, func.count(UserFeedback.feedback_id))
                            .group_by(UserFeedback.feedback_type).all())
    feedback_by_status = dict(db.query(UserFeedback.status, func.count(UserFeedback.feedback_id))
                              .group_by(UserFeedback.status).all())
    avg_rating = db.query(func.avg(UserFeedback.rating))\
                   .filter(UserFeedback.rating.isnot(None))\
                   .scalar()
    total_feedback = db.query(UserFeedback).count()

    return {
        "total_feedback": total_feedback,
        "feedback_by_type": feedback_by_type,
        "feedback_by_status": feedback_by_status,
        "average_rating": float(avg_rating) if avg_rating else None
    }

# Endpoints
@feedback_router.get("/job-descriptions-feedback")
def get_jd_names_feedback_endpoint(db: Session = Depends(get_db)):
    titles = fetch_job_description_titles(db)
    if not titles:
        all_job_descriptions = db.query(JobDescription.title).all()
        print(f"Total job descriptions (any status): {len(all_job_descriptions)}")
        if all_job_descriptions:
            return [jd[0] for jd in all_job_descriptions]
        return ["No active job descriptions found"]
    
    return titles

@feedback_router.post("/user-feedback", response_model=FeedbackResponse, status_code=status.HTTP_201_CREATED)
async def create_user_feedback(feedback: FeedbackCreate, user_id: int, db: Session = Depends(get_db)):
    try:
        await fetch_user_by_id(db, user_id)
        new_feedback = await create_feedback_entry(db, feedback, user_id)
        return FeedbackResponse.from_orm(new_feedback)
    except HTTPException as e:
        raise e
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

@feedback_router.get("/api/user-feedback/{user_id}", response_model=List[FeedbackResponse])
async def get_user_feedback(user_id: int, db: Session = Depends(get_db)):
    try:
        await fetch_user_by_id(db, user_id)  # Validate user exists
        feedback_entries = await fetch_feedback_by_user(db, user_id)
        return [FeedbackResponse.from_orm(entry) for entry in feedback_entries]
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

@feedback_router.put("/api/user-feedback/{feedback_id}", response_model=FeedbackResponse)
async def update_feedback_status_endpoint(feedback_id: int, feedback_update: FeedbackUpdate, db: Session = Depends(get_db)):
    try:
        updated_feedback = await update_feedback_status(db, feedback_id, feedback_update.status)
        return FeedbackResponse.from_orm(updated_feedback)
    except HTTPException as e:
        raise e
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

@feedback_router.get("/api/feedback-summary", response_model=Dict)
async def get_feedback_summary(db: Session = Depends(get_db)):
    try:
        return await get_feedback_summary_data(db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
