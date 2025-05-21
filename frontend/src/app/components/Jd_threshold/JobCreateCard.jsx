import React, { useState } from 'react';
import { FaTimes, FaArrowLeft, FaCheck, FaMagic } from 'react-icons/fa';

const JobDetailsCard = ({ jobDetails, loading, onClose, isCreating = false, newJobData = null, onDataChange = null, onSubmit = null }) => {
  const [isConfirmingSubmit, setIsConfirmingSubmit] = useState(false);
  const [generatingDescription, setGeneratingDescription] = useState(false);
  
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-2">Loading...</p>
          </div>
        </div>
      </div>
    );
  }
  
  // Function to generate job description
  const generateJobDescription = async () => {
    if (!newJobData.position_title || !newJobData.required_experience) {
      alert("Position Title and Required Experience are required to generate a job description");
      return;
    }
    
    setGeneratingDescription(true);
    
    try {
      const payload = {
        position_title: newJobData.position_title,
        required_experience: newJobData.required_experience,
        location: newJobData.location || "",
        position_type: newJobData.position_type || "",
        office_timings: newJobData.office_timings || "",
        role_details: newJobData.roles?.[0] || ""
      };
      
      const response = await fetch('http://127.0.0.1:8000/generate-job-description', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Update the job content with the generated description
      onDataChange('content', data.job_description);
      
    } catch (error) {
      console.error("Error generating job description:", error);
      alert("Failed to generate job description. Please try again later.");
    } finally {
      setGeneratingDescription(false);
    }
  };
  
  // Handle the create job mode
  if (isCreating && newJobData) {
    const handleSubmit = async () => {
      try {
        // Format the data according to the API expectations, matching extract_job_description's format
        const formattedData = {
          user_id: '1', // Assuming a default user_id or this should be passed in as a prop
          title: newJobData.position_title,
          description: newJobData.content, // This will be saved as the description
          raw_text: newJobData.content, // Important: Save the content as raw_text too
          keywords: '', // Can be populated later
          status: 'Active',
          department: newJobData.roles?.[0] || '',
          required_skills: '', // Will be updated through dashboards later
          experience_level: newJobData.required_experience || '',
          education_requirements: newJobData.skills_data?.[newJobData.roles?.[0] || 'default']?.qualifications ? 
                                Object.keys(newJobData.skills_data[newJobData.roles[0] || 'default'].qualifications).join(', ') : 
                                '',
          threshold_score: 70, // Default threshold score
          location: newJobData.location || '',
          position_type: newJobData.position_type || '',
          office_timings: newJobData.office_timings || ''
        };
        
        console.log('Formatted Data for DB Save:', formattedData);
        
        // Call the API to create the job description
        const response = await fetch('http://127.0.0.1:8000/api/create-job-description', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formattedData)
        });
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('Job created successfully:', result);
        
        // Call the submit handler with result and formatted data
        onSubmit({...formattedData, job_id: result.job_id});
      } catch (error) {
        console.error('Error creating job description:', error);
        alert('Failed to create job description. Please try again.');
      }
    };

    // Generate preview data object that matches the structure expected by the display part
    const previewJobData = {
      title: newJobData.position_title || 'No Title',
      department: newJobData.roles?.[0] || 'No Department',
      experience_level: newJobData.required_experience || 'Not specified',
      education_requirements: newJobData.skills_data?.[newJobData.roles?.[0] || 'default']?.qualifications ? 
                            Object.keys(newJobData.skills_data[newJobData.roles[0] || 'default'].qualifications).join(', ') : 
                            'None specified',
      description: newJobData.content || 'No description available',
      // Format skills for display
      skills: (() => {
        const role = newJobData.roles?.[0] || 'default';
        const skills = [];
        
        // Add technical skills
        if (newJobData.skills_data?.[role]?.skills) {
          Object.entries(newJobData.skills_data[role].skills).forEach(([skillName, data]) => {
            skills.push({
              skill_name: skillName,
              importance: data.importance
            });
          });
        }
        
        // Add requirements as skills
        if (newJobData.skills_data?.[role]?.requirements) {
          Object.entries(newJobData.skills_data[role].requirements).forEach(([skillName, data]) => {
            skills.push({
              skill_name: `${skillName} (Requirement)`,
              importance: data.importance
            });
          });
        }
        
        return skills;
      })(),
      // Calculate threshold scores based on skills
      threshold_scores: {
        selection_score: 0.75,
        rejection_score: 0.25
      },
      threshold_settings: {
        job_match_benchmark: 70,
        high_score_threshold: 85,
        high_match_threshold: 80,
        mid_score_threshold: 60
      }
    };

    // Confirmation screen with job preview before final submission
    if (isConfirmingSubmit) {
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Confirm Job Description</h2>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                <FaTimes />
              </button>
            </div>
            
            {/* Preview Content */}
            <div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <h3 className="font-medium text-gray-700">Title</h3>
                  <p>{previewJobData.title}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-700">Department/Role</h3>
                  <p>{previewJobData.department}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-700">Experience Level</h3>
                  <p>{previewJobData.experience_level}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-700">Education</h3>
                  <p>{previewJobData.education_requirements}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-700">Location</h3>
                  <p>{newJobData.location || 'Not specified'}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-700">Position Type</h3>
                  <p>{newJobData.position_type || 'Not specified'}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-700">Office Timings</h3>
                  <p>{newJobData.office_timings || 'Not specified'}</p>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="font-medium text-gray-700 mb-2">Description</h3>
                <div className="p-3 bg-gray-50 rounded border border-gray-200 max-h-60 overflow-y-auto">
                  <p className="whitespace-pre-wrap">{previewJobData.description}</p>
                </div>
              </div>
              
              {previewJobData.skills && previewJobData.skills.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-medium text-gray-700 mb-2">Required Skills</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {previewJobData.skills.map((skill, index) => (
                      <div key={index} className="p-2 bg-blue-50 rounded flex items-center justify-between">
                        <span>{skill.skill_name}</span>
                        <span className="text-sm bg-blue-100 px-2 py-1 rounded">
                          Importance: {(skill.importance * 100).toFixed(0)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setIsConfirmingSubmit(false)}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded bg-white text-gray-700 hover:bg-gray-50"
                >
                  <FaArrowLeft size={14} /> Back to Edit
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded"
                >
                  <FaCheck size={14} /> Confirm and Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Calculate threshold scores based on existing skills
    const calculateThresholdScores = () => {
      const role = newJobData.roles?.[0] || 'default';
      let totalSelectionScore = 0;
      let totalRejectionScore = 0;
      let skillCount = 0;

      // Process all skill types
      ['skills', 'qualifications', 'requirements'].forEach(type => {
        const skillsObj = newJobData.skills_data?.[role]?.[type] || {};
        Object.values(skillsObj).forEach(data => {
          totalSelectionScore += data.selection_score || data.importance || 0;
          totalRejectionScore += data.rejection_score || (1 - data.importance) || 0;
          skillCount++;
        });
      });

      // Calculate averages
      return {
        selection_score: skillCount > 0 ? totalSelectionScore / skillCount : 0.75,
        rejection_score: skillCount > 0 ? totalRejectionScore / skillCount : 0.25
      };
    };

    // Get the threshold scores
    const thresholdScores = calculateThresholdScores();

    // Regular job creation form - WITHOUT SKILLS SECTION
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Create New Job Description</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <FaTimes />
            </button>
          </div>
          
          {/* Main form fields - full width now */}
          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Position Title *
                </label>
                <input 
                  type="text" 
                  value={newJobData.position_title || ''}
                  onChange={(e) => onDataChange('position_title', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Required Experience *
                </label>
                <select
                  value={newJobData.required_experience || ''}
                  onChange={(e) => onDataChange('required_experience', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                >
                  <option value="">Select Experience</option>
                  <option value="Entry Level (0-2 years)">Entry Level (0-2 years)</option>
                  <option value="Mid Level (3-5 years)">Mid Level (3-5 years)</option>
                  <option value="Senior Level (5+ years)">Senior Level (5+ years)</option>
                  <option value="Executive Level (10+ years)">Executive Level (10+ years)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input 
                  type="text" 
                  value={newJobData.location || ''}
                  onChange={(e) => onDataChange('location', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Position Type
                </label>
                <select
                  value={newJobData.position_type || ''}
                  onChange={(e) => onDataChange('position_type', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                >
                  <option value="">Select Type</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Freelance">Freelance</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Office Timings
                </label>
                <input 
                  type="text" 
                  value={newJobData.office_timings || ''}
                  onChange={(e) => onDataChange('office_timings', e.target.value)}
                  placeholder="e.g., 9 AM - 5 PM"
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <input 
                  type="text" 
                  value={newJobData.roles?.[0] || ''}
                  onChange={(e) => onDataChange('roles', [e.target.value])}
                  placeholder="e.g., Software Engineer"
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
            </div>

            {/* Job Description Content with Generate Button */}
            <div className="mt-4">
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Job Description Content *
                </label>
                <button
                  type="button"
                  onClick={generateJobDescription}
                  disabled={!newJobData.position_title || !newJobData.required_experience || generatingDescription}
                  className={`flex items-center gap-1 text-sm px-3 py-1 rounded 
                    ${(!newJobData.position_title || !newJobData.required_experience || generatingDescription) 
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                      : 'bg-purple-500 hover:bg-purple-600 text-white'}`}
                >
                  {generatingDescription ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-1"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <FaMagic size={12} /> Generate JD
                    </>
                  )}
                </button>
              </div>
              <textarea 
                value={newJobData.content || ''}
                onChange={(e) => onDataChange('content', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded h-40"
                required
                placeholder="Enter the full job description here or use the Generate JD button..."
              />
            </div>
          </div>
        
          {/* Confirmation and Cancel buttons */}          
          <div className="flex justify-end gap-3 mt-6 border-t pt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded bg-white text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                // Check required fields before showing confirmation
                if (newJobData.position_title && newJobData.required_experience && newJobData.content) {
                  setIsConfirmingSubmit(true);
                }
              }}
              disabled={!newJobData.position_title || !newJobData.required_experience || !newJobData.content}
              className={`px-4 py-2 ${
                !newJobData.position_title || !newJobData.required_experience || !newJobData.content 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-500 hover:bg-blue-600'
              } text-white rounded`}
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Display job details (existing functionality)
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Job Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FaTimes />
          </button>
        </div>
        
        {jobDetails?.error ? (
          <div className="bg-red-50 p-4 rounded border border-red-200 mb-4">
            <p className="text-red-600">{jobDetails.error}</p>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <h3 className="font-medium text-gray-700">Title</h3>
                <p>{jobDetails?.title || 'N/A'}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-700">Department</h3>
                <p>{jobDetails?.department || 'N/A'}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-700">Experience Level</h3>
                <p>{jobDetails?.experience_level || 'N/A'}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-700">Education</h3>
                <p>{jobDetails?.education_requirements || 'N/A'}</p>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="font-medium text-gray-700 mb-2">Description</h3>
              <div className="p-3 bg-gray-50 rounded border border-gray-200 max-h-40 overflow-y-auto">
                <p className="whitespace-pre-wrap">{jobDetails?.description || 'No description available'}</p>
              </div>
            </div>
            
            {jobDetails?.skills && jobDetails.skills.length > 0 && (
              <div className="mb-6">
                <h3 className="font-medium text-gray-700 mb-2">Required Skills</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {jobDetails.skills.map((skill, index) => (
                    <div key={index} className="p-2 bg-blue-50 rounded flex items-center justify-between">
                      <span>{skill.skill_name}</span>
                      <span className="text-sm bg-blue-100 px-2 py-1 rounded">
                        Importance: {(skill.importance * 100).toFixed(0)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {jobDetails?.threshold_scores && (
              <div className="mb-6">
                <h3 className="font-medium text-gray-700 mb-2">Threshold Scores</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-green-50 rounded border border-green-200">
                    <p className="text-sm text-gray-600">Selection Score</p>
                    <p className="text-lg font-medium">{jobDetails.threshold_scores.selection_score.toFixed(2)}</p>
                  </div>
                  <div className="p-3 bg-red-50 rounded border border-red-200">
                    <p className="text-sm text-gray-600">Rejection Score</p>
                    <p className="text-lg font-medium">{jobDetails.threshold_scores.rejection_score.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            )}
            
            {jobDetails?.threshold_settings && (
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Threshold Settings</h3>
                <div className="bg-gray-50 p-3 rounded border border-gray-200">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Job Match Benchmark: {jobDetails.threshold_settings.job_match_benchmark}%</div>
                    <div>High Score Threshold: {jobDetails.threshold_settings.high_score_threshold}%</div>
                    <div>High Match Threshold: {jobDetails.threshold_settings.high_match_threshold}%</div>
                    <div>Mid Score Threshold: {jobDetails.threshold_settings.mid_score_threshold}%</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobDetailsCard;