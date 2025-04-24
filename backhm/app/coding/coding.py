# import json
# import google.generativeai as genai
# import warnings
# from langchain_community.document_loaders import PyPDFLoader, Docx2txtLoader
# import os
# from dotenv import load_dotenv
# import time
# import logging
# from fastapi import FastAPI, File, UploadFile, HTTPException
# from pydantic import BaseModel
# from typing import Dict, Any
# import uvicorn

# # Base setup code remains the same
# warnings.filterwarnings("ignore")
# load_dotenv()

# GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
# if not GEMINI_API_KEY:
#     raise ValueError("GEMINI_API_KEY not found in environment variables")

# MAX_CONTENT_LENGTH = 4000

# # Configure logging
# logging.basicConfig(level=logging.INFO)
# logger = logging.getLogger(__name__)

# # Templates remain exactly the same
# LANGUAGE_DETECTION_TEMPLATE = """
# Analyze the provided text and extract programming languages:
# - List only programming languages (like Python, Java, JavaScript, etc.)
# - Include version requirements if specified
# - Note the context of usage
# Return as comma-separated list.

# Text: {text}
# """

# LANGUAGE_ANALYSIS_TEMPLATE = """
# Analyze the requirements for {language} in the provided text. Include:
# 1. Required experience level and years
# 2. Required skills and competencies
# 3. Related frameworks and tools
# 4. Proficiency level (Basic/Intermediate/Expert)

# Return as JSON:
# {{
#     "name": "{language}",
#     "experience": "experience details",
#     "skills": ["skill1", "skill2"],
#     "frameworks": ["framework1", "framework2"],
#     "proficiency": "Expert/Intermediate/Basic"
# }}

# Text: {text}
# """

# QA_GENERATION_TEMPLATE = """
# Generate a comprehensive set of questions and answers for the programming language {language} at {proficiency} level.

# You must generate exactly {count} questions for EACH of these categories:

# 1. THEORETICAL QUESTIONS:
# - Focus on core concepts, principles, and fundamentals
# - Questions should match {proficiency} level
# - Must generate exactly {count} questions

# 2. PRACTICAL QUESTIONS:
# - Focus on real-world applications and usage
# - Questions should match {proficiency} level
# - Must generate exactly {count} questions

# 3. CODING CHALLENGES:
# - Include practical coding problems
# - Each with complete solutions and explanations
# - Must generate exactly {count} challenges

# Return in this exact JSON format:
# {{
#     "theoretical": [
#         {{"question": "detailed question", "answer": "comprehensive answer"}}
#         // Repeat exactly {count} times
#     ],
#     "practical": [
#         {{"question": "detailed question", "answer": "comprehensive answer"}}
#         // Repeat exactly {count} times
#     ],
#     "coding": [
#         {{
#             "question": "detailed coding challenge",
#             "solution": "complete code solution",
#             "explanation": "step-by-step explanation"
#         }}
#         // Repeat exactly {count} times
#     ]
# }}
# """

# # RateLimitedAPI class remains exactly the same
# class RateLimitedAPI:
#     def __init__(self, api_key: str, max_retries: int = 3):
#         self.api_key = api_key
#         self.max_retries = max_retries
#         genai.configure(api_key=self.api_key)
#         self.model = genai.GenerativeModel('gemini-pro')
    
#     def call_with_retry(self, prompt: str) -> str:
#         retry_count = 0
#         while retry_count < self.max_retries:
#             try:
#                 response = self.model.generate_content(prompt)
#                 cleaned_response = response.text.strip()
#                 if cleaned_response and len(cleaned_response) > 10:  # Basic validation
#                     return cleaned_response
#                 raise ValueError("Invalid response received")
#             except Exception as e:
#                 retry_count += 1
#                 if retry_count == self.max_retries:
#                     logger.error(f"API call failed after {self.max_retries} retries: {str(e)}")
#                     raise
#                 time.sleep(2 ** retry_count)  # Exponential backoff
    
#     def call(self, prompt: str) -> str:
#         try:
#             return self.call_with_retry(prompt)
#         except Exception as e:
#             logger.error(f"API call failed: {str(e)}")
#             return str(e)

# # DocumentProcessor class remains exactly the same
# class DocumentProcessor:
#     @staticmethod
#     async def save_upload_file(upload_file: UploadFile) -> str:
#         temp_file_path = f"temp_{upload_file.filename}"
#         try:
#             contents = await upload_file.read()
#             with open(temp_file_path, 'wb') as f:
#                 f.write(contents)
#             return temp_file_path
#         except Exception as e:
#             raise HTTPException(status_code=400, detail=f"Error saving file: {str(e)}")

#     @staticmethod
#     def load_document(file_path: str) -> str:
#         try:
#             file_extension = os.path.splitext(file_path)[1].lower()
            
#             if file_extension == '.pdf':
#                 loader = PyPDFLoader(file_path)
#             elif file_extension == '.docx':
#                 loader = Docx2txtLoader(file_path)
#             else:
#                 raise ValueError(f"Unsupported file format: {file_extension}")
            
#             pages = loader.load()
#             return ' '.join([page.page_content for page in pages])
#         except Exception as e:
#             raise ValueError(f"Error loading document: {str(e)}")
#         finally:
#             if os.path.exists(file_path) and file_path.startswith('temp_'):
#                 os.remove(file_path)

# # LanguageAnalyzer class remains exactly the same
# class LanguageAnalyzer:
#     def __init__(self, api_key: str):
#         self.api = RateLimitedAPI(api_key)
#         self.doc_processor = DocumentProcessor()
#         self.retry_count = 3
    
#     def extract_languages(self, document_content: str) -> list:
#         prompt = LANGUAGE_DETECTION_TEMPLATE.format(text=document_content[:MAX_CONTENT_LENGTH])
#         response = self.api.call(prompt)
#         return [lang.strip() for lang in response.split(',') if len(lang.strip()) > 1]
    
#     def analyze_language(self, language: str, document_content: str) -> dict:
#         prompt = LANGUAGE_ANALYSIS_TEMPLATE.format(
#             language=language,
#             text=document_content[:MAX_CONTENT_LENGTH]
#         )
#         response = self.api.call(prompt)
#         try:
#             return json.loads(response)
#         except json.JSONDecodeError:
#             return {
#                 "name": language,
#                 "experience": "Not specified",
#                 "skills": [],
#                 "frameworks": [],
#                 "proficiency": "Intermediate"
#             }
    
#     def generate_qa(self, language: str, proficiency: str, count: int) -> dict:
#         for attempt in range(self.retry_count):
#             try:
#                 prompt = QA_GENERATION_TEMPLATE.format(
#                     language=language,
#                     proficiency=proficiency,
#                     count=count
#                 )
#                 response = self.api.call(prompt)
#                 qa_data = json.loads(response)
                
#                 if self.is_valid_qa_response(qa_data, count):
#                     return qa_data
                
#                 fixed_data = self.validate_qa_count(qa_data, count)
#                 if self.is_valid_qa_response(fixed_data, count):
#                     return fixed_data
                
#             except (json.JSONDecodeError, Exception) as e:
#                 logger.warning(f"Attempt {attempt + 1} failed for {language}: {str(e)}")
#                 if attempt == self.retry_count - 1:
#                     return self.generate_fallback_qa(language, count)
#                 time.sleep(2 ** attempt)
        
#         return self.generate_fallback_qa(language, count)

#     def is_valid_qa_response(self, qa_data: dict, expected_count: int) -> bool:
#         try:
#             if not all(key in qa_data for key in ['theoretical', 'practical', 'coding']):
#                 return False
            
#             if not all(len(qa_data[key]) == expected_count for key in ['theoretical', 'practical', 'coding']):
#                 return False
            
#             for section in ['theoretical', 'practical']:
#                 if not all('question' in item and 'answer' in item for item in qa_data[section]):
#                     return False
            
#             for coding_item in qa_data['coding']:
#                 if not all(key in coding_item for key in ['question', 'solution', 'explanation']):
#                     return False
            
#             return True
#         except Exception:
#             return False

#     def validate_qa_count(self, qa_data: dict, expected_count: int) -> dict:
#         fallback = self.generate_fallback_qa("", expected_count)
        
#         validated = {
#             "theoretical": [],
#             "practical": [],
#             "coding": []
#         }
        
#         for category in ['theoretical', 'practical', 'coding']:
#             items = qa_data.get(category, [])
#             if not items or len(items) != expected_count:
#                 items = fallback[category]
#             validated[category] = items[:expected_count]
            
#             while len(validated[category]) < expected_count:
#                 validated[category].append(fallback[category][0])
        
#         return validated

#     def generate_fallback_qa(self, language: str, count: int) -> dict:
#         language_name = language if language else "the programming language"
        
