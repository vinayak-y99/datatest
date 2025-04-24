import React, { useState } from 'react';
import { FaUpload, FaEyeSlash, FaTrash, FaSortUp, FaSortDown, FaSort, FaRobot } from 'react-icons/fa';
import MovableResizablePopup from './MovableResizablePopup';
import CS from './page';
import DrawerNavigation from './DrawerNavigation';

const columnHeaders = {
  rollName: 'Candidate Name',
  role: 'Role',
  fileName: 'Resume File',
  uploadDate: 'Upload Date',
  selectionScore: 'Selection Score',
  rejectionScore: 'Rejection Score',
  threshold: 'Threshold',
  interview: 'Interview'
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
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [searchTerm, setSearchTerm] = useState('');

  const recordsPerPage = 10;

  const buttonConfig = {
    'Upload Resume': { icon: <FaUpload className="mr-2 text-blue-500" />, color: 'blue' },
    'ATS': { icon: <FaRobot className="mr-2 text-green-500" />, color: 'green' }
  };

  const handleFileUpload = (buttonType) => (e) => {
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
          const newFile = {
            id: Date.now() + Math.random(),
            rollName: `Candidate ${resumeList.length + 1}`,
            role: 'Software Engineer',
            position: 'Full-time',
            fileName: file.name,
            uploadDate: new Date().toLocaleDateString(),
            interview: 'Pending',
            threshold: 'View',
            selectionScore: (Math.random() * 100).toFixed(2),
            rejectionScore: (Math.random() * 100).toFixed(2),
            buttonType: buttonType,
            file: file,
          };
          setResumeList(prev => [...prev, newFile]);
          setShowDashboard(true);
        } else {
          alert("Please upload only PDF, DOCX, TXT, or JSON files.");
        }
      });
    }
  };

  const handleATSClick = () => {
    console.log('ATS button clicked');
  };

  const handleDelete = (id) => {
    const updatedList = resumeList.filter(item => item.id !== id);
    setResumeList(updatedList);
    if (activeDisplayId === id) setActiveDisplayId(null);
    setDisplayStatus(prev => {
      const newStatus = { ...prev };
      delete newStatus[id];
      return newStatus;
    });
    setSelectedRows(prev => {
      const newSelected = new Set(prev);
      newSelected.delete(id);
      return newSelected;
    });
  };

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

  const handleViewClick = (item) => {
    setSelectedResume(item);
    if (setSelectedResumeForSidebar) {
      setSelectedResumeForSidebar(item);
    }
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
      if (setSelectedResumeForSidebar) {
        setSelectedResumeForSidebar(item);
      }
      setIsPopupOpen(true);
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

  const handleSort = (key) => {
    if (key === 'threshold' || key === 'interview') return;
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const sortedList = React.useMemo(() => {
    let sortableList = [...resumeList];
    if (sortConfig.key) {
      sortableList.sort((a, b) => {
        const aValue = typeof a[sortConfig.key] === 'string' ? a[sortConfig.key].toLowerCase() : a[sortConfig.key];
        const bValue = typeof b[sortConfig.key] === 'string' ? b[sortConfig.key].toLowerCase() : b[sortConfig.key];
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableList;
  }, [resumeList, sortConfig]);

  const filteredList = sortedList.filter(item =>
    Object.values(item).some(value =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const totalPages = Math.ceil(filteredList.length / recordsPerPage);
  const paginatedList = filteredList.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  const getDisplayButtonText = (itemId) => {
    if (activeDisplayId === itemId) {
      return 'Hide';
    }
    return displayStatus[itemId] || 'Start';
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return <FaSort className="ml-2 text-gray-400" />;
    }
    return sortConfig.direction === 'asc' ? 
      <FaSortUp className="ml-2 text-blue-500" /> : 
      <FaSortDown className="ml-2 text-blue-500" />;
  };

  const renderDashboard = () => (
    <div className="bg-white rounded-lg shadow-md p-4 mt-2">
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search resumes..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
              {Object.entries(columnHeaders).map(([key, label]) => (
                <th 
                  key={key}
                  className={`px-4 py-2 text-left text-xs font-medium uppercase tracking-wider ${
                    key === 'selectionScore' ? 'bg-green-100' : 
                    key === 'rejectionScore' ? 'bg-red-100' : 
                    sortConfig.key === key ? 'bg-blue-100 text-blue-700' : 'text-gray-500'
                  } ${key !== 'threshold' && key !== 'interview' ? 'cursor-pointer' : ''}`}
                  onClick={() => handleSort(key)}
                >
                  <div className="flex items-center">
                    {label}
                    {(key !== 'threshold' && key !== 'interview') && getSortIcon(key)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedList.map((item) => (
              <React.Fragment key={item.id}>
                <tr className={selectedRows.has(item.id) ? 'bg-gray-100' : ''}>
                  <td className="px-4 py-2 whitespace-normal text-sm text-gray-900">
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
                  <td className="px-4 py-2 whitespace-normal text-sm text-gray-900 flex items-center">
                    <img
                      src={'../user.svg'}
                      alt={item.rollName}
                      className="w-8 h-8 rounded-full mr-2"
                    />
                    {item.rollName}
                  </td>
                  <td className="px-4 py-2 whitespace-normal text-sm text-gray-900">{item.role}</td>
                  <td className="px-4 py-2 whitespace-normal text-sm text-gray-900">{item.fileName}</td>
                  <td className="px-4 py-2 whitespace-normal text-sm text-gray-900">{item.uploadDate}</td>
                  <td className="px-4 py-2 whitespace-normal text-sm text-gray-900 bg-green-50">
                    <span className="text-green-600 font-medium">
                      {item.selectionScore}
                    </span>
                  </td>
                  <td className="px-4 py-2 whitespace-normal text-sm text-gray-900 bg-red-50">
                    <span className="text-red-600 font-medium">
                      {item.rejectionScore}
                    </span>
                  </td>
                  <td className="px-4 py-2 whitespace-normal text-sm text-gray-900">
                    <button
                      onClick={() => handleViewClick(item)}
                      className="text-blue-500 hover:underline"
                    >
                      {item.threshold}
                    </button>
                  </td>
                  <td className="px-4 py-2 whitespace-normal text-sm text-gray-900">
                    <button
                      onClick={() => handleDisplayClick(item)}
                      className={`px-2 py-1 rounded ${activeDisplayId === item.id ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'} hover:underline`}
                    >
                      {getDisplayButtonText(item.id)}
                    </button>
                  </td>
                </tr>
                {activeDisplayId === item.id && (
                  <tr>
                    <td colSpan="9" className="px-4 py-2">
                      <div className="bg-white rounded-lg shadow-md p-4">
                        <div className="flex justify-end mb-2">
                          <button 
                            onClick={() => handleCloseDisplay(item.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <FaTrash size={14} />
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
          Showing {paginatedList.length} of {filteredList.length} records
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-0">
        <p style={{ fontSize: '18px', marginLeft: '4px' }}>Resume</p>
        <div className="flex gap-4">
          {['Upload Resume', 'ATS'].map((label) => (
            <div key={label}>
              {label === 'Upload Resume' ? (
                <>
                  <button
                    onClick={() => document.getElementById(`resumeFile${label.replace(' ', '')}`).click()}
                    className="p-2 text-gray-700 rounded hover:bg-gray-100 flex items-center"
                  >
                    {buttonConfig[label].icon}
                    {label}
                  </button>
                  <input
                    type="file"
                    id={`resumeFile${label.replace(' ', '')}`}
                    className="hidden"
                    onChange={handleFileUpload(label)}
                    multiple
                  />
                </>
              ) : (
                <button
                  onClick={handleATSClick}
                  className="p-2 text-gray-700 rounded hover:bg-gray-100 flex items-center"
                >
                  {buttonConfig[label].icon}
                  {label}
                </button>
              )}
            </div>
          ))}
          {resumeList.length > 0 && (
            <button
              onClick={() => setShowDashboard(false)}
              className="p-2 text-gray-700 rounded hover:bg-gray-100 flex items-center"
            >
              <FaEyeSlash className="mr-2 text-green-500" />
              Hide Dashboard
            </button>
          )}
        </div>
      </div>

      {showDashboard && resumeList.length > 0 && renderDashboard()}

      {isPopupOpen && selectedResume && (
        <MovableResizablePopup 
          resumeId={selectedResume.id}
          onClose={handlePopupClose}
        >
          {/* <div>
            <h3>{selectedResume.rollName}</h3>
            <p>Role: {selectedResume.role}</p>
            <p>File: {selectedResume.fileName}</p>
            <p>Upload Date: {selectedResume.uploadDate}</p>
            <p>Selection Score: {selectedResume.selectionScore}</p>
            <p>Rejection Score: {selectedResume.rejectionScore}</p>
          </div> */}
        </MovableResizablePopup>
      )}

      {isDrawerOpen && selectedResume && (
        <DrawerNavigation 
          selectedResume={selectedResume}
          onClose={handleDrawerClose}
        />
      )}
    </div>
  );
};

export default ResumeTab;