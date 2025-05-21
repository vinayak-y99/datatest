'use client';

import React, { useState, useEffect } from 'react';

const CandidateCommunication = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [customMessage, setCustomMessage] = useState('');
  const [notificationHistory, setNotificationHistory] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [emailTemplates, setEmailTemplates] = useState({
    selected: "Congratulations, [Name]! We're pleased to inform you that you've been selected for the [Position]. Our HR team will contact you shortly with onboarding details.",
    rejected: "Dear [Name], thank you for your interest in [Position] at our company. After careful consideration, we've decided to move forward with other candidates at this time.",
    onHold: "Hello [Name], thank you for your patience. Your application for [Position] is still under review, and we'll provide an update within the next week."
  });
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState('');
  const [editingTemplateType, setEditingTemplateType] = useState('');
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('en');
  const [showPreview, setShowPreview] = useState(false);
  const [selectedCandidates, setSelectedCandidates] = useState([]);

  useEffect(() => {
    setTimeout(() => {
      const mockCandidates = [
        { id: 1, name: 'Alex Johnson', email: 'alex@example.com', position: 'Frontend Developer', interviewDate: '2025-03-10', status: 'pending', notes: 'Strong React skills', priority: 'high' },
        { id: 2, name: 'Sam Wilson', email: 'sam@example.com', position: 'UX Designer', interviewDate: '2025-03-08', status: 'selected', notes: 'Great portfolio', priority: 'normal' },
        { id: 3, name: 'Jamie Smith', email: 'jamie@example.com', position: 'Project Manager', interviewDate: '2025-03-05', status: 'rejected', notes: 'Lack of experience in agile', priority: 'low' },
        { id: 4, name: 'Taylor Brown', email: 'taylor@example.com', position: 'Backend Developer', interviewDate: '2025-03-11', status: 'onHold', notes: 'Need to check references', priority: 'high' },
        { id: 5, name: 'Morgan Lee', email: 'morgan@example.com', position: 'DevOps Engineer', interviewDate: '2025-03-09', status: 'pending', notes: 'Good technical knowledge', priority: 'normal' }
      ];
      setCandidates(mockCandidates);
      setLoading(false);
    }, 1000);
  }, []);

  const updateCandidateStatus = (id, newStatus) => {
    setCandidates(candidates.map(candidate => 
      candidate.id === id ? { ...candidate, status: newStatus } : candidate
    ));
  };

  const sendNotification = (candidate, message) => {
    const notification = {
      id: Date.now(),
      candidateId: candidate.id,
      candidateName: candidate.name,
      message,
      timestamp: new Date().toISOString(),
      status: candidate.status,
    };
    console.log(`Sending email to ${candidate.email}: ${message}`);
    setNotificationHistory([notification, ...notificationHistory]);
    if (candidate.status === 'selected') notifyHR(candidate);
    return notification;
  };

  const notifyHR = (candidate) => {
    console.log(`Notifying HR about selected candidate: ${candidate.name}`);
    alert(`HR notified for onboarding: ${candidate.name}`);
  };

  const filteredCandidates = candidates.filter(candidate => {
    if (filter !== 'all' && candidate.status !== filter) return false;
    if (searchTerm && !(
      candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.notes.toLowerCase().includes(searchTerm.toLowerCase())
    )) return false;
    return true;
  });

  const getTemplateForStatus = (status) => {
    const template = emailTemplates[status] || 'Thank you for your interest.';
    return language === 'es' ? `Traducción simulada: ${template}` : template;
  };

  const saveTemplate = () => {
    setEmailTemplates({ ...emailTemplates, [editingTemplateType]: editingTemplate });
    setShowTemplateEditor(false);
  };

  const undoLastNotification = () => {
    if (notificationHistory.length === 0) return;
    const lastNotification = notificationHistory[0];
    setNotificationHistory(notificationHistory.slice(1));
    alert(`Undid notification to ${lastNotification.candidateName}`);
  };

  const updatePriority = (id, priority) => {
    setCandidates(candidates.map(candidate => 
      candidate.id === id ? { ...candidate, priority } : candidate
    ));
  };

  const getAnalytics = () => {
    const statusCount = candidates.reduce((acc, c) => {
      acc[c.status] = (acc[c.status] || 0) + 1;
      return acc;
    }, {});
    const priorityCount = candidates.reduce((acc, c) => {
      acc[c.priority] = (acc[c.priority] || 0) + 1;
      return acc;
    }, {});
    return { statusCount, priorityCount, totalNotifications: notificationHistory.length };
  };

  const toggleCandidateSelection = (id) => {
    setSelectedCandidates(prev => 
      prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]
    );
  };

  const selectAllCandidates = (e) => {
    if (e.target.checked) {
      setSelectedCandidates(filteredCandidates.map(c => c.id));
    } else {
      setSelectedCandidates([]);
    }
  };

  return (
    <div className={`min-h-screen w-full ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} font-sans m-0 p-0`}>
      <main className="w-full">
        {/* Controls - Single Line */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-md mb-10 flex flex-wrap items-center gap-4 p-6 w-full`}>
          <input
            type="text"
            placeholder="Search by name, position, email, or notes..."
            className="p-3 border rounded-lg w-full sm:w-72 bg-gray-100 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select 
            className="p-3 border rounded-lg bg-gray-100 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Candidates</option>
            <option value="pending">Pending</option>
            <option value="selected">Selected</option>
            <option value="rejected">Rejected</option>
            <option value="onHold">On Hold</option>
          </select>
          <button 
            onClick={() => setShowTemplateEditor(true)} 
            className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition duration-200"
          >
            Manage Templates
          </button>
          <button 
            onClick={() => setShowAnalytics(true)} 
            className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
          >
            Analytics
          </button>
        </div>

        {/* Candidates Table */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-md overflow-x-auto mb-10 w-full`}>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                  <input 
                    type="checkbox" 
                    onChange={selectAllCandidates}
                    checked={filteredCandidates.length > 0 && selectedCandidates.length === filteredCandidates.length}
                    className="form-checkbox h-4 w-4 text-indigo-600"
                  />
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Name</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Position</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Interview Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Priority</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className={`${darkMode ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'}`}>
              {loading ? (
                <tr><td colSpan="7" className="px-6 py-4 text-center text-gray-500">Loading candidates...</td></tr>
              ) : filteredCandidates.length === 0 ? (
                <tr><td colSpan="7" className="px-6 py-4 text-center text-gray-500">No candidates found</td></tr>
              ) : (
                filteredCandidates.map(candidate => (
                  <tr 
                    key={candidate.id}
                    className={`${selectedCandidates.includes(candidate.id) ? (darkMode ? 'bg-gray-700' : 'bg-indigo-50') : ''} hover:${darkMode ? 'bg-gray-700' : 'bg-gray-50'} transition duration-150`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input 
                        type="checkbox" 
                        checked={selectedCandidates.includes(candidate.id)}
                        onChange={() => toggleCandidateSelection(candidate.id)}
                        className="form-checkbox h-4 w-4 text-indigo-600"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-800 dark:text-gray-200">{candidate.name}</div>
                      <div className="text-sm text-gray-500">{candidate.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{candidate.position}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{new Date(candidate.interviewDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        candidate.status === 'selected' ? 'bg-green-100 text-green-800' :
                        candidate.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        candidate.status === 'onHold' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {candidate.status.charAt(0).toUpperCase() + candidate.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={candidate.priority}
                        onChange={(e) => updatePriority(candidate.id, e.target.value)}
                        className="border rounded-lg text-sm p-1 bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                      >
                        <option value="high">High</option>
                        <option value="normal">Normal</option>
                        <option value="low">Low</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex space-x-3">
                      <button 
                        onClick={() => {
                          setSelectedCandidate(candidate);
                          setCustomMessage(getTemplateForStatus(candidate.status).replace('[Name]', candidate.name).replace('[Position]', candidate.position));
                        }}
                        className="text-indigo-600 hover:text-indigo-800 transition duration-200"
                      >
                        Notify
                      </button>
                      <select 
                        value={candidate.status}
                        onChange={(e) => updateCandidateStatus(candidate.id, e.target.value)}
                        className="border rounded-lg text-sm p-1 bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                      >
                        <option value="pending">Pending</option>
                        <option value="selected">Selected</option>
                        <option value="rejected">Rejected</option>
                        <option value="onHold">On Hold</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Notification History */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-md mb-10 w-full`}>
          <div className="px-6 py-4 border-b flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Recent Notifications</h2>
            {notificationHistory.length > 0 && (
              <button 
                onClick={undoLastNotification} 
                className="text-red-600 hover:text-red-800 text-sm font-medium transition duration-200"
              >
                Undo Last
              </button>
            )}
          </div>
          <div className="p-6 max-h-72 overflow-y-auto">
            {notificationHistory.length === 0 ? (
              <p className="text-center text-gray-500">No notifications sent yet</p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {notificationHistory.map(notification => (
                  <li key={notification.id} className="py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">To: {notification.candidateName}</p>
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          notification.status === 'selected' ? 'bg-green-100 text-green-800' :
                          notification.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          notification.status === 'onHold' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {notification.status.charAt(0).toUpperCase() + notification.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">{new Date(notification.timestamp).toLocaleString()}</p>
                    </div>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{notification.message}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>

      {/* Notification Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center w-full p-4">
          <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} rounded-xl shadow-2xl w-full max-w-2xl`}>
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Send Notification to {selectedCandidate.name}</h2>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>Email:</strong> {selectedCandidate.email}<br />
                  <strong>Position:</strong> {selectedCandidate.position}<br />
                  <strong>Status:</strong> {selectedCandidate.status.charAt(0).toUpperCase() + selectedCandidate.status.slice(1)}<br />
                  <strong>Notes:</strong> {selectedCandidate.notes}
                </p>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Message</label>
                <textarea
                  className="w-full p-3 border rounded-lg bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder={`Personalize your message here (e.g., "Great job on [specific skill], [Name]!")`}
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button 
                  onClick={() => setShowPreview(true)} 
                  className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
                >
                  Preview
                </button>
                <button 
                  onClick={() => setSelectedCandidate(null)} 
                  className="bg-gray-200 text-gray-800 px-5 py-2 rounded-lg hover:bg-gray-300 transition duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    sendNotification(selectedCandidate, customMessage);
                    setSelectedCandidate(null);
                  }}
                  className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition duration-200"
                >
                  Send Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && selectedCandidate && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center w-full p-4">
          <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} rounded-xl shadow-2xl w-full max-w-2xl`}>
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Email Preview</h2>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4"><strong>To:</strong> {selectedCandidate.email}</p>
              <div className="border p-4 rounded-lg bg-gray-50 text-gray-800 dark:bg-gray-700 dark:text-gray-200">{customMessage}</div>
              <div className="flex justify-end mt-4">
                <button 
                  onClick={() => setShowPreview(false)} 
                  className="bg-gray-200 text-gray-800 px-5 py-2 rounded-lg hover:bg-gray-300 transition duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Template Editor Modal */}
      {showTemplateEditor && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center w-full p-4">
          <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} rounded-xl shadow-2xl w-full max-w-2xl`}>
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Manage Email Templates</h2>
            </div>
            <div className="p-6">
              {editingTemplateType ? (
                <div>
                  <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-3">
                    {editingTemplateType.charAt(0).toUpperCase() + editingTemplateType.slice(1)} Template
                  </h3>
                  <textarea
                    className="w-full p-3 border rounded-lg bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 min-h-32 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                    value={editingTemplate}
                    onChange={(e) => setEditingTemplate(e.target.value)}
                  />
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => {
                        setEditingTemplateType('');
                        setEditingTemplate('');
                      }}
                      className="bg-gray-200 text-gray-800 px-5 py-2 rounded-lg hover:bg-gray-300 transition duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveTemplate}
                      className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition duration-200"
                    >
                      Save Template
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  {['selected', 'rejected', 'onHold'].map(type => (
                    <div key={type} className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
                      <h3 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-2">
                        {type.charAt(0).toUpperCase() + type.slice(1)} Candidates Template
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{emailTemplates[type]}</p>
                      <button
                        onClick={() => {
                          setEditingTemplateType(type);
                          setEditingTemplate(emailTemplates[type]);
                        }}
                        className="text-indigo-600 hover:text-indigo-800 text-sm font-medium transition duration-200"
                      >
                        Edit Template
                      </button>
                    </div>
                  ))}
                  <div className="flex justify-end">
                    <button
                      onClick={() => setShowTemplateEditor(false)}
                      className="bg-gray-200 text-gray-800 px-5 py-2 rounded-lg hover:bg-gray-300 transition duration-200"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Analytics Dashboard */}
      {showAnalytics && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center w-full p-4">
          <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} rounded-xl shadow-2xl w-full max-w-2xl`}>
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Analytics Dashboard</h2>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-md font-medium text-gray-800 dark:text-gray-200">Candidate Status Breakdown</h3>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    {Object.entries(getAnalytics().statusCount).map(([status, count]) => (
                      <li key={status}>{status.charAt(0).toUpperCase() + status.slice(1)}: {count}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-md font-medium text-gray-800 dark:text-gray-200">Priority Breakdown</h3>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    {Object.entries(getAnalytics().priorityCount).map(([priority, count]) => (
                      <li key={priority}>{priority.charAt(0).toUpperCase() + priority.slice(1)}: {count}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-md font-medium text-gray-800 dark:text-gray-200">Notification Metrics</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Total Sent: {getAnalytics().totalNotifications}</p>
                </div>
              </div>
              <div className="flex justify-end mt-6">
                <button 
                  onClick={() => setShowAnalytics(false)} 
                  className="bg-gray-200 text-gray-800 px-5 py-2 rounded-lg hover:bg-gray-300 transition duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidateCommunication;