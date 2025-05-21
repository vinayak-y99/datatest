import requests
import json
import sys

def test_recommendations_endpoint():
    """Test the recommendations endpoint with sample data"""
    # Sample data from the user's request
    sample_data = {
        "threshold_id": 140,
        "threshold_result": {
            "roles": ["Data scientist"],
            "content": "Dashboard #1 - Required Skills:\n- Advanced Statistical Modeling & Machine Learning: Importance: 20.0% Rating: 10.0/10\n- Data Wrangling & Feature Engineering: Importance: 15.0% Rating: 7.5/10\n- Data Visualization & Communication: Importance: 15.0% Rating: 7.5/10",
            "skills_data": {
                "Data scientist": {
                    "required_skills": {
                        "Advanced Statistical Modeling & Machine Learning": {
                            "importance": 20,
                            "rating": 10
                        }
                    }
                }
            }
        },
        "title": "Data scientist"
    }

    try:
        # Test the POST endpoint that uses the provided data
        response = requests.post("http://127.0.0.1:8000/api/recommended-prompts", json=sample_data, timeout=5)
        response.raise_for_status()
        
        print("POST endpoint successful!")
        recommendations = response.json()
        print(f"Received {len(recommendations)} recommendations")
        
        # Print first recommendation as example
        if recommendations:
            print(f"Example: {recommendations[0]['title']} - {recommendations[0]['description']}")
            
        # Test the GET endpoint
        response = requests.get(f"http://127.0.0.1:8000/api/recommended-prompts/{sample_data['threshold_id']}", timeout=5)
        response.raise_for_status()
        
        print("\nGET endpoint successful!")
        recommendations = response.json()
        print(f"Received {len(recommendations)} recommendations")
        
        return True
    except requests.exceptions.RequestException as e:
        print(f"Error: {str(e)}")
        return False

if __name__ == "__main__":
    success = test_recommendations_endpoint()
    sys.exit(0 if success else 1) 