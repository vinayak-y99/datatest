//This file is a part of view Threshold
"use client";
import React, { useState, useEffect } from "react";
import Sidebar from "./sidebarView";
import RightSidebar from './rightsidebar';
import Link from 'next/link';
import { FaCheckCircle, FaHourglassHalf, FaUserTie, FaChartBar, FaChartPie, FaStar, FaArrowUp, FaBars, FaSort } from 'react-icons/fa';

// Fixed KeySkillsWaterfall component based on the FixedWaterfallChart implementation
const KeySkillsWaterfall = ({ skills: initialSkills, onMinimize, onUpdate, viewOnly }) => {
  // Process skills data for waterfall visualization
  const processSkills = (skillsData) => {
    if (!skillsData || !Array.isArray(skillsData) || skillsData.length === 0) {
      // Default skills if none provided
      return [
        { name: "Prod A", importance: 62, color: "bg-blue-400" },
        { name: "Prod B", importance: 12, color: "bg-red-400" },
        { name: "Prod C", importance: 12, color: "bg-green-400" },
        { name: "Prod D", importance: 10, color: "bg-yellow-400" },
        { name: "Other", importance: 4, color: "bg-gray-400" }
      ].sort((a, b) => b.importance - a.importance);
    }

    // Define color classes for skills
    const colorClasses = [
      "bg-blue-400", 
      "bg-red-400",
      "bg-green-400", 
      "bg-yellow-400",
      "bg-purple-400",
      "bg-indigo-400",
      "bg-pink-400",
      "bg-sky-400"
    ];

    // Process and sort skills by importance
    return skillsData
      .map((skill, index) => ({
        ...skill,
        color: colorClasses[index % colorClasses.length]
      }))
      .sort((a, b) => b.importance - a.importance);
  };

  const sortedSkills = processSkills(initialSkills);

  // Animation states
  // 0=initial, 1=growing segmented line, 2=fully grown line, 3=breaking down to rows
  const [animationStage, setAnimationStage] = useState(0);
  const [growProgress, setGrowProgress] = useState(0);
  const [breakdownProgress, setBreakdownProgress] = useState(0);
  const [visibleSkills, setVisibleSkills] = useState([]);
  
  // Calculate cumulative positions for skills
  const positionedSkills = (() => {
    let runningTotal = 0;
    return sortedSkills.map(skill => {
      const startPos = runningTotal;
      runningTotal += skill.importance;
      return {
        ...skill,
        startPos,
        endPos: runningTotal
      };
    });
  })();

  // Animation sequence
  useEffect(() => {
    // Reset animation
    setAnimationStage(0);
    setGrowProgress(0);
    setBreakdownProgress(0);
    setVisibleSkills([]);
    
    // Start growing the segmented line
    setAnimationStage(1);
    
    // Animate line growth from 0 to 100%
    const growDuration = 1500; // 1.5 seconds
    const growFrames = 60; // 60 steps
    const growInterval = growDuration / growFrames;
    let currentGrowth = 0;
    
    const growthAnimation = setInterval(() => {
      currentGrowth += (100 / growFrames);
      if (currentGrowth >= 100) {
        currentGrowth = 100;
        clearInterval(growthAnimation);
        
        // Line is fully grown
        setAnimationStage(2);
        
        // Wait briefly before breaking into rows
        setTimeout(() => {
          setAnimationStage(3);
          
          // Start breakdown animation
          const breakdownDuration = 1200; // 1.2 seconds
          const breakdownFrames = 60; // 60 steps
          const breakdownInterval = breakdownDuration / breakdownFrames;
          let currentBreakdown = 0;
          
          const breakdownAnimation = setInterval(() => {
            currentBreakdown += (100 / breakdownFrames);
            if (currentBreakdown >= 100) {
              currentBreakdown = 100;
              clearInterval(breakdownAnimation);
              
              // After breakdown is complete, show details
              let currentDelay = 300;
              positionedSkills.forEach((skill, index) => {
                setTimeout(() => {
                  setVisibleSkills(prev => [...prev, skill]);
                }, currentDelay);
                currentDelay += 200; // Stagger each skill info animation
              });
            }
            setBreakdownProgress(currentBreakdown);
          }, breakdownInterval);
          
        }, 500);
      }
      setGrowProgress(currentGrowth);
    }, growInterval);
    
    return () => {
      clearInterval(growthAnimation);
    };
  }, [initialSkills]);

  const restartAnimation = () => {
    // Clear everything
    setAnimationStage(0);
    setGrowProgress(0);
    setBreakdownProgress(0);
    setVisibleSkills([]);
    
    // Start new animation after a brief delay
    setTimeout(() => {
      // Start new growth animation
      setAnimationStage(1);
      
      const growDuration = 1500;
      const growFrames = 60;
      const growInterval = growDuration / growFrames;
      let currentGrowth = 0;
      
      const growthAnimation = setInterval(() => {
        currentGrowth += (100 / growFrames);
        if (currentGrowth >= 100) {
          currentGrowth = 100;
          clearInterval(growthAnimation);
          setAnimationStage(2);
          
          setTimeout(() => {
            setAnimationStage(3);
            
            // Start breakdown animation
            const breakdownDuration = 1200;
            const breakdownFrames = 60;
            const breakdownInterval = breakdownDuration / breakdownFrames;
            let currentBreakdown = 0;
            
            const breakdownAnimation = setInterval(() => {
              currentBreakdown += (100 / breakdownFrames);
              if (currentBreakdown >= 100) {
                currentBreakdown = 100;
                clearInterval(breakdownAnimation);
                
                // After breakdown is complete, show details
                let currentDelay = 300;
                positionedSkills.forEach((skill, index) => {
                  setTimeout(() => {
                    setVisibleSkills(prev => [...prev, skill]);
                  }, currentDelay);
                  currentDelay += 200;
                });
              }
              setBreakdownProgress(currentBreakdown);
            }, breakdownInterval);
            
          }, 500);
        }
        setGrowProgress(currentGrowth);
      }, growInterval);
    }, 300);
  };

  // Enhanced style for better visual appeal
  const lineHeight = '3px'; // Thicker line for better visibility
  const glowStyle = (color) => `0 0 8px 2px ${color.replace('bg-', 'rgba(').replace('400', '1, 0.6)')}`;

  // Calculate vertical positions for animation with more spacing
  const calculateVerticalOffset = (index) => {
    if (animationStage < 3) return 0;
    
    const baseOffset = 50; // Increased spacing between rows
    const spacing = index * baseOffset;
    const progressOffset = (breakdownProgress / 100) * spacing;
    return progressOffset;
  };

  // Define keyframe animation for stronger glow pulse effect
  const glowKeyframes = `
    @keyframes enhancedGlow {
      0% { filter: drop-shadow(0 0 2px rgba(0,0,0,0.1)); }
      50% { filter: drop-shadow(0 0 10px var(--glow-color)); }
      100% { filter: drop-shadow(0 0 2px rgba(0,0,0,0.1)); }
    }
  `;

  return (
    <div className="bg-white p-5 rounded-lg shadow-lg border border-gray-100">
      <style>{glowKeyframes}</style>
      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-2">
          {!viewOnly && (
            <button onClick={onUpdate} className="text-blue-500 hover:text-blue-700 font-medium">Update</button>
          )}
        </div>
      </div>

      <div className="p-3">
        {/* Segmented line at the top - visible only in stages 1-2 */}
        {(animationStage <= 2) && (
          <div className="mb-20 transition-all duration-500">
            <div className="w-full bg-gray-200 rounded-full h-1 relative">
              {positionedSkills.map((skill, index) => (
                <div 
                  key={index}
                  className={`${skill.color} rounded-full absolute top-0 transition-all duration-300 ease-out`}
                  style={{
                    left: `${skill.startPos}%`,
                    width: `${Math.min(skill.importance, (growProgress - skill.startPos > 0 ? growProgress - skill.startPos : 0))}%`,
                    maxWidth: `${skill.importance}%`,
                    height: '2px',
                    boxShadow: glowStyle(skill.color),
                    '--glow-color': skill.color.replace('bg-', 'rgba(').replace('400', '1, 0.6)'),
                    animation: growProgress >= skill.startPos ? 'enhancedGlow 3s infinite alternate' : 'none'
                  }}
                />
              ))}
            </div>
          </div>
        )}
        
        {/* Transition elements that animate from the top line to individual rows */}
        {animationStage === 3 && (
          <div className="relative" style={{ height: `${calculateVerticalOffset(positionedSkills.length) + 100}px` }}>
            {/* Container for the transitioning lines */}
            <div className="w-full bg-gray-200 rounded-full h-1 mb-6 relative">
              {positionedSkills.map((skill, index) => {
                const verticalOffset = calculateVerticalOffset(index);
                const isVisible = visibleSkills.some(s => s.name === skill.name);
                
                return (
                  <React.Fragment key={index}>
                    {/* Colored segment that moves downward */}
                    <div 
                      className={`${skill.color} rounded-full absolute transition-all duration-500 ease-in-out`}
                      style={{
                        left: `${skill.startPos}%`,
                        top: `${verticalOffset}px`,
                        width: `${skill.importance}%`,
                        height: '2px',
                        boxShadow: glowStyle(skill.color),
                        '--glow-color': skill.color.replace('bg-', 'rgba(').replace('400', '1, 0.6)'),
                        animation: 'enhancedGlow 3s infinite alternate',
                        opacity: 1,
                        zIndex: positionedSkills.length - index
                      }}
                    />
                    
                    {/* Background line that fades in at row position */}
                    {breakdownProgress > 50 && (
                      <div 
                        className="bg-gray-200 rounded-full absolute transition-opacity duration-500"
                        style={{
                          left: '0%',
                          top: `${verticalOffset}px`,
                          width: '100%',
                          height: '2px',
                          opacity: breakdownProgress > 50 ? (breakdownProgress - 50) / 50 : 0
                        }}
                      />
                    )}
                    
                    {/* Text labels that fade in only after completion */}
                    {breakdownProgress > 80 && (
                      <div 
                        className="absolute transition-opacity duration-300 flex justify-between w-full"
                        style={{
                          top: `${verticalOffset - 28}px`,
                          opacity: isVisible ? 1 : 0
                        }}
                      >
                        <span className="text-base font-medium text-gray-800">{skill.name}</span>
                        <span className="text-base text-gray-700 font-medium">
                          {isVisible ? `${Math.round(skill.importance)}%` : ''}
                        </span>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
            
            {/* Scale markers that fade during transition */}
            <div 
              className="flex justify-between text-xs text-gray-500 mt-2 transition-opacity duration-1000"
              style={{ opacity: 1 - (breakdownProgress / 100) }}
            >
            </div>
            
            {/* New scale markers that fade in at bottom */}
            {breakdownProgress > 80 && (
              <div 
                className="flex justify-between text-xs text-gray-500 transition-opacity duration-500 absolute left-0 right-0"
                style={{ 
                  bottom: 0, 
                  opacity: (breakdownProgress - 80) / 20
                }}
              >
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Sample Prompts Component
const SamplePrompts = ({ prompts }) => {
  if (!prompts ||!Array.isArray(prompts) || prompts.length === 0) {
    return null;
  }
};

// Placeholder components for the dashboard items
// Modify the ThresholdScore component (and do the same for all other components)
const ThresholdScore = ({ onMinimize, onUpdate, viewOnly }) => (
  <div className="bg-white p-4 rounded-lg shadow">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-semibold">Threshold Score</h3>
      <div className="flex space-x-2">
        {!viewOnly && (
        <button onClick={onUpdate} className="text-blue-500 hover:text-blue-700">Update</button>
        )}
        <button onClick={onMinimize} className="text-gray-500 hover:text-gray-700">Minimize</button>
      </div>
    </div>
    <div>Threshold Score Content</div>
  </div>
);

const JobDescription = ({ onMinimize, onUpdate, viewOnly }) => (
  <div className="bg-white p-4 rounded-lg shadow">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-semibold">Job Description</h3>
      <div className="flex space-x-2">
        {!viewOnly && (
        <button onClick={onUpdate} className="text-blue-500 hover:text-blue-700">Update</button>
        )}
        <button onClick={onMinimize} className="text-gray-500 hover:text-gray-700">Minimize</button>
      </div>
    </div>
    <div>Job Description Content</div>
  </div>
);

const Resume = ({ onMinimize, onUpdate, viewOnly }) => (
  <div className="bg-white p-4 rounded-lg shadow">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-semibold">Resume</h3>
      <div className="flex space-x-2">
        {!viewOnly && (
        <button onClick={onUpdate} className="text-blue-500 hover:text-blue-700">Update</button>
        )}
        <button onClick={onMinimize} className="text-gray-500 hover:text-gray-700">Minimize</button>
      </div>
    </div>
    <div>Resume Content</div>
  </div>
);

const CommunicationSkills = ({ onMinimize, onUpdate, viewOnly }) => (
  <div className="bg-white p-4 rounded-lg shadow">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-semibold">Communication Skills</h3>
      <div className="flex space-x-2">
        {!viewOnly && (
        <button onClick={onUpdate} className="text-blue-500 hover:text-blue-700">Update</button>
        )}
        <button onClick={onMinimize} className="text-gray-500 hover:text-gray-700">Minimize</button>
      </div>
    </div>
    <div>Communication Skills Content</div>
  </div>
);

const Coding = ({ onMinimize, onUpdate, viewOnly }) => (
  <div className="bg-white p-4 rounded-lg shadow">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-semibold">Coding</h3>
      <div className="flex space-x-2">
        {!viewOnly && (
        <button onClick={onUpdate} className="text-blue-500 hover:text-blue-700">Update</button>
        )}
        <button onClick={onMinimize} className="text-gray-500 hover:text-gray-700">Minimize</button>
      </div>
    </div>
    <div>Coding Content</div>
  </div>
);

const BehaviouralSkills = ({ onMinimize, onUpdate, viewOnly }) => (
  <div className="bg-white p-4 rounded-lg shadow">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-semibold">Behavioural Skills</h3>
      <div className="flex space-x-2">
        {!viewOnly && (
        <button onClick={onUpdate} className="text-blue-500 hover:text-blue-700">Update</button>
        )}
        <button onClick={onMinimize} className="text-gray-500 hover:text-gray-700">Minimize</button>
      </div>
    </div>
    <div>Behavioural Skills Content</div>
  </div>
);

const CommonDashboard = ({ onMinimize, onUpdate, viewOnly }) => (
  <div className="bg-white p-4 rounded-lg shadow">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-semibold">Common Dashboard</h3>
      <div className="flex space-x-2">
        {!viewOnly && (
        <button onClick={onUpdate} className="text-blue-500 hover:text-blue-700">Update</button>
        )}
        <button onClick={onMinimize} className="text-gray-500 hover:text-gray-700">Minimize</button>
      </div>
    </div>
    <div>Common Dashboard Content</div>
  </div>
);

const HRSystem = ({ onMinimize, onUpdate, viewOnly }) => (
  <div className="bg-white p-4 rounded-lg shadow">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-semibold">HR System</h3>
      <div className="flex space-x-2">
        {!viewOnly && (
        <button onClick={onUpdate} className="text-blue-500 hover:text-blue-700">Update</button>
        )}
        <button onClick={onMinimize} className="text-gray-500 hover:text-gray-700">Minimize</button>
      </div>
    </div>
    <div>HR System Content</div>
  </div>
);

export default function Threshold({ jdData = {}, jdId, thresholdId, onDataChange, onClose, viewOnly = false }) {
  // Debug the incoming props
  console.log('Threshold component received jdData:', jdData);
  console.log('Threshold component props - jdId:', jdId, 'thresholdId:', thresholdId);
  console.log('Sample prompts received in Threshold:', jdData?.apiResponse?.selected_prompts);

  // State for tracking whether we've fetched custom prompts
  const [hasLoadedCustomPrompts, setHasLoadedCustomPrompts] = useState(false);

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
    
  // Define all the update handler functions at the component level
    const handleUpdateThreshold = () => {
      console.log("Updating Threshold Score");
      // Add your update logic here
    };
  
    const handleUpdateJobDescription = () => {
      console.log("Updating Job Description");
      // Add your update logic here
    };
  
    const handleUpdateResume = () => {
      console.log("Updating Resume");
      // Add your update logic here
    };
  
    const handleUpdateCommunicationSkills = () => {
      console.log("Updating Communication Skills");
      // Add your update logic here
    };
  
    const handleUpdateCoding = () => {
      console.log("Updating Coding");
      // Add your update logic here
    };
  
    const handleUpdateBehaviouralSkills = () => {
      console.log("Updating Behavioural Skills");
      // Add your update logic here
    };
  
    const handleUpdateCommonDashboard = () => {
      console.log("Updating Common Dashboard");
      // Add your update logic here
    };

    const handleUpdateHRSystem = () => {
      console.log("Updating HR System");
      // Add your update logic here
    };

  const [selectedRoles, setSelectedRoles] = useState([]);
  const [dashboardData, setDashboardData] = useState([]);
  const [showThreshold, setShowThreshold] = useState(true);
  const [showJobDescription, setShowJobDescription] = useState(true);
  const [showResume, setShowResume] = useState(true);
  const [showCommunicationSkills, setShowCommunicationSkills] = useState(true);
  const [showCoding, setShowCoding] = useState(true);
  const [showBehaviouralSkills, setShowBehaviouralSkills] = useState(true);
  const [showCommondashBoard, setShowCommondashBoard] = useState(true);
  const [showHrSystem, setShowHrSystem] = useState(true);
  const [ViewItems, setViewItems] = useState([]);
  const [showProjectdashboard, setShowDashboard] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [candidates, setCandidates] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [chatMessages, setChatMessages] = useState([]);

  const [timelineData, setTimelineData] = useState([
    {
      id: 1,
      candidate: "John Doe",
      stages: [
        { stage: "Applied", date: "2024-01-15", status: "completed" },
        { stage: "Screening", date: "2024-01-16", status: "completed" },
        { stage: "Technical", date: "2024-01-18", status: "current" },
        { stage: "HR Round", date: "", status: "pending" },
        { stage: "Offer", date: "", status: "pending" }
      ]
    },
  ]);

  const [thresholdScores, setThresholdScores] = useState({
    selection: 0,
    rejection: 0
  });

  const [sharedValue, setSharedValue] = useState(null);
  const [selectedRolesForThreshold, setSelectedRolesForThreshold] = useState([]);

  // Add this new state for key skills
  const [showKeySkills, setShowKeySkills] = useState(true);

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
      
      console.log('Updated sample prompts from jdData:', jdData.apiResponse.selected_prompts);
    }
  }, [jdData]);

  // Add a useEffect to fetch sample prompts specific to this threshold ID
  useEffect(() => {
    // Only fetch if we have a threshold ID and haven't loaded custom prompts yet
    if (thresholdId && !hasLoadedCustomPrompts) {
      const fetchCustomPrompts = async () => {
        try {
          console.log(`Fetching custom prompts for threshold ID: ${thresholdId}`);
          
          const response = await fetch('/api/jd/sample-prompts', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              threshold_id: parseInt(thresholdId)
            }),
          });
          
          if (!response.ok) {
            throw new Error(`Failed to fetch custom prompts: ${response.status}`);
          }
          
          const data = await response.json();
          console.log('Received custom prompts:', data);
          
          // Check if we got custom prompts and update state
          if (data.sample_prompts) {
            setSamplePrompts(data.sample_prompts);
            
            // If we're using the onDataChange callback, also update parent component
            if (onDataChange) {
              onDataChange({
                selected_prompts: data.sample_prompts
              });
            }
            
            // Mark that we've loaded custom prompts
            setHasLoadedCustomPrompts(true);
          }
        } catch (error) {
          console.error('Error fetching custom prompts:', error);
        }
      };
      
      fetchCustomPrompts();
    }
  }, [thresholdId, hasLoadedCustomPrompts, onDataChange]);

  const handleSelectedRoles = (roles) => {
    // console.log("Page received selected roles:", roles);
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

  const handleShowThreshold = () => {
    setShowThreshold(true);
    const filtered = ViewItems.filter((item) => item !== "threshold");
    setViewItems(filtered);
  };

  const handleShowJobDescription = () => {
    setShowJobDescription(true);
    const filtered = ViewItems.filter((item) => item !== "job-description");
    setViewItems(filtered);
  };

  const handleShowResume = () => {
    setShowResume(true);
    const filtered = ViewItems.filter((item) => item !== "resume");
    setViewItems(filtered);
  };

  const handleShowCommunicationSkills = () => {
    setShowCommunicationSkills(true);
    const filtered = ViewItems.filter((item) => item !== "communication-skills");
    setViewItems(filtered);
  };

  const handleShowCoding = () => {
    setShowCoding(true);
    const filtered = ViewItems.filter((item) => item !== "coding");
    setViewItems(filtered);
  };

  const handleShowBehaviouralSkills = () => {
    setShowBehaviouralSkills(true);
    const filtered = ViewItems.filter((item) => item !== "Behavioural-skills");
    setViewItems(filtered);
  };

  const handleShowCommondashBoard = () => {
    setShowCommondashBoard(true);
    const filtered = ViewItems.filter((item) => item !== "commondashboard");
    setViewItems(filtered);
  };

  const handleShowHrSystem = () => {
    setShowHrSystem(true);
    const filtered = ViewItems.filter((item) => item !== "HrSystem");
    setViewItems(filtered);
  };

  const handleFileUploadSuccess = (data) => {
    console.log("File upload success with data:", data);
    setRoles(data.roles || []);
    setSkillsData(data.skills_data || {});
    setSamplePrompts(data.selected_prompts || "");
    console.log("Setting sample prompts to:", data.selected_prompts);
    setSelectedRolesForThreshold([]);
  };

  const handleCreate = () => {
    console.log("Creating dashboard with roles:", selectedRolesForThreshold);
    console.log("Skills data available:", skillsData);
    console.log("Sample prompts available:", samplePrompts);
    setShowDashboard(true);
    setIsSidebarOpen(false);
    // Pass complete data to RightSidebar
    if (showProjectdashboard) {
      return (
        <RightSidebar
          selectedRoles={selectedRolesForThreshold}
          skills_data={skillsData}
          rangeValue={sharedValue}
          jobId={jdData?.jdId}
        />
      );
    }
  };

  // Helper function to check if we have dashboard data to display
  const hasDashboardData = () => {
    if (!jdData?.apiResponse?.skills_data) return false;
    const skills_data = jdData.apiResponse.skills_data;
    
    // Check if we actually have data to display
    if (typeof skills_data === 'object' && Object.keys(skills_data).length > 0) {
      // Check first role
      const firstRole = Object.keys(skills_data)[0];
      return Object.keys(skills_data[firstRole] || {}).length > 0;
    }
    
    return false;
  };

  // For view-only mode with real data
  const renderDashboards = () => {
    if (!jdData?.apiResponse?.skills_data) {
      return (
        <div className="flex items-center justify-center h-64 bg-white rounded-lg shadow-md">
          <p className="text-gray-500">No dashboard data available</p>
        </div>
      );
    }

    const skills_data = jdData.apiResponse.skills_data;
    const dashboards = [];
    
    // If skills_data is empty, show message
    if (typeof skills_data !== 'object' || Object.keys(skills_data).length === 0) {
      return (
        <div className="flex items-center justify-center h-64 bg-white rounded-lg shadow-md">
          <p className="text-gray-500">No dashboard data found</p>
        </div>
      );
    }

    // Get the first role
    const roleKey = Object.keys(skills_data)[0];
    const roleData = skills_data[roleKey];
    
    // Define dashboard header style variations for visual appeal
    const headerStyles = [
      { bg: "bg-gradient-to-r from-blue-500 to-blue-600", icon: "📊" },
      { bg: "bg-gradient-to-r from-emerald-500 to-emerald-600", icon: "📈" },
      { bg: "bg-gradient-to-r from-violet-500 to-violet-600", icon: "🔍" },
      { bg: "bg-gradient-to-r from-amber-500 to-amber-600", icon: "🎯" },
      { bg: "bg-gradient-to-r from-rose-500 to-rose-600", icon: "⚙️" },
      { bg: "bg-gradient-to-r from-cyan-500 to-cyan-600", icon: "💡" },
      { bg: "bg-gradient-to-r from-indigo-500 to-indigo-600", icon: "🧩" },
    ];
    
    // Render each category as KeySkillsWaterfall
    let dashboardCounter = 1;
    for (const category in roleData) {
      const items = roleData[category];
      
      // Skip empty categories
      if (!items || Object.keys(items).length === 0) {
        dashboardCounter++;
        continue;
      }
      
      // Get style for this dashboard
      const style = headerStyles[(dashboardCounter - 1) % headerStyles.length];
      
      // Transform skills data for KeySkillsWaterfall
      const skillsForComponent = Object.entries(items).map(([name, data]) => ({
        name,
        importance: data.importance || 0
      }));
      
      // Add dashboard to list with sophisticated styling
      dashboards.push(
        <div key={category} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 mb-8 overflow-hidden">
          <div className={`${style.bg} text-white p-4`}>
            <div className="flex items-center">
              <span className="text-xl mr-2">{style.icon}</span>
              <h3 className="text-lg font-bold">{formatCategoryName(category)}</h3>
            </div>
            <div className="text-xs text-white/80 mt-1">
              {Object.keys(items).length} skills • Dashboard #{dashboardCounter}
            </div>
          </div>
          <KeySkillsWaterfall
            skills={skillsForComponent}
            onMinimize={() => {}}
            onUpdate={() => {}}
            viewOnly={true}
          />
        </div>
      );
      
      dashboardCounter++;
    }

    return dashboards;
  };

  // Add this handler for key skills component
  const handleShowKeySkills = () => {
    setShowKeySkills(true);
    const filtered = ViewItems.filter((item) => item !== "key-skills");
    setViewItems(filtered);
  };
  
  const handleUpdateKeySkills = () => {
    console.log("Updating Key Skills");
    // Add your update logic here
  };
  
  // Sample skills data (you can replace this with real data from your API)
  const sampleSkills = [
    { name: "Programming", importance: 35 },
    { name: "Communication", importance: 20 },
    { name: "Problem Solving", importance: 15 },
    { name: "Frontend", importance: 12 },
    { name: "Backend", importance: 10 },
    { name: "DevOps", importance: 8 },
    { name: "Data Analysis", importance: 7 },
    { name: "UX/UI Design", importance: 6 },
    { name: "Testing", importance: 5 },
    { name: "Documentation", importance: 4 }
  ];

  // Helper function to format category names to a more professional style
  const formatCategoryName = (category) => {
    if (!category) return '';
    
    // Remove any quotes and underscores
    const cleaned = category.replace(/["']/g, '').replace(/_/g, ' ');
    
    // Capitalize first letter of each word
    return cleaned
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Left sidebar - Always show it */}
      <div className={`w-64 transition-all duration-300 ${isSidebarOpen ? 'mr-0' : '-ml-64'} bg-white border-r border-gray-200 shadow-md`}>
                    <Sidebar
                      roles={roles}
                      skills_data={skillsData}
                      samplePrompts={samplePrompts}
                      sendRangeValue={handleSendRangeValue}
                      onCreate={handleCreate}
          sendSelectedRoles={handleSelectedRoles}
          onRoleSelect={handleRoleSelection}
          onDashboardUpdate={handleDashboardUpdate}
          viewOnly={viewOnly}
                    />
                  </div>

      {/* Main content */}
      <div className="flex-1 transition-all duration-300">
        {/* Toggle sidebar button */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="fixed left-0 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-r shadow-md z-10 hover:bg-gray-100"
        >
          {isSidebarOpen ? '<' : '>'}
        </button>

        <div className="container mx-auto py-8 px-4">
          {viewOnly ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {renderDashboards()}
                </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Only render components that are toggled to show */}
              {showThreshold && (
                <ThresholdScore
                  onMinimize={handleShowThreshold}
                  onUpdate={handleUpdateThreshold}
                  viewOnly={viewOnly}
                />
              )}
              
              {showJobDescription && (
                <JobDescription
                  onMinimize={handleShowJobDescription}
                  onUpdate={handleUpdateJobDescription}
                  viewOnly={viewOnly}
                />
              )}
              
              {showResume && (
                <Resume
                  onMinimize={handleShowResume}
                  onUpdate={handleUpdateResume}
                  viewOnly={viewOnly}
                />
              )}
              
              {showKeySkills && (
                <KeySkillsWaterfall
                  skills={sampleSkills}
                  onMinimize={handleShowKeySkills}
                  onUpdate={handleUpdateKeySkills}
                  viewOnly={viewOnly}
                />
              )}
              
              {showCommunicationSkills && (
                <CommunicationSkills
                  onMinimize={handleShowCommunicationSkills}
                  onUpdate={handleUpdateCommunicationSkills}
                  viewOnly={viewOnly}
                />
              )}
              
              {showCoding && (
                <Coding
                  onMinimize={handleShowCoding}
                  onUpdate={handleUpdateCoding}
                  viewOnly={viewOnly}
                />
              )}
              
              {showBehaviouralSkills && (
                <BehaviouralSkills
                  onMinimize={handleShowBehaviouralSkills}
                  onUpdate={handleUpdateBehaviouralSkills}
                  viewOnly={viewOnly}
                />
              )}
              
              {showCommondashBoard && (
                <CommonDashboard
                  onMinimize={handleShowCommondashBoard}
                  onUpdate={handleUpdateCommonDashboard}
                  viewOnly={viewOnly}
                />
              )}
              
              {showHrSystem && (
                <HRSystem
                  onMinimize={handleShowHrSystem}
                  onUpdate={handleUpdateHRSystem}
                  viewOnly={viewOnly}
                />
                  )}
                </div>
          )}
              </div>
            </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "100%",
    padding: "20px",
    borderRadius: "8px",
    fontFamily: "Arial, sans-serif",
  },
  section: {
    marginTop: "0px",
  },
  subheading: {
    fontSize: "18px",
    fontWeight: "bold",
    marginBottom: "8px",
  },
  list: {
    padding: "0",
    listStyle: "none",
  },
  listItem: {
    padding: "8px",
    backgroundColor: "#f4f4f4",
    borderRadius: "5px",
    marginBottom: "5px",
  },
  chatBox: {
    height: "100px",
    overflowY: "auto",
    backgroundColor: "#f9f9f9",
    padding: "5px",
    borderRadius: "5px",
    border: "1px solid #ddd",
  },
  chatMessage: {
    backgroundColor: "#fff",
    padding: "5px",
    borderRadius: "5px",
    marginBottom: "3px",
  },
  input: {
    flex: "1",
    padding: "8px",
    border: "1px solid #ddd",
    borderRadius: "5px",
  },
  button: {
    marginLeft: "10px",
    padding: "8px 12px",
    backgroundColor: "#007BFF",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  notifyButton: {
    padding: "8px 12px",
    backgroundColor: "#28a745",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  timeline: {
    border: '1px solid #ddd',
    borderRadius: '5px',
    padding: '10px',
  },
  timelineEvent: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px',
    borderBottom: '1px solid #eee',
  },
  auditLog: {
    maxHeight: '200px',
    overflowY: 'auto',
    border: '1px solid #ddd',
    borderRadius: '5px',
  },
  compliance: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  complianceItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  timelineContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: '10px',
    padding: '20px',
    marginBottom: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  candidateName: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '15px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  userIcon: {
    color: '#2196F3',
  },
  timeline: {
    display: 'flex',
    justifyContent: 'space-between',
    position: 'relative',
    padding: '20px 0',
  },
  timelineStage: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    position: 'relative',
    flex: 1,
  },
  stageConnector: {
    position: 'absolute',
    top: '25px',
    left: '-50%',
    right: '50%',
    height: '2px',
    backgroundColor: '#e0e0e0',
    zIndex: 1,
  },
  stageNode: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    zIndex: 2,
    transition: 'all 0.3s ease',
  },
  stageInfo: {
    textAlign: 'center',
    marginTop: '10px',
  },
  stageName: {
    fontWeight: 'bold',
    fontSize: '14px',
    color: '#333',
  },
  stageDate: {
    fontSize: '12px',
    color: '#666',
    marginTop: '4px',
  }
};