from fastapi import APIRouter, FastAPI, HTTPException
import os
import google.generativeai as genai
from typing import Optional
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

# Configure the Gemini API (you'll need to set your API key)
# Replace with your actual API key or set it as an environment variable
genai.configure(api_key="AIzaSyB3ZN_ICuWtHUypL1vhvORWA7KwoNiKVMw")

# Initialize the Gemini 2.0 Flash model
model = genai.GenerativeModel('gemini-2.0-flash')

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
    
    # Construct the prompt for Gemini
    prompt = f"""
    Create a professional and comprehensive job description with the following details:

    Position Title: {position_title}
    Required Experience: {required_experience}
    """
    
    # Add optional fields if provided
    if location:
        prompt += f"\nLocation: {location}"
    if position_type:
        prompt += f"\nPosition Type: {position_type}"
    if office_timings:
        prompt += f"\nOffice Timings: {office_timings}"
    if role_details:
        prompt += f"\nRole Details: {role_details}"
    
    prompt += """
    
    Format the job description professionally with the following sections:
    1. Skills required based on the experience level
    2. Job Summary
    3. Responsibilities
    4. Requirements & Qualifications
    6. Education Requirements
    7. Good to have skills (if applicable)
    
    Ensure the job description is engaging, detailed, and tailored specifically to the provided information.
    """
    
    try:
        # Generate content using Gemini 2.0 Flash
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
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
