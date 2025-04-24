from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
from app.database.connection import get_db
from app.models.base import JobDescription, User, JobRecruiterAssignment, Role

hiring_recruiter_router = APIRouter()

# Pydantic Models
class JobRecruiterAssignmentCreate(BaseModel):
    job_title: str
    recruiter_name: str

class JobRecruiterAssignmentUpdate(BaseModel):
    job_title: str
    recruiter_name: str

class JobRecruiterAssignmentResponse(BaseModel):
    id: int
    job_title: str
    recruiter_name: str
    assigned_date: datetime
    
    class Config:
        orm_mode = True

# Reusable Database Utility Functions
async def get_recruiters_by_role(db: Session, role_id: int = 6):
    # Get all users with recruiter role, including more user details for verification
    recruiters = db.query(User)\
                   .filter(User.role_id == role_id)\
                   .order_by(User.name)\
                   .all()
    
    print(f"Found {len(recruiters)} recruiters with role_id {role_id}")
    
    # Return recruiter names if found, otherwise return default recruiter list
    if recruiters:
        return [recruiter.name for recruiter in recruiters]
    return ["Default Recruiter"]  # Provide default value instead of empty list

async def get_job_id_by_title(db: Session, job_title: str) -> int:
    job = db.query(JobDescription.job_id)\
            .filter(JobDescription.title == job_title, 
                    JobDescription.status == 'active')\
            .first()
    
    if not job:
        raise HTTPException(status_code=404, detail=f"Job title '{job_title}' not found")
    return job[0]

async def get_user_id_by_name(db: Session, recruiter_name: str, role_id: int = 6) -> int:
    user = db.query(User.user_id)\
             .filter(User.name == recruiter_name, 
                     User.role_id == role_id)\
             .first()
    
    if not user:
        raise HTTPException(status_code=404, detail=f"Recruiter '{recruiter_name}' not found")
    return user[0]

async def check_assignment_exists(db: Session, assignment_id: int) -> bool:
    assignment = db.query(JobRecruiterAssignment)\
                   .filter(JobRecruiterAssignment.id == assignment_id)\
                   .first()
    return assignment is not None

async def check_job_assignment(db: Session, job_id: int, exclude_assignment_id: Optional[int] = None) -> None:
    query = db.query(JobRecruiterAssignment)\
              .filter(JobRecruiterAssignment.job_id == job_id)
    
    if exclude_assignment_id:
        query = query.filter(JobRecruiterAssignment.id != exclude_assignment_id)
    
    existing = query.first()
    if existing:
        raise HTTPException(
            status_code=409,
            detail="Job is already assigned to a recruiter. Use PUT to update."
        )

async def fetch_assignments(db: Session, job_id: Optional[int] = None) -> List[dict]:
    query = db.query(
                JobRecruiterAssignment.id,
                JobDescription.title.label('job_title'),
                User.name.label('recruiter_name'),
                JobRecruiterAssignment.assigned_date
            )\
            .join(JobDescription, JobRecruiterAssignment.job_id == JobDescription.job_id)\
            .join(User, JobRecruiterAssignment.user_id == User.user_id)
    
    if job_id:
        query = query.filter(JobRecruiterAssignment.job_id == job_id)
    
    assignments = query.order_by(JobRecruiterAssignment.assigned_date.desc()).all()
    
    return [
        {
            "id": assignment.id,
            "job_title": assignment.job_title,
            "recruiter_name": assignment.recruiter_name,
            "assigned_date": assignment.assigned_date
        }
        for assignment in assignments
    ]

# hiring_recruiter_router Endpoints
@hiring_recruiter_router.get("/by-role/recruiters/{role_id}", response_model=List[str])
async def get_recruiters_by_role_endpoint(role_id: int, db: Session = Depends(get_db)):
    # First validate if role exists
    role = db.query(Role).filter(Role.role_id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail=f"Role with ID {role_id} not found")
    
    # Query users with the specified role
    users = db.query(User)\
             .filter(User.role_id == role_id)\
             .order_by(User.name)\
             .all()
    
    print(f"Found {len(users)} users with role_id {role_id} ({role.role_name})")
    
    # Return user names or default message
    if users:
        return [user.name for user in users]
    return [f"No users found for role: {role.role_name}"]

@hiring_recruiter_router.get("/api/job-descriptions", response_model=List[str])
async def get_jd_names(db: Session = Depends(get_db)):
    job_titles = db.query(JobDescription.title).order_by(JobDescription.title).all()
    return [title[0] for title in job_titles]

