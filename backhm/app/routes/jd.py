from fastapi import APIRouter, FastAPI, HTTPException, Query
import os
from typing import Optional, Dict, List, Any
from fastapi import FastAPI, HTTPException, File, UploadFile
from pydantic import BaseModel, Field
from fastapi.responses import JSONResponse
from fastapi import Depends
import re
import logging
import traceback
import json
import asyncio
from httpx import AsyncClient
from fastapi import FastAPI, HTTPException
import requests
import random
import google.generativeai as genai


# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
CreateJD_router = APIRouter(
     tags=["Job Description"]
)

# Define request model using Pydantic
class JobDescriptionRequest(BaseModel):
    position_title: str = Field(..., description="Job title for the position")
    required_experience: str = Field(..., description="Required experience level for the position")
    location: Optional[str] = Field(None, description="Job location (optional)")
    position_type: Optional[str] = Field(None, description="Type of position (e.g., Full-time, Part-time)")
    office_timings: Optional[str] = Field(None, description="Office hours and timing information")
    role_details: Optional[str] = Field(None, description="Additional details about the role")

# Define response model
class JobDescriptionResponse(BaseModel):
    job_description: str = Field(..., description="Generated job description")

def generate_job_description(
    position_title: str,
    required_experience: str,
    location: Optional[str] = None,
    position_type: Optional[str] = None,
    office_timings: Optional[str] = None,
    role_details: Optional[str] = None
) -> str:
    """
    Generate a job description using Gemini 2.0 Flash API based on provided inputs.
    """
    if not position_title or not required_experience:
        raise HTTPException(status_code=400, detail="Position Title and Required Experience are mandatory fields.")
    
    try:
        # Forward request to the LLM service API endpoint
        async def call_api():
            async with AsyncClient() as client:
                request_data = {
                    "position_title": position_title,
                    "required_experience": required_experience,
                    "location": location,
                    "position_type": position_type, 
                    "office_timings": office_timings,
                    "role_details": role_details
                }
                
                response = await client.post(
                    "http://127.0.0.1:8000/api/generate_job_description/",
                    json=request_data
                )
                
                if response.status_code != 200:
                    raise HTTPException(
                        status_code=response.status_code,
                        detail=f"Failed to generate job description: {response.text}"
                    )
                
                return response.json().get("job_description", "")
        
        # Run the async function in a synchronous context
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        result = loop.run_until_complete(call_api())
        loop.close()
        
        return result
    except Exception as e:
        logger.error(f"Error generating job description: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error generating job description: {str(e)}")

# Create API endpoint
@CreateJD_router.post("/generate-job-description", response_model=JobDescriptionResponse, tags=["Job Description"])
async def api_generate_job_description(request: JobDescriptionRequest):
    """
    Generate a professional job description based on the provided details.
    
    - Requires position title and experience level
    - Optional fields include location, position type, office timings, and role details
    - Returns a formatted job description with standard sections
    """
    job_description = generate_job_description(
        position_title=request.position_title,
        required_experience=request.required_experience,
        location=request.location,
        position_type=request.position_type,
        office_timings=request.office_timings,
        role_details=request.role_details
    )
    
    return JobDescriptionResponse(job_description=job_description)

# Configure logging
class PromptRecommendation(BaseModel):
    prompt_id: int
    title: str
    description: str
    prompt_text: str

class PromptRequestModel(BaseModel):
    threshold_id: int
    threshold_result: Optional[Dict[str, Any]] = None
    title: Optional[str] = None

@CreateJD_router.post("/api/recommended-prompts", response_model=List[PromptRecommendation])
def get_recommended_prompts(request: PromptRequestModel) -> List[PromptRecommendation]:
    """
    Generate 5 recommended prompts based on the actual content from the threshold data.
    
    Args:
        request: Object containing threshold_id and optional threshold result data
        
    Returns:
        List of 5 prompt recommendations
    """
    try:
        # Use the provided threshold data if available, otherwise fetch it
        if request.threshold_result:
            threshold_data = {
                "threshold_id": request.threshold_id,
                "threshold_result": request.threshold_result,
                "title": request.title
            }
        else:
            # Only fetch if not provided
            threshold_data = fetch_threshold_details(request.threshold_id)
        
        # Generate prompts based on the actual dashboard content
        prompts = generate_dynamic_prompts(threshold_data)
        
        return prompts
        
    except Exception as e:
        logger.error(f"Error generating prompts for threshold ID {request.threshold_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating prompts: {str(e)}")

# Keep the original GET endpoint for backward compatibility
@CreateJD_router.get("/api/recommended-prompts/{threshold_id}", response_model=List[PromptRecommendation])
def get_recommended_prompts_by_id(threshold_id: int) -> List[PromptRecommendation]:
    """
    Generate 5 recommended prompts based on the threshold ID.
    This endpoint fetches the threshold data first.
    
    Args:
        threshold_id: The ID of the threshold to use for generating prompts
        
    Returns:
        List of 5 prompt recommendations
    """
    try:
        # Fetch threshold details directly
        threshold_data = fetch_threshold_details(threshold_id)
        
        # Generate prompts based on the actual dashboard content
        prompts = generate_dynamic_prompts(threshold_data)
        
        return prompts
        
    except Exception as e:
        logger.error(f"Error generating prompts for threshold ID {threshold_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating prompts: {str(e)}")

# Add new endpoint to get threshold IDs
class ThresholdIdResponse(BaseModel):
    threshold_id: int
    job_id: Optional[int] = None

