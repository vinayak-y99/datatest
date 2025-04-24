'use client';
import React, { useState } from 'react';
import { 
  FaUserTie, FaClipboardList, FaMicrophone, FaUserClock, 
  FaCheckCircle, FaUserPlus, FaSearch, 
  FaFilter, FaBriefcase, FaRegClock, FaChartLine, 
  FaRegCalendarAlt, FaBrain, FaExclamationCircle, 
  FaShareAlt, FaEllipsisV, FaLaptopCode, FaSort, FaChartPie, FaPauseCircle,
  FaAngleDown, FaAngleUp, FaCalendarAlt, FaCode, FaBuilding
} from 'react-icons/fa';
import { PolarArea, Bar, Radar, Doughnut } from 'react-chartjs-2';
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

// Sample Data
const timelineEvents = [
  { title: 'Technical Interview', time: '10:00 AM', icon: <FaLaptopCode /> },
  { title: 'HR Discussion', time: '11:30 AM', icon: <FaUserTie /> },
  { title: 'Skills Assessment', time: '2:00 PM', icon: <FaClipboardList /> }
];

const collaborators = [
  { name: 'John Smith', avatar: '/avatars/1.jpg' },
  { name: 'Sarah Johnson', avatar: '/avatars/2.jpg' },
  { name: 'Mike Brown', avatar: '/avatars/3.jpg' }
];

const skillsData = [
  { name: 'Technical Skills', score: 85 },
  { name: 'Communication', score: 90 },
  { name: 'Problem Solving', score: 88 },
  { name: 'Team Collaboration', score: 92 }
];

// Sample Scheduled Interviews Data
const scheduledInterviewsData = [
  {
    id: 1,
    name: "Alex Johnson",
    role: "Senior React Developer",
    date: "March 12, 2025",
    time: "10:00 AM",
    skills: ["React", "TypeScript", "Node.js", "GraphQL"],
    experience: [
      { company: "TechCorp", position: "Frontend Developer", duration: "2020-2023" },
      { company: "WebSolutions", position: "Junior Developer", duration: "2018-2020" }
    ],
    education: "MS Computer Science, Stanford University",
    status: "Confirmed"
  },
  {
    id: 2,
    name: "Priya Patel",
    role: "UX/UI Designer",
    date: "March 12, 2025",
    time: "2:30 PM",
    skills: ["Figma", "Adobe XD", "User Research", "Prototyping"],
    experience: [
      { company: "DesignHub", position: "UI Designer", duration: "2021-2023" },
      { company: "Creative Solutions", position: "Graphic Designer", duration: "2019-2021" }
    ],
    education: "BFA Design, Rhode Island School of Design",
    status: "Pending Confirmation"
  },
  {
    id: 3,
    name: "Marcus Williams",
    role: "DevOps Engineer",
    date: "March 13, 2025",
    time: "11:00 AM",
    skills: ["Kubernetes", "Docker", "AWS", "CI/CD", "Terraform"],
    experience: [
      { company: "CloudTech", position: "Systems Engineer", duration: "2019-2023" },
      { company: "DataSystems", position: "IT Specialist", duration: "2017-2019" }
    ],
    education: "BS Computer Engineering, MIT",
    status: "Confirmed"
  },
  {
    id: 4,
    name: "Sarah Chen",
    role: "Data Scientist",
    date: "March 14, 2025",
    time: "9:00 AM",
    skills: ["Python", "Machine Learning", "TensorFlow", "Data Visualization"],
    experience: [
      { company: "DataInsights", position: "Data Analyst", duration: "2020-2023" },
      { company: "Research Lab", position: "Research Assistant", duration: "2018-2020" }
    ],
    education: "PhD Statistics, UC Berkeley",
    status: "Confirmed"
  },
  {
    id: 5,
    name: "Jordan Taylor",
    role: "Product Manager",
    date: "March 14, 2025",
    time: "3:00 PM",
    skills: ["Product Strategy", "Agile", "Market Research", "User Stories"],
    experience: [
      { company: "ProductX", position: "Associate PM", duration: "2021-2023" },
      { company: "TechStartup", position: "Business Analyst", duration: "2019-2021" }
    ],
    education: "MBA, Harvard Business School",
    status: "Pending Confirmation"
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
        {collaborators.map((collaborator, index) => (
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
      {skillsData.map((skill, index) => (
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
    labels: skillsData.map(skill => skill.name),
    datasets: [
      {
        label: 'Skill Scores',
        data: skillsData.map(skill => skill.score),
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
  const data = {
    labels: skillsData.map(skill => skill.name),
    datasets: [
      {
        label: 'Skill Scores',
        data: skillsData.map(skill => skill.score),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)'
        ],
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
    labels: skillsData.map(skill => skill.name),
    datasets: [{
      data: skillsData.map(skill => skill.score),
      backgroundColor: [
        'rgba(99, 102, 241, 0.8)',    // Indigo
        'rgba(139, 92, 246, 0.8)',    // Purple
        'rgba(59, 130, 246, 0.8)',    // Blue
        'rgba(14, 165, 233, 0.8)'     // Sky
      ],
      borderColor: [
        'rgba(99, 102, 241, 1)',
        'rgba(139, 92, 246, 1)',
        'rgba(59, 130, 246, 1)',
        'rgba(14, 165, 233, 1)'
      ],
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
      <button className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-200 transition-colors">
        View Details
      </button>
      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
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
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'confirmed', 'pending'

  // Filter interviews based on status
  const filteredInterviews = filterStatus === 'all' 
    ? scheduledInterviewsData 
    : scheduledInterviewsData.filter(interview => {
        if (filterStatus === 'confirmed') return interview.status === 'Confirmed';
        if (filterStatus === 'pending') return interview.status === 'Pending Confirmation';
        return true;
      });

  const addInterview = (interview) => {
    const newEvent = {
      title: `${interview.interviewType} Interview with ${interview.candidateName}`,
      time: `${interview.date} ${interview.time}`,
      icon: <FaRegCalendarAlt />
    };
    setTimelineEvents([...timelineEventsState, newEvent]);
  };

  const statsCards = [
    { 
      id: "scheduled", 
      title: 'Scheduled Interviews', 
      count: 45, 
      trend: '8 today',
      icon: <FaRegCalendarAlt className="text-3xl" />, 
      color: 'from-pink-500 to-rose-600'
    },
    { 
      id: "onhold", 
      title: 'On Hold Interviews', 
      count: 20, 
      trend: '+5% this week',
      icon: <FaPauseCircle className="text-3xl" />, 
      color: 'from-yellow-500 to-orange-600'  
    },
    { 
      id: "success", 
      title: 'Success Rate', 
      count: '89%', 
      trend: '+5% vs last month',
      icon: <FaChartLine className="text-3xl" />, 
      color: 'from-teal-500 to-emerald-600' 
    },
    { 
      id: "avgtime", 
      title: 'Average Time', 
      count: '45m', 
      trend: 'per interview',
      icon: <FaRegClock className="text-3xl" />, 
      color: 'from-purple-500 to-violet-600' 
    }
  ];

  const toggleDropdown = (id) => {
    if (activeDropdown === id) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(id);
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
                        {filteredInterviews.length > 0 ? (
                          filteredInterviews
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