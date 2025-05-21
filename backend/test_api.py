import requests
import json

url = "http://localhost:8000/generate-job-description"
payload = {
    "position_title": "Software Engineer", 
    "required_experience": "3-5 years"
}

try:
    print(f"Sending request to {url} with payload: {json.dumps(payload, indent=2)}")
    response = requests.post(url, json=payload)
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        print("Success! Job Description:")
        print(response.json())
    else:
        print(f"Error response: {response.text}")
        try:
            error_data = response.json()
            print(f"Error detail: {json.dumps(error_data, indent=2)}")
        except:
            print("Could not parse error response as JSON")
            
except Exception as e:
    print(f"Exception occurred: {str(e)}") 