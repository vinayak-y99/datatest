import gradio as gr
import re
import pandas as pd
import logging
import io
import random
from PIL import Image
logger = logging.getLogger(__name__)

job_description_template = """Analyze this job description and extract information to create {{num_dashboards}} distinct dashboards for visualizing different aspects of the job:

For Dashboard #1 (Required Skills):
Extract key technical skills with their importance (%), rating (out of 10).

For the remaining {{remaining_dashboards}} dashboards, extract different categories of job requirements. These could include but are not limited to:
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

if {{num_dashboards}} = 1:
Then only output Dashboard #1 - Required Skills:
- [Skill Name]: Importance: [X]% Rating: [R]/10
- [Next Skill]: Importance: [X]% Rating: [R]/10

if {{num_dashboards}} = 2 :
Dashboard #1 - Required Skills:
- [Skill Name]: Importance: [X]% Rating: [R]/10
- [Next Skill]: Importance: [X]% Rating: [R]/10

Dashboard #2 - [Category Name]:
- [Item Name]: Importance: [X]% Rating: [R]/10
- [Next Item]: Importance: [X]% Rating: [R]/10

if {{num_dashboards}} = 3 or more:
Dashboard #1 - Required Skills:
- [Skill Name]: Importance: [X]% Rating: [R]/10
- [Next Skill]: Importance: [X]% Rating: [R]/10

Dashboard #2 - [Category Name]:
- [Item Name]: Importance: [X]% Rating: [R]/10
- [Next Item]: Importance: [X]% Rating: [R]/10

Dashboard #3 - [Category Name]:
- [Item Name]: Importance: [X]% Rating: [R]/10
- [Next Item]: Importance: [X]% Rating: [R]/10

(Continue for all {{num_dashboards}} dashboards)

Threshold Recommendations:
Selection Threshold: {selection_threshold}%
Rejection Threshold: {rejection_threshold}%

Rules:
- Each dashboard category MUST be different and distinct
- if {{num_dashboards}} = 1, then only output Dashboard #1 - Required Skills, if {{num_dashboards}} = 2, then output Dashboard #1 - Required Skills and Dashboard #2 - [Category Name] and if {{num_dashboards}} = 3 or more, then output Dashboard #1 - Required Skills and Dashboard #2 - [Category Name] and Dashboard #3 - [Category Name] and so on.
- Each dashboard MUST have at least 3 items
- Numbers should be rounded to one decimal place
- If information for a requested dashboard is not available in the job description, create a relevant category that would be useful for this job position

Job Description:
{{context}}"""

qa_generation_template = """Based on the job description analysis provided, generate EXACTLY {num_questions} interview questions and answers for EACH dashboard category.

For EACH of the {num_dashboards} dashboard categories, create EXACTLY {num_questions} specific questions that test the skills/requirements in that category.

Format your response as follows:

## Dashboard 1: [Dashboard Category Name]

Q1: [Question text related to this dashboard category]
A1: [Ideal answer text]

Q2: [Question text related to this dashboard category]
A2: [Ideal answer text]

(Continue for all {num_questions} questions for this category)

## Dashboard 2: [Dashboard Category Name]

Q1: [Question text related to this dashboard category]
A1: [Ideal answer text]

Q2: [Question text related to this dashboard category]
A2: [Ideal answer text]

(Continue for all {num_questions} questions for this category)

(Continue for all {num_dashboards} dashboards)

IMPORTANT: You MUST generate EXACTLY {total_questions} questions in total ({num_dashboards} dashboards × {num_questions} questions per dashboard). No more, no less.

Analysis provided:
{analysis_text}"""

