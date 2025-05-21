from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from fastapi import HTTPException
import json

from ..models.base import (
    Candidate,
    Interview,
    CandidateEvaluation,
    Collaborators,
    Skill,
    User,
    JobDescription,
    JobRequiredSkills,
)
from . import schemas

async def get_skills_assessment(db: Session, candidate_id: Optional[int] = None) -> Dict[str, List[Dict[str, Any]]]:
    """Get skills assessment for a candidate or all candidates"""
    try:
        # First check if the candidate exists
        if candidate_id:
            candidate = db.query(Candidate).filter(Candidate.candidate_id == candidate_id).first()
            if not candidate:
                print(f"Candidate {candidate_id} not found")
                raise HTTPException(status_code=404, detail="Candidate not found")
            print(f"Found candidate: {candidate.name}")

        # Get interviews for the candidate
        query = db.query(Interview).filter(
            Interview.status.ilike("completed") | Interview.status.ilike("in_progress")
        )
        
        if candidate_id:
            query = query.filter(Interview.candidate_id == candidate_id)
            
        interviews = query.all()
        print(f"Found {len(interviews)} interviews for candidate_id {candidate_id}")
        
        if not interviews:
            print("No interviews found, returning default structure")
            # Return default structure with 0 scores if no interviews found
            return {
                "skills_assessment": [
                    {"name": "Technical Skills", "score": 0},
                    {"name": "Communication", "score": 0},
                    {"name": "Problem Solving", "score": 0},
                    {"name": "Team Collaboration", "score": 0}
                ],
                "skills_distribution": [
                    {"name": "Technical Skills", "value": 0},
                    {"name": "Communication", "value": 0},
                    {"name": "Problem Solving", "value": 0},
                    {"name": "Team Collaboration", "value": 0}
                ],
                "competency_overview": [
                    {"name": "Technical Skills", "score": 0},
                    {"name": "Communication", "score": 0},
                    {"name": "Problem Solving", "score": 0},
                    {"name": "Team Collaboration", "score": 0}
                ]
            }
        
        # Initialize skill categories with empty scores
        skill_categories = {
            "Technical Skills": [],
            "Communication": [],
            "Problem Solving": [],
            "Team Collaboration": []
        }
        
        # Process each interview
        for interview in interviews:
            print(f"Processing interview {interview.interview_id}")
            # Get feedback data which contains individual skill scores
            feedback = interview.feedback or {}
            
            if isinstance(feedback, str):
                try:
                    feedback = json.loads(feedback)
                    print("Successfully parsed feedback JSON")
                except:
                    print("Failed to parse feedback JSON")
                    feedback = {}
            
            print(f"Feedback structure: {json.dumps(feedback, indent=2)}")
            
            # Get questions from evaluation_matrix
            questions = feedback.get('evaluation_matrix', [])
            print(f"Found {len(questions)} questions to process")
            
            for question in questions:
                print(f"Processing question: {json.dumps(question, indent=2)}")
                # Calculate average score from criteria scores
                criteria_scores = question.get('criteriaScores', {})
                if criteria_scores:
                    print(f"Found criteria scores: {criteria_scores}")
                    avg_score = sum(criteria_scores.values()) / len(criteria_scores)
                else:
                    avg_score = question.get('avgScore', 0)
                print(f"Average score: {avg_score}")
                
                weightage = question.get('weightage', 1.0)
                weighted_score = avg_score * weightage * 10  # Convert to 0-100 scale
                print(f"Weighted score: {weighted_score}")
                
                # Map categories based on question text and criteria
                text = question.get('text', '').lower()
                category = question.get('category', '').lower()
                
                # Try to categorize based on both text content and explicit category
                if "technical skills" in category or "react" in text or "web development" in text or "state" in text:
                    print(f"Adding {weighted_score} to Technical Skills")
                    skill_categories["Technical Skills"].append(weighted_score)
                elif "problem solving" in category or "bug" in text or "problem" in text:
                    print(f"Adding {weighted_score} to Problem Solving")
                    skill_categories["Problem Solving"].append(weighted_score)
                elif "communication" in category or "communication" in text:
                    print(f"Adding {weighted_score} to Communication")
                    skill_categories["Communication"].append(weighted_score)
                elif "team collaboration" in category or "team" in text or "collaboration" in text:
                    print(f"Adding {weighted_score} to Team Collaboration")
                    skill_categories["Team Collaboration"].append(weighted_score)
            
            # If interview has a score, use it for categories without specific scores
            if interview.interview_score:
                overall_score = float(interview.interview_score)  # Already on 0-100 scale
                print(f"Using overall score {overall_score} for empty categories")
                for category in skill_categories.keys():
                    if not skill_categories[category]:
                        print(f"Adding overall score to empty category {category}")
                        skill_categories[category].append(overall_score)
        
        print(f"Final skill categories: {json.dumps(skill_categories, indent=2)}")
        
        # Calculate average scores for each category
        results = {
            "skills_assessment": [],
            "skills_distribution": [],
            "competency_overview": []
        }
        
        for category, scores in skill_categories.items():
            avg_score = sum(scores) / len(scores) if scores else 0
            normalized_score = min(100, max(0, avg_score))  # Ensure score is between 0 and 100
            print(f"Category {category}: scores={scores}, avg={avg_score}, normalized={normalized_score}")
            
            results["skills_assessment"].append({
                "name": category,
                "score": round(normalized_score, 1)
            })
            
            results["skills_distribution"].append({
                "name": category,
                "value": round(normalized_score)
            })
            
            results["competency_overview"].append({
                "name": category,
                "score": round(normalized_score)
            })
        
        print(f"Final results: {json.dumps(results, indent=2)}")
        return results
        
    except Exception as e:
        print(f"Error in get_skills_assessment: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch skills assessment data: {str(e)}"
        )

