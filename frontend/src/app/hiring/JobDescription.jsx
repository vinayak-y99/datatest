import React, { useState } from 'react';
import { Upload, ChevronDown, Edit2, Trash2, RefreshCw, Lightbulb, Plus } from 'lucide-react';

const JobDescription = () => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingJD, setEditingJD] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    department: '',
    location: '',
    experience: '',
    description: '',
    status: 'draft'
  });

  // Sample data
  const [groupedJDs, setGroupedJDs] = useState({
    'Engineering': [
      {
        id: 1,
        title: 'Senior Software Engineer',
        status: 'active',
        lastUpdated: '2025-02-13',
        description: 'Looking for an experienced software engineer...',
        department: 'Engineering',
        location: 'Remote',
        experience: '5+ years'
      }
    ],
    'Marketing': [
      {
        id: 2,
        title: 'Digital Marketing Manager',
        status: 'draft',
        lastUpdated: '2025-02-12',
        description: 'Seeking a creative marketing professional...',
        department: 'Marketing',
        location: 'London',
        experience: '4+ years'
      }
    ]
  });

  const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newJD = {
      id: editingJD ? editingJD.id : Date.now(),
      ...formData,
      lastUpdated: new Date().toISOString().split('T')[0]
    };

    setGroupedJDs(prev => {
      const newState = { ...prev };
      const department = formData.department;
      
      if (!newState[department]) {
        newState[department] = [];
      }

      if (editingJD) {
        Object.keys(newState).forEach(cat => {
          newState[cat] = newState[cat].map(jd => 
            jd.id === editingJD.id ? newJD : jd
          );
        });
      } else {
        newState[department] = [...newState[department], newJD];
      }

      return newState;
    });

    setIsFormOpen(false);
    setEditingJD(null);
    setFormData({
      title: '',
      department: '',
      location: '',
      experience: '',
      description: '',
      status: 'draft'
    });
  };

  const handleEdit = (jd) => {
    setEditingJD(jd);
    setFormData(jd);
    setIsFormOpen(true);
  };

  const handleDelete = (jd) => {
    if (confirm('Are you sure you want to delete this job description?')) {
      setGroupedJDs(prev => {
        const newState = { ...prev };
        Object.keys(newState).forEach(category => {
          newState[category] = newState[category].filter(item => item.id !== jd.id);
          if (newState[category].length === 0) {
            delete newState[category];
          }
        });
        return newState;
      });
    }
  };

  return (
    <div className="p-4">
      {/* Action Buttons */}
      <div className="mb-6 flex flex-wrap gap-4">
        <button 
          className="flex items-center px-4 py-2 bg-blue-500 text-white rounded"
          onClick={() => setIsFormOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create New JD
        </button>

        <button 
          className="flex items-center px-4 py-2 bg-blue-500 text-white rounded"
          onClick={() => document.getElementById('file-upload').click()}
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload JDs
          <input
            id="file-upload"
            type="file"
            className="hidden"
            multiple
            accept=".pdf,.doc,.docx"
          />
        </button>

        <button 
          className="flex items-center px-4 py-2 border border-blue-500 text-blue-500 rounded"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Sync with ATS
        </button>

        <button 
          className="flex items-center px-4 py-2 border border-blue-500 text-blue-500 rounded"
          onClick={() => setShowSuggestions(!showSuggestions)}
        >
          <Lightbulb className="w-4 h-4 mr-2" />
          {showSuggestions ? 'Hide Suggestions' : 'Show AI Suggestions'}
        </button>
      </div>

      {/* Job Descriptions List */}
      {Object.entries(groupedJDs).map(([category, jds]) => (
        <div key={category} className="mb-4 border rounded">
          <div 
            className="p-3 bg-gray-50 flex justify-between items-center cursor-pointer"
            onClick={() => setExpandedCategory(expandedCategory === category ? null : category)}
          >
            <div className="flex items-center">
              <span className="font-semibold">{category}</span>
              <span className="ml-2 px-2 py-1 text-sm bg-blue-100 text-blue-800 rounded">
                {jds.length} JDs
              </span>
            </div>
            <ChevronDown className={`w-5 h-5 transform ${expandedCategory === category ? 'rotate-180' : ''}`} />
          </div>

          {expandedCategory === category && (
            <div className="p-4">
              {jds.map((jd) => (
                <div key={jd.id} className="mb-4 p-4 border-b last:border-b-0">
                  <div className="flex justify-between mb-2">
                    <h3 className="font-semibold">{jd.title}</h3>
                    <span className={`px-2 py-1 text-sm rounded ${
                      jd.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {jd.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    {jd.location} • {jd.experience} • Last Updated: {jd.lastUpdated}
                  </div>
                  <p className="mb-3">{jd.description}</p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleEdit(jd)}
                      className="flex items-center text-blue-500 hover:text-blue-600"
                    >
                      <Edit2 className="w-4 h-4 mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(jd)}
                      className="flex items-center text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Create/Edit Form */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">
              {editingJD ? 'Edit Job Description' : 'Create New Job Description'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Department</label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Experience</label>
                <input
                  type="text"
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  rows="4"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsFormOpen(false);
                    setEditingJD(null);
                  }}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded"
                >
                  {editingJD ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// At the end of your JobDescription component file
export default JobDescription;

