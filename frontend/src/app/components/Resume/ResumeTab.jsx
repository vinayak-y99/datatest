import React, { useState, useRef } from 'react';
import { FaEyeSlash, FaTrash, FaRobot, FaChevronLeft, FaChevronRight, FaSearch, FaFilter, FaCalendarAlt, FaPlus } from 'react-icons/fa';
import MovableResizablePopup from './MovableResizablePopup';
import CS from './page';
import DrawerNavigation from './DrawerNavigation';

const columnHeaders = {
  jdId: 'JD ID',
  resumeId: 'Resume ID / JD ID',
  rollName: 'Candidate Name',
  role: 'Role',
  uploadDate: 'Upload Date',
  scheduling: 'Scheduling',
  interview: 'Interview',
  actions: 'Actions'
};

const ResumeTab = ({ resumeList, setResumeList, setSelectedResumeForSidebar }) => {
  const [showDashboard, setShowDashboard] = useState(true);
  const [files, setFiles] = useState({ upload: null });
  const [selectedResume, setSelectedResume] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeDisplayId, setActiveDisplayId] = useState(null);
  const [displayStatus, setDisplayStatus] = useState({});
  const [selectedResumeRows, setSelectedResumeRows] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [hoveredRow, setHoveredRow] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    role: '',
    jdId: '',
    fromDate: '',
    toDate: '',
    selectionScoreMin: '',
    selectionScoreMax: '',
    rejectionScoreMin: '',
    rejectionScoreMax: ''
  });
  const [isScheduleFormOpen, setIsScheduleFormOpen] = useState(false);
  const [displayButtonText, setDisplayButtonText] = useState({});
  const [jobDescriptions, setJobDescriptions] = useState([]);
  const [selectedJd, setSelectedJd] = useState(null);
  const [expandedJdIds, setExpandedJdIds] = useState(new Set());
  const idCounter = useRef(0);
  const jdCounter = useRef(1000);
  const fileInputRef = useRef(null);

  const generateResumeId = () => {
    idCounter.current += 1;
    return `R${(idCounter.current % 1000000).toString().padStart(5, '0')}`.slice(0, 6);
  };

  const generateJdId = () => {
    jdCounter.current += 1;
    return `JD${jdCounter.current}`;
  };

  const statusOptions = ['Active', 'On Hold', 'Rejected', 'Hired', 'Pending'];
  const recordsPerPage = 10;

  const buttonConfig = {
    'Upload JD': { color: 'blue' },
    'ATX': { color: 'purple' }
  };

  const handleJdUpload = (e) => {
    const selectedFiles = e.target.files;
    if (selectedFiles.length > 0) {
      Array.from(selectedFiles).forEach(file => {
        const validFileTypes = [
          'application/pdf',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/plain',
          'application/json'
        ];

        if (validFileTypes.includes(file.type)) {
          const jdId = generateJdId();
          const newJd = {
            id: Date.now() + idCounter.current,
            jdId: jdId,
            title: `Job ${jdCounter.current - 1000}`,
            role: 'Software Engineer',
            uploadDate: new Date().toLocaleDateString(),
            uploadDateRaw: new Date(),
            selectionScore: (Math.random() * 100).toFixed(2),
            rejectionScore: (Math.random() * 100).toFixed(2),
            file: file,
          };
          setJobDescriptions(prev => [...prev, newJd]);
        } else {
          alert("Please upload only PDF, DOCX, TXT, or JSON files.");
        }
      });
    }
  };

  const handleAddResumesClick = (jd) => {
    setSelectedJd(jd);
    fileInputRef.current.click();
  };

  const handleResumeUpload = (e) => {
    const selectedFiles = e.target.files;
    if (selectedFiles.length > 0 && selectedJd) {
      Array.from(selectedFiles).forEach(file => {
        const validFileTypes = [
          'application/pdf',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/plain',
          'application/json'
        ];

        if (validFileTypes.includes(file.type)) {
          const newFile = {
            id: Date.now() + idCounter.current,
            jdId: selectedJd.jdId,
            resumeId: generateResumeId(),
            rollName: `Candidate ${resumeList.length + 1}`,
            email: `candidate${resumeList.length + 1}@example.com`,
            status: statusOptions[Math.floor(Math.random() * statusOptions.length)],
            role: selectedJd.role,
            position: 'Full-time',
            uploadDate: new Date().toLocaleDateString(),
            uploadDateRaw: new Date(),
            file: file,
          };
          setResumeList(prev => [...prev, newFile]);
          setDisplayButtonText(prev => ({ ...prev, [newFile.id]: 'Start' }));
          setExpandedJdIds(prev => new Set(prev).add(selectedJd.jdId));
        } else {
          alert("Please upload only PDF, DOCX, TXT, or JSON files.");
        }
      });
    }
  };

  const handleDeleteResume = (id) => {
    const updatedList = resumeList.filter(item => item.id !== id);
    setResumeList(updatedList);
    if (activeDisplayId === id) setActiveDisplayId(null);
    setDisplayStatus(prev => {
      const newStatus = { ...prev };
      delete newStatus[id];
      return newStatus;
    });
    setSelectedResumeRows(prev => {
      const newSelected = new Set(prev);
      newSelected.delete(id);
      return newSelected;
    });
    setDisplayButtonText(prev => {
      const newText = { ...prev };
      delete newText[id];
      return newText;
    });
  };

  const handleDeleteJd = (id) => {
    const updatedJds = jobDescriptions.filter(jd => jd.id !== id);
    setJobDescriptions(updatedJds);
    setResumeList(prev => prev.filter(resume => resume.jdId !== jobDescriptions.find(jd => jd.id === id)?.jdId));
    setExpandedJdIds(prev => {
      const newExpanded = new Set(prev);
      newExpanded.delete(jobDescriptions.find(jd => jd.id === id)?.jdId);
      return newExpanded;
    });
  };

  const handleResumeRowSelect = (id) => {
    setSelectedResumeRows(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(id)) {
        newSelected.delete(id);
      } else {
        newSelected.add(id);
      }
      return newSelected;
    });
  };

  const handleSelectAllResumeRows = (list) => {
    const allSelected = list.every(item => selectedResumeRows.has(item.id));
    setSelectedResumeRows(prev => {
      const newSelected = new Set(prev);
      if (allSelected) {
        list.forEach(item => newSelected.delete(item.id));
      } else {
        list.forEach(item => newSelected.add(item.id));
      }
      return newSelected;
    });
  };

  const handleViewClick = (item) => {
    setSelectedResume(item);
    if (setSelectedResumeForSidebar) setSelectedResumeForSidebar(item);
    setIsDrawerOpen(true);
  };

  const handleDisplayClick = (item) => {
    if (activeDisplayId === item.id) {
      setActiveDisplayId(null);
      setIsPopupOpen(false);
      setSelectedResume(null);
    } else {
      setActiveDisplayId(item.id);
      setDisplayStatus(prev => ({
        ...prev,
        [item.id]: prev[item.id] === 'Start' || !prev[item.id] ? 'Continue' : 'Start'
      }));
      setSelectedResume(item);
      if (setSelectedResumeForSidebar) setSelectedResumeForSidebar(item);
      setIsPopupOpen(true);
      setDisplayButtonText(prev => ({
        ...prev,
        [item.id]: 'Continue'
      }));
    }
  };

  const handleCloseDisplay = (id) => {
    setActiveDisplayId(null);
    setIsPopupOpen(false);
    setSelectedResume(null);
  };

  const handlePopupClose = () => {
    setIsPopupOpen(false);
    setSelectedResume(null);
    setActiveDisplayId(null);
  };

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
    setSelectedResume(null);
  };

  const handleSortUploadDate = () => {
    const newSortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    setSortOrder(newSortOrder);
    setCurrentPage(1);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const toggleJdExpansion = (jdId) => {
    setExpandedJdIds(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(jdId)) {
        newExpanded.delete(jdId);
      } else {
        newExpanded.add(jdId);
      }
      return newExpanded;
    });
  };

  const filteredList = resumeList.filter(item => {
    const matchesSearch = Object.values(item).some(value =>
      typeof value === 'string' && value.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const matchesRole = !filters.role || (item.role && item.role.toLowerCase().includes(filters.role.toLowerCase()));
    const matchesJdId = !filters.jdId || (item.jdId && item.jdId.includes(filters.jdId));
    
    let matchesDateRange = true;
    if (filters.fromDate && filters.toDate) {
      const itemDate = new Date(item.uploadDateRaw);
      const fromDate = new Date(filters.fromDate);
      const toDate = new Date(filters.toDate);
      toDate.setHours(23, 59, 59, 999);
      matchesDateRange = itemDate >= fromDate && itemDate <= toDate;
    } else if (filters.fromDate) {
      const itemDate = new Date(item.uploadDateRaw);
      const fromDate = new Date(filters.fromDate);
      matchesDateRange = itemDate >= fromDate;
    } else if (filters.toDate) {
      const itemDate = new Date(item.uploadDateRaw);
      const toDate = new Date(filters.toDate);
      toDate.setHours(23, 59, 59, 999);
      matchesDateRange = itemDate <= toDate;
    }
    
    return matchesSearch && matchesRole && matchesJdId && matchesDateRange;
  });

  const filteredJds = jobDescriptions.filter(jd => {
    const selectionScore = parseFloat(jd.selectionScore);
    const rejectionScore = parseFloat(jd.rejectionScore);
    
    const matchesSelectionScore = 
      (!filters.selectionScoreMin || selectionScore >= parseFloat(filters.selectionScoreMin)) &&
      (!filters.selectionScoreMax || selectionScore <= parseFloat(filters.selectionScoreMax));
    
    const matchesRejectionScore = 
      (!filters.rejectionScoreMin || rejectionScore >= parseFloat(filters.rejectionScoreMin)) &&
      (!filters.rejectionScoreMax || rejectionScore <= parseFloat(filters.rejectionScoreMax));
    
    return matchesSelectionScore && matchesRejectionScore;
  }).sort((a, b) => {
    const dateA = new Date(a.uploadDateRaw);
    const dateB = new Date(b.uploadDateRaw);
    return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
  });

  const totalPages = Math.ceil(filteredList.length / recordsPerPage);
  const paginatedList = filteredList.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  const handleScheduleClick = (item) => {
    setSelectedResume(item);
    setIsScheduleFormOpen(true);
  };

  const handleScheduleSubmit = (e) => {
    e.preventDefault();
    console.log('Scheduling form submitted for', selectedResume.rollName);
    setIsScheduleFormOpen(false);
  };

  const handleScheduleClose = () => {
    setIsScheduleFormOpen(false);
    setSelectedResume(null);
  };

  const renderHeader = () => (
    <div className="flex justify-between items-center mb-4 p-4 bg-white shadow-md">
      <h2 className="text-xl font-bold text-gray-800">Interview Management</h2>
      <div className="flex space-x-2">
        <label className="relative inline-flex cursor-pointer">
          <input
            type="file"
            accept=".pdf,.docx,.txt,.json"
            onChange={handleJdUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            multiple
          />
          <button
            className={`px-4 py-2 bg-${buttonConfig['Upload JD'].color}-500 text-white rounded-md hover:bg-${buttonConfig['Upload JD'].color}-600 transition duration-200 flex items-center`}
          >
            <FaPlus className="mr-2" />
            Upload JD
          </button>
        </label>
        <button
          className={`px-4 py-2 bg-${buttonConfig['ATX'].color}-500 text-white rounded-md hover:bg-${buttonConfig['ATX'].color}-600 transition duration-200 flex items-center`}
        >
          ATX
        </button>
        {jobDescriptions.length > 0 && (
          <button
            onClick={() => setShowDashboard(!showDashboard)}
            className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-200"
          >
            {showDashboard ? 'Hide Dashboard' : 'Show Dashboard'}
          </button>
        )}
      </div>
    </div>
  );

  const renderDashboard = () => {
    if (!showDashboard || jobDescriptions.length === 0) {
      return null; // Simply return null to show nothing when no JDs are uploaded
    }

    return (
      <div className="bg-white rounded-lg shadow-md p-4 mt-4 w-full">
        <div className="flex flex-col space-y-4 mb-4">
          <div className="flex justify-between items-center flex-wrap gap-2">
            <div className="flex items-center space-x-2 w-full md:w-auto">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search resumes..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors duration-150 flex items-center shadow-sm"
              >
                <FaFilter className="mr-2 text-blue-500" />
                {isFilterOpen ? 'Hide Filters' : 'Show Filters'}
              </button>
            </div>
          </div>

          {isFilterOpen && (
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
              <h3 className="text-lg font-medium text-gray-800 mb-3">Filters</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">JD ID</label>
                  <input
                    type="text"
                    name="jdId"
                    value={filters.jdId}
                    onChange={handleFilterChange}
                    placeholder="Filter by JD ID"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <input
                    type="text"
                    name="role"
                    value={filters.role}
                    onChange={handleFilterChange}
                    placeholder="Filter by role"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                  <input
                    type="date"
                    name="fromDate"
                    value={filters.fromDate}
                    onChange={handleFilterChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                  <input
                    type="date"
                    name="toDate"
                    value={filters.toDate}
                    onChange={handleFilterChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Selection Score Min</label>
                  <input
                    type="number"
                    name="selectionScoreMin"
                    value={filters.selectionScoreMin}
                    onChange={handleFilterChange}
                    placeholder="Min Selection Score"
                    min="0"
                    max="100"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Selection Score Max</label>
                  <input
                    type="number"
                    name="selectionScoreMax"
                    value={filters.selectionScoreMax}
                    onChange={handleFilterChange}
                    placeholder="Max Selection Score"
                    min="0"
                    max="100"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rejection Score Min</label>
                  <input
                    type="number"
                    name="rejectionScoreMin"
                    value={filters.rejectionScoreMin}
                    onChange={handleFilterChange}
                    placeholder="Min Rejection Score"
                    min="0"
                    max="100"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rejection Score Max</label>
                  <input
                    type="number"
                    name="rejectionScoreMax"
                    value={filters.rejectionScoreMax}
                    onChange={handleFilterChange}
                    placeholder="Max Rejection Score"
                    min="0"
                    max="100"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="overflow-x-auto w-full">
          <table className="min-w-full table-auto border-collapse">
            <thead className="bg-gray-50">
              <tr>
                {/* Removed the "select all" checkbox column */}
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">JD ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700" onClick={handleSortUploadDate}>Upload Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider bg-green-50 text-green-700">Selection Score</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider bg-red-50 text-red-700">Rejection Score</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Upload Resume</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredJds.map((jd) => (
                <React.Fragment key={jd.id}>
                  <tr 
                    className={`
                      ${hoveredRow === jd.id ? 'bg-gray-50' : ''}
                      hover:bg-gray-50 transition-colors duration-150 cursor-pointer
                    `}
                    onMouseEnter={() => setHoveredRow(jd.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                    onClick={() => toggleJdExpansion(jd.jdId)}
                  >
                    {/* Removed the individual checkbox column */}
                    <td className="px-4 py-4 whitespace-normal text-sm text-gray-900">{jd.jdId}</td>
                    <td className="px-4 py-4 whitespace-normal text-sm text-gray-900">{jd.role}</td>
                    <td className="px-4 py-4 whitespace-normal text-sm text-gray-900">{jd.uploadDate}</td>
                    <td className="px-4 py-4 whitespace-normal text-sm bg-green-50 text-green-700">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-green-600 h-2.5 rounded-full" 
                            style={{ width: `${Math.min(parseFloat(jd.selectionScore), 100)}%` }}
                          ></div>
                        </div>
                        <span className="ml-2">{jd.selectionScore}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-normal text-sm bg-red-50 text-red-700">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-red-600 h-2.5 rounded-full" 
                            style={{ width: `${Math.min(parseFloat(jd.rejectionScore), 100)}%` }}
                          ></div>
                        </div>
                        <span className="ml-2">{jd.rejectionScore}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-normal text-sm text-gray-900">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddResumesClick(jd);
                        }}
                        className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors duration-150 flex items-center"
                      >
                        <FaPlus className="mr-1" size={12} />
                        Add Resumes
                      </button>
                    </td>
                    <td className="px-4 py-4 whitespace-normal text-sm text-gray-900">
                      <div className="flex space-x-2">
                        {filteredList.filter(item => item.jdId === jd.jdId).length > 0 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleJdExpansion(jd.jdId);
                            }}
                            className="px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors duration-150"
                          >
                            {expandedJdIds.has(jd.jdId) ? 'Hide' : 'Show'}
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteJd(jd.id);
                          }}
                          className="p-1 text-red-600 hover:text-red-800"
                        >
                          <FaTrash size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedJdIds.has(jd.jdId) && filteredList.filter(item => item.jdId === jd.jdId).length > 0 && (
                    <tr>
                      <td colSpan="7" className="px-4 py-4">
                        <div className="bg-gray-50 rounded-lg p-4">
                          <table className="min-w-full table-auto border-collapse">
                            <thead className="bg-gray-100">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  <input
                                    type="checkbox"
                                    checked={filteredList.filter(item => item.jdId === jd.jdId).length > 0 && 
                                      filteredList.filter(item => item.jdId === jd.jdId).every(item => selectedResumeRows.has(item.id))}
                                    onChange={() => handleSelectAllResumeRows(filteredList.filter(item => item.jdId === jd.jdId))}
                                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                                  />
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resume ID / JD ID</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Candidate Name</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Upload Date</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scheduling</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Interview</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {filteredList.filter(item => item.jdId === jd.jdId).map((item) => (
                                <React.Fragment key={`${item.id}-${Math.random().toString(36).substr(2, 9)}`}>
                                  <tr 
                                    className={`
                                      ${selectedResumeRows.has(item.id) ? 'bg-blue-50' : ''}
                                      ${hoveredRow === item.id ? 'bg-gray-50' : ''}
                                      hover:bg-gray-50 transition-colors duration-150
                                    `}
                                    onMouseEnter={() => setHoveredRow(item.id)}
                                    onMouseLeave={() => setHoveredRow(null)}
                                  >
                                    <td className="px-4 py-4 whitespace-normal text-sm text-gray-900">
                                      <input
                                        type="checkbox"
                                        checked={selectedResumeRows.has(item.id)}
                                        onChange={() => handleResumeRowSelect(item.id)}
                                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                                      />
                                    </td>
                                    <td className="px-4 py-4 whitespace-normal text-sm text-gray-900">
                                      {item.resumeId} / {item.jdId}
                                    </td>
                                    <td className="px-4 py-4 whitespace-normal text-sm text-gray-900">
                                      <div className="flex items-center">
                                        <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center text-gray-500 mr-3">
                                          {item.rollName.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                          <div className="font-medium">{item.rollName}</div>
                                          <div className="text-sm text-gray-500">{item.email}</div>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-4 py-4 whitespace-normal text-sm text-gray-900">{item.role}</td>
                                    <td className="px-4 py-4 whitespace-normal text-sm text-gray-900">{item.uploadDate}</td>
                                    <td className="px-4 py-4 whitespace-normal text-sm text-gray-900">
                                      <button 
                                        onClick={() => handleScheduleClick(item)}
                                        className="px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors duration-150"
                                      >
                                        Start Scheduling
                                      </button>
                                    </td>
                                    <td className="px-4 py-4 whitespace-normal text-sm text-gray-900">
                                      <div className="flex space-x-2">
                                        <button
                                          onClick={() => handleViewClick(item)}
                                          className="px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors duration-150"
                                        >
                                          View
                                        </button>
                                        <button
                                          onClick={() => handleDisplayClick(item)}
                                          className={`px-2 py-1 rounded ${
                                            activeDisplayId === item.id 
                                              ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                                          } transition-colors duration-150`}
                                        >
                                          {displayButtonText[item.id] || 'Start'}
                                        </button>
                                      </div>
                                    </td>
                                    <td className="px-4 py-4 whitespace-normal text-sm text-gray-900">
                                      <button
                                        onClick={() => handleDeleteResume(item.id)}
                                        className="p-1 text-red-600 hover:text-red-800"
                                      >
                                        <FaTrash size={12} />
                                      </button>
                                    </td>
                                  </tr>
                                  {activeDisplayId === item.id && (
                                    <tr>
                                      <td colSpan="8" className="px-4 py-4">
                                        <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
                                          <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-lg font-medium text-gray-900">
                                              Resume Analysis: {item.rollName}
                                            </h3>
                                            <button 
                                              onClick={() => handleCloseDisplay(item.id)}
                                              className="text-gray-500 hover:text-red-700 transition-colors duration-150"
                                            >
                                              <FaEyeSlash size={14} />
                                            </button>
                                          </div>
                                          <CS 
                                            resumeId={item.id} 
                                            selectedFile={item.file} 
                                            resumeData={item}
                                            onClose={() => handleCloseDisplay(item.id)} 
                                          />
                                        </div>
                                      </td>
                                    </tr>
                                  )}
                                </React.Fragment>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col w-full h-full">
      {renderHeader()}
      <div className="p-4 flex-grow overflow-y-auto">
        {renderDashboard()}
        <input
          type="file"
          accept=".pdf,.docx,.txt,.json"
          onChange={handleResumeUpload}
          ref={fileInputRef}
          className="hidden"
          multiple
        />
      </div>

      {isScheduleFormOpen && selectedResume && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-800 mb-4">
              Schedule Interview for {selectedResume.rollName}
            </h3>
            <form onSubmit={handleScheduleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Date</label>
                <input
                  type="date"
                  className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Time</label>
                <input
                  type="time"
                  className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Interviewer</label>
                <input
                  type="text"
                  className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter interviewer name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Interview Type</label>
                <select
                  className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select interview type</option>
                  <option value="technical">Technical</option>
                  <option value="hr">HR</option>
                  <option value="cultural">Cultural Fit</option>
                  <option value="manager">Manager</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Location</label>
                <input
                  type="text"
                  className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter interview location"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Notes</label>
                <textarea
                  className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add any additional notes"
                  rows="3"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={handleScheduleClose}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-200"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {isPopupOpen && selectedResume && (
        <MovableResizablePopup
          onClose={handlePopupClose}
          title={`Resume Analysis: ${selectedResume.rollName}`}
          initialWidth={800}
          initialHeight={600}
        >
          <CS 
            resumeId={selectedResume.id} 
            selectedFile={selectedResume.file} 
            resumeData={selectedResume}
            onClose={handlePopupClose} 
          />
        </MovableResizablePopup>
      )}
      
      {isDrawerOpen && selectedResume && (
        <DrawerNavigation
          isOpen={isDrawerOpen}
          selectedResume={selectedResume}
          onClose={handleDrawerClose}
        />
      )}
    </div>
  );
};

export default ResumeTab;