def parse_dashboard_text(analysis_text):
    """
    Parse the dashboard text to extract dashboard categories and items.
    Returns a dictionary with dashboard info that can be displayed as text.
    """
    dashboard_info = {}
    
    # Extract dashboard sections using regex
    dashboard_pattern = r"(Dashboard #\d+ - [^:]+):(.*?)(?=Dashboard #\d+|Threshold Recommendations:|\Z)"
    dashboard_matches = re.findall(dashboard_pattern, analysis_text, re.DOTALL)
    
    for dashboard_title, dashboard_content in dashboard_matches:
        # Clean the dashboard title and content
        dashboard_title = dashboard_title.strip()
        dashboard_content = dashboard_content.strip()
        
        # Store dashboard content
        dashboard_info[dashboard_title] = dashboard_content
    
    return dashboard_info

def verify_qa_count(qa_text, expected_dashboards, expected_questions_per_dashboard):
    """Verify that the correct number of questions and answers were generated."""
    # Count dashboard sections
    dashboard_count = len(re.findall(r"## Dashboard \d+:", qa_text))
    
    # Count questions
    question_count = len(re.findall(r"Q\d+:", qa_text))
    
    # Count answers
    answer_count = len(re.findall(r"A\d+:", qa_text))
    
    expected_total = expected_dashboards * expected_questions_per_dashboard
    
    verification_msg = f"\n\nVerification: Found {dashboard_count} dashboards with {question_count} questions and {answer_count} answers."
    verification_msg += f"\nExpected: {expected_dashboards} dashboards × {expected_questions_per_dashboard} questions = {expected_total} total Q&As."
    
    if question_count != expected_total or answer_count != expected_total:
        verification_msg += f"\nWarning: The number of questions/answers doesn't match the expected count."
    else:
        verification_msg += f"\nSuccess: The correct number of Q&As were generated."
    
    return qa_text + verification_msg

def generate_interview_qa(analysis_text, num_dashboards, questions_per_dashboard, max_retries=2):
    """Generate interview questions and answers based on the analysis."""
    try:
        # Use the provided API key directly
        api_key = "AIzaSyB3ZN_ICuWtHUypL1vhvORWA7KwoNiKVMw"
        
        import google.generativeai as genai
        
        # Configure the API
        genai.configure(api_key=api_key)
        
        # Initialize the model
        model = genai.GenerativeModel('gemini-2.0-flash')
        
        # Calculate total questions
        total_questions = num_dashboards * questions_per_dashboard
        
        # Initial progress update
        progress_updates = [f"Generating {total_questions} interview questions and answers ({num_dashboards} dashboards × {questions_per_dashboard} per dashboard)..."]
        
        # Generate the Q&A content with retry logic
        qa_template = qa_generation_template.format(
            num_questions=questions_per_dashboard,
            num_dashboards=num_dashboards,
            total_questions=total_questions,
            analysis_text=analysis_text
        )
        
        retries = 0
        generated_qa = None
        
        while retries <= max_retries:
            # Generate content
            try:
                if retries > 0:
                    progress_updates.append(f"Attempt {retries+1}/{max_retries+1}: Regenerating Q&As with stronger instructions...")
                
                response = model.generate_content(qa_template)
                qa_text = response.text
                
                # Count dashboards, questions and answers
                dashboard_count = len(re.findall(r"## Dashboard \d+:", qa_text))
                question_count = len(re.findall(r"Q\d+:", qa_text))
                answer_count = len(re.findall(r"A\d+:", qa_text))
                
                progress_updates.append(f"Found {dashboard_count} dashboards, {question_count} questions, and {answer_count} answers.")
                
                # Check if counts match expectations
                if dashboard_count == num_dashboards and question_count == total_questions and answer_count == total_questions:
                    # Success - we have the correct number of Q&As
                    progress_updates.append("✅ Success: Generated the correct number of Q&As.")
                    generated_qa = qa_text
                    break
                else:
                    progress_updates.append(f"❌ Mismatch: Expected {num_dashboards} dashboards with {total_questions} total Q&As.")
                
                # If counts don't match and we have retries left, try again with stronger instructions
                if retries < max_retries:
                    # Strengthen the instructions for the next try
                    qa_template += f"""

CRITICAL INSTRUCTION: The previous attempt did not generate the correct number of questions and answers.
You MUST generate EXACTLY {num_dashboards} dashboard sections with EXACTLY {questions_per_dashboard} questions and answers in EACH section.
The total should be EXACTLY {total_questions} questions and {total_questions} answers.
Current counts: {dashboard_count} dashboards, {question_count} questions, {answer_count} answers."""
                
            except Exception as inner_e:
                progress_updates.append(f"Error during generation attempt {retries+1}: {str(inner_e)}")
                if retries >= max_retries:
                    raise inner_e
            
            retries += 1
        
        # If we couldn't generate matching counts after all retries, use the last attempt
        if generated_qa is None:
            progress_updates.append("⚠️ Could not generate the exact number of Q&As after all retries. Using the last attempt.")
            generated_qa = qa_text
        
        # Join all progress updates
        progress_text = "\n".join(progress_updates)
        
        # Add verification message
        verified_qa = verify_qa_count(generated_qa, num_dashboards, questions_per_dashboard)
        
        # Return the Q&A text with verification and progress updates
        return f"{verified_qa}\n\n--- Generation Process ---\n{progress_text}"
        
    except Exception as e:
        error_msg = f"Error generating interview Q&A: {str(e)}"
        logger.error(error_msg)
        return error_msg