@hiring_recruiter_router.post("/api/job-recruiter-assignments", status_code=status.HTTP_201_CREATED, response_model=JobRecruiterAssignmentResponse)
async def create_job_recruiter_assignment(assignment: JobRecruiterAssignmentCreate, db: Session = Depends(get_db)):
    try:
        # Get job_id and validate job exists
        job = db.query(JobDescription)\
               .filter(JobDescription.title == assignment.job_title, 
                      JobDescription.status == 'active')\
               .first()
        if not job:
            raise HTTPException(
                status_code=404, 
                detail=f"Active job with title '{assignment.job_title}' not found"
            )

        # Get user_id and validate recruiter exists
        recruiter = db.query(User)\
                     .filter(User.name == assignment.recruiter_name,
                            User.role_id == 6)\
                     .first()
        if not recruiter:
            raise HTTPException(
                status_code=404,
                detail=f"Recruiter '{assignment.recruiter_name}' not found"
            )

        # Check if job is already assigned
        existing_assignment = db.query(JobRecruiterAssignment)\
                              .filter(JobRecruiterAssignment.job_id == job.job_id)\
                              .first()
        if existing_assignment:
            raise HTTPException(
                status_code=409,
                detail="Job is already assigned to a recruiter"
            )

        # Create new assignment
        new_assignment = JobRecruiterAssignment(
            job_id=job.job_id,
            user_id=recruiter.user_id
        )
        
        db.add(new_assignment)
        db.commit()
        db.refresh(new_assignment)

        return {
            "id": new_assignment.id,
            "job_title": job.title,
            "recruiter_name": recruiter.name,
            "assigned_date": new_assignment.assigned_date
        }

    except HTTPException as he:
        raise he
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@hiring_recruiter_router.get("/api/job-recruiter-assignments", response_model=List[JobRecruiterAssignmentResponse])
async def get_job_recruiter_assignments(db: Session = Depends(get_db)):
    try:
        # Enhanced query to fetch assignments with joins
        assignments = db.query(
            JobRecruiterAssignment.id,
            JobDescription.title.label('job_title'),
            User.name.label('recruiter_name'),
            JobRecruiterAssignment.assigned_date
        )\
        .join(JobDescription, JobRecruiterAssignment.job_id == JobDescription.job_id)\
        .join(User, JobRecruiterAssignment.user_id == User.user_id)\
        .order_by(JobRecruiterAssignment.assigned_date.desc())\
        .all()

        return [
            {
                "id": assignment.id,
                "job_title": assignment.job_title,
                "recruiter_name": assignment.recruiter_name,
                "assigned_date": assignment.assigned_date
            }
            for assignment in assignments
        ]
    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


@hiring_recruiter_router.get("/api/job-recruiter-assignments/job/{job_id}", response_model=List[JobRecruiterAssignmentResponse])
async def get_assignments_by_job(job_id: int, db: Session = Depends(get_db)):
    try:
        assignments = await fetch_assignments(db, job_id)
        if not assignments:
            raise HTTPException(status_code=404, detail=f"No assignments found for job ID {job_id}")
        return assignments
    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

@hiring_recruiter_router.put("/api/job-recruiter-assignments/{assignment_id}", response_model=JobRecruiterAssignmentResponse)
async def update_job_recruiter_assignment(assignment_id: int, assignment: JobRecruiterAssignmentUpdate, db: Session = Depends(get_db)):
    try:
        existing_assignment = db.query(JobRecruiterAssignment)\
                                .filter(JobRecruiterAssignment.id == assignment_id)\
                                .first()
        
        if not existing_assignment:
            raise HTTPException(status_code=404, detail=f"Assignment with ID {assignment_id} not found")

        job_id = await get_job_id_by_title(db, assignment.job_title)
        user_id = await get_user_id_by_name(db, assignment.recruiter_name)
        await check_job_assignment(db, job_id, exclude_assignment_id=assignment_id)

        existing_assignment.job_id = job_id
        existing_assignment.user_id = user_id
        
        db.commit()
        db.refresh(existing_assignment)

        # Get the job title and recruiter name for the response
        job_title = db.query(JobDescription.title)\
                      .filter(JobDescription.job_id == job_id)\
                      .scalar()
        
        recruiter_name = db.query(User.name)\
                           .filter(User.user_id == user_id)\
                           .scalar()

        return {
            "id": existing_assignment.id,
            "job_title": job_title,
            "recruiter_name": recruiter_name,
            "assigned_date": existing_assignment.assigned_date
        }
    except Exception as e:
        db.rollback()
        print(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

@hiring_recruiter_router.delete("/api/job-recruiter-assignments/{assignment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_job_recruiter_assignment(assignment_id: int, db: Session = Depends(get_db)):
    try:
        assignment = db.query(JobRecruiterAssignment)\
            .filter(JobRecruiterAssignment.id == assignment_id)\
            .first()
        
        if not assignment:
            raise HTTPException(status_code=404, detail=f"Assignment with ID {assignment_id} not found")

        db.delete(assignment)
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