#         theoretical = [
#             {
#                 "question": f"What are the core principles of {language_name}? (Question {i+1})",
#                 "answer": f"This is a placeholder answer for theoretical question {i+1}. Please regenerate content."
#             } for i in range(count)
#         ]
        
#         practical = [
#             {
#                 "question": f"How would you implement {language_name} in a real-world scenario? (Question {i+1})",
#                 "answer": f"This is a placeholder answer for practical question {i+1}. Please regenerate content."
#             } for i in range(count)
#         ]
        
#         coding = [
#             {
#                 "question": f"Create a program in {language_name} that demonstrates key concepts (Challenge {i+1})",
#                 "solution": "// Placeholder code solution\n// Please regenerate content",
#                 "explanation": f"This is a placeholder explanation for coding challenge {i+1}. Please regenerate content."
#             } for i in range(count)
#         ]
        
#         return {
#             "theoretical": theoretical,
#             "practical": practical,
#             "coding": coding
            
#         }

# # FastAPI app and routes
# app = FastAPI(
#     title="Programming Language Analysis API",
#     description="API for analyzing programming language requirements and generating Q&A content",
#     version="1.0.0"
# )

# class AnalysisResponse(BaseModel):
#     status: str
#     results: Dict[str, Any] = None
#     message: str = None

# @app.post("/analyze", response_model=AnalysisResponse)
# async def analyze_document(
#     file: UploadFile = File(...),
#     question_count: int = 3
# ):
#     try:
#         if not file.filename.lower().endswith(('.pdf', '.docx')):
#             raise HTTPException(
#                 status_code=400,
#                 detail="Only PDF and DOCX files are supported"
#             )

#         analyzer = LanguageAnalyzer(GEMINI_API_KEY)
        
#         # Save and process the uploaded file
#         temp_file_path = await DocumentProcessor.save_upload_file(file)
#         document_content = analyzer.doc_processor.load_document(temp_file_path)
        
#         # Detect programming languages
#         languages = analyzer.extract_languages(document_content)
        
#         if not languages:
#             return AnalysisResponse(
#                 status="warning",
#                 message="No programming languages detected in the document"
#             )
        
#         # Comprehensive analysis for each language
#         results = {}
#         for language in languages:
#             # Get metrics
#             metrics = analyzer.analyze_language(language, document_content)
            
#             # Generate Q&A with exact count for each category
#             qa_content = analyzer.generate_qa(
#                 language,
#                 metrics.get("proficiency", "Intermediate"),
#                 int(question_count)
#             )
            
#             # Combine metrics and Q&A
#             results[language] = {
#                 "metrics": metrics,
#                 "qa": qa_content
#             }
        
#         return AnalysisResponse(status="success", results=results)
#     except Exception as e:
#         logger.error(f"Error processing document: {str(e)}")
#         raise HTTPException(status_code=500, detail=str(e))

# if __name__ == "__main__":
#     uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

# import json
# import google.generativeai as genai
# import warnings
# from langchain_community.document_loaders import PyPDFLoader, Docx2txtLoader
# import os
# from dotenv import load_dotenv
# import time
# import logging
# import re
# from fastapi import FastAPI, File, UploadFile, HTTPException, Depends
# from pydantic import BaseModel
# from typing import Dict, Any, List
# import uvicorn

# # Base setup code
# warnings.filterwarnings("ignore")
# load_dotenv()

# GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
# if not GEMINI_API_KEY:
#     raise ValueError("GEMINI_API_KEY not found in environment variables")

# MAX_CONTENT_LENGTH = 4000

# # Configure logging
# logging.basicConfig(level=logging.INFO)
# logger = logging.getLogger(__name__)

# # Templates
# LANGUAGE_DETECTION_TEMPLATE = """
# Analyze the provided text and extract programming languages:
# - List only programming languages (like Python, Java, JavaScript, etc.)
# - Include version requirements if specified
# - Note the context of usage
# Return as comma-separated list.

# Text: {text}
# """

# LANGUAGE_ANALYSIS_TEMPLATE = """
# Analyze the requirements for {language} in the provided text. Include:
# 1. Required experience level and years
# 2. Required skills and competencies
# 3. Related frameworks and tools
# 4. Proficiency level (Basic/Intermediate/Expert)

# Return as JSON:
# {{
#     "name": "{language}",
#     "experience": "experience details",
#     "skills": ["skill1", "skill2"],
#     "frameworks": ["framework1", "framework2"],
#     "proficiency": "Expert/Intermediate/Basic"
# }}

# Text: {text}
# """

# QA_GENERATION_TEMPLATE = """
# You are an expert technical interviewer and educator specializing in {language} programming.

# For {language} at the {proficiency} level, generate comprehensive Q&A content:

# THEORETICAL QUESTIONS:
# - Focus on advanced language-specific concepts
# - Ensure questions reflect {proficiency} expertise level
# - Include nuanced theoretical insights

# PRACTICAL QUESTIONS:
# - Emphasize real-world problem-solving scenarios
# - Highlight industry-standard practices
# - Demonstrate complex application of {language}

# CODING CHALLENGES:
# - Create multi-dimensional coding problems
# - Include complete, production-ready solutions
# - Provide detailed algorithmic and design explanations

# Generate exactly {count} questions for EACH category. The response must be a valid JSON with three categories: theoretical, practical, and coding.

# Requirements:
# 1. Questions must be unique
# 2. Answers should be comprehensive and technically precise
# 3. Match the difficulty to {proficiency} level
# 4. Showcase {language}'s unique capabilities

# Constraints:
# - {count} questions per category
# - JSON format with nested question-answer structures
# - Technical depth appropriate to {proficiency}
# """

# SAMPLE_PROMPT_TEMPLATE = """
# Generate a sample project prompt for a {language} dashboard that demonstrates the language's key capabilities and typical use cases.

# Guidelines:
# - Create a unique and practical dashboard idea
# - Highlight {language}'s strengths
# - Provide context for the dashboard's purpose
# - Ensure the prompt is realistic and implementable

# Focus on showcasing:
# - Core language features
# - Potential real-world applications
# - Innovative use of {language}'s capabilities

# Return the generated prompt as a JSON with these keys:
# {{
#     "prompt": "Complete dashboard prompt",
#     "description": "Brief explanation of the dashboard's purpose and significance"
# }}
# """

# class RateLimitedAPI:
#     def __init__(self, api_key: str, max_retries: int = 3):
#         self.api_key = api_key
#         self.max_retries = max_retries
#         genai.configure(api_key=self.api_key)
        
#         # Update to Gemini 1.5 Pro
#         self.model = genai.GenerativeModel('gemini-1.5-pro-latest')
    
#     def call_with_retry(self, prompt: str) -> str:
#         retry_count = 0
#         while retry_count < self.max_retries:
#             try:
#                 # Update generation method for 1.5 Pro
#                 response = self.model.generate_content(
#                     prompt,
#                     generation_config=genai.types.GenerationConfig(
#                         max_output_tokens=8192,  # Increased token limit
#                         temperature=0.7,  # Moderate creativity
#                         top_p=0.9,  # Helps with more diverse responses
#                         top_k=40  # Helps prevent repetitive outputs
#                     )
#                 )
                
#                 # Check if response has text attribute
#                 if hasattr(response, 'text'):
#                     cleaned_response = response.text.strip()
#                 elif hasattr(response, 'candidates') and response.candidates:
#                     cleaned_response = response.candidates[0].text.strip()
#                 else:
#                     raise ValueError("No valid response received")
                
#                 if cleaned_response and len(cleaned_response) > 10:  # Basic validation
#                     return cleaned_response
#                 raise ValueError("Invalid response received")
            
#             except Exception as e:
#                 retry_count += 1
#                 if retry_count == self.max_retries:
#                     logger.error(f"API call failed after {self.max_retries} retries: {str(e)}")
#                     raise
#                 time.sleep(2 ** retry_count)  # Exponential backoff
    
#     def call(self, prompt: str) -> str:
#         try:
#             return self.call_with_retry(prompt)
#         except Exception as e:
#             logger.error(f"API call failed: {str(e)}")
#             return str(e)

# class DocumentProcessor:
#     @staticmethod
#     async def save_upload_file(upload_file: UploadFile) -> str:
#         temp_file_path = f"temp_{upload_file.filename}"
#         try:
#             contents = await upload_file.read()
#             with open(temp_file_path, 'wb') as f:
#                 f.write(contents)
#             return temp_file_path
#         except Exception as e:
#             raise HTTPException(status_code=400, detail=f"Error saving file: {str(e)}")

#     @staticmethod
#     def load_document(file_path: str) -> str:
#         try:
#             file_extension = os.path.splitext(file_path)[1].lower()
            
#             if file_extension == '.pdf':
#                 loader = PyPDFLoader(file_path)
#             elif file_extension == '.docx':
#                 loader = Docx2txtLoader(file_path)
#             else:
#                 raise ValueError(f"Unsupported file format: {file_extension}")
            
