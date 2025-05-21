// File: app/page.js
"use client";

import React, { useState, useEffect } from 'react';
import { 
  FaUserFriends, 
  FaDownload, 
  FaCheck, 
  FaUser, 
  FaSpinner,
  FaCheckCircle
} from 'react-icons/fa';

export default function CandidateEvaluationApp() {
  // State management
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [feedback, setFeedback] = useState({
    technicalScore: 0,
    communicationScore: 0,
    problemSolvingScore: 0,
    cultureFitScore: 0,
    strengths: '',
    improvementAreas: '',
    questionResponses: [],
    recommendation: '',
    notes: ''
  });
  const [questionResponses, setQuestionResponses] = useState([
    { question: "Describe your experience with React.js", score: 0, notes: "" },
    { question: "Explain how you would optimize a slow-loading webpage", score: 0, notes: "" },
    { question: "How do you handle conflicts in a team environment?", score: 0, notes: "" },
    { question: "Walk through a challenging project you've completed", score: 0, notes: "" },
  ]);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [userRole, setUserRole] = useState('recruiter');
  const [collaborators, setCollaborators] = useState([]);
  const [showCollaborateModal, setShowCollaborateModal] = useState(false);
  const [newCollaborator, setNewCollaborator] = useState('');
  const [activeTab, setActiveTab] = useState('feedback');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Mock data initialization with recommendation status
  useEffect(() => {
    setIsLoading(true);
    const mockCandidates = [
      { id: 1, name: "Alex Johnson", position: "Frontend Developer", date: "2025-03-01", status: "pending", lastUpdated: new Date(), recommendation: "" },
      { id: 2, name: "Sam Taylor", position: "Backend Engineer", date: "2025-03-03", status: "evaluated", lastUpdated: new Date(), recommendation: "Hire" },
      { id: 3, name: "Jamie Smith", position: "Full Stack Developer", date: "2025-03-05", status: "pending", lastUpdated: new Date(), recommendation: "" },
      { id: 4, name: "Morgan Williams", position: "DevOps Engineer", date: "2025-02-28", status: "evaluated", lastUpdated: new Date(), recommendation: "Consider" },
    ];
    setCandidates(mockCandidates);
    
    setCollaborators([
      { id: 1, name: "Chris Wong", role: "Tech Lead", avatar: "CW" },
      { id: 2, name: "Taylor Reed", role: "HR Manager", avatar: "TR" },
    ]);
    setTimeout(() => setIsLoading(false), 500);
  }, []);

  // Calculated values
  const totalScore = (
    feedback.technicalScore + 
    feedback.communicationScore + 
    feedback.problemSolvingScore + 
    feedback.cultureFitScore
  ) / 4;
  
  const questionAverage = questionResponses.reduce((sum, q) => sum + q.score, 0) / questionResponses.length;

  // Status counters
  const statusCounts = {
    hire: candidates.filter(c => c.recommendation === "Hire").length,
    consider: candidates.filter(c => c.recommendation === "Consider").length,
    decline: candidates.filter(c => c.recommendation === "Decline").length,
  };

  // Validation
  const validateForm = () => {
    const newErrors = {};
    if (!feedback.recommendation) newErrors.recommendation = "Please select a recommendation";
    if (feedback.technicalScore === 0) newErrors.technicalScore = "Required";
    if (feedback.communicationScore === 0) newErrors.communicationScore = "Required";
    if (feedback.problemSolvingScore === 0) newErrors.problemSolvingScore = "Required";
    if (feedback.cultureFitScore === 0) newErrors.cultureFitScore = "Required";
    if (!feedback.strengths.trim()) newErrors.strengths = "Please list at least one strength";
    if (!feedback.improvementAreas.trim()) newErrors.improvementAreas = "Please list at least one area for improvement";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handlers
  const handleSelectCandidate = (candidate) => {
    setIsLoading(true);
    setSelectedCandidate(candidate);
    setErrors({});
    
    if (!selectedCandidate || selectedCandidate.id !== candidate.id) {
      if (candidate.status === 'evaluated') {
        setFeedback({
          technicalScore: 4,
          communicationScore: 3,
          problemSolvingScore: 4,
          cultureFitScore: 5,
          strengths: 'Strong technical knowledge, excellent cultural fit',
          improvementAreas: 'Could improve communication skills and documentation practices',
          recommendation: candidate.recommendation || 'Hire',
          notes: 'Would be a good addition to the team'
        });
        setQuestionResponses([
          { question: "Describe your experience with React.js", score: 4, notes: "Has 3 years of experience, built several complex applications" },
          { question: "Explain how you would optimize a slow-loading webpage", score: 3, notes: "Understands basic optimization techniques" },
          { question: "How do you handle conflicts in a team environment?", score: 4, notes: "Good conflict resolution approach" },
          { question: "Walk through a challenging project you've completed", score: 5, notes: "Impressive project with clear role and contributions" },
        ]);
      } else {
        setFeedback({
          technicalScore: 0,
          communicationScore: 0,
          problemSolvingScore: 0,
          cultureFitScore: 0,
          strengths: '',
          improvementAreas: '',
          recommendation: '',
          notes: ''
        });
        setQuestionResponses([
          { question: "Describe your experience with React.js", score: 0, notes: "" },
          { question: "Explain how you would optimize a slow-loading webpage", score: 0, notes: "" },
          { question: "How do you handle conflicts in a team environment?", score: 0, notes: "" },
          { question: "Walk through a challenging project you've completed", score: 0, notes: "" },
        ]);
      }
    }
    setActiveTab('feedback');
    setTimeout(() => setIsLoading(false), 300);
  };

  const handleScoreChange = (field, value) => {
    setFeedback(prev => ({
      ...prev,
      [field]: parseInt(value)
    }));
    setErrors(prev => ({ ...prev, [field]: null }));
  };

  const handleQuestionScoreChange = (index, score) => {
    const updatedResponses = [...questionResponses];
    updatedResponses[index].score = parseInt(score);
    setQuestionResponses(updatedResponses);
  };

  const handleQuestionNotesChange = (index, notes) => {
    const updatedResponses = [...questionResponses];
    updatedResponses[index].notes = notes;
    setQuestionResponses(updatedResponses);
  };

  const handleTextChange = (field, value) => {
    setFeedback(prev => ({
      ...prev,
      [field]: value
    }));
    setErrors(prev => ({ ...prev, [field]: null }));
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    const updatedCandidates = candidates.map(c => 
      c.id === selectedCandidate.id ? {
        ...c, 
        status: 'evaluated', 
        lastUpdated: new Date(),
        recommendation: feedback.recommendation
      } : c
    );
    setCandidates(updatedCandidates);
    
    setShowSubmitModal(false);
    setShowSuccessModal(true);
    
    setTimeout(() => {
      setShowSuccessModal(false);
      setIsLoading(false);
    }, 2000);
  };

  const handleExport = () => {
    const data = {
      candidate: selectedCandidate,
      feedback,
      questionResponses,
      totalScore: totalScore.toFixed(1),
      questionAverage: questionAverage.toFixed(1)
    };
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedCandidate.name}_evaluation_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleAddCollaborator = () => {
    if (newCollaborator.trim() && collaborators.length < 5) {
      setCollaborators([
        ...collaborators,
        { 
          id: collaborators.length + 3, 
          name: newCollaborator, 
          role: "Collaborator", 
          avatar: newCollaborator.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() 
        }
      ]);
      setNewCollaborator('');
      setShowCollaborateModal(false);
    }
  };

  // UI Components
  const ScoreLabel = ({ score }) => {
    const config = score >= 4.5 ? { label: "Exceptional", color: "bg-green-600" } :
                  score >= 3.5 ? { label: "Strong", color: "bg-green-500" } :
                  score >= 2.5 ? { label: "Satisfactory", color: "bg-yellow-500" } :
                  score >= 1.5 ? { label: "Needs Improvement", color: "bg-orange-500" } :
                  { label: "Poor Fit", color: "bg-red-500" };
    
    return (
      <span className={`${config.color} text-white text-sm px-2 py-1 rounded-full font-medium`}>
        {config.label}
      </span>
    );
  };

  const filteredCandidates = filter === 'all' 
    ? candidates 
    : candidates.filter(c => c.status === filter);

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      {/* Main Content */}
      <main className="w-full flex gap-6">
        {/* Left sidebar */}
        <aside className="w-1/4 bg-white rounded-xl shadow-md p-6 min-h-screen">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Candidates</h2>
          
          {/* Status Counters */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex justify-between text-sm">
              <span className="text-green-600 font-medium">Hire: {statusCounts.hire}</span>
              <span className="text-yellow-600 font-medium">Consider: {statusCounts.consider}</span>
              <span className="text-red-600 font-medium">Decline: {statusCounts.decline}</span>
            </div>
          </div>

          <div className="flex mb-4 space-x-2">
            {['all', 'pending', 'evaluated'].map(f => (
              <button 
                key={f}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  filter === f ? 'bg-[#2563EB] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded-lg animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredCandidates.map(candidate => (
                <div 
                  key={candidate.id} 
                  className={`p-4 rounded-lg cursor-pointer transition-all duration-200 ${
                    selectedCandidate?.id === candidate.id 
                      ? 'bg-blue-50 border-l-4 border-[#2563EB] shadow-md' 
                      : 'bg-gray-50 hover:bg-gray-100 hover:shadow'
                  }`}
                  onClick={() => handleSelectCandidate(candidate)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-800">{candidate.name}</h3>
                      <p className="text-sm text-gray-600">{candidate.position}</p>
                      <p className="text-xs text-gray-500">Last Updated: {new Date(candidate.lastUpdated).toLocaleDateString()}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      candidate.status === 'evaluated' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {candidate.status.charAt(0).toUpperCase() + candidate.status.slice(1)}
                    </span>
                  </div>
                  {candidate.recommendation && (
                    <p className={`text-xs mt-1 font-medium ${
                      candidate.recommendation === 'Hire' ? 'text-green-600' :
                      candidate.recommendation === 'Consider' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      Recommendation: {candidate.recommendation}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </aside>

        {/* Main Content */}
        <section className="w-3/4 bg-white rounded-xl shadow-md p-6 min-h-screen">
          {selectedCandidate ? (
            <div>
              <div className="mb-6 flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{selectedCandidate.name}</h2>
                  <p className="text-gray-600">{selectedCandidate.position} • Last Updated: {new Date(selectedCandidate.lastUpdated).toLocaleDateString()}</p>
                </div>
                <div className="flex space-x-3">
                  <button 
                    className="px-4 py-2 bg-blue-100 text-[#2563EB] rounded-lg flex items-center hover:bg-blue-200 transition"
                    onClick={() => setShowCollaborateModal(true)}
                  >
                    <FaUserFriends className="h-5 w-5 mr-1" />
                    Collaborate
                  </button>
                  <button 
                    className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center hover:bg-green-700 transition"
                    onClick={handleExport}
                  >
                    <FaDownload className="h-5 w-5 mr-1" />
                    Export
                  </button>
                  <button 
                    className="px-4 py-2 bg-[#2563EB] text-white rounded-lg flex items-center hover:bg-blue-600 transition"
                    onClick={() => setShowSubmitModal(true)}
                  >
                    <FaCheck className="h-5 w-5 mr-1" />
                    Submit
                  </button>
                </div>
              </div>

              {collaborators.length > 0 && (
                <div className="mb-6 flex items-center">
                  <h3 className="text-sm font-medium text-gray-500 mr-3">Collaborators:</h3>
                  <div className="flex -space-x-2">
                    {collaborators.map(c => (
                      <div 
                        key={c.id} 
                        className="w-8 h-8 rounded-full bg-blue-200 text-[#2563EB] flex items-center justify-center border-2 border-white text-xs font-medium shadow-sm"
                        title={`${c.name} (${c.role})`}
                      >
                        {c.avatar}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-b border-gray-200 mb-6">
                <nav className="flex -mb-px space-x-8">
                  {['feedback', 'questions', 'summary'].map(tab => (
                    <button
                      key={tab}
                      className={`py-4 px-1 text-center border-b-2 font-medium text-sm transition-colors ${
                        activeTab === tab 
                          ? 'border-[#2563EB] text-[#2563EB]' 
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                      onClick={() => setActiveTab(tab)}
                    >
                      {tab === 'feedback' ? 'Evaluation Feedback' : tab === 'questions' ? 'Question Analysis' : 'Summary'}
                    </button>
                  ))}
                </nav>
              </div>

              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
                  ))}
                </div>
              ) : (
                <>
                  {activeTab === 'feedback' && (
                    <div className="space-y-8">
                      <div>
                        <h3 className="text-lg font-semibold mb-4 text-gray-800">Evaluation Scores</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                          {['technicalScore', 'communicationScore', 'problemSolvingScore', 'cultureFitScore'].map(field => (
                            <div key={field} className="bg-gray-50 p-4 rounded-lg shadow-sm">
                              <h4 className="text-sm text-gray-500 mb-2 capitalize">{field.replace('Score', '').replace(/([A-Z])/g, ' $1')}</h4>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-2xl font-bold text-gray-800">{feedback[field]}/5</span>
                                <select 
                                  className={`bg-white border rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#2563EB] ${errors[field] ? 'border-red-500' : ''}`}
                                  value={feedback[field]}
                                  onChange={(e) => handleScoreChange(field, e.target.value)}
                                >
                                  <option value="0">Select</option>
                                  {[1, 2, 3, 4, 5].map(n => (
                                    <option key={n} value={n}>{n} - {['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][n-1]}</option>
                                  ))}
                                </select>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div 
                                  className="bg-[#2563EB] h-2.5 rounded-full transition-all duration-300" 
                                  style={{ width: `${(feedback[field] / 5) * 100}%` }}
                                ></div>
                              </div>
                              {errors[field] && <p className="text-xs text-red-500 mt-1">{errors[field]}</p>}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {['strengths', 'improvementAreas'].map(field => (
                          <div key={field}>
                            <h3 className="text-lg font-semibold mb-2 text-gray-800">{field === 'strengths' ? 'Key Strengths' : 'Areas for Improvement'}</h3>
                            <textarea
                              className={`w-full h-32 p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#2563EB] ${errors[field] ? 'border-red-500' : ''}`}
                              placeholder={field === 'strengths' ? "List candidate's key strengths..." : "Areas where candidate could improve..."}
                              value={feedback[field]}
                              onChange={(e) => handleTextChange(field, e.target.value)}
                            ></textarea>
                            {errors[field] && <p className="text-xs text-red-500 mt-1">{errors[field]}</p>}
                          </div>
                        ))}
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-4 text-gray-800">Hiring Recommendation</h3>
                        <div className="flex space-x-4">
                          {['Hire', 'Consider', 'Decline'].map(rec => (
                            <button 
                              key={rec}
                              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                feedback.recommendation === rec 
                                  ? `${rec === 'Hire' ? 'bg-green-600' : rec === 'Consider' ? 'bg-yellow-500' : 'bg-red-500'} text-white`
                                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                              }`}
                              onClick={() => handleTextChange('recommendation', rec)}
                            >
                              {rec}
                            </button>
                          ))}
                        </div>
                        {errors.recommendation && <p className="text-xs text-red-500 mt-2">{errors.recommendation}</p>}
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-2 text-gray-800">Additional Notes</h3>
                        <textarea
                          className="w-full h-32 p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                          placeholder="Any other observations or comments..."
                          value={feedback.notes}
                          onChange={(e) => handleTextChange('notes', e.target.value)}
                        ></textarea>
                      </div>
                    </div>
                  )}

                  {activeTab === 'questions' && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold mb-4 text-gray-800">Question-by-Question Analysis</h3>
                      {questionResponses.map((q, index) => (
                        <div key={index} className="bg-gray-50 p-4 rounded-lg shadow-sm">
                          <h4 className="font-medium mb-3 text-gray-800">{q.question}</h4>
                          <div className="flex items-center mb-3">
                            <div className="mr-4">
                              <span className="text-gray-700 mr-2">Score:</span>
                              <select 
                                className="bg-white border rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                                value={q.score}
                                onChange={(e) => handleQuestionScoreChange(index, e.target.value)}
                              >
                                <option value="0">Select</option>
                                {[1, 2, 3, 4, 5].map(n => (
                                  <option key={n} value={n}>{n} - {['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][n-1]}</option>
                                ))}
                              </select>
                            </div>
                            <div className="flex-1">
                              <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div 
                                  className="bg-[#2563EB] h-2.5 rounded-full transition-all duration-300" 
                                  style={{ width: `${(q.score / 5) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                            <div className="ml-4 w-8 text-center">
                              <span className="font-bold text-gray-800">{q.score}</span>
                            </div>
                          </div>
                          <textarea
                            className="w-full p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                            placeholder="Notes on candidate's response..."
                            rows="3"
                            value={q.notes}
                            onChange={(e) => handleQuestionNotesChange(index, e.target.value)}
                          ></textarea>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'summary' && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold mb-4 text-gray-800">Evaluation Summary</h3>
                      
                      <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h4 className="text-xl font-bold text-gray-800">Overall Assessment</h4>
                            <p className="text-gray-600">Based on scores across all categories</p>
                          </div>
                          <div className="text-center">
                            <div className="text-3xl font-bold text-gray-800 mb-1">{totalScore.toFixed(1)}/5</div>
                            <ScoreLabel score={totalScore} />
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-4 mb-6 relative">
                          <div 
                            className="bg-[#2563EB] h-4 rounded-full transition-all duration-300 relative" 
                            style={{ width: `${(totalScore / 5) * 100}%` }}
                          >
                            <div className="absolute right-0 top-1/2 transform -translate-y-1/2 -mr-10 text-sm font-medium text-gray-800">
                              {totalScore.toFixed(1)}
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {['technicalScore', 'communicationScore', 'problemSolvingScore', 'cultureFitScore'].map(field => (
                            <div key={field} className="text-center">
                              <div className="text-xl font-bold text-gray-800">{feedback[field]}/5</div>
                              <p className="text-sm text-gray-600 capitalize">{field.replace('Score', '').replace(/([A-Z])/g, ' $1')}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
                        <h4 className="text-lg font-bold mb-4 text-gray-800">Question Performance</h4>
                        <div className="space-y-4">
                          {questionResponses.map((q, index) => (
                            <div key={index} className="flex items-center">
                              <div className="w-8 h-8 rounded-full bg-blue-100 text-[#2563EB] flex items-center justify-center mr-3 font-medium">
                                {index + 1}
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between mb-1">
                                  <span className="text-sm font-medium text-gray-800 truncate max-w-md">{q.question}</span>
                                  <span className="text-sm font-bold text-gray-800">{q.score}/5</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-[#2563EB] h-2 rounded-full transition-all duration-300" 
                                    style={{ width: `${(q.score / 5) * 100}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">Average Question Score:</span>
                            <span className="font-bold text-gray-800">{questionAverage.toFixed(1)}/5</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
                          <h4 className="text-lg font-bold mb-4 text-gray-800">Recommendation</h4>
                          {feedback.recommendation ? (
                            <div className="flex items-center">
                              <div className={`w-3 h-3 rounded-full mr-2 ${feedback.recommendation === 'Hire' ? 'bg-green-500' : feedback.recommendation === 'Consider' ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                              <span className={`font-semibold ${feedback.recommendation === 'Hire' ? 'text-green-600' : feedback.recommendation === 'Consider' ? 'text-yellow-600' : 'text-red-600'}`}>
                                {feedback.recommendation}
                              </span>
                            </div>
                          ) : (
                            <p className="text-gray-500 italic">No recommendation provided</p>
                          )}
                        </div>
                        <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
                          <h4 className="text-lg font-bold mb-3 text-gray-800">Key Strengths</h4>
                          {feedback.strengths ? <p className="text-gray-700">{feedback.strengths}</p> : <p className="text-gray-500 italic">No strengths provided</p>}
                        </div>
                        <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
                          <h4 className="text-lg font-bold mb-3 text-gray-800">Areas for Improvement</h4>
                          {feedback.improvementAreas ? <p className="text-gray-700">{feedback.improvementAreas}</p> : <p className="text-gray-500 italic">No improvement areas provided</p>}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <FaUser className="h-16 w-16 mb-4" />
              <h3 className="text-xl font-medium mb-2">No Candidate Selected</h3>
              <p>Select a candidate from the list to begin evaluation</p>
            </div>
          )}
        </section>
      </main>

      {/* Modals */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-lg font-bold mb-4 text-gray-800">Submit Evaluation</h3>
            <p className="mb-6 text-gray-600">Are you sure you want to submit this evaluation for {selectedCandidate.name}?</p>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-700">Overall Score:</span>
                <span className="font-bold text-gray-800">{totalScore.toFixed(1)}/5</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-700">Recommendation:</span>
                <span className={`font-bold ${feedback.recommendation === 'Hire' ? 'text-green-600' : feedback.recommendation === 'Consider' ? 'text-yellow-600' : 'text-red-600'}`}>
                  {feedback.recommendation || 'None'}
                </span>
              </div>
            </div>
            
            {Object.keys(errors).length > 0 && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg">
                Please complete all required fields before submitting.
              </div>
            )}
            
            <div className="flex justify-end space-x-3">
              <button 
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition"
                onClick={() => setShowSubmitModal(false)}
              >
                Cancel
              </button>
              <button 
                className="px-4 py-2 bg-[#2563EB] text-white rounded-lg hover:bg-blue-600 transition flex items-center"
                onClick={handleSubmit}
                disabled={isLoading}
              >
                {isLoading && <FaSpinner className="animate-spin h-5 w-5 mr-2" />}
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 flex items-center shadow-xl animate-fade-in">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mr-4">
              <FaCheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">Evaluation Submitted!</h3>
              <p className="text-gray-600">The feedback has been successfully saved and shared.</p>
            </div>
          </div>
        </div>
      )}

      {showCollaborateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-lg font-bold mb-4 text-gray-800">Add Collaborators</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Collaborator Name</label>
              <input 
                type="text" 
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                placeholder="Enter name"
                value={newCollaborator}
                onChange={(e) => setNewCollaborator(e.target.value)}
                maxLength={50}
              />
              <p className="text-xs text-gray-500 mt-1">{collaborators.length}/5 collaborators added</p>
            </div>
            
            {collaborators.length > 0 && (
              <div className="mb-6 max-h-40 overflow-auto">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Current Collaborators</h4>
                <div className="space-y-2">
                  {collaborators.map(c => (
                    <div key={c.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-blue-200 text-[#2563EB] flex items-center justify-center mr-3 text-xs font-medium">
                          {c.avatar}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{c.name}</p>
                          <p className="text-xs text-gray-500">{c.role}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex justify-end space-x-3">
              <button 
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition"
                onClick={() => setShowCollaborateModal(false)}
              >
                Cancel
              </button>
              <button 
                className="px-4 py-2 bg-[#2563EB] text-white rounded-lg hover:bg-blue-600 transition disabled:bg-gray-400"
                onClick={handleAddCollaborator}
                disabled={!newCollaborator.trim() || collaborators.length >= 5}
              >
                Add Collaborator
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}