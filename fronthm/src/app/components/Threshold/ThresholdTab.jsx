import React, { useState } from 'react';
import { FaUpload, FaDatabase, FaRobot, FaEye, FaEyeSlash } from 'react-icons/fa';
import ThresholdPage from '../Threshold/page'; // You'll need to create this component

const ThresholdTab = ({ resumeList }) => {
  const [showDashboard, setShowDashboard] = useState(false);
  const [files, setFiles] = useState({ upload: null, hrdb: null, atx: null });
  const [thresholdList, setThresholdList] = useState([]); // Local state for threshold documents
  const [showThresholdPage, setShowThresholdPage] = useState(null); // Tracks which threshold doc to show

  const buttonConfig = {
    'Upload Threshold': { icon: <FaUpload className="mr-2 text-blue-500" />, color: 'blue' },
    'HR DB': { icon: <FaDatabase className="mr-2 text-blue-500" />, color: 'blue' },
    'ATS': { icon: <FaRobot className="mr-2 text-blue-500" />, color: 'blue' }
  };

  const handleFileUpload = (buttonType) => (e) => {
    const selectedFiles = e.target.files;
    if (selectedFiles.length > 0) {
      Array.from(selectedFiles).forEach(file => {
        if (file.type === 'application/pdf') {
          const newFile = {
            id: Date.now() + Math.random(),
            documentName: `Threshold Doc ${thresholdList.length + 1}`,
            type: 'Threshold',
            category: 'Criteria',
            fileName: file.name,
            uploadDate: new Date().toLocaleDateString(),
            dashboard: 'Create',
            buttonType: buttonType,
            file: file
          };
          setThresholdList(prev => [...prev, newFile]);
          setFiles(prev => ({
            ...prev,
            [buttonType.toLowerCase().replace(' ', '')]: file,
          }));
          setShowDashboard(true);
        }
      });
    } else {
      alert("Please upload PDF files only.");
    }
  };

  const renderDashboard = () => (
    <div className="bg-white rounded-lg shadow-md p-4 mt-2">
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input type="checkbox" className="mr-2" />
                Document Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Upload Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dashboard</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {thresholdList.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <img
                    src={`../user.svg`} // You might want a different icon
                    alt={item.documentName}
                    className="w-10 h-10 rounded-full mr-3"
                  />
                  {item.documentName}
                  <span className="text-gray-500 ml-2">({item.fileName})</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.type}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.category}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.fileName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.uploadDate}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <button
                    onClick={() => setShowThresholdPage(item.id)}
                    className="text-blue-500 hover:underline"
                  >
                    Create
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const handleCloseThresholdPage = () => {
    setShowThresholdPage(null);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-0">
        <p style={{ fontSize: '18px', marginLeft: '4px' }}>Threshold</p>
        <div className="flex gap-4">
          {['Upload Threshold', 'HR DB', 'ATS'].map((label) => (
            <div key={label}>
              <button
                onClick={() => document.getElementById(`thresholdFile${label.replace(' ', '')}`).click()}
                className="p-2 text-gray-700 rounded hover:bg-gray-100 flex items-center"
              >
                {buttonConfig[label].icon}
                {label}
              </button>
              <input
                id={`thresholdFile${label.replace(' ', '')}`}
                type="file"
                accept=".pdf"
                onChange={handleFileUpload(label)}
                className="hidden"
                multiple
              />
            </div>
          ))}
          {thresholdList.length > 0 && (
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
      {showDashboard && thresholdList.length > 0 && renderDashboard()}

      {/* Render ThresholdPage only when a threshold doc is selected */}
      {showThresholdPage !== null && (
        <div className="mt-4">
          <ThresholdPage
            key={showThresholdPage}
            thresholdId={showThresholdPage}
            selectedFile={thresholdList.find(item => item.id === showThresholdPage)?.file}
            onClose={handleCloseThresholdPage}
          />
        </div>
      )}
    </div>
  );
};

export default ThresholdTab;