#             pages = loader.load()
#             return ' '.join([page.page_content for page in pages])
#         except Exception as e:
#             raise ValueError(f"Error loading document: {str(e)}")
#         finally:
#             if os.path.exists(file_path) and file_path.startswith('temp_'):
#                 os.remove(file_path)

# class LanguageAnalyzer:
#     def __init__(self, api_key: str):
#         self.api = RateLimitedAPI(api_key)
#         self.doc_processor = DocumentProcessor()
#         self.retry_count = 3
    
#     def extract_languages(self, document_content: str) -> list:
#         prompt = LANGUAGE_DETECTION_TEMPLATE.format(text=document_content[:MAX_CONTENT_LENGTH])
#         response = self.api.call(prompt)
#         return [lang.strip() for lang in response.split(',') if len(lang.strip()) > 1]
    
#     def analyze_language(self, language: str, document_content: str) -> dict:
#         prompt = LANGUAGE_ANALYSIS_TEMPLATE.format(
#             language=language,
#             text=document_content[:MAX_CONTENT_LENGTH]
#         )
#         response = self.api.call(prompt)
#         try:
#             return json.loads(response)
#         except json.JSONDecodeError:
#             return {
#                 "name": language,
#                 "experience": "Not specified",
#                 "skills": [],
#                 "frameworks": [],
#                 "proficiency": "Intermediate"
#             }
    
#     def generate_qa(self, language: str, proficiency: str, count: int) -> dict:
#         """
#         Generate Q&A content for a specified programming language
#         with improved error handling and response parsing.
#         """
#         # Enhanced dynamic Q&A generation
#         prompt = QA_GENERATION_TEMPLATE.format(
#             language=language,
#             proficiency=proficiency,
#             count=count
#         )
        
#         # Initialize fallback response in case of failure
#         fallback = self.generate_fallback_qa(language, count)
        
#         try:
#             response = self.api.call(prompt)
            
#             # Try to parse the response as valid JSON
#             try:
#                 # Clean the response to ensure it's valid JSON
#                 # First, find JSON-like content between curly braces
#                 json_match = re.search(r'\{[\s\S]*\}', response, re.DOTALL)
#                 if json_match:
#                     json_text = json_match.group(0)
#                     # Try to parse the extracted JSON
#                     qa_data = json.loads(json_text)
#                 else:
#                     # If no JSON pattern found, try parsing the whole response
#                     qa_data = json.loads(response)
                
#                 # Validate and ensure correct structure
#                 if self.is_valid_qa_response(qa_data, count):
#                     return qa_data
#                 else:
#                     # If structure is invalid, fix it
#                     return self.validate_qa_count(qa_data, count)
                    
#             except json.JSONDecodeError as e:
#                 logger.warning(f"JSON parsing error: {str(e)}, attempting recovery")
                
#                 # Try to fix common JSON formatting issues
#                 cleaned_response = response.replace("```json", "").replace("```", "")
#                 json_match = re.search(r'\{[\s\S]*\}', cleaned_response, re.DOTALL)
                
#                 if json_match:
#                     try:
#                         fixed_json = json_match.group(0)
#                         # Additional cleaning for common issues
#                         fixed_json = re.sub(r',\s*}', '}', fixed_json)  # Remove trailing commas
#                         fixed_json = re.sub(r',\s*]', ']', fixed_json)  # Remove trailing commas in arrays
                        
#                         qa_data = json.loads(fixed_json)
#                         return self.validate_qa_count(qa_data, count)
#                     except Exception:
#                         logger.error("Failed to recover JSON after cleaning")
#                         return fallback
#                 else:
#                     logger.error("No JSON-like structure found in response")
#                     return fallback
        
#         except Exception as e:
#             logger.error(f"Q&A generation failed for {language}: {str(e)}")
#             return fallback

#     def is_valid_qa_response(self, qa_data: dict, expected_count: int) -> bool:
#         """Validate the structure of the Q&A response"""
#         try:
#             # Check if all required categories exist
#             required_keys = ['theoretical', 'practical', 'coding']
#             if not all(key in qa_data for key in required_keys):
#                 return False
            
#             # Check that each category is a list
#             if not all(isinstance(qa_data.get(key, []), list) for key in required_keys):
#                 return False
            
#             # Check theoretical and practical questions format
#             for key in ['theoretical', 'practical']:
#                 items = qa_data.get(key, [])
#                 # Allow for flexibility in count - we'll fix it later
#                 if not items or not all(isinstance(item, dict) for item in items):
#                     return False
#                 # Check minimal structure for each item
#                 if not all('question' in item for item in items):
#                     return False
            
#             # Check coding challenges format with more flexibility
#             coding_items = qa_data.get('coding', [])
#             if not coding_items or not all(isinstance(item, dict) for item in coding_items):
#                 return False
#             if not all('question' in item for item in coding_items):
#                 return False
            
#             return True
#         except Exception as e:
#             logger.warning(f"Error validating Q&A response: {str(e)}")
#             return False

#     def validate_qa_count(self, qa_data: dict, expected_count: int) -> dict:
#         """Ensure the Q&A data has the correct count and structure"""
#         # Prepare fallback for missing items
#         fallback = self.generate_fallback_qa("Generic", expected_count)
        
#         validated = {
#             "theoretical": [],
#             "practical": [],
#             "coding": []
#         }
        
#         # Process each category
#         for category in ['theoretical', 'practical', 'coding']:
#             try:
#                 # Get items from response or empty list if missing
#                 items = qa_data.get(category, [])
                
#                 # Normalize each item to ensure it has required fields
#                 normalized_items = []
#                 for i, item in enumerate(items[:expected_count]):
#                     if category in ['theoretical', 'practical']:
#                         normalized = {
#                             "question": item.get("question", f"Question {i+1}"),
#                             "answer": item.get("answer", "Comprehensive explanation of the concept.")
#                         }
#                     else:  # coding category
#                         normalized = {
#                             "question": item.get("question", f"Coding Challenge {i+1}"),
#                             "solution": item.get("solution", "# Solution code here"),
#                             "explanation": item.get("explanation", "Explanation of the solution approach.")
#                         }
#                     normalized_items.append(normalized)
                
#                 # If we don't have enough items, add from fallback
#                 if len(normalized_items) < expected_count:
#                     normalized_items.extend(fallback[category][len(normalized_items):expected_count])
                
#                 validated[category] = normalized_items[:expected_count]  # Ensure exact count
                
#             except Exception as e:
#                 logger.warning(f"Error processing {category}: {str(e)}")
#                 validated[category] = fallback[category]
        
#         return validated

#     def generate_fallback_qa(self, language: str, count: int) -> dict:
#         """Generate a fallback Q&A structure if API response fails"""
#         # Create more specific fallback content based on the language
#         theoretical = []
#         practical = []
#         coding = []
        
#         for i in range(count):
#             theoretical.append({
#                 "question": f"What are the key features of {language} that make it suitable for modern development? (Question {i+1})",
#                 "answer": f"As a versatile language, {language} offers robust features including strong typing, extensive libraries, and efficient memory management. Its design philosophy emphasizes readability and maintainability while providing powerful abstractions for complex systems."
#             })
            
#             practical.append({
#                 "question": f"How would you implement a scalable service in {language} that handles concurrent requests? (Question {i+1})",
#                 "answer": f"To implement a scalable service in {language}, I would use asynchronous programming patterns with proper error handling. The implementation would utilize connection pooling, implement appropriate caching strategies, and follow best practices for resource management."
#             })
            
#             coding.append({
#                 "question": f"Create a function in {language} that efficiently finds the most frequent element in an array. (Challenge {i+1})",
#                 "solution": f"# Sample {language} solution\ndef find_most_frequent(arr):\n    counter = {{}}\n    for item in arr:\n        counter[item] = counter.get(item, 0) + 1\n    return max(counter.items(), key=lambda x: x[1])[0]",
#                 "explanation": "This solution uses a hash map to count occurrences of each element in a single pass, achieving O(n) time complexity. The max function with a custom key function efficiently finds the most frequent element."
#             })
        
#         return {
#             "theoretical": theoretical,
#             "practical": practical,
#             "coding": coding
#         }

#     def generate_sample_prompts(self, languages: List[str]) -> Dict[str, Dict[str, str]]:
#         sample_prompts = {}
#         for language in languages:
#             try:
#                 prompt = SAMPLE_PROMPT_TEMPLATE.format(language=language)
#                 response = self.api.call(prompt)
                