@CreateJD_router.get("/api/threshold-ids", response_model=List[ThresholdIdResponse])
def get_threshold_ids(job_id: Optional[int] = None):
    """
    Get threshold IDs from the threshold_scores table.
    Optionally filter by job_id.
    
    Args:
        job_id: Optional job ID to filter threshold IDs
        
    Returns:
        List of threshold IDs
    """
    try:
        # Simulate fetching from a database for now
        # In a real implementation, you would query the threshold_scores table
        
        # This is a placeholder implementation
        threshold_mappings = [
            {"threshold_id": 123, "job_id": 1},
            {"threshold_id": 140, "job_id": 2},
            {"threshold_id": 156, "job_id": 3},
            {"threshold_id": 78, "job_id": 4},
            {"threshold_id": 199, "job_id": 5},
            {"threshold_id": 200, "job_id": 6}
        ]
        
        if job_id:
            # Filter by job_id if provided
            results = [
                ThresholdIdResponse(threshold_id=item["threshold_id"], job_id=item["job_id"]) 
                for item in threshold_mappings if item["job_id"] == job_id
            ]
            
            # If no match found, try using job_id as threshold_id
            if not results:
                results = [ThresholdIdResponse(threshold_id=job_id, job_id=job_id)]
        else:
            # Return all mappings
            results = [
                ThresholdIdResponse(threshold_id=item["threshold_id"], job_id=item["job_id"]) 
                for item in threshold_mappings
            ]
        
        return results
        
    except Exception as e:
        logger.error(f"Error getting threshold IDs: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error getting threshold IDs: {str(e)}")

# Add new endpoint for updating dashboard data in the database
class UpdateDashboardRequest(BaseModel):
    threshold_id: int
    job_id: Optional[int] = None
    skills_data: Dict[str, Any]
    prompt: str

class UpdateDashboardResponse(BaseModel):
    threshold_id: int
    job_id: Optional[int] = None
    status: str
    message: str
    updated_at: str

@CreateJD_router.put("/api/update_dashboard_data/", response_model=UpdateDashboardResponse)
def update_dashboard_data(request: UpdateDashboardRequest):
    """
    Update dashboard data directly in the threshold_scores and job_descriptions tables.
    
    Args:
        request: Object containing threshold_id, job_id, skills_data, and the prompt that was used
        
    Returns:
        Object with update status and details
    """
    try:
        threshold_id = request.threshold_id
        job_id = request.job_id
        skills_data = request.skills_data
        prompt = request.prompt
        
        logger.info(f"Updating dashboard data for threshold_id={threshold_id}, job_id={job_id}")
        logger.info(f"Prompt used: {prompt}")
        
        # Log the skills_data structure for debugging
        skills_data_type = type(skills_data).__name__
        logger.info(f"Skills data type: {skills_data_type}")
        
        # Ensure skills_data is a dict
        if isinstance(skills_data, list):
            logger.warning(f"Received skills_data as a list with {len(skills_data)} items, converting to dict")
            if len(skills_data) > 0:
                skills_data = skills_data[0]
            else:
                skills_data = {}
        
        # In a real implementation, you would update the actual database tables
        # For example:
        # 1. Update threshold_scores table with the new skills_data
        # 2. Update job_descriptions table with relevant information
        
        # For this implementation, we'll log what would be updated
        if threshold_id:
            logger.info(f"Would update threshold_scores where threshold_id={threshold_id}")
            # In real implementation: db.query(ThresholdScores).filter(ThresholdScores.id == threshold_id).update(...)
            
        if job_id:
            logger.info(f"Would update job_descriptions where job_id={job_id}")
            # In real implementation: db.query(JobDescriptions).filter(JobDescriptions.id == job_id).update(...)
        
        # Parse the skills_data to understand what was changed
        changes = []
        try:
            for role in skills_data:
                role_data = skills_data[role]
                for category in role_data:
                    category_data = role_data[category]
                    for skill_name, skill_data in category_data.items():
                        importance = skill_data.get("importance")
                        rating = skill_data.get("rating")
                        changes.append(f"{skill_name}: importance={importance}, rating={rating}")
        except Exception as parse_error:
            logger.error(f"Error parsing skills_data: {str(parse_error)}")
            logger.error(f"Skills data content: {skills_data}")
        
        logger.info(f"Changes detected: {', '.join(changes[:5])}{' and more...' if len(changes) > 5 else ''}")
        
        # Get current timestamp
        from datetime import datetime
        current_time = datetime.now().isoformat()
        
        return UpdateDashboardResponse(
            threshold_id=threshold_id,
            job_id=job_id,
            status="success",
            message=f"Updated {len(changes)} skills based on prompt",
            updated_at=current_time
        )
        
    except Exception as e:
        logger.error(f"Error updating dashboard data: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error updating dashboard data: {str(e)}")

@CreateJD_router.put("/api/update-dashboard-data", response_model=UpdateDashboardResponse)
def update_dashboard_data_alt(request: UpdateDashboardRequest):
    """
    Alternative route for update_dashboard_data with hyphenated URL to match frontend.
    This is an alias to the main update_dashboard_data endpoint.
    """
    return update_dashboard_data(request)

def fetch_threshold_details(threshold_id: int) -> Dict[str, Any]:
    """Fetch threshold details from the existing API"""
    try:
        # Use direct URL with proper error handling
        response = requests.get(f"http://127.0.0.1:8000/api/threshold-details/{threshold_id}", timeout=10)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.Timeout:
        logger.error(f"Timeout fetching threshold details for ID {threshold_id}")
        raise HTTPException(status_code=504, detail=f"Timeout fetching threshold details")
    except requests.exceptions.RequestException as e:
        logger.error(f"Error fetching threshold details: {str(e)}")
        raise HTTPException(status_code=502, detail=f"Error fetching threshold details: {str(e)}")

