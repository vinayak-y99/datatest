from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, Query, Form, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from typing import Dict, List, Optional, Any
from datetime import datetime
import json
from app.utils.helpers import process_pdf
from pydantic import BaseModel, Field
from app.models.base_models import JobAnalysisResponse, DashboardResponse, JobDetailsInput, JobRequestData, SkillData, QualificationData, RequirementData, SkillsData, BasicInfo
import logging
from app.services.dashboard_service import DashboardService
from app.services.llm_service import LLMService
from fastapi import APIRouter, FastAPI, HTTPException, Depends, File, UploadFile, Query
from io import BytesIO
from app.models.base import JobDescription, JobRequiredSkills, Skill, ThresholdScore, User, JobRecruiterAssignment, Candidate, Interview, Discussion
import app.database.connection as get_db
import re
import openai
import io
import PyPDF2
import docx
import time
import traceback
import random
import asyncio
from app.core.Config import settings

# Database connection
SQLALCHEMY_DATABASE_URL = f"postgresql://postgres:Temp1234@localhost:5432/fasthire999" # Change as needed

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Create all tables
Base.metadata.create_all(bind=engine)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

analyze_job_description_router = APIRouter()
create_dashboards_router = APIRouter()
logger = logging.getLogger(__name__)

# Define response models
class JobDescriptionResponse(BaseModel):
    job_id: int
    title: str
    description: str
    raw_text: str
    status: str
    basic_info: Dict[str, str]

class DashboardResponse(BaseModel):
    job_id: int
    roles: List[str]
    skills_data: Dict[str, Any]
    formatted_data: Dict[str, Any]
    status: str
    raw_response: str
    selected_prompts: str
    data: Dict[str, Any]
    # Optional fields for backward compatibility
    selection_threshold: Optional[int] = 0
    rejection_threshold: Optional[int] = 0
    
# Function to clean text of encoding artifacts and special characters
def clean_text(text):
    if not text or text == "Not specified":
        return text
        
    # Handle special characters that appear as artifacts
    replacements = {
        "Ō": "ft",
        "ƫ": "t",
        "Ɵ": "ti",
        "ƞ": "n",
        "ŋ": "n",
        "ƚ": "l",
        "Ɔ": "O",
        "ŕ": "r",
        "ŝ": "s",
        "Ŧ": "T",
        "ũ": "u",
        "Ŵ": "W",
        "ŵ": "w",
        "Ź": "Z",
        "ź": "z",
        "Ż": "Z",
        "ż": "z",
        "ƒ": "f",
        "ƍ": "d",
        "Ƌ": "D",
        "ƌ": "d",
        "Ɛ": "E",
        "Ƒ": "F"
    }
    
    # Replace each character
    for old, new in replacements.items():
        text = text.replace(old, new)
    
    # Remove other non-printable characters
    text = re.sub(r'[^\x20-\x7E]', '', text)
    
    # Fix common issues
    text = text.replace("  ", " ").strip()
    
    return text

