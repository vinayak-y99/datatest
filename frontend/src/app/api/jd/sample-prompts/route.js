import { NextResponse } from 'next/server';

// API base URL
const API_BASE_URL = 'http://127.0.0.1:8000';

// Handler for POST requests to /api/jd/sample-prompts
export async function POST(request) {
  try {
    const requestData = await request.json();
    const { threshold_id } = requestData;
    
    if (!threshold_id) {
      return NextResponse.json(
        { error: 'Missing threshold ID' },
        { status: 400 }
      );
    }
    
    // We'll first try our custom recommended-prompts endpoint
    try {
      console.log(`Attempting GET request to /api/recommended-prompts/${threshold_id}`);
      const response = await fetch(`${API_BASE_URL}/api/recommended-prompts/${threshold_id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(8000),
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`GET success, received ${data.length} prompts for threshold ID ${threshold_id}`);
        
        // Format prompts for response
        if (Array.isArray(data) && data.length > 0) {
          const formattedPrompts = data.map((prompt, index) => 
            `${index + 1}. **${prompt.title}**: "${prompt.prompt_text}"`
          ).join('\n\n');
          
          return NextResponse.json({ 
            sample_prompts: formattedPrompts,
            status: 'success',
            source: 'recommended-prompts',
            threshold_id: threshold_id
          });
        }
      } else {
        console.log(`GET failed with status ${response.status}`);
      }
    } catch (error) {
      console.error('Error fetching from recommended-prompts endpoint:', error);
      // We'll fall back to the next approach
    }
    
    // Next, try to get the threshold details and generate prompts based on them
    try {
      // Get threshold details
      console.log(`Attempting to get threshold details for ID ${threshold_id}`);
      const detailsResponse = await fetch(`${API_BASE_URL}/api/threshold-details/${threshold_id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(8000),
      });
      
      if (detailsResponse.ok) {
        const thresholdDetails = await detailsResponse.json();
        console.log(`Got threshold details, now generating custom prompts via POST`);
        
        // Now use those details to generate custom prompts via our POST endpoint
        const promptResponse = await fetch(`${API_BASE_URL}/api/recommended-prompts`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            threshold_id: threshold_id,
            threshold_result: thresholdDetails.threshold_result || thresholdDetails,
            title: thresholdDetails.title || ''
          }),
          signal: AbortSignal.timeout(8000),
        });
        
        if (promptResponse.ok) {
          const promptData = await promptResponse.json();
          console.log(`POST success, received ${promptData.length} prompts`);
          
          // Format prompts for response
          if (Array.isArray(promptData) && promptData.length > 0) {
            const formattedPrompts = promptData.map((prompt, index) => 
              `${index + 1}. **${prompt.title}**: "${prompt.prompt_text}"`
            ).join('\n\n');
            
            return NextResponse.json({ 
              sample_prompts: formattedPrompts,
              status: 'success',
              source: 'post-with-details',
              threshold_id: threshold_id
            });
          }
        } else {
          console.log(`POST failed with status ${promptResponse.status}`);
        }
      } else {
        console.log(`Failed to get threshold details, status ${detailsResponse.status}`);
      }
    } catch (error) {
      console.error('Error with fallback approach:', error);
    }
    
    // If all else fails, generate default prompts based on the threshold ID
    console.log(`Using fallback generator for threshold ID ${threshold_id}`);
    const fallbackPrompts = generateFallbackPrompts(threshold_id);
    
    return NextResponse.json({
      sample_prompts: fallbackPrompts,
      status: 'fallback',
      threshold_id: threshold_id
    });
    
  } catch (error) {
    console.error('Error in sample-prompts route:', error);
    return NextResponse.json(
      { error: `Server error: ${error.message}`, sample_prompts: "Error loading sample prompts." },
      { status: 500 }
    );
  }
}

