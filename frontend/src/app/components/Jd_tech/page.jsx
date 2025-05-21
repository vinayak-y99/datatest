"use client";
import React, { useState, useEffect } from "react";
import Sidebar from "./sidebar";
import RightSidebar from './rightsidebar';
import Link from 'next/link';

export default function CS({ jdId, selectedFile, onClose }) { // Updated props to match first snippet
  const [roles, setRoles] = useState([]);
  const [skillsData, setSkillsData] = useState([]);
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
  const [viewItems, setViewItems] = useState([]); // Fixed casing to match first snippet
  const [showProjectDashboard, setShowProjectDashboard] = useState(false); // Renamed to match first snippet
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [analysisData, setAnalysisData] = useState(null);
  const [sharedValue, setSharedValue] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(selectedFile);
  const [isPageVisible, setIsPageVisible] = useState(true);

  // Reset visibility and update file when jdId or selectedFile changes
  useEffect(() => {
    setIsPageVisible(true); // Reset visibility to true when a new JD is selected
    if (selectedFile) {
      setUploadedFile(selectedFile);
      handleAnalysisComplete({
        file: selectedFile,
        type: 'job-description' // Kept as job-description to reflect context
      });
    }
  }, [jdId, selectedFile]); // Updated dependencies to match props

  const handleAnalysisComplete = (data) => {
    console.log('Analysis data received in page:', data);
    setAnalysisData(data);
  };

  const handleSendRangeValue = (value) => {
    setSharedValue(value);
  };

  const handleSelectedRoles = (roles) => {
    setSelectedRoles(roles);
  };

  const handleCreate = () => {
    console.log('Creating dashboard with analysis data:', analysisData);
    setShowProjectDashboard(true);
    setIsSidebarOpen(false);
  };

  const handleClosePage = () => {
    setIsPageVisible(false); // Hide this page
    if (onClose) onClose(); // Notify parent to remove this component
  };

  // If the page is not visible, return null to remove it from the DOM
  if (!isPageVisible) {
    return null;
  }

  return (
    <div className="flex flex-col bg-indigo-50 overflow-hidden">
      <main className="flex flex-col w-full max-md:max-w-full">
        <div className="space-y-2 bg-white rounded-lg shadow-md mx-0 mt-2 pt-2">
          <section className="flex flex-col justify-center self-center p-0.5 w-full bg-white max-w-[100%] max-md:max-w-full">
            <div className="flex flex-col w-full bg-white shadow-sm max-md:pb-24 max-md:max-w-full">
              <div className="flex relative">
                <div
                  className="fixed left-0 top-0 h-full w-4 z-50"
                  onMouseEnter={() => setIsSidebarOpen(true)}
                />
                <div className={`transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-90' : 'w-0'} overflow-hidden`}>
                  <div style={{ display: isSidebarOpen ? 'block' : 'none' }}>
                    <Sidebar
                      roles={roles}
                      skills_data={skillsData}
                      sendRangeValue={handleSendRangeValue}
                      sendSelectedRoles={handleSelectedRoles}
                      onCreate={handleCreate}
                      analysisData={analysisData}
                    />
                  </div>
                </div>

                <div style={{ width: '100%', clear: 'both' }}>
                  <span style={{ paddingLeft: '34px', fontSize: '20px' }}>
                    JD {jdId} {/* Updated to display jdId instead of static "Coding" */}
                  </span>
                  <button style={{ float: 'right' }} onClick={handleClosePage}>
                    <img
                      loading="lazy"
                       src="./close.svg"
                      style={{ width: '14px', height: '14px', marginRight: '10px', padding: '0px' }}
                      alt="Close"
                    />
                  </button>

                  {showProjectDashboard && (
                    <div className={`transition-all duration-300 ease-in-out flex-grow ${isSidebarOpen ? 'ml-0' : 'ml-0 w-full'}`}>
                      <div className="w-full overflow-x-hidden" style={{ height: 'auto' }}>
                        <RightSidebar analysisData={analysisData} />
                      </div>
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