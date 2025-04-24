



import React, { useState, useEffect } from 'react';
import { FileText, MessageSquare, RefreshCw, Share2, Send, User, Clock } from 'lucide-react';
import Tab from './Tab';

const CollaborationSection = () => {
  const [activeTab, setActiveTab] = useState('reports');
  
  // Enhanced reports with more data
  const [reports, setReports] = useState([
    { 
      id: 1, 
      title: 'Technical Assessment Report', 
      sharedWith: ['Technical Panel', 'Hiring Manager'],
      content: 'Candidate demonstrated strong problem-solving skills and excellent knowledge of React fundamentals.',
      date: '2024-02-05',
      author: 'Jane Smith',
      status: 'shared'
    },
    { 
      id: 2, 
      title: 'Interview Evaluation Summary', 
      sharedWith: ['Hiring Manager'],
      content: 'Excellent cultural fit, strong communication skills, but needs improvement in system design.',
      date: '2024-02-05',
      author: 'John Doe',
      status: 'draft'
    }
  ]);

  // Enhanced discussions with real-time functionality
  const [discussions, setDiscussions] = useState([
    { 
      id: 1, 
      topic: 'Decision pending on technical assessment', 
      participants: ['John Doe', 'Jane Smith'], 
      messages: [
        { sender: 'John Doe', content: 'What did you think about the candidate\'s problem-solving approach?', timestamp: '2024-02-05T10:30:00' },
        { sender: 'Jane Smith', content: 'I was impressed with their systematic approach. They broke down the problem well.', timestamp: '2024-02-05T10:35:00' }
      ],
      lastActivity: '2024-02-05T10:35:00'
    },
    { 
      id: 2, 
      topic: 'Additional interview round required', 
      participants: ['Hiring Manager', 'Technical Lead'], 
      messages: [
        { sender: 'Hiring Manager', content: 'Do we need another technical round?', timestamp: '2024-02-05T14:20:00' },
        { sender: 'Technical Lead', content: 'Yes, I recommend focusing on system design this time.', timestamp: '2024-02-05T14:25:00' }
      ],
      lastActivity: '2024-02-05T14:25:00'
    }
  ]);

  // State for new discussion and message
  const [newDiscussion, setNewDiscussion] = useState('');
  const [activeDiscussionId, setActiveDiscussionId] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  
  // Feedback state with history
  const [feedback, setFeedback] = useState('');
  const [feedbackHistory, setFeedbackHistory] = useState([
    { 
      id: 1, 
      content: 'Can we get more details on the coding assessment results?', 
      from: 'Hiring Manager',
      to: 'Technical Panel',
      date: '2024-02-04T15:30:00',
      status: 'pending'
    },
    { 
      id: 2, 
      content: 'The candidates background check is complete. All clear to proceed.', 
      from: 'HR',
      to: 'Hiring Manager',
      date: '2024-02-03T11:15:00',
      status: 'resolved'
    }
  ]);

  // Share dialog state
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [sharePermission, setSharePermission] = useState('view');
  const [shareMessage, setShareMessage] = useState('');
  
  // Mock real-time updates with useEffect
  useEffect(() => {
    const intervalId = setInterval(() => {
      // Simulate receiving new messages in active discussion
      if (activeDiscussionId) {
        const randomMessages = [
          'I think the candidate would be a great fit for our team.',
          'Should we schedule another interview?',
          'The technical skills are impressive, but Im concerned about cultural fit.',
          'Lets move forward with the offer.',
        ];
        
        if (Math.random() > 0.7) { // 30% chance of new message
          const randomSenders = ['John Doe', 'Jane Smith', 'Hiring Manager', 'Technical Lead'];
          const newRandomMessage = {
            sender: randomSenders[Math.floor(Math.random() * randomSenders.length)],
            content: randomMessages[Math.floor(Math.random() * randomMessages.length)],
            timestamp: new Date().toISOString()
          };
          
          setDiscussions(prev => prev.map(disc => 
            disc.id === activeDiscussionId 
              ? { ...disc, messages: [...disc.messages, newRandomMessage], lastActivity: new Date().toISOString() } 
              : disc
          ));
        }
      }
    }, 15000); // Check every 15 seconds
    
    return () => clearInterval(intervalId);
  }, [activeDiscussionId]);

  // Handle opening the share dialog
  const handleShare = (reportId) => {
    setSelectedReportId(reportId);
    setIsShareDialogOpen(true);
  };

  // Handle submitting the share form
  const handleShareSubmit = () => {
    if (shareEmail && selectedReportId) {
      // Find the report
      const report = reports.find(r => r.id === selectedReportId);
      
      // Create new reports array with updated sharedWith
      const updatedReports = reports.map(r => 
        r.id === selectedReportId 
          ? { ...r, sharedWith: [...r.sharedWith, shareEmail], status: 'shared' } 
          : r
      );
      
      // Update reports
      setReports(updatedReports);
      
      // Close dialog and reset state
      setIsShareDialogOpen(false);
      setShareEmail('');
      setSharePermission('view');
      setShareMessage('');
      setSelectedReportId(null);
      
      // Show notification (you'd implement this)
      console.log(`Shared report "${report.title}" with ${shareEmail} (${sharePermission} permission)`);
    }
  };

  // Handle posting a new discussion
  const handlePostDiscussion = () => {
    if (newDiscussion.trim()) {
      const newDiscussionObj = {
        id: discussions.length + 1,
        topic: newDiscussion,
        participants: ['You'], // Current user
        messages: [],
        lastActivity: new Date().toISOString()
      };
      setDiscussions([newDiscussionObj, ...discussions]);
      setNewDiscussion('');
    }
  };

  // Handle sending a message in a discussion
  const handleSendMessage = () => {
    if (newMessage.trim() && activeDiscussionId) {
      const message = {
        sender: 'You', // Current user
        content: newMessage,
        timestamp: new Date().toISOString()
      };
      
      setDiscussions(prev => prev.map(disc => 
        disc.id === activeDiscussionId 
          ? { 
              ...disc, 
              messages: [...disc.messages, message],
              lastActivity: new Date().toISOString()
            } 
          : disc
      ));
      
      setNewMessage('');
    }
  };

  // Handle sending feedback
  const handleSendFeedback = () => {
    if (feedback.trim()) {
      const newFeedbackItem = {
        id: feedbackHistory.length + 1,
        content: feedback,
        from: 'You', // Current user
        to: 'All Collaborators',
        date: new Date().toISOString(),
        status: 'pending'
      };
      
      setFeedbackHistory([newFeedbackItem, ...feedbackHistory]);
      setFeedback('');
    }
  };

  // Format timestamp for display
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-3xl font-bold text-orange-900">Collaboration & Communication</h3>
        <div className="flex gap-2">
          <button 
            className="px-4 py-2 bg-orange-100 text-orange-800 rounded-md hover:bg-orange-200 flex items-center gap-2"
            onClick={() => console.log('Refreshing data...')}
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b">
          <nav className="flex gap-4 px-6 pt-4">
            {['reports', 'discussions', 'feedback'].map(tab => (
              <Tab
                key={tab}
                active={activeTab === tab}
                onClick={() => {
                  setActiveTab(tab);
                  setActiveDiscussionId(null); // Reset active discussion when switching tabs
                }}
                label={tab}
              />
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* REPORTS TAB */}
          {activeTab === 'reports' && (
            <div className="space-y-4">
              {reports.map(report => (
                <div key={report.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{report.title}</h4>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        report.status === 'shared' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {report.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mt-1">{report.content.substring(0, 100)}...</p>
                    <div className="flex mt-2 text-xs text-gray-500 gap-2">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" /> By {report.author}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {report.date}
                      </span>
                      <span>
                        Shared with: {report.sharedWith.join(', ')}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleShare(report.id)}
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md flex items-center gap-2"
                    >
                      <Share2 className="w-4 h-4" /> Share
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* DISCUSSIONS TAB */}
          {activeTab === 'discussions' && !activeDiscussionId && (
            <div className="space-y-4">
              <div className="flex gap-4 items-start">
                <input
                  type="text"
                  value={newDiscussion}
                  onChange={(e) => setNewDiscussion(e.target.value)}
                  placeholder="Start a new discussion..."
                  className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handlePostDiscussion}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Post
                </button>
              </div>
              
              {discussions.map(discussion => (
                <div 
                  key={discussion.id} 
                  className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => setActiveDiscussionId(discussion.id)}
                >
                  <h4 className="font-medium">{discussion.topic}</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    {discussion.participants.length} participants | 
                    Last activity: {formatTime(discussion.lastActivity)}
                  </p>
                  <p className="text-sm mt-2 text-gray-700">
                    {discussion.messages.length > 0 
                      ? `${discussion.messages[discussion.messages.length - 1].sender}: ${
                          discussion.messages[discussion.messages.length - 1].content.substring(0, 60)
                        }${discussion.messages[discussion.messages.length - 1].content.length > 60 ? '...' : ''}`
                      : 'No messages yet'}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* ACTIVE DISCUSSION */}
          {activeTab === 'discussions' && activeDiscussionId && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">
                  {discussions.find(d => d.id === activeDiscussionId)?.topic}
                </h3>
                <button
                  onClick={() => setActiveDiscussionId(null)}
                  className="text-blue-500 hover:text-blue-700"
                >
                  Back to all discussions
                </button>
              </div>
              
              <div className="border rounded-lg overflow-hidden">
                <div className="h-64 overflow-y-auto p-4 space-y-3 bg-gray-50">
                  {discussions.find(d => d.id === activeDiscussionId)?.messages.map((message, idx) => (
                    <div key={idx} className={`flex flex-col ${message.sender === 'You' ? 'items-end' : 'items-start'}`}>
                      <div className={`max-w-3/4 p-3 rounded-lg ${
                        message.sender === 'You' ? 'bg-blue-100 text-blue-900' : 'bg-white border'
                      }`}>
                        <p className="text-sm">{message.content}</p>
                      </div>
                      <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                        <span>{message.sender}</span>
                        <span>•</span>
                        <span>{formatTime(message.timestamp)}</span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="p-4 border-t bg-white">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <button
                      onClick={handleSendMessage}
                      className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* FEEDBACK TAB */}
          {activeTab === 'feedback' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Provide feedback or request additional information..."
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                />
                <div className="flex justify-end">
                  <button
                    onClick={handleSendFeedback}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Send Feedback
                  </button>
                </div>
              </div>
              
              <div className="mt-6">
                <h4 className="font-medium mb-3">Feedback History</h4>
                {feedbackHistory.map(item => (
                  <div key={item.id} className="p-4 border rounded-lg mb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-gray-800">{item.content}</p>
                        <div className="mt-2 text-xs text-gray-500 flex gap-3">
                          <span>From: {item.from}</span>
                          <span>To: {item.to}</span>
                          <span>Date: {new Date(item.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        item.status === 'resolved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                    {item.status === 'pending' && (
                      <div className="mt-3 flex justify-end">
                        <button
                          onClick={() => setFeedbackHistory(prev => 
                            prev.map(f => f.id === item.id ? {...f, status: 'resolved'} : f)
                          )}
                          className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded-md hover:bg-green-200"
                        >
                          Mark as Resolved
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SHARE DIALOG */}
      {isShareDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Share Report</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={shareEmail}
                  onChange={(e) => setShareEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Permission
                </label>
                <select
                  value={sharePermission}
                  onChange={(e) => setSharePermission(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="view">View only</option>
                  <option value="comment">Can comment</option>
                  <option value="edit">Can edit</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message (optional)
                </label>
                <textarea
                  value={shareMessage}
                  onChange={(e) => setShareMessage(e.target.value)}
                  placeholder="Add a message..."
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
                />
              </div>
              
              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={() => setIsShareDialogOpen(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Cancel
                </button>
                <button
                  onClick={handleShareSubmit}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollaborationSection;