import gradio as gr
import re
import logging
import traceback
import google.generativeai as genai
# Configure logging
logging.basicConfig(level=logging.INFO)
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
- DO NOT include any threshold recommendations or benchmark values
- DO NOT include any suggested adjustments

Job Description:
{context}"""

# Updated template for question generation based on dashboards
qa_generation_template = """Here is a job description:

{context}

Based on this job description, generate {questions_per_dashboard} specific questions for each of the {num_dashboards} dashboard categories identified in the analysis. Each question should be directly related to skills or requirements in that dashboard category.

For each question, also provide:
- Which dashboard category it relates to (e.g., Required Skills, Technical Skills, Soft Skills)
- The importance level of the skill being assessed (High/Medium/Low based on importance percentage)
- A brief answer (2-3 sentences) based only on information in the job description

Format your response exactly as follows:

DASHBOARD 1 QUESTIONS:
Q1.1: [Question]
Category: [Dashboard Category]
Skill Importance: [High/Medium/Low]
A1.1: [Answer]

Q1.2: [Question]
Category: [Dashboard Category]
Skill Importance: [High/Medium/Low]
A1.2: [Answer]

DASHBOARD 2 QUESTIONS:
Q2.1: [Question]
Category: [Dashboard Category]
Skill Importance: [High/Medium/Low]
A2.1: [Answer]

And so on for all dashboards and questions.

The questions should focus on:
- Skills with highest importance percentages
- Critical requirements for the role
- Specific technical competencies
- Relevant experience requirements
- Problem-solving approaches needed for the position

If the job description doesn't provide information for a particular answer, begin with "The job description doesn't specify this, but..." and then make a reasonable inference.

