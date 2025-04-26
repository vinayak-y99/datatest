// Test script to verify that different threshold IDs generate different sample prompts
const fetch = require('node-fetch');

const BACKEND_API_URL = 'http://127.0.0.1:8000';
const FRONTEND_API_URL = 'http://localhost:3000';

async function testPromptEndpoints() {
  const thresholdIds = [123, 140, 156, 78, 199, 200];
  
  console.log('Testing prompt generation for different threshold IDs...\n');
  
  for (const id of thresholdIds) {
    console.log(`\n======= Testing threshold ID: ${id} =======`);
    
    try {
      // 1. Test the backend GET endpoint directly
      console.log("\n>> Testing backend GET endpoint:");
      const getResponse = await fetch(`${BACKEND_API_URL}/api/recommended-prompts/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (getResponse.ok) {
        const getData = await getResponse.json();
        if (Array.isArray(getData) && getData.length > 0) {
          console.log(`✓ GET endpoint successful for ID ${id}`);
          console.log(`First prompt title: "${getData[0].title}"`);
          console.log(`First prompt text (first 70 chars): "${getData[0].prompt_text.substring(0, 70)}..."`);
        } else {
          console.log(`✗ GET endpoint returned empty or invalid data for ID ${id}`);
        }
      } else {
        console.log(`✗ GET endpoint failed for ID ${id}: ${getResponse.status}`);
      }
      
      // 2. Test the frontend sample-prompts API for real application behavior
      console.log("\n>> Testing frontend sample-prompts endpoint:");
      try {
        const frontendResponse = await fetch(`${FRONTEND_API_URL}/api/jd/sample-prompts`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            threshold_id: id
          }),
        });
        
        if (frontendResponse.ok) {
          const frontendData = await frontendResponse.json();
          if (frontendData.sample_prompts) {
            console.log(`✓ Frontend endpoint successful for ID ${id}`);
            console.log(`Source: ${frontendData.source || 'not specified'}`);
            
            // Extract and print the first prompt title
            const promptMatch = frontendData.sample_prompts.match(/1\.\s*\*\*([^*]+)\*\*:/);
            if (promptMatch && promptMatch[1]) {
              console.log(`First prompt title: "${promptMatch[1].trim()}"`);
              
              // Get the content of the first prompt (the text in quotes)
              const contentMatch = frontendData.sample_prompts.match(/"([^"]+)"/);
              if (contentMatch && contentMatch[1]) {
                console.log(`First prompt text (first 70 chars): "${contentMatch[1].substring(0, 70)}..."`);
              }
            } else {
              console.log(`Raw sample prompts: "${frontendData.sample_prompts.substring(0, 100)}..."`);
            }
          } else {
            console.log(`✗ Frontend endpoint returned no prompts for ID ${id}`);
          }
        } else {
          console.log(`✗ Frontend endpoint failed for ID ${id}: ${frontendResponse.status}`);
        }
      } catch (frontendError) {
        console.error(`Error with frontend endpoint for ID ${id}:`, frontendError.message);
      }
      
    } catch (error) {
      console.error(`Error testing threshold ID ${id}:`, error.message);
    }
    
    console.log("\n-----------------------------------------------");
  }
}

// Run the test
testPromptEndpoints()
  .then(() => console.log('\nTest completed. Check results above to ensure different prompts are generated for each ID.'))
  .catch(err => console.error('Test failed:', err)); 