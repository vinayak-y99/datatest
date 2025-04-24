import React, { useState } from 'react';
import { FaUpload, FaTimes } from 'react-icons/fa';

const UploadPopup = ({ onClose, onUpload }) => {
  const [file, setFile] = useState(null);
  const [dashboardCount, setDashboardCount] = useState(5); // Default to middle value
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = () => {
    if (file) {
      onUpload(file, dashboardCount);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Upload Job Description</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FaTimes />
          </button>
        </div>

        <div 
          className={`border-2 border-dashed rounded-lg p-8 mb-4 text-center ${
            dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {file ? (
            <div className="text-green-600">
              <p className="font-medium">File selected:</p>
              <p>{file.name}</p>
            </div>
          ) : (
            <div className="text-gray-500">
              <FaUpload className="mx-auto text-3xl mb-2" />
              <p>Drag & drop a file here, or click to select</p>
              <p className="text-xs mt-1">Supported formats: PDF, DOCX, TXT, JSON</p>
            </div>
          )}
          <input
            type="file"
            id="fileUpload"
            className={file ? "hidden" : "absolute inset-0 w-full h-full opacity-0 cursor-pointer"}
            onChange={handleFileChange}
            accept=".pdf,.docx,.txt,.json"
          />
          {!file && (
            <button 
              onClick={() => document.getElementById('fileUpload').click()}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Select File
            </button>
          )}
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Number of Dashboards to Create (1-10)
          </label>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">1</span>
            <input
              type="range"
              min="1"
              max="10"
              value={dashboardCount}
              onChange={(e) => setDashboardCount(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-sm font-medium">10</span>
          </div>
          <div className="text-center mt-2">
            <span className="text-blue-600 font-medium">{dashboardCount}</span>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!file}
            className={`px-4 py-2 rounded text-white ${
              file ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            Upload
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadPopup;
