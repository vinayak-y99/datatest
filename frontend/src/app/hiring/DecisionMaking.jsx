import React, { useState } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  PauseCircle, 
  FileText,
  Star as StarIcon,
  MessageSquare,
  BarChart2,
  AlertCircle
} from 'lucide-react';

const DecisionMaking = () => {
  // Sample team members data
  const [teamMembers] = useState([
    { id: 1, name: 'John Doe', role: 'Technical Lead', rating: 4, interviewQuality: 'High', consistencyScore: 85 },
    { id: 2, name: 'Jane Smith', role: 'Senior Developer', rating: 5, interviewQuality: 'Very High', consistencyScore: 92 },
    { id: 3, name: 'Mike Johnson', role: 'HR Manager', rating: 4, interviewQuality: 'Medium', consistencyScore: 78 },
    { id: 4, name: 'Sarah Williams', role: 'Project Manager', rating: 3, interviewQuality: 'High', consistencyScore: 83 }
  ]);

  // State for feedback dialogs
  const [feedbackStates, setFeedbackStates] = useState(
    teamMembers.reduce((acc, member) => {
      acc[member.id] = { isOpen: false, feedback: '' };
      return acc;
    }, {})
  );

  const handleCandidateDecision = (decision) => {
    console.log(`Candidate ${decision}`);
  };

  const handleEvaluatorRating = (memberId, value) => {
    console.log(`Rating updated for member ${memberId}: ${value}`);
  };

  const toggleFeedbackDialog = (memberId) => {
    setFeedbackStates(prev => ({
      ...prev,
      [memberId]: { ...prev[memberId], isOpen: !prev[memberId].isOpen }
    }));
  };

  const handleFeedbackChange = (memberId, value) => {
    setFeedbackStates(prev => ({
      ...prev,
      [memberId]: { ...prev[memberId], feedback: value }
    }));
  };

  const submitFeedback = (memberId) => {
    console.log(`Feedback submitted for member ${memberId}: ${feedbackStates[memberId].feedback}`);
    toggleFeedbackDialog(memberId);
  };

  // Custom Progress Bar component
  const ProgressBar = ({ value, color }) => (
    <div className="w-full bg-gray-200 rounded-full h-2.5">
      <div 
        className={`h-2.5 rounded-full ${
          color === 'success' ? 'bg-green-500' : 
          color === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
        }`}
        style={{ width: `${value}%` }}
      />
    </div>
  );

  // Custom Rating component
  const Rating = ({ value, onChange }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => onChange?.(star)}
          className="focus:outline-none"
        >
          <StarIcon
            className={`w-4 h-4 ${
              star <= value ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  );

  // Historical Performance data
  const historicalData = {
    matchScore: 85,
    previousPerformers: [
      { name: 'Alex Johnson', score: 87, status: 'Still employed, top performer' },
      { name: 'Tina Roberts', score: 83, status: 'Promoted within first year' },
    ]
  };

  // Market benchmark data
  const benchmarkData = {
    industryAvg: 78,
    topCompetitors: 82,
    regionalAverage: 75
  };

  return (
    <div className="p-4 space-y-4">
      {/* System Recommendations */}
      <div className="bg-gray-50 p-4 rounded-md">
        <div className="flex items-center gap-2">
          <FileText className="text-blue-600" />
          <span className="font-semibold">System Recommendations</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="p-4 bg-white rounded-md shadow-md">
            <h3 className="text-sm font-semibold mb-2">Historical Performance Match</h3>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <ProgressBar value={historicalData.matchScore} color="success" />
              </div>
              <span className="text-sm">{historicalData.matchScore}%</span>
            </div>
            <div className="mt-3 text-xs text-gray-600">
              <p className="font-medium">Similar candidates who succeeded:</p>
              <ul className="list-disc ml-4">
                {historicalData.previousPerformers.map((performer, idx) => (
                  <li key={idx}>{performer.name} ({performer.score}%) - {performer.status}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="p-4 bg-white rounded-md shadow-md">
            <h3 className="text-sm font-semibold mb-2">Market Benchmark</h3>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <ProgressBar value={benchmarkData.industryAvg} color="info" />
              </div>
              <span className="text-sm">{benchmarkData.industryAvg}%</span>
            </div>
            <div className="mt-3 text-xs text-gray-600">
              <p>Candidate scores above:</p>
              <ul className="list-disc ml-4">
                <li>Industry average: {benchmarkData.industryAvg}%</li>
                <li>Top competitors: {benchmarkData.topCompetitors}%</li>
                <li>Regional average: {benchmarkData.regionalAverage}%</li>
              </ul>
            </div>
          </div>

          <div className="p-4 bg-white rounded-md shadow-md">
            <h3 className="text-sm font-semibold mb-2">AI Recommendation</h3>
            <div className="bg-green-100 text-green-800 p-2 rounded-md flex items-center">
              <CheckCircle className="h-4 w-4" />
              <span className="ml-2">Strong Hire</span>
            </div>
            <div className="mt-3 text-xs text-gray-600">
              <p className="font-medium">Why this recommendation:</p>
              <ul className="list-disc ml-4">
                <li>Strong technical assessment results</li>
                <li>Above average cultural fit rating</li>
                <li>Skills match current team needs</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Assessment */}
      <div className="bg-white p-4 rounded-md shadow-md">
        <div className="flex items-center gap-2 mb-3">
          <AlertCircle className="text-orange-500" />
          <span className="font-semibold">Risk Assessment</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 bg-gray-50 rounded-md">
            <h3 className="text-sm font-semibold">Flight Risk</h3>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex-1">
                <ProgressBar value={15} color="success" />
              </div>
              <span className="text-sm text-green-600">Low (15%)</span>
            </div>
          </div>
          <div className="p-3 bg-gray-50 rounded-md">
            <h3 className="text-sm font-semibold">Training Gap</h3>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex-1">
                <ProgressBar value={30} color="info" />
              </div>
              <span className="text-sm text-blue-600">Moderate (30%)</span>
            </div>
          </div>
          <div className="p-3 bg-gray-50 rounded-md">
            <h3 className="text-sm font-semibold">Integration Time</h3>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex-1">
                <ProgressBar value={25} color="info" />
              </div>
              <span className="text-sm text-blue-600">Moderate (25 days)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Decision Actions */}
      <div className="p-4 bg-white rounded-md shadow-md">
        <div className="font-semibold">Take Action</div>
        <div className="flex flex-wrap gap-2 mt-4">
          <button
            onClick={() => handleCandidateDecision('select')}
            className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-md flex items-center"
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Select Candidate
          </button>
          <button
            onClick={() => handleCandidateDecision('reject')}
            className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-md flex items-center"
          >
            <XCircle className="mr-2 h-4 w-4" />
            Reject Candidate
          </button>
          <button
            onClick={() => handleCandidateDecision('hold')}
            className="bg-yellow-500 hover:bg-yellow-600 text-white p-2 rounded-md flex items-center"
          >
            <PauseCircle className="mr-2 h-4 w-4" />
            Hold for Further Review
          </button>
        </div>
      </div>

      {/* Evaluator Feedback */}
      <div className="p-4 bg-white rounded-md shadow-md">
        <div className="font-semibold mb-2">Evaluator Feedback</div>
        <p className="text-sm text-gray-600 mb-4">
          Provide feedback on interview quality and evaluation consistency to improve the hiring process.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {teamMembers.map(member => (
            <div key={member.id} className="p-4 bg-gray-50 rounded-md shadow-md">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-blue-500 text-white flex items-center justify-center">
                  {member.name[0]}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{member.name}</p>
                  <p className="text-sm text-gray-500">{member.role}</p>
                </div>
                <Rating 
                  value={member.rating}
                  onChange={(value) => handleEvaluatorRating(member.id, value)}
                />
              </div>
              
              {/* Interview quality metrics */}
              <div className="mt-3 border-t pt-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-500">Interview Quality:</span>
                  <span className="text-xs font-medium">{member.interviewQuality}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-gray-500">Consistency Score:</span>
                  <div className="flex items-center">
                    <ProgressBar value={member.consistencyScore} color={member.consistencyScore > 80 ? 'success' : 'warning'} />
                    <span className="text-xs ml-2">{member.consistencyScore}%</span>
                  </div>
                </div>
                
                {/* Feedback button */}
                <button
                  onClick={() => toggleFeedbackDialog(member.id)}
                  className="flex items-center text-xs text-blue-600 hover:text-blue-800 mt-2"
                >
                  <MessageSquare className="h-3 w-3 mr-1" />
                  Provide feedback
                </button>
                
                {/* Feedback dialog */}
                {feedbackStates[member.id].isOpen && (
                  <div className="mt-3 p-3 bg-white rounded border shadow-sm">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Feedback on {member.name}'s evaluation
                    </label>
                    <textarea
                      value={feedbackStates[member.id].feedback}
                      onChange={(e) => handleFeedbackChange(member.id, e.target.value)}
                      className="w-full h-24 text-sm border rounded p-2 mb-2"
                      placeholder="Provide feedback on interview quality and evaluation consistency..."
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => toggleFeedbackDialog(member.id)}
                        className="px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => submitFeedback(member.id)}
                        className="px-2 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded"
                      >
                        Submit
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Historical Consistency Chart */}
      <div className="p-4 bg-white rounded-md shadow-md">
        <div className="flex items-center gap-2 mb-4">
          <BarChart2 className="text-purple-600" />
          <span className="font-semibold">Evaluation Consistency Metrics</span>
        </div>
        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="text-sm font-medium mb-3">Team Consistency Over Time</h3>
          <div className="h-48 flex items-end space-x-2">
            {/* Simple bar chart - in real app, use a charting library */}
            <div className="flex-1 flex items-end space-x-2">
              {['Jan', 'Feb', 'Mar', 'Apr', 'May'].map((month, idx) => {
                const height = [65, 72, 78, 82, 86][idx];
                return (
                  <div key={month} className="flex flex-col items-center">
                    <div className="w-full flex-1 flex items-end">
                      <div 
                        className="w-8 bg-purple-500 rounded-t-sm"
                        style={{ height: `${height}%` }}
                      />
                    </div>
                    <span className="text-xs mt-1">{month}</span>
                  </div>
                );
              })}
            </div>
            <div className="h-full flex flex-col justify-between text-xs text-gray-500 pr-2">
              <span>100%</span>
              <span>75%</span>
              <span>50%</span>
              <span>25%</span>
              <span>0%</span>
            </div>
          </div>
          <p className="text-xs text-gray-600 mt-4">
            Overall team consistency has improved by 21% over the past quarter. 
            Evaluation differences between team members have decreased from 18% to 7%.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DecisionMaking;