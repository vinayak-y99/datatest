"use client"
import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Save, Trash2, AlertCircle, ChevronDown } from 'lucide-react';
import axios from 'axios';

const RoleManagement = () => {
  const [roles, setRoles] = useState([]);
  const [showAddRole, setShowAddRole] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newRole, setNewRole] = useState({
    role_name: '',
    credentials: {
      access: 'limited'
    }
  });

  const fetchRoles = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://localhost:8000/admin');
      setRoles(response.data);
    } catch (error) {
      console.error('Error fetching roles:', error);
      setError('Failed to load roles. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleAddRole = async () => {
    if (!newRole.role_name.trim()) {
      return; // Prevent empty role names
    }
    
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/hiredb/roles', newRole);
      setRoles([...roles, response.data]);
      setShowAddRole(false);
      setNewRole({
        role_name: '',
        credentials: { access: 'limited' }
      });
    } catch (error) {
      console.error('Error adding role:', error);
      setError('Failed to add role. Please try again.');
    }
  };

  const handleDeleteRole = async (roleId) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/api/hiredb/roles/${roleId}`);
      setRoles(roles.filter(role => role.role_id !== roleId));
    } catch (error) {
      console.error('Error deleting role:', error);
      setError('Failed to delete role. Please try again.');
    }
  };

  const handleUpdateRole = async (roleId) => {
    if (!editingRole.role_name.trim()) {
      return; // Prevent empty role names
    }
    
    try {
      const response = await axios.put(`http://127.0.0.1:8000/api/hiredb/roles/${roleId}`, editingRole);
      setRoles(roles.map(role => role.role_id === roleId ? response.data : role));
      setEditingRole(null);
    } catch (error) {
      console.error('Error updating role:', error);
      setError('Failed to update role. Please try again.');
    }
  };

  const accessLevelBadge = (access) => {
    const levels = {
      'admin': 'bg-purple-100 text-purple-800',
      'full': 'bg-blue-100 text-blue-800',
      'moderate': 'bg-green-100 text-green-800',
      'limited': 'bg-gray-100 text-gray-800',
    };
    return levels[access] || levels.limited;
  };

  return (
    <div className="p-6 max-w-full mx-auto bg-white rounded-xl shadow-md">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Role Management</h1>
          <p className="text-gray-500 mt-1">Create and manage user roles and permissions</p>
        </div>
        <button 
          onClick={() => setShowAddRole(!showAddRole)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200 shadow-sm"
        >
          <Plus size={18} /> Add Role
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200 text-red-700 flex items-center gap-2">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {showAddRole && (
        <div className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Create New Role</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="role-name" className="block text-sm font-medium text-gray-700 mb-1">Role Name</label>
              <input
                id="role-name"
                type="text"
                value={newRole.role_name}
                onChange={(e) => setNewRole({...newRole, role_name: e.target.value})}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="Enter role name"
              />
            </div>
            <div>
              <label htmlFor="access-level" className="block text-sm font-medium text-gray-700 mb-1">Access Level</label>
              <div className="relative">
                <select
                  id="access-level"
                  value={newRole.credentials.access}
                  onChange={(e) => setNewRole({
                    ...newRole, 
                    credentials: {...newRole.credentials, access: e.target.value}
                  })}
                  className="appearance-none w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                >
                  <option value="limited">Limited</option>
                  <option value="moderate">Moderate</option>
                  <option value="full">Full</option>
                  <option value="admin">Admin</option>
                </select>
                <ChevronDown size={18} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <button
              onClick={() => setShowAddRole(false)}
              className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 text-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddRole}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
              disabled={!newRole.role_name.trim()}
            >
              Save Role
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : roles.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <p className="text-gray-500">No roles found. Create your first role to get started.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full border-collapse">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Role Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Created At</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Access Level</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {roles.map(role => (
                <tr key={role.role_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    {editingRole?.role_id === role.role_id ? (
                      <input
                        type="text"
                        value={editingRole.role_name}
                        onChange={(e) => setEditingRole({...editingRole, role_name: e.target.value})}
                        className="w-full px-3 py-1 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    ) : (
                      <span className="font-medium text-gray-800">{role.role_name}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {new Date(role.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${accessLevelBadge(role.credentials.access)}`}>
                      {(role.credentials.access || 'limited').charAt(0).toUpperCase() + (role.credentials.access || 'limited').slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-3 justify-end">
                      {editingRole?.role_id === role.role_id ? (
                        <>
                          <button 
                            onClick={() => handleUpdateRole(role.role_id)}
                            className="text-gray-600 hover:text-green-600 p-1 rounded-full hover:bg-green-50 transition-colors"
                            title="Save"
                          >
                            <Save size={18} />
                          </button>
                          <button 
                            onClick={() => setEditingRole(null)}
                            className="text-gray-600 hover:text-gray-900 p-1 rounded-full hover:bg-gray-100 transition-colors"
                            title="Cancel"
                          >
                            <Plus size={18} className="rotate-45" />
                          </button>
                        </>
                      ) : (
                        <button 
                          onClick={() => setEditingRole(role)}
                          className="text-gray-600 hover:text-blue-600 p-1 rounded-full hover:bg-blue-50 transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </button>
                      )}
                      <button 
                        onClick={() => handleDeleteRole(role.role_id)}
                        className="text-gray-600 hover:text-red-600 p-1 rounded-full hover:bg-red-50 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RoleManagement;