


import React, { useState } from 'react';
import { 
  Plus, CheckCircle, Clock, AlertTriangle, 
  ChevronDown, Users, X,  FileText, 
} from 'lucide-react';

const InterviewTrackingSection = () => {
    const stages = ['Initial Screening', 'Technical Interview', 'Cultural Interview', 'Final Decision'];
    
    const [interviews, setInterviews] = useState([
      {
        id: 1,
        candidate: "Sarah Chen",
        position: "Senior Software Engineer",
        date: "2024-02-04",
        time: "10:00 AM",
        status: "Completed",
        interviewer: "John Smith",
        currentStage: 3,
        feedback: {
          technicalSkills: 9,
          communication: 8,
          problemSolving: 9,
          culturalFit: 8,
          comments: "Excellent technical skills and problem-solving abilities. Great culture fit.",
          questions: [
            { question: "Explain system design for a social media platform", rating: 9, answer: "Sarah provided a comprehensive architecture including load balancers, caching strategies, and database sharding for scalability." },
            { question: "Describe a challenging project you led", rating: 8, answer: "She described leading a distributed team to implement a real-time analytics dashboard, overcoming technical debt and communication challenges." }
          ]
        }
      },
      {
        id: 2,
        candidate: "Michael Brown",
        position: "Product Manager",
        date: "2024-02-05",
        time: "2:00 PM",
        status: "Pending",
        interviewer: "Emma Davis",
        currentStage: 1,
        feedback: null
      },
      {
        id: 3,
        candidate: "Lisa Wang",
        position: "UX Designer",
        date: "2024-02-03",
        time: "11:30 AM",
        status: "Rescheduled",
        interviewer: "Alex Johnson",
        currentStage: 0,
        feedback: null
      }
    ]);
  
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedInterview, setSelectedInterview] = useState(null);
    const [showFeedbackForm, setShowFeedbackForm] = useState(false);
    const [dateFilter, setDateFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [activeTab, setActiveTab] = useState('upcoming');
    
    const [newInterview, setNewInterview] = useState({
      candidate: '',
      position: '',
      date: '',
      time: '',
      interviewer: '',
      status: 'Pending',
      currentStage: 0
    });
    
    const [newFeedback, setNewFeedback] = useState({
      technicalSkills: 5,
      communication: 5,
      problemSolving: 5,
      culturalFit: 5,
      comments: '',
      questions: [
        { question: '', rating: 5, answer: '' }
      ]
    });
  
    const handleScheduleInterview = (e) => {
      e.preventDefault();
      const interview = {
        id: interviews.length + 1,
        ...newInterview,
        feedback: null
      };
     
      setInterviews([...interviews, interview]);
      setNewInterview({
        candidate: '',
        position: '',
        date: '',
        time: '',
        interviewer: '',
        status: 'Pending',
        currentStage: 0
      });
      setIsModalOpen(false);
    };
  
    const handleStatusChange = (interviewId, newStatus) => {
      setInterviews(interviews.map(interview => {
        if (interview.id === interviewId) {
          return { ...interview, status: newStatus };
        }
        return interview;
      }));
    };
    
    const handleStageChange = (interviewId, newStage) => {
      setInterviews(interviews.map(interview => {
        if (interview.id === interviewId) {
          return { ...interview, currentStage: parseInt(newStage) };
        }
        return interview;
      }));
    };
    
    const handleAddFeedback = (interviewId) => {
      setInterviews(interviews.map(interview => {
        if (interview.id === interviewId) {
          return { ...interview, feedback: newFeedback, status: 'Completed' };
        }
        return interview;
      }));
      setShowFeedbackForm(false);
      setNewFeedback({
        technicalSkills: 5,
        communication: 5,
        problemSolving: 5,
        culturalFit: 5,
        comments: '',
        questions: [
          { question: '', rating: 5, answer: '' }
        ]
      });
    };
    
    const handleAddQuestion = () => {
      setNewFeedback({
        ...newFeedback,
        questions: [...newFeedback.questions, { question: '', rating: 5, answer: '' }]
      });
    };
    
    const handleQuestionChange = (index, field, value) => {
      const updatedQuestions = [...newFeedback.questions];
      updatedQuestions[index] = {
        ...updatedQuestions[index],
        [field]: value
      };
      setNewFeedback({
        ...newFeedback,
        questions: updatedQuestions
      });
    };
  
    const getStatusColor = (status) => {
      switch (status) {
        case 'Completed':
          return 'bg-green-100 text-green-800';
        case 'Pending':
          return 'bg-blue-100 text-blue-800';
        case 'Rescheduled':
          return 'bg-yellow-100 text-yellow-800';
        case 'Cancelled':
          return 'bg-red-100 text-red-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    };
    
    const getStageColor = (stage) => {
      const colors = [
        'bg-gray-100 text-gray-800',
        'bg-blue-100 text-blue-800',
        'bg-purple-100 text-purple-800',
        'bg-green-100 text-green-800'
      ];
      return colors[stage] || colors[0];
    };
    
    // Filter interviews by date, status, and tab
    const filteredInterviews = interviews.filter(interview => {
      const matchesDate = dateFilter === 'all' || 
        (dateFilter === 'today' && new Date(interview.date).toDateString() === new Date().toDateString()) ||
        (dateFilter === 'week' && isInCurrentWeek(new Date(interview.date)));
      
      const matchesStatus = statusFilter === 'all' || interview.status === statusFilter;
      
      const isUpcoming = interview.status === 'Pending' || interview.status === 'Rescheduled';
      const matchesTab = 
        (activeTab === 'upcoming' && isUpcoming) ||
        (activeTab === 'completed' && interview.status === 'Completed') ||
        (activeTab === 'all');
      
      return matchesDate && matchesStatus && matchesTab;
    });
    
    function isInCurrentWeek(date) {
      const now = new Date();
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
      const endOfWeek = new Date(now.setDate(now.getDate() + 6));
      return date >= startOfWeek && date <= endOfWeek;
    }
  
    return (
      <div className="w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-green-900">Interview Tracking</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Schedule Interview
          </button>
        </div>
        
        {/* Filters and Tabs */}
        <div className="mb-6 space-y-4">
          <div className="flex gap-4 border-b border-gray-200">
            <button 
              onClick={() => setActiveTab('upcoming')}
              className={`py-2 px-4 ${activeTab === 'upcoming' ? 'border-b-2 border-blue-500 font-medium' : 'text-gray-500'}`}
            >
              Upcoming
            </button>
            <button 
              onClick={() => setActiveTab('completed')}
              className={`py-2 px-4 ${activeTab === 'completed' ? 'border-b-2 border-blue-500 font-medium' : 'text-gray-500'}`}
            >
              Completed
            </button>
            <button 
              onClick={() => setActiveTab('all')}
              className={`py-2 px-4 ${activeTab === 'all' ? 'border-b-2 border-blue-500 font-medium' : 'text-gray-500'}`}
            >
              All Interviews
            </button>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
            </select>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="all">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="Rescheduled">Rescheduled</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>
  
        {/* Interview Schedule */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="border-b border-gray-100 p-4">
            <h2 className="font-medium text-lg">Interview Schedule</h2>
          </div>
          
          {filteredInterviews.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No interviews match your current filters
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredInterviews.map((interview) => (
                <div key={interview.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-full ${getStatusColor(interview.status)}`}>
                        {interview.status === 'Completed' ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : interview.status === 'Pending' ? (
                          <Clock className="w-5 h-5" />
                        ) : (
                          <AlertTriangle className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{interview.candidate}</div>
                        <div className="text-sm text-gray-500">{interview.position}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-sm font-medium">{interview.date}</div>
                        <div className="text-sm text-gray-500">{interview.time}</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <select
                          value={interview.status}
                          onChange={(e) => handleStatusChange(interview.id, e.target.value)}
                          className={`text-sm rounded-full px-3 py-1 border-none ${getStatusColor(interview.status)}`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Completed">Completed</option>
                          <option value="Rescheduled">Rescheduled</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                        <button
                          onClick={() => setSelectedInterview(selectedInterview === interview.id ? null : interview.id)}
                          className="p-2 hover:bg-gray-100 rounded-full"
                        >
                          <ChevronDown className={`w-5 h-5 transform transition-transform ${
                            selectedInterview === interview.id ? 'rotate-180' : ''
                          }`} />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress indicator */}
                  <div className="mt-3 ml-14">
                    <div className="flex items-center mb-1">
                      <span className={`text-xs px-2 py-1 rounded-full ${getStageColor(interview.currentStage)}`}>
                        {stages[interview.currentStage]}
                      </span>
                      {interview.status !== 'Completed' && (
                        <select
                          value={interview.currentStage}
                          onChange={(e) => handleStageChange(interview.id, e.target.value)}
                          className="ml-2 text-xs border border-gray-200 rounded-md px-2 py-1"
                        >
                          {stages.map((stage, index) => (
                            <option key={index} value={index}>
                              {stage}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-blue-600 h-1.5 rounded-full"
                        style={{ width: `${(interview.currentStage / (stages.length - 1)) * 100}%` }}
                      ></div>
                    </div>
                  </div>
    
                  {/* Interview Details */}
                  {selectedInterview === interview.id && (
                    <div className="mt-4 pl-14">
                      <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                        <div className="flex items-center space-x-2 text-sm">
                          <Users className="w-4 h-4" />
                          <span className="text-gray-600">Interviewer:</span>
                          <span className="font-medium">{interview.interviewer}</span>
                        </div>
                       
                        {interview.feedback ? (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              {Object.entries(interview.feedback)
                                .filter(([key]) => typeof interview.feedback[key] === 'number')
                                .map(([criterion, score]) => (
                                  <div key={criterion} className="flex justify-between items-center">
                                    <span className="text-sm capitalize">
                                      {criterion.replace(/([A-Z])/g, ' $1')}
                                    </span>
                                    <div className="flex items-center">
                                      <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                                        <div
                                          className="bg-blue-600 h-2 rounded-full"
                                          style={{ width: `${(score / 10) * 100}%` }}
                                        ></div>
                                      </div>
                                      <span className="font-medium">{score}/10</span>
                                    </div>
                                  </div>
                                ))
                              }
                            </div>
                            <div>
                              <h4 className="text-sm font-medium mb-2">Comments</h4>
                              <p className="text-sm text-gray-600">{interview.feedback.comments}</p>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium mb-2">Questions & Responses</h4>
                              {interview.feedback.questions.map((q, i) => (
                                <div key={i} className="mb-4 bg-white p-3 rounded-lg border border-gray-100">
                                  <div className="flex justify-between items-center text-sm mb-1">
                                    <span className="font-medium">{q.question}</span>
                                    <span className="text-blue-600">{q.rating}/10</span>
                                  </div>
                                  <p className="text-sm text-gray-600">{q.answer || "No answer recorded"}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {interview.status !== 'Completed' && !showFeedbackForm ? (
                              <button
                                onClick={() => setShowFeedbackForm(true)}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
                              >
                                <FileText className="w-4 h-4 inline mr-1" />
                                Add Feedback
                              </button>
                            ) : !showFeedbackForm ? (
                              <div className="text-sm text-gray-500">
                                No feedback available yet
                              </div>
                            ) : null}
                            
                            {showFeedbackForm && (
                              <div className="bg-white p-4 border border-gray-200 rounded-lg">
                                <h3 className="text-lg font-medium mb-4">Interview Feedback</h3>
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    {['technicalSkills', 'communication', 'problemSolving', 'culturalFit'].map((criterion) => (
                                      <div key={criterion} className="space-y-1">
                                        <label className="text-sm capitalize block">
                                          {criterion.replace(/([A-Z])/g, ' $1')}
                                        </label>
                                        <div className="flex items-center">
                                          <input
                                            type="range"
                                            min="1"
                                            max="10"
                                            value={newFeedback[criterion]}
                                            onChange={(e) => setNewFeedback({
                                              ...newFeedback,
                                              [criterion]: parseInt(e.target.value)
                                            })}
                                            className="w-full"
                                          />
                                          <span className="ml-2 text-sm w-8 text-center">{newFeedback[criterion]}/10</span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                  
                                  <div>
                                    <label className="text-sm font-medium block mb-1">Comments</label>
                                    <textarea
                                      value={newFeedback.comments}
                                      onChange={(e) => setNewFeedback({...newFeedback, comments: e.target.value})}
                                      className="w-full p-2 border border-gray-300 rounded-lg"
                                      rows="3"
                                      placeholder="Enter overall feedback..."
                                    />
                                  </div>
                                  
                                  <div>
                                    <div className="flex justify-between items-center mb-2">
                                      <label className="text-sm font-medium">Questions & Responses</label>
                                      <button
                                        type="button"
                                        onClick={handleAddQuestion}
                                        className="text-blue-600 text-sm hover:underline"
                                      >
                                        + Add Question
                                      </button>
                                    </div>
                                    {newFeedback.questions.map((q, idx) => (
                                      <div key={idx} className="mb-3 p-3 bg-gray-50 rounded-lg">
                                        <div className="space-y-2">
                                          <input
                                            type="text"
                                            value={q.question}
                                            onChange={(e) => handleQuestionChange(idx, 'question', e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded-lg"
                                            placeholder="Enter question"
                                          />
                                          <div className="flex items-center">
                                            <span className="text-sm mr-2">Rating:</span>
                                            <input
                                              type="range"
                                              min="1"
                                              max="10"
                                              value={q.rating}
                                              onChange={(e) => handleQuestionChange(idx, 'rating', parseInt(e.target.value))}
                                              className="flex-grow"
                                            />
                                            <span className="ml-2 text-sm w-8 text-center">{q.rating}/10</span>
                                          </div>
                                          <textarea
                                            value={q.answer}
                                            onChange={(e) => handleQuestionChange(idx, 'answer', e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded-lg"
                                            rows="2"
                                            placeholder="Candidate's response..."
                                          />
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                  
                                  <div className="flex justify-end space-x-2 pt-2">
                                    <button
                                      type="button"
                                      onClick={() => setShowFeedbackForm(false)}
                                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleAddFeedback(interview.id)}
                                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                                    >
                                      Submit Feedback
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
  
        {/* Schedule Interview Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Schedule New Interview</h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
             
              <form onSubmit={handleScheduleInterview} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Candidate Name</label>
                  <input
                    type="text"
                    required
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={newInterview.candidate}
                    onChange={(e) => setNewInterview({...newInterview, candidate: e.target.value})}
                    placeholder="Enter candidate name"
                  />
                </div>
               
                <div>
                  <label className="block text-sm font-medium mb-1">Position</label>
                  <input
                    type="text"
                    required
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={newInterview.position}
                    onChange={(e) => setNewInterview({...newInterview, position: e.target.value})}
                    placeholder="Enter position"
                  />
                </div>
               
                <div>
                  <label className="block text-sm font-medium mb-1">Date</label>
                  <input
                    type="date"
                    required
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={newInterview.date}
                    onChange={(e) => setNewInterview({...newInterview, date: e.target.value})}
                  />
                </div>
               
                <div>
                  <label className="block text-sm font-medium mb-1">Time</label>
                  <input
                    type="time"
                    required
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={newInterview.time}
                    onChange={(e) => setNewInterview({...newInterview, time: e.target.value})}
                  />
                </div>
               
                <div>
                  <label className="block text-sm font-medium mb-1">Interviewer</label>
                  <input
                    type="text"
                    required
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={newInterview.interviewer}
                    onChange={(e) => setNewInterview({...newInterview, interviewer: e.target.value})}
                    placeholder="Enter interviewer name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Stage</label>
                  <select
                    required
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={newInterview.currentStage}
                    onChange={(e) => setNewInterview({...newInterview, currentStage: parseInt(e.target.value)})}
                  >
                    {stages.map((stage, index) => (
                      <option key={index} value={index}>
                        {stage}
                      </option>
                    ))}
                  </select>
                </div>
  
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select
                    required
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={newInterview.status}
                    onChange={(e) => setNewInterview({...newInterview, status: e.target.value})}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="Rescheduled">Rescheduled</option>
                  </select>
                </div>
               
                <div className="flex justify-end space-x-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Schedule
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  export default InterviewTrackingSection;