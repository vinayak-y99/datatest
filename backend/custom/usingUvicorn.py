from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import re
import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
import io
import random
import logging
import base64
from PIL import Image
from typing import List, Dict, Any, Optional, Tuple
import google.generativeai as genai

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

logger = logging.getLogger(__name__)

# Models
class JobDescriptionRequest(BaseModel):
    job_description: str
    num_dashboards: int

class DashboardItem(BaseModel):
    importance: float
    selection_score: float
    rejection_score: float
    rating: float

class AnalysisResponse(BaseModel):
    analysis_text: str
    basic_info: Dict[str, str]
    responsibilities: str
    dashboards: Dict[str, Dict[str, DashboardItem]]
    thresholds: Dict[str, float]
    dashboard_images: List[Tuple[str, str]]  # List of (category_name, base64_image)

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
- Each dashboard MUST have at least 3 items
- Numbers should be rounded to one decimal place
- If information for a requested dashboard is not available in the job description, create a relevant category that would be useful for this job position
- For threshold recommendations, use standard ranges based on job complexity and seniority

Job Description:
{context}"""

def parse_dynamic_skills_data(analysis_text):
    """Parse the analysis text to extract structured data with dynamic dashboard categories."""
    data = {
        "basic_info": {},
        "responsibilities": "",
        "dashboards": {},
        "thresholds": {}
    }
    
    # Extract basic information
    basic_info_match = re.search(r"Basic Information:(.*?)(?:Primary Responsibilities:|$)", analysis_text, re.DOTALL)
    if basic_info_match:
        basic_info_text = basic_info_match.group(1).strip()
        for line in basic_info_text.split('\n'):
            if ':' in line:
                key, value = line.split(':', 1)
                key = key.strip('- ')
                data["basic_info"][key] = value.strip()
    
    # Extract primary responsibilities
    resp_match = re.search(r"Primary Responsibilities:(.*?)(?:Dashboard #1|$)", analysis_text, re.DOTALL)
    if resp_match:
        data["responsibilities"] = resp_match.group(1).strip()
    
    # Extract all dashboards dynamically
    dashboard_pattern = r"Dashboard #(\d+) - ([^:]+):(.*?)(?:Dashboard #\d+|Threshold Recommendations:|$)"
    dashboard_matches = re.finditer(dashboard_pattern, analysis_text, re.DOTALL)
    
    for match in dashboard_matches:
        dashboard_num = match.group(1)
        category_name = match.group(2).strip()
        dashboard_content = match.group(3).strip()
        
        data["dashboards"][category_name] = {}
        
        for item_line in dashboard_content.split('\n'):
            if not item_line.strip():
                continue
            item_match = re.search(r"- (.*?): Importance: (\d+\.\d+)% Selection Score: (\d+\.\d+)% Rejection Score: (\d+\.\d+)% Rating: (\d+\.\d+)/10", item_line)
            if item_match:
                item_name, importance, selection, rejection, rating = item_match.groups()
                data["dashboards"][category_name][item_name] = {
                    "importance": float(importance),
                    "selection_score": float(selection),
                    "rejection_score": float(rejection),
                    "rating": float(rating)
                }
    
    # Extract thresholds
    thresholds_match = re.search(r"Threshold Recommendations:(.*?)(?:$)", analysis_text, re.DOTALL)
    if thresholds_match:
        thresholds_text = thresholds_match.group(1).strip()
        for threshold_line in thresholds_text.split('\n'):
            if not threshold_line.strip():
                continue
            threshold_match = re.search(r"- (.*?): (\d+\.\d+)%", threshold_line)
            multiplier_match = re.search(r"- (.*?): (\d+\.\d+)", threshold_line)
            if threshold_match:
                threshold_name, value = threshold_match.groups()
                data["thresholds"][threshold_name] = float(value)
            elif multiplier_match:
                threshold_name, value = multiplier_match.groups()
                data["thresholds"][threshold_name] = float(value)
    
    return data

def generate_dynamic_dashboards(skills_data):
    """Generate multiple dashboard visualizations for the parsed data."""
    if not skills_data or "dashboards" not in skills_data or not skills_data["dashboards"]:
        return []
    
    dashboard_images = []
    
    # Generate a dashboard for each category
    for category_name, items in skills_data["dashboards"].items():
        if not items:
            continue
            
        # Create a figure with subplots for this category
        fig, axs = plt.subplots(2, 2, figsize=(14, 12))
        fig.suptitle(f"Dashboard: {category_name} - {skills_data['basic_info'].get('Position Title', 'Job Position')}", fontsize=16)
        
        # 1. Rating Radar Chart
        ax1 = axs[0, 0]
        item_names = list(items.keys())
        ratings = [items[item]["rating"] for item in item_names]
        
        # Number of variables
        N = len(item_names)
        if N > 0:
            # Compute angles for radar chart
            angles = [n / float(N) * 2 * np.pi for n in range(N)]
            angles += angles[:1]  # Close the loop
            
            # Add the first rating again to close the loop
            ratings += ratings[:1]
            
            # Draw the radar chart
            ax1.plot(angles, ratings, linewidth=1, linestyle='solid')
            ax1.fill(angles, ratings, alpha=0.25)
            
            # Set up the radar chart
            ax1.set_xticks(angles[:-1])
            ax1.set_xticklabels(item_names, fontsize=8)
            ax1.set_yticks([2, 4, 6, 8, 10])
            ax1.set_yticklabels(['2', '4', '6', '8', '10'])
            ax1.set_ylim(0, 10)
            ax1.set_title(f'{category_name} Rating (out of 10)')
        else:
            ax1.text(0.5, 0.5, "No data available", ha='center', va='center')
        
        # 2. Importance Bar Chart
        ax2 = axs[0, 1]
        if item_names:
            importance_values = [items[item]["importance"] for item in item_names]
            ax2.barh(item_names, importance_values)
            ax2.set_xlabel('Importance (%)')
            ax2.set_title(f'{category_name} Importance')
            
            # Add value labels
            for i, v in enumerate(importance_values):
                ax2.text(v + 0.5, i, f"{v}%", va='center')
        else:
            ax2.text(0.5, 0.5, "No data available", ha='center', va='center')
        
        # 3. Selection vs. Rejection Scores
        ax3 = axs[1, 0]
        if item_names:
            selection = [items[item]["selection_score"] for item in item_names]
            rejection = [items[item]["rejection_score"] for item in item_names]
            
            x = np.arange(len(item_names))
            width = 0.35
            
            ax3.bar(x - width/2, selection, width, label='Selection Score')
            ax3.bar(x + width/2, rejection, width, label='Rejection Score')
            
            ax3.set_ylabel('Score (%)')
            ax3.set_title('Selection vs. Rejection Scores')
            ax3.set_xticks(x)
            ax3.set_xticklabels(item_names, rotation=45, ha='right', fontsize=8)
            ax3.legend()
        else:
            ax3.text(0.5, 0.5, "No data available", ha='center', va='center')
        
        # 4. Relative Importance Pie Chart
        ax4 = axs[1, 1]
        if item_names:
            importance_values = [items[item]["importance"] for item in item_names]
            ax4.pie(importance_values, labels=item_names, autopct='%1.1f%%', startangle=90)
            ax4.axis('equal')  # Equal aspect ratio ensures that pie is drawn as a circle
            ax4.set_title(f'Relative Importance of {category_name}')
        else:
            ax4.text(0.5, 0.5, "No data available", ha='center', va='center')
        
        plt.tight_layout(rect=[0, 0, 1, 0.96])
        
        # Save figure to a BytesIO object
        buf = io.BytesIO()
        plt.savefig(buf, format='png', dpi=100)
        buf.seek(0)
        
        # Convert to base64 string
        img_str = base64.b64encode(buf.getvalue()).decode()
        dashboard_images.append((category_name, img_str))
        
        plt.close(fig)
    
    # Create a summary dashboard with thresholds
    if skills_data["thresholds"]:
        fig, ax = plt.subplots(figsize=(12, 8))
        fig.suptitle(f"Threshold Recommendations - {skills_data['basic_info'].get('Position Title', 'Job Position')}", fontsize=16)
        
        thresholds = list(skills_data["thresholds"].keys())
        values = [skills_data["thresholds"][threshold] for threshold in thresholds]
        
        ax.barh(thresholds, values)
        ax.set_xlabel('Value')
        ax.set_title('Threshold Recommendations')
        
        # Add value labels
        for i, v in enumerate(values):
            if "Multiplier" in thresholds[i]:
                ax.text(v + 0.05, i, f"{v}", va='center')
            else:
                ax.text(v + 1, i, f"{v}%", va='center')
        
        plt.tight_layout(rect=[0, 0, 1, 0.96])
        
        # Save figure to a BytesIO object
        buf = io.BytesIO()
        plt.savefig(buf, format='png', dpi=100)
        buf.seek(0)
        
        # Convert to base64 string
        img_str = base64.b64encode(buf.getvalue()).decode()
        dashboard_images.append(("Threshold Recommendations", img_str))
        
        plt.close(fig)
    
    return dashboard_images

def generate_dynamic_prompts(skills_data, count=10):
    """Generate dynamic prompts based on skills data."""
    if not skills_data or "dashboards" not in skills_data:
        return "Please upload and analyze a job description first."
   
    prompts = []
    
    # Generate prompts for all dashboard items
    for category, items in skills_data["dashboards"].items():
        for item_name, data in items.items():
            current_rating = float(data.get('rating', 0))
            current_importance = float(data.get('importance', 0))
            current_selection = float(data.get('selection_score', 0))
            current_rejection = float(data.get('rejection_score', 0))
           
            new_prompts = [
                f"Update {item_name}'s rating from {current_rating:.1f} to {min(10, current_rating + 1):.1f} in {category}",
                f"Change {item_name}'s importance from {current_importance:.1f}% to {min(100, current_importance + 5):.1f}% in {category}",
                f"Set {item_name}'s selection score from {current_selection:.1f}% to {min(100, current_selection + 10):.1f}% in {category}",
                f"Adjust {item_name}'s rejection score from {current_rejection:.1f}% to {min(100, current_rejection + 10):.1f}% in {category}"
            ]
            prompts.extend(new_prompts)
   
    if not prompts:
        return "No data available to generate prompts."
        
    selected_prompts = random.sample(prompts, min(len(prompts), count))
    return "\n".join(selected_prompts)

def analyze_job_description(job_description, num_dashboards):
    """Call AI service to analyze the job description."""
    # Adjust the template based on number of dashboards
    remaining_dashboards = max(0, num_dashboards - 1)
    template = job_description_template.format(
        num_dashboards=num_dashboards,
        remaining_dashboards=remaining_dashboards,
        context=job_description
    )
    
    try:
        # Use the provided API key directly
        api_key = "AIzaSyB3ZN_ICuWtHUypL1vhvORWA7KwoNiKVMw"
        
        # Configure the API
        genai.configure(api_key=api_key)
        
        # Initialize the model
        model = genai.GenerativeModel('gemini-2.0-flash')
        
        # Generate the analysis
        response = model.generate_content(template)
        
        # Return the analysis text
        return response.text
        
    except Exception as e:
        logger.error(f"Error analyzing job description: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error analyzing job description: {str(e)}")

@app.post("/api/analyze", response_model=AnalysisResponse)
async def extract_and_visualize(request: JobDescriptionRequest):
    """Extract data from job description and generate visualizations."""
    if not request.job_description or request.job_description.strip() == "":
        raise HTTPException(status_code=400, detail="Please enter a job description.")
    
    # Limit number of dashboards to a reasonable range
    num_dashboards = max(1, min(int(request.num_dashboards), 10))
    
    # Analyze the job description
    analysis_text = analyze_job_description(request.job_description, num_dashboards)
    
    # Parse the analysis text to extract structured data
    skills_data = parse_dynamic_skills_data(analysis_text)
    
    # Generate dashboards
    dashboard_images = generate_dynamic_dashboards(skills_data)
    
    # Generate prompts based on the skills data
    prompts = generate_dynamic_prompts(skills_data)
    
    return {
        "analysis_text": analysis_text,
        "basic_info": skills_data["basic_info"],
        "responsibilities": skills_data["responsibilities"],
        "dashboards": skills_data["dashboards"],
        "thresholds": skills_data["thresholds"],
        "dashboard_images": dashboard_images
    }

@app.get("/api/prompts")
async def get_prompts(role_key: str = None):
    """Generate example prompts for the user."""
    return {
        "prompts": [
            "Update Python's rating from 7.0 to 8.0 in Technical Skills",
            "Change Data Analysis's importance from 25.0% to 30.0% in Required Skills",
            "Set Machine Learning's selection score from 15.0% to 25.0% in Technical Skills",
            "Adjust Communication's rejection score from 20.0% to 30.0% in Soft Skills"
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)