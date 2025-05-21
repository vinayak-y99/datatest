import google.generativeai as genai
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import ChatPromptTemplate
from functools import lru_cache
import asyncio
from concurrent.futures import ThreadPoolExecutor
import logging
from ..core.Config import GOOGLE_API_KEY, MODEL_NAME, MODEL_TEMPERATURE
from ..core.prompt_engineering import job_description_template, generate_dynamic_prompts
import re

logger = logging.getLogger(__name__)

class LLMService:
    def __init__(self):
        genai.configure(api_key=GOOGLE_API_KEY)
        self.model = ChatGoogleGenerativeAI(
            model=MODEL_NAME,
            google_api_key=GOOGLE_API_KEY,
            temperature=MODEL_TEMPERATURE
        )
        self.current_skills_data = {}

    async def generate_with_gemini(self, prompt_text):
        """Generate content using Gemini model directly."""
        try:
            with ThreadPoolExecutor() as executor:
                loop = asyncio.get_event_loop()
                
                # Use the existing model from self.model if possible
                response = await loop.run_in_executor(
                    executor,
                    lambda: self.model.invoke(prompt_text)
                )
                
                return response.content
        except Exception as e:
            logger.error(f"Error generating with Gemini: {str(e)}")
            raise Exception(f"Error generating with Gemini: {str(e)}")
        
    @lru_cache(maxsize=32)
    def get_llm_chain(self, num_dashboards=3):
        """Get LLM chain with the job description template and specified number of dashboards."""
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


        remaining_dashboards = max(0, num_dashboards - 1)
        prompt = ChatPromptTemplate.from_template(
            job_description_template.format(
                num_dashboards=num_dashboards,
                remaining_dashboards=remaining_dashboards
            )
        )
        chain = prompt | self.model
        return chain

    async def process_resume(self, text: str, num_dashboards=3):
        """
        Process a job description and extract relevant information with the specified number of dashboards.
        """
        try:
            with ThreadPoolExecutor() as executor:
                chain = self.get_llm_chain(num_dashboards)
                loop = asyncio.get_event_loop()
                response = await loop.run_in_executor(
                    executor,
                    lambda: chain.invoke({"context": text})
                )

                basic_info, job_title, skills_data, content, thresholds, selected_prompts = self.parse_dashboard_response(response.content)
                self.current_skills_data = skills_data  # Store the current skills data
                if not selected_prompts:
                    selected_prompts = generate_dynamic_prompts(skills_data, count=5)
               
                return basic_info, job_title, skills_data, content, thresholds, selected_prompts
        except Exception as e:
            logger.error(f"Error in process_resume: {str(e)}")
            return {}, "Job Description Analysis", {}, "", (0.0, 0.0), []
   
    # Keep the old method name for backward compatibility
    async def process_job_description(self, text: str, num_dashboards=3):
        """
        Backward compatibility method that calls process_resume
        """
        logger.info("process_job_description is deprecated, use process_resume instead")
        return await self.process_resume(text, num_dashboards)

    def parse_dashboard_response(self, content: str):
        """Parse the LLM response with multiple dashboards."""
        basic_info = {}
        primary_responsibilities = ""
        job_title = "Job Description Analysis"  # Default value
        skills_data = {
            "skills": {}
        }
        selected_prompts = []
        thresholds = (70.0, 30.0)  # Default thresholds
        
        try:
            # Extract basic information
            if "Basic Information:" in content:
                basic_info_section = content.split("Basic Information:")[1].split("Primary Responsibilities:")[0].strip()
                for line in basic_info_section.split("\n"):
                    line = line.strip()
                    if line.startswith("-"):
                        key_value = line[1:].strip().split(":", 1)
                        if len(key_value) == 2:
                            key, value = key_value[0].strip(), key_value[1].strip()
                            basic_info[key] = value
                            if key == "Position Title":
                                job_title = value  # Use position title as the job title
            
            # Extract primary responsibilities
            if "Primary Responsibilities:" in content:
                primary_responsibilities_section = ""
                parts = content.split("Primary Responsibilities:")
                if len(parts) > 1:
                    if "Dashboard #1" in parts[1]:
                        primary_responsibilities_section = parts[1].split("Dashboard #1")[0].strip()
                    else:
                        primary_responsibilities_section = parts[1].split("\n\n")[0].strip()
                primary_responsibilities = primary_responsibilities_section
            
            # Extract all dashboards
            dashboard_pattern = r"Dashboard #(\d+) - ([^:]+):(.*?)(?:Dashboard #\d+|Threshold Recommendations:|$)"
            dashboard_matches = re.finditer(dashboard_pattern, content, re.DOTALL)
            
            for match in dashboard_matches:
                dashboard_num = match.group(1)
                category_name = match.group(2).strip()
                dashboard_items = match.group(3).strip()
                
                # Add category to selected prompts
                selected_prompts.append(f"Category: {category_name}")
                
                # Create category in skills_data if it doesn't exist
                category_key = "skills" if dashboard_num == "1" else f"category_{dashboard_num}"
                if category_key not in skills_data:
                    skills_data[category_key] = {}
                
                # Process each item in the dashboard
                for line in dashboard_items.split("\n"):
                    line = line.strip()
                    if line.startswith("-"):
                        try:
                            # Parse the line: - [Item Name]: Importance: [X]% Selection Score: [Y]% Rejection Score: [Z]% Rating: [R]/10
                            item_match = re.search(r"- (.*?): Importance: (\d+\.?\d*)% Selection Score: (\d+\.?\d*)% Rejection Score: (\d+\.?\d*)% Rating: (\d+\.?\d*)/10", line)
                            if item_match:
                                item_name, importance, selection, rejection, rating = item_match.groups()
                                item_name = item_name.strip()
                                
                                # Add to skills data
                                skills_data[category_key][item_name] = {
                                    "importance": float(importance),
                                    "selection_score": float(selection),
                                    "rejection_score": float(rejection),
                                    "rating": float(rating)
                                }
                                
                                # Add to selected prompts
                                selected_prompts.append(f"Skill: {item_name}")
                        except Exception as e:
                            logger.debug(f"Skipping line due to parsing error: {line}, {str(e)}")
            
            # Extract threshold recommendations
            threshold_match = re.search(r"Threshold Recommendations:(.*?)(?:$)", content, re.DOTALL)
            if threshold_match:
                threshold_section = threshold_match.group(1).strip()
                selection_match = re.search(r"- Selection Threshold: (\d+\.?\d*)%", threshold_section)
                rejection_match = re.search(r"- Rejection Threshold: (\d+\.?\d*)%", threshold_section)
                
                selection_threshold = float(selection_match.group(1)) if selection_match else 70.0
                rejection_threshold = float(rejection_match.group(1)) if rejection_match else 30.0
                
                thresholds = (selection_threshold, rejection_threshold)
        
        except Exception as e:
            logger.error(f"Error parsing dashboard response: {str(e)}")
        
        # Keep backward compatibility with old format
        if not skills_data["skills"] and len(skills_data) > 1:
            # Move the first category to "skills" for backward compatibility
            first_category = next((k for k in skills_data.keys() if k != "skills"), None)
            if first_category:
                skills_data["skills"] = skills_data[first_category]
        
        return basic_info, job_title, skills_data, content, thresholds, selected_prompts

    # Keep this method for backward compatibility
    def parse_llm_response(self, content: str):
        basic_info, job_title, skills_data, content, thresholds, _ = self.parse_dashboard_response(content)
        return basic_info, job_title, skills_data, content

    async def process_custom_prompt(self, prompt: str):
        try:
            with ThreadPoolExecutor() as executor:
                custom_prompt_template = ChatPromptTemplate.from_template(
                    """Current Skills Data: {skills_data}
                   
                    Instruction: {prompt}
                   
                    Update the skills data according to the instruction and return in the following format:
                   
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
                    
                    Dashboard #2 - [Category Name]:
                    - [Item Name]: Importance: [X]% Selection Score: [Y]% Rejection Score: [Z]% Rating: [R]/10
                    
                    Dashboard #3 - [Category Name]:
                    - [Item Name]: Importance: [X]% Selection Score: [Y]% Rejection Score: [Z]% Rating: [R]/10
                   
                    Return the complete updated data maintaining the exact same structure."""
                )
               
                chain = custom_prompt_template | self.model
               
                loop = asyncio.get_event_loop()
                response = await loop.run_in_executor(
                    executor,
                    lambda: chain.invoke({
                        "skills_data": str(self.current_skills_data),
                        "prompt": prompt
                    })
                )
               
                basic_info, job_title, updated_skills_data, _, _, _ = self.parse_dashboard_response(response.content)
                if not updated_skills_data:
                    raise ValueError("No valid skills data returned")
               
                self.current_skills_data = updated_skills_data
                return updated_skills_data
        except Exception as e:
            logger.error(f"Error in process_custom_prompt: {str(e)}")
            raise ValueError(f"Failed to process prompt: {str(e)}")

    def calculate_threshold_scores(self, skills_data):
        all_scores = []
        
        # Process all categories in skills_data
        for category, items in skills_data.items():
            if isinstance(items, dict):  # Make sure it's a dictionary of skills
                for skill_name, skill_data in items.items():
                    if isinstance(skill_data, dict) and all(k in skill_data for k in ["selection_score", "rejection_score", "importance"]):
                        score_entry = {
                            'selection': skill_data['selection_score'],
                            'rejection': skill_data['rejection_score'],
                            'importance': skill_data['importance']
                        }
                        if any(score_entry.values()):
                            all_scores.append(score_entry)
        
        if all_scores:
            selection_scores = [score['selection'] * score['importance'] / 100 for score in all_scores]
            rejection_scores = [score['rejection'] * score['importance'] / 100 for score in all_scores]
            return (
                max(0.1, sum(selection_scores) / len(selection_scores)),
                max(0.1, sum(rejection_scores) / len(rejection_scores))
            )
        return 70.0, 30.0  # Better defaults