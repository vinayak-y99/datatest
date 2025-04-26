// This file is part of the JD Threshold project create/modify page

"use client";
import React, { useState, useEffect } from "react";
import Sidebar from "./sidebarCreate";
import RightSidebar from './rightsidebar';
import Link from 'next/link';
import { ChevronDown, ChevronRight, Settings } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, BarChart, Bar, XAxis, YAxis, Cell, Tooltip } from 'recharts';

// Placeholder components for dashboard items
const ThresholdScore = ({ onMinimize }) => (
  <div className="bg-white p-4 rounded-lg shadow">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-semibold">Threshold Score</h3>
      <button onClick={onMinimize} className="text-gray-500 hover:text-gray-700">Minimize</button>
    </div>
    <div>Threshold Score Content</div>
  </div>
);

const JobDescription = ({ onMinimize }) => (
  <div className="bg-white p-4 rounded-lg shadow">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-semibold">Job Description</h3>
      <button onClick={onMinimize} className="text-gray-500 hover:text-gray-700">Minimize</button>
    </div>
    <div>Job Description Content</div>
  </div>
);

const Resume = ({ onMinimize }) => (
  <div className="bg-white p-4 rounded-lg shadow">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-semibold">Resume</h3>
      <button onClick={onMinimize} className="text-gray-500 hover:text-gray-700">Minimize</button>
    </div>
    <div>Resume Content</div>
  </div>
);