@analyze_job_description_router.post("/api/extract_job_description/", response_model=JobDescriptionResponse)
async def extract_job_description(user_id: str, file: UploadFile = File(...), db: Session = Depends(get_db)):
    try:
        # Verify if user exists
        user = db.query(User).filter(User.user_id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Extract text from PDF
        raw_text = await process_pdf(file)
        
        # Clean the raw text first
        text = clean_text(raw_text)
        
        # Add logging to help debug
        logger.info(f"Processing PDF content with length: {len(text)}")
        
        # Set default values for all fields
        position_title = "Not specified"
        required_experience = "Not specified"
        location = "Not specified"
        contact = "Not specified"
        position_type = "Not specified"
        department = "Not specified"
        office_timings = "Not specified"
        education = "Not specified"
        responsibilities = "Not specified"
        
        # Try to extract position title with simplified logic
        title_patterns = [
            r"(?:^|\n)(?:Human Resources|HR)\s+(?:Manager|Director|Specialist|Coordinator|Assistant)",
            r"(?:^|\n)([A-Z][A-Za-z]+(?:\s+[A-Z][A-Za-z]+){0,3})\s+(?:Manager|Director|Lead|Specialist)",
            r"(?:^|\n)(?:Senior|Junior)?\s*([A-Za-z]+(?:\s+[A-Za-z]+){0,3})\s+(?:Manager|Director|Engineer|Developer|Specialist|Consultant)",
            r"(?:Position|Job|Role|Title)\s*(?::|is|:)\s*([^\n\.,]{3,50})",
            r"(?:^|\n)([A-Z][A-Za-z]+(?:\s+[A-Za-z]+){0,6})\s*(?:Job|Position|Role)\s+(?:description|Description|brief)",
            r"(?:^|\n)(.{3,50})\s+Job\s+description",
            r"(?:^|\n)([A-Z][A-Za-z]+(?:\s+[A-Za-z]+){0,6})(?=\s+description|\s+brief)"
        ]
        
        for pattern in title_patterns:
            try:
                match = re.search(pattern, text, re.IGNORECASE)
                if match:
                    # Try to get group 1 if it exists, otherwise use group 0
                    extracted_title = match.group(1) if match.groups() else match.group(0)
                    extracted_title = extracted_title.strip()
                    
                    # Clean up the title and limit length
                    # Remove any trailing indicators like colons
                    extracted_title = re.sub(r'[:;]+$', '', extracted_title)
                    
                    # Split by any obvious separators
                    if ' - ' in extracted_title:
                        parts = extracted_title.split(' - ')
                        extracted_title = parts[0].strip()
                    
                    # Limit to first 7 words at most
                    title_words = extracted_title.split()
                    if len(title_words) > 7:
                        extracted_title = ' '.join(title_words[:7])
                    
                    # Reject if too long or contains suspicious strings
                    if (len(extracted_title) <= 50 and 
                        len(extracted_title.split()) <= 7 and
                        not any(x in extracted_title.lower() for x in ["responsibility", "requirement", "description", "objective", "overview", "summary", "company", "location", "experience", "ctc", "lacs"])):
                        position_title = extracted_title
                        break
            except Exception as e:
                logger.error(f"Error in title extraction: {str(e)}")
                continue
        
        # Special case handling for "Human Resources (HR) Manager" pattern
        hr_manager_match = re.search(r"(?:Human Resources|HR)(?:\s+\([A-Z]+\))?\s+Manager", text)
        if hr_manager_match and position_title == "Not specified":
            position_title = hr_manager_match.group(0).strip()
        
        # Special extract from beginning of document - first line is often the title
        if position_title == "Not specified":
            first_line = text.strip().split('\n')[0]
            if 3 < len(first_line) < 50 and not any(x in first_line.lower() for x in ["description", "overview", "company", "introduction"]):
                # Limit to first 5 words if it's potentially a title
                first_line_words = first_line.split()
                if len(first_line_words) > 5:
                    first_line = ' '.join(first_line_words[:5])
                position_title = first_line.strip()
        
        # Extract experience - simplified
        experience_patterns = [
            r"(?:Experience|Work Experience)[\s:]+(\d+[\-+]?\s*(?:years|yrs))",
            r"(\d+[\-+]?\s*(?:years|yrs)[\s\w]*experience)",
            r"((?:Junior|Mid|Senior|Principal)[\s\w]*level)"
        ]
        
        for pattern in experience_patterns:
            try:
                match = re.search(pattern, text, re.IGNORECASE)
                if match:
                    required_experience = match.group(1).strip()
                    break
            except Exception as e:
                logger.error(f"Error in experience extraction: {str(e)}")
                continue
        
        # Extract location - simplified
        location_patterns = [
            r"(?:Location|Place|Site)[\s:]+([^\n]+)",
            r"(?:Remote|On-site|Hybrid)"
        ]
        
        for pattern in location_patterns:
            try:
                match = re.search(pattern, text, re.IGNORECASE)
                if match:
                    if match.groups():
                        location = match.group(1).strip()
                    else:
                        location = match.group(0).strip()
                    break
            except Exception as e:
                logger.error(f"Error in location extraction: {str(e)}")
                continue
        
        # Extract department with improved precision
        department_patterns = [
            r"(?:Department|Division|Team|Unit|Group)[:\s]+([^,\n]{3,50}?)(?:$|\n|,|\.|Employment|\()",
            r"(?:^|\n)Department[:\s]*([^,\n]{3,50})",
            r"(?:^|\n)Division[:\s]*([^,\n]{3,50})",
            r"(?:^|\n|-)(?:Engineering|IT|HR|Marketing|Sales|Finance|Accounting|Operations|Product|Legal|R&D|Customer Service)(?:\s+-\s+[^,\n]{3,30})?",
            r"Department:?\s*(?:Engineering|IT|HR|Marketing|Sales|Finance|Accounting|Operations|Product|Legal|R&D)(?:\s+-\s+[^,\n]{3,30})?"
        ]
        
        department = "Not specified"
        for pattern in department_patterns:
            try:
                match = re.search(pattern, text, re.IGNORECASE)
                if match:
                    if match.groups():
                        extracted_dept = match.group(1).strip()
                    else:
                        extracted_dept = match.group(0).strip()
                    
                    # Clean up extracted department
                    # Remove prefixes like "Department:" if they're still in the extraction
                    extracted_dept = re.sub(r'^(?:Department|Division|Team|Unit|Group)[:\s]+', '', extracted_dept, flags=re.IGNORECASE)
                    
                    # Limit to 50 characters and 4 words max
                    dept_words = extracted_dept.split()
                    if len(dept_words) > 4:
                        extracted_dept = ' '.join(dept_words[:4])
                    
                    if len(extracted_dept) > 50:
                        extracted_dept = extracted_dept[:50].strip()
                    
                    # Avoid capturing everything after the department label
                    if len(extracted_dept) < 50 and all(x not in extracted_dept.lower() for x in ['employment type', 'role category', 'education', 'key skills']):
                        department = extracted_dept
                        break
            except Exception as e:
                logger.error(f"Error in department extraction: {str(e)}")
                continue
        
        # Handle specific case of "Engineering - Software & QA" format
        eng_match = re.search(r"Engineering\s*-\s*(?:Software|Hardware|QA|Testing|Development|Design|Systems|Network)", text, re.IGNORECASE)
        if eng_match and (department == "Not specified" or len(department) > len(eng_match.group(0))):
            department = eng_match.group(0).strip()
            
        # Try to find role category if department not found
        if department == "Not specified":
            role_match = re.search(r"Role\s+Category:?\s*([^,\n]{3,30})", text, re.IGNORECASE)
            if role_match:
                department = role_match.group(1).strip()
        
        # Extract education requirements with improved precision
        education_patterns = [
            # Specific degree patterns
            r"(?:Education|Qualification|Degree)(?:\s+Required)?[:\s]+([^\n]+)",
            r"(?:Bachelor'?s|Master'?s|PhD|Doctorate|Graduate|Postgraduate|B\.Tech|B\.E|M\.Tech|M\.E|M\.Sc|B\.Sc|MCA)\s+(?:degree|in)\s+([^\.]+)",
            r"(?:^|\n)(?:Education|Qualification)(?:\s+Required)?[:\s]+(.+?)(?:$|\n|Key\s+Skills)",
            r"Educat(?:ion|ional) (?:Requirement|Qualification)[s]?:?\s*([^\n]+)",
            # Specific formats from examples
            r"Education UG:\s*([^,\n]+),?\s*PG:\s*([^,\n]+)",
            r"(?:UG|Undergraduate)[:;]?\s*([^,\n]+),?\s*(?:PG|Postgraduate)[:;]?\s*([^,\n]+)",
            r"(?:Any Graduate|B\.Tech|B\.E|B\.Sc|BCA)(?:\s+in\s+[^,]+)?(?:\s*,\s*|\s+and\s+)(?:Any Postgraduate|M\.Tech|M\.E|M\.Sc|MCA)",
            r"(?:^|\n)Qualification[s]?:?\s*(.+?)(?=$|\n|Experience|Requirements)"
        ]
        
        education = "Not specified"
        for pattern in education_patterns:
            try:
                match = re.search(pattern, text, re.IGNORECASE)
                if match:
                    if len(match.groups()) >= 2:  # If we have UG and PG captured separately
                        ug = match.group(1).strip()
                        pg = match.group(2).strip() if match.group(2) else ""
                        if pg:
                            education = f"{ug}, {pg}"
                        else:
                            education = ug
                    else:
                        education = match.group(1).strip()
                    break
            except Exception as e:
                logger.error(f"Error in education extraction: {str(e)}")
                continue
        
        # Look for specific degree mentions if not found yet
        if education == "Not specified":
            # Try to find any mentioned degrees in the text
            degree_match = re.search(r"(Bachelor'?s|Master'?s|Graduate|Postgraduate|B\.Tech|B\.E|M\.Tech|M\.E|M\.Sc|B\.Sc|MCA)(?:\s+(?:degree|in)\s+([^\.]+))?", text, re.IGNORECASE)
            if degree_match:
                degree = degree_match.group(1).strip()
                if len(degree_match.groups()) > 1 and degree_match.group(2):
                    field = degree_match.group(2).strip()
                    education = f"{degree} in {field}"
                else:
                    education = degree
        
        # Try to find standard formats like "Any Graduate, Any Postgraduate"
        if education == "Not specified":
            edu_formats = [
                r"(?:Any Graduate|Graduate|B\.Tech|B\.E|B\.Sc|BCA)(?:\s*,\s*|\s+and\s+)(?:Any Postgraduate|Postgraduate|M\.Tech|M\.E|M\.Sc|MCA)",
                r"(?:Any|UG|PG) (?:Graduate|Postgraduate)",
                r"(?:Bachelor|Master)(?:'s|\s) degree"
            ]
            for pattern in edu_formats:
                match = re.search(pattern, text, re.IGNORECASE)
                if match:
                    education = match.group(0)
                    break
                    
        # Clean up the extracted text
        if education != "Not specified":
            # Trim to reasonable length and remove extra whitespace
            education = re.sub(r'\s+', ' ', education)
            
            # Remove any unwanted prefixes
            education = re.sub(r'^(?:Education|Qualification|Degree)[:\s]+', '', education, flags=re.IGNORECASE)
            
            # Standardize some formats
            education = re.sub(r'(?:Any|an)\s+(?:Graduate|UG)', 'Any Graduate', education, flags=re.IGNORECASE)
            education = re.sub(r'(?:Any|a)\s+(?:Postgraduate|PG)', 'Any Postgraduate', education, flags=re.IGNORECASE)
            
            # Format properly for UG/PG format
            if re.search(r'UG:.*PG:', education, re.IGNORECASE):
                education = re.sub(r'UG:\s*', '', education, flags=re.IGNORECASE)
                education = re.sub(r'PG:\s*', 'Any Postgraduate', education, flags=re.IGNORECASE)
            
            # Limit length
            if len(education) > 100:
                education = education[:100].strip()
                
        # Handle specific text patterns (from the example)
        master_degree_match = re.search(r"Master(?:'?s)?\s+degree\s+in\s+([^\.]+)", text, re.IGNORECASE)
        if master_degree_match:
            field = master_degree_match.group(1).strip()
            if len(field) < 50:  # Reasonable field name length
                education = f"Master's degree in {field}"
        
        # Simple extractions for remaining fields
        try:
            contact_match = re.search(r"(?:Contact|Email|Phone)[\s:]+([^\n]+)", text, re.IGNORECASE)
            if contact_match:
                contact = contact_match.group(1).strip()
                
            position_match = re.search(r"(?:Position Type|Job Type)[\s:]+([^\n]+)", text, re.IGNORECASE)
            if position_match:
                position_type = position_match.group(1).strip()
            
            timing_match = re.search(r"(?:Office Hours|Working Hours|Shift)[\s:]+([^\n]+)", text, re.IGNORECASE)
            if timing_match:
                office_timings = timing_match.group(1).strip()
            
            # Extract responsibilities with simple pattern
            resp_match = re.search(r"(?:Responsibilities|Duties)[\s:]+(.+?)(?:Requirements|Qualifications|Skills|$)", text, re.IGNORECASE | re.DOTALL)
            if resp_match:
                responsibilities = resp_match.group(1).strip()
                # Quick cleanup
                responsibilities = re.sub(r'[•\*\-]', '', responsibilities)
                responsibilities = re.sub(r'\s{2,}', ' ', responsibilities)
            
        except Exception as e:
            logger.error(f"Error in field extraction: {str(e)}")
            # Continue with defaults if extraction fails
        
        # Fall back to the first 200 chars of text for responsibilities if not found
        if responsibilities == "Not specified":
            responsibilities = text[:min(200, len(text))] + "..."
            
        logger.info(f"Extracted title: {position_title}")
            
        # Clean all extracted fields before saving to database
        position_title = clean_text(position_title)
        required_experience = clean_text(required_experience)
        location = clean_text(location)
        contact = clean_text(contact)
        position_type = clean_text(position_type)
        department = clean_text(department)
        office_timings = clean_text(office_timings)
        education = clean_text(education)
        responsibilities = clean_text(responsibilities)
        
        # Keep original raw_text for reference
        raw_text = text
        
        try:
            # Create JobDescription entry
            job_description = JobDescription(
                title=position_title,
                description=responsibilities,
                raw_text=raw_text,  # Store original text
                keywords="",
                status="Active",
                department=department,
                required_skills="",
                experience_level=required_experience,
                education_requirements=education,
                threshold_score=70
            )
            db.add(job_description)
            db.commit()
            db.refresh(job_description)
                
            # Create ThresholdScore entry
            threshold_score = ThresholdScore(
                user_id=user_id,
                job_id=job_description.job_id,
                selection_score=70,
                rejection_score=30, 
                threshold_value=50,
                threshold_result={},
                threshold_prompts="",
                custom_prompts="",
                sample_prompts_history=""
            )
            db.add(threshold_score)
            db.commit()
            
            # Associate job with user
            job_recruiter_assignment = JobRecruiterAssignment(
                job_id=job_description.job_id,
                user_id=user.user_id,
                assigned_date=datetime.utcnow()
            )
            db.add(job_recruiter_assignment)
            db.commit()
                
            return JobDescriptionResponse(
                job_id=job_description.job_id,
                title=position_title,
                description=responsibilities,
                raw_text=raw_text,
                status="success",
                basic_info={
                    "position_title": position_title,
                    "required_experience": required_experience,
                    "location": location,
                    "position_type": position_type,
                    "office_timings": office_timings,
                    "department": department,
                    "education": education,
                    "contact": contact
                }
            )
        except Exception as db_error:
            db.rollback()
            logger.error(f"Database error: {str(db_error)}")
            raise HTTPException(status_code=500, detail=f"Database error: {str(db_error)}")
    except Exception as e:
        logger.error(f"Extraction error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# API endpoint for manual creation of job descriptions
@analyze_job_description_router.post("/api/create-job-description", response_model=Dict[str, Any])
async def create_job_description(job_data: Dict[str, Any], db: Session = Depends(get_db)):
    """
    Create a new job description from manually entered data.
    This endpoint handles creating a job description without uploading a PDF.
    """
    try:
        # Extract the user_id, defaulting to '1' if not provided
        user_id = job_data.get('user_id', '1')
        
        # Validate the user exists
        user = db.query(User).filter(User.user_id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Create JobDescription entry using the provided data
        job_description = JobDescription(
            title=job_data.get('title', 'Not specified'),
            description=job_data.get('description', ''),
            raw_text=job_data.get('raw_text', ''),  # Store content as raw_text
            keywords=job_data.get('keywords', ''),
            status="Active",
            department=job_data.get('department', ''),
            required_skills=job_data.get('required_skills', ''),
            experience_level=job_data.get('experience_level', ''),
            education_requirements=job_data.get('education_requirements', ''),
            threshold_score=float(job_data.get('threshold_score', 70))
        )
        db.add(job_description)
        db.commit()
        db.refresh(job_description)
            
        # Create ThresholdScore entry
        threshold_score = ThresholdScore(
            user_id=user_id,
            job_id=job_description.job_id,
            selection_score=float(job_data.get('threshold_score', 70)),
            rejection_score=30, 
            threshold_value=50,
            threshold_result={},
            threshold_prompts="",
            custom_prompts="",
            sample_prompts_history=""
        )
        db.add(threshold_score)
        db.commit()
        
        # Associate job with user
        job_recruiter_assignment = JobRecruiterAssignment(
            job_id=job_description.job_id,
            user_id=user.user_id,
            assigned_date=datetime.utcnow()
        )
        db.add(job_recruiter_assignment)
        db.commit()
            
        return {
            "status": "success",
            "job_id": job_description.job_id,
            "message": "Job description successfully created",
            "title": job_description.title,
            "threshold_id": threshold_score.threshold_id
        }
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating job description: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error creating job description: {str(e)}")

# Second Endpoint: Update Dashboards
@analyze_job_description_router.put("/api/update_dashboards/", response_model=DashboardResponse)
async def update_dashboards(job_id: int, num_dashboards: int = Query(ge=1, le=10), db: Session = Depends(get_db)):
    try:
        # Retrieve job description from database
        job_description = db.query(JobDescription).filter(JobDescription.job_id == job_id).first()
        if not job_description:
            raise HTTPException(status_code=404, detail="Job description not found")
        
        # Get the user_id from job assignment
        job_assignment = db.query(JobRecruiterAssignment).filter(JobRecruiterAssignment.job_id == job_id).first()
        user_id = job_assignment.user_id if job_assignment else None
        
        # Initialize LLM service
        llm_service = LLMService()
        
        # Create the dashboard template with dynamic dashboard count
        dashboard_template = """Analyze this job description and extract information to create {num_dashboards} distinct dashboards for visualizing different aspects of the job:

For Dashboard #1 (Required Skills):
Extract key technical skills with their importance (%), rating (out of 10).

For the remaining {remaining_dashboards} dashboards, extract different categories of job requirements. These could include but are not limited to:
- Technical qualifications
- Soft skills
- Certifications
- Domain knowledge
- Industry experience
- Management abilities
- Communication skills
- Project management skills
- Cloud/infrastructure expertise
- Specialized tools proficiency

For EACH dashboard category, provide:
- Category name (e.g., "Technical Skills", "Soft Skills", "Certifications")
- 3-7 items within that category
- For each item: Name, Importance (%), Rating (out of 10)

Importance Score (Sum: 100% per category): Represents the relative priority of each item based on prominence in the job description.
Rating: Score out of 10 calculated as (Importance × 10 ÷ highest importance percentage in that category)

Format your response with CONSISTENT structure as follows with one blank line between each section:

if {num_dashboards} = 1:
Then only output Dashboard #1 - Required Skills:
- [Skill Name]: Importance: [X]% Rating: [R]/10
- [Next Skill]: Importance: [X]% Rating: [R]/10

if {num_dashboards} = 2 :
Dashboard #1 - Required Skills:
- [Skill Name]: Importance: [X]% Rating: [R]/10
- [Next Skill]: Importance: [X]% Rating: [R]/10

Dashboard #2 - [Category Name]:
- [Item Name]: Importance: [X]% Rating: [R]/10
- [Next Item]: Importance: [X]% Rating: [R]/10

if {num_dashboards} = 3 or more:
Dashboard #1 - Required Skills:
- [Skill Name]: Importance: [X]% Rating: [R]/10
- [Next Skill]: Importance: [X]% Rating: [R]/10

Dashboard #2 - [Category Name]:
- [Item Name]: Importance: [X]% Rating: [R]/10
- [Next Item]: Importance: [X]% Rating: [R]/10

Dashboard #3 - [Category Name]:
- [Item Name]: Importance: [X]% Rating: [R]/10
- [Next Item]: Importance: [X]% Rating: [R]/10

(Continue for all {num_dashboards} dashboards)

Threshold Recommendations:
Selection Threshold: 70%
Rejection Threshold: 30%

Rules:
- Each dashboard category MUST be different and distinct
- if {num_dashboards} = 1, then only output Dashboard #1 - Required Skills, if {num_dashboards} = 2, then output Dashboard #1 - Required Skills and Dashboard #2 - [Category Name] and if {num_dashboards} = 3 or more, then output Dashboard #1 - Required Skills and Dashboard #2 - [Category Name] and Dashboard #3 - [Category Name] and so on.
- Each dashboard MUST have at least 3 items
- Numbers should be rounded to one decimal place
- If information for a requested dashboard is not available in the job description, create a relevant category that would be useful for this job position

Job Description:
{context}"""
        
        # Calculate remaining dashboards
        remaining_dashboards = max(0, num_dashboards - 1)
        
        # Format the template with the appropriate values
        prompt = dashboard_template.format(
            num_dashboards=num_dashboards,
            remaining_dashboards=remaining_dashboards,
            context=job_description.raw_text
        )
        
        # Call LLM with our custom prompt
        dashboard_result = await llm_service.generate_with_gemini(prompt)
        
        # Parse the dashboard results
        skills_data, content, thresholds, selected_prompts = await parse_dashboards(dashboard_result)
        
        # Extract job title from job_description
        job_title = job_description.title
        roles = [job_title]
        
        # Clean up skills data structure
        cleaned_skills_data = {key: value for key, value in skills_data.items() 
                              if key not in ["skills", "categories"]}
              
        # Build response dictionary
        response_dict = {
            "roles": roles,
            "skills_data": {roles[0]: cleaned_skills_data},
            "content": content,
            "analysis": {
                "role": roles[0],
                "skills": cleaned_skills_data
            }
        }
        
        selection_threshold, rejection_threshold = thresholds
        
        # Convert selected_prompts from list to string
        selected_prompts_str = "\n".join(selected_prompts) if selected_prompts else ""
        
        try:
            # Update JobDescription with skills data
            job_description.required_skills = json.dumps(cleaned_skills_data)
            job_description.keywords = ", ".join(selected_prompts) if selected_prompts else ""
            job_description.threshold_score = selection_threshold
            
            # Find existing ThresholdScore entry to update
            existing_threshold = db.query(ThresholdScore).filter(ThresholdScore.job_id == job_id).first()
            
            if existing_threshold:
                # Update existing threshold score entry
                existing_threshold.selection_score = selection_threshold
                existing_threshold.rejection_score = rejection_threshold
                existing_threshold.threshold_value = (selection_threshold + rejection_threshold) / 2
                existing_threshold.threshold_result = response_dict
                existing_threshold.threshold_prompts = selected_prompts_str
            else:
                # If no threshold record exists (unlikely), create one
                threshold_score = ThresholdScore(
                    user_id=user_id,
                    job_id=job_id,
                    selection_score=selection_threshold,
                    rejection_score=rejection_threshold, 
                    threshold_value=(selection_threshold + rejection_threshold) / 2,
                    threshold_result=response_dict,
                    threshold_prompts=selected_prompts_str,
                    custom_prompts="",
                    sample_prompts_history=""
                )
                db.add(threshold_score)
            
            db.commit()
            
            return DashboardResponse(
                job_id=job_id,
                roles=roles,
                skills_data={roles[0]: skills_data},
                formatted_data=response_dict,
                status="success",
                raw_response=content,
                selected_prompts=selected_prompts_str,
                data=response_dict
            )
        except Exception as db_error:
            db.rollback()
            logger.error(f"Database error: {str(db_error)}")
            raise HTTPException(status_code=500, detail=f"Database error: {str(db_error)}")
        finally:
            db.close()
    except Exception as e:
        logger.error(f"Dashboard update error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Helper function to parse job basic information
async def parse_job_info(extraction_result):
    # Extract basic info
    basic_info = {}
    basic_info_match = re.search(r'Basic Information:(.*?)(?:Primary Responsibilities:|$)', extraction_result, re.DOTALL)
    if basic_info_match:
        basic_info_text = basic_info_match.group(1)
        for line in basic_info_text.strip().split('\n'):
            if ':' in line:
                key, value = line.split(':', 1)
                key = key.strip('- ')
                basic_info[key] = value.strip()
    
    # Extract responsibilities
    responsibilities_match = re.search(r'Primary Responsibilities:(.*?)$', extraction_result, re.DOTALL)
    responsibilities = responsibilities_match.group(1).strip() if responsibilities_match else ""
    
    return basic_info, responsibilities

# Helper function to parse dashboard information
async def parse_dashboards(dashboard_result):
    # Extract dashboard content
    dashboard_pattern = r'Dashboard #(\d+) - ([^:]+):(.*?)(?=Dashboard #\d+|Threshold Recommendations:|$)'
    dashboard_matches = re.findall(dashboard_pattern, dashboard_result, re.DOTALL)
    
    # Initialize dynamic categories structure
    skills_data = {}
    selected_prompts = []
    
    # Process each dashboard
    for dashboard_num, dashboard_name, dashboard_content in dashboard_matches:
        dashboard_name = dashboard_name.strip()
        category_key = dashboard_name.lower().replace(' ', '_')
        selected_prompts.append(f"Skills category: {dashboard_name}")
        
        # Create a new category if it doesn't exist
        if category_key not in skills_data:
            skills_data[category_key] = {}
        
        # Process items in this dashboard
        for item_line in dashboard_content.strip().split('\n'):
            if ':' in item_line:
                item_parts = item_line.strip('- ').split(':', 1)
                if len(item_parts) >= 2:
                    item_name = item_parts[0].strip()
                    selected_prompts.append(f"Item: {item_name}")
                    
                    # Extract metrics
                    importance_match = re.search(r'Importance: (\d+(?:\.\d+)?)%', item_line)
                    rating_match = re.search(r'Rating: (\d+(?:\.\d+)?)/10', item_line)
                    
                    importance = float(importance_match.group(1)) if importance_match else 0
                    rating = float(rating_match.group(1)) if rating_match else 0
                    
                    # Add item data to the appropriate category
                    skills_data[category_key][item_name] = {
                        "importance": importance,
                        "rating": rating
                    }
                    
                    # Also add to a special "skills" category for backward compatibility
                    # Only if the dashboard is the "Required Skills" dashboard or first dashboard
                    if dashboard_num == "1" or "required skills" in dashboard_name.lower():
                        if "skills" not in skills_data:
                            skills_data["skills"] = {}
                        skills_data["skills"][item_name] = {
                            "importance": importance,
                            "rating": rating
                        }
    
    # Extract threshold recommendations
    thresholds_match = re.search(r'Threshold Recommendations:(.*?)', dashboard_result, re.DOTALL)
    selection_threshold = 70
    rejection_threshold = 30
    
    if thresholds_match:
        thresholds_text = thresholds_match.group(1)
        selection_match = re.search(r'Selection Threshold: (\d+)%', thresholds_text)
        rejection_match = re.search(r'Rejection Threshold: (\d+)%', thresholds_text)
        
        if selection_match:
            selection_threshold = int(selection_match.group(1))
        if rejection_match:
            rejection_threshold = int(rejection_match.group(1))

    # Create a categories structure for backward compatibility
    categories = {}
    for category_name, category_items in skills_data.items():
        if category_name != "skills":  # Skip the special skills category
            categories[category_name] = category_items

    # Add categories to skills_data
    skills_data["categories"] = categories

    return skills_data, dashboard_result, (selection_threshold, rejection_threshold), selected_prompts
# Get individual JobDescription
@analyze_job_description_router.get("/api/job-description/{job_id}", response_model=Dict[str, Any])
async def get_job_description(job_id: int, db: Session = Depends(get_db)):
    """
    Get job description with related skills and threshold scores
    """
    try:
        # Get job description
        job = db.query(JobDescription).filter(JobDescription.job_id == job_id).first()
        if not job:
            raise HTTPException(status_code=404, detail=f"Job with ID {job_id} not found")
        
        # Get skills
        job_skills = db.query(JobRequiredSkills).filter(JobRequiredSkills.job_id == job_id).all()
        skills_data = []
        
        for job_skill in job_skills:
            skill = db.query(Skill).filter(Skill.skill_id == job_skill.skill_id).first()
            if skill:
                skills_data.append({
                    "skill_id": skill.skill_id,
                    "skill_name": skill.skill_name,
                    "skill_type": skill.skill_type,
                    "importance": job_skill.importance,
                    "selection_weight": job_skill.selection_weight,
                    "rejection_weight": job_skill.rejection_weight
                })
        
        # Get threshold scores
        threshold = db.query(ThresholdScore).filter(ThresholdScore.job_id == job_id).first()
        threshold_data = None
        
        if threshold:
            threshold_data = {
                "threshold_id": threshold.threshold_id,
                "threshold_prompts": threshold.threshold_prompts,
            }
        
        # Return combined data
        return {
            "job_id": job.job_id,
            "title": job.title,
            "description": job.description,
            "experience_level": job.experience_level,
            "education_requirements": job.education_requirements,
            "department": job.department,
            "skills": skills_data,
            "threshold_scores": threshold_data,
            "threshold_settings": {
                "job_match_benchmark": job.job_match_benchmark,
                "high_score_threshold": job.high_score_threshold,
                "high_match_threshold": job.high_match_threshold,
                "mid_score_threshold": job.mid_score_threshold,
                "mid_match_threshold": job.mid_match_threshold,
                "critical_skill_importance": job.critical_skill_importance,
                "experience_score_multiplier": job.experience_score_multiplier
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving job description: {str(e)}")

@analyze_job_description_router.delete("/api/delete-job/{job_id}")
async def delete_job(job_id: int, db: Session = Depends(get_db)):
    try:
        # Check if the job exists first
        job = db.query(JobDescription).filter(JobDescription.job_id == job_id).first()
        if not job:
            raise HTTPException(status_code=404, detail="Job description not found")

        # Delete records in proper order to handle foreign key constraints
        
        # Check for related Interviews
        interviews = db.query(Interview).filter(Interview.job_id == job_id).all()
        if interviews:
            db.query(Interview).filter(Interview.job_id == job_id).delete()
            logger.info(f"Deleted {len(interviews)} interviews related to job ID {job_id}")
            
        # Check for related Discussions
        discussions = db.query(Discussion).filter(Discussion.job_id == job_id).all()
        if discussions:
            db.query(Discussion).filter(Discussion.job_id == job_id).delete()
            logger.info(f"Deleted {len(discussions)} discussions related to job ID {job_id}")
        
        # Delete Candidates - This needs to happen before deleting the job
        # due to the foreign key constraint
        candidates = db.query(Candidate).filter(Candidate.job_id == job_id).all()
        if candidates:
            db.query(Candidate).filter(Candidate.job_id == job_id).delete()
            logger.info(f"Deleted {len(candidates)} candidates related to job ID {job_id}")
        
        # 1. Delete JobRequiredSkills entries
        job_skills = db.query(JobRequiredSkills).filter(JobRequiredSkills.job_id == job_id).all()
        if job_skills:
            db.query(JobRequiredSkills).filter(JobRequiredSkills.job_id == job_id).delete()
            logger.info(f"Deleted {len(job_skills)} required skills related to job ID {job_id}")
        
        # 2. Delete JobRecruiterAssignment (if exists)
        recruiter_assignment = db.query(JobRecruiterAssignment).filter(JobRecruiterAssignment.job_id == job_id).first()
        if recruiter_assignment:
            db.query(JobRecruiterAssignment).filter(JobRecruiterAssignment.job_id == job_id).delete()
            logger.info(f"Deleted recruiter assignment for job ID {job_id}")
        
        # 3. Delete ThresholdScore entries
        threshold_scores = db.query(ThresholdScore).filter(ThresholdScore.job_id == job_id).all()
        if threshold_scores:
            db.query(ThresholdScore).filter(ThresholdScore.job_id == job_id).delete()
            logger.info(f"Deleted {len(threshold_scores)} threshold scores related to job ID {job_id}")
        
        # 4. Finally delete the JobDescription
        db.query(JobDescription).filter(JobDescription.job_id == job_id).delete()
        logger.info(f"Deleted job description with ID {job_id}")
        
        # Commit all deletions
        db.commit()
        
        return {"status": "success", "message": f"Job ID {job_id} and all related data have been deleted successfully"}
        
    except HTTPException as http_exc:
        db.rollback()
        raise http_exc
    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting job: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error deleting job: {str(e)}")

@analyze_job_description_router.get("/api/job_analyses/", response_model=List[JobAnalysisResponse])
async def get_all_job_analyses(db: Session = Depends(get_db)):
    try: 
        # Query all records from the threshold_scores table
        analyses = db.query(ThresholdScore).all()
        
        if not analyses:
            return []
        
        # Create a list to store the responses
        response_list = []
        
        # Convert each database record to a response model
        for analysis in analyses:

            job_id = analysis.job_id
            # Handle threshold_result safely
            threshold_result = {}
            if analysis.threshold_result:
                if isinstance(analysis.threshold_result, str):
                    try:
                        threshold_result = json.loads(analysis.threshold_result)
                    except json.JSONDecodeError:
                        threshold_result = {}
                elif isinstance(analysis.threshold_result, dict):
                    threshold_result = analysis.threshold_result
                elif isinstance(analysis.threshold_result, bytes):
                    try:
                        # Try multiple encodings with error handling
                        for encoding in ['utf-8', 'latin-1', 'cp1252']:
                            try:
                                threshold_result_str = analysis.threshold_result.decode(encoding, errors='replace')
                                threshold_result = json.loads(threshold_result_str)
                                break
                            except (UnicodeDecodeError, json.JSONDecodeError):
                                continue
                    except Exception:
                        # If all attempts fail, use a safe default
                        threshold_result = {}
            
            # Extract roles and skills_data from threshold_result
            roles = threshold_result.get("roles", []) if threshold_result else []
            skills_data = threshold_result.get("skills_data", {}) if threshold_result else {}
            
            # Safely handle threshold_prompts
            threshold_prompts = ""
            if analysis.threshold_prompts:
                if isinstance(analysis.threshold_prompts, str):
                    threshold_prompts = analysis.threshold_prompts
                elif isinstance(analysis.threshold_prompts, bytes):
                    try:
                        # Try multiple encodings with error handling
                        for encoding in ['utf-8', 'latin-1', 'cp1252']:
                            try:
                                threshold_prompts = analysis.threshold_prompts.decode(encoding, errors='replace')
                                break
                            except UnicodeDecodeError:
                                continue
                    except Exception:
                        threshold_prompts = "[Binary data could not be decoded]"
            
            # Safely handle custom_prompts
            custom_prompts = ""
            if analysis.custom_prompts:
                if isinstance(analysis.custom_prompts, str):
                    custom_prompts = analysis.custom_prompts
                elif isinstance(analysis.custom_prompts, bytes):
                    try:
                        # Try multiple encodings with error handling
                        for encoding in ['utf-8', 'latin-1', 'cp1252']:
                            try:
                                custom_prompts = analysis.custom_prompts.decode(encoding, errors='replace')
                                break
                            except UnicodeDecodeError:
                                continue
                    except Exception:
                        custom_prompts = "[Binary data could not be decoded]"
            
            # Create a default basic_info object with empty strings instead of None
            basic_info = {
                "position_title": roles[0] if roles and roles[0] else "Unknown Position",
                "required_experience": "Not specified",
                "location": "",  # Empty string instead of None
                "position_type": "",  # Empty string instead of None
                "office_timings": ""  # Empty string instead of None
            }
            
            # Construct the response dict - ensure all data is serializable
            response_dict = {
                "roles": roles,
                "skills_data": skills_data,
                "content": threshold_prompts,
                "analysis": {
                    "role": roles[0] if roles and len(roles) > 0 else "",
                    "skills": skills_data
                },
                "database_id": analysis.threshold_id,
                "job_id": analysis.job_id
            }
            
            # Create response object without selection_threshold and rejection_threshold
            response = JobAnalysisResponse(
                roles=roles,
                skills_data=skills_data,
                formatted_data=response_dict,
                selection_threshold=0.0,
                rejection_threshold=0.0,
                status="success",
                job_id=job_id,
                raw_response=threshold_prompts,
                selected_prompts=custom_prompts,
                database_id=analysis.threshold_id,
                basic_info=basic_info,
                data=response_dict
            )
            response_list.append(response)
        
        return response_list
    except Exception as e:
        logger.error(f"Error retrieving all job analyses: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@analyze_job_description_router.get("/api/threshold-details/{threshold_id}", response_model=Dict[str, Any])
async def get_threshold_details(threshold_id: int, db: Session = Depends(get_db)):
    """
    Get detailed information related to a threshold record, including any associated job details
    """
    try:
        # Get the threshold record
        threshold = db.query(ThresholdScore).filter(ThresholdScore.threshold_id == threshold_id).first()
        
        if not threshold:
            raise HTTPException(status_code=404, detail=f"Threshold with ID {threshold_id} not found")
        
        # Base response with threshold data
        response = {
            "threshold_id": threshold.threshold_id,
            "threshold_prompts": threshold.threshold_prompts,
        }
        
        # Try to get associated job if available
        if threshold.job_id:
            job = db.query(JobDescription).filter(JobDescription.job_id == threshold.job_id).first()
            if job:
                response.update({
                    "job_id": job.job_id,
                    "title": job.title,
                    "description": job.description,
                    "experience_level": job.experience_level,
                    "education_requirements": job.education_requirements,
                    "department": job.department,
                    "required_skills": job.required_skills
                })
        
        # Include threshold_result if available
        if threshold.threshold_result:
            if isinstance(threshold.threshold_result, dict):
                response["threshold_result"] = threshold.threshold_result
            elif isinstance(threshold.threshold_result, str):
                try:
                    response["threshold_result"] = json.loads(threshold.threshold_result)
                except json.JSONDecodeError:
                    response["threshold_result"] = {"raw": threshold.threshold_result}
        
        return response
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Error retrieving threshold details: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error retrieving threshold details: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(analyze_job_description_router, host="0.0.0.0", port=8000)