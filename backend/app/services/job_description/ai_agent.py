from typing import Dict, List, Any, Optional
import os
import time
import sounddevice as sd
import soundfile as sf
import numpy as np
import speech_recognition as sr
import google.generativeai as genai
import re
from app.core.Config import logger, GOOGLE_API_KEY

class AIPromptAgent:
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or GOOGLE_API_KEY
        if not self.api_key:
            raise ValueError("API_KEY is not set")
        
        genai.configure(api_key=self.api_key)
        self.model = genai.GenerativeModel('gemini-pro')
        
        # Store context for the agent to learn from
        self.context = {"previous_prompts": [], "user_preferences": {}, "prompt_effectiveness": {}}
    
    def generate_prompt(self, task_type: str, parameters: Dict[str, Any]) -> str:
        try:
            meta_prompt = self.create_meta_prompt(task_type, parameters)
            response = self.model.generate_content(meta_prompt)
            generated_prompt = response.text.strip()
            
            # Store the prompt for learning
            self.context["previous_prompts"].append({
                "task_type": task_type,
                "parameters": parameters,
                "generated_prompt": generated_prompt
            })
            
            return generated_prompt
        except Exception as e:
            logger.error(f"Error generating prompt: {str(e)}")
            return self._get_fallback_prompt(task_type, parameters)
    
    def create_meta_prompt(self, task_type: str, parameters: Dict[str, Any]) -> str:
        # Base instruction for creating an optimal prompt
        base_instruction = f"""
        Create an optimal prompt for an AI to perform the following task: {task_type}.
        
        The prompt should be designed to get the best possible response for this specific use case.
        
        Task parameters:
        {self._format_parameters(parameters)}
        
        Previous successful prompts for reference:
        {self._get_relevant_previous_prompts(task_type)}
        
        The generated prompt should:
        1. Be clear and specific about the expected output format
        2. Include any necessary context or examples
        3. Specify constraints or requirements
        4. Be optimized for the specific AI model being used (Gemini Pro)
        
        Return ONLY the prompt text that should be sent to the AI, with no additional explanations.
        """
        
        # Add task-specific instructions based on the task type
        task_instructions = {
            "dashboard_generation": """
                The dashboard generation prompt should:
                - Extract relevant information from the provided content
                - Organize information into a structured dashboard format
                - Prioritize information based on relevance to the dashboard topic
                - Include formatting instructions for headers, sections, etc.
            """,
            "qa_generation": """
                The QA generation prompt should:
                - Generate questions that test understanding of key concepts
                - Create a balance of factual, conceptual, and applied questions
                - Include expected answers that are comprehensive and accurate
                - Specify the exact format for output (e.g., Q1/A1 format)
                - Generate questions at appropriate difficulty levels
            """,
            "answer_evaluation": """
                The answer evaluation prompt should:
                - Establish clear evaluation criteria
                - Request both quantitative scores and qualitative feedback
                - Compare against provided expected answers
                - Assess technical accuracy, completeness, and clarity
                - Output in a consistent structured format
            """,
            "job_analysis": """
                The job analysis prompt should:
                - Extract key requirements from the job description
                - Identify required and preferred skills clearly
                - Determine experience level and education requirements
                - Categorize technical and soft skills separately
                - Output in a structured, easy-to-parse format
            """,
            "resume_section": """
                The resume section prompt should:
                - Segment the resume into logical sections
                - Preserve important formatting and hierarchical structure
                - Identify key information like skills, experience, and education
                - Maintain chronological order where appropriate
                - Ensure all content is properly categorized
            """,
            "follow_up_questions": """
                The follow-up questions prompt should:
                - Generate questions that naturally follow from the previous answer
                - Probe deeper into technical knowledge or experience
                - Include a mix of clarification and expansion questions
                - Maintain contextual relevance to the interview topic
                - Vary in complexity and scope
            """
        }
        
        if task_type in task_instructions:
            base_instruction += task_instructions[task_type]
            
        return base_instruction
        
    def _format_parameters(self, parameters: Dict[str, Any]) -> str:
        formatted = []
        for key, value in parameters.items():
            if isinstance(value, dict) or isinstance(value, list):
                import json
                formatted.append(f"- {key}: {json.dumps(value, indent=2)}")
            else:
                formatted.append(f"- {key}: {value}")
        return "\n".join(formatted)
    
    def _get_relevant_previous_prompts(self, task_type: str, max_examples: int = 2) -> str:
        relevant_prompts = [p for p in self.context["previous_prompts"] 
                            if p["task_type"] == task_type]
        
        # Sort by effectiveness if available
        if task_type in self.context["prompt_effectiveness"]:
            relevant_prompts.sort(
                key=lambda p: self.context["prompt_effectiveness"].get(
                    self._get_prompt_key(p), 0
                ),
                reverse=True
            )
        
        # Return formatted examples
        examples = []
        for idx, prompt in enumerate(relevant_prompts[:max_examples]):
            examples.append(f"Example {idx+1}:\n{prompt['generated_prompt']}")
        
        if not examples:
            return "No previous examples available."
        
        return "\n\n".join(examples)
    
    def _get_prompt_key(self, prompt_data: Dict) -> str:
        return f"{prompt_data['task_type']}_{hash(str(prompt_data['parameters']))}"
    
    def record_effectiveness(self, task_type: str, parameters: Dict[str, Any], 
                            prompt: str, effectiveness_score: float) -> None:
        """Record the effectiveness of a prompt for future learning."""
        prompt_key = f"{task_type}_{hash(str(parameters))}"
        self.context["prompt_effectiveness"][prompt_key] = effectiveness_score
    
    def _get_fallback_prompt(self, task_type: str, parameters: Dict[str, Any]) -> str:
        fallbacks = {
            "dashboard_generation": f"""
                Using the provided content, create a dashboard focused on: {parameters.get('focus', 'general overview')}
                
                Format your response as follows:
                # {parameters.get('title', 'Dashboard')}
                
                ## Key Points
                [Extract and list key points related to the focus area]
                
                ## Details
                [Provide detailed information in structured format]
                
                Content to analyze:
                {parameters.get('content', '')}
            """,
            "qa_generation": f"""
                Based on this content, generate {parameters.get('num_questions', 5)} interview questions and their ideal answers:
                {parameters.get('content', '')}
                
                Format each Q&A pair exactly like this:
                Q1: [Question here]
                A1: [Answer here]
            """,
            "answer_evaluation": f"""
                Evaluate this recorded answer against the expected answer format:
                
                Question: {parameters.get('question', '')}
                Recorded Answer: {parameters.get('answer', '')}
                
                Evaluate and provide scores in exactly this format:
                Technical: [score 0-100]
                Clarity: [score 0-100]
                Completeness: [score 0-100]
                Overall: [brief evaluation]
            """,
            "job_analysis": f"""
                Analyze this job description and extract the following structured information:
                
                1. Job Title: Extract the exact job title
                2. Department/Industry: Identify the department or industry type
                3. Required Skills: List all required/must-have skills (comma-separated)
                4. Preferred Skills: List all preferred/good-to-have skills (comma-separated)
                5. Experience Level: Extract years of experience required
                6. Education Requirements: Extract education qualifications
                7. Role Description: Summarize the main responsibilities in 2-3 sentences
                
                Format your response EXACTLY as follows with no additional text:
                JOB_TITLE: [Extracted job title]
                DEPARTMENT: [Extracted department/industry]
                REQUIRED_SKILLS: [Skill 1, Skill 2, ...]
                PREFERRED_SKILLS: [Skill 1, Skill 2, ...]
                EXPERIENCE: [X years]
                EDUCATION: [Education requirements]
                ROLE_DESCRIPTION: [Concise description]
                
                Job Description:
                {parameters.get('job_description', '')}
            """
        }
        
        if task_type in fallbacks:
            return fallbacks[task_type]
        else:
            return f"Generate content based on: {parameters.get('content', '')}"

    def execute_task(self, task_type: str, parameters: Dict[str, Any]) -> Dict[str, Any]:
        try:
            # Generate the prompt
            prompt = self.generate_prompt(task_type, parameters)
            
            # Execute the prompt
            response = self.model.generate_content(prompt)
            result = response.text.strip()
            
            return {
                "status": "success",
                "result": result,
                "prompt_used": prompt
            }
        except Exception as e:
            logger.error(f"Error executing task: {str(e)}")
            return {
                "status": "error",
                "error": str(e),
                "prompt_used": prompt if 'prompt' in locals() else None
            }


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
    
    def __init__(self):
        self.ai_agent = AIPromptAgent()
    
    def generate_dashboards_prompt(self, text: str, sections: Dict[str, str], num_sections: int = 9) -> List[str]:
        dashboards = []
        
        for header, section_content in list(sections.items())[:num_sections]:
            parameters = {
                "title": header,
                "content": section_content,
                "focus": header,
                "num_sections": num_sections
            }
            
            result = self.ai_agent.execute_task("dashboard_generation", parameters)
            
            if result["status"] == "success":
                dashboards.append(result["result"].strip())
            else:
                # Fallback to a basic formatted dashboard
                dashboards.append(f"# {header} Dashboard\n{section_content}")
        
        # Ensure we return the requested number of dashboards
        dashboards.extend([""] * (num_sections - len(dashboards)))
        return dashboards

    def generate_custom_dashboard_prompt(self, relevant_section: Dict[str, str], prompt: str) -> str:
        parameters = {
            "section": relevant_section,
            "custom_prompt": prompt,
            "format": "dashboard"
        }
        
        result = self.ai_agent.execute_task("dashboard_generation", parameters)
        
        if result["status"] == "success":
            return result["result"]
        else:
            # Fallback to basic format
            import json
            return f"""
            Using this specific resume section:
            {json.dumps(relevant_section, indent=2)}
            
            Create a single focused dashboard for: {prompt}
            """

    def generate_qa_prompt(self, section_content: str, num_questions: int) -> Dict[str, str]:
        parameters = {
            "content": section_content,
            "num_questions": num_questions
        }
        
        result = self.ai_agent.execute_task("qa_generation", parameters)
        
        return {
            "status": result["status"],
            "qa_content": result.get("result", ""),
            "error": result.get("error", None)
        }

    def generate_follow_up_prompt(self, question: str, answer: str) -> str:
        parameters = {
            "question": question,
            "answer": answer,
            "num_follow_ups": 3
        }
        
        result = self.ai_agent.execute_task("follow_up_questions", parameters)
        
        if result["status"] == "success":
            return result["result"]
        else:
            # Fallback
            return f"""
            Based on this Q&A:
            Q: {question}
            A: {answer}
            
            Generate 3 follow-up questions.
            """

    def evaluate_answer_prompt(self, question: str, answer: str) -> dict:
        parameters = {
            "question": question,
            "answer": answer
        }
        
        result = self.ai_agent.execute_task("answer_evaluation", parameters)
        
        if result["status"] == "success":
            evaluation_text = result["result"]
            try:
                evaluation_data = {
                    "technical": int(re.search(r"Technical: (\d+)", evaluation_text).group(1)),
                    "clarity": int(re.search(r"Clarity: (\d+)", evaluation_text).group(1)),
                    "completeness": int(re.search(r"Completeness: (\d+)", evaluation_text).group(1)),
                    "overall": re.search(r"Overall: (.+)$", evaluation_text, re.MULTILINE).group(1).strip()
                }
                return evaluation_data
            except:
                return {"error": "Failed to parse evaluation results", "raw_text": evaluation_text}
        else:
            return {"error": result.get("error", "Unknown error")}

    # Audio recording methods remain the same
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

    def generate_sample_prompts(self, sections: Dict[str, str], num_prompts: int = 5) -> List[str]:
        parameters = {
            "sections": list(sections.keys()),
            "num_prompts": num_prompts
        }
        
        result = self.ai_agent.execute_task("sample_prompts", parameters)
        
        if result["status"] == "success":
            # Parse the result to get the prompts
            try:
                prompts = result["result"].strip().split("\n")
                prompts = [p.strip() for p in prompts if p.strip()]
                
                # Ensure we have the right number of prompts
                if len(prompts) < num_prompts:
                    default_prompts = [
                        "Technical Skills Analysis",
                        "Work Experience Overview", 
                        "Education Background",
                        "Project Highlights",
                        "Professional Achievements"
                    ]
                    prompts.extend(default_prompts[:num_prompts-len(prompts)])
                
                return prompts[:num_prompts]
            except:
                # Fallback if parsing fails
                return self._generate_default_prompts(sections, num_prompts)
        else:
            return self._generate_default_prompts(sections, num_prompts)
    
    def _generate_default_prompts(self, sections: Dict[str, str], num_prompts: int = 5) -> List[str]:
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


class JobAnalysisPrompts:
    def __init__(self):
        self.ai_agent = AIPromptAgent()
    
    def get_analysis_template(self, job_description: str = ""):
        """Generate job analysis template using AI agent."""
        parameters = {
            "job_description": job_description
        }
        
        result = self.ai_agent.execute_task("job_analysis", parameters)
        
        if result["status"] == "success":
            return result["result"]
        else:
            # Fallback to the original template
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

    def get_skills_extraction_template(self, job_description: str = ""):
        parameters = {
            "job_description": job_description,
            "task": "skills_extraction"
        }
        
        result = self.ai_agent.execute_task("job_analysis", parameters)
        
        if result["status"] == "success":
            return result["result"]
        else:
            # Fallback
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

    def get_structured_extraction_template(self, job_description: str = ""):
        parameters = {
            "job_description": job_description,
            "task": "structured_extraction"
        }
        
        result = self.ai_agent.execute_task("job_analysis", parameters)
        
        if result["status"] == "success":
            return result["result"]
        else:
            # Fallback
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