#                 # Try to parse the response as JSON
#                 try:
#                     sample_prompt_data = json.loads(response)
#                     sample_prompts[language] = sample_prompt_data
#                 except json.JSONDecodeError:
#                     # Fallback if JSON parsing fails
#                     sample_prompts[language] = {
#                         "prompt": f"Generate a {language} dashboard",
#                         "description": f"A dashboard showcasing {language}'s capabilities"
#                     }
#             except Exception as e:
#                 logger.warning(f"Failed to generate sample prompt for {language}: {str(e)}")
#                 sample_prompts[language] = {
#                     "prompt": f"Generate a {language} dashboard",
#                     "description": f"A dashboard showcasing {language}'s capabilities"
#                 }
        
#         return sample_prompts

# # New State Management
# class DocumentState:
#     """
#     Shared state to manage document content and detected languages
#     across different endpoints
#     """
#     def __init__(self):
#         self.document_content = None
#         self.detected_languages = None
#         self.temp_file_path = None

# document_state = DocumentState()

# # Response Models
# class FileUploadResponse(BaseModel):
#     status: str
#     detected_languages: List[str]
#     message: str

# class SamplePromptResponse(BaseModel):
#     status: str
#     sample_prompts: Dict[str, Dict[str, str]]
#     message: str

# class LanguageMetricsResponse(BaseModel):
#     status: str
#     language_metrics: Dict[str, Any]
#     message: str

# class QAGenerationResponse(BaseModel):
#     status: str
#     qa_content: Dict[str, Any]
#     message: str

# # FastAPI app setup
# app = FastAPI(
#     title="Programming Language Analysis API",
#     description="API for analyzing programming language requirements with separated endpoints",
#     version="1.1.0"
# )

# # Dependency to ensure document is uploaded first
# def check_document_uploaded():
#     if not document_state.document_content:
#         raise HTTPException(
#             status_code=400, 
#             detail="Please upload a document first using the /upload endpoint"
#         )
#     return True

# # Upload Endpoint
# @app.post("/upload", response_model=FileUploadResponse)
# async def upload_document(file: UploadFile = File(...)):
#     try:
#         # Reset previous state
#         document_state.document_content = None
#         document_state.detected_languages = None
#         document_state.temp_file_path = None

#         # Validate file type
#         if not file.filename.lower().endswith(('.pdf', '.docx')):
#             raise HTTPException(
#                 status_code=400,
#                 detail="Only PDF and DOCX files are supported"
#             )

#         analyzer = LanguageAnalyzer(GEMINI_API_KEY)
        
#         # Save and process the uploaded file
#         temp_file_path = await DocumentProcessor.save_upload_file(file)
#         document_content = analyzer.doc_processor.load_document(temp_file_path)
        
#         # Store state
#         document_state.document_content = document_content
#         document_state.temp_file_path = temp_file_path

#         # Detect programming languages
#         languages = analyzer.extract_languages(document_content)
#         document_state.detected_languages = languages

#         if not languages:
#             return FileUploadResponse(
#                 status="warning",
#                 detected_languages=[],
#                 message="No programming languages detected in the document"
#             )
#         return FileUploadResponse(
#             status="success", 
#             detected_languages=languages,
#             message="Document uploaded and languages detected successfully"
#         )
#     except Exception as e:
#         logger.error(f"Error uploading document: {str(e)}")
#         raise HTTPException(status_code=500, detail=str(e))

# # Sample Prompts Generation Endpoint
# @app.post("/generate-sample-prompts", response_model=SamplePromptResponse)
# async def generate_sample_prompts(
#     _: bool = Depends(check_document_uploaded)
# ):
#     try:
#         analyzer = LanguageAnalyzer(GEMINI_API_KEY)
        
#         # Generate sample prompts for detected languages
#         sample_prompts = analyzer.generate_sample_prompts(
#             document_state.detected_languages
#         )
        
#         return SamplePromptResponse(
#             status="success", 
#             sample_prompts=sample_prompts,
#             message="Sample prompts generated successfully"
#         )
#     except Exception as e:
#         logger.error(f"Error generating sample prompts: {str(e)}")
#         raise HTTPException(status_code=500, detail=str(e))

# # Language Metrics Endpoint
# @app.post("/language-metrics", response_model=LanguageMetricsResponse)
# async def get_language_metrics(
#     _: bool = Depends(check_document_uploaded)
# ):
#     try:
#         analyzer = LanguageAnalyzer(GEMINI_API_KEY)
        
#         # Comprehensive analysis for each language
#         language_metrics = {}
#         for language in document_state.detected_languages:
#             # Get metrics
#             metrics = analyzer.analyze_language(
#                 language, 
#                 document_state.document_content
#             )
#             language_metrics[language] = metrics
        
#         return LanguageMetricsResponse(
#             status="success", 
#             language_metrics=language_metrics,
#             message="Language metrics generated successfully"
#         )
#     except Exception as e:
#         logger.error(f"Error generating language metrics: {str(e)}")
#         raise HTTPException(status_code=500, detail=str(e))

# # Q&A Generation Endpoint
# @app.post("/generate-qa", response_model=QAGenerationResponse)
# async def generate_qa(
#     language: str = None,
#     question_count: int = 3,
#     _: bool = Depends(check_document_uploaded)
# ):
#     try:
#         analyzer = LanguageAnalyzer(GEMINI_API_KEY)
        
#         # If no specific language provided, use first detected language
#         if not language:
#             if not document_state.detected_languages:
#                 raise HTTPException(
#                     status_code=400, 
#                     detail="No languages detected. Please specify a language."
#                 )
#             language = document_state.detected_languages[0]
        
#         # Modified check: Allow any language even if not detected in document
#         # This gives flexibility for users to request Q&A for languages not in the doc
#         if language not in document_state.detected_languages:
#             logger.warning(f"Language {language} not detected in document but proceeding anyway")
#             # Instead of raising an error, we'll continue with a default proficiency
#             proficiency = "Intermediate"
#         else:
#             # For detected languages, get the proficiency from analysis
#             metrics = analyzer.analyze_language(
#                 language, 
#                 document_state.document_content
#             )
#             proficiency = metrics.get("proficiency", "Intermediate")
        
#         # Generate Q&A content
#         qa_content = analyzer.generate_qa(
#             language,
#             proficiency,
#             int(question_count)
#         )
        
#         return QAGenerationResponse(
#             status="success", 
#             qa_content=qa_content,
#             message=f"Q&A content for {language} generated successfully"
#         )
#     except Exception as e:
#         error_msg = str(e)
#         logger.error(f"Error generating Q&A: {error_msg}")
#         # Provide more specific error message for debugging
#         raise HTTPException(
#             status_code=500, 
#             detail=f"Error generating Q&A: {error_msg}"
#         )

# # Optional: Health Check Endpoint
# @app.get("/health")
# async def health_check():
#     return {
#         "status": "healthy",
#         "version": "1.1.0",
#         "description": "Programming Language Analysis API is running"
#     }

# # Cleanup Endpoint (Optional: to manually reset document state)
# @app.post("/reset")
# async def reset_document_state():
#     global document_state
#     document_state = DocumentState()
#     return {"status": "success", "message": "Document state reset"}

# # Main execution
# if __name__ == "__main__":
#     uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)




import json
import google.generativeai as genai
import warnings
from langchain_community.document_loaders import PyPDFLoader, Docx2txtLoader
import os
from dotenv import load_dotenv
import time
import logging
import re
import uuid
from datetime import datetime
from fastapi import FastAPI, File, UploadFile, HTTPException, Depends, Body, Path, Query
from pydantic import BaseModel
from typing import Dict, Any, List
import uvicorn

# Base setup code
warnings.filterwarnings("ignore")
load_dotenv()

GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY not found in environment variables")

MAX_CONTENT_LENGTH = 4000

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Templates
LANGUAGE_DETECTION_TEMPLATE = """
Analyze the provided text and extract programming languages:
- List only programming languages (like Python, Java, JavaScript, etc.)
- Include version requirements if specified
- Note the context of usage
Return as comma-separated list.

Text: {text}
"""

LANGUAGE_ANALYSIS_TEMPLATE = """
Analyze the requirements for {language} in the provided text. Include:
1. Required experience level and years
2. Required skills and competencies
3. Related frameworks and tools
4. Proficiency level (Basic/Intermediate/Expert)

Return as JSON:
{{
    "name": "{language}",
    "experience": "experience details",
    "skills": ["skill1", "skill2"],
    "frameworks": ["framework1", "framework2"],
    "proficiency": "Expert/Intermediate/Basic"
}}

Text: {text}
"""

QA_GENERATION_TEMPLATE = """
You are an expert technical interviewer and educator specializing in {language} programming.

For {language} at the {proficiency} level, generate comprehensive Q&A content:

THEORETICAL QUESTIONS:
- Focus on advanced language-specific concepts
- Ensure questions reflect {proficiency} expertise level
- Include nuanced theoretical insights

PRACTICAL QUESTIONS:
- Emphasize real-world problem-solving scenarios
- Highlight industry-standard practices
- Demonstrate complex application of {language}

CODING CHALLENGES:
- Create multi-dimensional coding problems
- Include complete, production-ready solutions
- Provide detailed algorithmic and design explanations

Generate exactly {count} questions for EACH category. The response must be a valid JSON with three categories: theoretical, practical, and coding.

Requirements:
1. Questions must be unique
2. Answers should be comprehensive and technically precise
3. Match the difficulty to {proficiency} level
4. Showcase {language}'s unique capabilities

Constraints:
- {count} questions per category
- JSON format with nested question-answer structures
- Technical depth appropriate to {proficiency}
"""

SAMPLE_PROMPT_TEMPLATE = """
Generate a sample project prompt for a {language} dashboard that demonstrates the language's key capabilities and typical use cases.

Guidelines:
- Create a unique and practical dashboard idea
- Highlight {language}'s strengths
- Provide context for the dashboard's purpose
- Ensure the prompt is realistic and implementable

Focus on showcasing:
- Core language features
- Potential real-world applications
- Innovative use of {language}'s capabilities

Return the generated prompt as a JSON with these keys:
{{
    "prompt": "Complete dashboard prompt",
    "description": "Brief explanation of the dashboard's purpose and significance"
}}
"""

# Question validation template
QUESTION_VALIDATION_TEMPLATE = """
Validate and improve this {category} question for {language}:

Question: {question}
Answer: {answer}
{solution_text}
{explanation_text}

Provide feedback on:
1. Technical accuracy
2. Clarity of question
3. Completeness of answer
4. Suggested improvements

Response format:
{{
    "is_valid": true/false,
    "improved_question": "question text",
    "improved_answer": "answer text",
    "improved_solution": "solution code",  // only for coding questions
    "improved_explanation": "explanation text",  // only for coding questions
    "feedback": "validation feedback"
}}
"""

class RateLimitedAPI:
    def __init__(self, api_key: str, max_retries: int = 3):
        self.api_key = api_key
        self.max_retries = max_retries
        genai.configure(api_key=self.api_key)
        
        # Update to Gemini 1.5 Pro
        self.model = genai.GenerativeModel('gemini-1.5-pro-latest')
    
    def call_with_retry(self, prompt: str) -> str:
        retry_count = 0
        while retry_count < self.max_retries:
            try:
                # Update generation method for 1.5 Pro
                response = self.model.generate_content(
                    prompt,
                    generation_config=genai.types.GenerationConfig(
                        max_output_tokens=8192,  # Increased token limit
                        temperature=0.7,  # Moderate creativity
                        top_p=0.9,  # Helps with more diverse responses
                        top_k=40  # Helps prevent repetitive outputs
                    )
                )
                
                # Check if response has text attribute
                if hasattr(response, 'text'):
                    cleaned_response = response.text.strip()
                elif hasattr(response, 'candidates') and response.candidates:
                    cleaned_response = response.candidates[0].text.strip()
                else:
                    raise ValueError("No valid response received")
                
                if cleaned_response and len(cleaned_response) > 10:  # Basic validation
                    return cleaned_response
                raise ValueError("Invalid response received")
            
            except Exception as e:
                retry_count += 1
                if retry_count == self.max_retries:
                    logger.error(f"API call failed after {self.max_retries} retries: {str(e)}")
                    raise
                time.sleep(2 ** retry_count)  # Exponential backoff
    
    def call(self, prompt: str) -> str:
        try:
            return self.call_with_retry(prompt)
        except Exception as e:
            logger.error(f"API call failed: {str(e)}")
            return str(e)

class DocumentProcessor:
    @staticmethod
    async def save_upload_file(upload_file: UploadFile) -> str:
        temp_file_path = f"temp_{upload_file.filename}"
        try:
            contents = await upload_file.read()
            with open(temp_file_path, 'wb') as f:
                f.write(contents)
            return temp_file_path
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error saving file: {str(e)}")

    @staticmethod
    def load_document(file_path: str) -> str:
        try:
            file_extension = os.path.splitext(file_path)[1].lower()
            
            if file_extension == '.pdf':
                loader = PyPDFLoader(file_path)
            elif file_extension == '.docx':
                loader = Docx2txtLoader(file_path)
            else:
                raise ValueError(f"Unsupported file format: {file_extension}")
            
            pages = loader.load()
            return ' '.join([page.page_content for page in pages])
        except Exception as e:
            raise ValueError(f"Error loading document: {str(e)}")
        finally:
            if os.path.exists(file_path) and file_path.startswith('temp_'):
                os.remove(file_path)

class LanguageAnalyzer:
    def __init__(self, api_key: str):
        self.api = RateLimitedAPI(api_key)
        self.doc_processor = DocumentProcessor()
        self.retry_count = 3
    
    def extract_languages(self, document_content: str) -> list:
        prompt = LANGUAGE_DETECTION_TEMPLATE.format(text=document_content[:MAX_CONTENT_LENGTH])
        response = self.api.call(prompt)
        return [lang.strip() for lang in response.split(',') if len(lang.strip()) > 1]
    
    def analyze_language(self, language: str, document_content: str) -> dict:
        prompt = LANGUAGE_ANALYSIS_TEMPLATE.format(
            language=language,
            text=document_content[:MAX_CONTENT_LENGTH]
        )
        response = self.api.call(prompt)
        try:
            return json.loads(response)
        except json.JSONDecodeError:
            return {
                "name": language,
                "experience": "Not specified",
                "skills": [],
                "frameworks": [],
                "proficiency": "Intermediate"
            }
    
    def generate_qa(self, language: str, proficiency: str, count: int) -> dict:
        """
        Generate Q&A content for a specified programming language
        with improved error handling and response parsing.
        """
        # Enhanced dynamic Q&A generation
        prompt = QA_GENERATION_TEMPLATE.format(
            language=language,
            proficiency=proficiency,
            count=count
        )
        
        # Initialize fallback response in case of failure
        fallback = self.generate_fallback_qa(language, count)
        
        try:
            response = self.api.call(prompt)
            
            # Try to parse the response as valid JSON
            try:
                # Clean the response to ensure it's valid JSON
                # First, find JSON-like content between curly braces
                json_match = re.search(r'\{[\s\S]*\}', response, re.DOTALL)
                if json_match:
                    json_text = json_match.group(0)
                    # Try to parse the extracted JSON
                    qa_data = json.loads(json_text)
                else:
                    # If no JSON pattern found, try parsing the whole response
                    qa_data = json.loads(response)
                
                # Validate and ensure correct structure
                if self.is_valid_qa_response(qa_data, count):
                    return qa_data
                else:
                    # If structure is invalid, fix it
                    return self.validate_qa_count(qa_data, count)
                    
            except json.JSONDecodeError as e:
                logger.warning(f"JSON parsing error: {str(e)}, attempting recovery")
                
                # Try to fix common JSON formatting issues
                cleaned_response = response.replace("```json", "").replace("```", "")
                json_match = re.search(r'\{[\s\S]*\}', cleaned_response, re.DOTALL)
                
                if json_match:
                    try:
                        fixed_json = json_match.group(0)
                        # Additional cleaning for common issues
                        fixed_json = re.sub(r',\s*}', '}', fixed_json)  # Remove trailing commas
                        fixed_json = re.sub(r',\s*]', ']', fixed_json)  # Remove trailing commas in arrays
                        
                        qa_data = json.loads(fixed_json)
                        return self.validate_qa_count(qa_data, count)
                    except Exception:
                        logger.error("Failed to recover JSON after cleaning")
                        return fallback
                else:
                    logger.error("No JSON-like structure found in response")
                    return fallback
        
        except Exception as e:
            logger.error(f"Q&A generation failed for {language}: {str(e)}")
            return fallback

    def is_valid_qa_response(self, qa_data: dict, expected_count: int) -> bool:
        """Validate the structure of the Q&A response"""
        try:
            # Check if all required categories exist
            required_keys = ['theoretical', 'practical', 'coding']
            if not all(key in qa_data for key in required_keys):
                return False
            
            # Check that each category is a list
            if not all(isinstance(qa_data.get(key, []), list) for key in required_keys):
                return False
            
            # Check theoretical and practical questions format
            for key in ['theoretical', 'practical']:
                items = qa_data.get(key, [])
                # Allow for flexibility in count - we'll fix it later
                if not items or not all(isinstance(item, dict) for item in items):
                    return False
                # Check minimal structure for each item
                if not all('question' in item for item in items):
                    return False
            
            # Check coding challenges format with more flexibility
            coding_items = qa_data.get('coding', [])
            if not coding_items or not all(isinstance(item, dict) for item in coding_items):
                return False
            if not all('question' in item for item in coding_items):
                return False
            
            return True
        except Exception as e:
            logger.warning(f"Error validating Q&A response: {str(e)}")
            return False

    def validate_qa_count(self, qa_data: dict, expected_count: int) -> dict:
        """Ensure the Q&A data has the correct count and structure"""
        # Prepare fallback for missing items
        fallback = self.generate_fallback_qa("Generic", expected_count)
        
        validated = {
            "theoretical": [],
            "practical": [],
            "coding": []
        }
        
        # Process each category
        for category in ['theoretical', 'practical', 'coding']:
            try:
                # Get items from response or empty list if missing
                items = qa_data.get(category, [])
                
                # Normalize each item to ensure it has required fields
                normalized_items = []
                for i, item in enumerate(items[:expected_count]):
                    if category in ['theoretical', 'practical']:
                        normalized = {
                            "question": item.get("question", f"Question {i+1}"),
                            "answer": item.get("answer", "Comprehensive explanation of the concept.")
                        }
                    else:  # coding category
                        normalized = {
                            "question": item.get("question", f"Coding Challenge {i+1}"),
                            "solution": item.get("solution", "# Solution code here"),
                            "explanation": item.get("explanation", "Explanation of the solution approach.")
                        }
                    normalized_items.append(normalized)
                
                # If we don't have enough items, add from fallback
                if len(normalized_items) < expected_count:
                    normalized_items.extend(fallback[category][len(normalized_items):expected_count])
                
                validated[category] = normalized_items[:expected_count]  # Ensure exact count
                
            except Exception as e:
                logger.warning(f"Error processing {category}: {str(e)}")
                validated[category] = fallback[category]
        
        return validated

    def generate_fallback_qa(self, language: str, count: int) -> dict:
        """Generate a fallback Q&A structure if API response fails"""
        # Create more specific fallback content based on the language
        theoretical = []
        practical = []
        coding = []
        
        for i in range(count):
            theoretical.append({
                "question": f"What are the key features of {language} that make it suitable for modern development? (Question {i+1})",
                "answer": f"As a versatile language, {language} offers robust features including strong typing, extensive libraries, and efficient memory management. Its design philosophy emphasizes readability and maintainability while providing powerful abstractions for complex systems."
            })
            
            practical.append({
                "question": f"How would you implement a scalable service in {language} that handles concurrent requests? (Question {i+1})",
                "answer": f"To implement a scalable service in {language}, I would use asynchronous programming patterns with proper error handling. The implementation would utilize connection pooling, implement appropriate caching strategies, and follow best practices for resource management."
            })
            
            coding.append({
                "question": f"Create a function in {language} that efficiently finds the most frequent element in an array. (Challenge {i+1})",
                "solution": f"# Sample {language} solution\ndef find_most_frequent(arr):\n    counter = {{}}\n    for item in arr:\n        counter[item] = counter.get(item, 0) + 1\n    return max(counter.items(), key=lambda x: x[1])[0]",
                "explanation": "This solution uses a hash map to count occurrences of each element in a single pass, achieving O(n) time complexity. The max function with a custom key function efficiently finds the most frequent element."
            })
        
        return {
            "theoretical": theoretical,
            "practical": practical,
            "coding": coding
        }

    def generate_sample_prompts(self, languages: List[str]) -> Dict[str, Dict[str, str]]:
        sample_prompts = {}
        for language in languages:
            try:
                prompt = SAMPLE_PROMPT_TEMPLATE.format(language=language)
                response = self.api.call(prompt)
                
                # Try to parse the response as JSON
                try:
                    sample_prompt_data = json.loads(response)
                    sample_prompts[language] = sample_prompt_data
                except json.JSONDecodeError:
                    # Fallback if JSON parsing fails
                    sample_prompts[language] = {
                        "prompt": f"Generate a {language} dashboard",
                        "description": f"A dashboard showcasing {language}'s capabilities"
                    }
            except Exception as e:
                logger.warning(f"Failed to generate sample prompt for {language}: {str(e)}")
                sample_prompts[language] = {
                    "prompt": f"Generate a {language} dashboard",
                    "description": f"A dashboard showcasing {language}'s capabilities"
                }
        
        return sample_prompts

