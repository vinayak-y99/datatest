import React, { useState } from 'react';
import { X, Edit2, UserPlus, Trash2, ArrowUpDown, Users, UserCheck, UserX, Clock, FileText, Download } from 'lucide-react';

// Initial data remains unchanged
const initialRolesData = [
  { id: 1, title: 'Software Engineer', assignedTo: 'John Doe', department: 'Engineering', status: 'Open', dateAssigned: '2025-01-01' },
  { id: 2, title: 'Marketing Manager', assignedTo: 'Jane Smith', department: 'Marketing', status: 'Filled', dateAssigned: '2025-02-01' },
  { id: 3, title: 'Product Manager', assignedTo: 'Mike Johnson', department: 'Product', status: 'Closed', dateAssigned: '2025-03-01' },
];

const initialInterviewsData = [
  { id: 1, candidate: 'Alice Walker', interviewDate: '2025-02-22', role: 'Software Engineer', interviewer: 'John Doe', status: 'Scheduled' },
  { id: 2, candidate: 'Bob Martin', interviewDate: '2025-02-25', role: 'Marketing Manager', interviewer: 'Jane Smith', status: 'Pending' },
];

const initialTeamMembers = [
  { id: 1, name: 'John Doe', role: 'Software Engineer', available: true },
  { id: 2, name: 'Jane Smith', role: 'Marketing Manager', available: false },
  { id: 3, name: 'Alice Johnson', role: 'Product Manager', available: true },
];

const initialCandidateData = [
  { id: 1, status: 'Shortlisted', role: 'Software Engineer' },
  { id: 2, status: 'Selected', role: 'Software Engineer' },
  { id: 3, status: 'Rejected', role: 'Marketing Manager' },
  { id: 4, status: 'On Hold', role: 'Product Manager' },
  { id: 5, status: 'Interview Scheduled', role: 'Product Manager' },
  { id: 6, status: 'Shortlisted', role: 'Software Engineer' },
];

const initialAssignmentHistory = [
  { id: 1, role: 'Software Engineer', assignedTo: 'John Doe', date: '2025-01-01' },
  { id: 2, role: 'Marketing Manager', assignedTo: 'Jane Smith', date: '2025-02-01' },
];

const Dashboard = () => {
  const [rolesData, setRolesData] = useState(initialRolesData);
  const [interviewsData, setInterviewsData] = useState(initialInterviewsData);
  const [teamMembers, setTeamMembers] = useState(initialTeamMembers);
  const [candidateData, setCandidateData] = useState(initialCandidateData);
  const [assignmentHistory, setAssignmentHistory] = useState(initialAssignmentHistory);
  const [selectedRoleStatus, setSelectedRoleStatus] = useState('All');
  const [selectedInterviewStatus, setSelectedInterviewStatus] = useState('All');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const itemsPerPage = 5;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('');
  const [modalData, setModalData] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    assignedTo: '',
    department: '',
    status: '',
    dateAssigned: '',
    candidate: '',
    interviewDate: '',
    role: '',
    interviewer: '',
    name: '',
    available: true,
    newInterviewer: ''
  });
  const [activeTab, setActiveTab] = useState('Roles');

  // All functions remain unchanged
  const handleExport = (data, filename) => {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleTeamMemberAvailabilityChange = (memberId, isAvailable) => {
    setTeamMembers(prev => prev.map(member => 
      member.id === memberId ? { ...member, available: isAvailable } : member
    ));

    if (!isAvailable) {
      const memberName = teamMembers.find(m => m.id === memberId)?.name;
      const availableInterviewers = teamMembers.filter(m => 
        m.id !== memberId && 
        m.available && 
        m.role === teamMembers.find(tm => tm.id === memberId)?.role
      );

      if (availableInterviewers.length > 0) {
        setInterviewsData(prev => prev.map(interview => {
          if (interview.interviewer === memberName) {
            const newInterviewer = availableInterviewers[Math.floor(Math.random() * availableInterviewers.length)];
            return { ...interview, interviewer: newInterviewer.name };
          }
          return interview;
        }));
      }
    }
  };

  const openAvailabilityModal = (member) => {
    setModalType('changeAvailability');
    setModalData(member);
    setIsModalOpen(true);
  };

  const handleReassignInterview = (interviewId, newInterviewer) => {
    setInterviewsData(prev => prev.map(interview =>
      interview.id === interviewId 
        ? { ...interview, interviewer: newInterviewer }
        : interview
    ));
  };

  const filteredRoles = rolesData
    .filter(role => selectedRoleStatus === 'All' || role.status === selectedRoleStatus)
    .filter(role => selectedDepartment === 'All' || role.department === selectedDepartment)
    .filter(role => 
      role.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.assignedTo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.department.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const filteredInterviews = interviewsData
    .filter(interview => selectedInterviewStatus === 'All' || interview.status === selectedInterviewStatus)
    .filter(interview =>
      interview.candidate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      interview.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      interview.interviewer.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const filteredTeamMembers = teamMembers.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAssignmentHistory = assignmentHistory.filter(entry =>
    entry.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.assignedTo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    selected: candidateData.filter(candidate => candidate.status === 'Selected').length,
    rejected: candidateData.filter(candidate => candidate.status === 'Rejected').length,
    onHold: candidateData.filter(candidate => candidate.status === 'On Hold').length,
    shortlisted: candidateData.filter(candidate => candidate.status === 'Shortlisted').length,
    interviewScheduled: candidateData.filter(candidate => candidate.status === 'Interview Scheduled').length,
    totalJD: rolesData.length,
    totalResumes: candidateData.length
  };

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });

    if (key) {
      setRolesData(prev => [...prev].sort((a, b) => {
        if (a[key] < b[key]) return direction === 'ascending' ? -1 : 1;
        if (a[key] > b[key]) return direction === 'ascending' ? 1 : -1;
        return 0;
      }));
    }
  };

  const handleDeleteRole = (id) => {
    setRolesData(prev => prev.filter(role => role.id !== id));
  };

  const handleBulkDeleteRoles = () => {
    setRolesData(prev => prev.filter(role => !selectedRoles.includes(role.id)));
    setSelectedRoles([]);
  };

  const handleSelectRole = (id) => {
    setSelectedRoles(prev => 
      prev.includes(id) ? prev.filter(roleId => roleId !== id) : [...prev, id]
    );
  };

  const handleDeleteInterview = (id) => {
    setInterviewsData(prev => prev.filter(interview => interview.id !== id));
  };

  const paginatedRoles = filteredRoles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const pageCount = Math.ceil(filteredRoles.length / itemsPerPage);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    switch (modalType) {
      case 'addRole':
        const newRole = { ...formData, id: rolesData.length + 1 };
        setRolesData(prev => [...prev, newRole]);
        setAssignmentHistory(prev => [...prev, { 
          id: prev.length + 1, 
          role: newRole.title, 
          assignedTo: newRole.assignedTo, 
          date: newRole.dateAssigned 
        }]);
        break;
      case 'editRole':
        setRolesData(prev => prev.map(role => 
          role.id === modalData.id ? { ...formData, id: modalData.id } : role
        ));
        setAssignmentHistory(prev => [...prev, { 
          id: prev.length + 1, 
          role: formData.title, 
          assignedTo: formData.assignedTo, 
          date: formData.dateAssigned 
        }]);
        break;
      case 'addInterview':
        setInterviewsData(prev => [...prev, { ...formData, id: interviewsData.length + 1 }]);
        break;
      case 'editInterview':
        setInterviewsData(prev => prev.map(interview => 
          interview.id === modalData.id ? { ...formData, id: modalData.id } : interview
        ));
        break;
      case 'assignInterview':
        setInterviewsData(prev => prev.map(interview => 
          interview.id === modalData.id ? { ...interview, interviewer: formData.newInterviewer } : interview
        ));
        break;
      case 'addTeamMember':
        setTeamMembers(prev => [...prev, { ...formData, id: teamMembers.length + 1 }]);
        break;
      default:
        break;
    }
    closeModal();
  };

  const openModal = (type, data = null) => {
    setModalType(type);
    setModalData(data);
    setIsModalOpen(true);
    if (data) {
      setFormData(data);
    } else {
      setFormData({
        title: '',
        assignedTo: '',
        department: '',
        status: '',
        dateAssigned: '',
        candidate: '',
        interviewDate: '',
        role: '',
        interviewer: '',
        name: '',
        available: true,
        newInterviewer: ''
      });
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalType('');
    setModalData(null);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Roles':
        return (
          <>
            <div className="flex flex-wrap gap-4 mb-6 items-center justify-between w-full">
              <div className="flex gap-4">
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <h3 className="text-sm font-semibold mb-2 text-gray-700">Filter by Status</h3>
                  <div className="flex gap-2">
                    {['All', 'Open', 'Filled', 'Closed'].map(status => (
                      <button
                        key={status}
                        onClick={() => setSelectedRoleStatus(status)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                          selectedRoleStatus === status 
                            ? 'bg-[#2563EB] text-white shadow-md' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <h3 className="text-sm font-semibold mb-2 text-gray-700">Department</h3>
                  <select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  >
                    {['All', 'Engineering', 'Marketing', 'Product', 'Sales', 'HR'].map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => openModal('addRole')} 
                  className="px-5 py-2 bg-gradient-to-r from-[#2563EB] to-blue-600 text-white rounded-lg font-semibold shadow-md hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center"
                >
                  <UserPlus size={16} className="mr-2" /> Add Role
                </button>
                {selectedRoles.length > 0 && (
                  <button 
                    onClick={handleBulkDeleteRoles} 
                    className="px-5 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-semibold shadow-md hover:from-red-600 hover:to-red-700 transition-all duration-200 flex items-center"
                  >
                    <Trash2 size={16} className="mr-2" /> Delete Selected ({selectedRoles.length})
                  </button>
                )}
                <button 
                  onClick={() => handleExport(rolesData, 'roles_data')} 
                  className="px-5 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold shadow-md hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center"
                >
                  <Download size={16} className="mr-2" /> Export
                </button>
              </div>
            </div>
            <div className="mb-4 w-full">
              <input
                type="text"
                placeholder="Search roles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              />
            </div>
            <div className="overflow-x-auto bg-white shadow-md rounded-lg w-full">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      <input 
                        type="checkbox" 
                        onChange={(e) => setSelectedRoles(e.target.checked ? paginatedRoles.map(role => role.id) : [])} 
                        className="rounded"
                      />
                    </th>
                    <th onClick={() => handleSort('title')} className="px-6 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:text-[#2563EB]">
                      Role Title <ArrowUpDown size={16} className="inline-block" />
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Assigned To</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Department</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Date Assigned</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRoles.map(role => (
                    <tr key={role.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedRoles.includes(role.id)}
                          onChange={() => handleSelectRole(role.id)}
                          className="rounded"
                        />
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-800">{role.title}</td>
                      <td className="px-6 py-4 text-sm text-gray-800">{role.assignedTo}</td>
                      <td className="px-6 py-4 text-sm text-gray-800">{role.department}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          role.status === 'Open' ? 'bg-green-100 text-green-800' :
                          role.status === 'Filled' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {role.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-800">{role.dateAssigned}</td>
                      <td className="px-6 py-4 text-sm space-x-3">
                        <button onClick={() => openModal('editRole', role)} className="text-[#2563EB] hover:text-blue-700 transition-colors">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDeleteRole(role.id)} className="text-red-600 hover:text-red-800 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-center mt-6 gap-2 w-full">
              {Array.from({ length: pageCount }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentPage(index + 1)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    currentPage === index + 1 
                      ? 'bg-[#2563EB] text-white shadow-md' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </>
        );
      case 'Interviews':
        return (
          <>
            <div className="flex flex-wrap gap-4 mb-6 items-center justify-between w-full">
              <div className="bg-white p-4 rounded-lg shadow-md">
                <h3 className="text-sm font-semibold mb-2 text-gray-700">Filter by Status</h3>
                <div className="flex gap-2">
                  {['All', 'Scheduled', 'Pending', 'Completed'].map(status => (
                    <button
                      key={status}
                      onClick={() => setSelectedInterviewStatus(status)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                        selectedInterviewStatus === status 
                          ? 'bg-[#2563EB] text-white shadow-md' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => openModal('addInterview')} 
                  className="px-5 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold shadow-md hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center"
                >
                  <UserPlus size={16} className="mr-2" /> Add Interview
                </button>
                <button 
                  onClick={() => handleExport(interviewsData, 'interviews_data')} 
                  className="px-5 py-2 bg-gradient-to-r from-[#2563EB] to-blue-600 text-white rounded-lg font-semibold shadow-md hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center"
                >
                  <Download size={16} className="mr-2" /> Export
                </button>
              </div>
            </div>
            <div className="mb-4 w-full">
              <input
                type="text"
                placeholder="Search interviews..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              />
            </div>
            <div className="overflow-x-auto bg-white shadow-md rounded-lg w-full">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Candidate</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Interview Date</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Role</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Interviewer</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInterviews.map(interview => (
                    <tr key={interview.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-800">{interview.candidate}</td>
                      <td className="px-6 py-4 text-sm text-gray-800">{interview.interviewDate}</td>
                      <td className="px-6 py-4 text-sm text-gray-800">{interview.role}</td>
                      <td className="px-6 py-4 text-sm text-gray-800">{interview.interviewer}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          interview.status === 'Scheduled' ? 'bg-green-100 text-green-800' :
                          interview.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {interview.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm space-x-3">
                        <button onClick={() => openModal('editInterview', interview)} className="text-[#2563EB] hover:text-blue-700 transition-colors">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDeleteInterview(interview.id)} className="text-red-600 hover:text-red-800 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        );
      case 'Team Members':
        return (
          <>
            <div className="flex flex-wrap gap-4 mb-6 items-center justify-between w-full">
              <button 
                onClick={() => openModal('addTeamMember')} 
                className="px-5 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg font-semibold shadow-md hover:from-purple-600 hover:to-purple-700 transition-all duration-200 flex items-center"
              >
                <UserPlus size={16} className="mr-2" /> Add Team Member
              </button>
              <button 
                onClick={() => handleExport(teamMembers, 'team_members_data')} 
                className="px-5 py-2 bg-gradient-to-r from-[#2563EB] to-blue-600 text-white rounded-lg font-semibold shadow-md hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center"
              >
                <Download size={16} className="mr-2" /> Export
              </button>
            </div>
            <div className="mb-4 w-full">
              <input
                type="text"
                placeholder="Search team members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              />
            </div>
            <div className="bg-white shadow-md rounded-lg p-6 w-full">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">Team Members</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTeamMembers.map(member => (
                  <div key={member.id} className="p-4 border rounded-lg bg-gray-50 hover:bg-white transition-all duration-200 shadow-sm">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold text-gray-800">{member.name}</h3>
                        <p className="text-sm text-gray-600">{member.role}</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          member.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {member.available ? 'Available' : 'Unavailable'}
                        </span>
                        <button onClick={() => openAvailabilityModal(member)} className="text-[#2563EB] hover:text-blue-700 transition-colors">
                          <Edit2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        );
      case 'Assignment History':
        return (
          <>
            <div className="flex justify-end mb-6 w-full">
              <button 
                onClick={() => handleExport(assignmentHistory, 'assignment_history')} 
                className="px-5 py-2 bg-gradient-to-r from-[#2563EB] to-blue-600 text-white rounded-lg font-semibold shadow-md hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center"
              >
                <Download size={16} className="mr-2" /> Export
              </button>
            </div>
            <div className="mb-4 w-full">
              <input
                type="text"
                placeholder="Search assignment history..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              />
            </div>
            <div className="bg-white shadow-md rounded-lg p-6 w-full">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">Role Assignment History</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Role</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Assigned To</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAssignmentHistory.map(entry => (
                      <tr key={entry.id} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-800">{entry.role}</td>
                        <td className="px-6 py-4 text-sm text-gray-800">{entry.assignedTo}</td>
                        <td className="px-6 py-4 text-sm text-gray-800">{entry.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        );
      case 'Analytics':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Candidate Status Distribution</h3>
              <div className="h-64 flex items-end space-x-4">
                {Object.entries({
                  'Shortlisted': stats.shortlisted,
                  'Selected': stats.selected,
                  'Rejected': stats.rejected,
                  'On Hold': stats.onHold,
                  'Interview Scheduled': stats.interviewScheduled
                }).map(([status, count]) => (
                  <div key={status} className="flex flex-col items-center flex-1">
                    <div 
                      className={`w-full rounded-t-md ${
                        status === 'Shortlisted' ? 'bg-[#2563EB]' : 
                        status === 'Selected' ? 'bg-green-500' : 
                        status === 'Rejected' ? 'bg-red-500' : 
                        status === 'On Hold' ? 'bg-yellow-500' : 
                        'bg-purple-500'
                      } transition-all duration-300 hover:opacity-80`} 
                      style={{ height: `${(count / stats.totalResumes) * 200}px` }}
                    ></div>
                    <div className="text-xs font-medium mt-2 text-center text-gray-700">{status}</div>
                    <div className="text-sm font-bold text-gray-800">{count}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Department-wise Openings</h3>
              <div className="h-64">
                {Object.entries(
                  rolesData.reduce((acc, role) => {
                    acc[role.department] = (acc[role.department] || 0) + 1;
                    return acc;
                  }, {})
                ).map(([department, count], index) => (
                  <div key={department} className="mb-4">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{department}</span>
                      <span className="text-sm font-medium text-gray-700">{count}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className={`h-2.5 rounded-full ${
                          index % 5 === 0 ? 'bg-[#2563EB]' : 
                          index % 5 === 1 ? 'bg-green-600' : 
                          index % 5 === 2 ? 'bg-yellow-600' : 
                          index % 5 === 3 ? 'bg-purple-600' : 
                          'bg-red-600'
                        } transition-all duration-300`} 
                        style={{ width: `${(count / rolesData.length) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full bg-gray-100 font-sans">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8 w-full">
        {[
          { label: 'Selected', count: stats.selected, icon: UserCheck, color: 'green', change: '+12%' },
          { label: 'Rejected', count: stats.rejected, icon: UserX, color: 'red', change: '-5%' },
          { label: 'On Hold', count: stats.onHold, icon: Clock, color: 'yellow', change: '+3%' },
          { label: 'Shortlisted', count: stats.shortlisted, icon: UserPlus, color: 'blue', change: '+18%' },
          { label: 'Interview Scheduled', count: stats.interviewScheduled, icon: Users, color: 'purple', change: '+8%' },
          { label: 'Total JD', count: stats.totalJD, icon: FileText, color: 'teal', change: '+15%' },
        ].map(stat => (
          <div key={stat.label} className="rounded-xl shadow-lg p-5 bg-white transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
            <div className="flex items-center justify-between">
              <div className={`bg-${stat.color}-600 p-3 rounded-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <span className={`text-xs font-medium text-${stat.color}-600 bg-${stat.color}-100 px-2 py-1 rounded-full`}>
                {stat.change}
              </span>
            </div>
            <div className="flex items-baseline justify-between mt-4">
              <h3 className="text-sm font-medium text-gray-800">{stat.label}</h3>
              <p className="text-2xl font-bold text-gray-800">{stat.count}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="w-full">
        <div className="flex flex-wrap gap-4 mb-8 border-b border-gray-200 pb-2 w-full">
          {['Roles', 'Interviews', 'Team Members', 'Assignment History', 'Analytics'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 text-sm font-medium rounded-t-lg transition-all duration-200 ${
                activeTab === tab 
                  ? 'bg-[#2563EB] text-white shadow-md' 
                  : 'text-gray-600 hover:bg-gray-200 hover:text-[#2563EB]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {renderTabContent()}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 flex justify-center items-center z-50 bg-gray-800 bg-opacity-60">
          <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                {modalType === 'changeAvailability' ? 'Change Availability' : 
                 modalType.includes('Role') ? 'Role' : 
                 modalType.includes('Interview') ? 'Interview' : 'Team Member'} Form
              </h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-800 transition-colors">
                <X size={24} />
              </button>
            </div>
            {modalType === 'changeAvailability' ? (
              <div>
                <p className="mb-6 text-gray-600">Change availability status for <span className="font-medium">{modalData?.name}</span></p>
                <div className="flex justify-between gap-4">
                  <button
                    onClick={() => {
                      handleTeamMemberAvailabilityChange(modalData.id, true);
                      setIsModalOpen(false);
                    }}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold shadow-md hover:from-green-600 hover:to-green-700 transition-all duration-200"
                  >
                    Set Available
                  </button>
                  <button
                    onClick={() => {
                      handleTeamMemberAvailabilityChange(modalData.id, false);
                      setIsModalOpen(false);
                    }}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-semibold shadow-md hover:from-red-600 hover:to-red-700 transition-all duration-200"
                  >
                    Set Unavailable
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {modalType === 'addRole' || modalType === 'editRole' ? (
                  <>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Role Title</label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
                      <input
                        type="text"
                        name="assignedTo"
                        value={formData.assignedTo}
                        onChange={handleInputChange}
                        required
                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                      <select
                        name="department"
                        value={formData.department}
                        onChange={handleInputChange}
                        required
                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                      >
                        <option value="">Select Department</option>
                        <option value="Engineering">Engineering</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Product">Product</option>
                        <option value="Sales">Sales</option>
                        <option value="HR">HR</option>
                      </select>
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        required
                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                      >
                        <option value="">Select Status</option>
                        <option value="Open">Open</option>
                        <option value="Filled">Filled</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date Assigned</label>
                      <input
                        type="date"
                        name="dateAssigned"
                        value={formData.dateAssigned}
                        onChange={handleInputChange}
                        required
                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                      />
                    </div>
                  </>
                ) : modalType === 'addInterview' || modalType === 'editInterview' ? (
                  <>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Candidate</label>
                      <input
                        type="text"
                        name="candidate"
                        value={formData.candidate}
                        onChange={handleInputChange}
                        required
                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Interview Date</label>
                      <input
                        type="date"
                        name="interviewDate"
                        value={formData.interviewDate}
                        onChange={handleInputChange}
                        required
                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                      <select
                        name="role"
                        value={formData.role}
                        onChange={handleInputChange}
                        required
                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                      >
                        <option value="">Select Role</option>
                        {rolesData.map(role => (
                          <option key={role.id} value={role.title}>
                            {role.title}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Interviewer</label>
                      <select
                        name="interviewer"
                        value={formData.interviewer}
                        onChange={handleInputChange}
                        required
                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                      >
                        <option value="">Select Interviewer</option>
                        {teamMembers.filter(member => member.available).map(member => (
                          <option key={member.id} value={member.name}>
                            {member.name} ({member.role})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        required
                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                      >
                        <option value="">Select Status</option>
                        <option value="Scheduled">Scheduled</option>
                        <option value="Pending">Pending</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                  </>
                ) : modalType === 'assignInterview' ? (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select New Interviewer</label>
                    <select
                      name="newInterviewer"
                      value={formData.newInterviewer}
                      onChange={handleInputChange}
                      required
                      className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                    >
                      <option value="">Select Interviewer</option>
                      {teamMembers.filter(member => member.available && member.name !== modalData?.interviewer).map(member => (
                        <option key={member.id} value={member.name}>
                          {member.name} ({member.role})
                        </option>
                      ))}
                    </select>
                  </div>
                ) : modalType === 'addTeamMember' && (
                  <>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                      <select
                        name="role"
                        value={formData.role}
                        onChange={handleInputChange}
                        required
                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                      >
                        <option value="">Select Role</option>
                        <option value="Software Engineer">Software Engineer</option>
                        <option value="Marketing Manager">Marketing Manager</option>
                        <option value="Product Manager">Product Manager</option>
                        <option value="HR Manager">HR Manager</option>
                        <option value="Sales Manager">Sales Manager</option>
                      </select>
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
                      <select
                        name="available"
                        value={formData.available}
                        onChange={(e) => setFormData(prev => ({ ...prev, available: e.target.value === 'true' }))}
                        required
                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                      >
                        <option value="true">Available</option>
                        <option value="false">Unavailable</option>
                      </select>
                    </div>
                  </>
                )}
                <div className="flex justify-end">
                  <button 
                    type="submit" 
                    className="px-5 py-2 bg-gradient-to-r from-[#2563EB] to-blue-600 text-white rounded-lg font-semibold shadow-md hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
                  >
                    {modalType.startsWith('add') ? 'Add' : modalType.startsWith('edit') ? 'Update' : 'Save'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;