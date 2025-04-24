"use client";

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Box,
  Container,
  IconButton,
  Tooltip,
  Collapse,
  Stack
} from '@mui/material';

import {
  Dashboard as DashboardIcon,
  TipsAndUpdates as TipsAndUpdatesIcon,
  Description as DescriptionIcon,
  GroupAdd as GroupAddIcon,
  Feedback as FeedbackIcon,
  Assessment as AssessmentIcon,
  Save as SaveIcon,
  Analytics as AnalyticsIcon,
  VerifiedUser as VerifiedUserIcon,
  Sync as SyncIcon,
  Notifications as NotificationsIcon,
  ExpandMore as ExpandMoreIcon,
  ChevronRight as ChevronRightIcon,
  DashboardOutlined as DashboardIconOutlined,
  TipsAndUpdatesOutlined as TipsAndUpdatesIconOutlined,
  DescriptionOutlined as DescriptionIconOutlined,
  GroupAddOutlined as GroupAddIconOutlined,
  FeedbackOutlined as FeedbackIconOutlined,
  AssessmentOutlined as AssessmentIconOutlined,
  SaveOutlined as SaveIconOutlined,
  AnalyticsOutlined as AnalyticsIconOutlined,
  VerifiedUserOutlined as VerifiedUserIconOutlined,
  SyncOutlined as SyncIconOutlined,
  NotificationsOutlined as NotificationsIconOutlined
} from '@mui/icons-material';
import { FaUserTie, FaFilter, FaSearch, FaPlus, FaBolt, FaEllipsisV } from 'react-icons/fa';

// Import components
import Dashboard from './DashboardComponent';
import JobDescription from '../components/JobDescriptionsRole_threshold';
import InterviewAssignment from './InterviewAssignment';
import HiringEvaluation from './HiringEvaluation';
import AnalyticsComponent from './AnalyticsComponent';
import InterviewFeedback from './InterviewFeedback';
import Notifications from './Notifications';
import PostSelection from './PostSelection';
import SystemIntegration from './SystemIntegration';

// Define sections array
const sections = [
  {
    id: 'dashboard',
    title: 'Total Hiring Dashboard',
    icon: <DashboardIconOutlined sx={{ color: '#4D6BBD' }} />,
    content: <Dashboard />
  },
  // {
  //   id: 'threshold',
  //   title: 'Hiring Threshold',
  //   icon: <TipsAndUpdatesIconOutlined sx={{ color: '#4D6BBD' }} />,
  //   content: <ThresholdManagement />
  // },
  {
    id: 'job-description',
    title: 'Threshold & JD Management',
    icon: <DescriptionIconOutlined sx={{ color: '#4D6BBD' }} />,
    content: <JobDescription />
  },
  {
    id: 'interview-assignment',
    title: 'Interview Assignment',
    icon: <GroupAddIconOutlined sx={{ color: '#4D6BBD' }} />,
    content: <InterviewAssignment />
  },
  {
    id: 'interview-feedback',
    title: 'Interview Feedback',
    icon: <FeedbackIconOutlined sx={{ color: '#4D6BBD' }} />,
    content: <InterviewFeedback />
  },

  {
    id: 'hiring-evaluation',
    title: 'Hiring Evaluation',
    icon: <AssessmentIconOutlined sx={{ color: '#4D6BBD' }} />,
    content: <HiringEvaluation />
  },
  {
    id: 'analytics',
    title: 'Hiring Analytics',
    icon: <AnalyticsIconOutlined sx={{ color: '#4D6BBD' }} />,
    content: <AnalyticsComponent />
  },
  {
    id: 'post-selection',
    title: 'Post Selection',
    icon: <VerifiedUserIconOutlined sx={{ color: '#4D6BBD' }} />,
    content: <PostSelection />
  },
  // {
  //   id: 'integration',
  //   title: 'System Integration',
  //   icon: <SyncIconOutlined sx={{ color: '#4D6BBD' }} />,
  //   content: <SystemIntegration />
  // },
  {
    id: 'notifications',
    title: 'Notifications',
    icon: <NotificationsIconOutlined sx={{ color: '#4D6BBD' }} />,
    content: <Notifications />
  }
];

