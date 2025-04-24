import React, { useState, useEffect } from 'react';
import { FaUpload, FaEye, FaEyeSlash, FaTrash, FaSync, FaPlus, FaSave } from 'react-icons/fa';
import DrawerNavigationJD from './DrawerNavigation';
import JobDetailsCard from './JobDetailsCard';
import JobCreateCard from './JobCreateCard';
import CS from './page'; // Create--Modify
import CS2 from './page2'; // View
import UploadPopup from './UploadPopup';
import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api';

const JDTab = ({ jdList, setJdList, setSelectedJDForSidebar }) => {
  // State variables
  const [showDashboard, setShowDashboard] = useState(true);
  const [loading, setLoading] = useState(false);
  const [selectedJD, setSelectedJD] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedSection, setExpandedSection] = useState(null);
  const [error, setError] = useState(null);
  const [editableThresholds, setEditableThresholds] = useState({});
  const [editingThresholds, setEditingThresholds] = useState({});
  const [showJobDetails, setShowJobDetails] = useState(false);
  const [selectedJobDetails, setSelectedJobDetails] = useState(null);
  const [jobDetailsLoading, setJobDetailsLoading] = useState(false);
  const [showUploadPopup, setShowUploadPopup] = useState(false);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [showCreateJDModal, setShowCreateJDModal] = useState(false);
  const recordsPerPage = 10;
  
  // Button configuration for top actions
  const buttonConfig = {
    'Create JD': { icon: <FaPlus className="mr-2 text-yellow-500" />, color: 'yellow' },
    'Upload JD': { icon: <FaUpload className="mr-2 text-blue-500" />, color: 'blue' },
    'Refresh Data': { icon: <FaSync className="mr-2 text-green-500" />, color: 'green' },
  };
  
  // New job form data
  const [newJobData, setNewJobData] = useState({
    position_title: '',
    required_experience: '',
    location: '',
    position_type: '',
    office_timings: '',
    content: '',
    roles: [''],
    skills_data: {
      default: {
        skills: {},
        qualifications: {},
        requirements: {}
      }
    }
  });

  // Fetch job analyses when component mounts
  useEffect(() => {
    fetchAllJobAnalyses();
  }, []);

  // Function to fetch all job analyses
  const fetchAllJobAnalyses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`${API_URL}/job_analyses/`);
      
      if (response.data && Array.isArray(response.data)) {
        console.log("Fetched all job analyses:", response.data);
        
        // Transform the API response to match your jdList format
        const transformedData = response.data.map(item => ({
          id: item.database_id,
          job_id: item.job_id || item.data?.job_id || item.fullData?.job_id || null,
          role: item.roles[0] || 'Unknown Role',
          skills: item.skills_data,
          fileName: `Job Description ${item.database_id}`,
          uploadDate: new Date().toLocaleDateString(),
          status: 'Success',
          threshold: 'View',
          matchScore: item.selection_threshold?.toFixed(2) || 0,
          relevanceScore: item.rejection_threshold?.toFixed(2) || 0,
          fullData: {
            ...item,
            roles: item.roles,
            skills_data: item.skills_data
          }
        }));
        
        setJdList(transformedData);
      } else {
        throw new Error('Invalid API response format');
      }
    } catch (error) {
      console.error('Error fetching job analyses:', error);
      setError(error.message || 'Failed to fetch job analyses');
    } finally {
      setLoading(false);
    }
  };
  
  // Function to handle file upload
  const handleFileUpload = async (file, dashboardCount) => {
    if (file) {
      const validFileTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'application/json'
      ];
  
      if (validFileTypes.includes(file.type)) {
        setLoading(true);
        setError(null);
        
        try {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('dashboard_count', dashboardCount);
          
          const response = await axios.post(
            `${API_URL}/analyze_job_description/?user_id=1&num_dashboards=${dashboardCount}`,
            formData,
            {
              headers: {
                'Content-Type': 'multipart/form-data'
              }
            }
          );
          
          if (response.data && response.data.status === 'success') {
            console.log("API response:", response.data);
            const newFile = {
              id: Date.now() + Math.random(),
              role: response.data.roles[0],
              skills: response.data.skills_data,
              achievements: response.data.achievements,
              fileName: file.name,
              uploadDate: new Date().toLocaleDateString(),
              status: 'Success',
              threshold: 'View',
              matchScore: response.data.selection_threshold?.toFixed(2) || 0,
              relevanceScore: response.data.rejection_threshold?.toFixed(2) || 0,
              dashboardCount: dashboardCount,
              fullData: {
                ...response.data
              },
              file: file
            };
            
            setJdList(prev => [...prev, newFile]);
            setShowDashboard(true);
          } else {
            throw new Error('Invalid API response');
          }
        } catch (error) {
          console.error('Error uploading file:', error);
          setError(error.message || 'Failed to upload and process the file');
          
          const newFile = {
            id: Date.now() + Math.random(),
            role: 'Error',
            position: 'N/A',
            fileName: file.name,
            uploadDate: new Date().toLocaleDateString(),
            status: 'Error',
            threshold: 'N/A',
            matchScore: 0,
            relevanceScore: 0,
            dashboardCount: dashboardCount,
            file: file,
          };
          
          setJdList(prev => [...prev, newFile]);
        } finally {
          setLoading(false);
        }
      } else {
        alert("Please upload only PDF, DOCX, TXT, or JSON files.");
      }
    }
  };

  // Function to handle row deletion
  const handleDelete = (id) => {
    const updatedList = jdList.filter(item => item.id !== id);
    setJdList(updatedList);
    
    if (expandedSection === id) {
      setExpandedSection(null);
    }
    
    setSelectedRows(prev => {
      const newSelected = new Set(prev);
      newSelected.delete(id);
      return newSelected;
    });
    
    setEditingThresholds(prev => {
      const newEditing = {...prev};
      delete newEditing[id];
      return newEditing;
    });
    
    setEditableThresholds(prev => {
      const newThresholds = {...prev};
      delete newThresholds[id];
      return newThresholds;
    });
  };
  
  // Function to handle row selection
  const handleRowSelect = (id) => {
    setSelectedRows(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(id)) {
        newSelected.delete(id);
      } else {
        newSelected.add(id);
      }
      return newSelected;
    });
  };

  // Function to handle opening the sidebar drawer
  const handleModifyClick = (item) => {
    if (item.threshold === 'View' && item.status !== 'Error') {
      setSelectedJD(item);
      if (setSelectedJDForSidebar) {
        setSelectedJDForSidebar(item);
      }
      setIsDrawerOpen(true);
    }
  };

  // Function to handle display toggling (the key function we're fixing)
  const handleDisplayClick = (itemId) => {
    // If the section is already expanded, close it
    if (expandedSection === itemId) {
      setExpandedSection(null);
    } else {
      // Otherwise, expand this section
      setExpandedSection(itemId);
    }
  };

  // Function to handle closing the drawer
  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
    setSelectedJD(null);
  };

  // Function to edit thresholds
  const handleEditThresholds = (item) => {
    setEditingThresholds(prev => ({
      ...prev,
      [item.id]: true
    }));
    
    setEditableThresholds(prev => ({
      ...prev,
      [item.id]: {
        selection: parseFloat(item.matchScore) || 0,
        rejection: parseFloat(item.relevanceScore) || 0
      }
    }));
  };

  // Function to save thresholds
  const handleSaveThresholds = async (item) => {
    try {
      setLoading(true);
      const thresholds = editableThresholds[item.id];
      
      if (!thresholds) {
        throw new Error('No threshold changes to save');
      }
      
      const response = await axios.put(
        `${API_URL}/job_analyses/${item.id}/thresholds`,
        {
          selection_threshold: thresholds.selection,
          rejection_threshold: thresholds.rejection
        }
      );
      
      if (response.data) {
        // Update the item in the jdList
        const updatedList = jdList.map(jd => {
          if (jd.id === item.id) {
            return {
              ...jd,
              matchScore: thresholds.selection.toFixed(2),
              relevanceScore: thresholds.rejection.toFixed(2),
              fullData: {
                ...jd.fullData,
                selection_threshold: thresholds.selection,
                rejection_threshold: thresholds.rejection
              }
            };
          }
          return jd;
        });
        
        setJdList(updatedList);
        setEditingThresholds(prev => ({
          ...prev,
          [item.id]: false
        }));
        alert('Thresholds updated successfully!');
      }
    } catch (error) {
      console.error('Error updating thresholds:', error);
      setError(error.message || 'Failed to update thresholds');
    } finally {
      setLoading(false);
    }
  };

  // Function to handle threshold input changes
  const handleThresholdChange = (itemId, field, value) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setEditableThresholds(prev => ({
        ...prev,
        [itemId]: {
          ...prev[itemId],
          [field]: numValue
        }
      }));
    }
  };

  // Function to cancel threshold editing
  const handleCancelEdit = (itemId) => {
    setEditingThresholds(prev => ({
      ...prev,
      [itemId]: false
    }));
  };

  // Function to fetch job details
  const fetchJobDetails = async (item) => {
    const jobId = item.job_id || item.fullData?.job_id;
    
    if (!jobId || jobId === "undefined") {
      console.error('No valid job ID found for this item:', item);
      
      if (item.id && item.id !== "undefined") {
        try {
          setJobDetailsLoading(true);
          setShowJobDetails(true);
          
          const response = await axios.get(`${API_URL}/threshold-details/${item.id}`);
          
          if (response.data) {
            setSelectedJobDetails(response.data);
          }
        } catch (fallbackError) {
          console.error('Fallback attempt also failed:', fallbackError);
          setSelectedJobDetails({ error: "No valid job ID found" });
        } finally {
          setJobDetailsLoading(false);
        }
      } else {
        setSelectedJobDetails({ error: "No valid job ID found" });
        setShowJobDetails(true);
      }
      return;
    }
  
    try {
      setJobDetailsLoading(true);
      setShowJobDetails(true);
      console.log(`Fetching job details for job ID: ${jobId}`);
      const response = await axios.get(`${API_URL}/job-description/${jobId}`);
      console.log('Job details response:', response.data);
      
      setSelectedJobDetails(response.data);
    } catch (error) {
      console.error(`Error fetching job details for job ID ${jobId}:`, error);
      setSelectedJobDetails({ error: error.message || "Failed to fetch job details" });
    } finally {
      setJobDetailsLoading(false);
    }
  };
  
  // Function to close job details modal
  const handleCloseJobDetails = () => {
    setShowJobDetails(false);
    setSelectedJobDetails(null);
  };
  
  // Function to create a new JD
  const handleCreateNewJD = () => {
    setNewJobData({
      position_title: '',
      required_experience: '',
      location: '',
      position_type: '',
      office_timings: '',
      content: '',
      roles: [''],
      skills_data: {
        default: {
          skills: {},
          qualifications: {},
          requirements: {}
        }
      }
    });
    setShowCreateJDModal(true);
  };
  
  // Function to handle changes in job data
  const handleJobDataChange = (field, value) => {
    setNewJobData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Function to handle skill additions
  const handleSkillAdd = (skillType, skillName, values) => {
    setNewJobData(prev => {
      const roleKey = prev.roles[0] || 'default';
      
      const updatedSkillsData = {
        ...prev.skills_data,
        [roleKey]: {
          ...prev.skills_data[roleKey] || {},
          [skillType]: {
            ...(prev.skills_data[roleKey]?.[skillType] || {}),
            [skillName]: {
              importance: values.importance || 0.5,
              selection_score: values.selection_score || 0.5,
              rejection_score: values.rejection_score || 0.5,
              rating: values.rating || 3
            }
          }
        }
      };
      
      return {
        ...prev,
        skills_data: updatedSkillsData
      };
    });
  };
  
  // Function to submit job data
  const handleSubmitJobData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!newJobData.position_title || !newJobData.content || !newJobData.required_experience) {
        throw new Error('Please fill in all required fields');
      }
      
      if (newJobData.roles.length === 0) {
        newJobData.roles = [newJobData.position_title];
      }
      
      const selection_threshold = 0.75;
      const rejection_threshold = 0.25;
      
      const payload = {
        basic_info: {
          position_title: newJobData.position_title,
          required_experience: newJobData.required_experience,
          location: newJobData.location,
          position_type: newJobData.position_type,
          office_timings: newJobData.office_timings
        },
        roles: newJobData.roles,
        skills_data: newJobData.skills_data,
        content: newJobData.content,
        selection_threshold: selection_threshold,
        rejection_threshold: rejection_threshold
      };
      
      const response = await axios.post(`${API_URL}/analyze_job_description/?user_id=1&num_dashboards=8`, payload);
      
      if (response.data && response.data.status === 'success') {
        const newJobEntry = {
          id: response.data.job_id,
          job_id: response.data.job_id,
          role: newJobData.position_title,
          skills: newJobData.skills_data,
          fileName: `Job - ${newJobData.position_title}`,
          uploadDate: new Date().toLocaleDateString(),
          status: 'Success',
          threshold: 'View',
          matchScore: selection_threshold.toFixed(2),
          relevanceScore: rejection_threshold.toFixed(2),
          fullData: {
            ...payload,
            selection_threshold: selection_threshold,
            rejection_threshold: rejection_threshold
          }
        };
        
        setJdList(prev => [...prev, newJobEntry]);
        setShowCreateJDModal(false);
        alert('Job description created successfully!');
      } else {
        throw new Error('Failed to create job description');
      }
    } catch (error) {
      console.error('Error creating job description:', error);
      setError(error.message || 'Failed to create job description');
    } finally {
      setLoading(false);
    }
  };

  // Calculate pagination
  const totalPages = Math.ceil(jdList.length / recordsPerPage);
  const paginatedList = jdList.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-0 mt-8">
        <p style={{ fontSize: '18px', marginLeft: '4px' }}>Job Descriptions</p>
        <div className="flex gap-4">
          {['Create JD','Upload JD', 'Refresh Data'].map((label) => (
            <div key={label}>
              {label === 'Upload JD' ? (
                <button
                  onClick={() => setShowUploadPopup(true)}
                  className="p-2 text-gray-700 rounded hover:bg-gray-100 flex items-center"
                >
                  {buttonConfig[label].icon}
                  {label}
                </button>
              ) : label === 'Create JD' ? (
                <button
                  onClick={handleCreateNewJD}
                  className="p-2 text-gray-700 rounded hover:bg-gray-100 flex items-center"
                >
                  {buttonConfig[label].icon}
                  {label}
                </button>
              ) : (
                <button
                  onClick={fetchAllJobAnalyses}
                  className="p-2 text-gray-700 rounded hover:bg-gray-100 flex items-center"
                >
                  {buttonConfig[label].icon}
                  {label}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Dashboard Table */}
      <div className="bg-white rounded-lg shadow-md p-4 mt-2">
        {loading && (
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-gray-600">Processing...</p>
          </div>
        )}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>{error}</p>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Upload Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Selection Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rejection Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Threshold</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">View</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Description</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedList.map((item) => {
                return (
                  <React.Fragment key={`row-group-${item.id}`}>
                    <tr key={`row-${item.id}`} className={selectedRows.has(item.id) ? 'bg-gray-100' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedRows.has(item.id)}
                            onChange={() => handleRowSelect(item.id)}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                          />
                          <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-700">
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.role}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.uploadDate}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                        {editingThresholds[item.id] ? (
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="1"
                            value={editableThresholds[item.id]?.selection || item.matchScore}
                            onChange={(e) => handleThresholdChange(item.id, 'selection', e.target.value)}
                            className="w-20 p-1 border border-gray-300 rounded"
                          />
                        ) : (
                          item.matchScore
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                        {editingThresholds[item.id] ? (
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="1"
                            value={editableThresholds[item.id]?.rejection || item.relevanceScore}
                            onChange={(e) => handleThresholdChange(item.id, 'rejection', e.target.value)}
                            className="w-20 p-1 border border-gray-300 rounded"
                          />
                        ) : (
                          item.relevanceScore
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleDisplayClick(item.id)}
                          className={`px-2 py-1 rounded ${expandedSection === item.id ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'} hover:underline`}
                        >
                          {expandedSection === item.id ? 'Hide' : 'Modify'}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <button
                          onClick={() => handleModifyClick(item)}
                          className="text-blue-500 hover:underline"
                        >
                          {item.threshold}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button 
                          onClick={() => fetchJobDetails(item)} 
                          className="text-blue-500 hover:text-blue-700 text-sm"
                        >
                          View Job Description
                        </button>
                      </td>
                    </tr>
                    
                    {/* Expanded dashboard row - This is the crucial part */}
                    {expandedSection === item.id && (
                      <tr key={`expanded-${item.id}`}>
                        <td colSpan="9" className="px-0 py-4">
                          <div className="bg-white rounded-lg shadow-md p-4">
                            <CS
                              jdId={item.id}
                              selectedFile={item.file}
                              jdData={{
                                apiResponse: {
                                  roles: item.fullData?.roles || [],
                                  skills_data: item.fullData?.skills_data || {},
                                  achievements: item.fullData?.achievements || {},
                                }
                              }}
                              onClose={() => setExpandedSection(null)}
                            />
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {/* Pagination controls */}
        <div className="mt-6 flex flex-col items-center">
          <div className="flex items-center space-x-1 border border-gray-200 rounded-md">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border-r border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            
            <div className="px-3 py-1 bg-white text-gray-600">
              Page <span className="font-medium text-gray-800">{currentPage}</span> of <span className="font-medium text-gray-800">{totalPages || 1}</span>
            </div>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages || 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-3 py-1 border-l border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Showing {paginatedList.length} of {jdList.length} records
          </div>
        </div>
      </div>
      
      {/* Modals and pop-ups */}
      {isDrawerOpen && selectedJD && (
        <DrawerNavigationJD
          selectedJd={selectedJD}
          onClose={handleDrawerClose}
        />
      )}
      
      {showJobDetails && (
        <JobDetailsCard 
          jobDetails={selectedJobDetails} 
          loading={jobDetailsLoading} 
          onClose={handleCloseJobDetails} 
        />
      )}
      
      {showUploadPopup && (
        <UploadPopup
          onClose={() => setShowUploadPopup(false)}
          onUpload={handleFileUpload}
        />
      )}
      
      {showCreateJDModal && (
        <JobCreateCard 
          isCreating={true}
          newJobData={newJobData}
          onDataChange={(field, value) => {
            if (field === 'skills_add') {
              handleSkillAdd(value.skillType, value.skillName, value.values);
            } else {
              handleJobDataChange(field, value);
            }
          }}
          onSubmit={handleSubmitJobData}
          onClose={() => setShowCreateJDModal(false)}
        />
      )}
    </div>
  );
};

export default JDTab;