def generate_dynamic_prompts(threshold_data: Dict[str, Any]) -> List[PromptRecommendation]:
    """Generate 5 recommended prompts based on actual threshold content"""
    prompts = []
    
    # Extract content from threshold data
    content = ""
    role = ""
    skills_data = {}
    dashboard_categories = []
    
    if "threshold_result" in threshold_data:
        result = threshold_data["threshold_result"]
        content = result.get("content", "")
        
        if "roles" in result and result["roles"]:
            role = result["roles"][0]
            
        if "skills_data" in result and role in result["skills_data"]:
            skills_data = result["skills_data"][role]
            dashboard_categories = list(skills_data.keys())
            
        elif "analysis" in result and "skills" in result["analysis"]:
            skills_data = result["analysis"]["skills"]
            dashboard_categories = list(skills_data.keys())
    
    # If we have content from the dashboard output, use it to generate prompts
    if content:
        # Extract dashboard categories and items from content
        dashboard_info = parse_dashboard_content(content)
        
        # Generate specific prompts based on the actual content
        if dashboard_info:
            # 1. Prompt for rebalancing top skills in a specific dashboard
            if len(dashboard_info) > 0:
                first_dashboard = dashboard_info[0]
                category = first_dashboard["category"]
                items = first_dashboard["items"]
                
                if len(items) >= 2:
                    item1 = items[0]["name"]
                    item2 = items[1]["name"]
                    prompts.append(PromptRecommendation(
                        prompt_id=1,
                        title=f"Rebalance {category} Skills",
                        description=f"Adjust importance of {item1} and {item2}",
                        prompt_text=f"Rebalance Dashboard #{first_dashboard['number']} - {category} to increase {item1} importance by 15% and reduce {item2} importance accordingly, maintaining 100% total."
                    ))
            
            # 2. Prompt for adding a new relevant item to a dashboard
            if len(dashboard_info) > 1:
                target_dashboard = dashboard_info[1]
                category = target_dashboard["category"]
                
                # Generate a relevant new item based on the category
                new_item = generate_relevant_item(category, role)
                
                prompts.append(PromptRecommendation(
                    prompt_id=2,
                    title=f"Add Item to {category}",
                    description=f"Include {new_item} in {category}",
                    prompt_text=f"Add '{new_item}' with 20% importance to Dashboard #{target_dashboard['number']} - {category}, and adjust other percentages proportionally."
                ))
            
            # 3. Prompt for merging related dashboards
            if len(dashboard_info) >= 3:
                dash1 = dashboard_info[1]
                dash2 = dashboard_info[2]
                cat1 = dash1["category"]
                cat2 = dash2["category"]
                
                prompts.append(PromptRecommendation(
                    prompt_id=3,
                    title=f"Merge {cat1} and {cat2}",
                    description=f"Combine two related dashboard categories",
                    prompt_text=f"Combine Dashboard #{dash1['number']} ({cat1}) and Dashboard #{dash2['number']} ({cat2}) into a single 'Combined Competencies' dashboard with the top items from each, adjusting importance percentages to maintain 100%."
                ))
            
            # 4. Prompt for prioritizing specific skills across all dashboards
            high_priority_skill = ""
            for dashboard in dashboard_info:
                if dashboard["items"]:
                    high_priority_skill = dashboard["items"][0]["name"]
                    break
                    
            if high_priority_skill:
                prompts.append(PromptRecommendation(
                    prompt_id=4,
                    title="Prioritize Key Skills",
                    description=f"Emphasize {high_priority_skill} across dashboards",
                    prompt_text=f"Recalibrate all dashboards to emphasize {high_priority_skill}. For any related items across dashboards, increase their importance by 10% and reduce other items proportionally."
                ))
            
            # 5. Prompt for creating a new specialized dashboard based on job requirements
            job_title = threshold_data.get("title", role)
            specialized_dashboard = generate_specialized_dashboard(job_title, dashboard_info)
            
            prompts.append(PromptRecommendation(
                prompt_id=5,
                title=f"Create {specialized_dashboard['title']} Dashboard",
                description=specialized_dashboard["description"],
                prompt_text=specialized_dashboard["prompt_text"]
            ))
    
    # Ensure we have exactly 5 prompts using fallbacks if needed
    if len(prompts) < 5:
        missing_prompts = generate_fallback_prompts(5 - len(prompts), role, dashboard_categories, threshold_data.get("threshold_id"))
        prompts.extend(missing_prompts)
    
    return prompts[:5]  # Return exactly 5 prompts

def parse_dashboard_content(content: str) -> List[Dict]:
    """Parse dashboard content to extract structured information"""
    dashboard_info = []
    
    # Split content by dashboard headers
    parts = content.split("\n\n")
    current_dashboard = None
    
    for part in parts:
        lines = part.strip().split("\n")
        if not lines:
            continue
            
        # Check if this is a dashboard header
        if lines[0].startswith("Dashboard #"):
            # Parse dashboard header for number and category
            header_parts = lines[0].split(" - ", 1)
            if len(header_parts) == 2:
                dashboard_num = header_parts[0].replace("Dashboard #", "").strip()
                category = header_parts[1].replace(":", "").strip()
                
                current_dashboard = {
                    "number": dashboard_num,
                    "category": category,
                    "items": []
                }
                dashboard_info.append(current_dashboard)
                
                # Process the items in this dashboard
                for i in range(1, len(lines)):
                    item_line = lines[i].strip()
                    if item_line.startswith("- "):
                        # Parse item details
                        item_parts = item_line[2:].split(": Importance: ")
                        if len(item_parts) == 2:
                            item_name = item_parts[0].strip()
                            rating_parts = item_parts[1].split(" Rating: ")
                            if len(rating_parts) == 2:
                                importance = float(rating_parts[0].replace("%", "").strip())
                                rating = float(rating_parts[1].replace("/10", "").strip())
                                
                                current_dashboard["items"].append({
                                    "name": item_name,
                                    "importance": importance,
                                    "rating": rating
                                })
    
    return dashboard_info

def generate_relevant_item(category: str, role: str) -> str:
    """Generate a relevant new item based on the dashboard category and role"""
    category_lower = category.lower()
    role_lower = role.lower()
    
    # Define relevant items based on category patterns
    if "technical" in category_lower or "skill" in category_lower:
        if "data" in role_lower:
            return "MLOps & Model Deployment"
        elif "develop" in role_lower or "engineer" in role_lower:
            return "Containerization & Orchestration"
        else:
            return "Advanced Analytics"
            
    elif "soft" in category_lower or "communication" in category_lower:
        return "Cross-functional Collaboration"
        
    elif "certification" in category_lower or "qualification" in category_lower:
        if "data" in role_lower:
            return "Google Professional Data Engineer"
        elif "cloud" in role_lower:
            return "AWS Solutions Architect"
        else:
            return "PMP Certification"
            
    elif "experience" in category_lower:
        return "Remote Team Collaboration"
        
    elif "cloud" in category_lower or "infrastructure" in category_lower:
        return "Serverless Architecture"
        
    elif "management" in category_lower:
        return "Agile Team Leadership"
        
    elif "domain" in category_lower:
        if "data" in role_lower:
            return "Data Ethics & Privacy"
        else:
            return "Industry Regulations"
            
    # Default fallback
    return "Advanced Problem Solving"

