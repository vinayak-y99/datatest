from typing import Dict, List
import os
import time
import sounddevice as sd
import soundfile as sf
import numpy as np
import speech_recognition as sr
from app.core.Config import logger
from app.core.Config import GOOGLE_API_KEY
import google.generativeai as genai
import re

if not GOOGLE_API_KEY:
    raise ValueError("GOOGLE_API_KEY is not set in environment variables")

genai.configure(api_key=GOOGLE_API_KEY)
model = genai.GenerativeModel('gemini-pro')

class PromptEngineering:
    UPLOAD_DIR = "uploads"
    SAMPLE_RATE = 44100
    audio_data = []
    recording_stream = None
    
    ALLOWED_EXTENSIONS = {
        ".pdf", ".docx", ".doc",
        ".json", ".csv", ".xlsx", ".xls",
        ".txt", ".rtf", ".md",
        ".xml", ".yaml", ".yml"
    }

    @staticmethod
    def generate_dashboards_prompt(text: str, sections: Dict[str, str], num_sections: int = 9) -> List[str]:
        dashboards = []
        for header, section_content in list(sections.items())[:num_sections]:
            formatted_dashboard = f"""
            # {header} Dashboard
            {section_content}
            """
            dashboards.append(formatted_dashboard.strip())
        dashboards.extend([""] * (num_sections - len(dashboards)))
        return dashboards

    @staticmethod
    def generate_custom_dashboard_prompt(relevant_section: Dict[str, str], prompt: str) -> str:
        import json
        return f"""
        Using this specific resume section:
        {json.dumps(relevant_section, indent=2)}

        Create a single focused dashboard for: {prompt}
        
        Requirements:
        1. Show ONLY content related to: {prompt}
        2. Format as:
           # {prompt.title()} Dashboard
           [Only relevant points from the matching resume section]
        3. Do not include any other sections or unrelated information
        """

    @staticmethod
    def generate_qa_prompt(section_content: str, num_questions: int) -> Dict[str, str]:
        try:
            prompt = f"""
            Based on this section content, generate {num_questions} interview questions and their ideal answers:
            {section_content}
            
            Format each Q&A pair exactly like this:
            Q1: [Question here]
            Expected Answer: [Answer here]
            """
            
            response = model.generate_content(prompt)
            return {
                "status": "success",
                "qa_content": response.text.strip()
            }
        except Exception as e:
            logger.error(f"Error generating QA: {str(e)}")
            return {
                "status": "error",
                "error": str(e)
            }

    @staticmethod
    def generate_follow_up_prompt(question: str, answer: str) -> str:
        return f"""
        Based on this Q&A:
        Q: {question}
        A: {answer}
        
        Generate 3 follow-up questions that:
        1. Probe technical depth
        2. Test practical application
        3. Verify understanding
        
        Format: Q1: [question]
        """

    @staticmethod
    def start_recording() -> Dict[str, str]:
        try:
            os.makedirs(PromptEngineering.UPLOAD_DIR, exist_ok=True)
            PromptEngineering.audio_data = []
            
            def callback(indata, frames, time, status):
                PromptEngineering.audio_data.append(indata.copy())
            
            PromptEngineering.recording_stream = sd.InputStream(
                channels=1,
                samplerate=PromptEngineering.SAMPLE_RATE,
                callback=callback
            )
            PromptEngineering.recording_stream.start()
            return {"status": "success", "message": "Recording started"}
        except Exception as e:
            return {"status": "error", "message": str(e)}

    @staticmethod
    def stop_recording() -> Dict[str, str]:
        if PromptEngineering.recording_stream:
            try:
                PromptEngineering.recording_stream.stop()
                PromptEngineering.recording_stream.close()
                
                filename = f"recording_{int(time.time())}.wav"
                filepath = os.path.join(PromptEngineering.UPLOAD_DIR, filename)
                
                audio_data = np.concatenate(PromptEngineering.audio_data)
                sf.write(filepath, audio_data, PromptEngineering.SAMPLE_RATE)
                
                PromptEngineering.audio_data = []
                PromptEngineering.recording_stream = None
                
                return {
                    "status": "success",
                    "filename": filename,
                    "message": "Recording stopped successfully"
                }
            except Exception as e:
                return {
                    "status": "error",
                    "error": str(e),
                    "message": "Failed to stop recording"
                }
        return {
            "status": "error",
            "error": "No active recording session",
            "message": "No recording to stop"
        }

    @staticmethod
    def transcribe_audio(filename: str) -> Dict[str, str]:
        try:
            audio_path = os.path.join(PromptEngineering.UPLOAD_DIR, filename)
            recognizer = sr.Recognizer()
            
            with sr.AudioFile(audio_path) as source:
                audio = recognizer.record(source)
                text = recognizer.recognize_google(audio)
                return {"status": "success", "text": text}
        except Exception as e:
            return {"status": "error", "error": str(e)}

    @staticmethod
    def generate_sample_prompts(sections: Dict[str, str], num_prompts: int = 5) -> List[str]:
        sample_prompts = []
        for header in list(sections.keys())[:num_prompts]:
            prompt = f"Generate {header} Dashboard"
            sample_prompts.append(prompt)
        
        default_prompts = [
            "Technical Skills Analysis",
            "Work Experience Overview", 
            "Education Background",
            "Project Highlights",
            "Professional Achievements"
        ]
        
        while len(sample_prompts) < num_prompts:
            index = len(sample_prompts) - num_prompts
            sample_prompts.append(default_prompts[index % len(default_prompts)])
        
        return sample_prompts

    @staticmethod
    def evaluate_answer_prompt(question: str, answer: str) -> dict:
        prompt = f"""
        Evaluate this recorded answer against the expected answer format:
        
        Recorded Question: {question}
        Recorded Answer: {answer}
        
        Evaluate and provide scores in exactly this format:
        Technical: [score 0-100]
        Clarity: [score 0-100]
        Completeness: [score 0-100]
        Overall: [brief evaluation]
        """
        
        response = model.generate_content(prompt)
        evaluation_text = response.text.strip()
        
        evaluation_data = {
            "technical": int(re.search(r"Technical: (\d+)", evaluation_text).group(1)),
            "clarity": int(re.search(r"Clarity: (\d+)", evaluation_text).group(1)),
            "completeness": int(re.search(r"Completeness: (\d+)", evaluation_text).group(1)),
            "overall": re.search(r"Overall: (.+)$", evaluation_text, re.MULTILINE).group(1).strip()
        }
        
        return evaluation_data