# New State Management
class DocumentState:
    """
    Shared state to manage document content and detected languages
    across different endpoints
    """
    def __init__(self):
        self.document_content = None
        self.detected_languages = None
        self.temp_file_path = None
        self.questions = {}  # Dictionary to store questions with ID as key
        self.question_sets = {}  # Dictionary to store question sets with ID as key

document_state = DocumentState()

# Pydantic Models
class Question(BaseModel):
    id: str
    question: str
    answer: str
    solution: str = None  # Optional for coding questions
    explanation: str = None  # Optional for coding questions
    category: str  # theoretical, practical, or coding
    language: str
    created_at: str
    updated_at: str

class QuestionSet(BaseModel):
    id: str
    name: str
    description: str
    language: str
    questions: List[str]  # List of question IDs
    created_at: str
    updated_at: str

class QuestionCreateRequest(BaseModel):
    question: str
    answer: str
    solution: str = None
    explanation: str = None
    category: str
    language: str

class QuestionUpdateRequest(BaseModel):
    question: str = None
    answer: str = None
    solution: str = None
    explanation: str = None
    category: str = None
    language: str = None

class QuestionSetCreateRequest(BaseModel):
    name: str
    description: str
    language: str
    questions: List[str]

class QuestionSetUpdateRequest(BaseModel):
    name: str = None
    description: str = None
    language: str = None
    questions: List[str] = None

class QuestionResponse(BaseModel):
    status: str
    question: Question
    message: str

class QuestionsListResponse(BaseModel):
    status: str
    questions: List[Question]
    message: str

class QuestionSetResponse(BaseModel):
    status: str
    question_set: QuestionSet
    message: str

class QuestionSetsListResponse(BaseModel):
    status: str
    question_sets: List[QuestionSet]
    message: str

class FileUploadResponse(BaseModel):
    status: str
    detected_languages: List[str]
    message: str

class SamplePromptResponse(BaseModel):
    status: str
    sample_prompts: Dict[str, Dict[str, str]]
    message: str

class LanguageMetricsResponse(BaseModel):
    status: str
    language_metrics: Dict[str, Any]
    message: str

class QAGenerationResponse(BaseModel):
    status: str
    qa_content: Dict[str, Any]
    message: str

# FastAPI app setup
app = FastAPI(
    title="Programming Language Analysis API",
    description="API for analyzing programming language requirements with separated endpoints",
    version="1.1.0"
)

# Dependency to ensure document is uploaded first
def check_document_uploaded():
    if not document_state.document_content:
        raise HTTPException(
            status_code=400, 
            detail="Please upload a document first using the /upload endpoint"
        )
    return True

