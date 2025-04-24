import random
import logging
import re

logger = logging.getLogger(__name__)


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


class PromptEngineering:
    @staticmethod
    def get_analysis_template():
        return job_description_template


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