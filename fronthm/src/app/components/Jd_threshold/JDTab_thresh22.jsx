import React, { useState, useEffect } from 'react';
import { FaUpload, FaEye, FaEyeSlash, FaTrash, FaSync, FaPlus, FaSave, FaFileAlt, FaUserTie, FaChartBar } from 'react-icons/fa';
import axios from 'axios';
import SkillsThresholdComponent from './SkillsThresholdComponent';

// Dashboard components to display analysis results
const SkillsMatchDashboard = ({ data }) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-4 mb-4">
      <h3 className="text-lg font-semibold mb-3">{data.title}</h3>
      <p className="text-sm text-gray-600 mb-4">{data.description}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-50 p-3 rounded">
          <div className="flex justify-between mb-2">
            <span className="font-medium">Matched Skills</span>
            <span className="font-bold text-green-600">{data.data.matched}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-green-600 h-2.5 rounded-full" 
              style={{ width: `${data.data.percentage_matched}%` }}
            ></div>
          </div>
        </div>
        <div className="bg-gray-50 p-3 rounded">
          <div className="flex justify-between mb-2">
            <span className="font-medium">Missing Skills</span>
            <span className="font-bold text-red-600">{data.data.missing}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-red-600 h-2.5 rounded-full" 
              style={{ width: `${100 - data.data.percentage_matched}%` }}
            ></div>
          </div>
        </div>
      </div>
      <div className="mt-4 p-3 bg-blue-50 rounded">
        <span className="font-medium">Match Percentage:</span>
        <span className="ml-2 font-bold">{data.data.percentage_matched.toFixed(1)}%</span>
      </div>
    </div>
  );
};

