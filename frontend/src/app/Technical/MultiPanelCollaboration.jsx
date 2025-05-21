// MultiPanelCollaboration.jsx
import React, { useState, useEffect } from 'react';

export default function MultiPanelCollaboration() {
  const [showSidebar, setShowSidebar] = useState(true);
  const [activeTab, setActiveTab] = useState('candidates');
  const [showCollaborators, setShowCollaborators] = useState(true);
  const [activeUsers, setActiveUsers] = useState([
    { id: 1, name: "Alice Johnson", initials: "AJ", color: "bg-blue-500" },
    { id: 2, name: "Bob Smith", initials: "BS", color: "bg-green-500" },
    { id: 3, name: "Charlie Brown", initials: "CB", color: "bg-red-500" }
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [candidates, setCandidates] = useState([
    { id: 1, name: "Jane Smith", position: "Frontend Developer", status: "Scheduled" },
    { id: 2, name: "John Doe", position: "Backend Developer", status: "In Progress" },
    { id: 3, name: "Alex Taylor", position: "UX Designer", status: "Completed" }
  ]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isAddingCandidate, setIsAddingCandidate] = useState(false);
  const [newCandidate, setNewCandidate] = useState({ name: '', position: '', status: 'Scheduled' });
  const [interviewers, setInterviewers] = useState([
    { id: 1, name: "Sarah Johnson", role: "Engineering Manager", available: true },
    { id: 2, name: "Mike Chen", role: "Senior Developer", available: false }
  ]);
  const [isAddingInterviewer, setIsAddingInterviewer] = useState(false);
  const [selectedInterviewer, setSelectedInterviewer] = useState(null);
  const [evaluations, setEvaluations] = useState([]);
  const [newEvaluation, setNewEvaluation] = useState({ candidateId: null, interviewerId: null, score: 0, feedback: '', criteriaScores: [] });
  const [assessmentCriteria, setAssessmentCriteria] = useState([
    { id: 1, name: "Technical Skills", weight: 0.4 },
    { id: 2, name: "Communication", weight: 0.3 },
    { id: 3, name: "Cultural Fit", weight: 0.3 }
  ]);
  const [criteriaToEdit, setCriteriaToEdit] = useState(null);
  const [newCriteriaName, setNewCriteriaName] = useState('');
  const [newCriteriaWeight, setNewCriteriaWeight] = useState(0);
  const [showCriteriaScores, setShowCriteriaScores] = useState(true);
  const [discussions, setDiscussions] = useState([]);
  const [newDiscussionMessage, setNewDiscussionMessage] = useState('');

  const filteredCandidates = candidates.filter(candidate => {
    return (
      (filterStatus === 'all' || candidate.status === filterStatus) &&
      (candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) || candidate.position.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const handleCandidateSelect = (candidate) => {
    setSelectedCandidate(candidate);
  };

  const getAverageScore = (candidateId) => {
    const candidateEvaluations = evaluations.filter(evaluation => evaluation.candidateId === candidateId);
    if (candidateEvaluations.length === 0) return 'N/A';
    const totalScore = candidateEvaluations.reduce((sum, evaluation) => sum + evaluation.score, 0);
    return (totalScore / candidateEvaluations.length).toFixed(1);
  };

  const getCandidateEvaluations = (candidateId) => {
    return evaluations.filter(evaluation => evaluation.candidateId === candidateId);
  };

  const getInterviewerById = (interviewerId) => {
    return interviewers.find(interviewer => interviewer.id === interviewerId);
  };

  const formatDateTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const updateCriteriaScore = (criteriaId, score) => {
    setNewEvaluation(prevState => {
      const updatedCriteriaScores = prevState.criteriaScores.map(cs => {
        if (cs.criteriaId === criteriaId) {
          return { ...cs, score: parseFloat(score) };
        }
        return cs;
      });
      return { ...prevState, criteriaScores: updatedCriteriaScores };
    });
  };

  const submitEvaluation = () => {
    setEvaluations([...evaluations, { ...newEvaluation, id: evaluations.length + 1, timestamp: new Date().toISOString() }]);
    setNewEvaluation({ candidateId: null, interviewerId: null, score: 0, feedback: '', criteriaScores: [] });
  };

  const addNewCandidate = () => {
    setCandidates([...candidates, { ...newCandidate, id: candidates.length + 1 }]);
    setNewCandidate({ name: '', position: '', status: 'Scheduled' });
    setIsAddingCandidate(false);
  };

  const editCriteria = (criteria) => {
    setCriteriaToEdit(criteria);
    setNewCriteriaName(criteria.name);
    setNewCriteriaWeight(criteria.weight);
  };

  const updateCriteria = () => {
    if (criteriaToEdit.id === 0) {
      setAssessmentCriteria([...assessmentCriteria, { id: assessmentCriteria.length + 1, name: newCriteriaName, weight: newCriteriaWeight }]);
    } else {
      setAssessmentCriteria(assessmentCriteria.map(criteria => {
        if (criteria.id === criteriaToEdit.id) {
          return { ...criteria, name: newCriteriaName, weight: newCriteriaWeight };
        }
        return criteria;
      }));
    }
    setCriteriaToEdit(null);
    setNewCriteriaName('');
    setNewCriteriaWeight(0);
  };

  const deleteCriteria = (criteriaId) => {
    setAssessmentCriteria(assessmentCriteria.filter(criteria => criteria.id !== criteriaId));
  };

  const timeAgo = (timestamp) => {
    const now = new Date();
    const timeDiff = now - new Date(timestamp);
    const seconds = Math.floor(timeDiff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return `${seconds}s ago`;
  };

  const submitDiscussionMessage = () => {
    setDiscussions([...discussions, { id: discussions.length + 1, userName: "Current User", message: newDiscussionMessage, timestamp: new Date().toISOString() }]);
    setNewDiscussionMessage('');
  };

  return (
    <div className="w-full">
      {/* Header */}
      <header className="bg-blue-600 text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Multi-Panel Collaboration</h1>
        <button
          onClick={() => setShowSidebar(!showSidebar)}
          className="px-4 py-2 bg-blue-700 rounded-lg hover:bg-blue-800"
        >
          Toggle Sidebar
        </button>
      </header>

      {/* Main Content */}
      <main className="flex">
        {/* Sidebar */}
        {showSidebar && (
          <nav className="w-64 bg-white shadow-lg h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Navigation</h2>
              </div>
              
              <div className="space-y-1">
                <button 
                  onClick={() => setActiveTab('candidates')}
                  className={`w-full text-left px-4 py-2 rounded-lg ${
                    activeTab === 'candidates' ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'
                  }`}
                >
                  📋 Candidates
                </button>
                <button 
                  onClick={() => setActiveTab('interviewers')}
                  className={`w-full text-left px-4 py-2 rounded-lg ${
                    activeTab === 'interviewers' ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'
                  }`}
                >
                  👥 Interviewers
                </button>
                <button 
                  onClick={() => setActiveTab('evaluations')}
                  className={`w-full text-left px-4 py-2 rounded-lg ${
                    activeTab === 'evaluations' ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'
                  }`}
                >
                  📊 Evaluations
                </button>
                <button 
                  onClick={() => setActiveTab('criteria')}
                  className={`w-full text-left px-4 py-2 rounded-lg ${
                    activeTab === 'criteria' ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'
                  }`}
                >
                  ✓ Assessment Criteria
                </button>
              </div>
            </div>

            {/* Active Users Section */}
            {showCollaborators && (
              <div className="border-t p-4">
                <h3 className="text-sm font-medium text-gray-500 mb-3">Active Collaborators</h3>
                <div className="space-y-2">
                  {activeUsers.map(user => (
                    <div key={user.id} className="flex items-center space-x-2">
                      <div className={`w-8 h-8 rounded-full ${user.color} flex items-center justify-center text-white text-sm font-medium`}>
                        {user.initials}
                      </div>
                      <span className="text-sm">{user.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </nav>
        )}

        {/* Main Panel */}
        <div className="flex-1 p-6">
          <div className="bg-white rounded-lg shadow">
            {/* Search and Filter Bar */}
            <div className="p-4 border-b">
              <div className="flex space-x-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>

            {/* Content Area */}
            <div className="p-4">
              {activeTab === 'candidates' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Candidates</h2>
                    <button
                      onClick={() => setIsAddingCandidate(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Add Candidate
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredCandidates.map(candidate => (
                      <div
                        key={candidate.id}
                        className={`p-4 border rounded-lg cursor-pointer hover:border-blue-500 ${
                          selectedCandidate?.id === candidate.id ? 'border-blue-500 bg-blue-50' : ''
                        }`}
                        onClick={() => handleCandidateSelect(candidate)}
                      >
                        <h3 className="font-medium">{candidate.name}</h3>
                        <p className="text-sm text-gray-500">{candidate.position}</p>
                        <div className="mt-2 flex justify-between items-center">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            candidate.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                            candidate.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {candidate.status}
                          </span>
                          <span className="text-sm">
                            Score: {getAverageScore(candidate.id)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'interviewers' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Interviewers</h2>
                    <button
                      onClick={() => setIsAddingInterviewer(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Add Interviewer
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {interviewers.map(interviewer => (
                      <div
                        key={interviewer.id}
                        className={`p-4 border rounded-lg ${
                          interviewer.available ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <h3 className="font-medium">{interviewer.name}</h3>
                        <p className="text-sm text-gray-500">{interviewer.role}</p>
                        <div className="mt-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            interviewer.available ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {interviewer.available ? 'Available' : 'Unavailable'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'evaluations' && selectedCandidate && (
                <div>
                  <h2 className="text-xl font-bold mb-4">Evaluations for {selectedCandidate.name}</h2>
                  
                  <div className="space-y-4">
                    {getCandidateEvaluations(selectedCandidate.id).map(evaluation => (
                      <div key={evaluation.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-medium">
                              {getInterviewerById(evaluation.interviewerId)?.name}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {formatDateTime(evaluation.timestamp)}
                            </p>
                          </div>
                          <div className="text-2xl font-bold">{evaluation.score}</div>
                        </div>
                        
                        {showCriteriaScores && (
                          <div className="mt-2 space-y-2">
                            {evaluation.criteriaScores.map(cs => {
                              const criteria = assessmentCriteria.find(c => c.id === cs.criteriaId);
                              return criteria ? (
                                <div key={cs.criteriaId} className="flex justify-between items-center">
                                  <span className="text-sm text-gray-600">{criteria.name}</span>
                                  <span className="font-medium">{cs.score}</span>
                                </div>
                              ) : null;
                            })}
                          </div>
                        )}
                        
                        <p className="mt-2 text-gray-700">{evaluation.feedback}</p>
                      </div>
                    ))}
                    
                    {selectedInterviewer && (
                      <div className="p-4 border rounded-lg bg-gray-50">
                        <h3 className="font-medium mb-2">New Evaluation</h3>
                        
                        <div className="space-y-4">
                          {assessmentCriteria.map(criteria => (
                            <div key={criteria.id} className="flex items-center space-x-4">
                              <label className="flex-1">{criteria.name}</label>
                              <input
                                type="number"
                                min="1"
                                max="5"
                                step="0.1"
                                value={newEvaluation.criteriaScores.find(cs => cs.criteriaId === criteria.id)?.score || 3}
                                onChange={(e) => updateCriteriaScore(criteria.id, e.target.value)}
                                className="w-20 px-2 py-1 border rounded"
                              />
                            </div>
                          ))}
                          
                          <textarea
                            value={newEvaluation.feedback}
                            onChange={(e) => setNewEvaluation({...newEvaluation, feedback: e.target.value})}
                            placeholder="Enter your feedback..."
                            className="w-full p-2 border rounded"
                            rows="4"
                          ></textarea>
                          
                          <div className="flex justify-end">
                            <button
                              onClick={submitEvaluation}
                              disabled={!newEvaluation.feedback}
                              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300"
                            >
                              Submit Evaluation
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'criteria' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Assessment Criteria</h2>
                    <button
                      onClick={() => {
                        setCriteriaToEdit({ id: 0, name: '', weight: 0 });
                        setNewCriteriaName('');
                        setNewCriteriaWeight(0);
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Add Criteria
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {assessmentCriteria.map(criteria => (
                      <div key={criteria.id} className="p-4 border rounded-lg flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">{criteria.name}</h3>
                          <p className="text-sm text-gray-500">Weight: {(criteria.weight * 100).toFixed(0)}%</p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => editCriteria(criteria)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteCriteria(criteria.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar - Discussion Panel */}
        {selectedCandidate && (
          <div className="w-96 bg-white shadow-lg border-l h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">Discussion</h2>
              <p className="text-sm text-gray-500">Candidate: {selectedCandidate.name}</p>
            </div>
            
            <div className="flex flex-col h-[calc(100%-8rem)]">
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {discussions.map(message => (
                  <div key={message.id} className="flex space-x-2">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-medium text-sm">
                        {message.userName.split(' ').map(n => n[0]).join('')}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-baseline space-x-2">
                        <span className="font-medium">{message.userName}</span>
                        <span className="text-xs text-gray-500">{timeAgo(message.timestamp)}</span>
                      </div>
                      <p className="text-gray-700 text-sm">{message.message}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="p-4 border-t">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newDiscussionMessage}
                    onChange={(e) => setNewDiscussionMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && newDiscussionMessage.trim()) {
                        submitDiscussionMessage();
                      }
                    }}
                  />
                  <button
                    onClick={submitDiscussionMessage}
                    disabled={!newDiscussionMessage.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      {/* Add Candidate Modal */}
      {isAddingCandidate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-xl font-bold mb-4">Add New Candidate</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={newCandidate.name}
                  onChange={(e) => setNewCandidate({...newCandidate, name: e.target.value})}
                  className="mt-1 w-full border rounded-lg px-4 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Position</label>
                <input
                  type="text"
                  value={newCandidate.position}
                  onChange={(e) => setNewCandidate({...newCandidate, position: e.target.value})}
                  className="mt-1 w-full border rounded-lg px-4 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Initial Status</label>
                <select
                  value={newCandidate.status}
                  onChange={(e) => setNewCandidate({...newCandidate, status: e.target.value})}
                  className="mt-1 w-full border rounded-lg px-4 py-2"
                >
                  <option value="Scheduled">Scheduled</option>
                  <option value="In Progress">In Progress</option>
                </select>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setIsAddingCandidate(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={addNewCandidate}
                disabled={!newCandidate.name || !newCandidate.position}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
              >
                Add Candidate
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Add/Edit Criteria Modal */}
      {criteriaToEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-xl font-bold mb-4">
              {criteriaToEdit.id === 0 ? 'Add New Criteria' : 'Edit Criteria'}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={newCriteriaName}
                  onChange={(e) => setNewCriteriaName(e.target.value)}
                  className="mt-1 w-full border rounded-lg px-4 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Weight (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={newCriteriaWeight * 100}
                  onChange={(e) => setNewCriteriaWeight(parseFloat(e.target.value) / 100)}
                  className="mt-1 w-full border rounded-lg px-4 py-2"
                />
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setCriteriaToEdit(null)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={updateCriteria}
                disabled={!newCriteriaName || newCriteriaWeight <= 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
              >
                {criteriaToEdit.id === 0 ? 'Add Criteria' : 'Update Criteria'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}