// SidebarContent component definition
const SidebarContent = ({ activeSection, onSectionClick }) => {
  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        py: 1,
        background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        '& .MuiIconButton-root': {
          transition: 'all 0.3s',
          margin: '4px 0',
          padding: '12px',
          borderRadius: '12px',
          '&:hover': {
            transform: 'scale(1.1)',
            background: 'white',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
          }
        }
      }}
    >
      {sections.map(section => (
        <Tooltip key={section.id} title={section.title} placement="right">
          <IconButton onClick={() => onSectionClick(section.id)}>
            {section.icon}
          </IconButton>
        </Tooltip>
      ))}
    </Box>
  );
};

export default function HiringDashboard() {
  const [activeSection, setActiveSection] = useState('dashboard');
  
  const sectionRefs = sections.reduce((acc, section) => {
    acc[section.id] = useRef(null);
    return acc;
  }, {});

  const handleSectionClick = (sectionId) => {
    setActiveSection(sectionId);
  };

  return (
    <Box sx={{ background: 'linear-gradient(to bottom right, #f8faff, #e8f0ff)', minHeight: '100vh' }}>
      {/* Header Navigation */}
      <Box
        sx={{
          position: 'fixed',
          top: '66px',
          left: '0',
          right: '0',
          width: '100%',
          zIndex: '10',
          backgroundColor: 'white',
          borderBottom: '1px solid #E5E7EB'
        }}
      >
        <div className="w-full">
          <div className="flex items-center justify-between px-6 py-3">
            <div className="flex items-center space-x-6 flex-grow">
              {/* Title section */}
              <div className="group flex items-center gap-2 bg-white/90 px-3 rounded-2xl hover:shadow-md transition-all duration-300 border-blue-100" style={{ maxWidth: "250px" }}>
                <div className="relative" style={{ width: "35px", height: "35px" }}>
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur opacity-20 group-hover:opacity-60 transition duration-300"></div>
                  <div className="relative bg-gradient-to-r from-blue-50 to-purple-50 p-2 rounded-full">
                    <FaUserTie className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform duration-300" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent" style={{ fontSize: "18px", marginTop: "5px", lineHeight: "normal" }}>
                    Hiring manager
                  </h2>
                  <span className="text-xs text-gray-600 font-medium" style={{ fontSize: "8px", marginTop: "0px" }}>
                    Talent Acquisition Hub
                  </span>
                </div>
              </div>

              {/* Navigation Items */}
              <div className="flex-1 relative">
                <div 
                  className="flex items-center space-x-2 overflow-x-auto pb-2 hide-scrollbar"
                  style={{
                    msOverflowStyle: 'none',
                    scrollbarWidth: 'none',
                    '&::-webkit-scrollbar': {
                      display: 'none'
                    },
                    maxWidth: 'calc(100vw - 283px)', // Adjust space for title and action buttons
                    overflowX: 'auto',
                    WebkitOverflowScrolling: 'touch'
                  }}
                >
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => handleSectionClick(section.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 min-w-max ${
                        activeSection === section.id 
                          ? 'bg-blue-50 text-blue-600' 
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {section.icon}
                      <span className="text-sm font-medium whitespace-nowrap">
                        {section.title}
                      </span>
                    </button>
                  ))}
                </div>
                {/* Gradient shadows for scroll indication */}
                <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent pointer-events-none"></div>
                <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none"></div>
              </div>

            </div>

         
          </div>
        </div>
      </Box>

      {/* Main Content */}
      <Container 
        maxWidth="full" 
        sx={{ 
          mt: '90px', // Adjusted margin since we removed the second navigation bar
          p: 1
        }}
      >
        <Box sx={{ bgcolor: 'white', borderRadius: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          {sections.find(section => section.id === activeSection)?.content}
        </Box>
      </Container>
    </Box>
  );
}