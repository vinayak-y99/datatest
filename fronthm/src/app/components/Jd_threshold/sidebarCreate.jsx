"use client";
import { useState, useEffect } from "react";
import RoleSelector from "./RoleSelector";
import React from 'react';

const Sidebar = ({
    roles,
    skills_data,
    sendRangeValue,
    onCreate,
    sendSelectedRoles,
    onRoleSelect,
    onDashboardUpdate
}) => {
    const [selectedRoles, setSelectedRoles] = useState([]);
    const [dashboardCount, setDashboardCount] = useState(5); // Default to 5 on scale
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [availableDashboards, setAvailableDashboards] = useState([]);
    const [selectedDashboards, setSelectedDashboards] = useState([]);

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
        
            const response = await fetch('/api/process-prompt', {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt: promptText }),
            });
        
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to process prompt');
            }
        
            const data = await response.json();
            console.log("Prompt response:", data);
        
            const updatedSkillsData = manuallyApplyChanges(skills_data, promptText);
        
            if (onDashboardUpdate) {
                onDashboardUpdate(updatedSkillsData);
            }
        
            alert("Threshold scores updated successfully!");
        
            setIsLoading(false);
        } catch (error) {
            console.error("Error processing prompt:", error);
            setError(`Error updating dashboard: ${error.message}`);
            setIsLoading(false);
        }
    };

    const manuallyApplyChanges = (currentSkillsData, promptText) => {
        // Deep clone the current skills data to avoid mutating the original
        const updatedSkillsData = JSON.parse(JSON.stringify(currentSkillsData));
    
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
                const roleKey = Object.keys(updatedSkillsData)[0]; // Assuming there's only one role
                if (!roleKey) continue;
            
                const roleData = updatedSkillsData[roleKey];
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
    
        return updatedSkillsData;
    };

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

                // If your backend requires the uploaded file, you might need to handle that separately
                const userId = "1"; // Replace with actual user ID retrieval
                
                // Call the analyze_job_description endpoint with the dashboard count
                const response = await fetch(`/api/analyze_job_description/?num_dashboards=${dashboardCount}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        user_id: userId,
                        roles: selectedRoles,
                        num_dashboards: dashboardCount
                    }),
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.detail || 'Failed to create dashboard');
                }
                
                const data = await response.json();
                console.log("Dashboard created successfully:", data);
                
                // Pass the response data to the parent component
                onCreate({
                  roles: selectedRoles,
                  skills_data: filteredSkillsData,
                  num_dashboards: dashboardCount
              });
              
              setMessage("Created dashboard for selected roles");
              setIsLoading(false);
            } catch (error) {
                console.error("Error creating dashboard:", error);
                setError(`Error creating dashboard: ${error.message}`);
                setIsLoading(false);
            }
        }
    };

    return (
        <div className="p-4 bg-white rounded-lg shadow-md">
            <div className="mb-6 border rounded-lg p-4">
                {/* <h3 className="text-lg font-medium mb-3">Select Role</h3> */}
                <RoleSelector
                    roles={roles} 
                    onRoleChange={handleRoleChange}
                    selectedRoles={selectedRoles}
                />
            </div>
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Dashboards: {dashboardCount}
                </label>
                <input
                    type="range"
                    min="1"
                    max={Math.max(10, availableDashboards.length)}
                    value={dashboardCount}
                    onChange={handleDashboardCountChange}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1</span>
                    <span>{Math.max(10, availableDashboards.length)}</span>
                </div>
            </div>
            <button
                onClick={handleCreate}
                className="w-full mb-6 py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:bg-gray-400"
                disabled={selectedRoles.length === 0 || selectedDashboards.length === 0 || isLoading}
            >
                {isLoading ? "Creating..." : "Create Dashboard"}
            </button>

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