def generate_specialized_dashboard(job_title: str, dashboard_info: List[Dict]) -> Dict:
    """Generate a specialized dashboard recommendation based on job title"""
    job_lower = job_title.lower()
    
    # Check for existing categories to avoid duplicates
    existing_categories = {d["category"].lower() for d in dashboard_info}
    
    if "data" in job_lower and "scientist" in job_lower:
        if "ai ethics" not in existing_categories:
            return {
                "title": "AI Ethics & Responsibility",
                "description": "Create dashboard focusing on ethical AI development",
                "prompt_text": "Create a new 'AI Ethics & Responsibility' dashboard with 5 items covering: Bias Mitigation, Explainable AI, Privacy Protection, Responsible AI Deployment, and Ethical Framework Implementation, with appropriate importance percentages."
            }
    elif "engineer" in job_lower or "develop" in job_lower:
        if "devops practices" not in existing_categories:
            return {
                "title": "DevOps Practices",
                "description": "Add dashboard for modern development practices",
                "prompt_text": "Add a new 'DevOps Practices' dashboard with 5 key items: CI/CD Pipeline Experience, Infrastructure as Code, Monitoring & Observability, Testing Automation, and Incident Response, with balanced importance values."
            }
    elif "manager" in job_lower or "lead" in job_lower:
        if "leadership" not in existing_categories:
            return {
                "title": "Leadership Competencies",
                "description": "Create dashboard for essential leadership skills",
                "prompt_text": "Create a 'Leadership Competencies' dashboard with 5 critical items: Strategic Vision, Team Development, Change Management, Performance Optimization, and Cross-departmental Collaboration, with appropriate importance values."
            }
    
    # Default specialized dashboard
    return {
        "title": "Industry-Specific Expertise",
        "description": "Create dashboard for domain-specific knowledge",
        "prompt_text": "Create a new 'Industry-Specific Expertise' dashboard with 5 areas of specialized knowledge important for this role, including regulatory compliance, industry standards, and domain-specific methodologies."
    }

def generate_fallback_prompts(count: int, role: str, categories: List[str], threshold_id: int = None) -> List[PromptRecommendation]:
    """Generate generic fallback prompts if needed, customized by threshold ID when available"""
    fallbacks = []
    
    # Use threshold ID to add some variation - create a hash from the ID
    prompt_seed = 0
    if threshold_id:
        # Use the threshold ID to seed the variation
        prompt_seed = threshold_id % 10  # Get last digit to create variation
    
    # List of skills that we can reference in prompts
    tech_skills = ["Python", "JavaScript", "Cloud Computing", "Machine Learning", "Data Analysis", 
                   "DevOps", "Containerization", "React", "Node.js", "Microservices"]
    
    soft_skills = ["Communication", "Leadership", "Teamwork", "Problem Solving", 
                  "Critical Thinking", "Adaptability", "Time Management"]
    
    # Select skills based on threshold ID to create variation
    primary_tech = tech_skills[prompt_seed % len(tech_skills)]
    secondary_tech = tech_skills[(prompt_seed + 3) % len(tech_skills)]
    primary_soft = soft_skills[prompt_seed % len(soft_skills)]
    
    # List of dashboard categories with variation
    dashboard_types = ["Technical Skills", "Soft Skills", "Required Experience", 
                      "Certifications", "Domain Knowledge", "Tools Expertise"]
    
    # If we have actual categories from the skills data, use those instead
    if categories and len(categories) > 0:
        dashboard_types = categories[:3] + dashboard_types[:(6-min(3, len(categories)))]
    
    primary_dashboard = dashboard_types[prompt_seed % len(dashboard_types)]
    secondary_dashboard = dashboard_types[(prompt_seed + 2) % len(dashboard_types)]
    
    # Use role or fallback to a generic title
    job_role = role if role else f"Position {threshold_id if threshold_id else 'X'}"
    
    # Create unique fallback templates based on the threshold ID
    fallback_templates = [
        {
            "title": f"Modernize {primary_tech} Requirements",
            "description": f"Update {primary_tech} skills for current industry needs",
            "prompt_text": f"Update the {primary_dashboard} dashboard to emphasize modern {primary_tech} skills required for {job_role} positions in 2025, including advanced frameworks and integration with {secondary_tech}."
        },
        {
            "title": f"Balance Technical and {primary_soft} Skills",
            "description": f"Ensure proper balance between technical and {primary_soft} capabilities",
            "prompt_text": f"Rebalance the {primary_dashboard} and {secondary_dashboard} dashboards to ensure equal emphasis on technical capabilities and {primary_soft} skills, adjusting importance values to 50-50 distribution."
        },
        {
            "title": "Streamline Overlapping Requirements",
            "description": f"Consolidate similar skills for {job_role}",
            "prompt_text": f"Identify and merge overlapping skills between {primary_dashboard} and {secondary_dashboard} dashboards to create a more streamlined set of requirements for {job_role}, combining similar items and recalculating importance percentages."
        },
        {
            "title": "Adapt for Remote Work Environment",
            "description": "Update requirements for remote/hybrid setting", 
            "prompt_text": f"Adjust {primary_dashboard} dashboard to emphasize skills needed for remote/hybrid work environments for {job_role}, increasing importance of digital collaboration and self-management capabilities."
        },
        {
            "title": f"Create Experience Levels for {job_role}",
            "description": "Generate variants for different seniority levels",
            "prompt_text": f"Create three variants of the current {primary_dashboard} dashboard calibrated for Junior, Mid-level, and Senior {job_role} positions, adjusting importance values of {primary_tech} and {primary_soft} skills appropriate for each level."
        },
        {
            "title": f"Add {secondary_tech} Expertise Requirements",
            "description": f"Include missing {secondary_tech} skills",
            "prompt_text": f"Add {secondary_tech} skills to the {primary_dashboard} dashboard with appropriate importance values for a {job_role} position, ensuring they reflect current industry standards."
        },
        {
            "title": "Simplify Dashboard Structure",
            "description": f"Reduce complexity of {job_role} requirements",
            "prompt_text": f"Simplify the {primary_dashboard} dashboard by focusing on the 5 most critical skills for {job_role}, increasing their importance values and removing less essential requirements."
        }
    ]
    
    # Ensure we have enough templates by adding more generic ones if needed
    if len(fallback_templates) < count:
        generic_templates = [
            {
                "title": "Update Certification Requirements",
                "description": "Modernize required certifications",
                "prompt_text": f"Update the certification requirements for {job_role} to include the latest industry-recognized credentials and remove outdated ones."
            },
            {
                "title": "Geographic Flexibility",
                "description": "Adjust for location-independent work",
                "prompt_text": f"Modify requirements to emphasize skills needed for location-independent work for {job_role}, focusing on self-motivation and asynchronous collaboration."
            },
            {
                "title": "Industry-Specific Knowledge",
                "description": f"Add domain expertise for {job_role}",
                "prompt_text": f"Create a specialized dashboard for industry-specific knowledge needed for {job_role}, with appropriate importance values for regulatory compliance and domain practices."
            }
        ]
        fallback_templates.extend(generic_templates)
    
    # Starting index for prompt selection - use threshold ID if available
    start_idx = 0
    if threshold_id:
        start_idx = threshold_id % (len(fallback_templates) - count + 1)
    
    # Select a subset of templates based on the threshold ID for variety
    selected_templates = fallback_templates[start_idx:start_idx + count]
    
    # If we need more, wrap around to the beginning
    if len(selected_templates) < count:
        selected_templates.extend(fallback_templates[:count - len(selected_templates)])
    
    # Create prompts from templates
    for i in range(min(count, len(selected_templates))):
        template = selected_templates[i]
        fallbacks.append(PromptRecommendation(
            prompt_id=i + 1,
            title=template["title"],
            description=template["description"],
            prompt_text=template["prompt_text"]
        ))
    
    return fallbacks

