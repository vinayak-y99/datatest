import React, { useState } from 'react';
import { FaDatabase, FaRobot, FaEye, FaEyeSlash } from 'react-icons/fa';
import CommunicationPage from '../Communication/page';

const CommunicationTab = ({ resumeList, setResumeList }) => {
  const [showDashboard, setShowDashboard] = useState(false);
  const [files, setFiles] = useState({ hrdb: null, ats: null });
  const [showCommunicationPage, setShowCommunicationPage] = useState(null); // Tracks which communication item to show

  const buttonConfig = {
    'HR DB': { icon: <FaDatabase className="mr-2 text-blue-500" />, color: 'blue' },
    'ATS': { icon: <FaRobot className="mr-2 text-blue-500" />, color: 'blue' },
  };

  const handleFileUpload = (buttonType) => (e) => {
    const selectedFiles = e.target.files;
    if (selectedFiles.length > 0) {
      Array.from(selectedFiles).forEach(file => {
        if (file.type === 'application/pdf') {
          const newFile = {
            id: Date.now() + Math.random(), // Unique ID for each file
            candidateName: `Candidate ${resumeList.length + 1}`,
            role: 'Software Engineer',
            position: 'Full-time',
            fileName: file.name,
            uploadDate: new Date().toLocaleDateString(),
            dashboard: 'View',
            buttonType: buttonType,
            file: file // Store the file object for passing to CommunicationPage
          };
          setResumeList(prev => [...prev, newFile]);
          setFiles(prev => ({
            ...prev,
            [buttonType.toLowerCase().replace(' ', '')]: file,
          }));
          setShowDashboard(true);
        } else {
          alert("Please upload PDF files only.");
        }
      });
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
                Candidate Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Document Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Upload Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dashboard</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {resumeList.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <img
                    src={`./user.svg`}
                    alt={item.candidateName}
                    className="w-10 h-10 rounded-full mr-3"
                  />
                  {item.candidateName}
                  <span className="text-gray-500 ml-2">({item.fileName})</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.role}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.position}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.fileName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.uploadDate}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <button
                    onClick={() => setShowCommunicationPage(item.id)} // Set the ID of the clicked item
                    className="text-blue-500 hover:underline"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const handleCloseCommunicationPage = () => {
    setShowCommunicationPage(null); // Reset to hide CommunicationPage
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-0">
        <p style={{ fontSize: '18px', marginLeft: '4px' }}>Communication Assessment</p>
        <div className="flex gap-4">
          {['HR DB', 'ATS'].map((label) => (
            <div key={label}>
              <button
                onClick={() => document.getElementById(`communicationFile${label.replace(' ', '')}`).click()}
                className="p-2 text-gray-700 rounded hover:bg-gray-100 flex items-center"
              >
                {buttonConfig[label].icon}
                {label}
              </button>
              <input
                id={`communicationFile${label.replace(' ', '')}`}
                type="file"
                accept=".pdf"
                onChange={handleFileUpload(label)}
                className="hidden"
                multiple
              />
            </div>
          ))}
          {resumeList.length > 0 && (
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
      {showDashboard && resumeList.length > 0 && renderDashboard()}

      {/* Render CommunicationPage only when an item is selected */}
      {showCommunicationPage !== null && (
        <div className="mt-4">
          <CommunicationPage
            key={showCommunicationPage} // Ensure re-render on new selection
            communicationId={showCommunicationPage}
            selectedFile={resumeList.find(item => item.id === showCommunicationPage)?.file} // Pass the file object
            onClose={handleCloseCommunicationPage} // Pass callback to reset showCommunicationPage
          />
        </div>
      )}
    </div>
  );
};

export default CommunicationTab;