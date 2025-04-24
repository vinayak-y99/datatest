"use client";

// Core React imports
import React, { useState, useEffect } from 'react';
 
// Icon imports from Lucide
import { 
  Users,
  Shield, 
  CreditCard, 
  Settings, 
  Layout,
  ChevronRight, 
  Menu, 
  Search, 
  Filter, 
  Plus, 
  Zap, 
  MoreVertical,
  X,
  Building2
} from 'lucide-react';

import { FaFilter, FaSearch, FaPlus, FaBolt, FaEllipsisV } from 'react-icons/fa';

// Component imports
import RoleManagement from './RoleManagement';
import SubscriptionManagement from './Subscription';
import SystemSettings from './SystemConfiguration';
import ComplianceSettings from './ComplianceSettings';
import DrawerNavigation from './DrawerNavigation';
import OrganizationForm from './OrganizationForm';
import RecruiterApp from './Recruiters'; // Import the Recruiters component

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState(null);
  const [openSections, setOpenSections] = useState({});
  const [isExpanded, setIsExpanded] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleNavigation = (path) => {
    window.location.href = path;
  };

  const handleDepartmentSelect = (departmentType) => {
    setSelectedDepartment(departmentType);
    // Navigate to user management section
    const userManagementIndex = components.findIndex(c => c.name.props.children === "User Management");
    handleSidebarClick(userManagementIndex);
  };

  const components = [
    {
      name: <span className="text-gray-700 font-bold text-sm">Recruiter Management</span>,
      icon: <Users size={20} className="text-green-600" />,
      sidebarColor: '#22C55E',
      component: <RecruiterApp />
    },
    {
      name: <span className="text-gray-700 font-bold text-sm">Role Management</span>,
      icon: <Shield size={20} className="text-purple-600" />,
      sidebarColor: '#7C3AED',
      component: <RoleManagement />
    },
    {
      name: <span className="text-gray-700 font-bold text-sm">Subscription Management</span>,
      icon: <CreditCard size={20} className="text-purple-600" />,
      sidebarColor: '#7C3AED',
      component: <SubscriptionManagement />
    },
    {
      name: <span className="text-gray-700 font-bold text-sm">System Settings</span>,
      icon: <Settings size={20} className="text-sky-600" />,
      sidebarColor: '#0EA5E9',
      component: <SystemSettings />
    },
    {
      name: <span className="text-gray-700 font-bold text-sm">Compliance Settings</span>,
      icon: <Layout size={20} className="text-amber-600" />,
      sidebarColor: '#F59E0B',
      component: <ComplianceSettings />
    }
  ];

  const handleExpandCollapse = () => {
    setIsExpanded(!isExpanded);
    const newOpenSections = {};
    components.forEach((_, index) => {
      newOpenSections[index] = !isExpanded;
    });
    setOpenSections(newOpenSections);
  };

  const handleSidebarClick = (index) => {
    const element = document.querySelector(`[data-component-index="${index}"]`);
    if (element) {
      element.scrollIntoView({ block: 'start', behavior: 'smooth' });
      setOpenSections(prev => ({...prev, [index]: true}));
      setActiveSection(index);
    }
  };

  const toggleSection = (index) => {
    setOpenSections(prev => ({...prev, [index]: !prev[index]}));
  };

  const openDrawerWithComponent = (index, e) => {
    e.stopPropagation(); // Prevent accordion toggle
    setSelectedComponent(index);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setSelectedComponent(null);
  };

  // Drawer Component
  const Drawer = () => {
    if (!drawerOpen || selectedComponent === null) return null;

    return (
      <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="absolute inset-0 bg-black bg-opacity-50" onClick={closeDrawer}></div>
        <div className="absolute right-0 top-0 h-full w-full  bg-white shadow-xl transform transition-transform duration-300">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-lg bg-gray-50">
                  {components[selectedComponent].icon}
                </span>
                <h2 className="text-xl font-bold">
                  {components[selectedComponent].name}
                </h2>
              </div>
              <button 
                onClick={closeDrawer}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="overflow-y-auto">
              {components[selectedComponent].component}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Sidebar Navigation */}
      <div className="fixed top-0 h-screen w-16 mt-16 bg-white shadow-lg p-4 z-10">
        <ul className="space-y-4">
          {components.map((item, index) => (
            <li key={index}>
              <button
                onClick={() => handleSidebarClick(index)}
                className={`w-full p-3 rounded-xl transition-all duration-300 
                  hover:bg-gray-100 hover:shadow-md
                  ${activeSection === index ? 'bg-blue-50 shadow-md' : ''}`}
                title={typeof item.name === 'string' ? item.name : 'Menu item'}
              >
                {item.icon}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-grow ml-10 p-4">
        {/* Header */}
        <div className="fixed top-0 left-16 right-0 bg-white shadow-sm z-10 mt-14">
          <div className="flex items-center justify-between px-6 py-4">
            {/* Left side - Title */}
            <div className="flex items-center">
              <div className="flex flex-col">
                <h2 className="text-[20px] leading-normal mt-[5px] font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Admin
                </h2>
              </div>
            </div>

            {/* Right side - Icons */}
            <div className="flex items-center space-x-3">
              <button 
                onClick={handleExpandCollapse}
                className="p-2.5 rounded-xl bg-gradient-to-r from-indigo-50 to-indigo-100 hover:from-indigo-100 hover:to-indigo-200 transition-all duration-200 group"
                title="expand / collapse"
              >
                <img 
                  src="../arrowdown.svg" 
                  alt="Arrow down" 
                  className="w-4 h-4 group-hover:scale-110 transition-transform"
                  style={{ 
                    transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.3s ease'
                  }} 
                />
              </button>

              <div className="flex items-center space-x-2">
  <button className="group relative p-2.5 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 transition-all duration-200">
    <FaFilter size={16} className="text-blue-600 group-hover:scale-110 transition-transform" />
    <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
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

  {/* Dropdown Button */}
  <div className="relative">
    <button
      onClick={() => setDropdownOpen(!dropdownOpen)}
      className="p-2.5 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 transition-all duration-200 group"
    >
      <FaEllipsisV size={16} className="text-gray-600 group-hover:scale-110 transition-transform" />
    </button>

    {dropdownOpen && (
      <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg overflow-hidden z-50">
        <button
          onClick={() => handleNavigation("/hiring")}
          className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
        >
          Hiring
        </button>
        <button
          onClick={() => handleNavigation("/recruiter/rec_ui")}
          className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
        >
          Recruiter
        </button>
        <button
          onClick={() => handleNavigation("/Technical")}
          className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
        >
          Technical
        </button>
        <button
          onClick={() => handleNavigation("/client")}
          className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
        >
          Client
        </button>
      </div>
    )}
  </div>
</div>

            </div>
          </div>
        </div>
        {/* Component List */}
        <div className="mt-16 space-y-4 " style={{ marginLeft: "1rem" }}>
        <div className="" style={{ width: "100%", height: "100%" }}>
          <OrganizationForm/>
  
 
</div>

          {components.map((item, index) => (
            <div 
              key={index} 
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200" 
              data-component-index={index}
            >
              <div className="relative">
                <div 
                  className="flex items-center p-4 cursor-pointer hover:bg-gray-50 transition-colors duration-200"
                  onClick={() => toggleSection(index)}
                >
                  <div className="flex items-center gap-3">
                    {/* <span className="p-2 rounded-lg bg-gray-50">{item.icon}</span> */}
                    <ChevronRight 
                      className={`w-4 h-4 transform transition-transform duration-200 ${openSections[index] ? 'rotate-90' : ''}`}
                    />
                    <h3 
                      className="font-medium cursor-pointer hover:text-blue-600 transition-colors"
                      onClick={(e) => openDrawerWithComponent(index, e)}
                    >
                      {item.name}
                    </h3>
                  </div>
                </div>
                <div className={`transition-all duration-300 overflow-hidden ${
                  openSections[index] ? 'max-h-[1000px]' : 'max-h-0'
                }`}>
                  {item.component}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Drawer */}
      <DrawerNavigation />
    </div>
  );
};

export default AdminDashboard;
