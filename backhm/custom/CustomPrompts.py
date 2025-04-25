import gradio as gr
import re
import logging
import traceback
import google.generativeai as genai
from typing import Dict, List


# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Base prompt template for job description analysis
def generate_prompt_template(num_dashboards):
    """Dynamically generate the prompt template based on dashboard count"""
    remaining_dashboards = max(0, num_dashboards - 1)
    
    template = f"""Analyze this job description and extract information to create {num_dashboards} distinct dashboards for visualizing different aspects of the job:

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
- if {num_dashboards} = 1, then only output Dashboard #1 - Required Skills, if {num_dashboards} = 2, then only output Dashboard #1 - Required Skills and Dashboard #2 - [Category Name]
- Each dashboard MUST have at least 3 items
- Numbers should be rounded to one decimal place
- If information for a requested dashboard is not available in the job description, create a relevant category that would be useful for this job position

Job Description:
{{context}}"""

    return template

# Custom dashboard configuration functions
def configure_dashboard_content(dashboard_type):
    """Generate custom prompts for specific dashboard types"""
    prompts = {
        "required_skills": """For this 'Required Skills' dashboard:
Extract 4-6 essential technical skills directly mentioned in the job description.
For each skill:
- Calculate Importance (%) based on frequency and emphasis in the description
- Rate each skill out of 10 based on relative importance

Format skills as:
- [Skill Name]: Importance: [X]% Rating: [R]/10""",

        "soft_skills": """For this 'Soft Skills' dashboard:
Identify 3-5 interpersonal and non-technical skills valued in this position.
For each soft skill:
- Calculate Importance (%) based on mentions and context in the description
- Rate each skill out of 10 based on relative importance

Format as:
- [Soft Skill]: Importance: [X]% Rating: [R]/10""",

        "certifications": """For this 'Certifications & Qualifications' dashboard:
Extract 3-5 formal certifications, degrees, or credentials mentioned or implied.
For each certification:
- Calculate Importance (%) based on emphasis in requirements
- Rate each out of 10 based on relative importance

Format as:
- [Certification/Qualification]: Importance: [X]% Rating: [R]/10""",

        "experience": """For this 'Experience Requirements' dashboard:
Identify 3-5 types of experience (domain, tools, methodologies) required.
For each experience type:
- Calculate Importance (%) based on prominence in the description
- Rate each out of 10 based on relative importance

Format as:
- [Experience Type]: Importance: [X]% Rating: [R]/10""",

        "management_skills": """For this 'Management & Leadership' dashboard:
Extract 3-5 leadership or management competencies needed for this role.
For each competency:
- Calculate Importance (%) based on frequency and emphasis
- Rate each out of 10 based on relative importance

Format as:
- [Management Skill]: Importance: [X]% Rating: [R]/10""",
        
        "technical_tools": """For this 'Technical Tools & Systems' dashboard:
Extract 3-5 specific tools, platforms, or technologies mentioned.
For each tool:
- Calculate Importance (%) based on frequency and emphasis
- Rate each out of 10 based on relative importance

Format as:
- [Tool/System]: Importance: [X]% Rating: [R]/10"""
    }
    
    return prompts.get(dashboard_type, "")

def analyze_job_description(job_description, num_dashboards, dashboard_types=None):
    """Call AI service to analyze the job description with custom dashboard types."""
    try:
        # Generate the base template for the number of dashboards
        template = generate_prompt_template(num_dashboards)
        
        # If custom dashboard types are specified, add their specific instructions
        if dashboard_types and len(dashboard_types) > 0:
            custom_instructions = "\n\nCustom Dashboard Instructions:\n"
            for i, dashboard_type in enumerate(dashboard_types):
                if i < num_dashboards and dashboard_type in configure_dashboard_content:
                    custom_instructions += f"\nFor Dashboard #{i+1}:\n{configure_dashboard_content(dashboard_type)}\n"
            
            # Insert custom instructions before the rules section
            template = template.replace("Rules:", f"{custom_instructions}\nRules:")
        
        # Format the template with the job description
        formatted_template = template.format(context=job_description)
        
        # Use the provided API key directly
        api_key = "AIzaSyB3ZN_ICuWtHUypL1vhvORWA7KwoNiKVMw"
        
        # Configure the API
        genai.configure(api_key=api_key)
        
        # Initialize the model
        model = genai.GenerativeModel('gemini-2.0-flash')
        
        # Generate the analysis
        response = model.generate_content(formatted_template)
        
        # Return the analysis text
        analysis_text = response.text
        
        # Clean any threshold recommendations or suggested adjustments that might still appear
        cleaned_text = remove_thresholds_and_adjustments(analysis_text)
        
        return cleaned_text
        
    except Exception as e:
        logger.error(f"Error analyzing job description: {str(e)}")
        logger.error(traceback.format_exc())
        return f"Error analyzing job description: {str(e)}"

