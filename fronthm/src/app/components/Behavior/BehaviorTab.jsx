import React, { useState } from 'react';
import { FaDatabase, FaRobot, FaEye, FaEyeSlash } from 'react-icons/fa';
import BehaviorPage from '../Behavior/page';

const BehaviorTab = ({ resumeList, setResumeList }) => {
  const [showDashboard, setShowDashboard] = useState(false);
  const [files, setFiles] = useState({ hrdb: null, ats: null });
  const [showBehaviorPage, setShowBehaviorPage] = useState(null); // Tracks which behavior item to show

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
            file: file // Store the file object for passing to BehaviorPage
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
                    onClick={() => setShowBehaviorPage(item.id)} // Set the ID of the clicked item
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

  const handleCloseBehaviorPage = () => {
    setShowBehaviorPage(null); // Reset to hide BehaviorPage
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-0">
        <p style={{ fontSize: '18px', marginLeft: '4px' }}>Behavioral Assessment</p>
        <div className="flex gap-4">
          {['HR DB', 'ATS'].map((label) => (
            <div key={label}>
              <button
                onClick={() => document.getElementById(`behaviorFile${label.replace(' ', '')}`).click()}
                className="p-2 text-gray-700 rounded hover:bg-gray-100 flex items-center"
              >
                {buttonConfig[label].icon}
                {label}
              </button>
              <input
                id={`behaviorFile${label.replace(' ', '')}`}
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

      {/* Render BehaviorPage only when an item is selected */}
      {showBehaviorPage !== null && (
        <div className="mt-4">
          <BehaviorPage
            key={showBehaviorPage} // Ensure re-render on new selection
            behaviorId={showBehaviorPage}
            selectedFile={resumeList.find(item => item.id === showBehaviorPage)?.file} // Pass the file object
            onClose={handleCloseBehaviorPage} // Pass callback to reset showBehaviorPage
          />
        </div>
      )}
    </div>
  );
};

export default BehaviorTab;