def analyze_job_description(job_description, num_dashboards):
    """Call AI service to analyze the job description."""
    # Adjust the template based on number of dashboards
    remaining_dashboards = max(0, num_dashboards - 1)
    
    # Define default threshold values
    selection_threshold = 70
    rejection_threshold = 30
    
    template = job_description_template.format(
        num_dashboards=num_dashboards,
        remaining_dashboards=remaining_dashboards,
        selection_threshold=selection_threshold,
        rejection_threshold=rejection_threshold,
        context=job_description
    )
    
    try:
        # Use the provided API key directly
        api_key = "AIzaSyB3ZN_ICuWtHUypL1vhvORWA7KwoNiKVMw"
        
        import google.generativeai as genai
        
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

def generate_simple_dashboards(job_description, num_dashboards):
    """
    Generate a simple text version of dashboards from a job description.
    This is a fallback if the AI service fails.
    """
    # Dashboard 1: Required Skills
    dashboard1_skills = [
        {"name": "Python", "importance": 25},
        {"name": "Data Analysis", "importance": 20},
        {"name": "Machine Learning", "importance": 25},
        {"name": "SQL", "importance": 15},
        {"name": "Cloud Computing", "importance": 15}
    ]

    # Dashboard 2: Soft Skills
    dashboard2_skills = [
        {"name": "Communication", "importance": 30},
        {"name": "Problem-solving", "importance": 25},
        {"name": "Teamwork", "importance": 20},
        {"name": "Adaptability", "importance": 15},
        {"name": "Time Management", "importance": 10}
    ]

    # Dashboard 3: Certifications/Education
    dashboard3_skills = [
        {"name": "Bachelor's Degree in Computer Science", "importance": 40},
        {"name": "Master's Degree in relevant field", "importance": 30},
        {"name": "AWS Certified ML - Specialty", "importance": 15},
        {"name": "Google Cloud ML Engineer", "importance": 15}
    ]

    # Dashboard 4: Specialized Tools Proficiency
    dashboard4_skills = [
        {"name": "Deep Learning", "importance": 30},
        {"name": "Natural Language Processing", "importance": 25},
        {"name": "Computer Vision", "importance": 20},
        {"name": "Reinforcement Learning", "importance": 15},
        {"name": "Time Series Analysis", "importance": 10}
    ]

    output = ""

    # Dashboard 1: Required Skills (always included)
    output += "Dashboard #1 - Required Skills:\n"
    max_importance = max(skill["importance"] for skill in dashboard1_skills)
    for skill in dashboard1_skills:
        rating = round((skill["importance"] * 10) / max_importance, 1)
        output += f"- {skill['name']}: Importance: {skill['importance']}% Rating: {rating}/10\n"
    output += "\n"

    if num_dashboards >= 2:
        # Dashboard 2: Soft Skills
        output += "Dashboard #2 - Soft Skills:\n"
        max_importance = max(skill["importance"] for skill in dashboard2_skills)
        for skill in dashboard2_skills:
            rating = round((skill["importance"] * 10) / max_importance, 1)
            output += f"- {skill['name']}: Importance: {skill['importance']}% Rating: {rating}/10\n"
        output += "\n"

    if num_dashboards >= 3:
        # Dashboard 3: Certifications/Education
        output += "Dashboard #3 - Certifications/Education:\n"
        max_importance = max(skill["importance"] for skill in dashboard3_skills)
        for skill in dashboard3_skills:
            rating = round((skill["importance"] * 10) / max_importance, 1)
            output += f"- {skill['name']}: Importance: {skill['importance']}% Rating: {rating}/10\n"
        output += "\n"

    if num_dashboards >= 4:
        # Dashboard 4: Specialized Tools Proficiency
        output += "Dashboard #4 - Specialized Tools Proficiency:\n"
        max_importance = max(skill["importance"] for skill in dashboard4_skills)
        for skill in dashboard4_skills:
            rating = round((skill["importance"] * 10) / max_importance, 1)
            output += f"- {skill['name']}: Importance: {skill['importance']}% Rating: {rating}/10\n"
        output += "\n"

    # Add thresholds
    output += "Threshold Recommendations:\n"
    output += "Selection Threshold: 70%\n"
    output += "Rejection Threshold: 30%\n"

    return output

