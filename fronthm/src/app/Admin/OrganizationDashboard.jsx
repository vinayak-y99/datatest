
import React, { useState, useEffect } from 'react';
import { Users, Briefcase, UserPlus, Building2, Filter, Edit, Trash2 } from 'lucide-react';
import AddMemberForm from './AddMemberForm';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api';

const DepartmentCard = ({ title, count = 0, icon: Icon = Users, color = 'bg-blue-500', onCardClick, isActive }) => {
  return (
    <div
      className={`bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-200 cursor-pointer ${isActive ? 'ring-2 ring-blue-500' : ''}`}
      onClick={onCardClick}
    >
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon size={24} className="text-white" />
        </div>
        <div>
          <h3 className="text-gray-700 font-semibold">{title}</h3>
          <p className="text-2xl font-bold mt-1">{count}</p>
        </div>
      </div>
    </div>
  );
};

const OrganizationDashboard = () => {
  const [showAddMemberForm, setShowAddMemberForm] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingMember, setEditingMember] = useState(null);

  const departments = [
    { id: 'hr', title: "HIRING MANAGERS", type: "HR", icon: Briefcase, color: "bg-blue-500" },
    { id: 'tech-dept', title: "TECHNICAL", type: "TECHNICAL", icon: Users, color: "bg-green-500" },
    { id: 'recruit-dept', title: "RECRUITERS", type: "RECRUITMENT", icon: UserPlus, color: "bg-purple-500" },
    { id: 'client-dept', title: "CLIENTS", type: "CLIENT", icon: Building2, color: "bg-orange-500" }
  ];

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/hiredb/organizations`);
      if (!response.ok) throw new Error('Failed to fetch members');
      const data = await response.json();
      setMembers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = (newMember) => {
    setMembers(prev => [...prev, newMember]);
    setShowAddMemberForm(false);
  };

  const handleEdit = (member) => {
    setEditingMember(member);
    setShowAddMemberForm(true);
  };

  const handleUpdate = async (updatedMember) => {
    try {
      const response = await fetch(`${API_BASE_URL}/hiredb/organizations/${editingMember.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedMember)
      });
      
      if (!response.ok) throw new Error('Failed to update member');
      
      const data = await response.json();
      setMembers(members.map(m => m.id === data.id ? data : m));
      setEditingMember(null);
      setShowAddMemberForm(false);
    } catch (error) {
      alert("Failed to update the user.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const response = await fetch(`${API_BASE_URL}/hiredb/organizations/${id}`, { 
          method: "DELETE" 
        });
        
        if (!response.ok) throw new Error('Failed to delete member');
        
        setMembers(members.filter(member => member.id !== id));
        alert("User deleted successfully");
      } catch (error) {
        alert("Failed to delete the user.");
      }
    }
  };

  const handleDepartmentSelect = (deptType) => {
    setSelectedFilter(selectedFilter === deptType ? "all" : deptType);
  };

  const filteredMembers = selectedFilter === "all" ? members : members.filter(m => m.department === selectedFilter);

  const getFilterLabel = () => {
    if (selectedFilter === "all") return "All Departments";
    const dept = departments.find(d => d.type === selectedFilter);
    return dept ? dept.title : "All Departments";
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (error) return <div className="text-center py-10 text-red-500">Error: {error}</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">FASTHIRE99</h2>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
          onClick={() => setShowAddMemberForm(!showAddMemberForm)}
        >
          <UserPlus size={20} />
          {showAddMemberForm ? 'Hide Form' : 'Add User'}
        </button>
      </div>

      {/* Department Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {departments.map(dept => (
          <DepartmentCard
            key={dept.type}
            {...dept}
            count={members.filter(m => m.department === dept.type).length}
            isActive={selectedFilter === dept.type}
            onCardClick={() => handleDepartmentSelect(dept.type)}
          />
        ))}
      </div>

      {/* Add Member Form */}
      {showAddMemberForm && (
        <AddMemberForm 
          onAddMember={handleAddMember} 
          editingMember={editingMember}
          onUpdate={handleUpdate}
        />
      )}

      {/* User Table */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">Users</h3>
          <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg">
            <Filter size={16} className="text-gray-500" />
            <span className="text-sm font-medium">Showing: <span className="text-blue-600">{getFilterLabel()}</span></span>
            {selectedFilter !== "all" && (
              <button 
                onClick={() => setSelectedFilter("all")}
                className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {filteredMembers.length > 0 ? (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created At</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMembers.slice().reverse().map(member => (
                  <tr key={member.id}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{member.user_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{member.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 uppercase">{member.department}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(member.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 flex gap-3">
                      <Edit className="text-blue-600 cursor-pointer" onClick={() => handleEdit(member)} />
                      <Trash2 className="text-red-600 cursor-pointer" onClick={() => handleDelete(member.id)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p className="text-gray-500 text-center py-6">No users found.</p>}
      </div>
    </div>
  );
};

export default OrganizationDashboard;