##GENAI HAS TO UNDERSTANd THE   context of the JD and create dashboards dynamically based on no of dashboards user selection (rephrase it)
#few shot, multi shot example prompts
#

class JobAnalysisPrompts:
    @staticmethod
    def get_analysis_template():
        return """Analyze this job description and extract the following structured information:

1. Job Title: Extract the exact job title
2. Department/Industry: Identify the department or industry type
3. Required Skills: List all required/must-have skills (comma-separated)
4. Preferred Skills: List all preferred/good-to-have skills (comma-separated)
5. Experience Level: Extract years of experience required
6. Education Requirements: Extract education qualifications
7. Role Description: Summarize the main responsibilities in 2-3 sentences
8. Employment Type: Extract if mentioned (Full-time, Part-time, Contract, etc.)

Format your response EXACTLY as follows with no additional text:
JOB_TITLE: [Extracted job title]
DEPARTMENT: [Extracted department/industry]
REQUIRED_SKILLS: [Skill 1, Skill 2, ...]
PREFERRED_SKILLS: [Skill 1, Skill 2, ...]
EXPERIENCE: [X years]
EDUCATION: [Education requirements]
ROLE_DESCRIPTION: [Concise description]
EMPLOYMENT_TYPE: [Type of employment]

Rules:
- Extract information EXACTLY as presented in the text
- If information for a field is not available, use "Not specified"
- For skills, normalize formatting (lowercase, remove extra spaces)
- Identify key skills even if they're in different sections of the document
- Properly handle formatting issues in the original text
- DO NOT include any explanations or additional text in your response

Job Description:
{context}"""

    @staticmethod
    def get_skills_extraction_template():
        return """Extract ALL technical and professional skills from this job description.
Focus on identifying:
1. Programming languages (Python, Java, C++, etc.)
2. Frameworks and libraries (TensorFlow, PyTorch, etc.)
3. Tools and platforms (AWS, Azure, GCP, etc.)
4. Technical concepts (NLP, ML, AI, etc.)
5. Soft skills (communication, teamwork, etc.)

Format your response as a simple comma-separated list of skills, with no additional text.
Normalize all skills (lowercase, remove extra spaces).

Job Description:
{context}"""

    @staticmethod
    def get_structured_extraction_template():
        return """Extract structured information from this job description in a consistent format.
You must extract the following fields:

- Job Title
- Department/Industry
- Required Skills (as a comma-separated list)
- Preferred Skills (as a comma-separated list)
- Experience Required (in years)
- Education Requirements
- Employment Type
- Role Summary (brief description)

Format your response EXACTLY as follows with NO additional text or explanations:
JOB_TITLE: [extracted text]
DEPARTMENT: [extracted text]
REQUIRED_SKILLS: [extracted list]
PREFERRED_SKILLS: [extracted list]
EXPERIENCE: [extracted text]
EDUCATION: [extracted text]
EMPLOYMENT_TYPE: [extracted text]
ROLE_SUMMARY: [extracted text]

If any field is not found in the job description, use "Not specified" as the value.
Be thorough in your extraction and ensure all relevant information is captured.

Job Description:
{context}"""