# New class for processing prompts
class ProcessPromptRequest(BaseModel):
    prompt: str
    threshold_id: int
    job_id: Optional[int] = None
    current_dashboards: Optional[Dict[str, Any]] = None

class ProcessPromptResponse(BaseModel):
    threshold_id: int
    job_id: Optional[int] = None
    modified_dashboards: Dict[str, Any]
    changes: List[str]
    status: str
    message: str

@CreateJD_router.post("/api/process-prompt", response_model=ProcessPromptResponse)
def process_prompt(request: ProcessPromptRequest):
    """
    Process a custom prompt to modify dashboard data.
    
    Args:
        request: Object containing the prompt, threshold_id, job_id, and optional current dashboard data
        
    Returns:
        Object with modified dashboard data and change summary
    """
    try:
        prompt = request.prompt
        threshold_id = request.threshold_id
        job_id = request.job_id
        
        logger.info(f"Processing prompt for threshold_id={threshold_id}, job_id={job_id}")
        logger.info(f"Prompt: {prompt}")
        
        # Get the current dashboard data
        current_dashboards = request.current_dashboards
        if not current_dashboards:
            # Fetch threshold details if not provided
            try:
                threshold_data = fetch_threshold_details(threshold_id)
                if "threshold_result" in threshold_data and "skills_data" in threshold_data["threshold_result"]:
                    current_dashboards = threshold_data["threshold_result"]["skills_data"]
                else:
                    logger.warning(f"Could not find skills_data in threshold details for ID {threshold_id}")
                    current_dashboards = {}
            except Exception as fetch_error:
                logger.error(f"Error fetching threshold details: {str(fetch_error)}")
                current_dashboards = {}
        
        if not current_dashboards:
            raise HTTPException(status_code=404, detail="No dashboard data found to modify")
        
        # Generate the prompt for modifying dashboards
        modified_dashboards, changes = apply_prompt_modifications(current_dashboards, prompt, threshold_id)
        
        if not changes:
            logger.warning(f"No changes detected for prompt: {prompt}")
            modified_dashboards = current_dashboards
            changes = ["No changes could be detected in the prompt, please try using different wording"]
        
        # Update the database with the modified dashboard data
        try:
            # This would be where you'd update your actual database
            # For now, we'll just log the changes
            logger.info(f"Would update threshold_scores where threshold_id={threshold_id}")
            logger.info(f"Changes: {', '.join(changes[:5])}{' (and more)' if len(changes) > 5 else ''}")
            
            # Get current timestamp
            from datetime import datetime
            current_time = datetime.now().isoformat()
            
            # Since the update is successful, return the modified dashboards
            return ProcessPromptResponse(
                threshold_id=threshold_id,
                job_id=job_id,
                modified_dashboards=modified_dashboards,
                changes=changes,
                status="success",
                message=f"Successfully applied {len(changes)} changes based on prompt"
            )
        except Exception as update_error:
            logger.error(f"Error updating database: {str(update_error)}")
            raise HTTPException(status_code=500, detail=f"Error updating database: {str(update_error)}")
        
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        logger.error(f"Error processing prompt: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error processing prompt: {str(e)}")

