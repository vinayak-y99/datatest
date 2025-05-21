
"use client";
import React, { useState, useEffect } from 'react';
import { Eye, CheckCircle, Bell, TrendingUp, Filter, Download, RefreshCw, AlertTriangle } from 'lucide-react';

const EvaluationSection = () => {
  const [selectedRole, setSelectedRole] = useState('Software Developer');
  const [selectedJobDescription, setSelectedJobDescription] = useState('JD001');
  const [showThresholdAlerts, setShowThresholdAlerts] = useState(false);
  const [showHistoricalTrends, setShowHistoricalTrends] = useState(false);
  const [filterView, setFilterView] = useState('all');
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [analytics, setAnalytics] = useState({
    averageScore: 82,
    highestScore: 92,
    lowestScore: 72,
    totalCandidates: 15,
    passedThreshold: 8
  });

  const thresholds = {
    totalScore: 75,
    technicalSkills: 70,
    softSkills: 65
  };

  const [candidates, setCandidates] = useState([
    {
      id: 1,
      name: 'Alex Johnson',
      role: 'Software Developer',
      technicalSkills: 85,
      softSkills: 75,
      experience: 90,
      totalScore: 84,
      matchPercentage: 88,
      thresholdStatus: 'above',
      lastActivity: '2 hours ago',
      strengths: ['JavaScript', 'React', 'System Design'],
      improvements: ['Cloud Architecture'],
      status: 'Shortlisted',
      interviewFeedback: [
        { round: 'Technical', score: 85, notes: 'Strong problem-solving skills' },
        { round: 'Cultural Fit', score: 82, notes: 'Good team player' }
      ]
    },
    {
      id: 2,
      name: 'Sarah Miller',
      role: 'Software Developer',
      technicalSkills: 78,
      softSkills: 82,
      experience: 75,
      totalScore: 78,
      matchPercentage: 82,
      thresholdStatus: 'above',
      lastActivity: '5 hours ago',
      strengths: ['Python', 'Data Analysis', 'API Design'],
      improvements: ['Frontend Technologies'],
      status: 'In Review',
      interviewFeedback: [
        { round: 'Technical', score: 79, notes: 'Good technical foundation' },
        { round: 'Cultural Fit', score: 85, notes: 'Excellent communication' }
      ]
    },
    {
      id: 3,
      name: 'Michael Chen',
      role: 'Software Developer',
      technicalSkills: 92,
      softSkills: 68,
      experience: 85,
      totalScore: 83,
      matchPercentage: 86,
      thresholdStatus: 'above',
      lastActivity: '1 day ago',
      strengths: ['Algorithms', 'System Architecture', 'Java'],
      improvements: ['Team Collaboration', 'Communication'],
      status: 'Shortlisted',
      interviewFeedback: [
        { round: 'Technical', score: 90, notes: 'Excellent technical skills' },
        { round: 'Cultural Fit', score: 75, notes: 'Needs improvement in communication' }
      ]
    },
    {
      id: 4,
      name: 'Jessica Taylor',
      role: 'Software Developer',
      technicalSkills: 65,
      softSkills: 80,
      experience: 70,
      totalScore: 70,
      matchPercentage: 74,
      thresholdStatus: 'below',
      lastActivity: '3 days ago',
      strengths: ['UI Design', 'CSS', 'User Experience'],
      improvements: ['Backend Technologies', 'Data Structures'],
      status: 'In Review',
      interviewFeedback: [
        { round: 'Technical', score: 68, notes: 'Needs technical improvement' },
        { round: 'Cultural Fit', score: 84, notes: 'Great cultural fit' }
      ]
    },
    {
      id: 5,
      name: 'David Wilson',
      role: 'Software Developer',
      technicalSkills: 75,
      softSkills: 72,
      experience: 80,
      totalScore: 75,
      matchPercentage: 79,
      thresholdStatus: 'near',
      lastActivity: '4 hours ago',
      strengths: ['DevOps', 'Cloud Computing', 'Microservices'],
      improvements: ['UX Principles', 'Mobile Development'],
      status: 'In Review',
      interviewFeedback: [
        { round: 'Technical', score: 76, notes: 'Solid technical background' },
        { round: 'Cultural Fit', score: 73, notes: 'Good team fit' }
      ]
    }
  ]);

  const [historicalTrends] = useState({
    monthlyTrends: [
      { month: 'Jan', hired: 5, avgScore: 85, timeToHire: 20 },
      { month: 'Feb', hired: 3, avgScore: 82, timeToHire: 25 },
      { month: 'Mar', hired: 4, avgScore: 88, timeToHire: 18 },
      { month: 'Apr', hired: 6, avgScore: 86, timeToHire: 22 },
      { month: 'May', hired: 4, avgScore: 84, timeToHire: 21 },
      { month: 'Jun', hired: 5, avgScore: 87, timeToHire: 19 }
    ],
    successMetrics: {
      retentionRate: 85,
      performanceScore: 78,
      satisfactionRate: 92
    }
  });

  useEffect(() => {
    // Initial analytics calculation
    updateAnalytics(candidates);
    
    const interval = setInterval(() => {
      const updatedCandidates = candidates.map(candidate => {
        const randomChange = Math.random() * 4 - 2;
        const newTechnicalSkills = Math.max(60, Math.min(95, candidate.technicalSkills + randomChange));
        const newTotalScore = calculateTotalScore(newTechnicalSkills, candidate.softSkills, candidate.experience);
        
        return {
          ...candidate,
          technicalSkills: newTechnicalSkills,
          totalScore: newTotalScore,
          thresholdStatus: determineThresholdStatus(newTotalScore),
          lastActivity: 'just now'
        };
      });

      setCandidates(updatedCandidates);
      updateAnalytics(updatedCandidates);
      setLastUpdated(new Date());
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const calculateTotalScore = (technical, soft, exp) => {
    return Math.round((technical * 0.5) + (soft * 0.3) + (exp * 0.2));
  };

  const determineThresholdStatus = (score) => {
    if (score >= thresholds.totalScore + 5) return 'above';
    if (score >= thresholds.totalScore) return 'near';
    return 'below';
  };

  const updateAnalytics = (updatedCandidates) => {
    const scores = updatedCandidates.map(c => c.totalScore);
    setAnalytics({
      averageScore: Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10,
      highestScore: Math.max(...scores),
      lowestScore: Math.min(...scores),
      totalCandidates: updatedCandidates.length,
      passedThreshold: updatedCandidates.filter(c => c.totalScore >= thresholds.totalScore).length
    });
  };

  const filteredCandidates = () => {
    if (filterView === 'all') return candidates;
    return candidates.filter(c => c.thresholdStatus === filterView);
  };

  const exportReport = () => {
    const report = {
      candidates: filteredCandidates(),
      analytics: analytics,
      historicalTrends: historicalTrends,
      generatedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `candidate-evaluation-report-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <h3 className="text-3xl font-bold text-purple-900">Candidate Evaluations</h3>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-500">Last updated: {lastUpdated.toLocaleTimeString()}</span>
          </div>
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            <option>Software Developer</option>
            <option>Product Manager</option>
            <option>UX Designer</option>
          </select>
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg"
            value={selectedJobDescription}
            onChange={(e) => setSelectedJobDescription(e.target.value)}
          >
            <option value="JD001">JD001 - Full Stack Developer</option>
            <option value="JD002">JD002 - Backend Engineer</option>
            <option value="JD003">JD003 - Frontend Developer</option>
          </select>
        </div>
      </div>

      {/* Analytics Dashboard */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h4 className="text-lg font-medium text-gray-700">Average Score</h4>
          <p className="text-2xl font-bold text-blue-600">{analytics.averageScore.toFixed(1)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h4 className="text-lg font-medium text-gray-700">Passed Threshold</h4>
          <p className="text-2xl font-bold text-green-600">{analytics.passedThreshold}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h4 className="text-lg font-medium text-gray-700">Total Candidates</h4>
          <p className="text-2xl font-bold text-purple-600">{analytics.totalCandidates}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h4 className="text-lg font-medium text-gray-700">Success Rate</h4>
          <p className="text-2xl font-bold text-indigo-600">
            {((analytics.passedThreshold / analytics.totalCandidates) * 100).toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Controls Section */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowThresholdAlerts(!showThresholdAlerts)}
            className={`flex items-center px-3 py-2 rounded-lg ${
              showThresholdAlerts ? 'bg-yellow-100 text-yellow-800' : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Bell className="h-4 w-4 mr-2" />
            Threshold Alerts
          </button>
          <button
            onClick={() => setShowHistoricalTrends(!showHistoricalTrends)}
            className={`flex items-center px-3 py-2 rounded-lg ${
              showHistoricalTrends ? 'bg-blue-100 text-blue-800' : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Historical Trends
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <select
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            value={filterView}
            onChange={(e) => setFilterView(e.target.value)}
          >
            <option value="all">All Candidates</option>
            <option value="above">Above Threshold</option>
            <option value="near">Near Threshold</option>
            <option value="below">Below Threshold</option>
          </select>
          <button 
            onClick={exportReport}
            className="flex items-center px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 text-sm"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Threshold Alerts */}
      {showThresholdAlerts && (
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-yellow-400">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-medium text-gray-900 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-yellow-500" />
              Threshold Alerts
            </h4>
            <button 
              onClick={() => setShowThresholdAlerts(false)}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Dismiss
            </button>
          </div>
          <div className="space-y-2">
            {candidates
              .filter(c => c.thresholdStatus === 'below')
              .map(candidate => (
                <div key={candidate.id} className="p-3 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <span className="font-medium">{candidate.name}</span> is below threshold with score {candidate.totalScore}
                  </p>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Historical Trends */}
      {showHistoricalTrends && (
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h4 className="text-xl font-medium text-gray-900 mb-4">Historical Performance</h4>
          <div className="grid grid-cols-3 gap-4">
            {historicalTrends.monthlyTrends.map((trend, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <h5 className="font-medium text-gray-700">{trend.month}</h5>
                <p className="text-2xl font-bold text-purple-600">{trend.hired}</p>
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-gray-600">Avg Score: {trend.avgScore}</p>
                  <p className="text-sm text-gray-600">Time to Hire: {trend.timeToHire} days</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <h5 className="font-medium text-green-800">Retention Rate</h5>
              <p className="text-2xl font-bold text-green-600">
                {historicalTrends.successMetrics.retentionRate}%
              </p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <h5 className="font-medium text-blue-800">Performance Score</h5>
              <p className="text-2xl font-bold text-blue-600">
                {historicalTrends.successMetrics.performanceScore}%
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h5 className="font-medium text-purple-800">Satisfaction Rate</h5>
              <p className="text-2xl font-bold text-purple-600">
                {historicalTrends.successMetrics.satisfactionRate}%
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Candidate Comparison Table */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          <h4 className="font-medium">Candidate Comparison</h4>
          <div className="text-sm text-gray-500">
            <span className="font-medium">Set Threshold:</span> ≥ {thresholds.totalScore} Total Score
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Candidate</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Total Score</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Match %</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Key Strengths</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Areas for Improvement</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Last Activity</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCandidates().map((candidate) => (
                <tr key={candidate.id} className={`hover:bg-gray-50 ${
                  candidate.thresholdStatus === 'below' ? 'bg-red-50' : ''
                }`}>
                  <td className="px-4 py-4">
                    <div className="font-medium text-gray-800">{candidate.name}</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center">
                      <span className={`text-lg font-medium ${
                        candidate.thresholdStatus === 'above' ? 'text-green-600' : 
                        candidate.thresholdStatus === 'near' ? 'text-yellow-600' : 
                        'text-red-600'
                      }`}>{candidate.totalScore}</span>
                      <span className="text-sm text-gray-500 ml-1">/100</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className={`${
                            candidate.matchPercentage >= 90 ? 'bg-green-600' :
                            candidate.matchPercentage >= 80 ? 'bg-blue-600' :
                            'bg-yellow-600'
                          } rounded-full h-2`}
                          style={{ width: `${candidate.matchPercentage}%` }}
                        />
                      </div>
                      <span>{candidate.matchPercentage}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-1">
                      {candidate.strengths.map((strength, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs"
                        >
                          {strength}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-1">
                      {candidate.improvements.map((improvement, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs"
                        >
                          {improvement}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      candidate.status === 'Selected'
                        ? 'bg-green-100 text-green-700'
                        : candidate.status === 'Shortlisted'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {candidate.status}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`text-sm ${
                      candidate.lastActivity === 'just now' ? 'text-green-600 font-medium' : 'text-gray-500'
                    }`}>
                      {candidate.lastActivity}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex space-x-2">
                      <button className="p-2 hover:bg-blue-100 rounded-lg text-blue-600" title="View Details">
                        <Eye className="w-5 h-5" />
                      </button>
                      <button className="p-2 hover:bg-green-100 rounded-lg text-green-600" title="Approve Candidate">
                        <CheckCircle className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EvaluationSection;