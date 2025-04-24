'use client';
import React, { useState, useEffect } from 'react';
import { 
  FaUserTie, FaSearch, FaRegClock, FaChartLine, FaAngleDown, FaAngleUp,
  FaRegCalendarAlt, FaBrain, FaShareAlt, FaChartPie, FaPauseCircle, FaCalendarAlt, FaCode, FaBuilding
} from 'react-icons/fa';
import { PolarArea, Radar, Doughnut } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  RadialLinearScale, 
  PolarAreaController, 
  ArcElement, 
  Title, 
  Tooltip, 
  Legend, 
  BarController, 
  BarElement, 
  PointElement, 
  LineElement, 
  Filler,
  DoughnutController 
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale, 
  LinearScale, 
  RadialLinearScale, 
  PolarAreaController, 
  ArcElement, 
  Title, 
  Tooltip, 
  Legend, 
  BarController, 
  BarElement, 
  PointElement, 
  LineElement, 
  Filler,
  DoughnutController
);

// Move static data to serve as fallback defaults
const DEFAULT_SKILLS_DATA = [
  { name: 'Technical Knowledge', score: 85 },
  { name: 'Communication', score: 92 },
  { name: 'Problem Solving', score: 78 },
  { name: 'Team Collaboration', score: 88 }
];

const DEFAULT_COLLABORATORS = [
  { name: 'Jane Smith', avatar: '/api/placeholder/50/50' },
  { name: 'John Doe', avatar: '/api/placeholder/50/50' },
  { name: 'Alex Johnson', avatar: '/api/placeholder/50/50' },
  { name: 'Maria Garcia', avatar: '/api/placeholder/50/50' }
];

const DEFAULT_INTERVIEWS_DATA = [
  {
    id: 1,
    name: 'Michael Chen',
    role: 'Senior Front-End Developer',
    date: 'Mar 18, 2025',
    time: '10:00 AM',
    skills: ['React', 'TypeScript', 'Next.js'],
    status: 'Confirmed',
    experience: [
      { company: 'TechStart Inc', position: 'Frontend Developer', duration: '2020-2023' },
      { company: 'Digital Labs', position: 'UI Developer', duration: '2017-2020' }
    ],
    education: 'BS Computer Science, Stanford University'
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    role: 'DevOps Engineer',
    date: 'Mar 19, 2025',
    time: '2:30 PM',
    skills: ['Docker', 'Kubernetes', 'AWS', 'CI/CD'],
    status: 'Pending Confirmation',
    experience: [
      { company: 'Cloud Systems', position: 'DevOps Specialist', duration: '2019-2023' },
      { company: 'TechNow', position: 'System Administrator', duration: '2016-2019' }
    ],
    education: 'MS Information Systems, MIT'
  },
  {
    id: 3,
    name: 'David Kim',
    role: 'Backend Developer',
    date: 'Mar 20, 2025',
    time: '11:15 AM',
    skills: ['Node.js', 'Python', 'MongoDB', 'GraphQL'],
    status: 'Confirmed',
    experience: [
      { company: 'DataFlow', position: 'Backend Engineer', duration: '2021-2023' },
      { company: 'ServeLogic', position: 'Software Developer', duration: '2018-2021' }
    ],
    education: 'BS Software Engineering, UC Berkeley'
  }
];

// Reusable Components
const CircularProgressBar = ({ percentage }) => (
  <div className="relative w-24 h-24">
    <svg className="w-full h-full" viewBox="0 0 100 100">
      <circle
        className="text-gray-200 stroke-current"
        strokeWidth="8"
        cx="50"
        cy="50"
        r="40"
        fill="transparent"
      />
      <circle
        className="text-blue-600 stroke-current"
        strokeWidth="8"
        strokeLinecap="round"
        cx="50"
        cy="50"
        r="40"
        fill="transparent"
        strokeDasharray={`${percentage * 2.51}, 251`}
        transform="rotate(-90 50 50)"
      />
    </svg>
    <span className="absolute inset-0 flex items-center justify-center text-lg font-bold">
      {percentage}%
    </span>
  </div>
);