def apply_prompt_modifications(current_dashboards: Dict[str, Any], prompt: str, threshold_id: int) -> tuple:
    """
    Apply modifications to dashboards based on the prompt.
    This function parses the prompt and makes appropriate changes.
    
    Args:
        current_dashboards: Current dashboard data
        prompt: The prompt text containing modification instructions
        threshold_id: ID of the threshold for logging
        
    Returns:
        Tuple containing (modified_dashboards, list_of_changes)
    """
    try:
        # Deep clone the current dashboards to avoid modifying the original
        modified_dashboards = json.loads(json.dumps(current_dashboards))
        changes = []
        
        # Clean and prepare the prompt
        prompt_lines = [line.strip() for line in prompt.split('\n') if line.strip()]
        combined_prompt = ' '.join(prompt_lines)
        logger.info(f"Processing prompt: {combined_prompt}")
        
        # Convert to AI-based modifications if the dashboard structure is complex
        # or if the prompt requires advanced understanding
        if is_complex_modification(prompt):
            return process_with_ai(current_dashboards, prompt, threshold_id)
        
        # Otherwise, use rule-based parsing for simple modifications
        # Check for different types of modifications
        
        # 1. Rebalance importance values
        rebalance_match = re.search(r"Rebalance.*?Dashboard\s+#(\d+)\s*-\s*([^\.]+)\s+to\s+increase\s+([^\.]+)\s+importance\s+by\s+(\d+\.?\d*)%", combined_prompt, re.IGNORECASE)
        if rebalance_match:
            dashboard_num = rebalance_match.group(1)
            category = rebalance_match.group(2).strip()
            skill_to_increase = rebalance_match.group(3).strip()
            increase_amount = float(rebalance_match.group(4))
            
            changes.extend(rebalance_dashboard(modified_dashboards, dashboard_num, category, skill_to_increase, increase_amount))
        
        # 2. Add new item to dashboard
        add_item_match = re.search(r"Add\s+['\"](.*?)['\"]\s+with\s+(\d+\.?\d*)%\s+importance\s+to\s+Dashboard\s+#(\d+)\s*-\s*([^\.]+)", combined_prompt, re.IGNORECASE)
        if add_item_match:
            new_item = add_item_match.group(1)
            importance = float(add_item_match.group(2))
            dashboard_num = add_item_match.group(3)
            category = add_item_match.group(4).strip()
            
            changes.extend(add_item_to_dashboard(modified_dashboards, dashboard_num, category, new_item, importance))
        
        # 3. Set importance or rating directly
        importance_matches = re.finditer(r"(?:Set|Change|Update)\s+(.*?)(?:'s)?\s+(?:importance|selection score)\s+to\s+(\d+\.?\d*)%", combined_prompt, re.IGNORECASE)
        for match in importance_matches:
            skill_name = match.group(1).strip()
            new_value = float(match.group(2))
            
            changes.extend(set_skill_importance(modified_dashboards, skill_name, new_value))
        
        rating_matches = re.finditer(r"(?:Set|Change|Update)\s+(.*?)(?:'s)?\s+rating\s+to\s+(\d+\.?\d*)", combined_prompt, re.IGNORECASE)
        for match in rating_matches:
            skill_name = match.group(1).strip()
            new_rating = float(match.group(2))
            
            changes.extend(set_skill_rating(modified_dashboards, skill_name, new_rating))
        
        # If no changes were detected with rule-based approach, try AI
        if not changes:
            return process_with_ai(current_dashboards, prompt, threshold_id)
        
        return modified_dashboards, changes
        
    except Exception as e:
        logger.error(f"Error applying prompt modifications: {str(e)}")
        logger.error(traceback.format_exc())
        # Return original dashboards if there's an error
        return current_dashboards, [f"Error: {str(e)}"]

def is_complex_modification(prompt: str) -> bool:
    """Determine if the prompt requires AI processing"""
    complex_keywords = [
        "merge", "combine", "create new", "split", "prioritize across", 
        "recalibrate", "strategically", "complex", "comprehensive", "holistic"
    ]
    
    prompt_lower = prompt.lower()
    # Check if any complex keywords are in the prompt
    for keyword in complex_keywords:
        if keyword in prompt_lower:
            return True
    
    # Check if prompt is long and complex
    if len(prompt.split()) > 25:
        return True
    
    return False

def process_with_ai(current_dashboards: Dict[str, Any], prompt: str, threshold_id: int) -> tuple:
    """Process complex modifications using AI"""
    try:
        # Convert current dashboards to a readable text format
        dashboard_text = convert_dashboards_to_text(current_dashboards)
        
        # Create prompt for the AI
        ai_prompt = f"""You are an expert dashboard customization assistant. I have already analyzed a job description and created the following dashboards:

{dashboard_text}

Now I need you to modify these dashboards based on the following request:
{prompt}

When making modifications, please follow these guidelines:
1. Maintain the same format for each item: "[Item Name]: Importance: [X]% Rating: [R]/10"
2. Ensure importance percentages within each dashboard still sum to 100%
3. Recalculate ratings as needed, where Rating = (Importance × 10 ÷ highest importance in category)
4. Keep dashboard headings in the format "Dashboard #N - [Category Name]:"
5. Each dashboard should have 3-7 items
6. Numbers should be rounded to one decimal place

Return the complete modified dashboard set with all dashboards, not just the changed ones.
Format your response exactly as the original but with the requested changes implemented.
"""
        
        # Configure the API
        api_key = os.environ.get("GEMINI_API_KEY", "AIzaSyB3ZN_ICuWtHUypL1vhvORWA7KwoNiKVMw")
        genai.configure(api_key=api_key)
        
        # Initialize the model
        model = genai.GenerativeModel('gemini-2.0-flash')
        
        # Generate the modified analysis
        response = model.generate_content(ai_prompt)
        
        # Parse the AI response back into dashboard structure
        modified_text = response.text
        modified_dashboards = convert_text_to_dashboards(modified_text, current_dashboards)
        
        # Calculate changes between original and modified dashboards
        changes = calculate_changes(current_dashboards, modified_dashboards)
        
        return modified_dashboards, changes
        
    except Exception as e:
        logger.error(f"Error processing with AI: {str(e)}")
        logger.error(traceback.format_exc())
        return current_dashboards, [f"Error processing with AI: {str(e)}"]

def convert_dashboards_to_text(dashboards: Dict[str, Any]) -> str:
    """Convert dashboard data structure to formatted text"""
    if not dashboards:
        return "No dashboard data available."
    
    text_lines = []
    dashboard_num = 1
    
    # Get the first role (assuming there's only one)
    if isinstance(dashboards, dict) and len(dashboards) > 0:
        role_key = next(iter(dashboards))
        role_data = dashboards[role_key]
        
        # Process each category in the role
        for category, items in role_data.items():
            text_lines.append(f"Dashboard #{dashboard_num} - {category}:")
            
            # Add items with their importance and rating
            for item_name, item_data in items.items():
                importance = item_data.get("importance", 0)
                rating = item_data.get("rating", 0)
                text_lines.append(f"- {item_name}: Importance: {importance}% Rating: {rating}/10")
            
            text_lines.append("")  # Add blank line between dashboards
            dashboard_num += 1
    
    return "\n".join(text_lines)

def convert_text_to_dashboards(text: str, original_dashboards: Dict[str, Any]) -> Dict[str, Any]:
    """Convert text format back to dashboard data structure"""
    if not original_dashboards or not isinstance(original_dashboards, dict) or len(original_dashboards) == 0:
        return {}
    
    # Get the original role key
    role_key = next(iter(original_dashboards))
    
    # Create a new structure with the same role
    new_dashboards = {role_key: {}}
    
    # Parse the text to extract dashboards
    dashboard_info = parse_dashboard_content(text)
    
    # Convert parsed info to the dashboard structure
    for dashboard in dashboard_info:
        category = dashboard["category"]
        new_dashboards[role_key][category] = {}
        
        # Add each item
        for item in dashboard["items"]:
            new_dashboards[role_key][category][item["name"]] = {
                "importance": item["importance"],
                "rating": item["rating"]
            }
    
    return new_dashboards

