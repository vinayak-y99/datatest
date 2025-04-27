import requests
import json

url = "http://localhost:8000/generate-job-description"
payload = {
    "position_title": "Software Engineer", 
    "required_experience": "3-5 years"
}

try:
    response = requests.post(url, json=payload)
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        print("Success! Job Description:")
        print(response.text)
    else:
        print(f"Error: {response.text}")
except Exception as e:
    print(f"Exception occurred: {str(e)}") 