const CollaborationPanel = () => (
  <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-lg">
    <div className="flex items-center justify-between mb-4">
      <h3 className="font-bold text-gray-800">Active Collaborators</h3>
      <div className="flex -space-x-2">
        {DEFAULT_COLLABORATORS.map((collaborator, index) => (
          <div key={index} className="w-8 h-8 rounded-full border-2 border-white overflow-hidden hover:z-10 transition-transform hover:scale-110">
            <img src={collaborator.avatar} alt={collaborator.name} className="w-full h-full object-cover" />
          </div>
        ))}
      </div>
    </div>
    <div className="space-y-3">
      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span className="text-sm text-gray-600">Live Interview Session</span>
      </div>
      <div className="flex gap-2">
        <button className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Join Session
        </button>
        <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
          <FaShareAlt />
        </button>
      </div>
    </div>
  </div>
);

const SkillsMatrix = () => (
  <div className="bg-white rounded-2xl p-6 border border-gray-100 w-full">
    <h3 className="font-bold text-gray-800 mb-4">Skills Assessment</h3>
    <div className="grid grid-cols-1 gap-4">
      {DEFAULT_SKILLS_DATA.map((skill, index) => (
        <div key={index} className="relative">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
              style={{ width: `${skill.score}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-sm text-gray-600">{skill.name}</span>
            <span className="text-sm font-medium text-gray-800">{skill.score}%</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const CustomRadialChart = () => {
  const data = {
    labels: DEFAULT_SKILLS_DATA.map(skill => skill.name),
    datasets: [
      {
        label: 'Skill Scores',
        data: DEFAULT_SKILLS_DATA.map(skill => skill.score),
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        pointBackgroundColor: 'rgba(75, 192, 192, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(75, 192, 192, 1)',
      },
    ],
  };

  const options = {
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        angleLines: {
          display: true,
          color: 'rgba(75, 192, 192, 0.2)'
        },
        grid: {
          color: 'rgba(75, 192, 192, 0.2)'
        },
        pointLabels: {
          font: {
            size: 14,
            weight: 'bold'
          },
          color: '#4A5568'
        }
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-lg w-3/4 mx-auto">
      <h3 className="font-bold text-gray-800 mb-4">Skills Assessment Custom Radial Chart</h3>
      <Radar data={data} options={options} />
    </div>
  );
};

const SkillsGraph = () => {
  const chartColors = {
    backgroundColor: [
      'rgba(99, 102, 241, 0.8)',    // These could be dynamic based on theme
      'rgba(139, 92, 246, 0.8)',
      'rgba(59, 130, 246, 0.8)',
      'rgba(14, 165, 233, 0.8)'
    ],
    borderColor: [
      'rgba(99, 102, 241, 1)',
      'rgba(139, 92, 246, 1)',
      'rgba(59, 130, 246, 1)',
      'rgba(14, 165, 233, 1)'
    ]
  };

  const data = {
    labels: DEFAULT_SKILLS_DATA.map(skill => skill.name),
    datasets: [
      {
        label: 'Skill Scores',
        data: DEFAULT_SKILLS_DATA.map(skill => skill.score),
        backgroundColor: chartColors.backgroundColor,
        borderColor: chartColors.borderColor,
        borderWidth: 1,
      },
    ],
  };

  const options = {
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  const donutData = {
    labels: DEFAULT_SKILLS_DATA.map(skill => skill.name),
    datasets: [{
      data: DEFAULT_SKILLS_DATA.map(skill => skill.score),
      backgroundColor: chartColors.backgroundColor,
      borderColor: chartColors.borderColor,
      borderWidth: 2,
      hoverOffset: 15
    }]
  };

  const donutOptions = {
    cutout: '70%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          font: {
            size: 12,
            weight: 'bold'
          }
        }
      }
    },
    animation: {
      animateScale: true,
      animateRotate: true
    }
  };

  return (
    <div className="grid grid-cols-2 gap-6">
      <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl p-4 border border-blue-100 shadow-lg h-[300px]">
        <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2 text-sm">
          <FaChartLine className="text-blue-600" />
          Skills Distribution
        </h3>
        <div className="h-[250px] flex items-center justify-center">
          <PolarArea 
            data={data} 
            options={{
              ...options,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: true,
                  position: 'right',
                  labels: {
                    boxWidth: 10,
                    padding: 10,
                    font: { size: 10 }
                  }
                }
              }
            }} 
          />
        </div>
      </div>
      <div className="bg-gradient-to-br from-white to-indigo-50 rounded-2xl p-4 border border-indigo-100 shadow-lg h-[300px]">
        <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2 text-sm">
          <FaChartPie className="text-indigo-600" />
          Competency Overview
        </h3>
        <div className="h-[250px] flex items-center justify-center">
          <Doughnut 
            data={donutData} 
            options={{
              ...donutOptions,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'bottom',
                  labels: {
                    boxWidth: 10,
                    padding: 8,
                    font: { size: 10 }
                  }
                }
              }
            }} 
          />
        </div>
      </div>
    </div>
  );
};

// Interview Card Component for the dropdown
const InterviewCard = ({ interview }) => (
  <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-md mb-4 hover:shadow-lg transition-shadow min-w-max">
    <div className="flex justify-between items-center mb-4">
      <div>
        <h3 className="font-bold text-lg text-gray-800">{interview.name}</h3>
        <p className="text-blue-600 font-medium">{interview.role}</p>
      </div>
      <div className="text-right">
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <FaCalendarAlt className="text-indigo-500" />
          {interview.date}
        </div>
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <FaRegClock className="text-indigo-500" />
          {interview.time}
        </div>
      </div>
    </div>
    
    <div className="grid grid-cols-2 gap-4 mb-4">
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
          <FaCode className="text-indigo-500" /> Key Skills
        </h4>
        <div className="flex flex-wrap gap-2">
          {interview.skills.map((skill, index) => (
            <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
              {skill}
            </span>
          ))}
        </div>
      </div>
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
          <FaUserTie className="text-indigo-500" /> Status
        </h4>
        <span className={`px-3 py-1 text-xs font-medium rounded-full ${
          interview.status === "Confirmed" 
            ? "bg-green-100 text-green-800" 
            : "bg-yellow-100 text-yellow-800"
        }`}>
          {interview.status}
        </span>
      </div>
    </div>
    
    <div className="border-t border-gray-100 pt-4">
      <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
        <FaBuilding className="text-indigo-500" /> Work Experience
      </h4>
      <div className="space-y-2">
        {interview.experience.map((exp, index) => (
          <div key={index} className="flex justify-between text-sm">
            <span className="font-medium">{exp.company} - {exp.position}</span>
            <span className="text-gray-500">{exp.duration}</span>
          </div>
        ))}
      </div>
    </div>
    
    <div className="border-t border-gray-100 pt-4 mt-4">
      <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
        <FaBrain className="text-indigo-500" /> Education
      </h4>
      <p className="text-sm text-gray-600">{interview.education}</p>
    </div>
    
    <div className="mt-4 flex justify-end gap-2">
      <button 
        className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-200 transition-colors"
        onClick={() => handleScheduleInterview(interview)}
      >
        View Details
      </button>
      <button 
        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        onClick={() => handleScheduleInterview(interview)}
      >
        Start Interview
      </button>
    </div>
  </div>
);

// Stats Card Component with Dropdown
const StatsCard = ({ stat, showDropdown, toggleDropdown, dropdownContent }) => (
  <div className="relative group">
    <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl blur-lg"></div>
    <div 
      className={`relative bg-white p-6 rounded-xl border ${showDropdown ? 'border-blue-300 shadow-blue-100' : 'border-gray-100'} shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer`}
      onClick={toggleDropdown}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-500 text-sm font-medium">{stat.title}</p>
          <h3 className="text-3xl font-bold mt-2 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            {stat.count}
          </h3>
          <p className="text-sm text-gray-400 mt-1">{stat.trend}</p>
        </div>
        <div className={`p-3 rounded-lg bg-gradient-to-r ${stat.color} text-white`}>
          {stat.icon}
        </div>
      </div>
      <div className="mt-2 flex justify-end">
        {showDropdown ? <FaAngleUp className="text-gray-400" /> : <FaAngleDown className="text-gray-400" />}
      </div>
    </div>
    
    {/* Dropdown Panel */}
    {showDropdown && dropdownContent}
  </div>
);

// Main Component
const CandidateEvaluation = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [timelineEventsState, setTimelineEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Initialize all states with null or empty values instead of defaults
  const [skillsData, setSkillsData] = useState(null);
  const [collaborators, setCollaborators] = useState(null);
  const [scheduledInterviewsData, setScheduledInterviewsData] = useState(null);
  const [statsData, setStatsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterOptions, setFilterOptions] = useState(null);
  const [searchConfig, setSearchConfig] = useState(null);
  const [chartConfig, setChartConfig] = useState(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch all data in parallel for better performance
      const [skillsResponse, collaboratorsResponse, interviewsResponse, statsResponse] = await Promise.all([
        fetch('/api/recruiter/skills-assessment'),
        fetch('/api/recruiter/collaborators'),
        fetch('/api/recruiter/scheduled-interviews'),
        fetch('/api/recruiter/evaluation-stats')
      ]);

      // Check if any request failed and include status codes in error messages
      if (!skillsResponse.ok) throw new Error(`Skills data fetch failed: ${skillsResponse.status}`);
      if (!collaboratorsResponse.ok) throw new Error(`Collaborators fetch failed: ${collaboratorsResponse.status}`);
      if (!interviewsResponse.ok) throw new Error(`Interviews fetch failed: ${interviewsResponse.status}`);
      if (!statsResponse.ok) throw new Error(`Stats fetch failed: ${statsResponse.status}`);

      // Add response type validation
      const [
        skillsResult,
        collaboratorsResult,
        interviewsResult,
        statsResult
      ] = await Promise.all([
        skillsResponse.json().catch(() => null),
        collaboratorsResponse.json().catch(() => null),
        interviewsResponse.json().catch(() => null),
        statsResponse.json().catch(() => null)
      ]);

      // Validate response data
      if (!skillsResult) throw new Error('Invalid skills data format');
      if (!collaboratorsResult) throw new Error('Invalid collaborators data format');
      if (!interviewsResult) throw new Error('Invalid interviews data format');
      if (!statsResult) throw new Error('Invalid stats data format');

      // Update all states with fetched data
      setSkillsData(skillsResult || DEFAULT_SKILLS_DATA);
      setCollaborators(collaboratorsResult || DEFAULT_COLLABORATORS);
      setScheduledInterviewsData(interviewsResult || DEFAULT_INTERVIEWS_DATA);
      setStatsData(statsResult || {
        scheduled: { count: 0, trend: '0 today' },
        onhold: { count: 0, trend: '0% this week' },
        success: { count: '0%', trend: '0% vs last month' },
        avgtime: { count: '0m', trend: 'per interview' }
      });

    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error.message);
      // Use default data as fallback
      setSkillsData(DEFAULT_SKILLS_DATA);
      setCollaborators(DEFAULT_COLLABORATORS);
      setScheduledInterviewsData(DEFAULT_INTERVIEWS_DATA);
      setStatsData({
        scheduled: { count: 0, trend: '0 today' },
        onhold: { count: 0, trend: '0% this week' },
        success: { count: '0%', trend: '0% vs last month' },
        avgtime: { count: '0m', trend: 'per interview' }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchConfigurations = async () => {
    try {
      // In development, use default configurations
      setFilterOptions({
        status: ['All', 'Confirmed', 'Pending'],
        skills: ['All', 'React', 'TypeScript', 'Next.js', 'Docker', 'Kubernetes', 'AWS'],
        experience: ['All', '0-2 years', '2-5 years', '5+ years']
      });

      setSearchConfig({
        placeholder: 'Search candidates...',
        filters: true,
        sorting: true
      });

      setChartConfig({
        showLegend: true,
        enableAnimation: true,
        responsiveness: true,
        tooltips: true
      });

    } catch (error) {
      console.error('Error fetching configurations:', error);
    }
  };

  useEffect(() => {
    fetchData();
    fetchConfigurations();
    // Set up periodic refresh (every 5 minutes)
    const intervalId = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, []);

  // Add loading state
  if (isLoading && !skillsData) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  // Add error state
  if (error && !skillsData) {
    return (
      <div className="p-8 text-center text-red-600">
        Error loading data: {error}
      </div>
    );
  }

  // Update statsCards to use actual data
  const statsCards = [
    { 
      id: "scheduled", 
      title: 'Scheduled Interviews', 
      count: statsData?.scheduled?.count || 0, 
      trend: statsData?.scheduled?.trend || '0 today',
      icon: <FaRegCalendarAlt className="text-3xl" />, 
      color: 'from-pink-500 to-rose-600'
    },
    { 
      id: "onhold", 
      title: 'On Hold Interviews', 
      count: statsData?.onhold?.count || 0, 
      trend: statsData?.onhold?.trend || '0% this week',
      icon: <FaPauseCircle className="text-3xl" />, 
      color: 'from-yellow-500 to-orange-600'  
    },
    { 
      id: "success", 
      title: 'Success Rate', 
      count: statsData?.success?.count || '0%', 
      trend: statsData?.success?.trend || '0% vs last month',
      icon: <FaChartLine className="text-3xl" />, 
      color: 'from-teal-500 to-emerald-600' 
    },
    { 
      id: "avgtime", 
      title: 'Average Time', 
      count: statsData?.avgtime?.count || '0m', 
      trend: statsData?.avgtime?.trend || 'per interview',
      icon: <FaRegClock className="text-3xl" />, 
      color: 'from-purple-500 to-violet-600' 
    }
  ];

  const addInterview = (interview) => {
    const newEvent = {
      title: `${interview.interviewType} Interview with ${interview.candidateName}`,
      time: `${interview.date} ${interview.time}`,
      icon: <FaRegCalendarAlt />
    };
    setTimelineEvents([...timelineEventsState, newEvent]);
  };

  const toggleDropdown = (id) => {
    if (activeDropdown === id) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(id);
    }
  };

  // Add function to handle interview scheduling
  const handleScheduleInterview = async (interviewData) => {
    try {
      const response = await fetch('/api/scheduled-interviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(interviewData)
      });

      if (!response.ok) throw new Error('Failed to schedule interview');
      
      // Refresh the interviews data after scheduling
      fetchData();
    } catch (error) {
      console.error('Error scheduling interview:', error);
      // Handle error appropriately (e.g., show error message to user)
    }
  };

  return (
    <div className="space-y-8 p-0">
      {/* Header Section */}
      <div className="">
        <div className="mb-4">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-500 to-indigo-600 bg-clip-text text-transparent animate-gradient">
            Candidate Evaluation Hub
          </h1>
          <p className="text-gray-600 mt-3 text-lg font-medium tracking-wide border-l-4 border-blue-500 pl-4">
            Optimize Your Hiring with Data-Driven Insights and Seamless Interview Management
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-6">
          {statsCards.map((stat) => (
            <StatsCard 
              key={stat.id}
              stat={stat} 
              showDropdown={activeDropdown === stat.id}
              toggleDropdown={() => toggleDropdown(stat.id)}
              dropdownContent={
                stat.id === "scheduled" ? (
                  <div className="absolute left-0 right-0 z-50 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 p-4 transform transition-all duration-300 w-screen max-w-6xl">
                    <div className="mb-4 flex justify-between items-center">
                      <h3 className="font-bold text-gray-800">Scheduled Interviews</h3>
                      <div className="flex gap-2">
                        <div className="relative">
                          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input 
                            type="text" 
                            placeholder="Search candidates..." 
                            className="pl-9 pr-4 py-2 rounded-lg border border-gray-200 text-sm w-full"
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                        </div>
                        <select 
                          className="px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white"
                          value={filterStatus}
                          onChange={(e) => setFilterStatus(e.target.value)}
                        >
                          <option value="all">All Status</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="pending">Pending</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="max-h-96 overflow-y-auto overflow-x-auto">
                      <div className="flex gap-4 pb-2 min-w-max">
                        {scheduledInterviewsData.length > 0 ? (
                          scheduledInterviewsData
                            .filter(interview => 
                              interview.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              interview.role.toLowerCase().includes(searchTerm.toLowerCase())
                            )
                            .map(interview => (
                              <InterviewCard key={interview.id} interview={interview} />
                            ))
                        ) : (
                          <div className="text-center py-6 text-gray-500 w-full">
                            No interviews found matching your criteria
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : null
              }
            />
          ))}
        </div>
      </div>
      {/* Main Content Grid */}
      <div className="grid grid-cols-3 gap-8">
        {/* Left Column - Skills Assessment */} 
        <div className="col-span-1 space-y-8">
          {/* Skills Assessment moved here */}
          <SkillsMatrix />
        </div>
        {/* Right Column - Tools and Insights */}
        <div className="col-span-2 space-y-8">
          {/* Full width graphs */}
          <div className="grid grid-cols-1 gap-8">
            <SkillsGraph />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateEvaluation;