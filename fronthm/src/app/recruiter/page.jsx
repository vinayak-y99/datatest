'use client';
import React, { useState, useEffect, useRef } from 'react';
import { 
  FaSuitcase, FaRegFileAlt, FaUserTie, 
  FaBalanceScale, FaUserFriends, FaSitemap,
  FaEllipsisV, FaChevronDown, FaChevronUp,
  FaCompress, FaExpand, FaTimes, FaChartBar
} from 'react-icons/fa';

import JobDescriptions from '../components/JobDescriptions_rec';
import CandidateEvaluation from './CandidateEvaluation';
import ScoringFeedback from './ScoringFeedback';
import DecisionMakingReporting from './DecisionMakingReporting';
import RecruitmentCollaboration from './RecruitmentCollaboration';
import WorkflowTracking from './WorkflowTracking';

const Page = () => {
  const [activeSection, setActiveSection] = useState(0);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isLoading] = useState(false);
  const [drawerWidth, setDrawerWidth] = useState(400); // Default drawer width
  const [isDragging, setIsDragging] = useState(false);
  const [isFullWidth, setIsFullWidth] = useState(false);
  const [previousWidth, setPreviousWidth] = useState(400);
  
  // Create a shared instance of ScoringFeedback to ensure same data
  const scoringFeedbackComponent = <ScoringFeedback />;
  const drawerRef = useRef(null);
  const resizeHandleRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        // Calculate new width based on mouse position
        const newWidth = window.innerWidth - e.clientX;
        // Set minimum and maximum width constraints
        if (newWidth >= 300 && newWidth <= window.innerWidth * 0.8) {
          setDrawerWidth(newWidth);
        }
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'ew-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const handleResizeStart = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const toggleFullWidth = () => {
    if (!isFullWidth) {
      setPreviousWidth(drawerWidth);
      setDrawerWidth(window.innerWidth * 0.9);
      setIsFullWidth(true);
    } else {
      setDrawerWidth(previousWidth);
      setIsFullWidth(false);
    }
  };

  {isLoading && (
    <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  )}
  
  const components = [
    {
      id: 'Dashboard',
      label: 'Dashboard',
      icon: <FaChartBar className="text-green-600" />,
      component: <CandidateEvaluation />
    },
    {
      id: 'ThresholdJD',
      label: 'Threshold & JD',
      icon: <FaSuitcase className="text-blue-600" />,
      component: <JobDescriptions />
    },
    {
      id: 'Scoring',
      label: 'Scoring',
      icon: <FaUserTie className="text-red-600" />,
      component: scoringFeedbackComponent
    },
    {
      id: 'DecisionMaking',
      label: 'Decision Making',
      icon: <FaBalanceScale className="text-cyan-600" />,
      component: <DecisionMakingReporting />
    },
    {
      id: 'Collaboration',
      label: 'Collaboration',
      icon: <FaUserFriends className="text-amber-600" />,
      component: <RecruitmentCollaboration />
    },
    {
      id: 'Workflow',
      label: 'Workflow',
      icon: <FaSitemap className="text-pink-600" />,
      component: <WorkflowTracking />
    }
  ];

  const handleExpandCollapse = () => {
    setIsExpanded(!isExpanded);
  };

  const handleTabClick = (index) => {
    // Special handling for Scoring Feedback (index 2)
    if (index === 2) {
      openDrawerWithComponent(index);
    } else {
      setActiveSection(index);
      // Close the drawer if it was open
      if (drawerOpen) {
        closeDrawer();
      }
    }
  };

  const openDrawerWithComponent = (index) => {
    setSelectedComponent(index);
    setDrawerOpen(true);
    const drawer = document.getElementById('drawer-navigation');
    if (drawer) {
      drawer.style.display = 'block';
    }
  };
  
  const closeDrawer = () => {
    setDrawerOpen(false);
    setSelectedComponent(null);
    const drawer = document.getElementById('drawer-navigation');
    if (drawer) {
      drawer.style.display = 'none';
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 w-full">
      {/* Enhanced Sticky Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200">
        <div className="flex items-center px-4 py-4 w-full max-w-[1920px] mx-auto md:px-6">
          {/* Recruiter Logo */}
          <div className="group flex items-center gap-2 bg-white/90 px-3 py-2 rounded-xl transition-all duration-300 border-blue-100 flex-shrink-0" style={{ maxWidth: "250px" }}>
            <div className="relative" style={{ width: "35px", height: "35px" }}>
              <div className="relative bg-gradient-to-r from-blue-50 to-purple-50 p-2 rounded-full">
                <FaUserTie className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform duration-300" />
              </div>
            </div>
            <div className="flex flex-col">
              <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent" style={{ fontSize: "18px", lineHeight: "normal" }}>
                Recruiter
              </h2>
              <span className="text-xs text-gray-600 font-medium hidden sm:block" style={{ fontSize: "9px", marginLeft: "6px" }}>
                Talent Acquisition Hub
              </span>
            </div>
          </div>

          {/* Component Tabs - Directly beside the Recruiter div */}
          <nav className="hidden md:flex items-center ml-4 bg-gray-50/50 p-2 rounded-xl border border-gray-100">
            {components.map((module, index) => (
              <button
                key={module.id}
                onClick={() => handleTabClick(index)}
                className={`relative flex items-center px-3 py-2 mx-1 rounded-lg transition-all duration-300 text-sm font-medium group ${
                  (activeSection === index || (drawerOpen && selectedComponent === index))
                    ? 'bg-white text-blue-700 shadow-md'
                    : 'bg-transparent text-gray-600 hover:bg-white/70 hover:text-gray-800'
                }`}
              >
                <div className={`mr-1.5 transition-transform duration-300 ${
                  (activeSection === index || (drawerOpen && selectedComponent === index)) ? 'scale-105' : 'group-hover:scale-105'
                }`}>
                  {module.icon}
                </div>
                <span className="relative z-10">{module.label}</span>
                {(activeSection === index || (drawerOpen && selectedComponent === index)) && (
                  <span className="absolute inset-0 bg-blue-100/20 rounded-lg -z-10" />
                )}
              </button>
            ))}
          </nav>

          {/* Mobile Menu Button - Pushed to the right */}
          <div className="ml-auto">
            <button
              className="md:hidden p-2"
              onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
            >
              <FaEllipsisV className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Collapse/Expand Button - Only visible on desktop */}
          <button 
            onClick={handleExpandCollapse}
            className="hidden md:block p-2 ml-4 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors"
          >
            {isExpanded ? <FaChevronUp size={16} /> : <FaChevronDown size={16} />}
          </button>
        </div>
      </header>

      {/* Mobile Navigation (only visible on small screens) */}
      <div className={`md:hidden ${isMobileNavOpen ? 'block' : 'hidden'} sticky top-[72px] z-20 bg-white/90 backdrop-blur-sm border-b border-gray-200 w-full`}>
        <div className="w-full max-w-[1920px] mx-auto px-4 py-3">
          <nav className="flex flex-col gap-2 bg-gray-50/50 p-2 rounded-xl border border-gray-100 shadow-lg">
            {components.map((module, index) => (
              <button
                key={module.id}
                onClick={() => handleTabClick(index)}
                className={`relative flex items-center px-3 py-2 rounded-lg transition-all duration-300 text-sm font-medium group w-full ${
                  (activeSection === index || (drawerOpen && selectedComponent === index))
                    ? 'bg-white text-blue-700 shadow-md'
                    : 'bg-transparent text-gray-600 hover:bg-white/70 hover:text-gray-800'
                }`}
              >
                <div className={`mr-1.5 transition-transform duration-300 ${
                  (activeSection === index || (drawerOpen && selectedComponent === index)) ? 'scale-105' : 'group-hover:scale-105'
                }`}>
                  {module.icon}
                </div>
                <span className="relative z-10">{module.label}</span>
                {(activeSection === index || (drawerOpen && selectedComponent === index)) && (
                  <span className="absolute inset-0 bg-blue-100/20 rounded-lg -z-10" />
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto w-full">
        <div className="w-full px-4 py-6 md:px-6 md:py-8 max-w-[1920px] mx-auto">
          {/* Module Content */}
          <div className="bg-white rounded-xl border border-gray-100 p-4 md:p-8 w-full">
            <div className="animate-fadeIn">
              {components[activeSection].component}
            </div>
          </div>
        </div>
      </div>

      {/* Resizable Drawer Navigation */}
      <div 
        id="drawer-navigation" 
        ref={drawerRef}
        className="fixed top-0 right-0 z-40 h-screen overflow-y-auto bg-white shadow-xl border-l border-gray-200 transition-all duration-300"
        style={{ 
          width: `${drawerWidth}px`, 
          display: 'none',
          paddingLeft: '12px',
          paddingRight: '12px'
        }}
        tabIndex="-1" 
        aria-labelledby="drawer-navigation-label"
      >
        {/* Resize handle */}
        <div 
          ref={resizeHandleRef}
          className="absolute top-0 left-0 w-2 h-full cursor-ew-resize bg-transparent hover:bg-gray-200 opacity-50 transition-colors"
          onMouseDown={handleResizeStart}
        ></div>
        
        {drawerOpen && selectedComponent !== null && (
          <div className="h-full flex flex-col">
            <div className="sticky top-0 bg-white z-10 flex items-center justify-between py-4 border-b border-gray-200">
              <div className="flex items-center">
                <div className="mr-2">
                  {components[selectedComponent].icon}
                </div>
                <h5 
                  id="drawer-navigation-label" 
                  className="text-base font-semibold text-gray-800"
                >
                  {components[selectedComponent].label}
                </h5>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  type="button"
                  onClick={toggleFullWidth}
                  className="text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded p-1.5 transition-colors"
                  title={isFullWidth ? "Compress" : "Expand"}
                >
                  {isFullWidth ? (
                    <FaCompress className="w-4 h-4" />
                  ) : (
                    <FaExpand className="w-4 h-4" />
                  )}
                </button>
                <button 
                  type="button" 
                  onClick={closeDrawer}
                  className="text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded p-1.5 transition-colors"
                  title="Close"
                >
                  <FaTimes className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="overflow-y-auto flex-grow pt-4 pb-20">
              {components[selectedComponent
                            ].component}
                            </div>
                          </div>
                        )}
                      </div>
                
                      {/* CSS */}
                      <style jsx>{`
                        @keyframes fadeIn {
                          from { opacity: 0; transform: translateY(10px); }
                          to { opacity: 1; transform: translateY(0); }
                        }
                        .animate-fadeIn {
                          animation: fadeIn 0.3s ease-out;
                        }
                        @media (max-width: 768px) {
                          .group {
                            max-width: 180px;
                          }
                        }
                      `}</style>
                    </div>
                  );
                };
                
                export default Page;
                