async def get_collaborators(db: Session) -> List[Dict[str, Any]]:
    """Get all collaborators"""
    try:
        collaborators = db.query(Collaborators).join(User).all()
        return [
            {
                "id": collab.id,
                "name": collab.user.name,
                "role": collab.role,
                "avatar": f"/avatars/default.jpg"  # Use a default avatar URL
            }
            for collab in collaborators
        ]
    except Exception as e:
        print(f"Error in get_collaborators: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch collaborators data: {str(e)}"
        )

async def get_scheduled_interviews(
    db: Session,
    status: Optional[str] = None,
    from_date: Optional[datetime] = None,
    to_date: Optional[datetime] = None
) -> List[Dict[str, Any]]:
    """Get scheduled interviews with optional filters"""
    try:
        query = db.query(Interview).join(Candidate).join(User, Interview.user_id == User.user_id)
        
        if status:
            query = query.filter(Interview.status == status)
        if from_date:
            query = query.filter(Interview.interview_date >= from_date)
        if to_date:
            query = query.filter(Interview.interview_date <= to_date)
            
        interviews = query.all()
        
        return [
            {
                "id": interview.interview_id,
                "name": interview.candidate.name,
                "role": "Software Engineer",  # Default role since position is not in model
                "date": interview.interview_date.strftime("%Y-%m-%d"),
                "time": interview.interview_date.strftime("%H:%M"),
                "status": interview.status,
                "skills": [],  # Default empty list since skills is not in model
                "experience": [
                    {
                        "company": "Previous Company",
                        "position": "Previous Role",
                        "duration": "2 years"
                    }
                ],
                "education": "Not specified"  # Default value since education is not in model
            }
            for interview in interviews
        ]
    except Exception as e:
        print(f"Error in get_scheduled_interviews: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch scheduled interviews data: {str(e)}"
        )

async def get_evaluation_stats(db: Session) -> Dict[str, Any]:
    """Get evaluation statistics"""
    try:
        # Get total interviews scheduled today
        today_start = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        today_end = today_start + timedelta(days=1)
        scheduled_today = db.query(func.count(Interview.interview_id)).filter(
            Interview.interview_date.between(today_start, today_end)
        ).scalar() or 0

        # Get interviews on hold this week
        week_start = today_start - timedelta(days=today_start.weekday())
        week_end = week_start + timedelta(days=7)
        on_hold = db.query(func.count(Interview.interview_id)).filter(
            Interview.status == "on_hold",
            Interview.interview_date.between(week_start, week_end)
        ).scalar() or 0
        total_week = db.query(func.count(Interview.interview_id)).filter(
            Interview.interview_date.between(week_start, week_end)
        ).scalar() or 1  # Avoid division by zero
        on_hold_percentage = (on_hold / total_week * 100)

        # Get success rate compared to last month
        this_month_start = today_start.replace(day=1)
        last_month_end = this_month_start - timedelta(days=1)
        last_month_start = last_month_end.replace(day=1)
        
        # Current month success rate
        this_month_success = db.query(func.count(Interview.interview_id)).filter(
            Interview.status.ilike("completed"),
            Interview.interview_date >= this_month_start
        ).scalar() or 0
        this_month_total = db.query(func.count(Interview.interview_id)).filter(
            Interview.interview_date >= this_month_start
        ).scalar() or 1  # Avoid division by zero
        
        # Last month success rate
        last_month_success = db.query(func.count(Interview.interview_id)).filter(
            Interview.status.ilike("completed"),
            Interview.interview_date.between(last_month_start, last_month_end)
        ).scalar() or 0
        last_month_total = db.query(func.count(Interview.interview_id)).filter(
            Interview.interview_date.between(last_month_start, last_month_end)
        ).scalar() or 1  # Avoid division by zero

        # All-time success rate
        total_completed = db.query(func.count(Interview.interview_id)).filter(
            Interview.status.ilike("completed")
        ).scalar() or 0
        total_interviews = db.query(func.count(Interview.interview_id)).scalar() or 1  # Avoid division by zero
        
        this_month_rate = (this_month_success / this_month_total * 100)
        last_month_rate = (last_month_success / last_month_total * 100)
        total_success_rate = (total_completed / total_interviews * 100)
        rate_change = this_month_rate - last_month_rate

        # Get average interview duration (handle null values)
        avg_duration = db.query(
            func.avg(func.coalesce(Interview.duration, 30))  # Default to 30 minutes if null
        ).scalar() or 30  # Default to 30 minutes if no interviews

        return {
            "scheduled": {
                "count": str(scheduled_today),  # Convert to string to match response model
                "trend": f"{scheduled_today} today"
            },
            "onhold": {
                "count": str(on_hold),  # Convert to string to match response model
                "trend": f"{on_hold_percentage:.1f}% this week"
            },
            "success": {
                "count": f"{this_month_rate:.1f}%",
                "trend": f"{rate_change:+.1f}% vs last month",
                "total": f"{total_success_rate:.1f}% all-time"  # Added all-time success rate
            },
            "avgtime": {
                "count": f"{int(avg_duration)}m",
                "trend": "per interview"
            }
        }
    except Exception as e:
        print(f"Error in get_evaluation_stats: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch evaluation stats: {str(e)}"
        )

async def create_interview(db: Session, interview: schemas.InterviewCreate) -> schemas.Interview:
    """Create a new interview"""
    # Determine status based on scheduled time and provided status
    now = datetime.utcnow()
    interview_time = interview.scheduled_time
    
    # If no status provided, determine based on time
    if not interview.status:
        if interview_time < now:
            status = schemas.InterviewStatus.COMPLETED
        elif interview_time > now + timedelta(days=7):  # If more than a week away
            status = schemas.InterviewStatus.SCHEDULED
        else:
            status = schemas.InterviewStatus.SCHEDULED
    else:
        status = interview.status

    db_interview = Interview(
        candidate_id=interview.candidate_id,
        job_id=interview.job_id,
        user_id=interview.interviewer_id,
        interview_date=interview.scheduled_time,
        interview_score=0,  # Initial score
        status=status.value,  # Use the value from enum
        activity_type="interview_scheduled",
        notes=interview.notes
    )
    db.add(db_interview)
    db.commit()
    db.refresh(db_interview)
    
    # Map database fields to response schema fields
    return schemas.Interview(
        interview_id=db_interview.interview_id,
        candidate_id=db_interview.candidate_id,
        job_id=db_interview.job_id,
        interviewer_id=db_interview.user_id,
        scheduled_time=db_interview.interview_date,
        status=db_interview.status,
        interview_score=db_interview.interview_score,
        feedback=db_interview.feedback or {},
        notes=db_interview.notes
    )

async def create_candidate(db: Session, candidate: schemas.CandidateCreate) -> schemas.Candidate:
    """Create a new candidate"""
    db_candidate = Candidate(
        name=candidate.name,
        email=candidate.email,
        resume_url=candidate.resume_url,
        job_id=candidate.job_id,
        status="New",
        activity_type="candidate_created"
    )
    db.add(db_candidate)
    db.commit()
    db.refresh(db_candidate)
    return db_candidate