#Job_description
# Prompt template for generating Q&A pairs from dashboard content
GENERATE_QA_PROMPT = """Based on this dashboard content, generate {num_qa} relevant questions and answers.
Format each Q&A pair exactly as follows:
Q1: [Question text]
A1: [Answer text]
...
Dashboard content:
{dashboard_content}"""

# Prompt template for generating similar Q&A pairs
GENERATE_SIMILAR_QA_PROMPT = """  
Based on this Q&A pair:
{original_qa}
Generate {num_pairs} different but similar Q&A pairs in the same format and topic.
Each Q&A should explore different aspects of the topic and use varied questioning approaches.
Ensure each pair is unique and covers different concepts within the same subject area.
Vary the complexity and specific details while maintaining relevance to the core topic.
Each pair should be separated by a blank line.
Format as:
Q: [Unique question about a different aspect]
A: [Detailed answer specific to that question]
"""

# Prompt template for evaluating answer accuracy
EVALUATE_QA_PROMPT = """Evaluate how well the following answer addresses the question. Consider:
1. Relevance to the question (aim for 95% relevance)
2. Completeness of the answer (aim for 100% completeness)
3. Accuracy of information (aim for 98% accuracy)
Question: {question}
Answer: {answer}
Provide a score from 0 to 100 and a brief explanation.
Return only two lines:
SCORE: [number]
EXPLANATION: [brief explanation]"""

# Prompt for AI-based question detection
QUESTION_STARTERS = """Analyze the following text and determine if it contains a question.
Consider all possible question formats, including:
1. Direct questions with question marks
2. Indirect questions without question marks
3. Implied questions or requests for information
4. Questions that don't start with traditional question words
5. Complex or compound questions
6. Follow-up probes or requests for elaboration
7 .Questions on trending keywords related to the JD and Resume Skills

Interview dialogue:
{dialogue}

Interviewer's last statement:
{statement}

Text to analyze:
{text}

Based on this interview dialogue, generate {num_questions} natural follow-up questions that the interviewer might ask next.
The questions should:
1. Flow naturally from the previous conversation
2. Probe deeper into topics already mentioned
3. Clarify any ambiguous or incomplete information
4. Theoritical questions that expect an answer in this context
5. Incomplete questions or interrupted speech
6. Assess the candidate's knowledge or experience in relevant areas
7. Vary between technical, behavioral, and situational questions as appropriate

Interview dialogue:
{dialogue}

Format your response as a numbered list of questions only.

From this interview statement, extract the core question or request for information.
Remove filler words, conversational elements, and reformat into a clear, direct question.
If multiple questions are present, extract the main question only.

Original statement:
{statement}

Return only the extracted question, nothing else.

Return only "YES" if the text contains a question, or "NO" if it doesn't.
"""