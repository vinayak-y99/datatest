import React, { useState } from 'react';
import { FaTimes, FaSpinner, FaPlus } from 'react-icons/fa';

const JobDetailsCard = ({ jobDetails, loading, onClose, isCreating = false, newJobData = null, onDataChange = null, onSubmit = null }) => {
    const [skillName, setSkillName] = useState('');
    const [skillType, setSkillType] = useState('skills'); // 'skills', 'qualifications', or 'requirements'
    const [skillImportance, setSkillImportance] = useState(0.5);
    
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl p-6 w-11/12 max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-800">Job Details</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <FaTimes />
            </button>
          </div>
          <div className="flex items-center justify-center h-40">
            <FaSpinner className="animate-spin text-blue-500 text-3xl" />
            <p className="ml-3 text-gray-600">Loading job details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!jobDetails) {
    return null;
  }

  if (jobDetails.error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl p-6 w-11/12 max-w-4xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-800">Job Details</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <FaTimes />
            </button>
          </div>
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
            <p>Error: {jobDetails.error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Determine if we're using the API response or the job details
  const isApiResponse = !jobDetails.title && !jobDetails.description;

  if (isCreating && newJobData) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Create New Job Description</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <FaTimes />
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Position Title *
              </label>
              <input 
                type="text" 
                value={newJobData.position_title}
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
                value={newJobData.required_experience}
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
                value={newJobData.location}
                onChange={(e) => onDataChange('location', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Position Type
              </label>
              <select
                value={newJobData.position_type}
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
                value={newJobData.office_timings}
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
                value={newJobData.roles[0] || ''}
                onChange={(e) => onDataChange('roles', [e.target.value])}
                placeholder="e.g., Software Engineer"
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Job Description Content *
            </label>
            <textarea 
              value={newJobData.content}
              onChange={(e) => onDataChange('content', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded h-40"
              required
              placeholder="Enter the full job description here..."
            />
          </div>
          
          {/* Skills Management Section */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Add Skills</h3>
            
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Skill Type
                </label>
                <select
                  value={skillType}
                  onChange={(e) => setSkillType(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                >
                  <option value="skills">Technical Skills</option>
                  <option value="qualifications">Qualifications</option>
                  <option value="requirements">Requirements</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Skill Name
                </label>
                <input 
                  type="text" 
                  value={skillName}
                  onChange={(e) => setSkillName(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Importance (0-1)
                </label>
                <input 
                  type="number" 
                  step="0.1"
                  min="0"
                  max="1"
                  value={skillImportance}
                  onChange={(e) => setSkillImportance(parseFloat(e.target.value))}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
            </div>
            
            <button
              onClick={() => {
                if (skillName && skillType) {
                  const role = newJobData.roles[0] || 'default';
                  const values = {
                    importance: skillImportance,
                    selection_score: skillImportance,
                    rejection_score: 1 - skillImportance,
                    rating: Math.round(skillImportance * 5)
                  };
                  
                  // Call the parent handler
                  onDataChange('skills_add', { skillType, skillName, values });
                  
                  // Reset fields
                  setSkillName('');
                  setSkillImportance(0.5);
                }
              }}
              className="flex items-center gap-1 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              <FaPlus /> Add Skill
            </button>
          </div>
          
          {/* Display skills that have been added */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Added Skills</h3>
            
            {Object.keys(newJobData.skills_data).map(role => (
              <div key={role} className="mb-4">
                <h4 className="font-medium">Role: {role}</h4>
                
                {['skills', 'qualifications', 'requirements'].map(type => {
                  const skillsObj = newJobData.skills_data[role]?.[type] || {};
                  const skills = Object.keys(skillsObj);
                  
                  if (skills.length === 0) return null;
                  
                  return (
                    <div key={type} className="ml-4 mb-2">
                      <h5 className="font-medium capitalize">{type}</h5>
                      <ul className="list-disc ml-6">
                        {skills.map(skill => (
                          <li key={skill}>
                            {skill} (Importance: {skillsObj[skill].importance.toFixed(2)})
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
          
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded bg-white text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={onSubmit}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Create Job Description
            </button>
          </div>
        </div>
      </div>
    );
  }
  
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
                                      <p className="text-lg font-medium">{jobDetails.threshold_scores.selection_score?.toFixed(2) || 'N/A'}</p>
                                    </div>
                                    <div className="p-3 bg-red-50 rounded border border-red-200">
                                      <p className="text-sm text-gray-600">Rejection Score</p>
                                      <p className="text-lg font-medium">{jobDetails.threshold_scores.rejection_score?.toFixed(2) || 'N/A'}</p>
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
                  