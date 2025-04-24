"use client";
import React, { useState, useRef, useEffect } from 'react';
import { FileText, MessageSquare,  Plus,  
         X, 
         Home, Bell, Calendar, 
         ClipboardCheck, 
         Link2, 
          Maximize,
          Target,  } from 'lucide-react';
import { FaUserTie, FaFilter, FaSearch, FaPlus, FaBolt, FaEllipsisV } from 'react-icons/fa';
import JobDescriptionSection from './JobDescription';

import EvalutionSection from './EvalutionSection'; 
import DecisionSupportSection from './DecisionSupportSection';
import InterviewTrackingSection from './InterviewTracking'; 
import CollaborationSection from './CollaborationSection'; 
import NotificationsSection from './Notifications';
import IntegrationComplianceSection from './IntegrationCompliance';
import ClientDashboard from './ClientDashboard';
// Import ThresholdManagementSection or uncomment in navigationItems

const SidebarLayout = () => {
  const [isMaximized, setIsMaximized] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [drawerWidth, setDrawerWidth] = useState(320);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const startX = useRef(0);
  const startWidth = useRef(0);
  const [activeTab, setActiveTab] = useState('ClientDashboard');

  // Enhanced navigation items with more attractive icons
  const navigationItems = [
    { 
      icon: (
        <div className="flex items-center justify-center w-full h-full">
          <Home className="w-4 h-4" />
        </div>
      ), 
      label: 'ClientDashboard', 
      component: ClientDashboard, 
      color: 'blue',
      shape: 'circle'
    },
    { 
      icon: (
        <div className="flex items-center justify-center w-full h-full">
          <FileText className="w-4 h-4" />
        </div>
      ), 
      label: 'Threshold & JD Management', 
      component: JobDescriptionSection, 
      color: 'purple',
      shape: 'hexagon'
    },
    { 
      icon: (
        <div className="flex items-center justify-center w-full h-full rotate-45">
          <ClipboardCheck className="w-4 h-4 -rotate-45" />
        </div>
      ), 
      label: 'Candidate Evaluation', 
      component: EvalutionSection, 
      color: 'green',
      shape: 'diamond'
    },
    { 
      icon: (
        <div className="flex items-center justify-center w-full h-full">
          <Target className="w-4 h-4" />
        </div>
      ), 
      label: 'Decision Support', 
      component: DecisionSupportSection, 
      color: 'indigo',
      shape: 'circle'
    },
    { 
      icon: (
        <div className="flex items-center justify-center w-full h-full">
          <Calendar className="w-4 h-4" />
        </div>
      ), 
      label: 'Interview Tracking', 
      component: InterviewTrackingSection, 
      color: 'red',
      shape: 'rounded'
    },
    { 
      icon: (
        <div className="flex items-center justify-center w-full h-full">
          <MessageSquare className="w-4 h-4" />
        </div>
      ), 
      label: 'Collaboration', 
      component: CollaborationSection, 
      color: 'amber',
      shape: 'bubble'
    },
    { 
      icon: (
        <div className="flex items-center justify-center w-full h-full">
          <Bell className="w-4 h-4" />
        </div>
      ), 
      label: 'Notifications', 
      component: NotificationsSection, 
      color: 'pink',
      shape: 'rounded'
    },
    { 
      icon: (
        <div className="flex items-center justify-center w-full h-full">
          <Link2 className="w-4 h-4" />
        </div>
      ), 
      label: 'Integration', 
      component: IntegrationComplianceSection, 
      color: 'teal',
      shape: 'hexagon'
    }
  ];

  const timelinePoints = [
    {
      icon: (
        <div className="w-12 h-12 bg-blue-100/80 rounded-full flex items-center justify-center">
          <div className="flex flex-col items-end h-6">
            <div className="w-1.5 h-3 bg-blue-600 mb-0.5"></div>
            <div className="w-2 h-4 bg-blue-600 mb-0.5"></div>
            <div className="w-2.5 h-5 bg-blue-600"></div>
          </div>
        </div>
      ),
      month: "Jul",
      content: "We reached more than expected revenue"
    },
    {
      icon: (
        <div className="w-12 h-12 bg-blue-100/80 rounded-full flex items-center justify-center">
          <svg className="w-6 h-6 text-blue-600" viewBox="0 0 24 24">
            <path fill="currentColor" d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z"/>
          </svg>
        </div>
      ),
      month: "Oct",
      content: "Hit $10M in revenue for the first time"
    },
    {
      icon: (
        <div className="w-12 h-12 bg-blue-100/80 rounded-full flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-blue-600 flex items-center justify-center">
            <span className="text-blue-600 text-xs font-bold">m</span>
          </div>
        </div>
      ),
      month: "May",
      content: "Our AI implementation came through"
    },
    {
      icon: (
        <div className="w-12 h-12 bg-blue-100/80 rounded-full flex items-center justify-center">
          <svg className="w-6 h-6 text-blue-600" viewBox="0 0 24 24">
            <path fill="currentColor" d="M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z"/>
          </svg>
        </div>
      ),
      month: "Dec",
      content: "End of year milestone reached"
    }
  ];

  // Enhanced function to get color classes based on the color name
  const getColorClasses = (colorName, isActive) => {
    const colorMap = {
      blue: {
        bg: isActive ? 'bg-blue-100' : 'hover:bg-blue-50',
        text: isActive ? 'text-blue-600' : 'group-hover:text-blue-600',
        border: isActive ? 'border-blue-500' : '',
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-600',
        gradient: 'from-blue-400 to-blue-600'
      },
      purple: {
        bg: isActive ? 'bg-purple-100' : 'hover:bg-purple-50',
        text: isActive ? 'text-purple-600' : 'group-hover:text-purple-600',
        border: isActive ? 'border-purple-500' : '',
        iconBg: 'bg-purple-100',
        iconColor: 'text-purple-600',
        gradient: 'from-purple-400 to-purple-600'
      },
      green: {
        bg: isActive ? 'bg-green-100' : 'hover:bg-green-50',
        text: isActive ? 'text-green-600' : 'group-hover:text-green-600',
        border: isActive ? 'border-green-500' : '',
        iconBg: 'bg-green-100',
        iconColor: 'text-green-600',
        gradient: 'from-green-400 to-green-600'
      },
      indigo: {
        bg: isActive ? 'bg-indigo-100' : 'hover:bg-indigo-50',
        text: isActive ? 'text-indigo-600' : 'group-hover:text-indigo-600',
        border: isActive ? 'border-indigo-500' : '',
        iconBg: 'bg-indigo-100',
        iconColor: 'text-indigo-600',
        gradient: 'from-indigo-400 to-indigo-600'
      },
      red: {
        bg: isActive ? 'bg-red-100' : 'hover:bg-red-50',
        text: isActive ? 'text-red-600' : 'group-hover:text-red-600',
        border: isActive ? 'border-red-500' : '',
        iconBg: 'bg-red-100',
        iconColor: 'text-red-600',
        gradient: 'from-red-400 to-red-600'
      },
      amber: {
        bg: isActive ? 'bg-amber-100' : 'hover:bg-amber-50',
        text: isActive ? 'text-amber-600' : 'group-hover:text-amber-600',
        border: isActive ? 'border-amber-500' : '',
        iconBg: 'bg-amber-100',
        iconColor: 'text-amber-600',
        gradient: 'from-amber-400 to-amber-600'
      },
      pink: {
        bg: isActive ? 'bg-pink-100' : 'hover:bg-pink-50',
        text: isActive ? 'text-pink-600' : 'group-hover:text-pink-600',
        border: isActive ? 'border-pink-500' : '',
        iconBg: 'bg-pink-100',
        iconColor: 'text-pink-600',
        gradient: 'from-pink-400 to-pink-600'
      },
      teal: {
        bg: isActive ? 'bg-teal-100' : 'hover:bg-teal-50',
        text: isActive ? 'text-teal-600' : 'group-hover:text-teal-600',
        border: isActive ? 'border-teal-500' : '',
        iconBg: 'bg-teal-100',
        iconColor: 'text-teal-600',
        gradient: 'from-teal-400 to-teal-600'
      }
    };
    
    return colorMap[colorName] || colorMap.blue;
  };

  // Get icon shape based on the shape property
  const getIconShape = (shape) => {
    const shapeClasses = {
      circle: 'rounded-full',
      hexagon: 'rounded-lg',
      diamond: 'rounded-none',
      rounded: 'rounded-lg',
      bubble: 'rounded-2xl'
    };
    
    return shapeClasses[shape] || 'rounded-lg';
  };

  // Modified to only change the active tab without opening the drawer
  const handleTabClick = (label) => {
    setActiveTab(label);
    // Remove the drawer opening logic from here
  };
  
  // New function to handle navigation item clicks - sets active tab AND opens drawer
  const handleNavigationItemClick = (label) => {
    setActiveTab(label);
    openDrawer();
  };

  const toggleMaximize = () => setIsMaximized(prev => !prev);
  const toggleModal = () => setIsModalOpen(prev => !prev);
  
  const openDrawer = () => {
    setIsDrawerOpen(true);
    const drawer = document.getElementById('drawer-navigation');
    if (drawer) drawer.style.display = 'block';
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    const drawer = document.getElementById('drawer-navigation');
    if (drawer) drawer.style.display = 'none';
  };

  const handleMouseDown = (e) => {
    startX.current = e.clientX;
    startWidth.current = drawerWidth;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e) => {
    const delta = startX.current - e.clientX;
    const newWidth = startWidth.current + delta;
    const minWidth = window.innerWidth * 0.2;
    const maxWidth = window.innerWidth;
    setDrawerWidth(Math.min(maxWidth, Math.max(minWidth, newWidth)));
  };

  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };
  
  // Custom CSS to hide scrollbar
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .hide-scrollbar::-webkit-scrollbar {
        display: none;
      }
      .hide-scrollbar {
        -ms-overflow-style: none;  /* IE and Edge */
        scrollbar-width: none;  /* Firefox */
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(to bottom right, #f8faff, #e8f0ff)' }}>
      {/* Header */}
      <div style={{
        position: 'fixed', 
        top: '0',
        left: '0', 
        right: '0', 
        width: '100%',
        zIndex: '20', 
        backgroundColor: 'white', 
        borderBottom: '1px solid #E5E7EB'
      }}>
        <div className="w-full"> 
          <div className="flex items-center justify-between px-6 py-3">
            <div className="flex items-center space-x-3">
              <div className="group flex items-center gap-2 bg-white/90 px-3 rounded-2xl hover:shadow-md transition-all duration-300 border-blue-100" style={{ maxWidth: "250px" }}>
                <div className="relative" style={{ width: "35px", height: "35px" }}>
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur opacity-20 group-hover:opacity-60 transition duration-300"></div>
                  <div className="relative bg-gradient-to-r from-blue-50 to-purple-50 p-2 rounded-full">
                    <FaUserTie className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform duration-300" />
                  </div>
                </div>
                <div className="flex flex-col z-10">
                  <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent" style={{ fontSize: "18px", marginTop: "5px", lineHeight: "normal" }}>
                    Client Panel
                  </h2>
                  <span className="text-xs text-gray-600 font-medium" style={{ fontSize: "8px", marginTop: "0px" }}>
                    Talent Acquisition Hub
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <div className="flex items-center gap-3 mr-0">
                <button 
                  className="group relative p-2.5 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200"
                >
                  <FaFilter size={16} className="text-blue-600 group-hover:scale-110 transition-transform" />
                  <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    Filter
                  </span>
                </button>
                
                <button className="p-2.5 rounded-xl bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 transition-all duration-200 group">
                  <FaSearch size={16} className="text-purple-600 group-hover:scale-110 transition-transform" />
                </button>
                
                <button className="p-2.5 rounded-xl bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 transition-all duration-200 group">
                  <FaPlus size={16} className="text-green-600 group-hover:scale-110 transition-transform" />
                </button>
                
                <button className="p-2.5 rounded-xl bg-gradient-to-r from-amber-50 to-amber-100 hover:from-amber-100 hover:to-amber-200 transition-all duration-200 group">
                  <FaBolt size={16} className="text-amber-600 group-hover:scale-110 transition-transform" />
                </button>
                
                <button className="p-2.5 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 transition-all duration-200 group">
                  <FaEllipsisV size={16} className="text-gray-600 group-hover:scale-110 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Tabs Navigation */}
      <div className="fixed top-16 left-0 right-0 bg-white z-10 border-b border-gray-200 px-4 shadow-sm">
        <div className="flex py-2 overflow-x-auto hide-scrollbar">
          {navigationItems.map((item, index) => {
            const isActive = activeTab === item.label;
            const colorClasses = getColorClasses(item.color, isActive);
            const shapeClass = getIconShape(item.shape);
            
            return (
              <button
                key={index}
                onClick={() => handleTabClick(item.label)}
                className={`group flex items-center px-4 py-2 rounded-lg transition-all whitespace-nowrap mr-2 ${
                  colorClasses.bg
                } ${isActive ? `${colorClasses.text} font-medium shadow-sm border-b-2 ${colorClasses.border}` : 'text-gray-600'}`}
              >
                <div className={`relative mr-2 flex-shrink-0 ${isActive ? 'scale-110' : ''}`}>
                  {/* Icon background with shape and gradient */}
                  <div className={`w-8 h-8 ${shapeClass} bg-gradient-to-br ${colorClasses.gradient} flex items-center justify-center transition-all duration-300 ${isActive ? 'shadow-md' : ''}`}>
                    {/* Icon wrapper with white color */}
                    <div className="text-white">
                      {item.icon}
                    </div>
                  </div>
                  
                  {/* Add subtle animation for active items */}
                  {isActive && (
                    <div className={`absolute -inset-1 ${shapeClass} bg-gradient-to-r ${colorClasses.gradient} blur-sm opacity-30 z-0`}></div>
                  )}
                </div>
                <span className="text-sm z-10">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="pt-32">
        {/* Main content area - only display active section */}
        <div className="px-6">
          {navigationItems.map((item, index) => {
            const ItemComponent = item.component;
            const isActive = activeTab === item.label;
            const colorClasses = getColorClasses(item.color, true);
            const shapeClass = getIconShape(item.shape);
            
            // Only render the component if it's the active tab
            return activeTab === item.label ? (
              <div key={index} className="mb-8">
                <div className={`flex items-center gap-2 mb-4 pb-2 border-b ${colorClasses.border}`}>
                  <div className={`w-8 h-8 ${shapeClass} bg-gradient-to-br ${colorClasses.gradient} flex items-center justify-center`}>
                    <div className="text-white">
                      {item.icon}
                    </div>
                  </div>
                  <h2 className={`font-bold text-lg ${colorClasses.text}`}>{item.label}</h2>
                  
                  {/* Added a Details button to open the drawer */}
                  <button 
                    onClick={() => handleNavigationItemClick(item.label)} 
                    className={`ml-4 px-3 py-1 text-xs font-medium rounded-lg ${colorClasses.bg} ${colorClasses.text}`}
                  >
                    View Details
                  </button>
                </div>
                <ItemComponent />
              </div>
            ) : null;
          })}
        </div>

        {/* Right Drawer */}
        {isDrawerOpen && (
          <div
            id="drawer-navigation"
            className="fixed top-32 right-0 z-40 bg-gray-50 h-[calc(100vh-8rem)]"
            style={{
              display: 'block',
              width: isMaximized ? '100%' : `${drawerWidth}px`,
              overflowY: 'hidden'
            }}
            tabIndex="-1"
            aria-labelledby="drawer-navigation-label"
          >
            <div className="p-4">
              <h5 id="drawer-navigation-label" className="text-base font-bold text-gray-800 uppercase">
                {activeTab} Details
              </h5>

              <div className="absolute top-2.5 right-2.5 flex items-center space-x-2">
                <button
                  type="button"
                  onClick={toggleModal}
                  className="text-gray-800 bg-transparent hover:bg-blue-400 hover:text-white rounded-lg text-sm p-1.5 inline-flex items-center"
                >
                  <Plus className="w-5 h-5" />
                </button>

                <button
                  type="button"
                  onClick={toggleMaximize}
                  className="text-gray-800 bg-transparent hover:bg-blue-400 hover:text-white rounded-lg text-sm p-1.5 inline-flex items-center"
                >
                  <Maximize className="w-5 h-5" />
                </button>

                <button
                  type="button"
                  onClick={closeDrawer}
                  className="text-gray-800 bg-transparent hover:bg-red-400 hover:text-white rounded-lg text-sm p-1.5 inline-flex items-center"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div
                className="absolute top-0 left-0 w-1 h-full cursor-ew-resize bg-gray-300 hover:bg-gray-400"
                onMouseDown={handleMouseDown}
              />
            </div>
          </div>
        )}

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center">
            <div className={`bg-white rounded-lg shadow-lg transition-all duration-300 ${isMaximized ? 'w-full h-full' : 'w-3/4 h-3/4'}`}>
              <div className="p-4">
                <div className="flex justify-end space-x-2">
                  <button onClick={toggleMaximize} className="bg-blue-600 text-white py-1 px-3 rounded">
                    <span className="font-bold">Maximize</span>
                  </button>
                  <button onClick={toggleModal} className="bg-red-600 text-white py-1 px-3 rounded">
                    <span className="font-bold">Close</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SidebarLayout;