export default function Threshold({ jdData = {}, jobId, jdId }) {
  // Debug all incoming props
  console.log('Threshold component props - jdData:', jdData);
  console.log('Threshold component props - jobId:', jobId, 'jdId:', jdId);
  console.log('Sample prompts received in Threshold:', jdData?.apiResponse?.selected_prompts);
  console.log('jobId from jdData:', jdData?.jobId);

  const [roles, setRoles] = useState(() => {
    const rolesData = jdData?.apiResponse?.roles;
    console.log("Initializing roles with:", rolesData);
    return rolesData || [];
  });

  const [skillsData, setSkillsData] = useState(() => {
    const skillsData = jdData?.apiResponse?.skills_data || [];
    return [Array.isArray(skillsData) ? skillsData : [skillsData]];
  });

  // Initialize sample prompts from the API response
  const [samplePrompts, setSamplePrompts] = useState(() => {
    const prompts = jdData?.apiResponse?.selected_prompts;
    console.log('Initializing sample prompts with:', prompts);  
    
    // Check if prompts is an array
    if (Array.isArray(prompts) && prompts.length > 0) {
      return prompts;
    }
    
    // Generate default prompts
    const role = jdData?.apiResponse?.roles?.[0] || "the role";
    const skills = Object.keys(jdData?.apiResponse?.skills_data || {}).slice(0, 5).join(", ");
    
    return [
      `I am applying for ${role} position. Here's my resume: [PASTE RESUME]. How well do I match the requirements?`,
      `I have experience in ${skills}. Can you help me tailor my resume for the ${role} position?`,
      `What specific achievements should I highlight in my cover letter for the ${role} position?`,
      `Based on the job description for ${role}, what questions might I be asked in an interview?`,
      `How can I demonstrate my expertise in ${skills} during an interview for the ${role} position?`
    ];
  });
    
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [showThreshold, setShowThreshold] = useState(true);
  const [showJobDescription, setShowJobDescription] = useState(true);
  const [showResume, setShowResume] = useState(true);
  const [ViewItems, setViewItems] = useState([]);
  const [showProjectdashboard, setShowDashboard] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [sharedValue, setSharedValue] = useState(null);
  const [selectedRolesForThreshold, setSelectedRolesForThreshold] = useState([]);
  const [expandedSections, setExpandedSections] = useState({});
  const [useRatings, setUseRatings] = useState(true);
  const [availableDashboards, setAvailableDashboards] = useState([]);
  const [activeDashboard, setActiveDashboard] = useState(null);
  const [dashboardCount, setDashboardCount] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [modifiedValues, setModifiedValues] = useState({});
  const [savingChanges, setSavingChanges] = useState(false);
  const [savingItems, setSavingItems] = useState({});

  const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#6366f1'];

  useEffect(() => {
    if (jdData?.apiResponse) {
      setRoles(jdData.apiResponse.roles || []);
      setSkillsData([Array.isArray(jdData.apiResponse.skills_data)
        ? jdData.apiResponse.skills_data
        : [jdData.apiResponse.skills_data || {}]]);
      
      // Make sure we're setting an array for sample prompts
      if (Array.isArray(jdData.apiResponse.selected_prompts)) {
        setSamplePrompts(jdData.apiResponse.selected_prompts);
      } else if (typeof jdData.apiResponse.selected_prompts === 'string') {
        // If it's a string, convert it to an array with one item
        setSamplePrompts([jdData.apiResponse.selected_prompts]);
      } else {
        // Generate default prompts
        const role = jdData.apiResponse.roles?.[0] || "the role";
        const skills = Object.keys(jdData.apiResponse.skills_data || {}).slice(0, 5).join(", ");
        
        setSamplePrompts([
          `I am applying for ${role} position. Here's my resume: [PASTE RESUME]. How well do I match the requirements?`,
          `I have experience in ${skills}. Can you help me tailor my resume for the ${role} position?`,
          `What specific achievements should I highlight in my cover letter for the ${role} position?`,
          `Based on the job description for ${role}, what questions might I be asked in an interview?`,
          `How can I demonstrate my expertise in ${skills} during an interview for the ${role} position?`
        ]);
      }

      // Extract available dashboard categories from skills_data
      if (jdData.apiResponse.skills_data && Object.keys(jdData.apiResponse.skills_data).length > 0) {
        // Get the first role key
        const roleKey = Object.keys(jdData.apiResponse.skills_data)[0];
        if (roleKey && jdData.apiResponse.skills_data[roleKey]) {
          // Extract categories (skills, achievements, activities, etc.)
          const categories = Object.keys(jdData.apiResponse.skills_data[roleKey]);
          console.log("Available dashboard categories:", categories);
          setAvailableDashboards(categories);
          
          // Set first category as active by default
          if (categories.length > 0) {
            setActiveDashboard(categories[0]);
            setExpandedSections({ [categories[0]]: true });
          }
        }
      }
      
      console.log('Updated sample prompts from jdData:', jdData.apiResponse.selected_prompts);
    }
  }, [jdData]);

  // Add a useEffect to listen for dashboard updates from the sidebar
  useEffect(() => {
    const handleDashboardDataUpdate = (event) => {
      const { jobId: updatedJobId, data } = event.detail;
      
      // Make sure this is for our job
      if ((jobId || jdData?.jobId) == updatedJobId && data) {
        console.log(`Received dashboard update event for job ${updatedJobId}`);
        
        // Update skills data if required_skills is available
        if (data.required_skills) {
          try {
            const parsedSkills = typeof data.required_skills === 'string' 
              ? JSON.parse(data.required_skills)
              : data.required_skills;
            
            // Update the local state
            const updatedSkillsData = JSON.parse(JSON.stringify(skillsData));
            const currentData = Array.isArray(updatedSkillsData[0]) ? updatedSkillsData[0][0] : updatedSkillsData[0];
            const roleKey = Object.keys(currentData)[0];
            
            if (roleKey) {
              // Update each category with fresh data
              Object.keys(parsedSkills).forEach(category => {
                if (currentData[roleKey][category]) {
                  currentData[roleKey][category] = parsedSkills[category];
                }
              });
              
              // Set the updated data
              setSkillsData(updatedSkillsData);
            }
          } catch (parseError) {
            console.error("Error parsing updated skills data:", parseError);
          }
        }
      }
    };

    // Add event listener
    window.addEventListener('dashboardDataUpdated', handleDashboardDataUpdate);
    
    // Remove event listener on cleanup
    return () => {
      window.removeEventListener('dashboardDataUpdated', handleDashboardDataUpdate);
    };
  }, [jobId, jdData?.jobId, skillsData]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({...prev, [section]: !prev[section]}));
  };

  const setDashboardActive = (dashboardName) => {
    setActiveDashboard(dashboardName);
    setExpandedSections(prev => {
      const newState = {};
      // Set all to false
      Object.keys(prev).forEach(key => {
        newState[key] = false;
      });
      // Set the selected one to true
      newState[dashboardName] = true;
      return newState;
    });
  };

  const handleSelectedRoles = (roles) => {
    console.log("Page received selected roles:", roles);
    setSelectedRolesForThreshold(roles);
    // Show the dashboard when roles are selected
    setShowDashboard(true);
  };

  const handleSendRangeValue = (value) => {
    setSharedValue(value);
  };

  const handleRolesUpdate = (newRoles) => {
    console.log("Page received new roles from API:", newRoles);
    setRoles(newRoles);
  };

  const handleSkillsUpdate = (newSkills) => {
    console.log("Page received new skills from API:", newSkills);
    setSkillsData(newSkills);
  };

  const handleRoleSelection = (selectedRoles) => {
    setSelectedRoles(selectedRoles);
  };

  const handleDashboardUpdate = (newData) => {
    setSkillsData(newData);
    setShowDashboard(true);
    setIsSidebarOpen(true);
  };

  const getItems = () => {
    const items = [];

    if (showThreshold) {
      items.push({
        id: 'threshold',
        component: <ThresholdScore onMinimize={() => {
          setShowThreshold(false);
          setViewItems(["threshold", ...ViewItems]);
        }} />
      });
    }

    if (showJobDescription) {
      items.push({
        id: 'job-description',
        component: <JobDescription onMinimize={() => {
          setShowJobDescription(false);
          setViewItems(["job-description", ...ViewItems]);
        }} />
      });
    }

    if (showResume) {
      items.push({
        id: 'resume',
        component: <Resume onMinimize={() => {
          setShowResume(false);
          setViewItems(["resume", ...ViewItems]);
        }} />
      });
    }

    return items;
  };

  const handleCreate = async () => {
    console.log("Creating dashboard with roles:", selectedRolesForThreshold);
    console.log("Skills data available:", skillsData);
    console.log("Sample prompts available:", samplePrompts);
    setIsLoading(true);
    
    try {
      // Get a valid numeric job ID
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
      } else if (jdData?.jobId) {
        // Try using jobId from jdData
        if (typeof jdData.jobId === 'number') {
          currentJobId = jdData.jobId;
        } else if (typeof jdData.jobId === 'string' && jdData.jobId.trim() !== '') {
          const parsed = parseInt(jdData.jobId);
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
      
      // Check for empty response
      const responseText = await response.text();
      console.log("Raw response:", responseText);
      
      let responseData = {};
      if (responseText) {
        try {
          responseData = JSON.parse(responseText);
        } catch (parseError) {
          console.error("Error parsing response:", parseError);
          throw new Error(`Error parsing API response: ${responseText.substring(0, 100)}...`);
        }
      }
      
      if (!response.ok) {
        throw new Error(`API Error (${response.status}): ${response.statusText || ""}`);
      }
      
      console.log("Dashboard created successfully:", responseData);
      
      setShowDashboard(true);
      setIsSidebarOpen(false);
      setIsLoading(false);
    } catch (error) {
      console.error("Error creating dashboard:", error);
      // Show error message to user
      alert(`Error creating dashboard: ${error.message}`);
      setIsLoading(false);
    }
  };

  const renderDashboardTabs = () => {
    if (!availableDashboards || availableDashboards.length === 0) return null;
    
    return (
      <div className="flex flex-wrap gap-2 mb-6 border-b pb-3">
        {availableDashboards.map((category) => (
          <button
            key={category}
            onClick={() => setDashboardActive(category)}
            className={`px-4 py-2 rounded-lg capitalize text-sm font-medium transition-colors ${
              activeDashboard === category 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category}
          </button>
        ))}
      </div>
    );
  };

  const ColorDot = ({ color }) => (
    <span
      className="inline-block w-3 h-3 rounded-full mr-2"
      style={{ backgroundColor: color }}
    />
  );

  const prepareChartData = (title, items) => {
    if (!items) return [];
    return Object.entries(items).map(([itemName, data]) => ({
      name: itemName,
      value: useRatings ? data.rating : data.importance
    }));
  };

  const renderSection = (title, items) => {
    if (!items) return null;
    
    const data = prepareChartData(title, items);
    const itemCount = Object.keys(items).length;
    const chartHeight = Math.min(Math.max(300, itemCount * 50), 400);

    return (
      <div key={title} className="mb-6 rounded-lg p-6 border border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center cursor-pointer" onClick={() => toggleSection(title)}>
            <div className="mr-2">
              {expandedSections[title] ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
            </div>
            <span className="text-gray-800 font-medium text-xl capitalize">{title}</span>
          </div>
        </div>
        
        {expandedSections[title] && (
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="w-full lg:w-1/3">
              {Object.entries(items).map(([itemName, data], index) => (
                <div
                  key={itemName}
                  className="flex items-center mb-4 hover:bg-gray-50 p-2 rounded transition-colors"
                >
                  <ColorDot color={COLORS[index % COLORS.length]} />
                  <span className="text-sm text-gray-700 flex-grow ml-2">{itemName}</span>
                  
                  <div className="flex items-center gap-4">
                    {useRatings ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium w-8">
                          {data.rating}
                        </span>
                        <input
                          type="range"
                          min="0"
                          max="10"
                          step="0.5"
                          value={data.rating}
                          onChange={(e) => handleRatingChange(itemName, e.target.value)}
                          className={`w-24 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-600 ${
                            isLoading || savingItems[`${title}-${itemName}`] ? 'opacity-50' : ''
                          }`}
                          disabled={isLoading || savingItems[`${title}-${itemName}`]}
                        />
                        {savingItems[`${title}-${itemName}`] && (
                          <span className="ml-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-blue-500 border-t-transparent"></span>
                        )}
                      </div>
                    ) : (
                      <span className="w-20 p-2 text-sm text-center">
                        {data.importance}%
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="w-full lg:w-2/3 grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="w-full" style={{ height: `${chartHeight}px` }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
                    <Pie
                      data={data}
                      cx="50%"
                      cy="50%"
                      innerRadius={Math.min(chartHeight * 0.25, 60)}
                      outerRadius={Math.min(chartHeight * 0.4, 90)}
                      paddingAngle={10}
                      dataKey="value"
                    >
                      {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="w-full" style={{ height: `${chartHeight}px` }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data}
                    margin={{ top: 20, right: 20, left: 20, bottom: 60 }}
                  >
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      height={60}
                      interval={0}
                      tick={{ fontSize: 12, fontWeight: 'bold' }}
                    />
                    <YAxis domain={[0, useRatings ? 10 : 100]} />
                    <Tooltip />
                    <Bar dataKey="value" barSize={30}>
                      {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Add this function to render a save button when changes are pending
  const renderSaveButton = () => {
    const hasChanges = Object.keys(modifiedValues).length > 0;
    
    if (!hasChanges) return null;
    
    return (
      <div className="sticky top-0 z-10 bg-white p-3 mb-4 rounded-lg shadow-md">
        <button
          onClick={saveAllChanges}
          disabled={savingChanges || isLoading}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400 flex items-center justify-center"
        >
          {savingChanges ? (
            <>
              <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-t-transparent"></span>
              Saving Changes...
            </>
          ) : (
            'Save All Changes'
          )}
        </button>
      </div>
    );
  };

  // Find the renderDashboardContent function and update it to include the save button
  const renderDashboardContent = () => {
    if (!skillsData || skillsData.length === 0) return null;
    
    // Use first item if array
    const currentData = Array.isArray(skillsData[0]) ? skillsData[0][0] : skillsData[0];
    if (!currentData) return null;
    
    // Get the first role key
    const roleKey = Object.keys(currentData)[0];
    if (!roleKey || !currentData[roleKey]) return null;
    
    const roleData = currentData[roleKey];
    
    if (!activeDashboard || !roleData[activeDashboard]) {
      // If active dashboard not set or doesn't exist in data, return nothing
      return null;
    }
    
    return (
      <>
        {renderSaveButton()}
        {renderSection(activeDashboard, roleData[activeDashboard])}
      </>
    );
  };

  const handleRatingChange = (itemName, newRating) => {
    // Create a deep copy of the skillsData
    const updatedSkillsData = JSON.parse(JSON.stringify(skillsData));
    
    // Get the first item if array
    const currentData = Array.isArray(updatedSkillsData[0]) ? updatedSkillsData[0][0] : updatedSkillsData[0];
    if (!currentData) return;
    
    // Get the first role key
    const roleKey = Object.keys(currentData)[0];
    if (!roleKey || !currentData[roleKey]) return;
    
    const roleData = currentData[roleKey];
    
    // Update the rating for the specific item in the active dashboard
    if (roleData[activeDashboard] && roleData[activeDashboard][itemName]) {
      const newRatingValue = parseFloat(newRating);
      
      // Don't update if the value is the same
      if (roleData[activeDashboard][itemName].rating === newRatingValue) return;
      
      // Immediate UI update for responsiveness
      roleData[activeDashboard][itemName].rating = newRatingValue;
      setSkillsData(updatedSkillsData);
      
      // Track modified values
      setModifiedValues(prev => ({
        ...prev,
        [`${activeDashboard}-${itemName}`]: {
          roleKey,
          category: activeDashboard,
          itemName,
          newValue: newRatingValue,
          originalValue: roleData[activeDashboard][itemName].rating
        }
      }));
    }
  };
  
  // Function to save all modified values
  const saveAllChanges = async () => {
    if (!confirm("Save all changes to the database?")) return;
    
    setSavingChanges(true);
    let allSucceeded = true;
    
    try {
      // Save each modified value one by one
      for (const [key, item] of Object.entries(modifiedValues)) {
        try {
          await updateDashboardItem(
            item.roleKey,
            item.category,
            item.itemName,
            item.newValue
          );
        } catch (error) {
          console.error(`Failed to save ${key}:`, error);
          allSucceeded = false;
        }
      }
      
      if (allSucceeded) {
        alert("All changes saved successfully!");
        
        // Request fresh data to ensure UI matches database
        try {
          // Make a call to get the latest job description data
          console.log(`Refreshing data for job ID: ${jobId || jdData?.jobId}`);
          const response = await fetch(`http://127.0.0.1:8000/api/job-description/${jobId || jdData?.jobId}`);
          
          if (response.ok) {
            const updatedJobData = await response.json();
            
            // Update local skills data if required_skills is available
            if (updatedJobData.required_skills) {
              try {
                const parsedSkills = typeof updatedJobData.required_skills === 'string' 
                  ? JSON.parse(updatedJobData.required_skills)
                  : updatedJobData.required_skills;
                
                // Update the local state
                const updatedSkillsData = JSON.parse(JSON.stringify(skillsData));
                const currentData = Array.isArray(updatedSkillsData[0]) ? updatedSkillsData[0][0] : updatedSkillsData[0];
                const roleKey = Object.keys(currentData)[0];
                
                if (roleKey) {
                  // Update each category with fresh data
                  Object.keys(parsedSkills).forEach(category => {
                    if (currentData[roleKey][category]) {
                      currentData[roleKey][category] = parsedSkills[category];
                    }
                  });
                  
                  // Set the updated data
                  setSkillsData(updatedSkillsData);
                }
              } catch (parseError) {
                console.error("Error parsing updated skills data:", parseError);
              }
            }
            
            console.log("Successfully refreshed job data");
          }
        } catch (refreshError) {
          console.error("Error refreshing job data:", refreshError);
          // Continue with success message even if refresh fails
        }
        
        // Clear modified values
        setModifiedValues({});
      } else {
        alert("Some changes couldn't be saved. Please try again.");
      }
    } catch (error) {
      console.error("Error during save operation:", error);
      alert("An error occurred while saving changes.");
    } finally {
      setSavingChanges(false);
    }
  };
  
  // Function to call the API to update dashboard item
  const updateDashboardItem = async (roleKey, category, itemName, newRating) => {
    // Mark this specific item as saving
    setSavingItems(prev => ({
      ...prev,
      [`${category}-${itemName}`]: true
    }));
    
    try {
      setIsLoading(true); // Show global loading state
      
      // Prepare data for API call
      const updateData = {
        role: roleKey,
        category: category,
        item_name: itemName,
        new_rating: newRating,
        job_id: jobId || jdData?.jobId
      };
      
      console.log("Sending update request:", updateData);
      
      // Call the API endpoint
      const response = await fetch('http://127.0.0.1:8000/api/update_dashboard_item/', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });
      
      const responseText = await response.text();
      console.log("Raw API response:", responseText);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} - ${responseText}`);
      }
      
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        console.error("Error parsing JSON response:", e);
        result = { status: "error", message: "Invalid JSON response" };
      }
      
      console.log("Dashboard item update result:", result);
      
    } catch (error) {
      console.error("Error updating dashboard item:", error);
      alert(`Failed to update dashboard: ${error.message}`);
      
      // Reload data to ensure consistency
      if (handleDashboardUpdate) {
        handleDashboardUpdate(skillsData);
      }
      throw error; // Re-throw to handle in the calling function
    } finally {
      // Mark this specific item as no longer saving
      setSavingItems(prev => {
        const newState = {...prev};
        delete newState[`${category}-${itemName}`];
        return newState;
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col overflow-hidden">
      <main className="flex flex-col w-full max-md:max-w-full">
        <div className="space-y-2 bg-white rounded-lg shadow-md mt-2 pt-2">
          <section className="flex flex-col justify-center self-center p-0.5 w-full bg-white max-w-[100%] max-md:max-w-full">
            <div className="flex flex-col w-full bg-white shadow-sm max-md:pb-24 max-md:max-w-full">
              <div className="flex relative">
                <div
                  className="fixed left-0 top-0 h-full w-4 z-50"
                  onMouseEnter={() => setIsSidebarOpen(true)}
                />

                <div
                  className={`transition-all duration-300 ease-in-out ${
                    isSidebarOpen ? 'w-1/4' : 'w-0'
                  } overflow-hidden`}
                  onMouseLeave={() => showProjectdashboard && setIsSidebarOpen(false)}
                >
                  <div style={{display: isSidebarOpen ? 'block' :'none' }}>
                    <Sidebar
                      roles={roles}
                      skills_data={skillsData[0]}
                      samplePrompts={samplePrompts}
                      onRoleSelect={handleRoleSelection}
                      onDashboardUpdate={handleDashboardUpdate}
                      sendRangeValue={handleSendRangeValue}
                      sendSelectedRoles={handleSelectedRoles}
                      onCreate={handleCreate}
                      jobId={jobId || jdData?.jobId}
                    />
                  </div>
                </div>

                <div>
                  {showProjectdashboard && (
                    <div
                      className={`transition-all duration-300 ease-in-out flex-grow ${
                        isSidebarOpen ? 'ml-0' : 'ml-0 w-full'
                      }`}
                    >
                      <div className="p-6">
                        <div className="flex justify-between items-center mb-6">
                          <h2 className="text-2xl font-semibold text-gray-800">
                            {selectedRolesForThreshold.length > 0 ? selectedRolesForThreshold[0] : 'Threshold Score'}
                          </h2>
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center">
                              <span className="text-sm font-medium text-gray-700 whitespace-nowrap mr-2">
                                Number of Dashboards:
                              </span>
                              <span className="text-sm font-semibold text-indigo-600 w-5 text-center mr-1">
                                {dashboardCount}
                              </span>
                              <input
                                type="range"
                                min="1"
                                max={Math.max(10, availableDashboards.length)}
                                value={dashboardCount}
                                onChange={(e) => {
                                  const count = parseInt(e.target.value);
                                  setDashboardCount(count);
                                  handleSendRangeValue(count);
                                }}
                                className="w-24 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer mr-3"
                              />
                              <button
                                onClick={handleCreate}
                                className="py-1 px-3 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:bg-gray-400"
                                disabled={selectedRolesForThreshold.length === 0 || isLoading}
                              >
                                {isLoading ? "Creating..." : "Create"}
                              </button>
                            </div>
                            <div className="flex items-center border-l pl-4 ml-1">
                              <span className="text-sm text-gray-600 mr-2">
                                {useRatings ? 'Ratings (0-10)' : 'Importance (0-100%)'}
                              </span>
                              <button 
                                onClick={() => setUseRatings(!useRatings)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full ${useRatings ? 'bg-blue-600' : 'bg-gray-300'}`}
                              >
                                <span 
                                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${useRatings ? 'translate-x-6' : 'translate-x-1'}`} 
                                />
                              </button>
                            </div>
                            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-gray-500 hover:text-gray-700">
                              <Settings size={20} />
                            </button>
                          </div>
                        </div>

                        {renderDashboardTabs()}
                        {renderDashboardContent()}
                      </div>
                    </div>
                  )}

                  {!showProjectdashboard && (
                    <div className="flex justify-center items-center h-64 text-gray-400">
                      Select a role and click "Create" to generate your dashboard
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}