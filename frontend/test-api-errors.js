// Test script to verify error handling in API routes
import fetch from 'node-fetch';

const FRONTEND_URL = 'http://localhost:3000';

async function testUpdateDashboardAPI() {
  console.log('Testing update-dashboard-data API error handling...\n');
  
  try {
    // Case 1: Missing required fields
    console.log('\n>> Case 1: Missing required fields');
    const missingFieldsResponse = await fetch(`${FRONTEND_URL}/api/update-dashboard-data`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // Missing threshold_id and job_id
        skills_data: {}
      }),
    });
    
    if (missingFieldsResponse.status === 400) {
      console.log('✓ Correctly returned 400 status for missing fields');
      const errorData = await missingFieldsResponse.json();
      console.log(`  Error message: ${errorData.error}`);
    } else {
      console.log(`✗ Unexpected status: ${missingFieldsResponse.status}`);
      const errorText = await missingFieldsResponse.text();
      console.log(`  Response: ${errorText.substring(0, 200)}`);
    }
    
    // Case 2: Valid request structure but non-existent threshold_id
    console.log('\n>> Case 2: Valid request with non-existent threshold_id');
    const validRequest = {
      threshold_id: 999999, // Very large number unlikely to exist
      job_id: 1,
      skills_data: {
        "Software Engineer": {
          "Technical Skills": {
            "JavaScript": {
              "importance": 80,
              "rating": 7.5
            }
          }
        }
      },
      prompt: "Update JavaScript rating to 7.5"
    };
    
    const nonExistentResponse = await fetch(`${FRONTEND_URL}/api/update-dashboard-data`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validRequest),
    });
    
    console.log(`Status: ${nonExistentResponse.status}`);
    
    try {
      const responseData = await nonExistentResponse.json();
      console.log('Response data:', responseData);
    } catch (parseError) {
      console.log('Could not parse response as JSON');
      const responseText = await nonExistentResponse.text();
      console.log(`Response text: ${responseText.substring(0, 200)}...`);
    }
    
    // Case 3: Test process-prompt endpoint
    console.log('\n>> Case 3: Testing process-prompt endpoint');
    
    const processResponse = await fetch(`${FRONTEND_URL}/api/process-prompt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: "Test prompt for error handling",
        threshold_id: 123
      }),
    });
    
    console.log(`Status: ${processResponse.status}`);
    
    try {
      const processData = await processResponse.json();
      console.log('Process response data:', processData);
    } catch (parseError) {
      console.log('Could not parse process response as JSON');
      const responseText = await processResponse.text();
      console.log(`Response text: ${responseText.substring(0, 200)}...`);
    }
    
  } catch (error) {
    console.error('Error running tests:', error);
  }
}

// Run the test
testUpdateDashboardAPI()
  .then(() => console.log('\nTests completed. Check results above.'))
  .catch(err => console.error('Test failed:', err)); 