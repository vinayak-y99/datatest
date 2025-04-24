// CandidateManagement.jsx
import React, { useState, useEffect } from 'react';
import { 
  FaTimes,
  FaTrashAlt,
  FaCalendarAlt,
  FaComments,
  FaCheckCircle,
  FaFileDownload,
  FaUserPlus,
  FaUsers,
  FaFileImport,
  FaTable,
  FaColumns,
  FaRegClock
} from 'react-icons/fa';

export default function CandidateManagement() {
  // Sample initial data - in real app, you'd fetch this from an API
  const [candidates, setCandidates] = useState([
    {
      id: 1,
      name: "Jane Smith",
      email: "jane.smith@example.com",
      phone: "+1 (555) 123-4567",
      position: "Frontend Developer",
      experience: "5 years",
      skills: ["JavaScript", "React", "CSS", "HTML"],
      education: "BS Computer Science, Stanford University",
      resumeUrl: "/resumes/jane-smith.pdf",
      applicationDate: "2025-02-15",
      source: "LinkedIn",
      stage: "Shortlisted",
      interviewDate: null,
      feedback: [],
      interviewer: [],
      notes: "Strong portfolio with multiple React projects.",
      salary: {
        current: "$95,000",
        expected: "$120,000"
      }
    },
    {
      id: 2,
      name: "John Doe",
      email: "john.doe@example.com",
      phone: "+1 (555) 987-6543",
      position: "Backend Developer",
      experience: "7 years",
      skills: ["Java", "Spring Boot", "MySQL", "AWS"],
      education: "MS Computer Science, MIT",
      resumeUrl: "/resumes/john-doe.pdf",
      applicationDate: "2025-02-10",
      source: "Indeed",
      stage: "Scheduled for interview",
      interviewDate: "2025-03-15T10:00:00",
      feedback: [],
      interviewer: ["Sarah Johnson", "Mike Chen"],
      notes: "Previously worked at Google, strong technical background.",
      salary: {
        current: "$110,000",
        expected: "$130,000"
      }
    },
    {
      id: 3,
      name: "Alex Taylor",
      email: "alex.taylor@example.com",
      phone: "+1 (555) 789-0123",
      position: "UX Designer",
      experience: "4 years",
      skills: ["Figma", "Sketch", "User Research", "Prototyping"],
      education: "BFA Design, Rhode Island School of Design",
      resumeUrl: "/resumes/alex-taylor.pdf",
      applicationDate: "2025-02-05",
      source: "Referral",
      stage: "Awaiting feedback",
      interviewDate: "2025-03-05T14:00:00",
      feedback: [{ interviewer: "Sarah Johnson", notes: "Good design skills, needs improvement in user research" }],
      interviewer: ["Sarah Johnson", "Emily Rodriguez"],
      notes: "Great portfolio with emphasis on mobile UI design.",
      salary: {
        current: "$85,000",
        expected: "$100,000"
      }
    },
    {
      id: 4,
      name: "Michael Brown",
      email: "michael.brown@example.com",
      phone: "+1 (555) 456-7890",
      position: "DevOps Engineer",
      experience: "6 years",
      skills: ["Docker", "Kubernetes", "Jenkins", "AWS", "Terraform"],
      education: "BS Information Technology, Carnegie Mellon",
      resumeUrl: "/resumes/michael-brown.pdf",
      applicationDate: "2025-01-30",
      source: "Company Website",
      stage: "Final decision",
      interviewDate: "2025-03-01T11:00:00",
      decision: "Selected",
      feedback: [
        { interviewer: "David Wilson", notes: "Strong knowledge of CI/CD pipelines" },
        { interviewer: "Lisa Park", notes: "Excellent problem-solving skills" }
      ],
      interviewer: ["David Wilson", "Lisa Park"],
      notes: "Has certifications in AWS and Kubernetes.",
      salary: {
        current: "$115,000",
        expected: "$135,000"
      },
      offer: {
        status: "Pending",
        amount: "$140,000",
        benefits: "Full health, 401k with 6% match, 25 vacation days"
      }
    }
  ]);

  // State for stages tracking
  const [stages, setStages] = useState([
    { id: "Shortlisted", name: "Shortlisted", color: "yellow" },
    { id: "Scheduled for interview", name: "Scheduled for interview", color: "blue" },
    { id: "Awaiting feedback", name: "Awaiting feedback", color: "purple" },
    { id: "Final decision", name: "Final decision", color: "green" }
  ]);

  // Department data
  const [departments, setDepartments] = useState([
    { id: 1, name: "Engineering", positions: ["Frontend Developer", "Backend Developer", "DevOps Engineer", "QA Engineer"] },
    { id: 2, name: "Design", positions: ["UX Designer", "UI Designer", "Product Designer"] },
    { id: 3, name: "Marketing", positions: ["Marketing Manager", "SEO Specialist", "Content Writer"] },
    { id: 4, name: "Sales", positions: ["Sales Representative", "Account Manager", "Sales Manager"] },
    { id: 5, name: "HR", positions: ["HR Manager", "Recruiter", "HR Specialist"] }
  ]);

  // Interviewers data
  const [interviewers, setInterviewers] = useState([
    { id: 1, name: "Sarah Johnson", email: "sarah.j@example.com", department: "Engineering", position: "Engineering Manager" },
    { id: 2, name: "Mike Chen", email: "mike.c@example.com", department: "Engineering", position: "Senior Developer" },
    { id: 3, name: "Emily Rodriguez", email: "emily.r@example.com", department: "Design", position: "Design Director" },
    { id: 4, name: "David Wilson", email: "david.w@example.com", department: "Engineering", position: "DevOps Lead" },
    { id: 5, name: "Lisa Park", email: "lisa.p@example.com", department: "HR", position: "Talent Acquisition" }
  ]);

  // State for filtering
  const [filter, setFilter] = useState({
    stage: "all",
    department: "all",
    position: "all",
    source: "all",
    searchTerm: "",
    dateRange: { start: "", end: "" }
  });

  // State for new interview form
  const [newInterview, setNewInterview] = useState({
    candidateId: "",
    date: "",
    time: "",
    interviewers: "",
    interviewType: "Technical",
    location: "Online",
    meetingLink: "",
    duration: 60
  });

  // State for new candidate form
  const [newCandidate, setNewCandidate] = useState({
    name: "",
    email: "",
    phone: "",
    position: "",
    experience: "",
    skills: "",
    education: "",
    applicationDate: new Date().toISOString().split('T')[0],
    source: "LinkedIn",
    notes: ""
  });

  // State for modals
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showDecisionModal, setShowDecisionModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAddCandidateModal, setShowAddCandidateModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [showBulkActionModal, setShowBulkActionModal] = useState(false);
  const [showCalendarView, setShowCalendarView] = useState(false);
  const [showKanbanView, setShowKanbanView] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  
  // Form states
  const [feedbackForm, setFeedbackForm] = useState({ 
    notes: "", 
    rating: 3,
    skills: 3,
    culture: 3,
    technical: 3,
    recommendation: "Consider"
  });
  
  const [decisionForm, setDecisionForm] = useState({ 
    decision: "Selected",
    reason: "",
    nextSteps: ""
  });
  
  const [offerForm, setOfferForm] = useState({
    status: "Draft",
    salary: "",
    bonus: "",
    equity: "",
    startDate: "",
    benefits: "",
    expirationDate: ""
  });
  
  const [notesForm, setNotesForm] = useState({ text: "" });
  
  // State for selected candidates (for bulk actions)
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  
  // View state
  const [viewMode, setViewMode] = useState("table");
  
  // Statistics
  const [stats, setStats] = useState({
    totalCandidates: 0,
    byStage: {},
    byPosition: {},
    bySource: {},
    conversionRate: {}
  });
  
  // Update statistics whenever candidates change
  useEffect(() => {
    const totalCandidates = candidates.length;
    
    // Count by stage
    const byStage = candidates.reduce((acc, candidate) => {
      acc[candidate.stage] = (acc[candidate.stage] || 0) + 1;
      return acc;
    }, {});
    
    // Count by position
    const byPosition = candidates.reduce((acc, candidate) => {
      acc[candidate.position] = (acc[candidate.position] || 0) + 1;
      return acc;
    }, {});
    
    // Count by source
    const bySource = candidates.reduce((acc, candidate) => {
      acc[candidate.source] = (acc[candidate.source] || 0) + 1;
      return acc;
    }, {});
    
    // Calculate conversion rates between stages
    const stagesOrder = ["Shortlisted", "Scheduled for interview", "Awaiting feedback", "Final decision"];
    const conversionRate = {};
    
    for (let i = 0; i < stagesOrder.length - 1; i++) {
      const currentStage = stagesOrder[i];
      const nextStage = stagesOrder[i + 1];
      
      const currentCount = byStage[currentStage] || 0;
      const nextCount = byStage[nextStage] || 0;
      
      conversionRate[`${currentStage} to ${nextStage}`] = 
        currentCount > 0 ? ((nextCount / currentCount) * 100).toFixed(1) + '%' : '0%';
    }
    
    setStats({
      totalCandidates,
      byStage,
      byPosition,
      bySource,
      conversionRate
    });
  }, [candidates]);

  // Generate available positions based on selected department filter
  const availablePositions = () => {
    if (filter.department === "all") {
      return departments.flatMap(dept => dept.positions);
    } else {
      const dept = departments.find(d => d.name === filter.department);
      return dept ? dept.positions : [];
    }
  };

  // Filter candidates based on all filters
  const filteredCandidates = candidates.filter(candidate => {
    const matchesStage = filter.stage === "all" || candidate.stage === filter.stage;
    const matchesDepartment = filter.department === "all" || 
      departments.find(d => d.positions.includes(candidate.position))?.name === filter.department;
    const matchesPosition = filter.position === "all" || candidate.position === filter.position;
    const matchesSource = filter.source === "all" || candidate.source === filter.source;
    
    const matchesSearch = 
      candidate.name.toLowerCase().includes(filter.searchTerm.toLowerCase()) ||
      candidate.email.toLowerCase().includes(filter.searchTerm.toLowerCase()) ||
      candidate.position.toLowerCase().includes(filter.searchTerm.toLowerCase()) ||
      (candidate.skills && candidate.skills.some(skill => 
        skill.toLowerCase().includes(filter.searchTerm.toLowerCase())
      ));
    
    const candidateDate = new Date(candidate.applicationDate);
    const matchesDateRange = 
      (!filter.dateRange.start || new Date(filter.dateRange.start) <= candidateDate) &&
      (!filter.dateRange.end || new Date(filter.dateRange.end) >= candidateDate);
    
    return matchesStage && matchesDepartment && matchesPosition && 
           matchesSource && matchesSearch && matchesDateRange;
  });

  // Sources list for filtering
  const sources = ["LinkedIn", "Indeed", "Referral", "Company Website", "Job Fair", "Agency", "Other"];

  // Handle stage update
  const updateCandidateStage = (id, newStage) => {
    setCandidates(candidates.map(candidate => 
      candidate.id === id ? { ...candidate, stage: newStage } : candidate
    ));
  };

  // Schedule interview
  const scheduleInterview = () => {
    if (selectedCandidate) {
      const dateTime = `${newInterview.date}T${newInterview.time}:00`;
      const interviewers = newInterview.interviewers.split(',').map(i => i.trim());
      
      setCandidates(candidates.map(candidate => 
        candidate.id === selectedCandidate.id ? 
        { 
          ...candidate, 
          stage: "Scheduled for interview", 
          interviewDate: dateTime,
          interviewer: interviewers,
          interviewDetails: {
            type: newInterview.interviewType,
            location: newInterview.location,
            meetingLink: newInterview.meetingLink,
            duration: newInterview.duration
          }
        } : candidate
      ));

      // In a real app, you'd send notification emails here
      console.log(`Notifying interviewers: ${interviewers.join(', ')} about interview with ${selectedCandidate.name}`);
      console.log(`Interview details: ${newInterview.interviewType} interview, ${newInterview.duration} minutes, ${newInterview.location}`);
      
      // Reset form and close modal
      setNewInterview({ 
        candidateId: "", 
        date: "", 
        time: "", 
        interviewers: "",
        interviewType: "Technical",
        location: "Online",
        meetingLink: "",
        duration: 60
      });
      setShowScheduleModal(false);
    }
  };

  // Add feedback
  const addFeedback = () => {
    if (selectedCandidate && feedbackForm.notes) {
      // Assume current user is providing feedback
      const currentUser = "Current Recruiter";
      
      setCandidates(candidates.map(candidate => 
        candidate.id === selectedCandidate.id ? 
        { 
          ...candidate, 
          stage: "Awaiting feedback",
          feedback: [...candidate.feedback, { 
            interviewer: currentUser, 
            notes: feedbackForm.notes,
            rating: feedbackForm.rating,
            skills: feedbackForm.skills,
            culture: feedbackForm.culture,
            technical: feedbackForm.technical,
            recommendation: feedbackForm.recommendation,
            date: new Date().toISOString()
          }]
        } : candidate
      ));
      
      // Reset form and close modal
      setFeedbackForm({ 
        notes: "", 
        rating: 3,
        skills: 3,
        culture: 3,
        technical: 3,
        recommendation: "Consider"
      });
      setShowFeedbackModal(false);
    }
  };

  // Make final decision
  const makeDecision = () => {
    if (selectedCandidate && decisionForm.decision) {
      setCandidates(candidates.map(candidate => 
        candidate.id === selectedCandidate.id ? 
        { 
          ...candidate, 
          stage: "Final decision",
          decision: decisionForm.decision,
          decisionDetails: {
            reason: decisionForm.reason,
            nextSteps: decisionForm.nextSteps,
            date: new Date().toISOString(),
            by: "Current Recruiter"
          }
        } : candidate
      ));
      
      // Reset form and close modal
      setDecisionForm({ 
        decision: "Selected",
        reason: "",
        nextSteps: ""
      });
      setShowDecisionModal(false);
      
      // If selected, open offer modal
      if (decisionForm.decision === "Selected") {
        setTimeout(() => {
          setShowOfferModal(true);
        }, 500);
      }
    }
  };

  // Create an offer
  const createOffer = () => {
    if (selectedCandidate && offerForm.salary) {
      setCandidates(candidates.map(candidate => 
        candidate.id === selectedCandidate.id ? 
        { 
          ...candidate,
          offer: {
            status: offerForm.status,
            amount: offerForm.salary,
            bonus: offerForm.bonus,
            equity: offerForm.equity,
            startDate: offerForm.startDate,
            benefits: offerForm.benefits,
            expirationDate: offerForm.expirationDate,
            createdAt: new Date().toISOString(),
            history: [
              { date: new Date().toISOString(), action: "Created", by: "Current Recruiter" }
            ]
          }
        } : candidate
      ));
      
      // Reset form and close modal
      setOfferForm({
        status: "Draft",
        salary: "",
        bonus: "",
        equity: "",
        startDate: "",
        benefits: "",
        expirationDate: ""
      });
      setShowOfferModal(false);
    }
  };

  // Add a new candidate
  const addNewCandidate = () => {
    const skillsArray = newCandidate.skills.split(',').map(s => s.trim());
    
    const candidate = {
      id: candidates.length + 1,
      name: newCandidate.name,
      email: newCandidate.email,
      phone: newCandidate.phone,
      position: newCandidate.position,
      experience: newCandidate.experience,
      skills: skillsArray,
      education: newCandidate.education,
      applicationDate: newCandidate.applicationDate,
      source: newCandidate.source,
      stage: "Shortlisted",
      interviewDate: null,
      feedback: [],
      interviewer: [],
      notes: newCandidate.notes,
      createdAt: new Date().toISOString()
    };
    
    setCandidates([...candidates, candidate]);
    
    // Reset form and close modal
    setNewCandidate({
      name: "",
      email: "",
      phone: "",
      position: "",
      experience: "",
      skills: "",
      education: "",
      applicationDate: new Date().toISOString().split('T')[0],
      source: "LinkedIn",
      notes: ""
    });
    setShowAddCandidateModal(false);
  };

  // Add/update notes
  const updateNotes = () => {
    if (selectedCandidate && notesForm.text) {
      setCandidates(candidates.map(candidate => 
        candidate.id === selectedCandidate.id ? 
        { 
          ...candidate,
          notes: notesForm.text
        } : candidate
      ));
      
      // Reset form and close modal
      setNotesForm({ text: "" });
      setShowNotesModal(false);
    }
  };

  // Perform bulk action
  const performBulkAction = (action) => {
    if (selectedCandidates.length === 0) return;
    
    let updatedCandidates = [...candidates];
    
    switch(action) {
      case "move-stage":
        const newStage = document.getElementById("bulk-stage").value;
        updatedCandidates = candidates.map(candidate => 
          selectedCandidates.includes(candidate.id) ? 
          { ...candidate, stage: newStage } : candidate
        );
        break;
        
      case "assign-interviewer":
        const interviewer = document.getElementById("bulk-interviewer").value;
        updatedCandidates = candidates.map(candidate => {
          if (selectedCandidates.includes(candidate.id)) {
            const updatedInterviewers = [...(candidate.interviewer || [])];
            if (!updatedInterviewers.includes(interviewer)) {
              updatedInterviewers.push(interviewer);
            }
            return { ...candidate, interviewer: updatedInterviewers };
          }
          return candidate;
        });
        break;
        
      case "export":
        const selectedData = candidates.filter(c => selectedCandidates.includes(c.id));
        console.log("Exporting data for selected candidates:", selectedData);
        // In a real app, you'd generate CSV/Excel here
        alert(`Exporting data for ${selectedData.length} candidates`);
        break;
        
      case "delete":
        if (confirm(`Are you sure you want to delete ${selectedCandidates.length} candidates?`)) {
          updatedCandidates = candidates.filter(c => !selectedCandidates.includes(c.id));
        }
        break;
        
      default:
        break;
    }
    
    setCandidates(updatedCandidates);
    setSelectedCandidates([]);
    setShowBulkActionModal(false);
  };

  // Import candidates
  const importCandidates = () => {
    // In a real app, you'd process the uploaded file
    alert("Feature would import candidates from CSV/Excel file");
    setShowImportModal(false);
  };

  // Toggle selection of a single candidate
  const toggleCandidateSelection = (id) => {
    if (selectedCandidates.includes(id)) {
      setSelectedCandidates(selectedCandidates.filter(cid => cid !== id));
    } else {
      setSelectedCandidates([...selectedCandidates, id]);
    }
  };

  // Toggle selection of all candidates
  const toggleSelectAll = () => {
    if (selectedCandidates.length === filteredCandidates.length) {
      setSelectedCandidates([]);
    } else {
      setSelectedCandidates(filteredCandidates.map(c => c.id));
    }
  };

  // Handle opening modals
  const openScheduleModal = (candidate) => {
    setSelectedCandidate(candidate);
    setShowScheduleModal(true);
  };

  const openFeedbackModal = (candidate) => {
    setSelectedCandidate(candidate);
    setShowFeedbackModal(true);
  };

  const openDecisionModal = (candidate) => {
    setSelectedCandidate(candidate);
    setShowDecisionModal(true);
  };
  
  const openDetailsModal = (candidate) => {
    setSelectedCandidate(candidate);
    setShowDetailsModal(true);
  };
  
  const openNotesModal = (candidate) => {
    setSelectedCandidate(candidate);
    setNotesForm({ text: candidate.notes || "" });
    setShowNotesModal(true);
  };
  
  const openOfferModal = (candidate) => {
    setSelectedCandidate(candidate);
    // Pre-fill with existing offer data if available
    if (candidate.offer) {
      setOfferForm({
        status: candidate.offer.status || "Draft",
        salary: candidate.offer.amount || "",
        bonus: candidate.offer.bonus || "",
        equity: candidate.offer.equity || "",
        startDate: candidate.offer.startDate || "",
        benefits: candidate.offer.benefits || "",
        expirationDate: candidate.offer.expirationDate || ""
      });
    }
    setShowOfferModal(true);
  };

  // Add delete function
  const deleteCandidate = (id) => {
    if (confirm('Are you sure you want to delete this candidate?')) {
      setCandidates(candidates.filter(candidate => candidate.id !== id));
    }
  };

  const closeButton = (onClose) => (
    <button 
      onClick={onClose}
      className="text-gray-400 hover:text-gray-500"
    >
      <FaTimes className="h-6 w-6" />
    </button>
  );

  const deleteButton = (
    <button 
      onClick={() => deleteCandidate(candidate.id)}
      className="text-red-600 hover:text-red-900 flex items-center"
    >
      <FaTrashAlt className="h-5 w-5" />
    </button>
  );

  // Render candidate card for Kanban view
  const renderCandidateCard = (candidate) => (
    <div 
      key={candidate.id} 
      className="bg-white rounded-lg shadow p-4 mb-3 cursor-pointer hover:shadow-md"
      onClick={() => openDetailsModal(candidate)}
    >
      <h3 className="font-semibold text-lg">{candidate.name}</h3>
      <p className="text-sm text-gray-600">{candidate.position}</p>
      <div className="flex items-center mt-2">
        <span className="text-xs bg-blue-100 text-blue-800 rounded-full px-2 py-1">
          {candidate.source}
        </span>
        {candidate.interviewDate && (
          <span className="text-xs bg-green-100 text-green-800 rounded-full px-2 py-1 ml-2">
            {new Date(candidate.interviewDate).toLocaleDateString()}
          </span>
        )}
      </div>
      <div className="mt-3 flex justify-between">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            openDetailsModal(candidate);
          }}
          className="text-xs text-blue-600 hover:text-blue-800"
        >
          View Details
        </button>
        <span className="text-xs text-gray-500">
          {new Date(candidate.applicationDate).toLocaleDateString()}
        </span>
      </div>
    </div>
  );

  // Dashboard stats component
  const renderDashboard = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-700">Total Candidates</h3>
        <p className="text-3xl font-bold mt-2">{stats.totalCandidates}</p>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-700">By Stage</h3>
        <ul className="mt-2">
          {Object.entries(stats.byStage).map(([stage, count]) => (
            <li key={stage} className="flex justify-between text-sm py-1">
              <span>{stage}</span>
              <span className="font-semibold">{count}</span>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-700">Top Positions</h3>
        <ul className="mt-2">
          {Object.entries(stats.byPosition)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([position, count]) => (
              <li key={position} className="flex justify-between text-sm py-1">
                <span>{position}</span>
                <span className="font-semibold">{count}</span>
              </li>
            ))}
        </ul>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-700">Conversion Rates</h3>
        <ul className="mt-2">
          {Object.entries(stats.conversionRate).map(([transition, rate]) => (
            <li key={transition} className="flex justify-between text-sm py-1">
              <span>{transition.replace(' to ', '→')}</span>
              <span className="font-semibold">{rate}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  // Calendar view component
  const renderCalendarView = () => {
    // Get current month's dates
    const currentDate = new Date();
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
    const days = [];
    for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
      days.push(new Date(d));
    }
    
    // Group interviews by date
    const interviewsByDate = {};
    
    candidates.forEach(candidate => {
      if (candidate.interviewDate) {
        const date = new Date(candidate.interviewDate).toDateString();
        if (!interviewsByDate[date]) {
          interviewsByDate[date] = [];
        }
        interviewsByDate[date].push(candidate);
      }
    });
    
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 bg-blue-50 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">
            {currentDate.toLocaleString('default', { month: 'long' })} {currentDate.getFullYear()}
          </h2>
          <div className="flex space-x-2">
            <button className="px-3 py-1 bg-white rounded border hover:bg-gray-50">
              Previous
            </button>
            <button className="px-3 py-1 bg-white rounded border hover:bg-gray-50">
              Today
            </button>
            <button className="px-3 py-1 bg-white rounded border hover:bg-gray-50">
              Next
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-7 text-center border-b">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="py-2 font-medium text-gray-500 border-r last:border-r-0">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 min-h-screen">
          {/* Empty cells for days before first day of month */}
          {Array.from({ length: firstDay.getDay() }).map((_, index) => (
            <div key={`empty-start-${index}`} className="border-r border-b min-h-32 bg-gray-50"></div>
          ))}
          
          {/* Calendar days */}
          {days.map(day => {
            const dateStr = day.toDateString();
            const interviews = interviewsByDate[dateStr] || [];
            const isToday = new Date().toDateString() === dateStr;
            
            return (
              <div 
                key={dateStr} 
                className={`border-r border-b min-h-32 p-1 ${isToday ? 'bg-blue-50' : ''}`}
              >
                <div className={`text-right p-1 ${isToday ? 'font-bold' : ''}`}>
                  {day.getDate()}
                </div>
                
                <div className="overflow-y-auto max-h-28">
                  {interviews.map(candidate => (
                    <div 
                      key={candidate.id}
                      className="text-xs p-1 mb-1 rounded bg-blue-100 cursor-pointer hover:bg-blue-200"
                      onClick={() => openDetailsModal(candidate)}
                    >
                      <div className="font-medium truncate">{candidate.name}</div>
                      <div className="truncate text-gray-600">
                        {new Date(candidate.interviewDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          
          {/* Empty cells for days after last day of month */}
          {Array.from({ length: 6 - lastDay.getDay() }).map((_, index) => (
            <div key={`empty-end-${index}`} className="border-r border-b min-h-32 bg-gray-50"></div>
          ))}
        </div>
      </div>
    );
  };

  // Kanban view component
  const renderKanbanView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stages.map(stage => (
        <div key={stage.id} className="bg-gray-100 rounded-lg p-3">
          <div className="flex items-center mb-3">
            <div className={`w-3 h-3 rounded-full bg-${stage.color}-500 mr-2`}></div>
            <h3 className="font-semibold">{stage.name}</h3>
            <span className="ml-auto bg-gray-200 text-gray-700 text-xs font-medium rounded-full px-2 py-1">
              {filteredCandidates.filter(c => c.stage === stage.id).length}
            </span>
          </div>
          
          <div className="space-y-3 overflow-y-auto max-h-screen pb-4">
            {filteredCandidates
              .filter(candidate => candidate.stage === stage.id)
              .map(candidate => renderCandidateCard(candidate))}
          </div>
        </div>
      ))}
    </div>
  );

  // Main table view
  const renderTableView = () => (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-4">
              <input 
                type="checkbox" 
                checked={selectedCandidates.length === filteredCandidates.length && filteredCandidates.length > 0}
                onChange={toggleSelectAll}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Candidate
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Position
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Applied
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Source
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {filteredCandidates.map(candidate => (
            <tr key={candidate.id} className="hover:bg-gray-50">
              <td className="p-4">
                <input 
                  type="checkbox" 
                  checked={selectedCandidates.includes(candidate.id)}
                  onChange={() => toggleCandidateSelection(candidate.id)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center">
                  <div className="h-10 w-10 flex-shrink-0 mr-3 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-800 font-medium text-sm">
                      {candidate.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{candidate.name}</div>
                    <div className="text-sm text-gray-500">{candidate.email}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{candidate.position}</div>
                <div className="text-xs text-gray-500">{candidate.experience}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                  ${candidate.stage === 'Shortlisted' ? 'bg-yellow-100 text-yellow-800' : 
                  candidate.stage === 'Scheduled for interview' ? 'bg-blue-100 text-blue-800' :
                  candidate.stage === 'Awaiting feedback' ? 'bg-purple-100 text-purple-800' :
                  'bg-green-100 text-green-800'}`}>
                  {candidate.stage}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(candidate.applicationDate).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {candidate.source}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <div className="flex space-x-2">
                  <button 
                    onClick={() => openDetailsModal(candidate)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    View
                  </button>
                  <button 
                    onClick={() => openScheduleModal(candidate)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    Schedule
                  </button>
                  <button 
                    onClick={() => openFeedbackModal(candidate)}
                    className="text-green-600 hover:text-green-900"
                  >
                    Feedback
                  </button>
                  {deleteButton}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // Filter section component
  const renderFilterSection = () => (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Stage</label>
          <select 
            value={filter.stage}
            onChange={(e) => setFilter({...filter, stage: e.target.value})}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="all">All Stages</option>
            {stages.map(stage => (
              <option key={stage.id} value={stage.id}>{stage.name}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
          <select 
            value={filter.department}
            onChange={(e) => setFilter({...filter, department: e.target.value, position: "all"})}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="all">All Departments</option>
            {departments.map(dept => (
              <option key={dept.id} value={dept.name}>{dept.name}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
          <select 
            value={filter.position}
            onChange={(e) => setFilter({...filter, position: e.target.value})}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="all">All Positions</option>
            {availablePositions().map(position => (
              <option key={position} value={position}>{position}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
          <select 
            value={filter.source}
            onChange={(e) => setFilter({...filter, source: e.target.value})}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="all">All Sources</option>
            {sources.map(source => (
              <option key={source} value={source}>{source}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
          <input 
            type="date" 
            value={filter.dateRange.start}
            onChange={(e) => setFilter({
              ...filter, 
              dateRange: {...filter.dateRange, start: e.target.value}
            })}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
          <input 
            type="date" 
            value={filter.dateRange.end}
            onChange={(e) => setFilter({
              ...filter, 
              dateRange: {...filter.dateRange, end: e.target.value}
            })}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>
      
      <div className="flex items-center">
        <div className="flex-1">
          <input 
            type="text"
            placeholder="Search candidates by name, email, position, or skills..."
            value={filter.searchTerm}
            onChange={(e) => setFilter({...filter, searchTerm: e.target.value})}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        
        <div className="ml-4 flex space-x-2">
          <button 
            onClick={() => setFilter({
              stage: "all",
              department: "all",
              position: "all",
              source: "all",
              searchTerm: "",
              dateRange: { start: "", end: "" }
            })}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
          >
            Clear Filters
          </button>
        </div>
      </div>
    </div>
  );

  // Action buttons section component
  const renderActionButtons = () => (
    <div className="flex justify-between items-center mb-6">
      <div className="flex space-x-2">
        <button 
          onClick={() => setShowAddCandidateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <FaUserPlus className="inline-block mr-2 h-5 w-5" />
          Add Candidate
        </button>
        
        <button 
          onClick={() => setShowBulkActionModal(true)}
          disabled={selectedCandidates.length === 0}
          className={`px-4 py-2 border rounded-md flex items-center ${
            selectedCandidates.length > 0 
              ? 'border-gray-300 text-gray-700 hover:bg-gray-50' 
              : 'border-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          <FaUsers className="inline-block mr-2 h-5 w-5" />
          Bulk Actions ({selectedCandidates.length})
        </button>
        
        <button 
          onClick={() => setShowImportModal(true)}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 flex items-center"
        >
          <FaFileImport className="inline-block mr-2 h-5 w-5" />
          Import CSV
        </button>
      </div>
      
      <div className="flex space-x-2">
        <button 
          onClick={() => setViewMode("table")}
          className={`px-4 py-2 rounded-md flex items-center ${viewMode === 'table' ? 'bg-blue-100 text-blue-800' : 'text-gray-600 hover:bg-gray-100'}`}
        >
          <FaTable className="inline-block mr-2 h-5 w-5" />
          Table View
        </button>
        
        <button 
          onClick={() => setViewMode("kanban")}
          className={`px-4 py-2 rounded-md flex items-center ${viewMode === 'kanban' ? 'bg-blue-100 text-blue-800' : 'text-gray-600 hover:bg-gray-100'}`}
        >
          <FaColumns className="inline-block mr-2 h-5 w-5" />
          Kanban View
        </button>
        
        <button 
          onClick={() => setViewMode("calendar")}
          className={`px-4 py-2 rounded-md flex items-center ${viewMode === 'calendar' ? 'bg-blue-100 text-blue-800' : 'text-gray-600 hover:bg-gray-100'}`}
        >
          <FaCalendarAlt className="inline-block mr-2 h-5 w-5" />
          Calendar View
        </button>
      </div>
    </div>
  );
  
  // Schedule Interview Modal
  const renderScheduleModal = () => (
    showScheduleModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg max-w-lg w-full p-6">
          <h2 className="text-xl font-semibold mb-4">Schedule Interview</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Candidate</label>
              <input 
                type="text" 
                value={selectedCandidate?.name} 
                disabled 
                className="w-full rounded-md border-gray-300 bg-gray-100 shadow-sm" 
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input 
                  type="date" 
                  value={newInterview.date}
                  onChange={(e) => setNewInterview({...newInterview, date: e.target.value})}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                <input 
                  type="time" 
                  value={newInterview.time}
                  onChange={(e) => setNewInterview({...newInterview, time: e.target.value})}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Interview Type</label>
              <select 
                value={newInterview.interviewType}
                onChange={(e) => setNewInterview({...newInterview, interviewType: e.target.value})}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="Technical">Technical</option>
                <option value="HR">HR</option>
                <option value="Cultural Fit">Cultural Fit</option>
                <option value="Final">Final</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <select 
                value={newInterview.location}
                onChange={(e) => setNewInterview({...newInterview, location: e.target.value})}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="Online">Online</option>
                <option value="In-person">In-person</option>
                <option value="Phone">Phone</option>
              </select>
            </div>
            
            {newInterview.location === "Online" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Link</label>
                <input 
                  type="text" 
                  value={newInterview.meetingLink}
                  onChange={(e) => setNewInterview({...newInterview, meetingLink: e.target.value})}
                  placeholder="https://meet.google.com/..."
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
              <select 
                value={newInterview.duration}
                onChange={(e) => setNewInterview({...newInterview, duration: parseInt(e.target.value)})}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="30">30</option>
                <option value="45">45</option>
                <option value="60">60</option>
                <option value="90">90</option>
                <option value="120">120</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Interviewers</label>
              <input 
                type="text" 
                value={newInterview.interviewers}
                onChange={(e) => setNewInterview({...newInterview, interviewers: e.target.value})}
                placeholder="Enter interviewer names (comma separated)"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <div className="text-xs text-gray-500 mt-1">
                Suggestions: {interviewers.map(i => i.name).join(', ')}
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button 
              onClick={() => setShowScheduleModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button 
              onClick={scheduleInterview}
              className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Schedule & Send Invites
            </button>
          </div>
        </div>
      </div>
    )
  );

  // Feedback Modal
  const renderFeedbackModal = () => (
    showFeedbackModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg max-w-lg w-full p-6">
          <h2 className="text-xl font-semibold mb-4">Add Interview Feedback</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Candidate</label>
              <input 
                type="text" 
                value={selectedCandidate?.name} 
                disabled 
                className="w-full rounded-md border-gray-300 bg-gray-100 shadow-sm" 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Overall Rating</label>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <button 
                    key={star}
                    onClick={() => setFeedbackForm({...feedbackForm, rating: star})}
                    className={`h-8 w-8 rounded-full focus:outline-none ${
                      feedbackForm.rating >= star ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
                <select 
                  value={feedbackForm.skills}
                  onChange={(e) => setFeedbackForm({...feedbackForm, skills: parseInt(e.target.value)})}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  {[1, 2, 3, 4, 5].map(score => (
                    <option key={score} value={score}>{score}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cultural Fit</label>
                <select 
                  value={feedbackForm.culture}
                  onChange={(e) => setFeedbackForm({...feedbackForm, culture: parseInt(e.target.value)})}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  {[1, 2, 3, 4, 5].map(score => (
                    <option key={score} value={score}>{score}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Technical</label>
                <select 
                  value={feedbackForm.technical}
                  onChange={(e) => setFeedbackForm({...feedbackForm, technical: parseInt(e.target.value)})}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  {[1, 2, 3, 4, 5].map(score => (
                    <option key={score} value={score}>{score}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Recommendation</label>
              <select 
                value={feedbackForm.recommendation}
                onChange={(e) => setFeedbackForm({...feedbackForm, recommendation: e.target.value})}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="Strong Hire">Strong Hire</option>
                <option value="Hire">Hire</option>
                <option value="Consider">Consider</option>
                <option value="Decline">Decline</option>
                <option value="Strong Decline">Strong Decline</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Feedback Notes</label>
              <textarea 
                value={feedbackForm.notes}
                onChange={(e) => setFeedbackForm({...feedbackForm, notes: e.target.value})}
                rows="4"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Provide detailed feedback about the candidate's performance..."
              ></textarea>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button 
              onClick={() => setShowFeedbackModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button 
              onClick={addFeedback}
              disabled={!feedbackForm.notes.trim()}
              className={`px-4 py-2 border rounded-md text-sm font-medium ${
                feedbackForm.notes.trim() 
                  ? 'bg-blue-600 border-transparent text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2' 
                  : 'border-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              Submit Feedback
            </button>
          </div>
        </div>
      </div>
    )
  );

  // Decision Modal
  const renderDecisionModal = () => (
    showDecisionModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg max-w-lg w-full p-6">
          <h2 className="text-xl font-semibold mb-4">Make Final Decision</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Candidate</label>
              <input 
                type="text" 
                value={selectedCandidate?.name} 
                disabled 
                className="w-full rounded-md border-gray-300 bg-gray-100 shadow-sm" 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Decision</label>
              <select 
                value={decisionForm.decision}
                onChange={(e) => setDecisionForm({...decisionForm, decision: e.target.value})}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="Selected">Selected</option>
                <option value="Rejected">Rejected</option>
                <option value="On Hold">On Hold</option>
                <option value="Consider for another role">Consider for another role</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
              <textarea 
                value={decisionForm.reason}
                onChange={(e) => setDecisionForm({...decisionForm, reason: e.target.value})}
                rows="3"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter the reason for this decision..."
              ></textarea>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Next Steps</label>
              <textarea 
                value={decisionForm.nextSteps}
                onChange={(e) => setDecisionForm({...decisionForm, nextSteps: e.target.value})}
                rows="3"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="What are the next steps for this candidate?"
              ></textarea>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button 
              onClick={() => setShowDecisionModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button 
              onClick={makeDecision}
              className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Confirm Decision
            </button>
          </div>
        </div>
      </div>
    )
  );

  // Candidate Details Modal
  const renderDetailsModal = () => (
    showDetailsModal && selectedCandidate && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg max-w-4xl w-full p-6 max-h-screen overflow-y-auto">
          <div className="flex justify-between items-start">
            <h2 className="text-2xl font-semibold">{selectedCandidate.name}</h2>
            {closeButton(() => setShowDetailsModal(false))}
          </div>
          <div className="mt-4 space-y-4">
            <div>
              <h3 className="text-lg font-medium text-gray-700">Contact Information</h3>
              <p className="text-sm text-gray-500">{selectedCandidate.email}</p>
              <p className="text-sm text-gray-500">{selectedCandidate.phone}</p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-700">Position</h3>
              <p className="text-sm text-gray-500">{selectedCandidate.position}</p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-700">Experience</h3>
              <p className="text-sm text-gray-500">{selectedCandidate.experience}</p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-700">Skills</h3>
              <ul className="list-disc list-inside text-sm text-gray-500">
                {selectedCandidate.skills.map(skill => (
                  <li key={skill}>{skill}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-700">Education</h3>
              <p className="text-sm text-gray-500">{selectedCandidate.education}</p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-700">Notes</h3>
              <p className="text-sm text-gray-500">{selectedCandidate.notes}</p>
            </div>
            {selectedCandidate.resumeUrl && (
              <div>
                <h3 className="text-lg font-medium text-gray-700">Resume</h3>
                <a href={selectedCandidate.resumeUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                  View Resume
                </a>
              </div>
            )}
            {selectedCandidate.feedback.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-700">Feedback</h3>
                <ul className="list-disc list-inside text-sm text-gray-500">
                  {selectedCandidate.feedback.map((fb, index) => (
                    <li key={index}>
                      <strong>{fb.interviewer}:</strong> {fb.notes}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  );

  // Add Candidate Modal
  const renderAddCandidateModal = () => (
    showAddCandidateModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg max-w-lg w-full p-6">
          <h2 className="text-xl font-semibold mb-4">Add New Candidate</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input 
                  type="text"
                  value={newCandidate.name}
                  onChange={(e) => setNewCandidate({...newCandidate, name: e.target.value})}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input 
                  type="email"
                  value={newCandidate.email}
                  onChange={(e) => setNewCandidate({...newCandidate, email: e.target.value})}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input 
                  type="tel"
                  value={newCandidate.phone}
                  onChange={(e) => setNewCandidate({...newCandidate, phone: e.target.value})}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                <select 
                  value={newCandidate.position}
                  onChange={(e) => setNewCandidate({...newCandidate, position: e.target.value})}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Select Position</option>
                  {availablePositions().map(position => (
                    <option key={position} value={position}>{position}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Skills (comma separated)</label>
              <input 
                type="text"
                value={newCandidate.skills}
                onChange={(e) => setNewCandidate({...newCandidate, skills: e.target.value})}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Education</label>
              <input 
                type="text"
                value={newCandidate.education}
                onChange={(e) => setNewCandidate({...newCandidate, education: e.target.value})}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
              <input 
                type="text"
                value={newCandidate.experience}
                onChange={(e) => setNewCandidate({...newCandidate, experience: e.target.value})}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
              <select 
                value={newCandidate.source}
                onChange={(e) => setNewCandidate({...newCandidate, source: e.target.value})}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                {sources.map(source => (
                  <option key={source} value={source}>{source}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea 
                value={newCandidate.notes}
                onChange={(e) => setNewCandidate({...newCandidate, notes: e.target.value})}
                rows="3"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              ></textarea>
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <button 
              onClick={() => setShowAddCandidateModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button 
              onClick={addNewCandidate}
              disabled={!newCandidate.name || !newCandidate.email || !newCandidate.position}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300"
            >
              Add Candidate
            </button>
          </div>
        </div>
      </div>
    )
  );

  // Bulk Actions Modal
  const renderBulkActionModal = () => (
    showBulkActionModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg max-w-lg w-full p-6">
          <h2 className="text-xl font-semibold mb-4">Bulk Actions</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Action Type</label>
              <select 
                id="bulk-action-type"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                onChange={(e) => {
                  const actionType = e.target.value;
                  if (actionType === 'delete') {
                    if (confirm(`Are you sure you want to delete ${selectedCandidates.length} candidates?`)) {
                      performBulkAction('delete');
                    }
                  }
                }}
              >
                <option value="">Select Action</option>
                <option value="move-stage">Move to Stage</option>
                <option value="assign-interviewer">Assign Interviewer</option>
                <option value="export">Export Selected</option>
                <option value="delete">Delete Selected</option>
              </select>
            </div>
            
            <div id="bulk-stage-section" className="hidden">
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Stage</label>
              <select 
                id="bulk-stage"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                {stages.map(stage => (
                  <option key={stage.id} value={stage.id}>{stage.name}</option>
                ))}
              </select>
            </div>
            
            <div id="bulk-interviewer-section" className="hidden">
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Interviewer</label>
              <select 
                id="bulk-interviewer"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                {interviewers.map(interviewer => (
                  <option key={interviewer.id} value={interviewer.name}>{interviewer.name}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button 
              onClick={() => setShowBulkActionModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button 
              onClick={() => {
                const actionType = document.getElementById('bulk-action-type').value;
                if (actionType) {
                  performBulkAction(actionType);
                }
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Apply Action
            </button>
          </div>
        </div>
      </div>
    )
  );

  // Import CSV Modal
  const renderImportModal = () => (
    showImportModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg max-w-lg w-full p-6">
          <h2 className="text-xl font-semibold mb-4">Import Candidates</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Upload CSV File</label>
              <input 
                type="file"
                accept=".csv"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      const csvData = event.target.result;
                      const lines = csvData.split('\n');
                      const headers = lines[0].split(',');
                      
                      const newCandidates = lines.slice(1).map(line => {
                        const values = line.split(',');
                        const candidate = {
                          id: candidates.length + Math.random(),
                          stage: "Shortlisted",
                          applicationDate: new Date().toISOString().split('T')[0],
                          feedback: [],
                          interviewer: []
                        };
                        
                        headers.forEach((header, index) => {
                          const value = values[index]?.trim();
                          if (value) {
                            if (header.trim() === 'skills') {
                              candidate[header.trim()] = value.split(';');
                            } else {
                              candidate[header.trim()] = value;
                            }
                          }
                        });
                        
                        return candidate;
                      });
                      
                      setCandidates([...candidates, ...newCandidates]);
                      setShowImportModal(false);
                    };
                    reader.readAsText(file);
                  }
                }}
                className="w-full"
              />
            </div>
            <div className="text-sm text-gray-500">
              <p>CSV file should have the following headers:</p>
              <p>name, email, phone, position, experience, skills, education, source, notes</p>
              <p>Skills should be semicolon-separated (e.g., "JavaScript;React;CSS")</p>
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button 
              onClick={() => setShowImportModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )
  );

  return (
    <div className="w-full">
      {renderActionButtons()}
      {renderFilterSection()}
      {viewMode === "table" && renderTableView()}
      {viewMode === "kanban" && renderKanbanView()}
      {viewMode === "calendar" && renderCalendarView()}
      {renderScheduleModal()}
      {renderFeedbackModal()}
      {renderDecisionModal()}
      {renderDetailsModal()}
      {renderAddCandidateModal()}
      {renderBulkActionModal()}
      {renderImportModal()}
    </div>
  );
}