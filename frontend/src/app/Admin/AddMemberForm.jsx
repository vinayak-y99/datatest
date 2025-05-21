import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

// Update INITIAL_FORM_STATE to match backend model
const INITIAL_FORM_STATE = {
  name: "",
  email: "",
  password: "",
  username: "",
  role_id: 0,
  credentials: {"active": true}
};

const AddMemberForm = ({ onAddMember, editingMember, onUpdate }) => {
  // Initialize with safe defaults to prevent undefined values
  const [formData, setFormData] = useState({
    ...INITIAL_FORM_STATE,
    ...(editingMember || {})
  });
  const [notification, setNotification] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch roles from backend
  useEffect(() => {
    const fetchRoles = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/admin/users`);
        if (!response.ok) {
          throw new Error('Failed to fetch roles');
        }
        const data = await response.json();
        
        // Log the actual roles from the database
        console.log("Available roles:", data);
        
        // Transform the data to match the expected format
        const formattedRoles = data.map(role => ({
          id: role.role_id,
          value: role.role_id.toString(),
          label: role.role_name
        }));
        
        setRoles(formattedRoles);
        
        // If we're creating a new user, set the first role as default if available
        if (!editingMember && formattedRoles.length > 0) {
          setFormData(prev => ({
            ...prev,
            role_id: parseInt(formattedRoles[0].id),
            role: formattedRoles[0].value
          }));
        }
      } catch (error) {
        showNotification(`Error fetching roles: ${error.message}`, "error");
        // Fallback to default roles if API fails
        setRoles([
          { id: 1, value: "1", label: "HR" },
          { id: 2, value: "2", label: "TECHNICAL" },
          { id: 3, value: "3", label: "RECRUITMENT" },
          { id: 4, value: "4", label: "CLIENT" }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, []);

  useEffect(() => {
    if (editingMember) {
      // Ensure all required fields exist even if not provided in editingMember
      setFormData({
        ...INITIAL_FORM_STATE,
        ...editingMember,
        // Make sure role is set for the dropdown
        role: editingMember.role_id ? editingMember.role_id.toString() : ""
      });
    }
  }, [editingMember]);

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for role selection to convert to role_id
    if (name === "role") {
      // Find the role object by value
      const selectedRole = roles.find(role => role.value === value);
      setFormData(prev => ({
        ...prev,
        role_id: selectedRole ? parseInt(selectedRole.id) : 0,
        role: value // Keep the role value for the dropdown
      }));
    } else if (name === "user_name") {
      // Update both name and username fields when user_name changes
      setFormData(prev => ({
        ...prev,
        name: value,
        username: value
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const validateForm = () => {
    // Add default @gmail.com if not present
    if (!formData.email.includes('@')) {
      setFormData(prev => ({
        ...prev,
        email: `${prev.email}@gmail.com`
      }));
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(formData.email)) {
      showNotification("Please enter a valid email address", "error");
      return false;
    }
 
    if (formData.password.length < 6) {
      showNotification("Password must be at least 6 characters", "error");
      return false;
    }

    if (!formData.role_id) {
      showNotification("Please select a role", "error");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
     
    if (!validateForm()) {
      setLoading(false);
      return;
    }

    // Prepare the data payload according to backend expectations
    const userData = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      username: formData.username || formData.name, // Ensure username is set
      role_id: parseInt(formData.role_id),
      credentials: {"active": true}
    };

    try {
      if (editingMember) {
        // Update existing user
        const response = await fetch(`${API_BASE_URL}/admin/users/${editingMember.user_id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(userData)
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Failed to update member');
        }
        
        const data = await response.json();
        onUpdate?.(data);
        showNotification("Member Updated Successfully!", "success");
      } else {
        // Create new user - using the single user endpoint
        const response = await fetch(`${API_BASE_URL}/admin/user`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(userData)
        });
      
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Failed to add member');
        }

        const data = await response.json();
        onAddMember?.(data);
        showNotification("Member Added Successfully!", "success");
      }
   
      // Reset form after successful submission
      setFormData(INITIAL_FORM_STATE);
    } catch (error) {
      showNotification(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-full mx-auto bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-blue-200 to-indigo-100 p-1">
        <h3 className="text-xl font-bold text-black mb-2 text-center">
          {editingMember ? "Edit User" : "Add User"}
        </h3>
      </div>

      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`mx-6 p-3 mt-4 text-white text-center flex items-center justify-center gap-2 rounded-lg ${
              notification.type === "success" ? "bg-green-500" : "bg-red-500"
            }`}
          >
            {notification.type === "success" ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>
      <form onSubmit={handleSubmit} className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                name="user_name"
                type="text"
                className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="johndoe"
                value={formData.name || ""}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </div>
              <input
                name="email"
                type="email"
                className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="johndoe@example.com"
                value={formData.email || ""}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition pr-10"
                placeholder="••••••••"
                value={formData.password || ""}
                onChange={handleInputChange}
                required={!editingMember}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 transition"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                    <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            </div>
            <div className="mt-1">
              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                <div
                  className={`h-1.5 rounded-full ${
                    !formData.password || formData.password.length === 0 ? 'w-0' :
                    formData.password.length < 6 ? 'w-1/4 bg-red-500' :
                    formData.password.length < 10 ? 'w-2/4 bg-yellow-500' :
                    'w-full bg-green-500'}`}
                ></div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
            <div className="relative">
              {loading ? (
                <div className="flex items-center justify-center py-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                  <span className="ml-2 text-sm text-gray-500">Loading roles...</span>
                </div>
              ) : (
                <select
                  name="role"
                  value={formData.role || ""}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  required
                  disabled={loading}
                >
                  <option value="">Select Role</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            className="w-auto bg-gradient-to-r from-blue-500 to-indigo-300 text-white py-2 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-800 transition duration-300 ease-in-out transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              editingMember ? "Update Member" : "Add Member"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddMemberForm;

