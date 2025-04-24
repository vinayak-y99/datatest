import gradio as gr
import re
import logging
import google.generativeai as genai
import PyPDF2
import io

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

def extract_text_from_pdf(pdf_file):
    """Extract text from a PDF file."""
    try:
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
        return text
    except Exception as e:
        logger.error(f"Error extracting text from PDF: {str(e)}")
        return f"Error extracting text from PDF: {str(e)}"

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
        return f"Error analyzing job description: {str(e)}"

def process_pdf_file(pdf_file, num_dashboards):
    """Process PDF file and extract analysis."""
    if pdf_file is None:
        return "Please upload a PDF file."
    
    # Extract text from PDF
    job_description = extract_text_from_pdf(pdf_file)
    
    if not job_description or job_description.strip() == "":
        return "Could not extract text from the PDF file. Please ensure the PDF contains readable text."
    
    # Limit number of dashboards to a reasonable range
    num_dashboards = max(1, min(int(num_dashboards), 10))
    
    # Analyze the job description
    analysis_text = analyze_job_description(job_description, num_dashboards)
    
    return analysis_text

# Define Gradio interface
with gr.Blocks(title="Job Description Analyzer") as app:
    gr.Markdown("# Job Description Analyzer with PDF Support")
    gr.Markdown("Upload a PDF job description to analyze key requirements.")
    
    with gr.Tab("Job Description Analysis"):
        with gr.Row():
            with gr.Column(scale=2):
                pdf_input = gr.File(
                    label="Upload Job Description PDF",
                    file_types=[".pdf"]
                )
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
                    lines=30, 
                    label="Analysis Results", 
                    interactive=False
                )
    
    with gr.Tab("Help & Instructions"):
        gr.Markdown("""
        ## How to Use This Tool
        
        1. **Upload PDF**: Upload a PDF file containing the job description
        
        2. **Adjust Dashboard Count**: Use the slider to specify how many dashboard categories you want to generate (1-10).
           - Dashboard #1 will always display Required Skills
           - Additional dashboards will show other categories relevant to the job
        
        3. **Click Analyze**: The system will process the job description and extract key information.
        
        4. **View Results**: The text analysis shows detailed information about requirements and scores
        
        ## Understanding the Results
        
        * **Skills Rating**: Shows how important each skill is on a scale of 1-10
        * **Importance Percentage**: Indicates the relative priority of each item
        * **Selection Score**: How much each item contributes to candidate selection
        * **Rejection Score**: How much lacking this item would impact a candidate's rejection
        * **Thresholds**: Recommended scoring parameters for candidate evaluation
        
        ## About the Tool
        
        This tool extracts structured information from job descriptions to help:
        
        * Recruiters better understand job requirements and priorities
        * Candidates assess their fit for positions
        * HR teams standardize job evaluation criteria
        """)
    
    # Set up the function to handle PDF input and dashboard count
    analyze_button.click(
        fn=process_pdf_file, 
        inputs=[pdf_input, num_dashboards_slider], 
        outputs=analysis_output
    )

app.launch()