def remove_thresholds_and_adjustments(text):
    """Remove any threshold recommendations or suggested adjustments from text."""
    # Patterns to remove (case insensitive)
    patterns_to_remove = [
        r"Threshold Recommendations:.*?(?=\n\n|\Z)",
        r"Suggested Adjustments:.*?(?=\n\n|\Z)",
        r"Job Match Benchmark:.*?\n",
        r"High Score Threshold:.*?\n",
        r"High Match Threshold:.*?\n",
        r"Mid Score Threshold:.*?\n",
        r"Mid Match Threshold:.*?\n",
        r"Critical Skill Importance:.*?\n",
        r"Experience Score Multiplier:.*?\n",
        r"Overall Threshold Value:.*?\n",
        r"Selection Threshold:.*?\n",
        r"Rejection Threshold:.*?\n",
        r"Threshold:.*?\n",  # catches any remaining "Threshold: ..." lines
        r"Benchmark:.*?\n",  # catches any remaining "Benchmark: ..." lines
        r"Recommendations:.*?(?=\n\n|\Z)",
        r"Suggestions:.*?(?=\n\n|\Z)"
    ]
    
    cleaned_text = text
    for pattern in patterns_to_remove:
        cleaned_text = re.sub(pattern, "", cleaned_text, flags=re.IGNORECASE | re.DOTALL)
    
    # Clean up any double newlines created by removals
    cleaned_text = re.sub(r"\n{3,}", "\n\n", cleaned_text)
    
    return cleaned_text.strip()

def extract_and_analyze(job_description, num_dashboards, dashboard_config=None):
    """Extract data from job description without thresholds or adjustments."""
    if not job_description or job_description.strip() == "":
        return "Please enter a job description."
    
    # Limit number of dashboards to a reasonable range
    num_dashboards = max(1, min(int(num_dashboards), 10))
    
    # Default dashboard configuration if none provided
    if not dashboard_config or dashboard_config.strip() == "":
        dashboard_types = None  # Use default analysis
    else:
        try:
            # Parse the dashboard configuration
            dashboard_types = [d.strip() for d in dashboard_config.split(',')]
        except:
            dashboard_types = None
    
    # Analyze the job description
    analysis_text = analyze_job_description(job_description, num_dashboards, dashboard_types)
    
    return analysis_text

def get_dashboard_prompt(dashboard_type):
    """Return the specific prompt for a dashboard type"""
    prompts = configure_dashboard_content(dashboard_type)
    return prompts or "Standard dashboard analysis will be used."

# New function for dashboard modification
def generate_dashboard_modification_prompt(original_analysis, modification_request):
    """Generate a prompt to modify existing dashboard analysis"""
    template = f"""You are an expert dashboard customization assistant. I have already analyzed a job description and created the following dashboards:

{original_analysis}

Now I need you to modify these dashboards based on the following request:
{modification_request}

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
    return template

def modify_dashboards(original_analysis, modification_request):
    """Call AI service to modify the dashboard analysis."""
    try:
        if not original_analysis or original_analysis.strip() == "":
            return "Please provide the current dashboard analysis to modify."
        
        if not modification_request or modification_request.strip() == "":
            return "Please provide a modification request."
        
        # Generate the modification prompt
        template = generate_dashboard_modification_prompt(original_analysis, modification_request)
        
        # Configure the API
        api_key = "AIzaSyB3ZN_ICuWtHUypL1vhvORWA7KwoNiKVMw"
        genai.configure(api_key=api_key)
        
        # Initialize the model
        model = genai.GenerativeModel('gemini-2.0-flash')
        
        # Generate the modified analysis
        response = model.generate_content(template)
        
        # Return the modified analysis
        return response.text
        
    except Exception as e:
        logger.error(f"Error modifying dashboards: {str(e)}")
        logger.error(traceback.format_exc())
        return f"Error modifying dashboards: {str(e)}"

# New function to extract dashboard categories and items
def extract_dashboard_info(analysis_text):
    """Extract dashboard categories and items from analysis text"""
    dashboard_info = []
    
    # Regular expression to find dashboard titles
    dashboard_pattern = r"Dashboard #(\d+) - ([^:]+):"
    dashboards = re.finditer(dashboard_pattern, analysis_text)
    
    for match in dashboards:
        dashboard_num = match.group(1)
        category = match.group(2).strip()
        
        # Find the start position of this dashboard
        start_pos = match.start()
        
        # Find the next dashboard or end of text
        next_match = re.search(r"Dashboard #\d+", analysis_text[start_pos+1:])
        if next_match:
            end_pos = start_pos + 1 + next_match.start()
        else:
            end_pos = len(analysis_text)
        
        # Extract the section for this dashboard
        dashboard_section = analysis_text[start_pos:end_pos]
        
        # Extract items in this dashboard
        items = []
        item_pattern = r"- ([^:]+): Importance: (\d+\.?\d*)% Rating: (\d+\.?\d*)/10"
        for item_match in re.finditer(item_pattern, dashboard_section):
            item_name = item_match.group(1).strip()
            importance = float(item_match.group(2))
            rating = float(item_match.group(3))
            items.append({"name": item_name, "importance": importance, "rating": rating})
        
        dashboard_info.append({
            "number": dashboard_num,
            "category": category,
            "items": items
        })
    
    return dashboard_info

# New function to generate dynamic sample prompts
def generate_dynamic_sample_prompts(analysis_text):
    """Generate sample modification prompts based on analysis results"""
    if not analysis_text or "Dashboard" not in analysis_text:
        return "### Sample Modification Prompts\n\n*Analyze a job description first to see customized sample prompts.*"
    
    try:
        # Extract dashboard information
        dashboards = extract_dashboard_info(analysis_text)
        
        if not dashboards:
            return "### Sample Modification Prompts\n\n*Could not parse dashboard information. Please ensure the analysis format is correct.*"
        
        sample_prompts = ["### Sample Modification Prompts Based on Your Dashboards\n"]
        
        # 1. Rebalance importance values
        if len(dashboards) >= 1 and len(dashboards[0]["items"]) >= 2:
            first_dashboard = dashboards[0]
            skill1 = first_dashboard["items"][0]["name"]
            skill2 = first_dashboard["items"][1]["name"]
            prompt1 = f"1. **Rebalance importance values:**\n   \"Rebalance the importance percentages in Dashboard #1 - {first_dashboard['category']} to give more weight to {skill1}. Increase {skill1} importance by 15% and reduce {skill2} importance proportionally.\"\n"
            sample_prompts.append(prompt1)
        
        # 2. Add new item to a dashboard
        if len(dashboards) >= 2:
            second_dashboard = dashboards[1]
            category = second_dashboard["category"]
            new_item = "Problem Solving" if "Soft" in category else "Docker" if "Technical" in category else "Agile Methodology" if "Experience" in category else "Project Management"
            prompt2 = f"2. **Add new items to a dashboard:**\n   \"Add '{new_item}' with 20% importance to Dashboard #2 - {category}, and adjust other percentages proportionally to maintain 100% total.\"\n"
            sample_prompts.append(prompt2)
        
        # 3. Change dashboard category
        if len(dashboards) >= 2:
            existing_cat = dashboards[1]["category"]
            new_cat = "Communication Skills" if existing_cat != "Communication Skills" else "Leadership Skills"
            prompt3 = f"3. **Change dashboard category:**\n   \"Change Dashboard #2 from '{existing_cat}' to '{new_cat}' and replace existing items with more specific {new_cat.lower()} (stakeholder management, conflict resolution, team motivation).\"\n"
            sample_prompts.append(prompt3)
        
        # 4. Merge two dashboards
        if len(dashboards) >= 3:
            cat1 = dashboards[1]["category"]
            cat2 = dashboards[2]["category"]
            prompt4 = f"4. **Merge two dashboards:**\n   \"Combine Dashboard #2 ({cat1}) and Dashboard #3 ({cat2}) into a single dashboard called 'Combined Competencies' with the top 3 items from each, adjusting importance percentages accordingly.\"\n"
            sample_prompts.append(prompt4)
        
        # 5. Prioritize specific areas
        first_item = dashboards[0]["items"][0]["name"] if dashboards and dashboards[0]["items"] else "Leadership"
        prompt5 = f"5. **Prioritize specific areas:**\n   \"Recalibrate all dashboards to emphasize {first_item}. For any {first_item.lower()}-related items across dashboards, increase their importance by 10% and reduce other items proportionally.\"\n"
        sample_prompts.append(prompt5)
        
        return "\n".join(sample_prompts)
    
    except Exception as e:
        logger.error(f"Error generating dynamic prompts: {str(e)}")
        logger.error(traceback.format_exc())
        return "### Sample Modification Prompts\n\n*Error generating customized prompts. Using default examples instead.*\n\n1. **Rebalance importance values**\n2. **Add new items to a dashboard**\n3. **Change dashboard category**\n4. **Merge two dashboards**\n5. **Prioritize specific areas**"

# Define Gradio interface
with gr.Blocks(title="Job Description Analyzer") as app:
    gr.Markdown("# Job Description Analyzer")
    gr.Markdown("Upload or paste a job description to analyze key requirements.")
    
    # State for storing sample prompts markdown
    sample_prompts_md = gr.State("### Sample Modification Prompts\n\n*Analyze a job description first to see customized sample prompts.*")
    
    # Job description input
    job_description_input = gr.Textbox(
        lines=10, 
        placeholder="Paste job description here...", 
        label="Job Description"
    )
    
    with gr.Tabs() as tabs:
        with gr.Tab("Job Description Analysis"):
            with gr.Row():
                with gr.Column(scale=1):
                    num_dashboards_slider = gr.Slider(
                        minimum=1, 
                        maximum=10, 
                        value=3, 
                        step=1, 
                        label="Number of Dashboard Categories to Generate"
                    )
                    
                    analyze_button = gr.Button("Analyze Job Description", variant="primary")
                
                with gr.Column(scale=3):
                    analysis_output = gr.Textbox(
                        lines=20, 
                        label="Analysis Results", 
                        interactive=False
                    )
        
        with gr.Tab("Modify Dashboards"):
            with gr.Row():
                with gr.Column(scale=3):
                    saved_analysis = gr.Textbox(
                        lines=15, 
                        label="Current Dashboard Analysis", 
                        placeholder="First analyze a job description or paste previous analysis here..."
                    )
                
                with gr.Column(scale=2):
                    modification_request = gr.Textbox(
                        lines=5,
                        label="Modification Request",
                        placeholder="Describe how you want to modify the dashboards..."
                    )
                    modify_button = gr.Button("Modify Dashboards", variant="primary")
            
            modified_output = gr.Textbox(
                lines=20,
                label="Modified Dashboard Analysis",
                interactive=False
            )
            
            # Dynamic sample prompts section
            dynamic_sample_prompts = gr.Markdown(
                value="### Sample Modification Prompts\n\n*Analyze a job description first to see customized sample prompts.*"
            )
            
        with gr.Tab("Help & Instructions"):
            gr.Markdown("""
            ## How to Use This Tool
            
            ### Job Description Analysis
            1. Paste your job description in the input box at the top
            2. Set the number of dashboard categories you want to generate (1-10)
            3. Click "Analyze Job Description" to process and extract key information
            4. View the results with importance percentages and ratings for each item
            
            ### Dashboard Modification
            1. Copy your analysis results to the "Current Dashboard Analysis" box in the Modify tab
            2. Enter your modification request describing the changes you want to make
            3. Click "Modify Dashboards" to process your request
            4. View the updated dashboard results
            
            ## Understanding the Results
            
            * **Skills Analysis**:
              - Importance Percentage: Relative priority within category (sums to 100%)
              - Rating: Importance on scale of 1-10
            
            ## Dashboard Types Available
            
            * **Required Skills**: Essential technical skills needed for the position
            * **Soft Skills**: Interpersonal and non-technical abilities
            * **Certifications**: Required formal qualifications and credentials
            * **Experience**: Types of experience valued for this role
            * **Management Skills**: Leadership and management competencies
            * **Technical Tools**: Specific platforms and technologies
            """)
    
    # Function to update multiple outputs
    def update_outputs(analysis_result):
        # Generate dynamic sample prompts based on analysis result
        prompts = generate_dynamic_sample_prompts(analysis_result)
        return analysis_result, analysis_result, prompts
    
    # Event handlers
    analyze_button.click(
        fn=extract_and_analyze, 
        inputs=[job_description_input, num_dashboards_slider], 
        outputs=[analysis_output]
    )
    
    # Update sample prompts when analysis is completed
    analysis_output.change(
        fn=update_outputs,
        inputs=[analysis_output],
        outputs=[analysis_output, saved_analysis, dynamic_sample_prompts]
    )
    
    # Connect modification button
    modify_button.click(
        fn=modify_dashboards,
        inputs=[saved_analysis, modification_request],
        outputs=[modified_output]
    )
    
    # Update sample prompts when saved analysis changes
    saved_analysis.change(
        fn=generate_dynamic_sample_prompts,
        inputs=[saved_analysis],
        outputs=[dynamic_sample_prompts]
    )

# Launch the app
if __name__ == "__main__":
    app.launch()