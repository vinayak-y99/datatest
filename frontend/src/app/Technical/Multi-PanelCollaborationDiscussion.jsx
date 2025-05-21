'use client';

import React, { useState, useEffect } from 'react';

export default function MultiPanelCollaboration() {
  const [candidates, setCandidates] = useState([
    { id: 1, name: "John Doe", position: "Senior Developer", status: "In Progress" },
    { id: 2, name: "Jane Smith", position: "Product Manager", status: "Scheduled" },
    { id: 3, name: "Michael Johnson", position: "UX Designer", status: "Completed" },
  ]);

  const [interviewers, setInterviewers] = useState([
    { id: 1, name: "Alex Rivera", role: "Tech Lead", available: true },
    { id: 2, name: "Sarah Chen", role: "HR Manager", available: true },
    { id: 3, name: "David Kim", role: "Senior Engineer", available: false },
  ]);

  const [evaluations, setEvaluations] = useState([
    { id: 1, candidateId: 1, interviewerId: 1, score: 4.5, feedback: "Excellent problem-solving skills, good cultural fit", timestamp: "2025-03-10T14:30:00" },
    { id: 2, candidateId: 1, interviewerId: 2, score: 4.2, feedback: "Great communication, but could improve on technical depth", timestamp: "2025-03-10T15:45:00" },
    { id: 3, candidateId: 3, interviewerId: 1, score: 3.8, feedback: "Strong design portfolio, needs improvement on collaborative approach", timestamp: "2025-03-09T10:15:00" },
  ]);

  const [activeTab, setActiveTab] = useState('candidates');
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [selectedInterviewer, setSelectedInterviewer] = useState(null);
  const [newEvaluation, setNewEvaluation] = useState({ score: 0, feedback: "" });
  const [discussions, setDiscussions] = useState([]);
  const [newDiscussionMessage, setNewDiscussionMessage] = useState("");
  const [assessmentCriteria, setAssessmentCriteria] = useState([
    { id: 1, name: "Technical Skills", weight: 0.3 },
    { id: 2, name: "Communication", weight: 0.2 },
    { id: 3, name: "Problem Solving", weight: 0.25 },
    { id: 4, name: "Cultural Fit", weight: 0.15 },
    { id: 5, name: "Experience", weight: 0.1 },
  ]);
  const [criteriaToEdit, setCriteriaToEdit] = useState(null);
  const [newCriteriaName, setNewCriteriaName] = useState("");
  const [newCriteriaWeight, setNewCriteriaWeight] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeCollaborators, setActiveCollaborators] = useState([
    { id: 1, initials: 'AR', name: 'Alex Rivera', color: 'bg-blue-500' },
    { id: 2, initials: 'SC', name: 'Sarah Chen', color: 'bg-green-500' },
    { id: 3, initials: 'JL', name: 'James Lee', color: 'bg-purple-500' }
  ]);
  const [editingInterviewer, setEditingInterviewer] = useState(null);

  useEffect(() => {
    if (candidates.length > 0 && !selectedCandidate) {
      setSelectedCandidate(candidates[0]);
      setDiscussions([
        { id: 1, candidateId: 1, userId: 1, userName: "Alex Rivera", message: "I think John has excellent coding skills but needs to work on system design.", timestamp: "2025-03-10T16:30:00" },
        { id: 2, candidateId: 1, userId: 2, userName: "Sarah Chen", message: "Agreed. His problem-solving approach was methodical, which is great.", timestamp: "2025-03-10T16:35:00" },
      ]);
    }
  }, [candidates, selectedCandidate]);

  const handleCandidateSelect = (candidate) => {
    setSelectedCandidate(candidate);
    const candidateDiscussions = [
      { id: 1, candidateId: candidate.id, userId: 1, userName: "Alex Rivera", message: `I think ${candidate.name} has excellent coding skills but needs to work on system design.`, timestamp: "2025-03-10T16:30:00" },
      { id: 2, candidateId: candidate.id, userId: 2, userName: "Sarah Chen", message: "Agreed. The problem-solving approach was methodical, which is great.", timestamp: "2025-03-10T16:35:00" },
    ];
    setDiscussions(candidateDiscussions);
  };

  const addNewCandidate = () => {
    const newId = Math.max(...candidates.map(c => c.id)) + 1;
    const newCandidate = {
      id: newId,
      name: "New Candidate",
      position: "Position",
      status: "Scheduled"
    };
    setCandidates([...candidates, newCandidate]);
    addNotification("New candidate added to the system");
  };

  const addNewInterviewer = () => {
    const newId = Math.max(...interviewers.map(i => i.id)) + 1;
    const newInterviewer = {
      id: newId,
      name: "New Interviewer",
      role: "Role",
      available: true
    };
    setInterviewers([...interviewers, newInterviewer]);
    addNotification("New interviewer added to the system");
  };

  const editInterviewer = (interviewer) => {
    setEditingInterviewer({ ...interviewer });
  };

  const saveInterviewerChanges = () => {
    if (!editingInterviewer) return;
    setInterviewers(interviewers.map(i => 
      i.id === editingInterviewer.id ? editingInterviewer : i
    ));
    setEditingInterviewer(null);
    addNotification("Interviewer details updated");
  };

  const viewInterviewerHistory = (interviewerId) => {
    const history = evaluations.filter(e => e.interviewerId === interviewerId);
    // In a real app, you'd show this in a modal or new view
    console.log(`Evaluation history for interviewer ${interviewerId}:`, history);
    addNotification(`Viewed history for ${interviewers.find(i => i.id === interviewerId).name}`);
  };

  const deleteCriteria = (criteriaId) => {
    const updatedCriteria = assessmentCriteria.filter(c => c.id !== criteriaId);
    setAssessmentCriteria(updatedCriteria);
    addNotification("Assessment criteria deleted");
  };

  const getCandidateEvaluations = (candidateId) => {
    return evaluations.filter(evaluation => evaluation.candidateId === candidateId);
  };

  const getInterviewerById = (id) => {
    return interviewers.find(interviewer => interviewer.id === id);
  };

  const submitEvaluation = () => {
    if (!selectedCandidate || !selectedInterviewer) return;
    
    const newId = Math.max(...evaluations.map(e => e.id), 0) + 1;
    const timestamp = new Date().toISOString();
    
    const evaluation = {
      id: newId,
      candidateId: selectedCandidate.id,
      interviewerId: selectedInterviewer.id,
      score: parseFloat(newEvaluation.score),
      feedback: newEvaluation.feedback,
      timestamp
    };
    
    setEvaluations([...evaluations, evaluation]);
    setNewEvaluation({ score: 0, feedback: "" });
    addNotification(`New evaluation submitted for ${selectedCandidate.name}`);
  };

  const submitDiscussionMessage = () => {
    if (!newDiscussionMessage.trim() || !selectedCandidate) return;
    
    const newId = Math.max(...discussions.map(d => d.id), 0) + 1;
    const timestamp = new Date().toISOString();
    
    const message = {
      id: newId,
      candidateId: selectedCandidate.id,
      userId: 1,
      userName: "Alex Rivera",
      message: newDiscussionMessage,
      timestamp
    };
    
    setDiscussions([...discussions, message]);
    setNewDiscussionMessage("");
    addNotification("New discussion message posted");
  };

  const updateCriteria = () => {
    if (!criteriaToEdit || !newCriteriaName || newCriteriaWeight <= 0) return;
    
    let updatedCriteria;
    if (criteriaToEdit.id === 0) {
      const newId = Math.max(...assessmentCriteria.map(c => c.id)) + 1;
      updatedCriteria = [...assessmentCriteria, {
        id: newId,
        name: newCriteriaName,
        weight: parseFloat(newCriteriaWeight)
      }];
    } else {
      updatedCriteria = assessmentCriteria.map(criteria => 
        criteria.id === criteriaToEdit.id 
          ? { ...criteria, name: newCriteriaName, weight: parseFloat(newCriteriaWeight) }
          : criteria
      );
    }
    
    setAssessmentCriteria(updatedCriteria);
    setCriteriaToEdit(null);
    setNewCriteriaName("");
    setNewCriteriaWeight(0);
    addNotification("Assessment criteria updated");
  };

  const editCriteria = (criteria) => {
    setCriteriaToEdit(criteria);
    setNewCriteriaName(criteria.name);
    setNewCriteriaWeight(criteria.weight);
  };

  const addNotification = (message) => {
    const newNotification = {
      id: Date.now(),
      message,
      timestamp: new Date().toISOString(),
      read: false
    };
    
    setNotifications([newNotification, ...notifications.slice(0, 9)]);
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const getAverageScore = (candidateId) => {
    const candidateEvals = evaluations.filter(e => e.candidateId === candidateId);
    if (candidateEvals.length === 0) return "N/A";
    
    const sum = candidateEvals.reduce((acc, evaluation) => acc + evaluation.score, 0);
    return (sum / candidateEvals.length).toFixed(1);
  };

  const formatDateTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString();
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <header className="bg-white shadow-md">
        

        <div className="border-b">
          <nav className="flex space-x-1 px-4">
            <button 
              className={`py-3 px-6 text-gray-600 hover:bg-gray-100 border-b-2 ${
                activeTab === 'candidates' ? 'border-blue-600 text-blue-600 font-medium' : 'border-transparent'
              }`}
              onClick={() => setActiveTab('candidates')}
            >
              Candidates
            </button>
            <button 
              className={`py-3 px-6 text-gray-600 hover:bg-gray-100 border-b-2 ${
                activeTab === 'evaluations' ? 'border-blue-600 text-blue-600 font-medium' : 'border-transparent'
              }`}
              onClick={() => setActiveTab('evaluations')}
            >
              Evaluations
            </button>
            <button 
              className={`py-3 px-6 text-gray-600 hover:bg-gray-100 border-b-2 ${
                activeTab === 'interviewers' ? 'border-blue-600 text-blue-600 font-medium' : 'border-transparent'
              }`}
              onClick={() => setActiveTab('interviewers')}
            >
              Interviewers
            </button>
            <button 
              className={`py-3 px-6 text-gray-600 hover:bg-gray-100 border-b-2 ${
                activeTab === 'criteria' ? 'border-blue-600 text-blue-600 font-medium' : 'border-transparent'
              }`}
              onClick={() => setActiveTab('criteria')}
            >
              Assessment Criteria
            </button>
          </nav>
        </div>
      </header>

      <main className="p-6">
        {activeTab === 'candidates' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Candidate Management</h2>
              <button 
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                onClick={addNewCandidate}
              >
                Add New Candidate
              </button>
            </div>
            
            <div className="flex">
              <div className="w-1/3 pr-4">
                <div className="bg-white rounded-lg shadow p-4">
                  <h3 className="font-medium mb-4">Candidates</h3>
                  
                  <div className="space-y-2">
                    {candidates.map(candidate => (
                      <div 
                        key={candidate.id}
                        className={`p-3 rounded cursor-pointer ${selectedCandidate?.id === candidate.id ? 'bg-blue-100 border-l-4 border-blue-600' : 'hover:bg-gray-100 border-l-4 border-transparent'}`}
                        onClick={() => handleCandidateSelect(candidate)}
                      >
                        <h4 className="font-medium">{candidate.name}</h4>
                        <p className="text-sm text-gray-600">{candidate.position}</p>
                        <div className="flex justify-between mt-2">
                          <span className={`text-xs px-2 py-1 rounded ${
                            candidate.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                            candidate.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {candidate.status}
                          </span>
                          <span className="text-sm font-medium">
                            Score: {getAverageScore(candidate.id)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="w-2/3">
                {selectedCandidate ? (
                  <div className="space-y-4">
                    <div className="bg-white rounded-lg shadow p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-xl font-bold">{selectedCandidate.name}</h3>
                          <p className="text-gray-600">{selectedCandidate.position}</p>
                        </div>
                        <span className={`px-3 py-1 rounded ${
                          selectedCandidate.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                          selectedCandidate.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {selectedCandidate.status}
                        </span>
                      </div>
                      
                      <div className="mt-4">
                        <h4 className="font-medium mb-2">Evaluation Summary</h4>
                        <div className="flex items-center">
                          <div className="text-3xl font-bold mr-2">
                            {getAverageScore(selectedCandidate.id)}
                          </div>
                          <div className="text-sm text-gray-600">
                            {getCandidateEvaluations(selectedCandidate.id).length} evaluations
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow p-4">
                      <h3 className="font-medium mb-4">Evaluations</h3>
                      
                      {getCandidateEvaluations(selectedCandidate.id).length > 0 ? (
                        <div className="space-y-3">
                          {getCandidateEvaluations(selectedCandidate.id).map(evaluation => {
                            const interviewer = getInterviewerById(evaluation.interviewerId);
                            return (
                              <div 
                                key={evaluation.id} 
                                className="border-l-4 border-blue-400 bg-blue-50 p-3"
                              >
                                <div className="flex justify-between">
                                  <span className="font-medium">{interviewer?.name || 'Unknown'}</span>
                                  <span className="text-sm text-gray-600">{formatDateTime(evaluation.timestamp)}</span>
                                </div>
                                <div className="flex items-center mt-1">
                                  <div className="text-lg font-bold mr-2">{evaluation.score.toFixed(1)}</div>
                                  <div className="text-sm text-gray-700">{interviewer?.role || 'Unknown'}</div>
                                </div>
                                <p className="mt-2 text-gray-700">{evaluation.feedback}</p>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-6 text-gray-500">No evaluations yet</div>
                      )}
                      
                      <div className="mt-4 p-3 border rounded">
                        <h4 className="font-medium mb-2">Add New Evaluation</h4>
                        
                        <div className="mb-3">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Interviewer</label>
                          <select 
                            className="w-full p-2 border rounded"
                            value={selectedInterviewer?.id || ""}
                            onChange={(e) => {
                              const id = parseInt(e.target.value);
                              setSelectedInterviewer(interviewers.find(i => i.id === id) || null);
                            }}
                          >
                            <option value="">Select Interviewer</option>
                            {interviewers.map(interviewer => (
                              <option key={interviewer.id} value={interviewer.id}>
                                {interviewer.name} ({interviewer.role})
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        <div className="mb-3">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Score (1-5)</label>
                          <input 
                            type="number" 
                            min="1" 
                            max="5" 
                            step="0.1"
                            className="w-full p-2 border rounded"
                            value={newEvaluation.score}
                            onChange={(e) => setNewEvaluation({...newEvaluation, score: e.target.value})}
                          />
                        </div>
                        
                        <div className="mb-3">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Feedback</label>
                          <textarea 
                            className="w-full p-2 border rounded min-h-24"
                            value={newEvaluation.feedback}
                            onChange={(e) => setNewEvaluation({...newEvaluation, feedback: e.target.value})}
                          />
                        </div>
                        
                        <button 
                          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
                          onClick={submitEvaluation}
                        >
                          Submit Evaluation
                        </button>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow p-4">
                      <h3 className="font-medium mb-4">Team Discussion</h3>
                      
                      <div className="border rounded-lg mb-4 max-h-64 overflow-y-auto p-3">
                        {discussions.length > 0 ? (
                          <div className="space-y-3">
                            {discussions.map(discussion => (
                              <div key={discussion.id} className="flex">
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-bold mr-2 flex-shrink-0">
                                  {discussion.userName.charAt(0)}
                                </div>
                                <div className="flex-1">
                                  <div className="flex justify-between">
                                    <span className="font-medium">{discussion.userName}</span>
                                    <span className="text-xs text-gray-500">{formatDateTime(discussion.timestamp)}</span>
                                  </div>
                                  <p className="text-gray-700 mt-1">{discussion.message}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-6 text-gray-500">No discussions yet</div>
                        )}
                      </div>
                      
                      <div className="flex">
                        <input 
                          type="text" 
                          className="flex-1 p-2 border rounded-l"
                          placeholder="Add to the discussion..."
                          value={newDiscussionMessage}
                          onChange={(e) => setNewDiscussionMessage(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && submitDiscussionMessage()}
                        />
                        <button 
                          className="bg-blue-600 text-white px-4 py-2 rounded-r hover:bg-blue-700"
                          onClick={submitDiscussionMessage}
                        >
                          Post
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">Select a candidate to view details</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'evaluations' && (
          <div>
            <h2 className="text-xl font-bold mb-6">Evaluation Summary</h2>
            
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Candidate</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg. Score</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"># of Evaluations</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {candidates.map(candidate => (
                    <tr 
                      key={candidate.id} 
                      className="hover:bg-gray-50 cursor-pointer" 
                      onClick={() => {
                        setSelectedCandidate(candidate);
                        setActiveTab('candidates');
                      }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{candidate.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {candidate.position}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium">{getAverageScore(candidate.id)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {getCandidateEvaluations(candidate.id).length}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          candidate.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                          candidate.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {candidate.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'interviewers' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Interviewer Management</h2>
              <button 
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                onClick={addNewInterviewer}
              >
                Add New Interviewer
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {interviewers.map(interviewer => {
                const interviewerEvals = evaluations.filter(e => e.interviewerId === interviewer.id);
                const avgScore = interviewerEvals.length 
                  ? (interviewerEvals.reduce((acc, e) => acc + e.score, 0) / interviewerEvals.length).toFixed(1)
                  : "N/A";
                
                return (
                  <div key={interviewer.id} className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-bold mr-3">
                          {interviewer.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <h3 className="font-medium">{interviewer.name}</h3>
                          <p className="text-sm text-gray-600">{interviewer.role}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${interviewer.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {interviewer.available ? 'Available' : 'Busy'}
                      </span>
                    </div>
                    
                    <div className="mt-4 border-t pt-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">Evaluations:</span>
                        <span className="font-medium">{interviewerEvals.length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Avg. Score Given:</span>
                        <span className="font-medium">{avgScore}</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex space-x-2">
                      <button 
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm hover:bg-blue-200 flex-1"
                        onClick={() => viewInterviewerHistory(interviewer.id)}
                      >
                        View History
                      </button>
                      <button 
                        className="bg-gray-100 text-gray-800 px-3 py-1 rounded text-sm hover:bg-gray-200 flex-1"
                        onClick={() => editInterviewer(interviewer)}
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {editingInterviewer && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-96">
                  <h3 className="text-lg font-bold mb-4">Edit Interviewer</h3>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded"
                      value={editingInterviewer.name}
                      onChange={(e) => setEditingInterviewer({...editingInterviewer, name: e.target.value})}
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded"
                      value={editingInterviewer.role}
                      onChange={(e) => setEditingInterviewer({...editingInterviewer, role: e.target.value})}
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
                    <select
                      className="w-full p-2 border rounded"
                      value={editingInterviewer.available.toString()}
                      onChange={(e) => setEditingInterviewer({...editingInterviewer, available: e.target.value === 'true'})}
                    >
                      <option value="true">Available</option>
                      <option value="false">Busy</option>
                    </select>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex-1"
                      onClick={saveInterviewerChanges}
                    >
                      Save
                    </button>
                    <button
                      className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 flex-1"
                      onClick={() => setEditingInterviewer(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'criteria' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Assessment Criteria Management</h2>
              <button 
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                onClick={() => {
                  setCriteriaToEdit({id: 0, name: "", weight: 0});
                  setNewCriteriaName("");
                  setNewCriteriaWeight(0);
                }}
              >
                Add New Criteria
              </button>
            </div>
            
            <div className="flex">
              <div className="w-2/3 pr-4">
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Criteria</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weight</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {assessmentCriteria.map(criteria => (
                        <tr key={criteria.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-gray-900">{criteria.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{(criteria.weight * 100).toFixed(0)}%</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <button 
                              className="text-blue-600 hover:text-blue-800 mr-3"
                              onClick={() => editCriteria(criteria)}
                            >
                              Edit
                            </button>
                            <button 
                              className="text-red-600 hover:text-red-800"
                              onClick={() => deleteCriteria(criteria.id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="mt-6 bg-white rounded-lg shadow p-4">
                  <h3 className="font-medium mb-4">Weight Distribution</h3>
                  <div className="h-8 flex rounded-full overflow-hidden">
                    {assessmentCriteria.map((criteria, index) => (
                      <div 
                        key={criteria.id}
                        className="h-full flex items-center justify-center text-white text-xs"
                        style={{ 
                          width: `${criteria.weight * 100}%`,
                          backgroundColor: [
                            '#3B82F6', '#22C55E', '#EAB308', 
                            '#A855F7', '#EC4899'
                          ][index % 5],
                        }}
                      >
                        {criteria.weight >= 0.1 ? `${criteria.name} ${(criteria.weight * 100).toFixed(0)}%` : ''}
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {assessmentCriteria.map((criteria, index) => (
                      <div key={criteria.id} className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ 
                            backgroundColor: [
                              '#3B82F6', '#22C55E', '#EAB308', 
                              '#A855F7', '#EC4899'
                            ][index % 5],
                          }}
                        />
                        <span className="text-sm">{criteria.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="w-1/3">
                {criteriaToEdit && (
                  <div className="bg-white rounded-lg shadow p-4">
                    <h3 className="font-medium mb-4">
                      {criteriaToEdit.id === 0 ? "Add New Criteria" : "Edit Criteria"}
                    </h3>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Criteria Name</label>
                      <input 
                        type="text" 
                        className="w-full p-2 border rounded"
                        value={newCriteriaName}
                        onChange={(e) => setNewCriteriaName(e.target.value)}
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Weight (0-1)</label>
                      <input 
                        type="number" 
                        min="0.01" 
                        max="1" 
                        step="0.01"
                        className="w-full p-2 border rounded"
                        value={newCriteriaWeight}
                        onChange={(e) => setNewCriteriaWeight(e.target.value)}
                      />
                      <p className="text-sm text-gray-500 mt-1">Sum of all weights should equal 1</p>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button 
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex-1"
                        onClick={updateCriteria}
                      >
                        {criteriaToEdit.id === 0 ? "Add" : "Update"}
                      </button>
                      <button 
                        className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 flex-1"
                        onClick={() => setCriteriaToEdit(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
                
                <div className="bg-white rounded-lg shadow p-4 mt-4">
                  <h3 className="font-medium mb-4">About Assessment Criteria</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Assessment criteria are used to evaluate candidates consistently across all interviews. Each criterion has a weight that reflects its importance in the overall evaluation.
                  </p>
                  <p className="text-sm text-gray-600 mb-3">
                    All weights should sum to 1 (100%) to ensure proper scoring. After updating criteria, all team members will use the new framework for future evaluations.
                  </p>
                  <button className="text-blue-600 text-sm hover:text-blue-800">
                    Learn more about creating effective assessment criteria
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-3">
        <div className="flex items-center">
          <div className="text-sm font-medium mr-3">Active collaborators:</div>
          <div className="flex -space-x-2">
            {activeCollaborators.map(collaborator => (
              <div
                key={collaborator.id}
                className={`w-8 h-8 rounded-full ${collaborator.color} flex items-center justify-center text-white text-xs border-2 border-white`}
                title={collaborator.name}
              >
                {collaborator.initials}
              </div>
            ))}
          </div>
          <div className="ml-2 text-xs text-gray-500">
            {activeCollaborators.length} online
          </div>
        </div>
      </div>
    </div>
  );
}