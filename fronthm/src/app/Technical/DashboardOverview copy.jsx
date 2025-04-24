import React, { useState } from 'react';
import { X, Edit2, UserPlus, Trash2, ArrowUpDown, Users, UserCheck, UserX, Clock, FileText } from 'lucide-react';

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

  const buttonStyle = "px-4 py-2 rounded text-sm text-white font-medium transition-colors duration-200";

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Roles':
        return (
          <>
            <div className="flex mb-6 space-x-6 items-center">
              <div className="p-2 bg-white rounded-lg shadow">
                <h3 className="text-sm font-medium mb-2">Roles</h3>
                <div className="flex space-x-3">
                  {['All', 'Open', 'Filled', 'Closed'].map(status => (
                    <button
                      key={status}
                      onClick={() => setSelectedRoleStatus(status)}
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-sm ${selectedRoleStatus === status ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
              <div className="p-2 bg-white rounded-lg shadow">
                <h3 className="text-sm font-medium mb-2">Department</h3>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="p-2 border rounded-md"
                >
                  {['All', 'Engineering', 'Marketing', 'Product', 'Sales', 'HR'].map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              <button onClick={() => openModal('addRole')} className={`${buttonStyle} bg-blue-600 hover:bg-blue-700`}>
                Add Role
              </button>
              {selectedRoles.length > 0 && (
                <button onClick={handleBulkDeleteRoles} className={`${buttonStyle} bg-red-600 hover:bg-red-700`}>
                  Delete Selected ({selectedRoles.length})
                </button>
              )}
            </div>
            <div className="overflow-x-auto bg-white shadow-md rounded-lg">
              <table className="table-auto w-full">
                <thead>
                  <tr className="bg-gray-100 text-left">
                    <th className="px-6 py-3 text-sm font-semibold">
                      <input type="checkbox" onChange={(e) => setSelectedRoles(e.target.checked ? paginatedRoles.map(role => role.id) : [])} />
                    </th>
                    <th onClick={() => handleSort('title')} className="px-6 py-3 text-sm font-semibold cursor-pointer">
                      Role Title <ArrowUpDown size={16} className="inline-block" />
                    </th>
                    <th className="px-6 py-3 text-sm font-semibold">Assigned To</th>
                    <th className="px-6 py-3 text-sm font-semibold">Department</th>
                    <th className="px-6 py-3 text-sm font-semibold">Status</th>
                    <th className="px-6 py-3 text-sm font-semibold">Date Assigned</th>
                    <th className="px-6 py-3 text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRoles.map(role => (
                    <tr key={role.id} className="border-b">
                      <td className="px-6 py-3 text-sm">
                        <input
                          type="checkbox"
                          checked={selectedRoles.includes(role.id)}
                          onChange={() => handleSelectRole(role.id)}
                        />
                      </td>
                      <td className="px-6 py-3 text-sm">{role.title}</td>
                      <td className="px-6 py-3 text-sm">{role.assignedTo}</td>
                      <td className="px-6 py-3 text-sm">{role.department}</td>
                      <td className="px-6 py-3 text-sm">{role.status}</td>
                      <td className="px-6 py-3 text-sm">{role.dateAssigned}</td>
                      <td className="px-6 py-3 text-sm space-x-2">
                        <button onClick={() => openModal('editRole', role)} className="text-blue-600 hover:text-blue-800">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDeleteRole(role.id)} className="text-red-600 hover:text-red-800">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-center mt-4 space-x-2">
              {Array.from({ length: pageCount }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentPage(index + 1)}
                  className={`px-3 py-1 rounded ${currentPage === index + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
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
            <div className="flex mb-6 space-x-6 items-center">
              <div className="p-2 bg-white rounded-lg shadow">
                <h3 className="text-sm font-medium mb-2">Interviews</h3>
                <div className="flex space-x-4">
                  {['All', 'Scheduled', 'Pending', 'Completed'].map(status => (
                    <button
                      key={status}
                      onClick={() => setSelectedInterviewStatus(status)}
                      className={`px-4 py-2 rounded-md text-sm ${selectedInterviewStatus === status ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={() => openModal('addInterview')} className={`${buttonStyle} bg-green-600 hover:bg-green-700`}>
                Add Interview
              </button>
            </div>
            <div className="overflow-x-auto bg-white shadow-md rounded-lg">
              <table className="table-auto w-full">
                <thead>
                  <tr className="bg-gray-100 text-left">
                    <th className="px-6 py-3 text-sm font-semibold">Candidate</th>
                    <th className="px-6 py-3 text-sm font-semibold">Interview Date</th>
                    <th className="px-6 py-3 text-sm font-semibold">Role</th>
                    <th className="px-6 py-3 text-sm font-semibold">Interviewer</th>
                    <th className="px-6 py-3 text-sm font-semibold">Status</th>
                    <th className="px-6 py-3 text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInterviews.map(interview => (
                    <tr key={interview.id} className="border-b">
                      <td className="px-6 py-3 text-sm">{interview.candidate}</td>
                      <td className="px-6 py-3 text-sm">{interview.interviewDate}</td>
                      <td className="px-6 py-3 text-sm">{interview.role}</td>
                      <td className="px-6 py-3 text-sm">{interview.interviewer}</td>
                      <td className="px-6 py-3 text-sm">{interview.status}</td>
                      <td className="px-6 py-3 text-sm space-x-2">
                        <button onClick={() => openModal('editInterview', interview)} className="text-blue-600 hover:text-blue-800">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDeleteInterview(interview.id)} className="text-red-600 hover:text-red-800">
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
            <div className="flex mb-6 space-x-6 items-center">
              <button onClick={() => openModal('addTeamMember')} className={`${buttonStyle} bg-purple-600 hover:bg-purple-700`}>
                Add Team Member
              </button>
            </div>
            <div className="bg-white shadow-md rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-2">Team Members</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTeamMembers.map(member => (
                  <div key={member.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold">{member.name}</h3>
                        <p className="text-sm text-gray-600">{member.role}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded text-sm ${member.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {member.available ? 'Available' : 'Unavailable'}
                        </span>
                        <button onClick={() => openAvailabilityModal(member)} className="text-blue-600 hover:text-blue-800">
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
          <div className="bg-white shadow-md rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-2">Role Assignment History</h2>
            <div className="overflow-x-auto">
              <table className="table-auto w-full">
                <thead>
                  <tr className="bg-gray-100 text-left">
                    <th className="px-6 py-3 text-sm font-semibold">Role</th>
                    <th className="px-6 py-3 text-sm font-semibold">Assigned To</th>
                    <th className="px-6 py-3 text-sm font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {assignmentHistory.map(entry => (
                    <tr key={entry.id} className="border-b">
                      <td className="px-6 py-3 text-sm">{entry.role}</td>
                      <td className="px-6 py-3 text-sm">{entry.assignedTo}</td>
                      <td className="px-6 py-3 text-sm">{entry.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'Analytics':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">Candidate Status Distribution</h3>
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
                        status === 'Shortlisted' ? 'bg-blue-500' : 
                        status === 'Selected' ? 'bg-green-500' : 
                        status === 'Rejected' ? 'bg-red-500' : 
                        status === 'On Hold' ? 'bg-yellow-500' : 
                        'bg-purple-500'
                      }`} 
                      style={{ height: `${(count / stats.totalResumes) * 200}px` }}
                    ></div>
                    <div className="text-xs font-medium mt-2 text-center">{status}</div>
                    <div className="text-sm font-bold">{count}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">Department-wise Openings</h3>
              <div className="h-64">
                {Object.entries(
                  rolesData.reduce((acc, role) => {
                    acc[role.department] = (acc[role.department] || 0) + 1;
                    return acc;
                  }, {})
                ).map(([department, count], index) => (
                  <div key={department} className="mb-4">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">{department}</span>
                      <span className="text-sm font-medium">{count}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className={`h-2.5 rounded-full ${
                          index % 5 === 0 ? 'bg-blue-600' : 
                          index % 5 === 1 ? 'bg-green-600' : 
                          index % 5 === 2 ? 'bg-yellow-600' : 
                          index % 5 === 3 ? 'bg-purple-600' : 
                          'bg-red-600'
                        }`} 
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
    <div className="container mx-auto p-4 bg-gray-50">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-6">
        {[
          { label: 'Selected', count: stats.selected, icon: UserCheck, color: 'green', change: '+12%' },
          { label: 'Rejected', count: stats.rejected, icon: UserX, color: 'red', change: '-5%' },
          { label: 'On Hold', count: stats.onHold, icon: Clock, color: 'yellow', change: '+3%' },
          { label: 'Shortlisted', count: stats.shortlisted, icon: UserPlus, color: 'blue', change: '+18%' },
          { label: 'Interview Scheduled', count: stats.interviewScheduled, icon: Users, color: 'purple', change: '+8%' },
          { label: 'Total JD', count: stats.totalJD, icon: FileText, color: 'teal', change: '+15%' },
        ].map(stat => (
          <div key={stat.label} className="rounded-xl shadow-lg p-4 transform transition-all duration-200 hover:scale-105 hover:shadow-xl">
            <div className="flex items-center justify-between">
              <div className={`bg-${stat.color}-600 p-2 rounded-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <span className={`text-xs font-medium text-${stat.color}-100 bg-${stat.color}-500 bg-opacity-60 px-2 py-1 rounded-full`}>
                {stat.change}
              </span>
            </div>
            <div className="flex items-baseline justify-between mt-4">
              <h3 className="text-sm font-medium text-gray-800">{stat.label}</h3>
              <p className="text-2xl font-bold text-gray-800 mr-4">{stat.count}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mb-6 border-b">
        {['Roles', 'Interviews', 'Team Members', 'Assignment History', 'Analytics'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
              activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {renderTabContent()}

      {isModalOpen && (
        <div className="fixed inset-0 flex justify-center items-center z-50 bg-gray-800 bg-opacity-50">
          <div className="bg-white p-8 rounded-lg shadow-lg w-96">
            <div className="flex justify-between mb-4">
              <h2 className="text-2xl font-semibold">
                {modalType === 'changeAvailability' ? 'Change Availability' : 
                 modalType.includes('Role') ? 'Role' : 
                 modalType.includes('Interview') ? 'Interview' : 'Team Member'} Form
              </h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-800">
                <X size={20} />
              </button>
            </div>
            {modalType === 'changeAvailability' ? (
              <div>
                <p className="mb-4">Change availability status for {modalData?.name}</p>
                <div className="flex justify-between">
                  <button
                    onClick={() => {
                      handleTeamMemberAvailabilityChange(modalData.id, true);
                      setIsModalOpen(false);
                    }}
                    className={`${buttonStyle} bg-green-600 hover:bg-green-700`}
                  >
                    Set Available
                  </button>
                  <button
                    onClick={() => {
                      handleTeamMemberAvailabilityChange(modalData.id, false);
                      setIsModalOpen(false);
                    }}
                    className={`${buttonStyle} bg-red-600 hover:bg-red-700`}
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
                      <label className="block text-sm font-medium text-gray-700">Role Title</label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                        className="w-full p-3 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700">Assigned To</label>
                      <input
                        type="text"
                        name="assignedTo"
                        value={formData.assignedTo}
                        onChange={handleInputChange}
                        required
                        className="w-full p-3 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700">Department</label>
                      <select
                        name="department"
                        value={formData.department}
                        onChange={handleInputChange}
                        required
                        className="w-full p-3 border border-gray-300 rounded-md"
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
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        required
                        className="w-full p-3 border border-gray-300 rounded-md"
                      >
                        <option value="">Select Status</option>
                        <option value="Open">Open</option>
                        <option value="Filled">Filled</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700">Date Assigned</label>
                      <input
                        type="date"
                        name="dateAssigned"
                        value={formData.dateAssigned}
                        onChange={handleInputChange}
                        required
                        className="w-full p-3 border border-gray-300 rounded-md"
                      />
                    </div>
                  </>
                ) : modalType === 'addInterview' || modalType === 'editInterview' ? (
                  <>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700">Candidate</label>
                      <input
                        type="text"
                        name="candidate"
                        value={formData.candidate}
                        onChange={handleInputChange}
                        required
                        className="w-full p-3 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700">Interview Date</label>
                      <input
                        type="date"
                        name="interviewDate"
                        value={formData.interviewDate}
                        onChange={handleInputChange}
                        required
                        className="w-full p-3 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700">Role</label>
                      <select
                        name="role"
                        value={formData.role}
                        onChange={handleInputChange}
                        required
                        className="w-full p-3 border border-gray-300 rounded-md"
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
                      <label className="block text-sm font-medium text-gray-700">Interviewer</label>
                      <select
                        name="interviewer"
                        value={formData.interviewer}
                        onChange={handleInputChange}
                        required
                        className="w-full p-3 border border-gray-300 rounded-md"
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
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        required
                        className="w-full p-3 border border-gray-300 rounded-md"
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
                    <label className="block text-sm font-medium text-gray-700">Select New Interviewer</label>
                    <select
                      name="newInterviewer"
                      value={formData.newInterviewer}
                      onChange={handleInputChange}
                      required
                      className="w-full p-3 border border-gray-300 rounded-md"
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
                      <label className="block text-sm font-medium text-gray-700">Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full p-3 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700">Role</label>
                      <select
                        name="role"
                        value={formData.role}
                        onChange={handleInputChange}
                        required
                        className="w-full p-3 border border-gray-300 rounded-md"
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
                      <label className="block text-sm font-medium text-gray-700">Availability</label>
                      <select
                        name="available"
                        value={formData.available}
                        onChange={(e) => setFormData(prev => ({ ...prev, available: e.target.value === 'true' }))}
                        required
                        className="w-full p-3 border border-gray-300 rounded-md"
                      >
                        <option value="true">Available</option>
                        <option value="false">Unavailable</option>
                      </select>
                    </div>
                  </>
                )}
                <div className="flex justify-end">
                  <button type="submit" className={`${buttonStyle} bg-blue-600 hover:bg-blue-700`}>
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