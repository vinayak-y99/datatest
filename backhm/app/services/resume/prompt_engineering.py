# Resume

Resume_KEY_INFORMATION = """
- NAME of the person in the resume
- EXPERIENCE details including job titles, companies, and years
- LOCATION information such as city and country
- MAIL ID or email address and phone number for contact Information
"""

# Prompt template for generating Q&A pairs from dashboard content
Resume_GENERATE_QA_PROMPT = """Based on this dashboard content, generate {num_qa} relevant questions and answers.
Format each Q&A pair exactly as follows:
Q1: [Question text]
A1: [Answer text]
...
Dashboard content:
{dashboard_content}"""


# Prompt template for generating similar Q&A pairs
Resume_GENERATE_SIMILAR_QA_PROMPT = """  
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
Resume_EVALUATE_QA_PROMPT = """Evaluate how well the following answer addresses the question. Consider:
1. Relevance to the question (aim for 90% relevance)
2. Completeness of the answer (aim for 100% completeness)
3. Accuracy of information (aim for 95% accuracy)
Question: {question}
Answer: {answer}
Provide a score from 0 to 100 and a brief explanation.
Return only two lines:
SCORE: [number]
EXPLANATION: [brief explanation]"""

# Prompt template for asking questions
Resume_QUESTION_STARTERS = [
    "what",
    "why",
    "how",
    "when",
    "where",
    "who",
    "which",
    "can",
    "could",
    "would",
    "will",
    "do",
    "does",
    "tell me about",
]
