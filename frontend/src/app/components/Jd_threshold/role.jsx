import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import RoleSelector from './RoleSelector';

const Action = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const jdFileInputRef = useRef(null);

  useEffect(() => {
    const storedRoles = sessionStorage.getItem('rolesData');
    if (storedRoles) {
      setRoles(JSON.parse(storedRoles));
    }
  }, []);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    console.log('Starting file upload:', file.name);
    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    setError(null);
    setUploadSuccess(false);

    try {
      const response = await axios.post(
        "http://localhost:8000/api/v1/job/analyze-job-description/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            "Accept": "application/json"
          },
          timeout: 60000
        }
      );

      console.log('Upload successful:', response.data);
      
      if (response.data && response.data.roles) {
        setRoles(response.data.roles);
        sessionStorage.setItem('rolesData', JSON.stringify(response.data.roles));
        setUploadSuccess(true);
      } else {
        throw new Error("No roles found in the document");
      }
    } catch (err) {
      console.error('Upload error:', err);
      console.error("Full error details:", err.response || err);
      setError("Upload failed. Please check if the FastAPI server is running on port 8000");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        Job Description Role Selection
      </h1>

      <div className="mb-6">
        <button
          onClick={() => jdFileInputRef.current.click()}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Analyzing..." : "Upload Job Description"}
        </button>

        <input
          ref={jdFileInputRef}
          type="file"
          accept=".pdf,.docx,.txt"
          className="hidden"
          onChange={handleFileUpload}
        />
      </div>

      {loading && (
        <div className="mb-4 text-gray-600">
          <div className="animate-pulse">Analyzing document...</div>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {uploadSuccess && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">
          Successfully analyzed job description!
        </div>
      )}

      {roles.length > 0 && (
        <div className="mt-6 p-4 bg-white rounded-lg shadow">
          <RoleSelector roles={roles} />
        </div>
      )}
    </div>
  );
};

export default Action;