# Upload Endpoint
@app.post("/upload", response_model=FileUploadResponse)
async def upload_document(file: UploadFile = File(...)):
    try:
        # Reset previous state
        document_state.document_content = None
        document_state.detected_languages = None
        document_state.temp_file_path = None

        # Validate file type
        if not file.filename.lower().endswith(('.pdf', '.docx')):
            raise HTTPException(
                status_code=400,
                detail="Only PDF and DOCX files are supported"
            )

        analyzer = LanguageAnalyzer(GEMINI_API_KEY)
        
        # Save and process the uploaded file
        temp_file_path = await DocumentProcessor.save_upload_file(file)
        document_content = analyzer.doc_processor.load_document(temp_file_path)
        
        # Store state
        document_state.document_content = document_content
        document_state.temp_file_path = temp_file_path

        # Detect programming languages
        languages = analyzer.extract_languages(document_content)
        document_state.detected_languages = languages

        if not languages:
            return FileUploadResponse(
                status="warning",
                detected_languages=[],
                message="No programming languages detected in the document"
            )
        return FileUploadResponse(
            status="success", 
            detected_languages=languages,
            message="Document uploaded and languages detected successfully"
        )
    except Exception as e:
        logger.error(f"Error uploading document: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Sample Prompts Generation Endpoint
@app.post("/generate-sample-prompts", response_model=SamplePromptResponse)
async def generate_sample_prompts(
    _: bool = Depends(check_document_uploaded)
):
    try:
        analyzer = LanguageAnalyzer(GEMINI_API_KEY)
        
        # Generate sample prompts for detected languages
        sample_prompts = analyzer.generate_sample_prompts(
            document_state.detected_languages
        )
        
        return SamplePromptResponse(
            status="success", 
            sample_prompts=sample_prompts,
            message="Sample prompts generated successfully"
        )
    except Exception as e:
        logger.error(f"Error generating sample prompts: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Language Metrics Endpoint
@app.post("/language-metrics", response_model=LanguageMetricsResponse)
async def get_language_metrics(
    _: bool = Depends(check_document_uploaded)
):
    try:
        analyzer = LanguageAnalyzer(GEMINI_API_KEY)
        
        # Comprehensive analysis for each language
        language_metrics = {}
        for language in document_state.detected_languages:
            # Get metrics
            metrics = analyzer.analyze_language(
                language, 
                document_state.document_content
            )
            language_metrics[language] = metrics
        
        return LanguageMetricsResponse(
            status="success", 
            language_metrics=language_metrics,
            message="Language metrics generated successfully"
        )
    except Exception as e:
        logger.error(f"Error generating language metrics: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Q&A Generation Endpoint
@app.post("/generate-qa", response_model=QAGenerationResponse)
async def generate_qa(
    language: str = None,
    question_count: int = 3,
    _: bool = Depends(check_document_uploaded)
):
    try:
        analyzer = LanguageAnalyzer(GEMINI_API_KEY)
        
        # If no specific language provided, use first detected language
        if not language:
            if not document_state.detected_languages:
                raise HTTPException(
                    status_code=400, 
                    detail="No languages detected. Please specify a language."
                )
            language = document_state.detected_languages[0]
        
        # Modified check: Allow any language even if not detected in document
        # This gives flexibility for users to request Q&A for languages not in the doc
        if language not in document_state.detected_languages:
            logger.warning(f"Language {language} not detected in document but proceeding anyway")
            # Instead of raising an error, we'll continue with a default proficiency
            proficiency = "Intermediate"
        else:
            # For detected languages, get the proficiency from analysis
            metrics = analyzer.analyze_language(
                language, 
                document_state.document_content
            )
            proficiency = metrics.get("proficiency", "Intermediate")
        
        # Generate Q&A content
        qa_content = analyzer.generate_qa(
            language,
            proficiency,
            int(question_count)
        )
        
        return QAGenerationResponse(
            status="success", 
            qa_content=qa_content,
            message=f"Q&A content for {language} generated successfully"
        )
    except Exception as e:
        error_msg = str(e)
        logger.error(f"Error generating Q&A: {error_msg}")
        # Provide more specific error message for debugging
        raise HTTPException(
            status_code=500, 
            detail=f"Error generating Q&A: {error_msg}"
        )

# Questions Management Endpoints
# @app.post("/questions", response_model=QuestionResponse)
# async def create_question(question_data: QuestionCreateRequest):
#     try:
#         # Validate inputs
#         if not question_data.question or not question_data.answer or not question_data.category or not question_data.language:
#             raise HTTPException(status_code=400, detail="Missing required fields")
        
#         if question_data.category not in ["theoretical", "practical", "coding"]:
#             raise HTTPException(status_code=400, detail="Category must be theoretical, practical, or coding")
            
#         # For coding questions, require solution
#         if question_data.category == "coding" and not question_data.solution:
#             raise HTTPException(status_code=400, detail="Coding questions require a solution")
        
#         # Optional: Validate question with AI
#         analyzer = LanguageAnalyzer(GEMINI_API_KEY)
        
#         # Prepare validation prompt
#         solution_text = ""
#         explanation_text = ""
#         if question_data.category == "coding":
#             solution_text = f"Solution: {question_data.solution}"
#             explanation_text = f"Explanation: {question_data.explanation or 'Not provided'}"
            
#         prompt = QUESTION_VALIDATION_TEMPLATE.format(
#             category=question_data.category,
#             language=question_data.language,
#             question=question_data.question,
#             answer=question_data.answer,
#             solution_text=solution_text,
#             explanation_text=explanation_text
#         )
        
#         try:
#             validation_response = analyzer.api.call(prompt)
#             validation_data = json.loads(validation_response)
            
#             # If AI suggests improvements, use them
#             if validation_data.get("is_valid", True):
#                 if validation_data.get("improved_question"):
#                     question_data.question = validation_data["improved_question"]
#                 if validation_data.get("improved_answer"):
#                     question_data.answer = validation_data["improved_answer"]
#                 if question_data.category == "coding" and validation_data.get("improved_solution"):
#                     question_data.solution = validation_data["improved_solution"]
#                 if question_data.category == "coding" and validation_data.get("improved_explanation"):
#                     question_data.explanation = validation_data["improved_explanation"]
#             else:
#                 # If AI says question is invalid, still proceed but log the feedback
#                 logger.warning(f"Question validation feedback: {validation_data.get('feedback', 'No feedback provided')}")
#         except Exception as e:
#             # If validation fails, just log the error and continue with original question
#             logger.warning(f"Question validation failed: {str(e)}")
        
#         # Create question object
#         timestamp = datetime.now().isoformat()
#         question_id = str(uuid.uuid4())
        
#         new_question = {
#             "id": question_id,
#             "question": question_data.question,
#             "answer": question_data.answer,
#             "solution": question_data.solution,
#             "explanation": question_data.explanation,
#             "category": question_data.category,
#             "language": question_data.language,
#             "created_at": timestamp,
#             "updated_at": timestamp
#         }
        
#         # Store in document state
#         document_state.questions[question_id] = new_question
        
#         return QuestionResponse(
#             status="success",
#             question=new_question,
#             message="Question created successfully"
#         )
#     except Exception as e:
#         logger.error(f"Error creating question: {str(e)}")
#         raise HTTPException(status_code=500, detail=str(e))

# @app.get("/questions", response_model=QuestionsListResponse)
# async def list_questions(
#     language: str = Query(None, description="Filter by programming language"),
#     category: str = Query(None, description="Filter by category (theoretical, practical, coding)")
# ):
#     try:
#         # Filter questions based on query parameters
#         filtered_questions = document_state.questions.values()
        
#         if language:
#             filtered_questions = [q for q in filtered_questions if q["language"].lower() == language.lower()]
            
#         if category:
#             if category not in ["theoretical", "practical", "coding"]:
#                 raise HTTPException(status_code=400, detail="Category must be theoretical, practical, or coding")
#             filtered_questions = [q for q in filtered_questions if q["category"] == category]
        
#         return QuestionsListResponse(
#             status="success",
#             questions=list(filtered_questions),
#             message=f"Found {len(filtered_questions)} questions"
#         )
#     except Exception as e:
#         logger.error(f"Error listing questions: {str(e)}")
#         raise HTTPException(status_code=500, detail=str(e))

# @app.get("/questions/{question_id}", response_model=QuestionResponse)
# async def get_question(question_id: str = Path(..., description="The ID of the question to retrieve")):
#     try:
#         if question_id not in document_state.questions:
#             raise HTTPException(status_code=404, detail="Question not found")
            
#         return QuestionResponse(
#             status="success",
#             question=document_state.questions[question_id],
#             message="Question retrieved successfully"
#         )
#     except Exception as e:
#         logger.error(f"Error retrieving question: {str(e)}")
#         raise HTTPException(status_code=500, detail=str(e))

# @app.put("/questions/{question_id}", response_model=QuestionResponse)
# async def update_question(
#     question_id: str = Path(..., description="The ID of the question to update"),
#     question_data: QuestionUpdateRequest = Body(...)
# ):
#     try:
#         if question_id not in document_state.questions:
#             raise HTTPException(status_code=404, detail="Question not found")
            
#         # Get existing question
#         existing_question = document_state.questions[question_id]
        
#         # Update fields if provided
#         if question_data.question is not None:
#             existing_question["question"] = question_data.question
#         if question_data.answer is not None:
#             existing_question["answer"] = question_data.answer
#         if question_data.solution is not None:
#             existing_question["solution"] = question_data.solution
#         if question_data.explanation is not None:
#             existing_question["explanation"] = question_data.explanation
#         if question_data.category is not None:
#             if question_data.category not in ["theoretical", "practical", "coding"]:
#                 raise HTTPException(status_code=400, detail="Category must be theoretical, practical, or coding")
#             existing_question["category"] = question_data.category
#         if question_data.language is not None:
#             existing_question["language"] = question_data.language
            
#         # Update timestamp
#         existing_question["updated_at"] = datetime.now().isoformat()
        
#         # Store updated question
#         document_state.questions[question_id] = existing_question
        
#         return QuestionResponse(
#             status="success",
#             question=existing_question,
#             message="Question updated successfully"
#         )
#     except Exception as e:
#         logger.error(f"Error updating question: {str(e)}")
#         raise HTTPException(status_code=500, detail=str(e))

# @app.delete("/questions/{question_id}")
# async def delete_question(question_id: str = Path(..., description="The ID of the question to delete")):
#     try:
#         if question_id not in document_state.questions:
#             raise HTTPException(status_code=404, detail="Question not found")
            
#         # Check if question is used in any question sets
#         for question_set in document_state.question_sets.values():
#             if question_id in question_set["questions"]:
#                 # Remove the question from the set
#                 question_set["questions"].remove(question_id)
#                 question_set["updated_at"] = datetime.now().isoformat()
        
#         # Delete the question
#         deleted_question = document_state.questions.pop(question_id)
        
#         return {
#             "status": "success",
#             "message": f"Question '{deleted_question['question'][:30]}...' deleted successfully"
#         }
#     except Exception as e:
#         logger.error(f"Error deleting question: {str(e)}")
#         raise HTTPException(status_code=500, detail=str(e))

# # Question Set Management Endpoints
# @app.post("/question-sets", response_model=QuestionSetResponse)
# async def create_question_set(question_set_data: QuestionSetCreateRequest):
#     try:
#         # Validate inputs
#         if not question_set_data.name or not question_set_data.language:
#             raise HTTPException(status_code=400, detail="Missing required fields")
            
#         # Validate that all question IDs exist
#         if question_set_data.questions:
#             for question_id in question_set_data.questions:
#                 if question_id not in document_state.questions:
#                     raise HTTPException(status_code=400, detail=f"Question with ID {question_id} not found")
        
#         # Create question set
#         timestamp = datetime.now().isoformat()
#         question_set_id = str(uuid.uuid4())
        
#         new_question_set = {
#             "id": question_set_id,
#             "name": question_set_data.name,
#             "description": question_set_data.description or "",
#             "language": question_set_data.language,
#             "questions": question_set_data.questions or [],
#             "created_at": timestamp,
#             "updated_at": timestamp
#         }
        
#         # Store in document state
#         document_state.question_sets[question_set_id] = new_question_set
        
#         return QuestionSetResponse(
#             status="success",
#             question_set=new_question_set,
#             message="Question set created successfully"
#         )
#     except Exception as e:
#         logger.error(f"Error creating question set: {str(e)}")
#         raise HTTPException(status_code=500, detail=str(e))

# @app.get("/question-sets", response_model=QuestionSetsListResponse)
# async def list_question_sets(
#     language: str = Query(None, description="Filter by programming language")
# ):
#     try:
#         # Filter question sets based on query parameters
#         filtered_sets = document_state.question_sets.values()
        
#         if language:
#             filtered_sets = [qs for qs in filtered_sets if qs["language"].lower() == language.lower()]
        
#         return QuestionSetsListResponse(
#             status="success",
#             question_sets=list(filtered_sets),
#             message=f"Found {len(filtered_sets)} question sets"
#         )
#     except Exception as e:
#         logger.error(f"Error listing question sets: {str(e)}")
#         raise HTTPException(status_code=500, detail=str(e))

# @app.get("/question-sets/{question_set_id}", response_model=QuestionSetResponse)
# async def get_question_set(question_set_id: str = Path(..., description="The ID of the question set to retrieve")):
#     try:
#         if question_set_id not in document_state.question_sets:
#             raise HTTPException(status_code=404, detail="Question set not found")
            
#         return QuestionSetResponse(
#             status="success",
#             question_set=document_state.question_sets[question_set_id],
#             message="Question set retrieved successfully"
#         )
#     except Exception as e:
#         logger.error(f"Error retrieving question set: {str(e)}")
#         raise HTTPException(status_code=500, detail=str(e))

# @app.put("/question-sets/{question_set_id}", response_model=QuestionSetResponse)
# async def update_question_set(
#     question_set_id: str = Path(..., description="The ID of the question set to update"),
#     question_set_data: QuestionSetUpdateRequest = Body(...)
# ):
#     try:
#         if question_set_id not in document_state.question_sets:
#             raise HTTPException(status_code=404, detail="Question set not found")
            
#         # Get existing question set
#         existing_set = document_state.question_sets[question_set_id]
        
#         # Update fields if provided
#         if question_set_data.name is not None:
#             existing_set["name"] = question_set_data.name
#         if question_set_data.description is not None:
#             existing_set["description"] = question_set_data.description
#         if question_set_data.language is not None:
#             existing_set["language"] = question_set_data.language
#         if question_set_data.questions is not None:
#             # Validate that all question IDs exist
#             for question_id in question_set_data.questions:
#                 if question_id not in document_state.questions:
#                     raise HTTPException(status_code=400, detail=f"Question with ID {question_id} not found")
#             existing_set["questions"] = question_set_data.questions
            
#         # Update timestamp
#         existing_set["updated_at"] = datetime.now().isoformat()
        
#         # Store updated question set
#         document_state.question_sets[question_set_id] = existing_set
        
#         return QuestionSetResponse(
#             status="success",
#             question_set=existing_set,
#             message="Question set updated successfully"
#         )
#     except Exception as e:
#         logger.error(f"Error updating question set: {str(e)}")
#         raise HTTPException(status_code=500, detail=str(e))

# @app.delete("/question-sets/{question_set_id}")
# async def delete_question_set(question_set_id: str = Path(..., description="The ID of the question set to delete")):
#     try:
#         if question_set_id not in document_state.question_sets:
#             raise HTTPException(status_code=404, detail="Question set not found")
            
#         # Delete the question set
#         deleted_set = document_state.question_sets.pop(question_set_id)
        
#         return {
#             "status": "success",
#             "message": f"Question set '{deleted_set['name']}' deleted successfully"
#         }
#     except Exception as e:
#         logger.error(f"Error deleting question set: {str(e)}")
#         raise HTTPException(status_code=500, detail=str(e))


# # Utility endpoint to convert Q&A content to questions
# @app.post("/convert-qa-to-questions")
# async def convert_qa_to_questions(
#     language: str,
#     qa_content: dict = Body(..., description="The Q&A content generated by the /generate-qa endpoint")
# ):
#     try:
#         created_questions = []
#         timestamp = datetime.now().isoformat()
        
#         # Process theoretical questions
#         for item in qa_content.get("theoretical", []):
#             question_id = str(uuid.uuid4())
#             new_question = {
#                 "id": question_id,
#                 "question": item.get("question", ""),
#                 "answer": item.get("answer", ""),
#                 "solution": None,
#                 "explanation": None,
#                 "category": "theoretical",
#                 "language": language,
#                 "created_at": timestamp,
#                 "updated_at": timestamp
#             }
#             document_state.questions[question_id] = new_question
#             created_questions.append(question_id)
            
#         # Process practical questions
#         for item in qa_content.get("practical", []):
#             question_id = str(uuid.uuid4())
#             new_question = {
#                 "id": question_id,
#                 "question": item.get("question", ""),
#                 "answer": item.get("answer", ""),
#                 "solution": None,
#                 "explanation": None,
#                 "category": "practical",
#                 "language": language,
#                 "created_at": timestamp,
#                 "updated_at": timestamp
#             }
#             document_state.questions[question_id] = new_question
#             created_questions.append(question_id)
            
#         # Process coding questions
#         for item in qa_content.get("coding", []):
#             question_id = str(uuid.uuid4())
#             new_question = {
#                 "id": question_id,
#                 "question": item.get("question", ""),
#                 "answer": "",  # Coding questions use solution instead of answer
#                 "solution": item.get("solution", ""),
#                 "explanation": item.get("explanation", ""),
#                 "category": "coding",
#                 "language": language,
#                 "created_at": timestamp,
#                 "updated_at": timestamp
#             }
#             document_state.questions[question_id] = new_question
#             created_questions.append(question_id)
            
#         return {
#             "status": "success",
#             "message": f"Created {len(created_questions)} questions from Q&A content",
#             "question_ids": created_questions
#         }
#     except Exception as e:
#         logger.error(f"Error converting Q&A to questions: {str(e)}")
#         raise HTTPException(status_code=500, detail=str(e))

# # Endpoint to import generated Q&A into a question set
# @app.post("/import-qa-to-set")
# async def import_qa_to_set(
#     language: str,
#     set_name: str,
#     set_description: str = "",
#     qa_content: dict = Body(..., description="The Q&A content generated by the /generate-qa endpoint")
# ):
#     try:
#         # First convert Q&A to questions
#         convert_response = await convert_qa_to_questions(language, qa_content)
#         question_ids = convert_response.get("question_ids", [])
        
#         # Then create a question set with these questions
#         timestamp = datetime.now().isoformat()
#         question_set_id = str(uuid.uuid4())
        
#         new_question_set = {
#             "id": question_set_id,
#             "name": set_name,
#             "description": set_description,
#             "language": language,
#             "questions": question_ids,
#             "created_at": timestamp,
#             "updated_at": timestamp
#         }
        
#         # Store in document state
#         document_state.question_sets[question_set_id] = new_question_set
        
#         return {
#             "status": "success",
#             "message": f"Created question set '{set_name}' with {len(question_ids)} questions",
#             "question_set_id": question_set_id
#         }
#     except Exception as e:
#         logger.error(f"Error importing Q&A to question set: {str(e)}")
#         raise HTTPException(status_code=500, detail=str(e))
# Optional: Health Check Endpoint
# @app.get("/health")
# async def health_check():
#     return {
#         "status": "healthy",
#         "version": "1.1.0",
#         "description": "Programming Language Analysis API is running"
#     }

# # Cleanup Endpoint (Optional: to manually reset document state)
# @app.post("/reset")
# async def reset_document_state():
#     global document_state
#     document_state = DocumentState()
#     return {"status": "success", "message": "Document state reset"}

# # Main execution
# if __name__ == "__main__":
#     uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)