def extract_and_visualize(job_description, num_dashboards):
    """Extract data from job description and generate dashboard text."""
    if not job_description or job_description.strip() == "":
        return "Please enter a job description."
    
    # Limit number of dashboards to a reasonable range
    num_dashboards = max(1, min(int(num_dashboards), 10))
    
    try:
        # Try to use the AI service first
        analysis_text = analyze_job_description(job_description, num_dashboards)
        
        # Check if we got an error response
        if analysis_text.startswith("Error analyzing job description"):
            # Fall back to the simple dashboard generator
            logger.warning("AI analysis failed, using simple dashboard generator")
            analysis_text = generate_simple_dashboards(job_description, num_dashboards)
    except Exception as e:
        # If anything goes wrong, use the simple dashboard generator
        logger.error(f"Error during analysis: {str(e)}")
        analysis_text = generate_simple_dashboards(job_description, num_dashboards)
    
    return analysis_text

# Define the Gradio application
with gr.Blocks(title="Job Description Analyzer") as app:
    # Create shared state variables
    analysis_text_state = gr.State("")
    num_dashboards_state = gr.State(3)
    
    # Create tabs
    with gr.Tabs() as tabs:
        with gr.Tab("Job Description Analysis", id="analysis_tab"):
            gr.Markdown("# Job Description Analyzer")
            gr.Markdown("Upload or paste a job description to analyze key requirements and generate interview questions.")
            
            with gr.Row():
                with gr.Column(scale=2):
                    job_description_input = gr.Textbox(
                        lines=10, 
                        placeholder="Paste job description here...", 
                        label="Job Description"
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
                        lines=20, 
                        label="Dashboard Results (Text Format)", 
                        interactive=False
                    )
                    
                    # Button to navigate to Interview Q&A tab
                    qa_button = gr.Button("Generate Interview Questions & Answers", variant="secondary")
        
        with gr.Tab("Interview Q&A", id="qa_tab"):
            gr.Markdown("# Interview Questions & Answers")
            gr.Markdown("Questions and answers generated based on job description analysis.")
            
            with gr.Row():
                with gr.Column():
                    # Add slider for questions per dashboard
                    questions_per_dashboard_slider = gr.Slider(
                        minimum=1,
                        maximum=10,
                        value=3,
                        step=1,
                        label="Number of Questions per Dashboard Category"
                    )
                
                with gr.Column():
                    # Display the expected total number of questions
                    total_questions_display = gr.Textbox(
                        label="Total Questions to Generate",
                        value="3",
                        interactive=False
                    )
                    
                    # Add retry control
                    max_retries_slider = gr.Slider(
                        minimum=0,
                        maximum=5,
                        value=2,
                        step=1,
                        label="Maximum Retries if Count Doesn't Match"
                    )
            
            # Button to generate Q&A content
            generate_qa_button = gr.Button("Generate Q&A Content", variant="primary")
            
            # Progress indicator
            qa_progress = gr.Textbox(
                label="Generation Progress",
                value="",
                interactive=False,
                visible=False
            )
            
            # Display area for Q&A content
            qa_output = gr.Textbox(
                lines=30,
                label="Interview Q&A",
                interactive=False
            )
            
            # Button to return to analysis page
            back_button = gr.Button("Back to Analysis", variant="secondary")
    
    # Set up event handlers
    
    # When analyze button is clicked, analyze job description and update state
    analyze_button.click(
        fn=extract_and_visualize,
        inputs=[job_description_input, num_dashboards_slider],
        outputs=[analysis_output]
    )
    
    # Update state variables when analysis is complete
    analyze_button.click(
        fn=lambda x: x,
        inputs=[analysis_output],
        outputs=[analysis_text_state]
    )
    
    analyze_button.click(
        fn=lambda x: x,
        inputs=[num_dashboards_slider],
        outputs=[num_dashboards_state]
    )
    
    # When Q&A button is clicked, switch to Q&A tab
    qa_button.click(
        fn=lambda: gr.Tabs(selected=1),
        inputs=None,
        outputs=tabs
    )
    
    # When back button is clicked, switch back to analysis tab
    back_button.click(
        fn=lambda: gr.Tabs(selected=0),
        inputs=None,
        outputs=tabs
    )
    
    # When generate Q&A button is clicked, show progress indicator first
    def show_progress_indicator():
        return gr.Textbox(value="Generating Q&A content...", visible=True)

    generate_qa_button.click(
        fn=show_progress_indicator,
        inputs=None,
        outputs=qa_progress
    )

    # Then generate Q&A content with the selected number of questions per dashboard
    generate_qa_button.click(
        fn=generate_interview_qa,
        inputs=[analysis_text_state, num_dashboards_state, questions_per_dashboard_slider, max_retries_slider],
        outputs=[qa_output]
    )

    # Hide progress indicator after generation is complete
    generate_qa_button.click(
        fn=lambda: gr.Textbox(visible=False),
        inputs=None,
        outputs=qa_progress
    )
    
    # Update the total questions display when sliders change
    def update_total_questions(num_dashboards, questions_per_dashboard):
        return f"{num_dashboards} dashboards × {questions_per_dashboard} questions = {num_dashboards * questions_per_dashboard} total Q&As"

    num_dashboards_slider.change(
        fn=update_total_questions,
        inputs=[num_dashboards_slider, questions_per_dashboard_slider],
        outputs=[total_questions_display]
    )

    questions_per_dashboard_slider.change(
        fn=update_total_questions,
        inputs=[num_dashboards_state, questions_per_dashboard_slider],
        outputs=[total_questions_display]
    )

    # When analyze button is clicked, update num_dashboards_state and total_questions_display
    analyze_button.click(
        fn=lambda x: x,
        inputs=[num_dashboards_slider],
        outputs=[num_dashboards_state]
    )

    analyze_button.click(
        fn=update_total_questions,
        inputs=[num_dashboards_slider, questions_per_dashboard_slider],
        outputs=[total_questions_display]
    )

app.launch()    