


import React, { useState } from 'react';
import {  Star, ChevronRight, X, Plus, Minus, Calendar, Check, AlertTriangle, Activity, Users, Award, UserCheck,  } from 'lucide-react';

const ClientDashboard = () => {
  // Initial state data
 
  const initialHiringProcesses = [
    {
      id: 1,
      title: 'Senior Developer',
      stage: 'Technical Interview',
      candidates: 5,
      progress: 65,
      startDate: '2025-01-15',
      bgColor: 'bg-yellow-500',
      textGradient: 'from-yellow-500 to-yellow-700'
    },
    {
      id: 2,
      title: 'Marketing Specialist',
      stage: 'Initial Screening',
      candidates: 8,
      progress: 25,
      startDate: '2025-02-10',
      bgColor: 'bg-green-500',
      textGradient: 'from-green-500 to-green-700'
    },
    {
      id: 3,
      title: 'Operations Manager',
      stage: 'Final Interview',
      candidates: 2,
      progress: 90,
      startDate: '2025-01-05',
      bgColor: 'bg-red-500',
      textGradient: 'from-red-500 to-red-700'
    }
  ];

  const initialPendingEvaluations = [
    {
      id: 1,
      name: 'Chris Morgan',
      position: 'Senior Developer',
      evaluator: 'Technical Team',
      dueDate: '2025-02-25',
      status: 'Pending'
    },
    {
      id: 2,
      name: 'Jordan Rivera',
      position: 'Marketing Specialist',
      evaluator: 'Marketing Director',
      dueDate: '2025-02-22',
      status: 'In Progress'
    }
  ];

  const initialTopCandidates = [
    {
      id: 1,
      name: 'Taylor Wilson',
      position: 'Senior Developer',
      rating: 4.7,
      stage: 'Offer Preparation',
      interviewDate: '2025-02-15'
    },
    {
      id: 2,
      name: 'Jamie Lee',
      position: 'Marketing Specialist',
      rating: 4.5,
      stage: 'Background Check',
      interviewDate: '2025-02-16'
    },
    {
      id: 3,
      name: 'Alex Johnson',
      position: 'Operations Manager',
      rating: 4.8,
      stage: 'Final Decision',
      interviewDate: '2025-02-18'
    }
  ];

  // New data models for the requested features
  const initialActiveJobs = [
    {
      id: 1,
      title: 'Senior Developer',
      department: 'Engineering',
      location: 'Remote',
      applicants: 32,
      newApplicants: 5,
      daysActive: 12,
      priority: 'High',
      status: 'Active'
    },
    {
      id: 2,
      title: 'Marketing Specialist',
      department: 'Marketing',
      location: 'New York',
      applicants: 45,
      newApplicants: 8,
      daysActive: 7,
      priority: 'Medium',
      status: 'Active'
    },
    {
      id: 3,
      title: 'Operations Manager',
      department: 'Operations',
      location: 'Chicago',
      applicants: 28,
      newApplicants: 3,
      daysActive: 15,
      priority: 'High',
      status: 'Active'
    },
    {
      id: 4,
      title: 'Data Analyst',
      department: 'Analytics',
      location: 'Remote',
      applicants: 18,
      newApplicants: 0,
      daysActive: 21,
      priority: 'Low',
      status: 'On Hold'
    }
  ];

  const initialPendingInterviews = [
    {
      id: 1,
      candidateName: 'Robin Huang',
      position: 'Senior Developer',
      interviewType: 'Technical',
      date: '2025-03-05',
      time: '10:00 AM',
      interviewers: ['James Wilson', 'Sarah Chen'],
      status: 'Confirmed'
    },
    {
      id: 2,
      candidateName: 'Devi Patel',
      position: 'Marketing Specialist',
      interviewType: 'Final Round',
      date: '2025-03-04',
      time: '2:00 PM',
      interviewers: ['Michael Rodriguez', 'Emily Clark'],
      status: 'Pending Confirmation'
    },
    {
      id: 3,
      candidateName: 'Marcus Johnson',
      position: 'Operations Manager',
      interviewType: 'Culture Fit',
      date: '2025-03-06',
      time: '11:30 AM',
      interviewers: ['Laura Thompson'],
      status: 'Confirmed'
    },
    {
      id: 4,
      candidateName: 'Sophia Lee',
      position: 'Data Analyst',
      interviewType: 'Initial Screening',
      date: '2025-03-07',
      time: '9:00 AM',
      interviewers: ['Robert Chen'],
      status: 'Scheduling'
    }
  ];

  const initialRecruiters = [
    {
      id: 1,
      name: 'Jessica Parker',
      title: 'Senior Recruiter',
      assignedPositions: ['Senior Developer', 'Data Analyst'],
      activeCandidates: 15,
      availability: 'Available'
    },
    {
      id: 2,
      name: 'Robert Chen',
      title: 'Technical Recruiter',
      assignedPositions: ['Marketing Specialist'],
      activeCandidates: 8,
      availability: 'Busy'
    },
    {
      id: 3,
      name: 'Sarah Thompson',
      title: 'Executive Recruiter',
      assignedPositions: ['Operations Manager'],
      activeCandidates: 6,
      availability: 'Available'
    }
  ];

  const initialTechnicalPanel = [
    {
      id: 1,
      name: 'James Wilson',
      department: 'Engineering',
      expertise: 'Backend Development',
      assignedInterviews: 3,
      availability: 'Limited'
    },
    {
      id: 2,
      name: 'Sarah Chen',
      department: 'Engineering',
      expertise: 'Frontend Development',
      assignedInterviews: 2,
      availability: 'Available'
    },
    {
      id: 3,
      name: 'Michael Rodriguez',
      department: 'Marketing',
      expertise: 'Digital Marketing',
      assignedInterviews: 1,
      availability: 'Available'
    },
    {
      id: 4,
      name: 'Laura Thompson',
      department: 'Operations',
      expertise: 'Supply Chain Management',
      assignedInterviews: 2,
      availability: 'Limited'
    }
  ];

  // State management
  
  const [hiringProcesses, setHiringProcesses] = useState(initialHiringProcesses);
  const [pendingEvaluations, setPendingEvaluations] = useState(initialPendingEvaluations);
  const [topCandidates, setTopCandidates] = useState(initialTopCandidates);
  const [selectedProcess, setSelectedProcess] = useState(null);
  const [showAddProcessModal, setShowAddProcessModal] = useState(false);
  const [activeTab, setActiveTab] = useState('processes');
  
  // New state for the requested features
  const [activeJobs, setActiveJobs] = useState(initialActiveJobs);
  const [pendingInterviews, setPendingInterviews] = useState(initialPendingInterviews);
  const [recruiters, setRecruiters] = useState(initialRecruiters);
  const [technicalPanel, setTechnicalPanel] = useState(initialTechnicalPanel);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignmentType, setAssignmentType] = useState('');
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [newInterview, setNewInterview] = useState({
    candidateName: '',
    position: '',
    interviewType: 'Initial Screening',
    date: new Date().toISOString().split('T')[0],
    time: '10:00 AM',
    interviewers: [],
    status: 'Scheduling'
  });

  const [newProcess, setNewProcess] = useState({
    title: '',
    stage: 'Initial Screening',
    candidates: 0,
    progress: 0,
    startDate: new Date().toISOString().split('T')[0],
    bgColor: 'bg-blue-500',
    textGradient: 'from-blue-500 to-blue-700'
  });

  // Handler functions
  const handleProcessClick = (process) => {
    setSelectedProcess(process);
  };

  const closeProcessDetails = () => {
    setSelectedProcess(null);
  };

  const handleStatusChange = (evaluationId, newStatus) => {
    setPendingEvaluations(
      pendingEvaluations.map(evaluation => 
        evaluation.id === evaluationId 
          ? { ...evaluation, status: newStatus } 
          : evaluation
      )
    );

    if (newStatus === 'Completed') {
      setSummaryCards(
        summaryCards.map(card => 
          card.title === 'Pending Evaluations' 
            ? { ...card, count: card.count - 1 } 
            : card
        )
      );
    }
  };

  const updateProcessProgress = (processId, newProgress) => {
    setHiringProcesses(
      hiringProcesses.map(process => 
        process.id === processId 
          ? { ...process, progress: newProgress } 
          : process
      )
    );
  };

  const toggleAddProcessModal = () => {
    setShowAddProcessModal(!showAddProcessModal);
  };

  const handleNewProcessChange = (e) => {
    const { name, value } = e.target;
    
    // If changing bgColor, also update textGradient
    if (name === 'bgColor') {
      const color = value.split('-')[1];
      const textGradient = `from-${color}-500 to-${color}-700`;
      
      setNewProcess({
        ...newProcess,
        [name]: value,
        textGradient
      });
    } else {
      setNewProcess({
        ...newProcess,
        [name]: value
      });
    }
  };

  const addNewProcess = () => {
    const processToAdd = {
      ...newProcess,
      id: hiringProcesses.length + 1,
    };
    
    setHiringProcesses([...hiringProcesses, processToAdd]);
    setSummaryCards(
      summaryCards.map(card => 
        card.title === 'Active Hiring' 
          ? { ...card, count: card.count + 1 } 
          : card
      )
    );
    
    // Also add to active jobs
    const newJob = {
      id: activeJobs.length + 1,
      title: newProcess.title,
      department: 'New Department',
      location: 'Remote',
      applicants: 0,
      newApplicants: 0,
      daysActive: 0,
      priority: 'Medium',
      status: 'Active'
    };
    
    setActiveJobs([...activeJobs, newJob]);
    
    setNewProcess({
      title: '',
      stage: 'Initial Screening',
      candidates: 0,
      progress: 0,
      startDate: new Date().toISOString().split('T')[0],
      bgColor: 'bg-blue-500',
      textGradient: 'from-blue-500 to-blue-700'
    });
    setShowAddProcessModal(false);
  };

  const advanceCandidateStage = (candidateId) => {
    const stageProgressions = {
      'Background Check': 'Offer Preparation',
      'Offer Preparation': 'Offer Accepted',
      'Final Decision': 'Offer Preparation'
    };

    setTopCandidates(
      topCandidates.map(candidate => {
        if (candidate.id === candidateId && stageProgressions[candidate.stage]) {
          return { ...candidate, stage: stageProgressions[candidate.stage] };
        }
        return candidate;
      })
    );
  };

  // New handler functions for the requested features
  const handleJobStatusChange = (jobId, newStatus) => {
    setActiveJobs(
      activeJobs.map(job => 
        job.id === jobId 
          ? { ...job, status: newStatus } 
          : job
      )
    );
    
    if (newStatus === 'Closed') {
      setSummaryCards(
        summaryCards.map(card => 
          card.title === 'Active Hiring' 
            ? { ...card, count: card.count - 1 } 
            : card
        )
      );
    }
  };

  const handleInterviewStatusChange = (interviewId, newStatus) => {
    setPendingInterviews(
      pendingInterviews.map(interview => 
        interview.id === interviewId 
          ? { ...interview, status: newStatus } 
          : interview
      )
    );
    
    if (newStatus === 'Completed') {
      setSummaryCards(
        summaryCards.map(card => 
          card.title === 'Pending Interviews' 
            ? { ...card, count: card.count - 1 } 
            : card
        )
      );
    }
  };

  const toggleAssignModal = (type, item) => {
    setAssignmentType(type);
    setSelectedAssignment(item);
    setShowAssignModal(!showAssignModal);
  };

  const closeAssignModal = () => {
    setShowAssignModal(false);
    setSelectedAssignment(null);
  };

  const handleAssignRecruiter = (recruiterId) => {
    if (selectedAssignment && assignmentType === 'job') {
      // Add job to recruiter's assigned positions
      setRecruiters(
        recruiters.map(recruiter => {
          if (recruiter.id === recruiterId) {
            const updatedPositions = [...recruiter.assignedPositions, selectedAssignment.title];
            return { 
              ...recruiter, 
              assignedPositions: updatedPositions,
              activeCandidates: recruiter.activeCandidates + selectedAssignment.applicants
            };
          }
          return recruiter;
        })
      );
    }
    closeAssignModal();
  };

  const handleAssignPanelist = (panelistId, interviewId) => {
    if (interviewId) {
      // Add panelist to interview
      setPendingInterviews(
        pendingInterviews.map(interview => {
          if (interview.id === interviewId) {
            const panelist = technicalPanel.find(p => p.id === panelistId);
            if (panelist && !interview.interviewers.includes(panelist.name)) {
              return { 
                ...interview, 
                interviewers: [...interview.interviewers, panelist.name]
              };
            }
          }
          return interview;
        })
      );
      
      // Update panelist's assigned interviews count
      setTechnicalPanel(
        technicalPanel.map(panelist => {
          if (panelist.id === panelistId) {
            return { 
              ...panelist, 
              assignedInterviews: panelist.assignedInterviews + 1,
              availability: panelist.assignedInterviews + 1 >= 3 ? 'Limited' : 'Available'
            };
          }
          return panelist;
        })
      );
    }
  };

  const toggleInterviewModal = () => {
    setShowInterviewModal(!showInterviewModal);
  };

  const handleNewInterviewChange = (e) => {
    const { name, value } = e.target;
    setNewInterview({
      ...newInterview,
      [name]: value
    });
  };

  const addNewInterview = () => {
    const interviewToAdd = {
      ...newInterview,
      id: pendingInterviews.length + 1,
      interviewers: []
    };
    
    setPendingInterviews([...pendingInterviews, interviewToAdd]);
    setSummaryCards(
      summaryCards.map(card => 
        card.title === 'Pending Interviews' 
          ? { ...card, count: card.count + 1 } 
          : card
      )
    );
    
    setNewInterview({
      candidateName: '',
      position: '',
      interviewType: 'Initial Screening',
      date: new Date().toISOString().split('T')[0],
      time: '10:00 AM',
      interviewers: [],
      status: 'Scheduling'
    });
    setShowInterviewModal(false);
  };
  const scheduleInterview = () => {
    const interviewToAdd = {
      ...newInterview,
      id: pendingInterviews.length + 1,
      interviewers: []
    };
    
    setPendingInterviews([...pendingInterviews, interviewToAdd]);
    setSummaryCards(
      summaryCards.map(card => 
        card.title === 'Pending Interviews' 
          ? { ...card, count: card.count + 1 } 
          : card
      )
    );
    
    setNewInterview({
      candidateName: '',
      position: '',
      interviewType: 'Initial Screening',
      date: new Date().toISOString().split('T')[0],
      time: '10:00 AM',
      interviewers: [],
      status: 'Scheduling'
    });
    setShowInterviewModal(false);
  };


  return (
    <div className="min-h-screen bg-gray-50 w-full">
      {/* Header Section with Gradient Text */}
      <div className="w-full">
        <div className="flex justify-between items-center p-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
              Client Dashboard
            </h1>
            <p className="text-lg text-gray-600">
              Welcome, Acme Corporation
            </p>
          </div>
          
          <div className="text-right">
            <p className="text-lg font-medium text-gray-700">
              Account Manager: <span className="font-bold">Jessica Parker</span>
            </p>
           
          </div>
        </div>
      </div>

      <div className="w-full">
        

        {/* Navigation Tabs */}
        <div className="flex flex-wrap space-x-2 my-4 bg-white p-1 rounded shadow">
          <button 
            className={`px-4 py-2 rounded font-medium transition-all ${
              activeTab === 'processes' 
                ? 'bg-blue-500 text-white' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('processes')}
          >
            Hiring Processes
          </button>
          <button 
            className={`px-4 py-2 rounded font-medium transition-all ${
              activeTab === 'evaluations' 
                ? 'bg-purple-500 text-white' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('evaluations')}
          >
            Evaluations
          </button>
          <button 
            className={`px-4 py-2 rounded font-medium transition-all ${
              activeTab === 'candidates' 
                ? 'bg-emerald-500 text-white' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('candidates')}
          >
            Top Candidates
          </button>
          <button 
            className={`px-4 py-2 rounded font-medium transition-all ${
              activeTab === 'jobs' 
                ? 'bg-indigo-500 text-white' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('jobs')}
          >
            Active Jobs
          </button>
          <button 
            className={`px-4 py-2 rounded font-medium transition-all ${
              activeTab === 'interviews' 
                ? 'bg-orange-500 text-white' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('interviews')}
          >
            Pending Interviews
          </button>
          <button 
            className={`px-4 py-2 rounded font-medium transition-all ${
              activeTab === 'recruiters' 
                ? 'bg-pink-500 text-white' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('recruiters')}
          >
            Recruiter Assignments
          </button>
          <button 
            className={`px-4 py-2 rounded font-medium transition-all ${
              activeTab === 'techpanel' 
                ? 'bg-teal-500 text-white' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('techpanel')}
          >
            Technical Panel
          </button>
        </div>

        {/* Main Content Card with Gradient Text Headers */}
        <div className="bg-white rounded shadow p-4 w-full">
          {activeTab === 'processes' && (
            <div>
              <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-blue-700 bg-clip-text text-transparent">
                  Ongoing Hiring Processes
                </h2>
                <button 
                  onClick={toggleAddProcessModal}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-all flex items-center"
                >
                  <Plus size={18} className="mr-1" /> Add New Position
                </button>
              </div>
              <div className="mt-4 space-y-4">
                {hiringProcesses.map((process, index) => (
                  <div 
                    key={index} 
                    className="bg-gray-50 p-4 rounded hover:shadow transition-all cursor-pointer border border-gray-100"
                    onClick={() => handleProcessClick(process)}
                  >
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <h3 className={`text-xl font-semibold bg-gradient-to-r ${process.textGradient} bg-clip-text text-transparent`}>
                          {process.title}
                        </h3>
                        <p className="text-gray-600">
                          Current Stage: {process.stage} • {process.candidates} candidates
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-2xl font-bold bg-gradient-to-r ${process.textGradient} bg-clip-text text-transparent`}>
                          {process.progress}%
                        </p>
                        <p className="text-gray-600">Started: {process.startDate}</p>
                      </div>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${process.bgColor} transition-all`}
                        style={{ width: `${process.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'evaluations' && (
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-purple-700 bg-clip-text text-transparent pb-4 border-b border-gray-200">
                Pending Evaluations
              </h2>
              <div className="space-y-4 mt-4">
                {pendingEvaluations.map((evaluation, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded border border-gray-100">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-xl font-semibold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">
                          {evaluation.name}
                        </h3>
                        <p className="text-gray-600">Position: {evaluation.position}</p>
                        <p className="text-gray-600">Evaluator: {evaluation.evaluator}</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <select 
                          value={evaluation.status}
                          onChange={(e) => handleStatusChange(evaluation.id, e.target.value)}
                          className="px-3 py-2 rounded border border-gray-300 text-gray-700"
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                        </select>
                        <span className={`px-3 py-2 rounded text-white flex items-center ${
                          evaluation.status === 'Pending' ? 'bg-yellow-500' : 
                          evaluation.status === 'In Progress' ? 'bg-blue-500' : 'bg-green-500'
                        }`}>
                          {evaluation.status === 'Pending' && <AlertTriangle size={16} className="mr-1" />}
                          {evaluation.status === 'In Progress' && <Activity size={16} className="mr-1" />}
                          {evaluation.status === 'Completed' && <Check size={16} className="mr-1" />}
                          {evaluation.status}
                        </span>
                      </div>
                    </div>
                    <p className="text-red-500 font-semibold mt-3 flex items-center">
                      <Calendar size={16} className="mr-1" /> Due: {evaluation.dueDate}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'candidates' && (
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-500 to-emerald-700 bg-clip-text text-transparent pb-4 border-b border-gray-200">
                Top Candidate Status
              </h2>
              <div className="space-y-4 mt-4">
                {topCandidates.map((candidate, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded border border-gray-100">
                   <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-xl font-semibold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">
                          {candidate.name}
                        </h3>
                        <p className="text-gray-600">Position: {candidate.position}</p>
                      </div>
                      <div className="flex items-center bg-yellow-100 px-3 py-2 rounded">
                        <Star size={16} className="text-yellow-500 mr-1" />
                        <span className="font-bold text-gray-800">{candidate.rating}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-3">
                      <span className="px-3 py-2 bg-blue-100 text-blue-800 rounded font-medium">
                        {candidate.stage}
                      </span>
                      <div className="flex items-center space-x-3">
                        <p className="text-gray-600 flex items-center">
                        <Calendar size={16} className="mr-1" /> {candidate.interviewDate}
                        </p>
                        <button 
                          onClick={() => advanceCandidateStage(candidate.id)}
                          className="px-3 py-2 bg-emerald-500 text-white rounded hover:bg-emerald-600 transition-all flex items-center"
                        >
                          <ChevronRight size={16} className="mr-1" /> Advance Stage
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'jobs' && (
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-indigo-700 bg-clip-text text-transparent pb-4 border-b border-gray-200">
                Active Job Listings
              </h2>
              <div className="space-y-4 mt-4">
                {activeJobs.map((job, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded border border-gray-100">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-xl font-semibold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">
                          {job.title}
                        </h3>
                        <p className="text-gray-600">Department: {job.department} • Location: {job.location}</p>
                        <p className="text-gray-600">Days Active: {job.daysActive}</p>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="flex items-center mb-2">
                          <span className={`px-3 py-1 rounded text-white text-sm mr-2 ${
                            job.priority === 'High' ? 'bg-red-500' : 
                            job.priority === 'Medium' ? 'bg-yellow-500' : 'bg-blue-500'
                          }`}>
                            {job.priority} Priority
                          </span>
                          <span className={`px-3 py-1 rounded text-white text-sm ${
                            job.status === 'Active' ? 'bg-green-500' : 
                            job.status === 'On Hold' ? 'bg-yellow-500' : 'bg-gray-500'
                          }`}>
                            {job.status}
                          </span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="flex items-center">
                            <Users size={16} className="mr-1 text-gray-600" /> 
                            <span className="font-bold text-gray-800">{job.applicants}</span>
                            {job.newApplicants > 0 && (
                              <span className="ml-1 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                +{job.newApplicants} new
                              </span>
                            )}
                          </span>
                          <button 
                            onClick={() => toggleAssignModal('job', job)}
                            className="px-3 py-1 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition-all text-sm"
                          >
                            Assign Recruiter
                          </button>
                          <select 
                            value={job.status}
                            onChange={(e) => handleJobStatusChange(job.id, e.target.value)}
                            className="px-3 py-1 rounded border border-gray-300 text-gray-700 text-sm"
                          >
                            <option value="Active">Active</option>
                            <option value="On Hold">On Hold</option>
                            <option value="Closed">Closed</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'interviews' && (
            <div>
              <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-orange-700 bg-clip-text text-transparent">
                  Pending Interviews
                </h2>
                <button 
                  onClick={toggleInterviewModal}
                  className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-all flex items-center"
                >
                  <Plus size={18} className="mr-1" /> Schedule Interview
                </button>
              </div>
              <div className="space-y-4 mt-4">
                {pendingInterviews.map((interview, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded border border-gray-100">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-xl font-semibold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">
                          {interview.candidateName}
                        </h3>
                        <p className="text-gray-600">Position: {interview.position}</p>
                        <p className="text-gray-600">
                          Type: {interview.interviewType} • 
                          Date: {interview.date} • 
                          Time: {interview.time}
                        </p>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className={`px-3 py-1 rounded text-white text-sm mb-2 ${
                          interview.status === 'Confirmed' ? 'bg-green-500' : 
                          interview.status === 'Pending Confirmation' ? 'bg-yellow-500' : 
                          interview.status === 'Completed' ? 'bg-blue-500' : 'bg-gray-500'
                        }`}>
                          {interview.status}
                        </span>
                        <div className="flex items-center space-x-3">
                          <button 
                            onClick={() => toggleAssignModal('interview', interview)}
                            className="px-3 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 transition-all text-sm"
                          >
                            Assign Interviewer
                          </button>
                          <select 
                            value={interview.status}
                            onChange={(e) => handleInterviewStatusChange(interview.id, e.target.value)}
                            className="px-3 py-1 rounded border border-gray-300 text-gray-700 text-sm"
                          >
                            <option value="Scheduling">Scheduling</option>
                            <option value="Pending Confirmation">Pending Confirmation</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Completed">Completed</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center flex-wrap">
                      <span className="text-gray-700 mr-2">Interviewers:</span>
                      {interview.interviewers.length > 0 ? (
                        interview.interviewers.map((interviewer, idx) => (
                          <span key={idx} className="bg-gray-200 text-gray-800 px-3 py-1 rounded mr-2 mb-2 text-sm">
                            {interviewer}
                          </span>
                        ))
                      ) : (
                        <span className="text-red-500 text-sm">No interviewers assigned</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'recruiters' && (
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-pink-700 bg-clip-text text-transparent pb-4 border-b border-gray-200">
                Recruiter Assignments
              </h2>
              <div className="space-y-4 mt-4">
                {recruiters.map((recruiter, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded border border-gray-100">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-xl font-semibold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">
                          {recruiter.name}
                        </h3>
                        <p className="text-gray-600">{recruiter.title}</p>
                      </div>
                      <div className="flex items-center">
                        <span className={`px-3 py-1 rounded text-white text-sm ${
                          recruiter.availability === 'Available' ? 'bg-green-500' : 'bg-yellow-500'
                        }`}>
                          {recruiter.availability}
                        </span>
                      </div>
                    </div>
                    <div className="mt-3">
                      <p className="text-gray-700 flex items-center mb-2">
                        <Award size={16} className="mr-1" /> 
                        Active Candidates: <span className="font-bold ml-1">{recruiter.activeCandidates}</span>
                      </p>
                      <div>
                        <p className="text-gray-700 mb-1">Assigned Positions:</p>
                        <div className="flex flex-wrap">
                          {recruiter.assignedPositions.length > 0 ? (
                            recruiter.assignedPositions.map((position, idx) => (
                              <span key={idx} className="bg-pink-100 text-pink-800 px-3 py-1 rounded mr-2 mb-2 text-sm">
                                {position}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-500 text-sm">No positions assigned</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'techpanel' && (
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-teal-500 to-teal-700 bg-clip-text text-transparent pb-4 border-b border-gray-200">
                Technical Interview Panel
              </h2>
              <div className="space-y-4 mt-4">
                {technicalPanel.map((panelist, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded border border-gray-100">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-xl font-semibold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">
                          {panelist.name}
                        </h3>
                        <p className="text-gray-600">Department: {panelist.department}</p>
                        <p className="text-gray-600">Expertise: {panelist.expertise}</p>
                      </div>
                      <div className="flex items-center">
                        <span className={`px-3 py-1 rounded text-white text-sm ${
                          panelist.availability === 'Available' ? 'bg-green-500' : 'bg-yellow-500'
                        }`}>
                          {panelist.availability}
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center">
                      <p className="text-gray-700 flex items-center">
                        <UserCheck size={16} className="mr-1" /> 
                        Assigned Interviews: <span className="font-bold ml-1">{panelist.assignedInterviews}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Process Details Modal */}
      {selectedProcess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded shadow-lg p-2 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-2xl font-bold bg-gradient-to-r ${selectedProcess?.textGradient || 'from-blue-500 to-blue-700'} bg-clip-text text-transparent`}>
                {selectedProcess.title}
              </h2>
              <button 
                onClick={closeProcessDetails}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded">
                <h3 className="font-semibold text-gray-700 mb-2">Process Details</h3>
                <p><span className="font-medium">Current Stage:</span> {selectedProcess.stage}</p>
                <p><span className="font-medium">Start Date:</span> {selectedProcess.startDate}</p>
                <p><span className="font-medium">Active Candidates:</span> {selectedProcess.candidates}</p>
                <div className="mt-3">
                  <p className="font-medium mb-1">Progress ({selectedProcess.progress}%)</p>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${selectedProcess.bgColor} transition-all`}
                      style={{ width: `${selectedProcess.progress}%` }}
                    />
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded">
                <h3 className="font-semibold text-gray-700 mb-2">Update Progress</h3>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => updateProcessProgress(
                      selectedProcess.id, 
                      Math.max(0, selectedProcess.progress - 5)
                    )}
                    className="p-2 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    <Minus size={16} />
                  </button>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden flex-1">
                    <div
                      className={`h-full ${selectedProcess.bgColor} transition-all`}
                      style={{ width: `${selectedProcess.progress}%` }}
                    />
                  </div>
                  <button 
                    onClick={() => updateProcessProgress(
                      selectedProcess.id, 
                      Math.min(100, selectedProcess.progress + 5)
                    )}
                    className="p-2 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded">
                <h3 className="font-semibold text-gray-700 mb-2">Process Timeline</h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex flex-col items-center mr-4">
                      <div className="h-6 w-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs">
                        <Check size={16} />
                      </div>
                      <div className="h-16 w-0.5 bg-gray-300 mt-1"></div>
                    </div>
                    <div>
                      <p className="font-medium">Initial Screening</p>
                      <p className="text-gray-600 text-sm">
                        Completed on {new Date(new Date(selectedProcess.startDate).getTime() + 5 * 86400000).toISOString().split('T')[0]}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex flex-col items-center mr-4">
                      <div className={`h-6 w-6 rounded-full ${selectedProcess.progress > 30 ? 'bg-green-500 text-white' : 'bg-gray-300'} flex items-center justify-center text-xs`}>
                        {selectedProcess.progress > 30 ? <Check size={16} /> : ''}
                      </div>
                      <div className="h-16 w-0.5 bg-gray-300 mt-1"></div>
                    </div>
                    <div>
                      <p className="font-medium">First Round Interviews</p>
                      <p className="text-gray-600 text-sm">
                        {selectedProcess.progress > 30 ? 'Completed' : 'Pending'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex flex-col items-center mr-4">
                      <div className={`h-6 w-6 rounded-full ${selectedProcess.progress > 60 ? 'bg-green-500 text-white' : 'bg-gray-300'} flex items-center justify-center text-xs`}>
                        {selectedProcess.progress > 60 ? <Check size={16} /> : ''}
                      </div>
                      <div className="h-16 w-0.5 bg-gray-300 mt-1"></div>
                    </div>
                    <div>
                      <p className="font-medium">Technical Assessment</p>
                      <p className="text-gray-600 text-sm">
                        {selectedProcess.progress > 60 ? 'Completed' : 'Pending'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex flex-col items-center mr-4">
                      <div className={`h-6 w-6 rounded-full ${selectedProcess.progress > 90 ? 'bg-green-500 text-white' : 'bg-gray-300'} flex items-center justify-center text-xs`}>
                        {selectedProcess.progress > 90 ? <Check size={16} /> : ''}
                      </div>
                    </div>
                    <div>
                      <p className="font-medium">Final Selection & Offer</p>
                      <p className="text-gray-600 text-sm">
                        {selectedProcess.progress > 90 ? 'Completed' : 'Pending'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button 
                onClick={closeProcessDetails}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 mr-2"
              >
                Close
              </button>
              <button 
                className={`px-4 py-2 ${selectedProcess.bgColor} text-white rounded hover:bg-opacity-90`}
              >
                View Detailed Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Process Modal */}
      {showAddProcessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded shadow-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-blue-700 bg-clip-text text-transparent">
                Add New Hiring Process
              </h2>
              <button 
                onClick={toggleAddProcessModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Position Title
                </label>
                <input 
                  type="text" 
                  name="title"
                  value={newProcess.title}
                  onChange={handleNewProcessChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Senior UI Designer"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Initial Stage
                </label>
                <select 
                  name="stage"
                  value={newProcess.stage}
                  onChange={handleNewProcessChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Initial Screening">Initial Screening</option>
                  <option value="Resume Review">Resume Review</option>
                  <option value="Phone Interview">Phone Interview</option>
                </select>
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Start Date
                </label>
                <input 
                  type="date" 
                  name="startDate"
                  value={newProcess.startDate}
                  onChange={handleNewProcessChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Color Theme
                </label>
                <select 
                  name="bgColor"
                  value={newProcess.bgColor}
                  onChange={handleNewProcessChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="bg-blue-500">Blue</option>
                  <option value="bg-green-500">Green</option>
                  <option value="bg-yellow-500">Yellow</option>
                  <option value="bg-red-500">Red</option>
                  <option value="bg-purple-500">Purple</option>
                  <option value="bg-indigo-500">Indigo</option>
                  <option value="bg-pink-500">Pink</option>
                </select>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button 
                onClick={toggleAddProcessModal}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 mr-2"
              >
                Cancel
              </button>
              <button 
                onClick={addNewProcess}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                disabled={!newProcess.title}
              >
                Add Process
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assignment Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded shadow-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-indigo-700 bg-clip-text text-transparent">
                {assignmentType === 'job' ? 'Assign Recruiter to Job' : 'Assign Interviewer'}
              </h2>
              <button 
                onClick={closeAssignModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            
            {selectedAssignment && (
              <div className="mb-4 p-3 bg-gray-50 rounded">
                <p className="font-medium">
                  {assignmentType === 'job' ? 'Selected Job:' : 'Selected Interview:'}
                </p>
                <p className="text-lg font-semibold">
                  {assignmentType === 'job' ? selectedAssignment.title : `${selectedAssignment.candidateName} - ${selectedAssignment.position}`}
                </p>
              </div>
            )}
            
            <div className="space-y-3 max-h-80 overflow-y-auto">
              <p className="font-medium text-gray-700">
                {assignmentType === 'job' ? 'Available Recruiters:' : 'Available Panel Members:'}
              </p>
              
              {assignmentType === 'job' ? (
                recruiters.map((recruiter) => (
                  <div 
                    key={recruiter.id} 
                    className="p-3 border border-gray-200 rounded hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleAssignRecruiter(recruiter.id)}
                  >
                    <p className="font-semibold">{recruiter.name}</p>
                    <p className="text-gray-600 text-sm">{recruiter.title}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-gray-600 text-sm">
                        Current Load: {recruiter.activeCandidates} candidates
                      </span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        recruiter.availability === 'Available' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {recruiter.availability}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                technicalPanel.map((panelist) => (
                  <div 
                    key={panelist.id} 
                    className="p-3 border border-gray-200 rounded hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleAssignPanelist(panelist.id, selectedAssignment.id)}
                  >
                    <p className="font-semibold">{panelist.name}</p>
                    <p className="text-gray-600 text-sm">{panelist.expertise}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-gray-600 text-sm">
                        Current Load: {panelist.assignedInterviews} interviews
                      </span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        panelist.availability === 'Available' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {panelist.availability}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="mt-6 flex justify-end">
              <button 
                onClick={closeAssignModal}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interview Scheduling Modal */}
      {showInterviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded shadow-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-orange-700 bg-clip-text text-transparent">
                Schedule New Interview
              </h2>
              <button 
                onClick={toggleInterviewModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Candidate Name
                </label>
                <input 
                  type="text" 
                  name="candidateName"
                  value={newInterview.candidateName}
                  onChange={handleNewInterviewChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="e.g., John Smith"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Position
                </label>
                <select 
                  name="position"
                  value={newInterview.position}
                  onChange={handleNewInterviewChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Select Position</option>
                  {hiringProcesses.map(process => (
                    <option key={process.id} value={process.title}>{process.title}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Interview Type
                </label>
                <select 
                  name="interviewType"
                  value={newInterview.interviewType}
                  onChange={handleNewInterviewChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="Initial Screening">Initial Screening</option>
                  <option value="Technical">Technical</option>
                  <option value="Behavioral">Behavioral</option>
                  <option value="Final Round">Final Round</option>
                  <option value="Culture Fit">Culture Fit</option>
                </select>
              </div>
              
              <div className="flex space-x-4">
                <div className="flex-1">
                  <label className="block text-gray-700 font-medium mb-1">
                    Date
                  </label>
                  <input 
                    type="date" 
                    name="date"
                    value={newInterview.date}
                    onChange={handleNewInterviewChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                
                <div className="flex-1">
                  <label className="block text-gray-700 font-medium mb-1">
                    Time
                  </label>
                  <input 
                    type="time" 
                    name="time"
                    value={newInterview.time}
                    onChange={handleNewInterviewChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Status
                </label>
                <select 
                  name="status"
                  value={newInterview.status}
                  onChange={handleNewInterviewChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="Scheduling">Scheduling</option>
                  <option value="Pending Confirmation">Pending Confirmation</option>
                  <option value="Confirmed">Confirmed</option>
                </select>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button 
                onClick={toggleInterviewModal}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 mr-2"
              >
                Cancel
              </button>
              <button 
                onClick={scheduleInterview}
                className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
                disabled={!newInterview.candidateName || !newInterview.position}
              >
                Schedule Interview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


export default ClientDashboard ;