Ensure questions are distributed across all dashboard categories, with emphasis on skills with higher importance ratings.
"""

def analyze_job_description(job_description, num_dashboards):
    """Call AI service to analyze the job description."""
    try:
        # Adjust the template based on number of dashboards
        remaining_dashboards = max(0, num_dashboards - 1)
        template = job_description_template.format(
            num_dashboards=num_dashboards,
            remaining_dashboards=remaining_dashboards,
            context=job_description
        )
        
        # Use the provided API key directly
        api_key = "AIzaSyB3ZN_ICuWtHUypL1vhvORWA7KwoNiKVMw"
        
        # Configure the API
        genai.configure(api_key=api_key)
        
        # Initialize the model
        model = genai.GenerativeModel('gemini-2.0-flash')
        
        # Generate the analysis
        response = model.generate_content(template)
        
        # Return the analysis text
        analysis_text = response.text
        
        # Clean any threshold recommendations or suggested adjustments that might still appear
        cleaned_text = remove_thresholds_and_adjustments(analysis_text)
        
        return cleaned_text
        
    except Exception as e:
        logger.error(f"Error analyzing job description: {str(e)}")
        logger.error(traceback.format_exc())
        return f"Error analyzing job description: {str(e)}"

def generate_job_questions(job_description, num_dashboards, questions_per_dashboard):
    """Generate questions based on the job description."""
    if not job_description or job_description.strip() == "":
        return "Please enter a job description to generate questions."
    
    try:
        # Limit questions per dashboard to a reasonable range
        questions_per_dashboard = max(1, min(int(questions_per_dashboard), 10))
        
        template = qa_generation_template.format(
            context=job_description,
            num_dashboards=num_dashboards,
            questions_per_dashboard=questions_per_dashboard
        )
        
        # Use the provided API key directly
        api_key = "AIzaSyB3ZN_ICuWtHUypL1vhvORWA7KwoNiKVMw" 
        
        # Configure the API
        genai.configure(api_key=api_key)
        
        # Initialize the model
        model = genai.GenerativeModel('gemini-2.0-flash')
        
        # Generate questions
        response = model.generate_content(template)
        
        # Return the raw questions text
        return response.text
        
    except Exception as e:
        logger.error(f"Error generating questions: {str(e)}")
        logger.error(traceback.format_exc())
        return f"Error generating questions: {str(e)}\n\nPlease try again or check the job description length."

def extract_questions(qa_text):
    """Extract just the questions from the Q&A text."""
    if not qa_text or "Error generating questions" in qa_text:
        return []
    
    questions = []
    # Use regex to extract questions with dashboard numbering (e.g., Q1.1, Q2.3)
    matches = re.findall(r'Q(\d+\.\d+):\s*(.*?)(?=\s*(?:\n|$))', qa_text, re.MULTILINE)
    
    for match in matches:
        question_num, question_text = match
        questions.append(f"Q{question_num}: {question_text.strip()}")
    
    return questions

def extract_answer(qa_text, question):
    """Extract the answer for a specific question."""
    if not qa_text or not question:
        return "No answer available."
    
    # Extract the question number from the selected question
    match = re.match(r'Q(\d+\.\d+):', question)
    if not match:
        return "Invalid question format."
    
    question_number = match.group(1)
    
    # Find the corresponding answer
    answer_pattern = rf'A{question_number}:\s*(.*?)(?=\nQ\d+\.\d+:|\nDASHBOARD \d+ QUESTIONS:|$)'
    answer_match = re.search(answer_pattern, qa_text, re.DOTALL)
    
    if answer_match:
        return answer_match.group(1).strip()
    else:
        return "Answer not found."

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
        r"Recommendations:.*?(?=\n\n|\Z)"
    ]
    
    cleaned_text = text
    for pattern in patterns_to_remove:
        cleaned_text = re.sub(pattern, "", cleaned_text, flags=re.IGNORECASE | re.DOTALL)
    
    # Clean up any double newlines created by removals
    cleaned_text = re.sub(r"\n{3,}", "\n\n", cleaned_text)
    
    return cleaned_text.strip()

def extract_and_analyze(job_description, num_dashboards):
    """Extract data from job description without thresholds or adjustments."""
    if not job_description or job_description.strip() == "":
        return "Please enter a job description."
    
    # Limit number of dashboards to a reasonable range
    num_dashboards = max(1, min(int(num_dashboards), 10))
    
    # Analyze the job description
    analysis_text = analyze_job_description(job_description, num_dashboards)
    
    return analysis_text

# Define Gradio interface
with gr.Blocks(title="Job Description Analyzer") as app:
    gr.Markdown("# Job Description Analyzer")
    gr.Markdown("Upload or paste a job description to analyze key requirements and generate relevant Q&A.")
    
    # Shared job description across tabs
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
        
        with gr.Tab("Questions & Answers"):
            # Store the full Q&A text
            qa_text_state = gr.State("")
            
            with gr.Row():
                with gr.Column(scale=1):
                    questions_per_dashboard_slider = gr.Slider(
                        minimum=1, 
                        maximum=10, 
                        value=3, 
                        step=1, 
                        label="Questions Per Dashboard"
                    )
                    generate_qa_button = gr.Button("Generate Questions & Answers", variant="primary")
            
            with gr.Row():
                with gr.Column(scale=2):
                    question_list = gr.Textbox(
                        lines=15, 
                        label="Questions Generated from Job Description", 
                        interactive=False
                    )
                
                with gr.Column(scale=2):
                    question_dropdown = gr.Dropdown(
                        label="Select a Question to See Answer", 
                        choices=[], 
                        interactive=True
                    )
                    answer_output = gr.Textbox(
                        lines=6, 
                        label="Answer", 
                        interactive=False
                    )
        
        with gr.Tab("Help & Instructions"):
            gr.Markdown("""
            ## How to Use This Tool
            
            1. **Paste the Job Description**: Enter or paste the job description text into the input box at the top.
            
            2. **Analyze Tab**: 
               - Adjust Dashboard Count: Use the slider to specify how many dashboard categories you want to generate (1-10).
               - Click "Analyze" to process the job description and extract key information.
               - View the structured analysis results with metrics for required skills and other job aspects.
            
            3. **Questions & Answers Tab**:
               - Adjust Questions Per Dashboard: Use the slider to specify how many questions you want per dashboard (1-10).
               - Click "Generate Questions & Answers" to create job-specific questions based on the description.
               - You'll see all generated questions displayed immediately in the left panel.
               - Select any question from the dropdown to view its detailed answer in the right panel.
               - Questions are directly related to information found in or implied by the job description.
            
            ## Understanding the Results
            
            * **Skills Analysis**:
              - Importance Percentage: Relative priority within category
              - Selection Score: Contribution to candidate selection
              - Rejection Score: Impact on candidate rejection if lacking
              - Rating: Importance on scale of 1-10
            
            * **Q&A Feature**:
              - Questions organized by dashboard category
              - Skill importance level indicated for each question
              - Answers based strictly on information in the job description
              - Clear indication when information is inferred rather than explicitly stated
            
            ## About the Tool
            
            This tool helps job seekers and recruiters by:
            
            * Extracting key requirements from complex job descriptions
            * Identifying what's most important for candidate selection
            * Providing answers to common job-specific questions
            * Preparing candidates for interviews with relevant information
            """)
    
    # Event handlers for Analysis tab
    analyze_button.click(
        fn=extract_and_analyze, 
        inputs=[job_description_input, num_dashboards_slider], 
        outputs=[analysis_output]
    )
    
    # Event handlers for Q&A tab
    def on_generate_qa(job_description, num_dashboards, questions_per_dashboard):
        """Generate Q&A and update all relevant components."""
        # Generate the full Q&A text
        qa_text = generate_job_questions(job_description, num_dashboards, questions_per_dashboard)
        
        # Extract just the questions for displaying
        questions_text = "\n".join(extract_questions(qa_text))
        
        # Extract questions for dropdown
        questions_list = extract_questions(qa_text)
        
        # Default answer is empty (will be filled when a question is selected)
        default_answer = ""
        
        return qa_text, questions_text, questions_list, default_answer
    
    generate_qa_button.click(
        fn=on_generate_qa,
        inputs=[job_description_input, num_dashboards_slider, questions_per_dashboard_slider],
        outputs=[qa_text_state, question_list, question_dropdown, answer_output]
    )
    
    # Update answer when a question is selected
    question_dropdown.change(
        fn=extract_answer,
        inputs=[qa_text_state, question_dropdown],
        outputs=[answer_output]
    )

# Launch the app
app.launch()
