"use client";
import { useState, useEffect, useCallback } from "react";
import RoleSelector from "./RoleSelector";
import React from 'react';

const Sidebar = ({
    roles,
    skills_data,
    sendRangeValue,
    onCreate,
    sendSelectedRoles,
    onRoleSelect,
    onDashboardUpdate,
    jobId
}) => {
    const [selectedRoles, setSelectedRoles] = useState([]);
    const [dashboardCount, setDashboardCount] = useState(5); // Default to 5 on scale
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [availableDashboards, setAvailableDashboards] = useState([]);
    const [selectedDashboards, setSelectedDashboards] = useState([]);
    const [samplePrompts, setSamplePrompts] = useState([]);
    const [loadingSamplePrompts, setLoadingSamplePrompts] = useState(false);
    const [thresholdId, setThresholdId] = useState(null); // Add state for threshold ID

    // Helper function to generate dashboard content string from skills_data
    const generateDashboardContent = useCallback((skillsData, selectedRoles) => {
        if (!skillsData || !selectedRoles || selectedRoles.length === 0) return "";
        
        const role = selectedRoles[0];
        const roleData = skillsData[role];
        if (!roleData) return "";
        
        let content = "";
        let dashboardNumber = 1;
        
        for (const category in roleData) {
            content += `Dashboard #${dashboardNumber} - ${category}:\n`;
            
            const items = roleData[category];
            for (const itemName in items) {
                const item = items[itemName];
                content += `- ${itemName}: Importance: ${item.importance}% Rating: ${item.rating}/10\n`;
            }
            
            content += "\n";
            dashboardNumber++;
        }
        
        return content;
    }, []);

    // Function to get threshold ID from job ID
    const getThresholdId = useCallback(async (jid) => {
        if (!jid) return null;
        
        try {
            const response = await fetch(`/api/threshold-ids?job_id=${jid}`);
            if (!response.ok) {
                console.warn(`Failed to fetch threshold ID for job ID ${jid}: ${response.status}`);
                return null;
            }
            
            const data = await response.json();
            if (data && data.threshold_id) {
                console.log(`Found threshold ID ${data.threshold_id} for job ID ${jid}`);
                return data.threshold_id;
            } else if (data && Array.isArray(data) && data.length > 0 && data[0].threshold_id) {
                console.log(`Found threshold ID ${data[0].threshold_id} for job ID ${jid}`);
                return data[0].threshold_id;
            }
            
            // If no threshold ID is found, fallback to using job ID
            console.warn(`No threshold ID found for job ID ${jid}, using job ID as fallback`);
            return parseInt(jid);
        } catch (error) {
            console.error(`Error fetching threshold ID: ${error}`);
            return parseInt(jid); // Fallback to job ID
        }
    }, []);

    // Function to fetch sample prompts
    const fetchSamplePrompts = useCallback(async () => {
        if (!jobId) return;
        
        try {
            setLoadingSamplePrompts(true);
            
            // Try to get the actual threshold ID first
            const tid = thresholdId || await getThresholdId(jobId);
            if (tid) {
                setThresholdId(tid);
            }
            
            // Use threshold_id for API calls
            const threshold_id = tid || parseInt(jobId);
            console.log("Fetching sample prompts for threshold ID:", threshold_id);
            
            // First try the newer POST endpoint with threshold data
            try {
                // Get the current threshold data to pass to the API
                const thresholdData = {
                    threshold_id: threshold_id, // Use threshold_id instead of jobId
                    threshold_result: skills_data && Object.keys(skills_data).length > 0 ? {
                        roles: roles,
                        content: generateDashboardContent(skills_data, roles),
                        skills_data: skills_data
                    } : null,
                    title: roles && roles.length > 0 ? roles[0] : ""
                };
                
                // Create AbortController for timeout
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000);
                
                const response = await fetch('/api/recommended-prompts', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(thresholdData),
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);
                
                if (!response.ok) {
                    throw new Error(`Failed to fetch sample prompts: ${response.status}`);
                }
                
                const data = await response.json();
                
                // Handle the new format - array of PromptRecommendation objects
                if (Array.isArray(data) && data.length > 0) {
                    // Format prompts for display in a more concise way
                    const formattedPrompts = data.map((prompt, index) => 
                        `${index + 1}. **${prompt.title}**: "${prompt.prompt_text}"`
                    ).join('\n\n');
                    
                    setSamplePrompts(formattedPrompts);
                    return;
                }
            } catch (postError) {
                console.warn("Error using POST endpoint:", postError);
                // Fall back to the GET endpoint
            }
            
            // Fall back to the GET endpoint if POST fails
            try {
                // Create AbortController for timeout
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 8000);
                
                const getResponse = await fetch(`/api/recommended-prompts/${threshold_id}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);
                
                if (!getResponse.ok) {
                    throw new Error(`Failed to fetch sample prompts with GET: ${getResponse.status}`);
                }
                
                const getData = await getResponse.json();
                
                // Handle the new format - array of PromptRecommendation objects
                if (Array.isArray(getData) && getData.length > 0) {
                    // Format prompts for display in a more concise way
                    const formattedPrompts = getData.map((prompt, index) => 
                        `${index + 1}. **${prompt.title}**: "${prompt.prompt_text}"`
                    ).join('\n\n');
                    
                    setSamplePrompts(formattedPrompts);
                } else {
                    setSamplePrompts("No sample prompts available.");
                }
            } catch (getError) {
                console.error("Error fetching sample prompts with GET:", getError);
                setSamplePrompts("Error loading sample prompts. Please try again.");
            }
            
        } catch (error) {
            console.error("Error fetching sample prompts:", error);
            setSamplePrompts("Error loading sample prompts. Please try again.");
        } finally {
            setLoadingSamplePrompts(false);
        }
    }, [jobId, roles, skills_data, generateDashboardContent, setSamplePrompts, setLoadingSamplePrompts, thresholdId, getThresholdId]);

    // Function to extract prompt text from the sample prompt
    const extractPromptText = useCallback((fullPromptText) => {
        // Look for text within quotes
        const quoteMatch = fullPromptText.match(/"([^"]+)"/);
        if (quoteMatch && quoteMatch[1]) {
            return quoteMatch[1];
        }
        
        // Fall back to the text after the colon if no quotes are found
        const colonMatch = fullPromptText.match(/:\s*(.+)/);
        if (colonMatch && colonMatch[1]) {
            return colonMatch[1].trim();
        }
        
        return fullPromptText;
    }, []);

    // Function to handle click on a sample prompt
    const handleSamplePromptClick = useCallback((promptText) => {
        const extractedPrompt = extractPromptText(promptText);
        setMessage(extractedPrompt);
    }, [extractPromptText, setMessage]);

    // Debug jobId prop and fetch prompts when needed
    useEffect(() => {
        console.log("Sidebar received jobId:", jobId, "typeof jobId:", typeof jobId);
        
        // Fetch threshold ID when jobId changes
        if (jobId) {
            getThresholdId(jobId).then(tid => {
                if (tid) {
                    setThresholdId(tid);
                    console.log(`Set threshold ID to ${tid} for job ID ${jobId}`);
                }
            });
        }
        
        // Fetch sample prompts when jobId changes and we have the required data
        if (jobId && roles && roles.length > 0 && skills_data && Object.keys(skills_data).length > 0) {
            console.log("Fetching sample prompts with complete data");
            fetchSamplePrompts();
        } else if (jobId) {
            console.log("Will fetch sample prompts with just jobId (fallback method)");
            fetchSamplePrompts();
        }
    }, [jobId, roles, skills_data, fetchSamplePrompts, getThresholdId]);

    // Extract available dashboard categories from skills_data
    useEffect(() => {
        if (skills_data && Object.keys(skills_data).length > 0) {
            // Get the first role key
            const roleKey = Object.keys(skills_data)[0];
            if (roleKey && skills_data[roleKey]) {
                // Extract categories (skills, achievements, activities, etc.)
                const categories = Object.keys(skills_data[roleKey]);
                console.log("Available dashboard categories:", categories);
                setAvailableDashboards(categories);
                
                // Set initial selected dashboards
                const initialSelected = categories.slice(0, dashboardCount);
                setSelectedDashboards(initialSelected);
            }
        }
    }, [skills_data]);

    // Auto-select the first role when component loads
    useEffect(() => {
        console.log("Roles received in sidebar:", roles);
        if (roles && roles.length > 0) {
            // Auto-select the first role
            const initialRoles = [roles[0]];
            setSelectedRoles(initialRoles);
            
            // Notify parent components about the auto-selection
            if (sendSelectedRoles) sendSelectedRoles(initialRoles);
            if (onRoleSelect) onRoleSelect(initialRoles);
        }
    }, [roles]);

    useEffect(() => {
        if (selectedRoles.length > 0) {
            sendSelectedRoles(selectedRoles);
        }
    }, [selectedRoles, sendSelectedRoles]);

    // Update dashboard selections when count changes
    useEffect(() => {
        if (availableDashboards.length > 0) {
            // Limit selections to dashboard count
            let newSelection = [...selectedDashboards];
            
            // If we have more than allowed, trim
            if (newSelection.length > dashboardCount) {
                newSelection = newSelection.slice(0, dashboardCount);
            }
            
            // If we have fewer than allowed, add more
            while (newSelection.length < dashboardCount && 
                   newSelection.length < availableDashboards.length) {
                const nextOption = availableDashboards.find(opt => !newSelection.includes(opt));
                if (nextOption) {
                    newSelection.push(nextOption);
                } else {
                    break;
                }
            }
            
            setSelectedDashboards(newSelection);
        }
    }, [dashboardCount, availableDashboards]);

    const handleDashboardCountChange = (e) => {
        const count = parseInt(e.target.value);
        setDashboardCount(count);
        sendRangeValue(count);
    };

    const handleRoleChange = (role) => {
        const updatedRoles = selectedRoles.includes(role)
            ? selectedRoles.filter(r => r !== role)
            : [...selectedRoles, role];
        setSelectedRoles(updatedRoles);
        onRoleSelect(updatedRoles);
    };

    const handleDashboardSelection = (dashboard) => {
        if (selectedDashboards.includes(dashboard)) {
            // Only remove if we'll still have at least one dashboard
            if (selectedDashboards.length > 1) {
                setSelectedDashboards(selectedDashboards.filter(d => d !== dashboard));
            }
        } else if (selectedDashboards.length < dashboardCount) {
            setSelectedDashboards([...selectedDashboards, dashboard]);
        } else {
            // Replace the last one
            const newSelection = [...selectedDashboards];
            newSelection.pop();
            newSelection.push(dashboard);
            setSelectedDashboards(newSelection);
        }
    };

    const handleRunPrompt = async (prompt) => {
        try {
            setIsLoading(true);
            setError(null);
        
            console.log("Running prompt:", prompt);
        
            const promptText = typeof prompt === 'string' ? prompt : String(prompt || "");
            
            // Get current threshold ID from the jobId
            const tid = thresholdId || await getThresholdId(jobId);
            if (!tid && !jobId) {
                throw new Error("No threshold ID or job ID available");
            }
            
            const threshold_id = tid || parseInt(jobId);
            console.log(`Using threshold ID ${threshold_id} for prompt processing`);
            
            // First, call the process-prompt API which uses AI to properly handle the modifications
            let processedSkillsData = null;
            let processingSuccessful = false;
            
            try {
                console.log("Calling process-prompt API...");
                const processResponse = await fetch('/api/process-prompt', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        prompt: promptText,
                        threshold_id: threshold_id,
                        current_dashboards: skills_data // Send current data to ensure proper context
                    }),
                });
            
                if (processResponse.ok) {
                    try {
                        const processData = await processResponse.json();
                        console.log("Process prompt response:", processData);
                        
                        if (processData && processData.modified_dashboards) {
                            processedSkillsData = processData.modified_dashboards;
                            processingSuccessful = true;
                            
                            // If processing was successful, show the changes that were made
                            if (processData.changes && processData.changes.length > 0) {
                                console.log("Changes made:", processData.changes);
                                // Optionally display changes to user
                                // setChangesMessage(processData.changes.join("\n"));
                            }
                        }
                    } catch (parseError) {
                        console.warn("Could not parse process response as JSON:", parseError);
                    }
                } else {
                    const errorData = await processResponse.text();
                    console.warn("Process prompt warning:", errorData.substring(0, 200));
                }
            } catch (processError) {
                console.warn("Error with process-prompt API:", processError);
            }
            
            // Fallback: Use the local processing if the AI-based one failed
            let finalSkillsData;
            if (processingSuccessful && processedSkillsData) {
                console.log("Using AI-processed skills data");
                finalSkillsData = processedSkillsData;
            } else {
                console.log("Falling back to local processing");
                // Manually apply changes as a backup approach
                finalSkillsData = manuallyApplyChanges(skills_data, promptText);
            }
            
            // Ensure we're sending an object, not an array
            let sanitizedSkillsData = finalSkillsData;
            if (Array.isArray(finalSkillsData)) {
                if (finalSkillsData.length > 0) {
                    sanitizedSkillsData = finalSkillsData[0];
                } else {
                    sanitizedSkillsData = {}; // Fallback to empty object if array is empty
                }
            }
            
            console.log("Final skills data type for update:", typeof sanitizedSkillsData);
            
            // Now update the database with the final skills data
            try {
                const updateResponse = await fetch('/api/update-dashboard-data', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        threshold_id: threshold_id,
                        job_id: jobId,
                        skills_data: sanitizedSkillsData,
                        prompt: promptText
                    }),
                });
                
                if (!updateResponse.ok) {
                    const contentType = updateResponse.headers.get('content-type');
                    let errorMessage = '';
                    
                    if (contentType && contentType.includes('application/json')) {
                        try {
                            const errorData = await updateResponse.json();
                            errorMessage = errorData.error || errorData.detail || `Server error: ${updateResponse.status}`;
                        } catch (jsonError) {
                            const errorText = await updateResponse.text();
                            errorMessage = `Failed to update dashboard data: ${updateResponse.status} - ${errorText.substring(0, 100)}`;
                        }
                    } else {
                        const errorText = await updateResponse.text();
                        errorMessage = `Failed to update dashboard data: ${updateResponse.status} - ${errorText.substring(0, 100)}`;
                    }
                    
                    throw new Error(errorMessage);
                }
                
                console.log("Dashboard data update successful");
                
                // Update the UI with the changes
                if (onDashboardUpdate) {
                    onDashboardUpdate(sanitizedSkillsData);
                }
            
                alert("Threshold scores updated successfully!");
                
                // Refresh sample prompts after successful update
                fetchSamplePrompts();
            } catch (apiError) {
                console.error("API error:", apiError);
                throw apiError;
            }
        
            setIsLoading(false);
        } catch (error) {
            console.error("Error processing prompt:", error);
            setError(`Error updating dashboard: ${error.message}`);
            setIsLoading(false);
        }
    };

    const manuallyApplyChanges = (currentSkillsData, promptText) => {
        // Ensure currentSkillsData is an object, not an array
        let skillsDataObj = currentSkillsData;
        if (Array.isArray(currentSkillsData)) {
            console.log("Input skills_data is an array with length:", currentSkillsData.length);
            if (currentSkillsData.length > 0) {
                skillsDataObj = currentSkillsData[0];
            } else {
                console.warn("Empty skills_data array provided, using empty object");
                skillsDataObj = {};
            }
        }
        
        // Deep clone the current skills data to avoid mutating the original
        const updatedSkillsData = JSON.parse(JSON.stringify(skillsDataObj));
        
        // Parse the prompt text to extract changes
        const lines = promptText.split('\n');
    
        for (const line of lines) {
            if (!line.trim()) continue;
        
            // Extract skill name and values
            let skillName = '';
            let newValue = 0;
            let isRating = false;
        
            // Check for different patterns
            if (line.includes("selection score") || line.includes("rejection score")) {
                // Extract skill name - it's between the start and "'s"
                const match = line.match(/(?:Set|Adjust)\s+(.*?)'s/);
                if (match && match[1]) {
                    skillName = match[1];
                }
            
                // Extract new value - it's after "to" and before "%"
                const valueMatch = line.match(/to\s+(\d+\.\d+)%/);
                if (valueMatch && valueMatch[1]) {
                    newValue = parseFloat(valueMatch[1]);
                }
            
                isRating = false; // This is an importance value
            } 
            else if (line.includes("rating")) {
                // Extract skill name
                const match = line.match(/Update\s+(.*?)'s/);
                if (match && match[1]) {
                    skillName = match[1];
                }
            
                // Extract new value
                const valueMatch = line.match(/to\s+(\d+\.\d+)/);
                if (valueMatch && valueMatch[1]) {
                    newValue = parseFloat(valueMatch[1]);
                }
            
                isRating = true; // This is a rating value
            }
            else if (line.includes("importance")) {
                // Extract skill name
                const match = line.match(/Change\s+(.*?)'s/);
                if (match && match[1]) {
                    skillName = match[1];
                }
            
                // Extract new value
                const valueMatch = line.match(/to\s+(\d+\.\d+)%/);
                if (valueMatch && valueMatch[1]) {
                    newValue = parseFloat(valueMatch[1]);
                }
            
                isRating = false; // This is an importance value
            }
        
            // If we found a skill name and a new value, update the skills data
            if (skillName && newValue) {
                console.log(`Updating ${skillName} with new ${isRating ? 'rating' : 'importance'} value: ${newValue}`);
            
                // Find the skill in the skills data
                const roleKeys = Object.keys(updatedSkillsData);
                if (roleKeys.length === 0) {
                    console.warn("No role keys found in skills data");
                    continue;
                }
                
                const roleKey = roleKeys[0]; // Assuming there's only one role
                if (!roleKey) continue;
            
                const roleData = updatedSkillsData[roleKey];
                if (!roleData) {
                    console.warn(`No data found for role ${roleKey}`);
                    continue;
                }
                
                let found = false;
            
                // Check in skills, achievements, and activities
                for (const category of Object.keys(roleData)) {
                    if (roleData[category] && roleData[category][skillName]) {
                        // Found the skill, update the value
                        if (isRating) {
                            roleData[category][skillName].rating = newValue;
                        } else {
                            roleData[category][skillName].importance = newValue;
                        }
                        found = true;
                        break;
                    }
                }
            
                if (!found) {
                    console.warn(`Could not find skill: ${skillName} in the skills data`);
                }
            }
        }
        
        // Ensure we return an object, not an array
        console.log("Final updated skills_data type:", typeof updatedSkillsData);
        return updatedSkillsData;
    };

    // Parse sample prompts to make them clickable
    const renderClickableSamplePrompts = useCallback(() => {
        if (!samplePrompts) return null;
        
        // Ensure samplePrompts is a string
        const promptsText = typeof samplePrompts === 'string' ? samplePrompts : String(samplePrompts || '');
        
        // Match numbered items with titles, descriptions, and quotes
        const sections = promptsText.split(/\d+\.\s*\*\*/).filter(Boolean);
        
        // If we couldn't split it properly, just show the raw content
        if (sections.length <= 1) {
            return (
                <div 
                    className="p-2 bg-gray-100 rounded text-xs whitespace-pre-line"
                    dangerouslySetInnerHTML={{ __html: promptsText.replace(/\n/g, '<br>') }}
                />
            );
        }
        
        // Map each section to a clickable prompt
        return sections.map((section, index) => {
            // Find the title
            const titleMatch = section.match(/([^:*]+):/);
            const title = titleMatch ? titleMatch[1].trim() : `Sample ${index + 1}`;
            
            // Find the text in quotes
            const quoteMatch = section.match(/"([^"]+)"/);
            let promptText = quoteMatch ? quoteMatch[1] : section;
            
            // Truncate the prompt text if it's too long (>80 chars)
            const originalText = promptText;
            if (promptText.length > 80) {
                promptText = promptText.substring(0, 80) + "...";
            }
            
            return (
                <div 
                    key={`prompt-section-${index}`}
                    className="p-2 bg-gray-100 rounded cursor-pointer hover:bg-gray-200 text-xs transition-colors mb-1"
                    onClick={() => handleSamplePromptClick(originalText)}
                    title={originalText}
                >
                    <div className="font-semibold text-blue-600">{title}</div>
                    <div className="text-gray-800 mt-1 italic bg-white p-1 rounded border border-gray-300 text-xs">
                        "{promptText}"
                    </div>
                </div>
            );
        });
    }, [samplePrompts, handleSamplePromptClick]);

    const handleCreate = async () => {
      if (selectedRoles.length > 0) {
        console.log("Creating dashboard with roles:", selectedRoles);
        console.log("Selected dashboards:", selectedDashboards);
        console.log("Number of dashboards:", dashboardCount);
        
        try {
            setIsLoading(true);
            setError(null);
            
            // Filter skills_data to only include selected dashboards
            const filteredSkillsData = {};
            
                // For each role
                Object.keys(skills_data).forEach(roleKey => {
                    filteredSkillsData[roleKey] = {};
                    
                    // Only include selected dashboard categories
                    selectedDashboards.forEach(category => {
                        if (skills_data[roleKey][category]) {
                            filteredSkillsData[roleKey][category] = skills_data[roleKey][category];
                        }
                    });
                });
                
                // Pass filtered data with dashboard count
                sendSelectedRoles(selectedRoles);
                sendRangeValue(dashboardCount);

                // Use the jobId provided as prop instead of trying to extract from URL
                console.log("jobId in handleCreate:", jobId, "typeof:", typeof jobId);
                
                // Get a valid numeric job ID, with good fallbacks
                let currentJobId = 1; // Default fallback
                
                if (jobId !== undefined && jobId !== null) {
                  if (typeof jobId === 'number') {
                    currentJobId = jobId;
                  } else if (typeof jobId === 'string' && jobId.trim() !== '') {
                    // Try to parse as integer if it's a string
                    const parsed = parseInt(jobId);
                    if (!isNaN(parsed)) {
                      currentJobId = parsed;
                    }
                  }
                }
                
                console.log("Final currentJobId value:", currentJobId, "type:", typeof currentJobId);
                
                // Call the create_dashboards endpoint with the job_id and dashboard count
                const response = await fetch(`http://127.0.0.1:8000/api/update_dashboards/?job_id=${currentJobId}&num_dashboards=${dashboardCount}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                });
                
                console.log("Response status:", response.status);
                console.log("Response headers:", Object.fromEntries([...response.headers]));
                
                // Check for empty response
                const responseText = await response.text();
                console.log("Raw response:", responseText);
                
                let responseData = {};
                if (responseText) {
                    try {
                        responseData = JSON.parse(responseText);
                    } catch (parseError) {
                        console.error("Error parsing response:", parseError);
                        setError(`Error parsing API response: ${responseText.substring(0, 100)}...`);
                    }
                }
                
                if (!response.ok) {
                    const statusText = response.statusText || "";
                    let errorMessage = `API Error (${response.status}): ${statusText}`;
                    
                    // Handle different error types
                    if (response.status === 422) {
                        console.error("Validation Error Details:", responseData);
                        
                        // Format validation errors (typical FastAPI format)
                        if (responseData.detail && Array.isArray(responseData.detail)) {
                            const validationErrors = responseData.detail.map(err => 
                                `${err.loc.join('.')} - ${err.msg}`
                            ).join('; ');
                            errorMessage += ` - Validation errors: ${validationErrors}`;
                        } else if (typeof responseData.detail === 'object') {
                            errorMessage += ` - ${JSON.stringify(responseData.detail)}`;
                        } else if (responseData.detail) {
                            errorMessage += ` - ${responseData.detail}`;
                        }
                    } else {
                        // For other errors
                        if (responseData.detail) {
                            errorMessage += ` - ${typeof responseData.detail === 'object' ? 
                                JSON.stringify(responseData.detail) : responseData.detail}`;
                        }
                    }
                    
                    console.error(errorMessage);
                    throw new Error(errorMessage);
                }
                
                console.log("Dashboard created successfully:", responseData);
                
                // Pass the response data to the parent component
                if (onCreate) {
                  onCreate({
                    roles: responseData.roles || selectedRoles,
                    skills_data: responseData.skills_data || filteredSkillsData,
                    num_dashboards: dashboardCount,
                    ...responseData
                  });
                }
              
              setMessage("Created dashboard for selected roles");
              setIsLoading(false);
            } catch (error) {
                console.error("Error creating dashboard:", error);
                setError(`Error creating dashboard: ${error.message}`);
                setIsLoading(false);
            }
        }
    };

    // Add a button click handler for the refresh button to explicitly fetch prompts
    const handleRefreshPrompts = async () => {
        if (!jobId) {
            console.error("Cannot fetch prompts: No job ID available");
            return;
        }
        
        console.log("Manually refreshing prompts for job ID:", jobId);
        await fetchSamplePrompts();
    };

    return (
        <div className="p-4 bg-white rounded-lg shadow-md">
            <div className="mb-6 border rounded-lg p-4">
                <label htmlFor="promptInput" className="block text-sm font-medium text-gray-700 mb-2">
                    Enter Prompt
                </label>
                <textarea
                    id="promptInput"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter your prompt here..."
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                />
                <button
                    onClick={() => handleRunPrompt(message)}
                    className="mt-3 w-full py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-400"
                    disabled={!message.trim() || isLoading}
                >
                    {isLoading ? "Processing..." : "Submit Prompt"}
                </button>
                
                <div className="mt-4">
                    <div className="flex justify-between items-center mb-2">
                        <p className="text-sm font-medium text-gray-700">Sample Prompts:</p>
                        <button 
                            onClick={handleRefreshPrompts}
                            className="text-xs flex items-center text-blue-600 hover:text-blue-800"
                            disabled={loadingSamplePrompts}
                        >
                            {loadingSamplePrompts ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Refreshing...
                                </span>
                            ) : (
                                <>
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                                    </svg>
                                    Refresh
                                </>
                            )}
                        </button>
                    </div>
                    
                    {loadingSamplePrompts ? (
                        <div className="text-center py-4">
                            <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                            <p className="mt-2 text-gray-600 text-sm">Loading sample prompts...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-2">
                            {samplePrompts ? (
                                renderClickableSamplePrompts()
                            ) : (
                                <>
                                    <div 
                                        className="p-2 bg-gray-100 rounded cursor-pointer hover:bg-gray-200 text-sm transition-colors"
                                        onClick={() => setMessage("Set JavaScript's selection score to 85.5%")}
                                    >
                                        Set JavaScript's selection score to 85.5%
                                    </div>
                                    <div 
                                        className="p-2 bg-gray-100 rounded cursor-pointer hover:bg-gray-200 text-sm transition-colors"
                                        onClick={() => setMessage("Update React's rating to 4.5")}
                                    >
                                        Update React's rating to 4.5
                                    </div>
                                    <div 
                                        className="p-2 bg-gray-100 rounded cursor-pointer hover:bg-gray-200 text-sm transition-colors"
                                        onClick={() => setMessage("Change TypeScript's importance to 90.0%")}
                                    >
                                        Change TypeScript's importance to 90.0%
                                    </div>
                                    <div 
                                        className="p-2 bg-gray-100 rounded cursor-pointer hover:bg-gray-200 text-sm transition-colors"
                                        onClick={() => setMessage("Adjust Node.js's rejection score to 25.0%")}
                                    >
                                        Adjust Node.js's rejection score to 25.0%
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {message && (
                <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-md">
                    {message}
                </div>
            )}

            {error && (
                <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
                    {error}
                </div>
            )}
        </div>
    );
};

export default Sidebar;