def calculate_changes(original: Dict[str, Any], modified: Dict[str, Any]) -> List[str]:
    """Calculate and describe the changes made between original and modified dashboards"""
    changes = []
    
    # If either is empty, can't compare
    if not original or not modified:
        return ["Complete dashboard replacement"]
    
    # Get the role keys
    orig_roles = set(original.keys())
    mod_roles = set(modified.keys())
    
    # Check for role changes
    if orig_roles != mod_roles:
        changes.append(f"Changed roles from {orig_roles} to {mod_roles}")
    
    # Take the first role (assuming there's only one)
    if len(orig_roles) > 0 and len(mod_roles) > 0:
        orig_role = next(iter(orig_roles))
        mod_role = next(iter(mod_roles))
        
        # Get categories for each
        orig_categories = set(original[orig_role].keys())
        mod_categories = set(modified[mod_role].keys())
        
        # Check for added/removed categories
        added_categories = mod_categories - orig_categories
        removed_categories = orig_categories - mod_categories
        
        for category in added_categories:
            changes.append(f"Added new category: {category}")
        
        for category in removed_categories:
            changes.append(f"Removed category: {category}")
        
        # Check for changes in common categories
        common_categories = orig_categories.intersection(mod_categories)
        for category in common_categories:
            orig_items = set(original[orig_role][category].keys())
            mod_items = set(modified[mod_role][category].keys())
            
            # Check for added/removed items
            added_items = mod_items - orig_items
            removed_items = orig_items - mod_items
            
            for item in added_items:
                importance = modified[mod_role][category][item].get("importance", 0)
                rating = modified[mod_role][category][item].get("rating", 0)
                changes.append(f"Added '{item}' to {category} with importance {importance}% and rating {rating}/10")
            
            for item in removed_items:
                changes.append(f"Removed '{item}' from {category}")
            
            # Check for changes in common items
            common_items = orig_items.intersection(mod_items)
            for item in common_items:
                orig_importance = original[orig_role][category][item].get("importance", 0)
                mod_importance = modified[mod_role][category][item].get("importance", 0)
                orig_rating = original[orig_role][category][item].get("rating", 0)
                mod_rating = modified[mod_role][category][item].get("rating", 0)
                
                if abs(orig_importance - mod_importance) > 0.1:  # Account for floating point differences
                    changes.append(f"Changed '{item}' importance from {orig_importance}% to {mod_importance}%")
                
                if abs(orig_rating - mod_rating) > 0.1:  # Account for floating point differences
                    changes.append(f"Changed '{item}' rating from {orig_rating}/10 to {mod_rating}/10")
    
    return changes

def rebalance_dashboard(dashboards: Dict[str, Any], dashboard_num: str, category: str, skill_to_increase: str, increase_amount: float) -> List[str]:
    """Rebalance a dashboard by increasing one skill's importance and adjusting others"""
    changes = []
    
    try:
        # Get the first role (assuming there's only one)
        if len(dashboards) == 0:
            return ["Error: No dashboard data"]
        
        role_key = next(iter(dashboards))
        role_data = dashboards[role_key]
        
        # Find the right category
        if category not in role_data:
            # Try to find the category by number
            dashboard_count = 1
            target_category = None
            for cat in role_data:
                if dashboard_count == int(dashboard_num):
                    target_category = cat
                    break
                dashboard_count += 1
            
            if target_category:
                category = target_category
            else:
                return [f"Error: Category for Dashboard #{dashboard_num} not found"]
        
        # Get the items in this category
        items = role_data[category]
        
        # Find the skill to increase
        if skill_to_increase not in items:
            # Try to find a partial match
            for item_name in items:
                if skill_to_increase.lower() in item_name.lower():
                    skill_to_increase = item_name
                    break
            
            if skill_to_increase not in items:
                return [f"Error: Skill '{skill_to_increase}' not found in {category}"]
        
        # Calculate current total importance
        total_importance = sum(item["importance"] for item in items.values())
        
        # Get current importance of the skill
        current_importance = items[skill_to_increase]["importance"]
        
        # Calculate new importance
        new_importance = min(current_importance + increase_amount, 100.0)
        
        # Calculate how much we need to reduce other skills
        reduction_needed = new_importance - current_importance
        
        # Distribute reduction proportionally among other skills
        other_skills_total = total_importance - current_importance
        if other_skills_total <= 0:
            return [f"Error: Cannot rebalance as '{skill_to_increase}' has 100% importance"]
        
        # Update the target skill
        items[skill_to_increase]["importance"] = new_importance
        changes.append(f"Increased '{skill_to_increase}' importance from {current_importance}% to {new_importance}%")
        
        # Reduce other skills proportionally
        for item_name, item_data in items.items():
            if item_name != skill_to_increase:
                original_value = item_data["importance"]
                proportion = item_data["importance"] / other_skills_total
                reduction = reduction_needed * proportion
                new_value = max(0, original_value - reduction)
                item_data["importance"] = round(new_value, 1)
                changes.append(f"Decreased '{item_name}' importance from {original_value}% to {new_value}%")
        
        # Recalculate ratings
        max_importance = max(item["importance"] for item in items.values())
        if max_importance > 0:
            for item_name, item_data in items.items():
                old_rating = item_data["rating"]
                new_rating = round((item_data["importance"] * 10) / max_importance, 1)
                item_data["rating"] = new_rating
                if abs(old_rating - new_rating) > 0.1:
                    changes.append(f"Updated '{item_name}' rating from {old_rating}/10 to {new_rating}/10")
        
        return changes
        
    except Exception as e:
        logger.error(f"Error in rebalance_dashboard: {str(e)}")
        return [f"Error rebalancing dashboard: {str(e)}"]

