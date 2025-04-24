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

export default function Threshold({ jdData = {} }) {
  // Debug the incoming jdData
  console.log('Threshold component received jdData:', jdData);
  console.log('Sample prompts received in Threshold:', jdData?.apiResponse?.selected_prompts);

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

  const handleCreate = () => {
    console.log("Creating dashboard with roles:", selectedRolesForThreshold);
    console.log("Skills data available:", skillsData);
    console.log("Sample prompts available:", samplePrompts);
    setShowDashboard(true);
    setIsSidebarOpen(false);
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
                          className="w-24 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-600"
                        />
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
    
    return renderSection(activeDashboard, roleData[activeDashboard]);
  };

    // Add this function inside the Threshold component
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
      roleData[activeDashboard][itemName].rating = parseFloat(newRating);
      setSkillsData(updatedSkillsData);
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
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-700">
                                Number of dashboards: 5
                              </span>
                              <input
                                type="range"
                                min="1"
                                max="10"
                                step="1"
                                defaultValue="5"
                                className="w-24 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                              />
                            </div>
                            <button 
                              className="bg-indigo-600 text-white py-1 px-3 rounded-md hover:bg-indigo-700 transition-colors text-sm"
                            >
                              Create Dashboards
                            </button>
                            <div className="flex items-center gap-2">
                              <span className="text-base text-gray-600">
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
                      Select a role and click "Create Dashboard" to get started
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