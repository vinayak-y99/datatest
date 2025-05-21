// Simple test script for the sample-prompts API
// Run with Node.js directly

import fetch from 'node-fetch';
const API_URL = 'http://localhost:3000';

async function testDifferentThresholds() {
  const thresholdIds = [123, 140, 156, 78, 199, 200];
  
  console.log('Testing sample prompts with different threshold IDs\n');
  
  for (const id of thresholdIds) {
    console.log(`\n==== Testing threshold ID: ${id} ====`);
    
    try {
      const response = await fetch(`${API_URL}/api/jd/sample-prompts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          threshold_id: id
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.sample_prompts) {
          console.log(`✓ Success - Status: ${response.status}`);
          console.log(`Source: ${data.source || 'fallback'}`);
          
          // Extract first prompt title
          const promptMatch = data.sample_prompts.match(/1\.\s*\*\*([^*]+)\*\*:/);
          if (promptMatch && promptMatch[1]) {
            console.log(`First prompt title: "${promptMatch[1].trim()}"`);
          }
          
          // Print first 100 characters of prompts
          console.log(`Start of prompts: "${data.sample_prompts.substring(0, 100)}..."`);
        } else {
          console.log(`✗ No sample prompts returned - Status: ${response.status}`);
        }
      } else {
        console.log(`✗ Failed with status: ${response.status}`);
        const errorText = await response.text();
        console.log(`Error: ${errorText}`);
      }
    } catch (error) {
      console.error(`Error testing threshold ID ${id}:`, error.message);
    }
    
    console.log("-".repeat(50));
  }
}

// Run the test
testDifferentThresholds()
  .then(() => console.log('\nTest completed'))
  .catch(err => console.error('Test failed:', err)); 