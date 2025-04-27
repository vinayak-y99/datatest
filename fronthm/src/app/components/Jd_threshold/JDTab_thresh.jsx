import React, { useState, useEffect, useRef } from 'react';
import { FaUpload, FaEye, FaEyeSlash, FaTrash, FaSync, FaPlus, FaSave } from 'react-icons/fa';
import DrawerNavigationJD from './DrawerNavigation';
import JobDetailsCard from './JobDetailsCard';
import JobCreateCard from './JobCreateCard';
import CS from './page'; // Create--Modify
import CS2 from './page2'; // View
import axios from 'axios';
import { nanoid } from 'nanoid';

const API_URL = 'http://127.0.0.1:8000/api';

// Create a separate row component
const TableRow = ({ 
  item, 
  expandedRowId,
  onToggleExpand, 
  onDelete, 
  onSelect,
  onModifyClick,
  onViewDetails,
  onCreateDashboards,
  editingThresholds,
  editableThresholds,
  handleThresholdChange,
  selectedRows,
  updating
}) => {
  // Unique row ID to prevent interference between rows
  const rowId = useRef(nanoid()).current;
  
  // Determine if this specific row is expanded
  const isExpanded = expandedRowId === rowId;
  
  // Handle delete button click
  const handleDeleteClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    console.log(`Delete button clicked for rowId=${rowId}, itemId=${item.id}`);
    
    // Confirm deletion
    if (window.confirm(`Are you sure you want to delete the job: ${item.role || 'Unknown'}?`)) {
      console.log(`Confirmed deletion for itemId=${item.id}`);
      // Call the parent delete function with this row's ID
      onDelete(item.id, rowId);
    } else {
      console.log(`Deletion cancelled for itemId=${item.id}`);
    }
  };
  
  // Log when this row is rendered
  useEffect(() => {
    console.log(`Row rendered for id=${item.id}, rowId=${rowId}`);
    return () => {
      console.log(`Row unmounted for id=${item.id}, rowId=${rowId}`);
    };
  }, []);
  
  // Log when expansion state changes
  useEffect(() => {
    console.log(`Row ${item.id} (rowId: ${rowId}): expandedRowId=${expandedRowId}, isExpanded=${isExpanded}`);
  }, [expandedRowId, isExpanded]);
  
  return (
    <>
      {/* Main data row */}
      <tr 
        id={`row-${rowId}`}
        data-id={item.id}
        data-rowid={rowId}
        className={`${selectedRows.has(item.id) ? 'bg-gray-100' : ''} ${item.hasEmptyThreshold ? 'bg-red-50' : ''}`}
        onClick={(e) => {
          // Only handle row click for the row itself or TD elements
          if (e.target === e.currentTarget || e.target.tagName === 'TD') {
            onSelect(item.id, e);
          }
        }}
      >
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selectedRows.has(item.id)}
              onChange={(e) => {
                e.stopPropagation();
                onSelect(item.id, e);
              }}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            <button 
              type="button"
              data-rowid={rowId}
              data-itemid={item.id}
              onClick={handleDeleteClick}
              className="text-red-500 hover:text-red-700"
              aria-label={`Delete job ${item.role || 'Unknown'}`}
            >
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
          {item.hasEmptyThreshold ? (
            <div className="flex flex-col">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCreateDashboards(item, e);
                }}
                disabled={updating[item.id]}
                className={`px-2 py-1 rounded bg-blue-500 text-white ${updating[item.id] ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'}`}
              >
                {updating[item.id] ? (
                  <span className="flex items-center">
                    <span className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full"></span>
                    Creating...
                  </span>
                ) : (
                  'Create Dashboards'
                )}
              </button>
              <span className="text-red-600 font-medium text-xs mt-1">Required to continue</span>
            </div>
          ) : (
            <button
              data-rowid={rowId}
              data-itemid={item.id}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                console.log(`Modify button clicked for rowId=${rowId}, itemId=${item.id}`);
                onToggleExpand(item.id, rowId);
              }}
              className={`px-2 py-1 rounded ${isExpanded ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'} hover:underline`}
            >
              {isExpanded ? 'Hide' : 'Modify'}
            </button>
          )}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onModifyClick(item);
            }}
            className="text-blue-500 hover:underline"
          >
            {item.threshold}
          </button>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(item);
            }} 
            className="text-blue-500 hover:text-blue-700 text-sm"
          >
            View Job Description
          </button>
        </td>
      </tr>
      
      {/* Expanded row */}
      {isExpanded && (
        <tr 
          id={`expanded-${rowId}`} 
          className="expanded-row"
          data-expanded-for={item.id}
        >
          <td colSpan="9" className="px-0 py-4">
            <div className="bg-white rounded-lg shadow-md p-4">
              <CS
                jdId={item.id}
                jobId={item.job_id}
                selectedFile={item.file}
                jdData={{
                  apiResponse: {
                    roles: item.fullData?.roles || [],
                    skills_data: item.fullData?.skills_data || {},
                    achievements: item.fullData?.achievements || {},
                  }
                }}
                onClose={() => onToggleExpand(item.id, rowId)}
              />
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

// Create a wrapper component to isolate each row
const IsolatedRow = React.memo(({ item, ...props }) => {
  console.log(`IsolatedRow rendering for item ${item.id}`);
  
  return (
    <TableRow
      item={item}
      {...props}
    />
  );
});

const JDTab = ({ jdList, setJdList, setSelectedJDForSidebar }) => {
  // State variables
  const [showDashboard, setShowDashboard] = useState(true);
  const [loading, setLoading] = useState(false);
  const [selectedJD, setSelectedJD] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRowId, setExpandedRowId] = useState(null);
  const [error, setError] = useState(null);
  const [editableThresholds, setEditableThresholds] = useState({});
  const [editingThresholds, setEditingThresholds] = useState({});
  const [showJobDetails, setShowJobDetails] = useState(false);
  const [selectedJobDetails, setSelectedJobDetails] = useState(null);
  const [jobDetailsLoading, setJobDetailsLoading] = useState(false);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [showCreateJDModal, setShowCreateJDModal] = useState(false);
  const [showConfirmationCard, setShowConfirmationCard] = useState(false);
  const [extractedJobData, setExtractedJobData] = useState(null);
  const [dashboardCount, setDashboardCount] = useState(8);
  const fileInputRef = useRef(null);
  const recordsPerPage = 10;
  const [updating, setUpdating] = useState({});
  // Add state for deletion confirmation
  const [deleteConfirmation, setDeleteConfirmation] = useState({ show: false, message: '', success: false });
  
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
        const transformedData = response.data.map((item, index) => {
          // Check different possible locations for threshold result data
          const formatted_data = item.formatted_data || {};
          const skills_data = formatted_data.skills_data || item.skills_data || {};
          
          // Check if threshold_result is empty - look at skills_data as the main indicator
          const hasEmptyThreshold = !skills_data || 
                                   Object.keys(skills_data).length === 0 || 
                                   Object.values(skills_data).every(val => 
                                     !val || Object.keys(val).length === 0);
          
          // Ensure each item has a unique ID by using a fallback to index if nothing exists
          const uniqueId = item.database_id || item.job_id || index.toString();
          
          // Get threshold values from response, logging them for debugging
          const selection_threshold = item.selection_threshold !== undefined ? item.selection_threshold : 0;
          const rejection_threshold = item.rejection_threshold !== undefined ? item.rejection_threshold : 0;
          
          // Log the exact values for debugging
          console.log(`Job ${uniqueId} thresholds - Selection: ${selection_threshold}, Rejection: ${rejection_threshold}`);
          
          return {
            id: uniqueId,
            job_id: item.job_id || item.data?.job_id || item.fullData?.job_id || uniqueId,
            role: item.roles && item.roles.length > 0 ? item.roles[0] : 'Unknown Role',
            skills: item.skills_data,
            fileName: `Job Description ${uniqueId}`,
            uploadDate: new Date().toLocaleDateString(),
            status: hasEmptyThreshold ? 'Incomplete' : 'Success',
            threshold: 'View',
            matchScore: selection_threshold.toFixed(2) || '0.00',
            relevanceScore: rejection_threshold.toFixed(2) || '0.00',
            hasEmptyThreshold,
            fullData: {
              ...item,
              roles: item.roles || [],
              skills_data: item.skills_data || {},
              selection_threshold: selection_threshold,
              rejection_threshold: rejection_threshold
            }
          };
        });
        
        // Log a few transformed items with their threshold values
        console.log("First few transformed items:");
        transformedData.slice(0, 3).forEach(item => {
          console.log(`Item ${item.id}: matchScore=${item.matchScore}, relevanceScore=${item.relevanceScore}`);
        });
        
        setJdList(transformedData);
        return true; // Indicate success
      } else {
        throw new Error('Invalid API response format');
      }
    } catch (error) {
      console.error('Error fetching job analyses:', error);
      setError(error.message || 'Failed to fetch job analyses');
      return false; // Indicate failure
    } finally {
      setLoading(false);
    }
  };
  
  // Function to trigger file input click
  const triggerFileUpload = () => {
    fileInputRef.current.click();
  };
  
  // Function to handle file selection
  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const validFileTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/json'
    ];
    
    if (!validFileTypes.includes(file.type)) {
      alert("Please upload only PDF, DOCX, TXT, or JSON files.");
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Create form data for the API request
      const formData = new FormData();
      formData.append('file', file);
      
      // Call the extract_job_description endpoint directly
      const response = await axios.post(
        `${API_URL}/extract_job_description/?user_id=1`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      if (response.data) {
        // Add the extracted job to the jdList
        const newJob = {
          id: response.data.job_id || Date.now().toString(),
          job_id: response.data.job_id || Date.now().toString(),
          role: response.data.position_title || response.data.roles?.[0] || 'New Job',
          skills: response.data.skills_data || {},
          fileName: file.name,
          uploadDate: new Date().toLocaleDateString(),
          status: 'Success',
          threshold: 'View',
          matchScore: '0.75',
          relevanceScore: '0.25',
          fullData: {
            ...response.data,
            file_name: file.name
          }
        };
        
        setJdList(prev => [...prev, newJob]);
        alert('Job description uploaded successfully!');
      } else {
        throw new Error('Invalid API response');
      }
    } catch (error) {
      console.error('Error extracting job description:', error);
      setError(error.message || 'Failed to extract job description from file');
    } finally {
      setLoading(false);
      // Reset the file input
      e.target.value = '';
    }
  };
  
  // New toggle function to handle expansion
  const handleRowToggle = (itemId, rowId) => {
    console.log(`Toggle row ${itemId} with rowId ${rowId}`);
    
    // If the row is already expanded, close it
    if (expandedRowId === rowId) {
      console.log(`Closing row ${rowId}`);
      setExpandedRowId(null);
    } else {
      // Otherwise, expand this row
      console.log(`Opening row ${rowId}`);
      setExpandedRowId(rowId);
    }
  };

  // Debug logging for state changes
  useEffect(() => {
    console.log(`Expanded row changed to: ${expandedRowId}`);
  }, [expandedRowId]);

  // Create a separate function for handling job deletion with more direct access to the state
  const deleteJobItem = async (jobId, rowId) => {
    try {
      console.log(`DELETION: Trying to delete job with ID ${jobId}, rowId ${rowId}`);
      
      // First, try to hide the row immediately with DOM manipulation to provide instant feedback
      try {
        const rowElement = document.querySelector(`tr[data-id="${jobId}"]`);
        if (rowElement) {
          rowElement.style.display = 'none';
          console.log(`DELETION: Hidden row ${jobId} from DOM`);
        }
        
        const expandedRow = document.getElementById(`expanded-${rowId}`);
        if (expandedRow) {
          expandedRow.style.display = 'none';
          console.log(`DELETION: Hidden expanded row for ${jobId} from DOM`);
        }
      } catch (domError) {
        console.warn('DELETION: DOM manipulation failed:', domError);
      }
      
      // Call the backend API to delete the job
      const item = jdList.find(item => item.id === jobId);
      if (item && item.job_id) {
        try {
          const response = await axios.delete(`${API_URL}/delete-job/${item.job_id}`);
          console.log(`DELETION: API response:`, response.data);
          
          // Show success confirmation message
          setDeleteConfirmation({
            show: true,
            message: response.data.message || `Job ID ${item.job_id} deleted successfully`,
            success: true
          });
          
          // Auto-hide confirmation after 5 seconds
          setTimeout(() => {
            setDeleteConfirmation({ show: false, message: '', success: false });
          }, 5000);
        } catch (apiError) {
          console.error(`DELETION: API call failed:`, apiError);
          // Show error message
          setDeleteConfirmation({
            show: true,
            message: `Failed to delete job: ${apiError.response?.data?.detail || apiError.message}`,
            success: false
          });
          
          // Auto-hide error message after 5 seconds
          setTimeout(() => {
            setDeleteConfirmation({ show: false, message: '', success: false });
          }, 5000);
        }
      }
      
      // Updated approach - use a functional update to ensure we're working with the current state
      setJdList(prevList => {
        console.log(`DELETION: Current list has ${prevList.length} items`);
        
        // Find the job to delete
        const jobIndex = prevList.findIndex(job => job.id === jobId);
        
        if (jobIndex === -1) {
          console.error(`DELETION: Job with ID ${jobId} not found in list.`);
          return prevList; // Return unchanged list if job not found
        }
        
        console.log(`DELETION: Found job at index ${jobIndex}. Deleting it.`);
        
        // Create a new array without the found item
        const newList = [...prevList.slice(0, jobIndex), ...prevList.slice(jobIndex + 1)];
        
        console.log(`DELETION: New list will have ${newList.length} items`);
        return newList;
      });
      
      // Close any expanded section for this job
      if (expandedRowId === rowId) {
        setExpandedRowId(null);
      }
      
      // Remove from selected rows
      setSelectedRows(prev => {
        const newSelected = new Set(prev);
        newSelected.delete(jobId);
        return newSelected;
      });
      
      // Remove from editing thresholds
      setEditingThresholds(prev => {
        const newEditing = { ...prev };
        delete newEditing[jobId];
        return newEditing;
      });
      
      // Remove from editable thresholds
      setEditableThresholds(prev => {
        const newThresholds = { ...prev };
        delete newThresholds[jobId];
        return newThresholds;
      });
      
      console.log(`DELETION: Job ${jobId} successfully deleted.`);
      return true;
    } catch (error) {
      console.error("DELETION ERROR:", error);
      return false;
    }
  };
  
  // Function to handle row selection
  const handleRowSelect = (id, e) => {
    // Prevent event bubbling if called from checkbox
    if (e && e.stopPropagation) {
      e.stopPropagation();
    }
    
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
      console.log("Selected JD for modification:", item);
      console.log("Job ID for modification:", item.job_id);
      
      setSelectedJD(item);
      if (setSelectedJDForSidebar) {
        setSelectedJDForSidebar(item);
      }
      setIsDrawerOpen(true);
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
  
  // This function just shows the modal, it doesn't submit anything yet
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
  
  // Function to handle the submission from JobCreateCard
  const handleJobCreation = (newJobEntry) => {
    // Add the new job to the list
    setJdList(prev => [...prev, newJobEntry]);
    // Close the create modal
    setShowCreateJDModal(false);
    // Show success message
    alert('Job description created successfully!');
  };

  // Calculate pagination
  const totalPages = Math.ceil(jdList.length / recordsPerPage);
  const paginatedList = jdList.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  // Update useEffect to handle expandedRowId properly
  useEffect(() => {
    // We now use expandedRowId directly - it's a string or null
    if (expandedRowId) {
      setTimeout(() => {
        // The ID of the expanded row is simply expanded-${rowId} now
        const expandedRow = document.getElementById(`expanded-${expandedRowId}`);
        if (expandedRow) {
          expandedRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  }, [expandedRowId]);

  // Add this key debug code to help track state changes
  useEffect(() => {
    console.log('expandedRowId changed:', expandedRowId);
  }, [expandedRowId]);

  // Function to handle creating dashboards for items with empty thresholds
  const handleCreateDashboards = async (item, e) => {
    // Stop event propagation
    if (e) {
      e.stopPropagation();
    }
    
    try {
      // Mark this item as updating
      setUpdating(prev => ({ ...prev, [item.id]: true }));
      
      const jobId = item.job_id;
      if (!jobId) {
        throw new Error("Job ID not found");
      }
      
      // First try to get the threshold ID associated with this job ID
      let thresholdId;
      try {
        console.log(`Fetching threshold ID for job ID: ${jobId}`);
        const thresholdResponse = await axios.get(`/api/threshold-ids?job_id=${jobId}`);
        
        if (thresholdResponse.data && Array.isArray(thresholdResponse.data) && 
            thresholdResponse.data.length > 0 && thresholdResponse.data[0].threshold_id) {
          thresholdId = thresholdResponse.data[0].threshold_id;
          console.log(`Found threshold ID: ${thresholdId} for job ID: ${jobId}`);
        } else if (thresholdResponse.data && thresholdResponse.data.threshold_id) {
          thresholdId = thresholdResponse.data.threshold_id;
          console.log(`Found threshold ID: ${thresholdId} for job ID: ${jobId}`);
        }
      } catch (error) {
        console.warn(`Failed to get threshold ID for job ID ${jobId}:`, error);
        // Continue with job ID as fallback
      }
      
      // Make API call to create default dashboards
      const dashboardCount = 3; // Default number of dashboards to create
      
      // If we found a threshold ID, use it; otherwise fall back to job ID
      const idToUse = thresholdId || jobId;
      console.log(`Creating ${dashboardCount} dashboards for ${thresholdId ? 'threshold' : 'job'} ID: ${idToUse}`);
      
      // Call the update_dashboards endpoint
      const response = await axios.put(
        `${API_URL}/update_dashboards/`, 
        null, 
        { 
          params: { 
            job_id: jobId,
            threshold_id: thresholdId, // Add threshold_id to the parameters
            num_dashboards: dashboardCount
          } 
        }
      );
      
      if (response.data) {
        console.log("FULL DASHBOARD RESPONSE:", JSON.stringify(response.data, null, 2));
        
        // Keep track of the item ID
        const itemId = item.id;
        
        // Close any expanded row
        setExpandedRowId(null);
        
        // Get the updated skills data from the response
        const skills_data = response.data.skills_data || {};
        const roles = response.data.roles || [];
        
        // Try multiple potential sources for threshold values
        let selection_threshold = null;
        let rejection_threshold = null;
        
        // Check for values using different potential property names
        if (response.data.selection_threshold !== undefined) {
          selection_threshold = response.data.selection_threshold;
          console.log("Found selection_threshold in response:", selection_threshold);
        } else if (response.data.matchScore !== undefined) {
          selection_threshold = response.data.matchScore;
          console.log("Found matchScore in response:", selection_threshold);
        } else if (response.data.data && response.data.data.selection_threshold !== undefined) {
          selection_threshold = response.data.data.selection_threshold;
          console.log("Found selection_threshold in response.data:", selection_threshold);
        }
        
        if (response.data.rejection_threshold !== undefined) {
          rejection_threshold = response.data.rejection_threshold;
          console.log("Found rejection_threshold in response:", rejection_threshold);
        } else if (response.data.relevanceScore !== undefined) {
          rejection_threshold = response.data.relevanceScore;
          console.log("Found relevanceScore in response:", rejection_threshold);
        } else if (response.data.data && response.data.data.rejection_threshold !== undefined) {
          rejection_threshold = response.data.data.rejection_threshold;
          console.log("Found rejection_threshold in response.data:", rejection_threshold);
        }
        
        // Default values if nothing is found
        selection_threshold = selection_threshold !== null ? selection_threshold : 0.75;
        rejection_threshold = rejection_threshold !== null ? rejection_threshold : 0.25;
        
        // Ensure values are in the correct format (between 0 and 1)
        if (selection_threshold > 1) selection_threshold = selection_threshold / 100.0;
        if (rejection_threshold > 1) rejection_threshold = rejection_threshold / 100.0;
        
        console.log("Final threshold values to be used:", {
          selection_threshold,
          rejection_threshold
        });
        
        // Update just this item in the list with the response data
        setJdList(currentList => {
          return currentList.map(jd => {
            if (jd.id === itemId) {
              // Create updated job item with the threshold values from the API
              const updatedItem = {
                ...jd,
                hasEmptyThreshold: false,
                status: 'Success',
                skills: skills_data,
                role: roles[0] || jd.role,
                threshold_id: thresholdId, // Store threshold_id in the list item
                matchScore: selection_threshold.toFixed(2), // Use the threshold from API
                relevanceScore: rejection_threshold.toFixed(2), // Use the threshold from API
                fullData: {
                  ...jd.fullData,
                  ...response.data,
                  roles: roles,
                  skills_data: skills_data,
                  threshold_id: thresholdId,
                  selection_threshold: selection_threshold,
                  rejection_threshold: rejection_threshold
                }
              };
              
              console.log("Updated item with thresholds:", {
                id: updatedItem.id,
                matchScore: updatedItem.matchScore,
                relevanceScore: updatedItem.relevanceScore
              });
              
              return updatedItem;
            }
            return jd;
          });
        });
        
        // Now fetch all analyses to ensure consistency
        await fetchAllJobAnalyses();
        
        // Don't auto-expand after update
        // We'll let the user decide to expand or not
        
        // Show success message
        alert("Dashboards created successfully! You can now modify them as needed.");
      }
    } catch (error) {
      console.error("Error creating dashboards:", error);
      setError(error.message || "Failed to create dashboards");
      
      // If error occurs, fall back to full refresh
      await fetchAllJobAnalyses();
    } finally {
      // Clear updating status
      setUpdating(prev => {
        const newUpdating = { ...prev };
        delete newUpdating[item.id];
        return newUpdating;
      });
    }
  };

  // Add debug logging for jdList changes
  useEffect(() => {
    console.log(`jdList state changed, now has ${jdList.length} items`);
  }, [jdList]);

  return (
    <div>
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        className="hidden"
        accept=".pdf,.docx,.txt,.json"
      />
      
      {/* Deletion Confirmation Alert */}
      {deleteConfirmation.show && (
        <div className={`fixed top-4 right-4 p-4 rounded-md shadow-lg z-50 ${
          deleteConfirmation.success ? 'bg-green-100 border border-green-400' : 'bg-red-100 border border-red-400'
        }`}>
          <div className="flex items-center">
            <div className={`mr-3 ${deleteConfirmation.success ? 'text-green-700' : 'text-red-700'}`}>
              {deleteConfirmation.success ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>
            <div className={deleteConfirmation.success ? 'text-green-700' : 'text-red-700'}>
              {deleteConfirmation.message}
            </div>
            <button 
              className="ml-4 text-gray-400 hover:text-gray-900"
              onClick={() => setDeleteConfirmation({ show: false, message: '', success: false })}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
      
      <div className="flex justify-between items-center mb-0 mt-8">
        <p style={{ fontSize: '18px', marginLeft: '4px' }}>Job Descriptions</p>
        <div className="flex gap-4">
          {['Create JD','Upload JD', 'Refresh Data'].map((label) => (
            <div key={label}>
              {label === 'Upload JD' ? (
                <button
                  onClick={triggerFileUpload}
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
              {paginatedList.map((item, index) => (
                <IsolatedRow
                  key={`isolated-${item.id || item.job_id || item.database_id || index}`}
                  item={item}
                  expandedRowId={expandedRowId}
                  onToggleExpand={handleRowToggle}
                  onDelete={deleteJobItem}
                  onSelect={handleRowSelect}
                  onModifyClick={handleModifyClick}
                  onViewDetails={fetchJobDetails}
                  onCreateDashboards={handleCreateDashboards}
                  editingThresholds={editingThresholds}
                  editableThresholds={editableThresholds}
                  handleThresholdChange={handleThresholdChange}
                  selectedRows={selectedRows}
                  updating={updating}
                />
              ))}
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
          jobId={selectedJD.job_id}
          thresholdId={selectedJD.id}
          onClose={handleDrawerClose}
          viewOnly={true}
        />
      )}
      
      {showJobDetails && (
        <JobDetailsCard 
          jobDetails={selectedJobDetails} 
          loading={jobDetailsLoading} 
          onClose={handleCloseJobDetails} 
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
          onSubmit={handleJobCreation}
          onClose={() => setShowCreateJDModal(false)}
        />
      )}
    </div>
  );
};

export default JDTab;