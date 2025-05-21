'use client';
import { useState, useEffect } from 'react';
import { Search, X, Upload, Download, Edit, Trash2, Share2, FileText } from 'lucide-react';

const JobDescriptionsRoleAssignments = () => {
  // State Management
  const [jobDescriptions, setJobDescriptions] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [currentTab, setCurrentTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOptions, setFilterOptions] = useState({
    department: '',
    experience: '',
    status: '',
  });
  const [showModal, setShowModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: 'success',
  });
  const [loading, setLoading] = useState(false);
  const [skills, setSkills] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [showSkillsDropdown, setShowSkillsDropdown] = useState(false);

  const [newJob, setNewJob] = useState({
    title: '',
    department: '',
    description: '',
    threshold: '',
    requiredSkills: [],
    salary: '',
    location: '',
    type: 'Full-time',
    experience: '',
    deadline: '',
  });

  // Mock Data
  const departments = ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance'];
  const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Remote'];
  const experienceLevels = ['Entry', 'Mid-level', 'Senior', 'Lead', 'Executive'];
  const mockSkills = ['JavaScript', 'React', 'Node.js', 'Python', 'Java', 'SQL', 'AWS'];

  useEffect(() => {
    setSkills(mockSkills);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  // Handlers
  const handleJobSubmit = (e) => {
    e.preventDefault();
    const jobData = {
      ...newJob,
      id: Date.now(),
      requiredSkills: selectedSkills,
      status: 'Active',
      createdAt: new Date().toISOString(),
    };
    setJobDescriptions([...jobDescriptions, jobData]);
    handleNotification('Job description added successfully');
    resetForm();
    setShowModal(false);
  };

  const handleBulkJDUpload = (e) => {
    const files = Array.from(e.target.files);
    setLoading(true);

    const processFile = (file) => {
      return new Promise((resolve) => {
        const fileExtension = file.name.split('.').pop().toLowerCase();
        
        if (fileExtension === 'json') {
          const reader = new FileReader();
          reader.onload = (event) => {
            try {
              const jsonData = JSON.parse(event.target.result);
              resolve(Array.isArray(jsonData) ? jsonData : [jsonData]);
            } catch (error) {
              resolve([{
                title: file.name,
                department: 'Unassigned',
                description: 'Error parsing JSON file',
                status: 'Error',
                id: Date.now() + Math.random(),
                createdAt: new Date().toISOString()
              }]);
            }
          };
          reader.readAsText(file);
        } else if (['pdf', 'doc', 'docx'].includes(fileExtension)) {
          setTimeout(() => {
            const fileName = file.name.replace(/\.[^/.]+$/, "");
            resolve([{
              id: Date.now() + Math.random(),
              title: fileName,
              department: departments[Math.floor(Math.random() * departments.length)],
              description: `Extracted from ${file.name}. This is a simulated job description that would be extracted from the ${fileExtension.toUpperCase()} file using document parsing.`,
              type: jobTypes[Math.floor(Math.random() * jobTypes.length)],
              location: ['New York', 'San Francisco', 'London', 'Remote'][Math.floor(Math.random() * 4)],
              experience: experienceLevels[Math.floor(Math.random() * experienceLevels.length)],
              salary: `${Math.floor(Math.random() * 100 + 50)}k - ${Math.floor(Math.random() * 100 + 100)}k`,
              requiredSkills: mockSkills.sort(() => 0.5 - Math.random()).slice(0, 4),
              status: 'Active',
              createdAt: new Date().toISOString(),
              source: {
                type: fileExtension.toUpperCase(),
                originalName: file.name,
                size: file.size
              }
            }]);
          }, 1000 + Math.random() * 1000);
        }
      });
    };

    Promise.all(files.map(processFile))
      .then((results) => {
        const newJobs = results.flat();
        setJobDescriptions([...jobDescriptions, ...newJobs]);
        setLoading(false);
        handleNotification(`Successfully processed ${files.length} file${files.length > 1 ? 's' : ''}`);
      })
      .catch(() => {
        setLoading(false);
        handleNotification('Error processing some files', 'error');
      });
  };

  const handleResumeUpload = (e) => {
    const files = Array.from(e.target.files);
    setLoading(true);
    
    const newResumes = files.map(file => ({
      id: Date.now(),
      name: file.name,
      size: file.size,
      status: 'Processing',
      score: Math.floor(Math.random() * 100),
      matchedJob: jobDescriptions[Math.floor(Math.random() * jobDescriptions.length)]?.title || 'Unassigned',
      uploadDate: new Date().toISOString(),
      candidateName: `Candidate ${Math.floor(Math.random() * 1000)}`,
      skills: mockSkills.sort(() => 0.5 - Math.random()).slice(0, 3),
    }));

    setTimeout(() => {
      setResumes([...resumes, ...newResumes]);
      setLoading(false);
      handleNotification('Resumes processed successfully');
    }, 2000);
  };

  const handleDeleteJob = (jobId) => {
    setJobDescriptions(jobDescriptions.filter(job => job.id !== jobId));
    handleNotification('Job deleted successfully');
  };

  const handleEditJob = (job) => {
    setSelectedJob(job);
    setNewJob(job);
    setSelectedSkills(job.requiredSkills || []);
    setShowModal(true);
  };

  const handleUpdateJob = () => {
    const updatedJobs = jobDescriptions.map(job =>
      job.id === selectedJob.id ? { ...newJob, requiredSkills: selectedSkills } : job
    );
    setJobDescriptions(updatedJobs);
    handleNotification('Job updated successfully');
    setShowModal(false);
    resetForm();
  };

  const handleNotification = (message, type = 'success') => {
    setNotification({
      show: true,
      message,
      type,
    });
    setTimeout(() => {
      setNotification({ ...notification, show: false });
    }, 3000);
  };

  const resetForm = () => {
    setNewJob({
      title: '',
      department: '',
      description: '',
      threshold: '',
      requiredSkills: [],
      salary: '',
      location: '',
      type: 'Full-time',
      experience: '',
      deadline: '',
    });
    setSelectedSkills([]);
  };

  const filterJobs = (jobs) => {
    return jobs.filter(job => {
      const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          job.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDepartment = !filterOptions.department || job.department === filterOptions.department;
      const matchesExperience = !filterOptions.experience || job.experience === filterOptions.experience;
      return matchesSearch && matchesDepartment && matchesExperience;
    });
  };

  const TabPanel = ({ children, value, index }) => (
    <div className={`${value !== index ? 'hidden' : ''} p-6`}>
      {children}
    </div>
  );

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header with Tabs and Upload Buttons */}
      <div className="flex justify-between items-center mb-6">
        <div className="border-b flex-grow">
          <div className="flex space-x-4">
            {['Job Descriptions', 'Resume Management', 'Analytics'].map((tab, index) => (
              <button
                key={tab}
                className={`py-2 px-4 ${
                  currentTab === index
                    ? 'border-b-2 border-blue-500 text-blue-500'
                    : 'text-gray-500'
                }`}
                onClick={() => setCurrentTab(index)}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Upload Buttons */}
        <div className="flex space-x-4 ml-4">
          <label className="bg-gray-100 px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-400 group relative">
            <Upload className="inline-block mr-2" size={20} />
            Upload JDs
            <input
              type="file"
              hidden
              multiple
              accept=".json,.pdf,.doc,.docx"
              onChange={handleBulkJDUpload}
            />
            <div className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded p-2 -bottom-10 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
              Supports JSON, PDF, DOC, DOCX
            </div>
          </label>
          <label className="bg-gray-100 px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-400">
            <Upload className="inline-block mr-2" size={20} />
            Upload Resumes
            <input
              type="file"
              hidden
              multiple
              accept=".pdf,.doc,.docx"
              onChange={handleResumeUpload}
            />
          </label>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
          </div>
          <select
            className="border rounded-lg p-2"
            value={filterOptions.department}
            onChange={(e) => setFilterOptions({ ...filterOptions, department: e.target.value })}
          >
            <option value="">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
          <select
            className="border rounded-lg p-2"
            value={filterOptions.experience}
            onChange={(e) => setFilterOptions({ ...filterOptions, experience: e.target.value })}
          >
            <option value="">All Experience Levels</option>
            {experienceLevels.map(level => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Content */}
      <TabPanel value={currentTab} index={0}>
        <div className="flex justify-between mb-6">
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            onClick={() => setShowModal(true)}
          >
            Add New Job
          </button>
        </div>

        {/* Job Listings */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Skills</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filterJobs(jobDescriptions).map((job) => (
                  <tr key={job.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{job.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{job.department}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{job.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{job.location}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {job.requiredSkills?.map((skill) => (
                          <span key={skill} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                        job.status === 'Active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {job.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {job.source && (
                        <div className="flex items-center space-x-2">
                          <FileText size={16} className="text-gray-400" />
                          <span className="text-sm text-gray-600">{job.source.type}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button onClick={() => handleEditJob(job)} className="text-blue-600 hover:text-blue-800">
                          <Edit size={18} />
                        </button>
                        <button onClick={() => handleDeleteJob(job.id)} className="text-red-600 hover:text-red-800">
                          <Trash2 size={18} />
                        </button>
                        <button className="text-gray-600 hover:text-gray-800">
                          <Share2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </TabPanel>

      {/* Modal for Job Form */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {selectedJob ? 'Edit Job Description' : 'Add New Job Description'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleJobSubmit} className="space-y-4">
              {/* Form fields remain the same */}
            </form>
          </div>
        </div>
      )}

      {/* Notification Toast */}
      {notification.show && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className={`px-4 py-2 rounded-lg shadow-lg ${
            notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          } text-white`}>
            {notification.message}
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
};

export default JobDescriptionsRoleAssignments;