const SummaryDashboard = ({ data }) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-4 mb-4">
      <h3 className="text-lg font-semibold mb-3">{data.title}</h3>
      <p className="text-sm text-gray-600 mb-4">{data.description}</p>
      
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 bg-gray-50 p-4 rounded">
          <h4 className="font-medium text-gray-700 mb-2">Total Score</h4>
          <div className="text-3xl font-bold text-blue-600">{data.data.total_score.toFixed(2)}</div>
        </div>
        
        <div className="flex-1 bg-gray-50 p-4 rounded">
          <h4 className="font-medium text-gray-700 mb-2">Status</h4>
          <div className={`text-xl font-bold ${data.data.pass_fail_status === "Pass" ? "text-green-600" : "text-red-600"}`}>
            {data.data.pass_fail_status}
          </div>
        </div>
      </div>
      
      <div className="mt-4">
        <h4 className="font-medium text-gray-700 mb-2">Section-wise Match</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {Object.entries(data.data.section_wise_match).map(([section, score]) => (
            <div key={section} className="bg-gray-50 p-3 rounded">
              <div className="font-medium mb-1 truncate">{section}</div>
              <div className="flex items-center">
                <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                  <div 
                    className={`h-2 rounded-full ${score > 0.7 ? "bg-green-600" : score > 0.4 ? "bg-yellow-500" : "bg-red-600"}`}
                    style={{ width: `${score * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm font-bold">{(score * 100).toFixed(0)}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ComparisonDashboard = ({ data }) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-4 mb-4">
      <h3 className="text-lg font-semibold mb-3">{data.title}</h3>
      <p className="text-sm text-gray-600 mb-4">{data.description}</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-50 p-4 rounded">
          <h4 className="font-medium text-blue-700 mb-2">Resume Summary</h4>
          <p className="text-sm">{data.data.resume_summary}</p>
        </div>
        
        <div className="bg-gray-50 p-4 rounded">
          <h4 className="font-medium text-green-700 mb-2">Job Description Summary</h4>
          <p className="text-sm">{data.data.job_description_summary}</p>
        </div>
      </div>
      
      <div className="mt-4">
        <h4 className="font-medium text-gray-700 mb-3">Keyword Highlights</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-3 rounded">
            <h5 className="text-sm font-medium text-blue-700 mb-2">Resume Keywords</h5>
            <div className="flex flex-wrap gap-2">
              {data.data.keyword_highlights.resume_keywords.map((keyword, index) => (
                <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                  {keyword}
                </span>
              ))}
            </div>
          </div>
          
          <div className="bg-gray-50 p-3 rounded">
            <h5 className="text-sm font-medium text-green-700 mb-2">Job Description Keywords</h5>
            <div className="flex flex-wrap gap-2">
              {data.data.keyword_highlights.job_description_keywords.map((keyword, index) => (
                <span key={index} className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ThresholdDashboard = ({ data }) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-4 mb-4">
      <h3 className="text-lg font-semibold mb-3">{data.title}</h3>
      <p className="text-sm text-gray-600 mb-4">{data.description}</p>
      
      <div className="bg-gray-50 p-4 rounded mb-4">
        <h4 className="font-medium text-gray-700 mb-3">Current Thresholds</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Selection Threshold
            </label>
            <div className="flex items-center">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={data.data.current_thresholds[0]}
                readOnly
                className="w-full"
              />
              <span className="ml-2 text-sm font-bold">{data.data.current_thresholds[0].toFixed(2)}</span>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rejection Threshold
            </label>
            <div className="flex items-center">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={data.data.current_thresholds[1]}
                readOnly
                className="w-full"
              />
              <span className="ml-2 text-sm font-bold">{data.data.current_thresholds[1].toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-blue-50 p-4 rounded">
        <h4 className="font-medium text-blue-700 mb-2">Impact Analysis</h4>
        <div className="grid grid-cols-1 gap-3">
          <div className="text-sm">
            <span className="font-medium">Selection Threshold Impact:</span>
            <span className="ml-2">{data.data.impact_analysis.selection_threshold_impact}</span>
          </div>
          <div className="text-sm">
            <span className="font-medium">Rejection Threshold Impact:</span>
            <span className="ml-2">{data.data.impact_analysis.rejection_threshold_impact}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const JDTab = ({ jdList, setJdList, setSelectedJDForSidebar }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [selectedResume, setSelectedResume] = useState(null);
  const [selectedJobDesc, setSelectedJobDesc] = useState(null);
  const [showDashboards, setShowDashboards] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');
  
  const buttonConfig = {
    'Resume Analysis': { icon: <FaUserTie className="mr-2 text-purple-500" />, color: 'purple' },
    'Upload Resume': { icon: <FaFileAlt className="mr-2 text-blue-500" />, color: 'blue' },
    'Upload JD': { icon: <FaUpload className="mr-2 text-green-500" />, color: 'green' },
  };

  const handleResumeUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedResume(e.target.files[0]);
    }
  };

  const handleJobDescUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedJobDesc(e.target.files[0]);
    }
  };

  const handleOpenAnalysisModal = () => {
    setShowAnalysisModal(true);
    setSelectedResume(null);
    setSelectedJobDesc(null);
    setAnalysisResult(null);
    setShowDashboards(false);
  };

  const handleCloseAnalysisModal = () => {
    setShowAnalysisModal(false);
  };

  const handleAnalyzeResume = async () => {
    if (!selectedResume || !selectedJobDesc) {
      setError("Please upload both resume and job description files");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Create FormData for file uploads
      const formData = new FormData();
      formData.append('resume', selectedResume);
      formData.append('job_description', selectedJobDesc);

      // Call the endpoint
      const response = await axios.post('http://127.0.0.1:8000/api/v1/analysis/analyze_resume_and_job_description/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data) {
        console.log("Analysis result:", response.data);
        
        // Ensure the response has the expected structure
        const processedResult = {
          ...response.data,
          // If dashboards doesn't exist, create an empty array
          dashboards: response.data.dashboards || []
        };
        
        setAnalysisResult(processedResult);
        setShowDashboards(true);
        
        // Add to list for history
        const newAnalysis = {
          id: Date.now(),
          role: processedResult.roles?.[0] || "Unknown Role",
          fileName: selectedJobDesc.name,
          resumeFileName: selectedResume.name,
          uploadDate: new Date().toLocaleDateString(),
          status: 'Success',
          matchScore: processedResult.selection_threshold?.toFixed(2) || 0,
          relevanceScore: processedResult.rejection_threshold?.toFixed(2) || 0,
          fullData: processedResult
        };
        
        setJdList(prev => [...prev, newAnalysis]);
      } else {
        throw new Error('Invalid API response');
      }
      
    } catch (error) {
      console.error('Error analyzing resume:', error);
      setError(error.message || 'Failed to analyze resume and job description');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateThresholds = async (thresholdData) => {
    if (!jdData || !jdId) {
      setUpdateMessage('Error: No job selected or invalid job ID');
      return;
    }
  
    setIsUpdating(true);
    setUpdateMessage('Updating threshold scores...');
    
    try {
      const dataToUpdate = {
        selection_score: thresholdData.selection_threshold,
        rejection_score: thresholdData.rejection_threshold,
        threshold_value: (thresholdData.selection_threshold + thresholdData.rejection_threshold) / 2,
        threshold_prompts: thresholdData.selected_prompts
      };
      
      const apiBaseUrl = "http://127.0.0.1:8000";
      const apiUrl = `${apiBaseUrl}/api/threshold-scores/${jdId}`;
      
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(dataToUpdate),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorDetail;
        try {
          const errorJson = JSON.parse(errorText);
          errorDetail = errorJson.detail || `Server error: ${response.status}`;
        } catch (e) {
          errorDetail = `Server returned status ${response.status}`;
        }
        
        throw new Error(errorDetail);
      }
      
      const result = await response.json();
      
      setUpdateMessage('Threshold scores updated successfully!');
      setTimeout(() => {
        setUpdateMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error updating threshold scores:', error);
      setUpdateMessage(`Error: ${error.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div>
      {isUpdating && (
        <div className="p-2 bg-blue-100 text-blue-700 mb-4 rounded">
          Updating thresholds...
        </div>
      )}
      
      {updateMessage && (
        <div className={`p-2 mb-4 rounded ${updateMessage.includes('Error') 
          ? 'bg-red-100 text-red-700' 
          : 'bg-green-100 text-green-700'}`}>
          {updateMessage}
        </div>
      )}
      
      {jdData && (
        <SkillsThresholdComponent 
          data={jdData} 
          onUpdateThresholds={handleUpdateThresholds} 
        />
      )}
      <div className="flex justify-between items-center mb-0 mt-8">
        <p style={{ fontSize: '18px', marginLeft: '4px' }}>Resume & Job Description Analysis</p>
        <div className="flex gap-4">
          <button
            onClick={handleOpenAnalysisModal}
            className="p-2 text-gray-700 rounded hover:bg-gray-100 flex items-center"
          >
            {buttonConfig['Resume Analysis'].icon}
            Resume Analysis
          </button>
        </div>
      </div>
      
      {/* Analysis History Table */}
      <div className="bg-white rounded-lg shadow-md p-4 mt-4">
        <h3 className="text-lg font-semibold mb-4">Analysis History</h3>
        {jdList.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No analysis records found. Start by analyzing a resume against a job description.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resume</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Match Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {jdList.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.role}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.resumeFileName || "N/A"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.fileName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.uploadDate}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">{item.matchScore}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded ${item.status === 'Success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Analysis Modal */}
      {showAnalysisModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-6 w-11/12 max-w-4xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Resume & Job Description Analysis</h2>
              <button 
                onClick={handleCloseAnalysisModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentStroke">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {!showDashboards ? (
              <div className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload Resume (PDF)
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                      <div className="space-y-1 text-center">
                        <FaFileAlt className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600">
                          <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                            <span>Upload a file</span>
                            <input 
                              id="resume-upload" 
                              name="resume-upload" 
                              type="file" 
                              className="sr-only"
                              accept=".pdf,.docx,.doc,.txt" 
                              onChange={handleResumeUpload}
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">PDF, DOCX up to 10MB</p>
                      </div>
                    </div>
                    {selectedResume && (
                      <p className="mt-2 text-sm text-green-600">
                        Selected: {selectedResume.name}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload Job Description (PDF)
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                      <div className="space-y-1 text-center">
                        <FaUpload className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600">
                          <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                            <span>Upload a file</span>
                            <input 
                              id="jd-upload" 
                              name="jd-upload" 
                              type="file" 
                              className="sr-only" 
                              accept=".pdf,.docx,.doc,.txt"
                              onChange={handleJobDescUpload}
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">PDF, DOCX up to 10MB</p>
                      </div>
                    </div>
                    {selectedJobDesc && (
                      <p className="mt-2 text-sm text-green-600">
                        Selected: {selectedJobDesc.name}
                      </p>
                    )}
                  </div>
                </div>

                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    <p>{error}</p>
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    onClick={handleAnalyzeResume}
                    disabled={loading || !selectedResume || !selectedJobDesc}
                    className={`px-4 py-2 font-medium rounded-md text-white ${
                      loading || !selectedResume || !selectedJobDesc
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {loading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Analyzing...
                      </span>
                    ) : (
                      'Analyze Resume'
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <>
                {analysisResult && (
                  <div className="mb-4">
                    <div className="bg-blue-50 p-4 rounded-lg mb-6">
                      <h3 className="text-lg font-semibold text-blue-800 mb-2">Analysis Results</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white p-3 rounded shadow">
                          <div className="text-sm text-gray-600">Role</div>
                          <div className="text-lg font-semibold">{analysisResult.roles[0] || "No specific role"}</div>
                        </div>
                        <div className="bg-white p-3 rounded shadow">
                          <div className="text-sm text-gray-600">Selection Threshold</div>
                          <div className="text-lg font-semibold text-green-600">{analysisResult.selection_threshold.toFixed(2)}</div>
                        </div>
                        <div className="bg-white p-3 rounded shadow">
                          <div className="text-sm text-gray-600">Rejection Threshold</div>
                          <div className="text-lg font-semibold text-red-600">{analysisResult.rejection_threshold.toFixed(2)}</div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                    {analysisResult.dashboards && analysisResult.dashboards.map((dashboard, index) => {
                      if (dashboard.title === "Resume Match Summary") {
                        return <SummaryDashboard key={index} data={dashboard} />;
                      } else if (dashboard.title === "Skills Match Dashboard") {
                        return <SkillsMatchDashboard key={index} data={dashboard} />;
                      } else if (dashboard.title === "Resume vs JD Comparison") {
                        return <ComparisonDashboard key={index} data={dashboard} />;
                      } else if (dashboard.title === "Threshold Tuner Dashboard") {
                        return <ThresholdDashboard key={index} data={dashboard} />;
                      }
                      return null;
                    })}
                  </div>
                  </div>
                )}
                
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowDashboards(false);
                      setSelectedResume(null);
                      setSelectedJobDesc(null);
                    }}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-700"
                  >
                    New Analysis
                  </button>
                  <button
                    onClick={handleCloseAnalysisModal}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white"
                  >
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default JDTab;