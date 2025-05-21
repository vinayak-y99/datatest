'use client';
import React, { useState, useEffect, useRef } from 'react';
import { 
  FaSuitcase, FaRegFileAlt, FaUserTie, FaClipboardCheck, 
  FaBalanceScale, FaUserFriends, FaSitemap,
  FaBars, FaMobileAlt, FaSearch, FaFilter, FaBolt, FaPlus, FaEllipsisV
} from 'react-icons/fa';import { FaAngleRight } from 'react-icons/fa'; // Import line icon

import JobDescriptions from '../../components/JobDescriptionsRoleAssignments2';
import CandidateEvaluation from '../CandidateEvaluation/CandidateEvaluation';
import ScoringFeedback from '../ScoringFeedback/ScoringFeedback';
import DecisionMakingReporting from '../DecisionMakingReporting/DecisionMakingReporting';
import RecruitmentCollaboration from '../RecruitmentCollaboration/RecruitmentCollaboration';
import WorkflowTracking from '../WorkflowTracking/WorkflowTracking';
import DrawerNavigation from './DrawerNavigation';

const Page = () => {
  const [activeSection, setActiveSection] = useState(null);
  const [openSections, setOpenSections] = useState({});
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  {isLoading && (
    <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  )}
    const components = [
      {
        // name: <span className="text-gray-700 font-bold text-sm">Candidate Evaluation</span>,
        icon: <FaUserTie size={20} style={{ color: '#4D6BBD'}} />,
        sidebarColor: '#DC2626',
        component: <CandidateEvaluation />
      },
      {
        name: <span className="text-gray-700 font-bold text-sm">Threshold & JD Management</span>,
        icon: <FaSuitcase size={20} style={{ color: '#4D6BBD' }} />,
        sidebarColor: '#4F46E5',
        component: <JobDescriptions />
      },
      
      {
        name: <span className="text-gray-700 font-bold text-sm">Scoring Feedback</span>,

        sidebarColor: '#7C3AED',
        component: <ScoringFeedback />
      },
      {
        name: <span className="text-gray-700 font-bold text-sm">Interview Decision Making</span>,
        icon: <FaBalanceScale size={20} style={{ color: '#4D6BBD' }} />,
        sidebarColor: '#0EA5E9',
        component: <DecisionMakingReporting />
      },
      {
        name: <span className="text-gray-700 font-bold text-sm">Collaboration</span>,
        icon: <FaUserFriends size={20} style={{ color: '#4D6BBD' }} />,
        sidebarColor: '#F59E0B',
        component: <RecruitmentCollaboration />
      },
      {
        name: <span className="text-gray-700 font-bold text-sm">Recruitment Workflow</span>,
        icon: <FaSitemap size={20} style={{ color: '#4D6BBD' }} />,
        sidebarColor: '#EC4899',
        component: <WorkflowTracking />
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

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('.component-window');
      const scrollPosition = window.scrollY + 100;

      sections.forEach((section, index) => {
        const top = section.offsetTop;
        const height = section.offsetHeight;
        if (scrollPosition >= top && scrollPosition < top + height) {
          setActiveSection(index);
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  const renderComponent = (item, index) => (
    <div className={`transform transition-all duration-300 ${
      openSections[index] ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
    }`}>
      {item.component}
    </div>
  );
  const openDrawerWithComponent = (index) => {
    setSelectedComponent(index);
    setDrawerOpen(true);
    document.getElementById('drawer-navigation').style.display = 'block';
  };
  
  const closeDrawer = () => {
    setDrawerOpen(false);
    setSelectedComponent(null);
    document.getElementById('drawer-navigation').style.display = 'none';
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#f8faff] to-[#e8f0ff]">
      {/* Sidebar Navigation */}
      <div className="fixed top-0 h-[75vh] w-[60px] mt-[125px] rounded-2xl shadow-lg p-6 px-2 z-10 bg-white/80 backdrop-blur-md border border-white/20">
        <ul className="list-none p-0 m-0">
          {components.map((item, index) => (
            <li key={index} className="mb-2">
              <button
                onClick={() => handleSidebarClick(index)}
                className={`w-full p-3 rounded-xl transition-all duration-300 
                  hover:bg-blue-600/15 hover:-translate-y-0 hover:scale-105 
                  ${activeSection === index ? 'bg-gradient-to-br shadow-lg text-white' : 'bg-transparent'}`}
                title={item.name}
              >
                {index === 0 && <FaSuitcase size={20} style={{ color: activeSection === index ? '#fff' : '#4F46E5' }} />}
                {index === 1 && <FaRegFileAlt size={20} style={{ color: activeSection === index ? '#fff' : '#059669' }} />}
                {index === 2 && <FaUserTie size={20} style={{ color: activeSection === index ? '#fff' : '#DC2626' }} />}
                {index === 3 && <FaClipboardCheck size={20} style={{ color: activeSection === index ? '#fff' : '#7C3AED' }} />}
                {index === 4 && <FaBalanceScale size={20} style={{ color: activeSection === index ? '#fff' : '#0EA5E9' }} />}
                {index === 5 && <FaUserFriends size={20} style={{ color: activeSection === index ? '#fff' : '#F59E0B' }} />}
                {index === 6 && <FaSitemap size={20} style={{ color: activeSection === index ? '#fff' : '#EC4899' }} />}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-grow ml-[45px] p-2.5">
        {/* Header */}
        <div className="fixed top-[66px] left-0 right-0 w-full z-[10] bg-white border-b border-gray-200">
          <div className="w-full">
            <div className="flex items-center justify-between px-6 py-3">
              <div className="flex items-center space-x-3">

                <div className="group flex items-center gap-2 bg-white/90 px-3 rounded-2xl hover:shadow-md transition-all duration-300" style={{ maxWidth: "250px" }}>
                  <div className="relative w-[35px] h-[35px]">
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur opacity-20 group-hover:opacity-60 transition duration-300"></div>
                    <div className="relative bg-gradient-to-r from-blue-50 to-purple-50 p-2 rounded-full">
                      <FaUserTie className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform duration-300" />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <h2 className="text-[20px] leading-normal mt-[5px] font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Recruiter
                    </h2>
                    <span className="text-[10px] mt-0 text-gray-600 font-medium">
                      Talent Acquisition Hub
                    </span>
                  </div>
                </div>
              </div>
                <div className="flex items-center gap-2.5">
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
          <div className="relative z-[10]">
            {/* Your dropdown menu content */}
          </div>
            {/* Component List */}
            <div className="relative mt-20 px-6">
              {components.map((item, index) => (
                <div key={index} className="rounded-xl relative" data-component-index={index}>
                  <div className="relative">
                    <div 
                      className="cursor-pointer flex items-center min-h-[10px] rounded-xl my-3 transition-all duration-300"
                      onClick={() => index !== 0 && toggleSection(index)}
                    >
                      <div className="flex items-center">
                        {index !== 0 && (
                          openSections[index] ? (
                            <FaAngleRight className="ml-2 w-3 h-3 rotate-90" />
                          ) : (
                            <FaAngleRight className="ml-2 w-3 h-3" />
                          )
                        )}
                        <h3 
                          className="cursor-pointer font-medium hover:text-blue-600 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            openDrawerWithComponent(index);
                          }}
                        >
                          {item.name}
                        </h3>
                      </div>
                    </div>
                    <div className={`transition-all duration-300 overflow-hidden ${
                      index === 0 ? 'max-h-[2000px] p-6' :
                      openSections[index] ? 'max-h-[2000px] p-6' : 'max-h-0'
                    }`}>
                      {item.component}
                    </div>
                  </div>
                </div>
              ))}
            </div>
        {/* Drawer Navigation */}        {drawerOpen && (
          <DrawerNavigation 
            selectedComponent={selectedComponent}
            components={components}
            closeDrawer={closeDrawer}
          />
        )}
      </div>
    </div>
  );
};
export default Page;
