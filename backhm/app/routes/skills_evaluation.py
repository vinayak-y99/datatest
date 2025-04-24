from fastapi import FastAPI, HTTPException, Depends, UploadFile, File
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
from app.models.base import JobDescription, JobRequiredSkills, Skill, ThresholdScore, User
import app.database.connection as get_db
import re
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

@analyze_job_description_router.post("/api/analyze_job_description/", response_model=JobAnalysisResponse)
async def analyze_job_description(user_id: str, file: UploadFile = File(...), 
                                 num_dashboards: int = Query(ge=1, le=10),
                                 db: Session = Depends(get_db)):
    try:
        # First verify if user exists in database
        user = db.query(User).filter(User.user_id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Extract text from PDF
        text = await process_pdf(file)
        
        # Initialize LLM service
        llm_service = LLMService()
        
        # Create the job description template with dynamic dashboard count
        job_description_template = """Analyze this job description and extract the following information to create {num_dashboards} distinct dashboards for visualizing different aspects of the job:

Basic Information:
- Position Title: [Job Title]
- Required Experience: [X years]
- Location: [City, State/Country]
- Contact: [Email and/or Phone if available]
- Position Type: [Contract or Permanent]
- Department: [Department name]
- Office Timings: [Morning shift or Night shift]
- Education Requirements: [Required education level]

For Dashboard #1 (Required Skills):
Extract key technical skills with their importance (%), selection score (%), rejection score (%), and rating (out of 10).

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
- For each item: Name, Importance (%), Selection Score (%), Rejection Score (%), Rating (out of 10)

Importance Score (Sum: 100% per category): Represents the relative priority of each item based on prominence in the job description.
Selection Score (Sum: 100% across all items): Indicates how much each item contributes to candidate selection.
Rejection Score (Sum: 100% across all items): Indicates how much lacking each item would impact candidate's rejection.
Rating: Score out of 10 calculated as (Importance × 10 ÷ highest importance percentage in that category)

Format your response with CONSISTENT structure as follows with one blank line between each section:

Basic Information:
- Position Title: [Job Title]
- Required Experience: [X years]
- Location: [City, State/Country]
- Contact: [Email and/or Phone if available]
- Position Type: [Contract or Permanent]
- Department: [Department name]
- Office Timings: [Morning shift or Night shift]
- Education Requirements: [Required education level]

Primary Responsibilities: [Main job duties]

if {num_dashboards} = 1:
Then only output Dashboard #1 - Required Skills:
- [Skill Name]: Importance: [X]% Selection Score: [Y]% Rejection Score: [Z]% Rating: [R]/10
- [Next Skill]: Importance: [X]% Selection Score: [Y]% Rejection Score: [Z]% Rating: [R]/10

if {num_dashboards} = 2 :
Dashboard #1 - Required Skills:
- [Skill Name]: Importance: [X]% Selection Score: [Y]% Rejection Score: [Z]% Rating: [R]/10
- [Next Skill]: Importance: [X]% Selection Score: [Y]% Rejection Score: [Z]% Rating: [R]/10

Dashboard #2 - [Category Name]:
- [Item Name]: Importance: [X]% Selection Score: [Y]% Rejection Score: [Z]% Rating: [R]/10
- [Next Item]: Importance: [X]% Selection Score: [Y]% Rejection Score: [Z]% Rating: [R]/10

if {num_dashboards} = 3 or more:
Dashboard #1 - Required Skills:
- [Skill Name]: Importance: [X]% Selection Score: [Y]% Rejection Score: [Z]% Rating: [R]/10
- [Next Skill]: Importance: [X]% Selection Score: [Y]% Rejection Score: [Z]% Rating: [R]/10

Dashboard #2 - [Category Name]:
- [Item Name]: Importance: [X]% Selection Score: [Y]% Rejection Score: [Z]% Rating: [R]/10
- [Next Item]: Importance: [X]% Selection Score: [Y]% Rejection Score: [Z]% Rating: [R]/10

Dashboard #3 - [Category Name]:
- [Item Name]: Importance: [X]% Selection Score: [Y]% Rejection Score: [Z]% Rating: [R]/10
- [Next Item]: Importance: [X]% Selection Score: [Y]% Rejection Score: [Z]% Rating: [R]/10

(Continue for all {num_dashboards} dashboards)

Threshold Recommendations:
- Job Match Benchmark: [X]%
- High Score Threshold: [X]%
- High Match Threshold: [X]%
- Mid Score Threshold: [X]%
- Mid Match Threshold: [X]%
- Critical Skill Importance: [X]%
- Experience Score Multiplier: [X.X]
- Overall Threshold Value: [X]%
- Selection Threshold: [X]%
- Rejection Threshold: [X]%

Rules:
- You MUST extract the position title, required experience, and location if available
- If exact years of experience aren't stated, estimate based on seniority level
- Importance percentages should sum to 100% within each category
- Selection and Rejection scores should each sum to 100% across all items
- Each dashboard category MUST be different and distinct
- if {num_dashboards} = 1, then only output Dashboard #1 - Required Skills, if {num_dashboards} = 2, then only output Dashboard #1 - Required Skills and Dashboard #2 - [Category Name]
- Each dashboard MUST have at least 3 items
- Numbers should be rounded to one decimal place
- If information for a requested dashboard is not available in the job description, create a relevant category that would be useful for this job position
- For threshold recommendations, use standard ranges based on job complexity and seniority

Job Description:
{context}"""
        
        # Calculate remaining dashboards
        remaining_dashboards = max(0, num_dashboards - 1)
        
        # Format the template with the appropriate values
        prompt = job_description_template.format(
            num_dashboards=num_dashboards,
            remaining_dashboards=remaining_dashboards,
            context=text
        )
        
        # Call LLM with our custom prompt
        analysis_result = await llm_service.generate_with_gemini(prompt)
        
        # Parse the analysis results with categories preserved
        basic_info, skills_data, content, thresholds, selected_prompts = await parse_job_analysis(analysis_result)

        # Extract job details from basic_info
        position_title = basic_info.get("Position Title", "Not specified")
        required_experience = basic_info.get("Required Experience", "Not specified")
        location = basic_info.get("Location", "Not specified")
        position_type = basic_info.get("Position Type", "Not specified")
        office_timings = basic_info.get("Office Timings", "Not specified")
        department = basic_info.get("Department", "Not specified")
        education = basic_info.get("Education Requirements", "Not specified")
        job_title = position_title
        roles = [job_title]
        
        # This removes the duplicate "skills" field and the nested "categories" structure
        cleaned_skills_data = {key: value for key, value in skills_data.items() 
                            if key not in ["skills", "categories"]}

        # When preparing the response dictionary
        response_dict = {
            "roles": roles,
            "skills_data": {roles[0]: cleaned_skills_data},  # Only the non-duplicate categories
            "content": content,
            "analysis": {
                "role": roles[0],
                "skills": cleaned_skills_data  # Include all skill categories
            },
            "basic_info": {
                "position_title": position_title,
                "required_experience": required_experience,
                "location": location,
                "position_type": position_type,
                "office_timings": office_timings,
                "department": department,
                "education": education
            }
        }
        
        selection_threshold, rejection_threshold = thresholds
        
        # Convert selected_prompts from list to string
        selected_prompts_str = "\n".join(selected_prompts) if selected_prompts else ""
        
        try:
            # Create JobDescription entry with categorized skills
            job_description = JobDescription(
                title=position_title,
                description=content,
                raw_text=text,
                keywords=", ".join(selected_prompts) if selected_prompts else "",
                status="Active",
                department=department,
                required_skills=json.dumps(cleaned_skills_data),  # Store all non-duplicate categories
                experience_level=required_experience,
                education_requirements=education,
                threshold_score=selection_threshold
        )
            db.add(job_description)
            db.flush()  # To get the job_id
                
                # Create ThresholdScore entry
            threshold_score = ThresholdScore(
                    user_id=user_id,
                    job_id=job_description.job_id,
                    selection_score=selection_threshold,
                    rejection_score=rejection_threshold,
                    threshold_value=(selection_threshold + rejection_threshold) / 2,
                    threshold_result=response_dict,
                    threshold_prompts=selected_prompts_str,
                    custom_prompts="",
                    sample_prompts_history=""
                )
            db.add(threshold_score)
                
            # Add required skills (without category field)
            # for skill_name, skill_data in skills_data["skills"].items():
            #     # First check if skill exists, if not create it
            #     skill = db.query(Skill).filter_by(skill_name=skill_name).first()
            #     if not skill:
            #         # Determine skill type from the categories mapping
            #         skill_type = "Technical"  # Default type
                    
            #         # Find which category this skill belongs to
            #         for category_name, category_skills in skills_data["categories"].items():
            #             if skill_name in category_skills:
            #                 skill_type = map_category_to_skill_type(category_name)
            #                 break
                            
            #         skill = Skill(
            #             skill_name=skill_name,
            #             skill_type=skill_type
            #         )
            #         db.add(skill)
            #         db.flush()
                
            #     # Create JobRequiredSkills entry without category
            # job_skill = JobRequiredSkills(
            #     job_id=job_description.job_id,
            #     skill_id=skill.skill_id,
            #     importance=skill_data.get("importance", 0),
            #     selection_weight=skill_data.get("selection_score", 0),
            #     rejection_weight=skill_data.get("rejection_score", 0)
            # )
            # db.add(job_skill)
            
            db.commit()
        except Exception as db_error:
            db.rollback()
            logger.error(f"Database error: {str(db_error)}")
            raise HTTPException(status_code=500, detail=f"Database error: {str(db_error)}")
        finally:
            db.close()
        
        return JobAnalysisResponse(
            roles=roles,
            skills_data={roles[0]: skills_data},
            formatted_data=response_dict,
            selection_threshold=selection_threshold,
            rejection_threshold=rejection_threshold,
            status="success",
            raw_response=content,
            selected_prompts=selected_prompts_str,
            data=response_dict,
            basic_info={
                "position_title": position_title,
                "required_experience": required_experience,
                "location": location,
                "position_type": position_type,
                "office_timings": office_timings,
                "department": department,
                "education": education
            }
        )
    except Exception as e:
        logger.error(f"Analysis error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Helper function to map category names to skill types
def map_category_to_skill_type(category_name):
    category_name = category_name.lower()
    if any(term in category_name for term in ['technical', 'programming', 'development', 'coding']):
        return "Technical"
    elif any(term in category_name for term in ['soft', 'communication', 'interpersonal']):
        return "Soft Skill"
    elif any(term in category_name for term in ['certification', 'qualification']):
        return "Certification"
    elif any(term in category_name for term in ['domain', 'industry', 'business']):
        return "Domain Knowledge"
    elif any(term in category_name for term in ['management', 'leadership']):
        return "Management"
    else:
        return "Other"

async def parse_job_analysis(analysis_result):
    # Extract basic info
    basic_info = {}
    basic_info_match = re.search(r'Basic Information:(.*?)(?:Primary Responsibilities:|Dashboard #1)', analysis_result, re.DOTALL)
    if basic_info_match:
        basic_info_text = basic_info_match.group(1)
        for line in basic_info_text.strip().split('\n'):
            if ':' in line:
                key, value = line.split(':', 1)
                key = key.strip('- ')
                basic_info[key] = value.strip()
    
    # Extract dashboard content
    dashboard_pattern = r'Dashboard #(\d+) - ([^:]+):(.*?)(?=Dashboard #\d+|Threshold Recommendations:|$)'
    dashboard_matches = re.findall(dashboard_pattern, analysis_result, re.DOTALL)
    
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
                    selection_match = re.search(r'Selection Score: (\d+(?:\.\d+)?)%', item_line)
                    rejection_match = re.search(r'Rejection Score: (\d+(?:\.\d+)?)%', item_line)
                    rating_match = re.search(r'Rating: (\d+(?:\.\d+)?)/10', item_line)
                    
                    importance = float(importance_match.group(1)) if importance_match else 0
                    selection_score = float(selection_match.group(1)) if selection_match else 0
                    rejection_score = float(rejection_match.group(1)) if rejection_match else 0
                    rating = float(rating_match.group(1)) if rating_match else 0
                    
                    # Add item data to the appropriate category
                    skills_data[category_key][item_name] = {
                        "importance": importance,
                        "selection_score": selection_score,
                        "rejection_score": rejection_score,
                        "rating": rating
                    }
                    
                    # Also add to a special "skills" category for backward compatibility
                    # Only if the dashboard is the "Required Skills" dashboard or first dashboard
                    if dashboard_num == "1" or "required skills" in dashboard_name.lower():
                        if "skills" not in skills_data:
                            skills_data["skills"] = {}
                        skills_data["skills"][item_name] = {
                            "importance": importance,
                            "selection_score": selection_score,
                            "rejection_score": rejection_score,
                            "rating": rating
                        }
    
    # Extract threshold recommendations
    thresholds_match = re.search(r'Threshold Recommendations:(.*?)', analysis_result, re.DOTALL)
    selection_threshold = 70
    rejection_threshold = 30
    
    if thresholds_match:
        thresholds_text = thresholds_match.group(1)
        selection_match = re.search(r'Selection Threshold: (\d+(?:\.\d+)?)%', thresholds_text)
        rejection_match = re.search(r'Rejection Threshold: (\d+(?:\.\d+)?)%', thresholds_text)
        
        if selection_match:
            selection_threshold = float(selection_match.group(1))
        if rejection_match:
            rejection_threshold = float(rejection_match.group(1))
    
    # At the end of parse_job_analysis, before returning:

    # Create a categories structure for backward compatibility
    categories = {}
    for category_name, category_items in skills_data.items():
        if category_name != "Skills":  # Skip the special skills category
            categories[category_name] = category_items

    # Add categories to skills_data
    skills_data["categories"] = categories

    return basic_info, skills_data, analysis_result, (selection_threshold, rejection_threshold), selected_prompts

async def generate_with_gemini(self, prompt_text):
    """Generate content using Gemini API."""
    try:
        api_key = "AIzaSyB3ZN_ICuWtHUypL1vhvORWA7KwoNiKVMw"  # Replace with actual key management
        import google.generativeai as genai
        
        # Configure the API
        genai.configure(api_key=api_key)
        
        # Initialize the model
        model = genai.GenerativeModel('gemini-2.0-flash')
        
        # Generate the analysis
        response = await model.generate_content_async(prompt_text)
        
        # Return the analysis text
        return response.text
    except Exception as e:
        logger.error(f"Error generating with Gemini: {str(e)}")
        raise Exception(f"Error generating with Gemini: {str(e)}")
    
@analyze_job_description_router.post("/api/job-description", response_model=Dict[str, Any])
async def create_job_description(job_data: JobRequestData, db: Session = Depends(get_db)):
    """
    Process job description data and save to the database.
    This endpoint handles:
    1. Creating job description
    2. Adding skills and their associations
    3. Setting threshold scores
    """
    try:
        # Extract role data - using first role if multiple roles exist
        role = job_data.roles[0] if job_data.roles else "Not specified"
        
        # Extract skills data for this role
        role_skills_data = job_data.skills_data.get(role, None)
        if not role_skills_data:
            raise HTTPException(status_code=400, detail="Skills data not found for specified role")
        
        # 1. Create Job Description entry
        try:
            # Safely serialize skills data to JSON
            skills_json = json.dumps(role_skills_data.skills)
        except (TypeError, ValueError):
            # If serialization fails, create a simplified version
            simplified_skills = {}
            for key, value in role_skills_data.skills.items():
                try:
                    simplified_skills[key] = {
                        "importance": float(value.importance) if value.importance is not None else 0.0,
                        "selection_score": float(value.selection_score) if value.selection_score is not None else 0.0,
                        "rejection_score": float(value.rejection_score) if value.rejection_score is not None else 0.0,
                        "rating": int(value.rating) if value.rating is not None else 0
                    }
                except (TypeError, ValueError):
                    simplified_skills[key] = {
                        "importance": 0.0,
                        "selection_score": 0.0,
                        "rejection_score": 0.0,
                        "rating": 0
                    }
            skills_json = json.dumps(simplified_skills)
            
        # Create job description with safe defaults for numeric values
        job_desc = JobDescription(
            title=job_data.basic_info.position_title,
            description=job_data.content,
            raw_text=job_data.content,  # Using content as raw text
            keywords=None,  # Not provided in input
            status="Active",  # Default status
            department="Engineering - Software & QA",  # Default department
            required_skills=skills_json,  # Store skills as JSON
            experience_level=job_data.basic_info.required_experience,
            education_requirements="Postgraduate (Any)",  # Default education
            threshold_score=float(job_data.selection_threshold) if job_data.selection_threshold is not None else 0.0,
            activity_type="JOB_CREATION",  # Default activity type
            
            # Threshold values with safe defaults
            job_match_benchmark=65.0,
            high_score_threshold=85.0,
            high_match_threshold=80.0,
            mid_score_threshold=70.0,
            mid_match_threshold=60.0,
            critical_skill_importance=80.0,
            experience_score_multiplier=1.5
        )
        
        db.add(job_desc)
        db.flush()  # Flush to get job_id
        
        # 2. Process Skills and create JobRequiredSkills
        skill_entries = []
        for skill_name, skill_data in role_skills_data.skills.items():
            # Check if skill exists, if not create it
            skill = db.query(Skill).filter(Skill.skill_name == skill_name).first()
            if not skill:
                # Determine skill type with a more robust approach
                skill_type = "Domain"  # Default type
                technical_skills = ["Software Architecture", "Software Development", 
                                    "Operating Systems", "Debugging", "Application Software"]
                soft_skills = ["Technical Leadership", "Communication", "Teamwork", "Problem Solving"]
                
                if skill_name in technical_skills:
                    skill_type = "Technical"
                elif skill_name in soft_skills:
                    skill_type = "Soft"
                
                skill = Skill(
                    skill_name=skill_name,
                    skill_type=skill_type,
                    activity_type="JOB_CREATION"
                )
                db.add(skill)
                db.flush()
            
            # Safely convert numeric values
            try:
                importance = float(skill_data.importance) if skill_data.importance is not None else 0.0
            except (TypeError, ValueError):
                importance = 0.0
                
            try:
                selection_weight = float(skill_data.selection_score) if skill_data.selection_score is not None else 0.0
            except (TypeError, ValueError):
                selection_weight = 0.0
                
            try:
                rejection_weight = float(skill_data.rejection_score) if skill_data.rejection_score is not None else 0.0
            except (TypeError, ValueError):
                rejection_weight = 0.0
            
            # Create JobRequiredSkills entry
            job_skill = JobRequiredSkills(
                job_id=job_desc.job_id,
                skill_id=skill.skill_id,
                importance=importance,
                selection_weight=selection_weight,
                rejection_weight=rejection_weight,
                activity_type="JOB_CREATION"
            )
            db.add(job_skill)
            skill_entries.append({"skill_name": skill_name, "skill_id": skill.skill_id})
        
        # 3. Create ThresholdScore entry
        # Safely handle selected_prompts data
        if job_data.selected_prompts and isinstance(job_data.selected_prompts, str):
            selected_prompts = job_data.selected_prompts
        else:
            selected_prompts = None
            
        # Safely convert threshold values
        try:
            selection_threshold = float(job_data.selection_threshold) if job_data.selection_threshold is not None else 0.0
        except (TypeError, ValueError):
            selection_threshold = 0.0
            
        try:
            rejection_threshold = float(job_data.rejection_threshold) if job_data.rejection_threshold is not None else 0.0
        except (TypeError, ValueError):
            rejection_threshold = 0.0
            
        threshold = ThresholdScore(
            job_id=job_desc.job_id,
            user_id=None,  # Not provided in input
            selection_score=selection_threshold,
            rejection_score=rejection_threshold,
            threshold_value=75.0,  # Default threshold value
            threshold_result=None,  # Will be calculated later
            threshold_prompts=selected_prompts,
            custom_prompts=None,  # Not provided in input
            sample_prompts_history=None,  # Not provided in input
            activity_type="JOB_CREATION",
            threshold_history=None  # Will be populated later
        )
        db.add(threshold)
        
        # Commit all changes
        db.commit()
        
        # Return response
        return {
            "status": "success",
            "job_id": job_desc.job_id,
            "skills_added": len(skill_entries),
            "skills": skill_entries,
            "threshold_id": threshold.threshold_id,
            "message": "Job description and related data successfully saved"
        }
    
    except HTTPException as he:
        # Re-raise HTTP exceptions
        db.rollback()
        raise he
    except Exception as e:
        # Log the error details
        logger.error(f"Error creating job description: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating job description: {str(e)}")

# Additional endpoint for updating threshold scores
@analyze_job_description_router.put("/api/threshold-scores/{job_id}", response_model=Dict[str, Any])
async def update_threshold_scores(
    job_id: int, 
    threshold_data: Dict[str, Any],
    db: Session = Depends(get_db)
):
    """
    Update threshold scores for a job description
    """
    try:
        # Check if job exists
        job = db.query(JobDescription).filter(JobDescription.job_id == job_id).first()
        if not job:
            raise HTTPException(status_code=404, detail=f"Job with ID {job_id} not found")
        
        # Update threshold scores
        threshold = db.query(ThresholdScore).filter(ThresholdScore.job_id == job_id).first()
        if not threshold:
            # Create if not exists
            threshold = ThresholdScore(
                job_id=job_id,
                selection_score=threshold_data.get("selection_score", 0.0),
                rejection_score=threshold_data.get("rejection_score", 0.0),
                threshold_value=threshold_data.get("threshold_value", 0.0),
                threshold_prompts=threshold_data.get("threshold_prompts", None),
                activity_type="THRESHOLD_UPDATE"
            )
            db.add(threshold)
        else:
            # Update existing
            threshold.selection_score = threshold_data.get("selection_score", threshold.selection_score)
            threshold.rejection_score = threshold_data.get("rejection_score", threshold.rejection_score)
            threshold.threshold_value = threshold_data.get("threshold_value", threshold.threshold_value)
            threshold.threshold_prompts = threshold_data.get("threshold_prompts", threshold.threshold_prompts)
            threshold.updated_at = datetime.utcnow()
            
            # Update threshold history
            current_history = threshold.threshold_history or {}
            new_history = {
                "updated_at": datetime.utcnow().isoformat(),
                "selection_score": threshold.selection_score,
                "rejection_score": threshold.rejection_score,
                "threshold_value": threshold.threshold_value
            }
            
            if isinstance(current_history, dict):
                history_list = current_history.get("history", [])
                history_list.append(new_history)
                threshold.threshold_history = {"history": history_list}
            else:
                threshold.threshold_history = {"history": [new_history]}
        
        db.commit()
        
        return {
            "status": "success",
            "threshold_id": threshold.threshold_id,
            "job_id": job_id,
            "message": "Threshold scores updated successfully"
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating threshold scores: {str(e)}")

# Additional endpoint to get job details with skills and thresholds
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
                "selection_score": threshold.selection_score,
                "rejection_score": threshold.rejection_score,
                "threshold_value": threshold.threshold_value,
                "threshold_prompts": threshold.threshold_prompts,
                "created_at": threshold.created_at.isoformat() if threshold.created_at else None,
                "updated_at": threshold.updated_at.isoformat() if threshold.updated_at else None
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
@analyze_job_description_router.post("/run_custom_prompt/")
async def run_custom_prompt(prompt: str, db: Session = Depends(get_db)):
    try:
        # Existing code remains unchanged
        llm_service = LLMService()
        updated_skills_data = await llm_service.process_custom_prompt(prompt)
        
        dashboard_service = DashboardService()
        selection_threshold, rejection_threshold = dashboard_service.calculate_threshold_scores(updated_skills_data)

        response = {
            "status": "success",
            "updated_skills_data": updated_skills_data,
            "selection_threshold": selection_threshold,
            "rejection_threshold": rejection_threshold
        }
        
        # Add database commit here
        db = get_db()
        try:
            # Create ThresholdScore entry for custom prompt
            threshold_score = ThresholdScore(
                user_id=1,  # Default user ID, should be replaced with actual user ID
                job_id=None,  # This is a custom prompt without a specific job
                selection_score=selection_threshold,
                rejection_score=rejection_threshold,
                threshold_value=(selection_threshold + rejection_threshold) / 2,
                threshold_result=response,
                threshold_prompts="",
                custom_prompts=prompt,
                sample_prompts_history=""
            )
            db.add(threshold_score)
            db.commit()
        except Exception as db_error:
            db.rollback()
            logger.error(f"Database error: {str(db_error)}")
        finally:
            db.close()
            
        return response
    except Exception as e:
        logger.error(f"Custom prompt error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@create_dashboards_router.post("/create-dashboards/", response_model=DashboardResponse)
async def create_dashboards(
    roles: List[str],
    skills_data: Dict[str, Any],
    number_of_dashboards: int = 4,
    db: Session = Depends(get_db)
):
    try:
        dashboard_service = DashboardService()
        processed_data = []
        
        for role in roles:
            if role in skills_data:
                dashboard = dashboard_service.create_dynamic_dashboard(
                    skills_data[role],
                    'skills',
                    {
                        'number_of_dashboards': number_of_dashboards,
                        'role': role
                    }
                )
                
                if 'splits' in dashboard:
                    for split in dashboard['splits']:
                        split['role'] = role
                        processed_data.append(split)
                else:
                    processed_data.append({
                        'title': f'{role} Dashboard',
                        'description': f'Complete analysis for {role}',
                        'data': dashboard['data'],
                        'role': role
                    })
        
        selection_threshold, rejection_threshold = dashboard_service.calculate_threshold_scores(skills_data)
        
        # Add database commit here
        db = get_db()
        try: {}
        except Exception as db_error:
            db.rollback()
            logger.error(f"Database error: {str(db_error)}")
        finally:
            db.close()
        
        return DashboardResponse(
            status="success",
            message=f"Successfully created {len(processed_data)} dashboards",
            dashboards=processed_data,
            selection_threshold=selection_threshold,
            rejection_threshold=rejection_threshold,
            number_of_dashboards=number_of_dashboards
        )
    except Exception as e:
        logger.error(f"Dashboard creation error: {str(e)}")
        return DashboardResponse(
            status="error",
            message=str(e),
            dashboards=[],
            selection_threshold=0,
            rejection_threshold=0,
            number_of_dashboards=0
        )
    
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
            
            # Create response object with safe default values for numeric fields
            try:
                selection_threshold = float(analysis.selection_score) if analysis.selection_score is not None else 0.0
            except (ValueError, TypeError):
                selection_threshold = 0.0
                
            try:
                rejection_threshold = float(analysis.rejection_score) if analysis.rejection_score is not None else 0.0
            except (ValueError, TypeError):
                rejection_threshold = 0.0
            
            response = JobAnalysisResponse(
                roles=roles,
                skills_data=skills_data,
                formatted_data=response_dict,
                selection_threshold=selection_threshold,
                rejection_threshold=rejection_threshold,
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
            "selection_score": threshold.selection_score,
            "rejection_score": threshold.rejection_score,
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

# Add this new endpoint to the existing router
@analyze_job_description_router.post("/api/job_details/", response_model=JobAnalysisResponse)
async def process_job_details(user_id: str, job_details: JobDetailsInput, db: Session = Depends(get_db)):
    """
    Process job details and analyze them without requiring file upload.
    This endpoint works similar to /api/analyze_job_description/ but takes JSON input instead of a file.
    """
    try:
        # Verify if user exists in database
        user = db.query(User).filter(User.user_id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Format job details as text
        text = format_job_details_as_text(job_details)
        
        # Create a file-like object to be processed by the existing logic
        file_like = BytesIO(text.encode('utf-8'))
        
        # Create a mock uploaded file
        class MockUploadFile:
            async def read(self):
                return file_like.getvalue()
        
        mock_file = MockUploadFile()
        
        # Use existing service to process the job details
        llm_service = LLMService()
        
        # Call process_resume which now handles job descriptions
        basic_info, job_title, skills_data, content, thresholds, selected_prompts = await llm_service.process_resume(text)
        
        # Extract job details from basic_info
        position_title = basic_info.get("position_title", job_details.position_title)
        required_experience = basic_info.get("required_experience", job_details.required_experience)
        location = basic_info.get("location", job_details.location)
        position_type = basic_info.get("position_type", job_details.position_type)
        office_timings = basic_info.get("office_timings", job_details.office_timings)
        roles = [job_title]
                
        response_dict = {
            "roles": roles,
            "skills_data": {roles[0]: skills_data},
            "content": content,
            "analysis": {
                "role": roles[0],
                "skills": skills_data
            },
            "basic_info": {
                "position_title": position_title,
                "required_experience": required_experience,
                "location": location,
                "position_type": position_type,
                "office_timings": office_timings
            }
        }
        
        selection_threshold, rejection_threshold = thresholds
        
        try:
            # Create JobDescription entry
            job_description = JobDescription(
                title=position_title,
                description=content,
                raw_text=text,
                keywords=", ".join(selected_prompts),
                status="Active",
                department=basic_info.get("department", "Not specified"),
                required_skills=str(skills_data.get("skills", {})),
                experience_level=required_experience,
                education_requirements=basic_info.get("education", "Not specified"),
                threshold_score=selection_threshold
            )
            db.add(job_description)
            db.flush()  # To get the job_id
            
            # Create ThresholdScore entry
            threshold_score = ThresholdScore(
                user_id=user_id,
                job_id=job_description.job_id,
                selection_score=selection_threshold,
                rejection_score=rejection_threshold,
                threshold_value=(selection_threshold + rejection_threshold) / 2,
                threshold_result=response_dict,
                threshold_prompts="\n".join(selected_prompts),
                custom_prompts="",
                sample_prompts_history=""
            )
            db.add(threshold_score)
            
            # Add required skills
            for skill_name, skill_data in skills_data.get("skills", {}).items():
                # First check if skill exists, if not create it
                skill = db.query(Skill).filter_by(skill_name=skill_name).first()
                if not skill:
                    skill = Skill(
                        skill_name=skill_name,
                        skill_type="Technical"  # Default type
                    )
                    db.add(skill)
                    db.flush()
                
                # Create JobRequiredSkills entry
                job_skill = JobRequiredSkills(
                    job_id=job_description.job_id,
                    skill_id=skill.skill_id,
                    importance=skill_data.get("importance", 0),
                    selection_weight=skill_data.get("selection_score", 0),
                    rejection_weight=skill_data.get("rejection_score", 0)
                )
                db.add(job_skill)
            db.commit()
        except Exception as db_error:
            db.rollback()
            logger.error(f"Database error: {str(db_error)}")
        finally:
            db.close()
        
        return JobAnalysisResponse(
            roles=roles,
            skills_data={roles[0]: skills_data},
            formatted_data=response_dict,
            selection_threshold=selection_threshold,
            rejection_threshold=rejection_threshold,
            status="success",
            raw_response=content,
            selected_prompts=selected_prompts,
            data=response_dict,
            basic_info={
                "position_title": position_title,
                "required_experience": required_experience,
                "location": location,
                "position_type": position_type,
                "office_timings": office_timings
            }
        )
    except Exception as e:
        logger.error(f"Analysis error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

def format_job_details_as_text(job_details: JobDetailsInput) -> str:
    """
    Format job details into a text representation that can be processed
    by the LLM service as if it were a PDF file.
    """
    sections = []
    
    # Add job title
    if job_details.position_title:
        sections.append(f"# {job_details.position_title}")
    
    # Add job location
    if job_details.location:
        sections.append(f"Location: {job_details.location}")
    
    # Add position type
    if job_details.position_type:
        sections.append(f"Position Type: {job_details.position_type}")
    
    # Add required experience
    if job_details.required_experience:
        sections.append(f"Required Experience: {job_details.required_experience}")
    
    # Add office timings
    if job_details.office_timings:
        sections.append(f"Office Hours: {job_details.office_timings}")
    
    # Add job description
    if job_details.description:
        sections.append("## Job Description")
        sections.append(job_details.description)
    
    # Add requirements
    if job_details.requirements:
        sections.append("## Requirements")
        for req in job_details.requirements:
            sections.append(f"- {req}")
    
    # Add responsibilities
    if job_details.responsibilities:
        sections.append("## Responsibilities")
        for resp in job_details.responsibilities:
            sections.append(f"- {resp}")
    
    # Add qualifications
    if job_details.qualifications:
        sections.append("## Qualifications")
        for qual in job_details.qualifications:
            sections.append(f"- {qual}")
    
    # Add skills
    if job_details.skills:
        sections.append("## Required Skills")
        for skill in job_details.skills:
            sections.append(f"- {skill}")
    
    return "\n\n".join(sections)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(analyze_job_description_router, host="0.0.0.0", port=8000)