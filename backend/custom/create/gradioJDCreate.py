import os
import gradio as gr
import google.generativeai as genai
from typing import Optional

# Configure the Gemini API (you'll need to set your API key)
# Replace with your actual API key or set it as an environment variable
api_key = os.environ.get("GEMINI_API_KEY", "AIzaSyB3ZN_ICuWtHUypL1vhvORWA7KwoNiKVMw")
genai.configure(api_key=api_key)

# Initialize the Gemini 2.0 Flash model
model = genai.GenerativeModel('gemini-2.0-flash')

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
        return "Error: Position Title and Required Experience are mandatory fields."
    
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
        return f"Error generating job description: {str(e)}"

# Create the Gradio interface
with gr.Blocks(title="Job Description Generator") as demo:
    gr.Markdown("# Job Description Generator")
    gr.Markdown("Generate professional job descriptions using Gemini 2.0 Flash AI. Fields marked with * are required.")
    
    with gr.Row():
        with gr.Column():
            position_title = gr.Textbox(label="Position Title *", placeholder="e.g., Senior Software Engineer")
            required_experience = gr.Textbox(label="Required Experience *", placeholder="e.g., 5+ years in software development")
            location = gr.Textbox(label="Location (Optional)", placeholder="e.g., New York, NY or Remote")
            position_type = gr.Dropdown(
                label="Position Type (Optional)",
                choices=["Full-time", "Part-time", "Contract", "Freelance", "Internship", "Temporary"],
                multiselect=False
            )
            office_timings = gr.Textbox(label="Office Timings (Optional)", placeholder="e.g., 9 AM - 5 PM EST, Flexible")
            role_details = gr.Textbox(
                label="Additional Role Details (Optional)", 
                placeholder="Describe any specific details about the role",
                lines=3
            )
            
            submit_btn = gr.Button("Generate Job Description", variant="primary")
        
        with gr.Column():
            output = gr.Textbox(label="Generated Job Description", lines=20)
    
    submit_btn.click(
        fn=generate_job_description,
        inputs=[position_title, required_experience, location, position_type, office_timings, role_details],
        outputs=output
    )
    
    gr.Markdown("""
    ### Instructions
    1. Fill in the required fields (marked with *)
    2. Add optional details for a more tailored job description
    3. Click "Generate Job Description"
    4. Copy or export the generated text for your use
    
    *Powered by Gemini 2.0 Flash API*
    """)

# Launch the app
if __name__ == "__main__":
    demo.launch()