async def get_candidates(
    db: Session,
    search: Optional[str] = None,
    status: Optional[str] = None
) -> List[Dict[str, Any]]:
    """Get all candidates with optional filters"""
    try:
        print("Fetching candidates with filters:", {"search": search, "status": status})
        query = db.query(Candidate)
        
        if search:
            query = query.filter(Candidate.name.ilike(f"%{search}%"))
        if status:
            query = query.filter(Candidate.status == status)
            
        candidates = query.all()
        print(f"Found {len(candidates)} candidates")
        
        result = [
            {
                "id": c.candidate_id,  # Changed to match frontend expectation
                "name": c.name,
                "email": c.email,
                "resume_url": c.resume_url,
                "role": "Software Engineer",  # Added default role
                "score": 0,  # Added default score
                "job_id": c.job_id,
                "status": c.status or "Pending",  # Added fallback status
                "created_at": c.created_at.isoformat() if c.created_at else None,
                "updated_at": c.updated_at.isoformat() if c.updated_at else None
            }
            for c in candidates
        ]
        print("Returning candidates data:", result)
        return result
        
    except Exception as e:
        print(f"Error in get_candidates: {str(e)}")
        # Re-raise the exception to be handled by FastAPI
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch candidates data: {str(e)}"
        ) from e

async def create_skill_assessment(
    db: Session,
    assessment: schemas.SkillAssessmentCreate
) -> schemas.SkillAssessment:
    """Create a new skill assessment"""
    try:
        # Handle feedback data
        feedback_data = assessment.feedback
        if isinstance(feedback_data, str):
            feedback_data = {"text": feedback_data}
        elif feedback_data is None:
            feedback_data = {}
        
        # Create the evaluation record
        db_evaluation = CandidateEvaluation(
            candidate_id=assessment.candidate_id,
            job_id=assessment.job_id,
            score=assessment.score,
            feedback=feedback_data,  # Already a dict
            strengths=assessment.strengths,
            weaknesses=assessment.weaknesses,
            evaluation_type="technical",
            activity_type="skill_assessment_created",
            evaluation_date=datetime.utcnow()
        )
        
        # Add and commit with error handling
        db.add(db_evaluation)
        try:
            db.commit()
            db.refresh(db_evaluation)
            
            # Convert to response format
            return schemas.SkillAssessment(
                evaluation_id=db_evaluation.evaluation_id,
                candidate_id=db_evaluation.candidate_id,
                job_id=db_evaluation.job_id,
                score=db_evaluation.score,
                feedback=db_evaluation.feedback,
                strengths=db_evaluation.strengths,
                weaknesses=db_evaluation.weaknesses,
                evaluation_type=db_evaluation.evaluation_type,
                evaluation_date=db_evaluation.evaluation_date
            )
            
        except Exception as e:
            db.rollback()
            print(f"Database error: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to create skill assessment: {str(e)}"
            )
            
    except Exception as e:
        print(f"Error in create_skill_assessment: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create skill assessment: {str(e)}"
        )

async def update_interview_evaluation(
    db: Session,
    interview_id: int,
    evaluation_data: dict
) -> schemas.Interview:
    """Update interview evaluation scores and feedback"""
    try:
        interview = db.query(Interview).filter(Interview.interview_id == interview_id).first()
        if not interview:
            raise HTTPException(status_code=404, detail="Interview not found")

        # Structure the feedback data
        feedback = {
            "evaluation_matrix": evaluation_data.get("questions", []),
            "strengths": evaluation_data.get("strengths", []),
            "improvements": evaluation_data.get("improvements", []),
            "recommendation": evaluation_data.get("recommendation", "")
        }

        # Update interview record
        interview.feedback = feedback
        interview.interview_score = evaluation_data.get("overall_score", 0)
        interview.status = "completed"  # Update status when evaluation is done

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
            feedback=interview.feedback,
            notes=interview.notes
        )

    except Exception as e:
        print(f"Error in update_interview_evaluation: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update interview evaluation: {str(e)}"
        )

async def make_candidate_decision(
    db: Session,
    decision_data: schemas.CandidateDecisionCreate,
    user_id: int = 1
) -> Dict[str, Any]:
    """Make a decision for a candidate by updating their status"""
    try:
        # Get the candidate
        candidate = db.query(Candidate).filter(
            Candidate.candidate_id == decision_data.candidate_id
        ).first()
        
        if not candidate:
            raise HTTPException(status_code=404, detail="Candidate not found")
        
        # Update candidate status based on the decision
        candidate.status = decision_data.decision
        db.commit()
        
        return {
            "candidate_id": candidate.candidate_id,
            "job_id": candidate.job_id,
            "decision": decision_data.decision,
            "reason": decision_data.reason,
            "status": candidate.status,
            "decision_date": datetime.utcnow()
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to make candidate decision: {str(e)}"
        )

