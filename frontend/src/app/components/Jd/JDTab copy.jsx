import React, { useState } from 'react';
import { FaUpload, FaEye, FaEyeSlash, FaTrash } from 'react-icons/fa';
import DrawerNavigationJD from './DrawerNavigation';
import CS from './page';

const JDTab = ({ jdList, setJdList, setSelectedJDForSidebar }) => {
  const [showDashboard, setShowDashboard] = useState(false);
  const [files, setFiles] = useState({ upload: null });
  const [selectedJD, setSelectedJD] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeDisplayId, setActiveDisplayId] = useState(null);
  const [displayStatus, setDisplayStatus] = useState({});
  const [selectedRows, setSelectedRows] = useState(new Set());

  const recordsPerPage = 10;

  const buttonConfig = {
    'Upload JD': { icon: <FaUpload className="mr-2 text-blue-500" />, color: 'blue' },
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
            position: 'Full-time',
            fileName: file.name,
            uploadDate: new Date().toLocaleDateString(),
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

  const handleDelete = (id) => {
    const updatedList = jdList.filter(item => item.id !== id);
    setJdList(updatedList);
    if (activeDisplayId === id) setActiveDisplayId(null);
    setDisplayStatus(prev => {
      const newStatus = {...prev};
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

  const handleModifyClick = (item) => {
    if (item.threshold === 'View') {
      const updatedList = jdList.map(jd =>
        jd.id === item.id ? { ...jd, threshold: 'View' } : jd
      );
      setJdList(updatedList);
      setSelectedJD(item);
      if (setSelectedJDForSidebar) {
        setSelectedJDForSidebar(item);
      }
      setIsDrawerOpen(true);
    }
  };

  const handleDisplayClick = (item) => {
    if (activeDisplayId === item.id) {
      setActiveDisplayId(null);
    } else {
      setActiveDisplayId(item.id);
      setDisplayStatus(prev => ({
        ...prev,
        [item.id]: prev[item.id] === 'Start' || !prev[item.id] ? 'Continue' : 'Start'
      }));
    }
  };

  const handleCloseDisplay = (id) => {
    setActiveDisplayId(null);
  };

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
    setSelectedJD(null);
  };

  const totalPages = Math.ceil(jdList.length / recordsPerPage);
  const paginatedList = jdList.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  const getDisplayButtonText = (itemId) => {
    if (activeDisplayId === itemId) {
      return 'Hide';
    }
    return displayStatus[itemId] || 'Start';
  };

  const renderDashboard = () => (
    <div className="bg-white rounded-lg shadow-md p-4 mt-2">
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Interview</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedList.map((item) => (
              <React.Fragment key={item.id}>
                <tr className={selectedRows.has(item.id) ? 'bg-gray-100' : ''}>
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className={parseFloat(item.matchScore) > 65 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                      {item.matchScore}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className={parseFloat(item.relevanceScore) > 65 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                      {item.relevanceScore}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <button
                      onClick={() => handleModifyClick(item)}
                      className="text-blue-500 hover:underline"
                      disabled={item.threshold !== 'View'}
                    >
                      {item.threshold}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
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
                    <td colSpan="9" className="px-6 py-4">
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
          Showing {paginatedList.length} of {jdList.length} records
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-0">
        <p style={{ fontSize: '18px', marginLeft: '4px' }}>Job Descriptions</p>
        <div className="flex gap-4">
          {['Upload JD'].map((label) => (
            <div key={label}>
              <button
                onClick={() => document.getElementById(`jdFile${label.replace(' ', '')}`).click()}
                className="p-2 text-gray-700 rounded hover:bg-gray-100 flex items-center"
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
              />
            </div>
          ))}
          {jdList.length > 0 && (
            <button
              onClick={() => setShowDashboard(!showDashboard)}
              className="p-2 text-gray-700 rounded hover:bg-gray-100 flex items-center"
            >
              {showDashboard ? <FaEyeSlash className="mr-2 text-green-500" /> : <FaEye className="mr-2 text-green-500" />}
              {showDashboard ? 'Hide Dashboard' : 'Show Dashboard'}
            </button>
          )}
        </div>
      </div>
      
      {showDashboard && renderDashboard()}
      
      {isDrawerOpen && selectedJD && (
        <DrawerNavigationJD
          selectedJd={selectedJD}
          onClose={handleDrawerClose}
        />
      )}
    </div>
  );
};

export default JDTab;