def add_item_to_dashboard(dashboards: Dict[str, Any], dashboard_num: str, category: str, new_item: str, importance: float) -> List[str]:
    """Add a new item to a dashboard and adjust other items' importance"""
    changes = []
    
    try:
        # Get the first role (assuming there's only one)
        if len(dashboards) == 0:
            return ["Error: No dashboard data"]
        
        role_key = next(iter(dashboards))
        role_data = dashboards[role_key]
        
        # Find the right category
        if category not in role_data:
            # Try to find the category by number
            dashboard_count = 1
            target_category = None
            for cat in role_data:
                if dashboard_count == int(dashboard_num):
                    target_category = cat
                    break
                dashboard_count += 1
            
            if target_category:
                category = target_category
            else:
                return [f"Error: Category for Dashboard #{dashboard_num} not found"]
        
        # Get the items in this category
        items = role_data[category]
        
        # Make sure item doesn't already exist
        if new_item in items:
            old_importance = items[new_item]["importance"]
            items[new_item]["importance"] = importance
            changes.append(f"Updated '{new_item}' importance from {old_importance}% to {importance}%")
        else:
            # Add the new item
            items[new_item] = {
                "importance": importance,
                "rating": 0  # Will be recalculated
            }
            changes.append(f"Added new item '{new_item}' with {importance}% importance")
        
        # Calculate current total importance (including new item)
        total_importance = sum(item["importance"] for item in items.values())
        
        # If total exceeds 100%, scale all items down
        if total_importance > 100:
            scale_factor = 100 / total_importance
            for item_name, item_data in items.items():
                if item_name != new_item:  # Keep the new item at the requested importance
                    old_importance = item_data["importance"]
                    new_importance = round(old_importance * scale_factor, 1)
                    item_data["importance"] = new_importance
                    changes.append(f"Scaled '{item_name}' importance from {old_importance}% to {new_importance}%")
        
        # Recalculate ratings
        max_importance = max(item["importance"] for item in items.values())
        if max_importance > 0:
            for item_name, item_data in items.items():
                new_rating = round((item_data["importance"] * 10) / max_importance, 1)
                if item_name == new_item:
                    item_data["rating"] = new_rating
                    changes.append(f"Set '{new_item}' rating to {new_rating}/10")
                else:
                    old_rating = item_data["rating"]
                    item_data["rating"] = new_rating
                    if abs(old_rating - new_rating) > 0.1:
                        changes.append(f"Updated '{item_name}' rating from {old_rating}/10 to {new_rating}/10")
        
        return changes
        
    except Exception as e:
        logger.error(f"Error in add_item_to_dashboard: {str(e)}")
        return [f"Error adding item to dashboard: {str(e)}"]

def set_skill_importance(dashboards: Dict[str, Any], skill_name: str, new_importance: float) -> List[str]:
    """Set the importance of a skill across all dashboards"""
    changes = []
    
    try:
        # Get the first role (assuming there's only one)
        if len(dashboards) == 0:
            return ["Error: No dashboard data"]
        
        role_key = next(iter(dashboards))
        role_data = dashboards[role_key]
        
        # Find the skill in all categories
        found = False
        for category, items in role_data.items():
            if skill_name in items:
                old_importance = items[skill_name]["importance"]
                items[skill_name]["importance"] = new_importance
                changes.append(f"Changed '{skill_name}' importance in {category} from {old_importance}% to {new_importance}%")
                found = True
                
                # Recalculate ratings for this category
                max_importance = max(item["importance"] for item in items.values())
                if max_importance > 0:
                    for item_name, item_data in items.items():
                        old_rating = item_data["rating"]
                        new_rating = round((item_data["importance"] * 10) / max_importance, 1)
                        item_data["rating"] = new_rating
                        if abs(old_rating - new_rating) > 0.1:
                            changes.append(f"Updated '{item_name}' rating in {category} from {old_rating}/10 to {new_rating}/10")
            else:
                # Try fuzzy matching (e.g. "JavaScript" vs "JavaScript Experience")
                for item_name in list(items.keys()):
                    if skill_name.lower() in item_name.lower() or item_name.lower() in skill_name.lower():
                        old_importance = items[item_name]["importance"]
                        items[item_name]["importance"] = new_importance
                        changes.append(f"Changed '{item_name}' importance in {category} from {old_importance}% to {new_importance}%")
                        found = True
                        
                        # Recalculate ratings for this category
                        max_importance = max(item["importance"] for item in items.values())
                        if max_importance > 0:
                            for item_key, item_data in items.items():
                                old_rating = item_data["rating"]
                                new_rating = round((item_data["importance"] * 10) / max_importance, 1)
                                item_data["rating"] = new_rating
                                if abs(old_rating - new_rating) > 0.1:
                                    changes.append(f"Updated '{item_key}' rating in {category} from {old_rating}/10 to {new_rating}/10")
                        break
        
        if not found:
            changes.append(f"Warning: Skill '{skill_name}' not found in any dashboard")
        
        return changes
        
    except Exception as e:
        logger.error(f"Error in set_skill_importance: {str(e)}")
        return [f"Error setting skill importance: {str(e)}"]

def set_skill_rating(dashboards: Dict[str, Any], skill_name: str, new_rating: float) -> List[str]:
    """Set the rating of a skill across all dashboards"""
    changes = []
    
    try:
        # Get the first role (assuming there's only one)
        if len(dashboards) == 0:
            return ["Error: No dashboard data"]
        
        role_key = next(iter(dashboards))
        role_data = dashboards[role_key]
        
        # Find the skill in all categories
        found = False
        for category, items in role_data.items():
            if skill_name in items:
                old_rating = items[skill_name]["rating"]
                items[skill_name]["rating"] = new_rating
                changes.append(f"Changed '{skill_name}' rating in {category} from {old_rating}/10 to {new_rating}/10")
                found = True
            else:
                # Try fuzzy matching
                for item_name in list(items.keys()):
                    if skill_name.lower() in item_name.lower() or item_name.lower() in skill_name.lower():
                        old_rating = items[item_name]["rating"]
                        items[item_name]["rating"] = new_rating
                        changes.append(f"Changed '{item_name}' rating in {category} from {old_rating}/10 to {new_rating}/10")
                        found = True
                        break
        
        if not found:
            changes.append(f"Warning: Skill '{skill_name}' not found in any dashboard")
        
        return changes
        
    except Exception as e:
        logger.error(f"Error in set_skill_rating: {str(e)}")
        return [f"Error setting skill rating: {str(e)}"]

# Run the application
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)