// Function to generate fallback prompts if API calls fail
function generateFallbackPrompts(thresholdId) {
  // Use the threshold ID to create variation
  const promptSeed = thresholdId % 10;
  
  // Lists of skills and categories to reference
  const techSkills = ["Python", "JavaScript", "Cloud Computing", "Machine Learning", 
                      "Data Analysis", "DevOps", "Containerization", "React"];
  
  const softSkills = ["Communication", "Leadership", "Teamwork", "Problem Solving", 
                    "Critical Thinking", "Adaptability", "Time Management"];
  
  const dashboardTypes = ["Technical Skills", "Soft Skills", "Required Experience", 
                        "Certifications", "Domain Knowledge", "Tools Expertise"];
  
  // Select elements based on threshold ID to create variation
  const primaryTech = techSkills[promptSeed % techSkills.length];
  const secondaryTech = techSkills[(promptSeed + 3) % techSkills.length];
  const primarySoft = softSkills[promptSeed % softSkills.length];
  
  const primaryDashboard = dashboardTypes[promptSeed % dashboardTypes.length];
  const secondaryDashboard = dashboardTypes[(promptSeed + 2) % dashboardTypes.length];
  
  // Create different prompt sets based on remainder of threshold ID division
  const promptSetIndex = promptSeed % 3;
  
  const promptSets = [
    // Prompt Set 1 - Technical focus
    `1. **Update ${primaryTech} Requirements**: "Update the ${primaryDashboard} dashboard to emphasize modern ${primaryTech} skills, including advanced frameworks and integration with ${secondaryTech}."

2. **Add ${secondaryTech} Expertise**: "Add ${secondaryTech} skills to the ${primaryDashboard} dashboard with 25% importance value, ensuring they reflect current industry standards."

3. **Simplify Technical Requirements**: "Simplify the ${primaryDashboard} dashboard by focusing on the 5 most critical skills, increasing their importance values and removing less essential requirements."

4. **Create Experience Levels**: "Create three variants of the current ${primaryDashboard} dashboard calibrated for Junior, Mid-level, and Senior positions, adjusting importance values of ${primaryTech} appropriately for each level."

5. **Enhance Security Requirements**: "Add security-related requirements to the ${primaryDashboard} dashboard with at least 20% total importance, reflecting the critical nature of secure ${primaryTech} development."`,

    // Prompt Set 2 - Soft skills focus
    `1. **Balance Technical and ${primarySoft} Skills**: "Rebalance the ${primaryDashboard} and ${secondaryDashboard} dashboards to ensure equal emphasis on technical capabilities and ${primarySoft} skills, adjusting to 50-50 distribution."

2. **Remote Collaboration Emphasis**: "Adjust ${primaryDashboard} dashboard to emphasize skills needed for remote work environments, increasing importance of digital collaboration and self-management capabilities."

3. **Leadership Track Requirements**: "Create a leadership path dashboard showing progression from individual contributor to team lead, emphasizing growing importance of ${primarySoft} and mentorship."

4. **Cross-functional Collaboration**: "Add requirements for cross-functional collaboration to the ${secondaryDashboard} dashboard, emphasizing ability to work across departments and disciplines."

5. **Communication Skills Enhancement**: "Increase the importance of written and verbal communication skills in the ${secondaryDashboard} dashboard to 30%, reflecting their critical role in modern workplaces."`,

    // Prompt Set 3 - Business/domain focus
    `1. **Domain Expertise Requirements**: "Create a specialized dashboard for industry-specific knowledge, with appropriate importance values for regulatory compliance and domain practices."

2. **Business Impact Focus**: "Modify ${primaryDashboard} requirements to emphasize business impact metrics and outcome orientation rather than just technical proficiency."

3. **Streamline Overlapping Requirements**: "Identify and merge overlapping skills between ${primaryDashboard} and ${secondaryDashboard} dashboards to create a more streamlined set of requirements, combining similar items."

4. **International Market Readiness**: "Add requirements for international markets readiness to the ${secondaryDashboard}, including cultural awareness and compliance with global standards."

5. **Strategic Planning Capabilities**: "Create a dashboard section focused on strategic planning capabilities needed for senior roles, with emphasis on forecasting and trend analysis."`
  ];
  
  return promptSets[promptSetIndex];
} 