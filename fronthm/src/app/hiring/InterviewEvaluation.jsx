import React, { useState, useEffect } from 'react';
import AssessmentIcon from '@mui/icons-material/Assessment';
import axios from 'axios';

const InterviewEvaluation = () => {
  // State to store evaluation data
  const [evaluationData, setEvaluationData] = useState({
    criteria: {
      technicalSkills: 85,
      communication: 78
    },
    candidates: [
      { name: 'Candidate 1', score: 90 },
      { name: 'Candidate 2', score: 80 }
    ],
    isLoading: true,
  });

  // Progress bar component since we don't have LinearProgress from MUI
  const ProgressBar = ({ value, color }) => (
    <div className="w-full bg-gray-200 rounded-full h-2.5">
      <div 
        className={`h-2.5 rounded-full ${
          color === 'success' ? 'bg-green-500' : 'bg-blue-500'
        }`}
        style={{ width: `${value}%` }}
      />
    </div>
  );

  // Fetch evaluation data from backend
  useEffect(() => {
    const fetchEvaluationData = async () => {
      try {
        const response = await axios.get('/api/interview-evaluations');
        
        // If we get valid data from the backend, update the state
        if (response.data) {
          setEvaluationData(prevData => ({
            ...prevData,
            criteria: {
              technicalSkills: response.data.criteria?.technicalSkills || prevData.criteria.technicalSkills,
              communication: response.data.criteria?.communication || prevData.criteria.communication
            },
            candidates: response.data.candidates || prevData.candidates,
            isLoading: false
          }));
        }
      } catch (error) {
        console.error('Error fetching evaluation data:', error);
        // On error, just mark loading as complete but keep the fallback data
        setEvaluationData(prevData => ({
          ...prevData,
          isLoading: false
        }));
      }
    };

    fetchEvaluationData();
  }, []);

  return (
    <div className="p-4">
      <div className="space-y-4">
        {/* Evaluation Criteria */}
        <div className="bg-white p-4 rounded-md shadow-md">
          <div className="flex items-center gap-2">
            <AssessmentIcon className="text-purple-500" />
            <span className="font-semibold">Evaluation Criteria</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="p-4 bg-gray-50 rounded-md shadow-sm">
              <h3 className="text-sm font-semibold mb-2">Technical Skills</h3>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <ProgressBar value={evaluationData.criteria.technicalSkills} color="success" />
                </div>
                <span className="text-sm">{evaluationData.criteria.technicalSkills}%</span>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-md shadow-sm">
              <h3 className="text-sm font-semibold mb-2">Communication</h3>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <ProgressBar value={evaluationData.criteria.communication} color="info" />
                </div>
                <span className="text-sm">{evaluationData.criteria.communication}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Evaluation Results */}
        <div className="bg-white p-4 rounded-md shadow-md">
          <div className="font-semibold">Evaluation Results</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {evaluationData.candidates.map((candidate, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-md shadow-sm">
                <h3 className="text-sm font-semibold mb-2">{candidate.name}</h3>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <ProgressBar 
                      value={candidate.score} 
                      color={candidate.score >= 85 ? "success" : "info"} 
                    />
                  </div>
                  <span className="text-sm">{candidate.score}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewEvaluation;
