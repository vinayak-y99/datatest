"use client";

import React, { useState } from 'react';
import {
  Box,
  Container
} from '@mui/material';

import {
  DescriptionOutlined as DescriptionIconOutlined
} from '@mui/icons-material';

// Import components
import JobDescription from '../components/JobDescriptionsRole_threshold';

// Define sections array
const sections = [
  {
    id: 'job-description',
    title: 'Threshold & JD Management',
    icon: <DescriptionIconOutlined sx={{ color: '#4D6BBD' }} />,
    content: <JobDescription />
  }
];

export default function HiringDashboard() {
  const [activeSection, setActiveSection] = useState('job-description');

  return (
    <Box sx={{ background: 'linear-gradient(to bottom right, #f8faff, #e8f0ff)', minHeight: '100vh' }}>
      {/* Main Content */}
      <Container 
        maxWidth="full" 
        sx={{ 
          mt: '90px',
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