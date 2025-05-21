import React, { useState } from 'react';
import { FaUpload, FaEyeSlash, FaTrash, FaRobot, FaEye, FaChevronLeft, FaChevronRight, FaSearch } from 'react-icons/fa';
import MovableResizablePopup from './MovableResizablePopup';
import CS from './page';
import DrawerNavigationJD from './DrawerNavigation'; // Note: Renamed to match the sidebar component

const columnHeaders = {
  role: 'Role',
  // position: 'Position',
  fileName: 'JD File',
  uploadDate: 'Upload Date',
  matchScore: 'Selection Score',
  relevanceScore: 'Rejection Score',
  threshold: 'Threshold',
  status: 'Status'
};

const JDTab = ({ jdList, setJdList, setSelectedJDForSidebar }) => {
  const [showDashboard, setShowDashboard] = useState(true);
  const [files, setFiles] = useState({ upload: null });
  const [selectedJD, setSelectedJD] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeDisplayId, setActiveDisplayId] = useState(null);
  const [displayStatus, setDisplayStatus] = useState({});
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [hoveredRow, setHoveredRow] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');

  const recordsPerPage = 10;

  const buttonConfig = {
    'Upload JD': { icon: <FaUpload className="mr-2 text-blue-500" />, color: 'blue' },
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
            role: 'Software Engineer',
            // position: 'Full-time',
            fileName: file.name,
            uploadDate: new Date().toLocaleDateString(),
            uploadDateRaw: new Date(),
            status: 'Pending',
            threshold: 'View',
            matchScore: (Math.random() * 100).toFixed(2),
            relevanceScore: (Math.random() * 100).toFixed(2),
            buttonType: buttonType,
            file: file,
          };
          setJdList(prev => [...prev, newFile]);
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
    const updatedList = jdList.filter(item => item.id !== id);
    setJdList(updatedList);
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

  const handleBulkDelete = () => {
    if (selectedRows.size === 0) return;
    const updatedList = jdList.filter(item => !selectedRows.has(item.id));
    setJdList(updatedList);
    setSelectedRows(new Set());
    
    if (activeDisplayId && selectedRows.has(activeDisplayId)) {
      setActiveDisplayId(null);
      setIsPopupOpen(false);
      setSelectedJD(null);
    }
    
    const newDisplayStatus = { ...displayStatus };
    selectedRows.forEach(id => delete newDisplayStatus[id]);
    setDisplayStatus(newDisplayStatus);
  };

  const handleRowSelect = (id) => {
    setSelectedRows(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(id)) newSelected.delete(id);
      else newSelected.add(id);
      return newSelected;
    });
  };

  const handleSelectAllRows = () => {
    if (selectedRows.size === paginatedList.length) {
      setSelectedRows(new Set());
    } else {
      const newSelectedRows = new Set(selectedRows);
      paginatedList.forEach(item => newSelectedRows.add(item.id));
      setSelectedRows(newSelectedRows);
    }
  };

  const handleViewClick = (item) => {
    setSelectedJD(item);
    if (setSelectedJDForSidebar) setSelectedJDForSidebar(item);
    setIsDrawerOpen(true); // This will now open the sidebar
  };

  const handleDisplayClick = (item) => {
    if (activeDisplayId === item.id) {
      setActiveDisplayId(null);
      setIsPopupOpen(false);
      setSelectedJD(null);
    } else {
      setActiveDisplayId(item.id);
      setDisplayStatus(prev => ({
        ...prev,
        [item.id]: prev[item.id] === 'Start' || !prev[item.id] ? 'Continue' : 'Start'
      }));
      setSelectedJD(item);
      if (setSelectedJDForSidebar) setSelectedJDForSidebar(item);
      setIsPopupOpen(true);
    }
  };

  const handleCloseDisplay = (id) => {
    setActiveDisplayId(null);
    setIsPopupOpen(false);
    setSelectedJD(null);
  };

  const handlePopupClose = () => {
    setIsPopupOpen(false);
    setSelectedJD(null);
    setActiveDisplayId(null);
  };

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
    setSelectedJD(null);
  };

  const handleSortUploadDate = () => {
    const newSortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    setSortOrder(newSortOrder);
    setCurrentPage(1);
  };

  const filteredList = jdList.filter(item =>
    Object.values(item).some(value =>
      typeof value === 'string' && value.toLowerCase().includes(searchTerm.toLowerCase())
    )
  ).sort((a, b) => {
    const dateA = new Date(a.uploadDateRaw);
    const dateB = new Date(b.uploadDateRaw);
    return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
  });

  const totalPages = Math.ceil(filteredList.length / recordsPerPage);
  const paginatedList = filteredList.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  const getDisplayButtonText = (itemId) => {
    if (activeDisplayId === itemId) return 'Hide';
    return displayStatus[itemId] || 'Start';
  };

  const renderDashboard = () => (
    <div className="bg-white rounded-lg shadow-md p-4 mt-2 w-full">
      <div className="flex justify-between mb-4">
        <div className="relative w-full max-w-md">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <FaSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search JDs..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        {selectedRows.size > 0 && (
          <button
            onClick={handleBulkDelete}
            className="flex items-center px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition duration-200"
          >
            <FaTrash className="mr-2" />
            Delete Selected ({selectedRows.size})
          </button>
        )}
      </div>
      
      <div className="overflow-x-auto w-full">
        <table className="min-w-full table-auto border-collapse">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={paginatedList.length > 0 && selectedRows.size === paginatedList.length}
                    onChange={handleSelectAllRows}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                  <span className="ml-2">Actions</span>
                </div>
              </th>
              {Object.entries(columnHeaders).map(([key, label]) => (
                <th 
                  key={key}
                  className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    key === 'matchScore' ? 'bg-green-50 text-green-700' : 
                    key === 'relevanceScore' ? 'bg-red-50 text-red-700' : 
                    'text-gray-500'
                  } ${key === 'uploadDate' ? 'cursor-pointer hover:text-gray-700' : ''}`}
                  onClick={key === 'uploadDate' ? handleSortUploadDate : undefined}
                >
                  <div className="flex items-center">
                    {label}
                    {key === 'uploadDate' && (
                      <span className="ml-1">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedList.length > 0 ? (
              paginatedList.map((item) => (
                <React.Fragment key={item.id}>
                  <tr 
                    className={`
                      ${selectedRows.has(item.id) ? 'bg-blue-50' : ''}
                      ${hoveredRow === item.id ? 'bg-gray-50' : ''}
                      hover:bg-gray-50 transition-colors duration-150
                    `}
                    onMouseEnter={() => setHoveredRow(item.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                  >
                    <td className="px-4 py-4 whitespace-normal text-sm text-gray-900">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedRows.has(item.id)}
                          onChange={() => handleRowSelect(item.id)}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                        />
                        <button 
                          onClick={() => handleDelete(item.id)} 
                          className="text-red-500 hover:text-red-700 transition-colors duration-150"
                          title="Delete JD"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-normal text-sm text-gray-900">{item.role}</td>
                    {/* <td className="px-4 py-4 whitespace-normal text-sm text-gray-900">{item.position}</td> */}
                    <td className="px-4 py-4 whitespace-normal text-sm text-gray-900">
                      <div className="flex items-center">
                        <span className="truncate max-w-xs">{item.fileName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-normal text-sm text-gray-900">{item.uploadDate}</td>
                    <td className="px-4 py-4 whitespace-normal text-sm bg-green-50 text-green-700">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-green-600 h-2.5 rounded-full" 
                            style={{ width: `${Math.min(parseFloat(item.matchScore), 100)}%` }}
                          ></div>
                        </div>
                        <span className="ml-2">{item.matchScore}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-normal text-sm bg-red-50 text-red-700">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-red-600 h-2.5 rounded-full" 
                            style={{ width: `${Math.min(parseFloat(item.relevanceScore), 100)}%` }}
                          ></div>
                        </div>
                        <span className="ml-2">{item.relevanceScore}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-normal text-sm text-gray-900">
                      <button
                        onClick={() => handleViewClick(item)}
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-150"
                        title="View details"
                      >
                        <FaEye className="mr-1" />
                        {item.threshold}
                      </button>
                    </td>
                    <td className="px-4 py-4 whitespace-normal text-sm text-gray-900">
                      <button
                        onClick={() => handleDisplayClick(item)}
                        className={`px-3 py-1.5 rounded-md ${
                          activeDisplayId === item.id 
                            ? 'bg-red-500 hover:bg-red-600' 
                            : 'bg-blue-500 hover:bg-blue-600'
                        } text-white transition-colors duration-150`}
                      >
                        {getDisplayButtonText(item.id)}
                      </button>
                    </td>
                  </tr>
                  {activeDisplayId === item.id && (
                    <tr>
                      <td colSpan="9" className="px-4 py-4">
                        <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-gray-900">
                              JD Analysis: {item.role}
                            </h3>
                            <button 
                              onClick={() => handleCloseDisplay(item.id)}
                              className="text-gray-500 hover:text-red-700 transition-colors duration-150"
                              title="Close"
                            >
                              <FaTrash size={14} />
                            </button>
                          </div>
                          <CS 
                            jdId={item.id} 
                            selectedFile={item.file} 
                            jdData={item}
                            onClose={() => handleCloseDisplay(item.id)} 
                          />
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            ) : (
              <tr>
                {/* <td colSpan="9" className="px-4 py-8 text-center text-gray-500">
                  {searchTerm ? 'No JDs match your search criteria' : 'No JDs uploaded yet'}
                </td> */}
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {paginatedList.length > 0 && (
        <div className="mt-6 flex flex-col items-center">
          <div className="flex items-center space-x-1 border border-gray-200 rounded-md overflow-hidden">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 border-r border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors duration-150 flex items-center"
            >
              <FaChevronLeft className="mr-1" size={12} />
              Previous
            </button>
            
            <div className="px-4 py-2 bg-white text-gray-600">
              Page <span className="font-medium text-gray-800">{currentPage}</span> of <span className="font-medium text-gray-800">{totalPages || 1}</span>
            </div>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages || 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-3 py-2 border-l border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors duration-150 flex items-center"
            >
              Next
              <FaChevronRight className="ml-1" size={12} />
            </button>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Showing {paginatedList.length} of {filteredList.length} records
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-gray-50 rounded-lg w-full">
      <div className="flex justify-between items-center mb-4 px-4 pt-4">
        <h2 className="text-xl font-semibold text-gray-800">JD Dashboard</h2>
        <div className="flex gap-2">
          {['Upload JD', 'ATS'].map((label) => (
            <div key={label}>
              {label === 'Upload JD' ? (
                <>
                  <button
                    onClick={() => document.getElementById(`jdFile${label.replace(' ', '')}`).click()}
                    className="px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors duration-150 flex items-center shadow-sm"
                  >
                    {buttonConfig[label].icon}
                    {label}
                  </button>
                  <input
                    type="file"
                    id={`jdFile${label.replace(' ', '')}`}
                    className="hidden"
                    onChange={handleFileUpload(label)}
                    multiple
                    accept=".pdf,.docx,.txt,.json"
                  />
                </>
              ) : (
                <button
                  onClick={handleATSClick}
                  className="px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors duration-150 flex items-center shadow-sm"
                >
                  {buttonConfig[label].icon}
                  {label}
                </button>
              )}
            </div>
          ))}
          {jdList.length > 0 && (
            <button
              onClick={() => setShowDashboard(!showDashboard)}
              className="px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors duration-150 flex items-center shadow-sm"
            >
              {showDashboard ? (
                <>
                  <FaEyeSlash className="mr-2 text-red-500" />
                  Hide Dashboard
                </>
              ) : (
                <>
                  <FaEye className="mr-2 text-green-500" />
                  Show Dashboard
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {jdList.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-8 mt-2 text-center w-full">
          <div className="text-gray-400 mb-4">
            {/* <FaUpload size={0} className="mx-auto" /> */}
          </div>
          {/* <h3 className="text-xl font-medium text-gray-900 mb-2">No JDs Uploaded</h3>
          <p className="text-gray-500 mb-4">
            Upload job descriptions to start analyzing */}
          {/* </p> */}
          {/* <button
            onClick={() => document.getElementById('jdFileUploadJD').click()}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-150"
          >
            Upload JD
          </button> */}
        </div>
      )}

      {showDashboard && jdList.length > 0 && renderDashboard()}

      {isPopupOpen && selectedJD && (
        <MovableResizablePopup 
          jdId={selectedJD.id}
          onClose={handlePopupClose}
        />
      )}

      {isDrawerOpen && selectedJD && (
        <DrawerNavigationJD 
          selectedResume={selectedJD} // Changed prop name to match sidebar component
          onClose={handleDrawerClose}
        />
      )}
    </div>
  );
};

export default JDTab;