async def get_decision_making_data(
    db: Session,
    candidate_id: int,
    job_id: int
) -> Dict[str, Any]:
    """Get decision-making data for a candidate"""
    try:
        # Get candidate info
        candidate = db.query(Candidate).filter(
            Candidate.candidate_id == candidate_id
        ).first()
        
        if not candidate:
            raise HTTPException(status_code=404, detail="Candidate not found")
            
        # Get job info
        job = db.query(JobDescription).filter(
            JobDescription.job_id == job_id
        ).first()
        
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
            
        # Get similar candidates (same job, completed status)
        similar_candidates = db.query(Candidate).filter(
            Candidate.job_id == job_id,
            Candidate.status == "completed"
        ).limit(5).all()
        
        # Get team members (users who have interviewed candidates)
        team_members = db.query(User).join(Interview).filter(
            Interview.job_id == job_id
        ).distinct().limit(5).all()
        
        # Get consistency metrics from interviews
        interviews = db.query(Interview).filter(
            Interview.candidate_id == candidate_id,
            Interview.job_id == job_id
        ).all()
        
        # Calculate average interview score
        avg_score = 0
        if interviews:
            scores = [i.interview_score for i in interviews if i.interview_score is not None]
            avg_score = sum(scores) / len(scores) if scores else 0
            
        # Return mock data for historical performance and risk metrics
        return {
            "candidate": {
                "id": candidate.candidate_id,
                "name": candidate.name,
                "status": candidate.status
            },
            "similar_candidates": [
                {
                    "id": c.candidate_id,
                    "name": c.name,
                    "status": c.status
                } for c in similar_candidates
            ],
            "team_members": [
                {
                    "id": u.user_id,
                    "name": u.name,
                    "role": u.role
                } for u in team_members
            ],
            "consistency_metrics": {
                "interview_score": round(avg_score, 2),
                "evaluator_agreement": 85,  # Mock data
                "feedback_consistency": 90   # Mock data
            },
            "historical_performance": {
                "success_rate": 75,         # Mock data
                "retention_rate": 80,       # Mock data
                "promotion_rate": 25        # Mock data
            },
            "risk_metrics": {
                "flight_risk": "Low",       # Mock data
                "training_needs": "Medium", # Mock data
                "culture_fit": "High"       # Mock data
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch decision-making data: {str(e)}"
        )

async def get_decision_analytics(db: Session) -> Dict[str, int]:
    """Get decision analytics data"""
    try:
        # Get total interviews
        total_interviews = db.query(func.count(Interview.interview_id)).scalar() or 0
        
        # Get counts for each status
        selected = db.query(func.count(Candidate.candidate_id)).filter(
            Candidate.status == "Selected"
        ).scalar() or 0
        
        rejected = db.query(func.count(Candidate.candidate_id)).filter(
            Candidate.status == "Rejected"
        ).scalar() or 0
        
        hold = db.query(func.count(Candidate.candidate_id)).filter(
            Candidate.status == "Hold"
        ).scalar() or 0
        
        return {
            "totalInterviews": total_interviews,
            "selected": selected,
            "rejected": rejected,
            "hold": hold
        }
    except Exception as e:
        print(f"Error in get_decision_analytics: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch decision analytics: {str(e)}"
        )

async def update_candidate_status(
    db: Session,
    status_update: schemas.CandidateStatusUpdate
) -> Dict[str, Any]:
    """Update candidate status based on action"""
    try:
        print(f"Updating candidate status: {status_update}")
        
        # Get the candidate
        candidate = db.query(Candidate).filter(
            Candidate.candidate_id == status_update.candidateId
        ).first()
        
        if not candidate:
            print(f"Candidate {status_update.candidateId} not found")
            raise HTTPException(status_code=404, detail="Candidate not found")
        
        print(f"Found candidate: {candidate.name} (current status: {candidate.status})")
        
        # Map action to status
        status_mapping = {
            'select': 'Selected',
            'reject': 'Rejected',
            'hold': 'Hold'
        }
        
        new_status = status_mapping.get(status_update.action)
        if not new_status:
            print(f"Invalid action: {status_update.action}")
            raise HTTPException(
                status_code=400,
                detail=f"Invalid action: {status_update.action}. Must be one of: select, reject, hold"
            )
        
        print(f"Updating status to: {new_status}")
        
        # Update status
        candidate.status = new_status
        try:
            db.commit()
            print(f"Successfully updated candidate status to {new_status}")
        except Exception as e:
            print(f"Database error while committing: {str(e)}")
            db.rollback()
            raise
        
        result = {
            "candidate_id": candidate.candidate_id,
            "status": candidate.status,
            "updated_at": datetime.utcnow()
        }
        print(f"Returning result: {result}")
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Unexpected error in update_candidate_status: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update candidate status: {str(e)}"
        )