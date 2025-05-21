import React, { useState, useEffect } from "react";
import { Users, Briefcase, UserPlus, Building2, Edit, Trash2 } from 'lucide-react';
import AddMemberForm from "./AddMemberForm";

const OrganizationManager = () => {
  const [organizations, setOrganizations] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [activeOrg, setActiveOrg] = useState(null);
  const [formData, setFormData] = useState({
    organizationName: "",
    username: "",
    password: "",
    email: "",
  });
  
  // New state for managing user form visibility
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [users, setUsers] = useState([]);

  // Load organizations from localStorage on component mount
  useEffect(() => {
    const savedOrgs = localStorage.getItem("organizations");
    if (savedOrgs) {
      setOrganizations(JSON.parse(savedOrgs));
    }
    
    const savedActiveOrg = localStorage.getItem("activeOrg");
    if (savedActiveOrg !== null) {
      setActiveOrg(parseInt(savedActiveOrg));
    }
    
    // Load users from localStorage
    const savedUsers = localStorage.getItem("users");
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    }
  }, []);

  // Save organizations to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("organizations", JSON.stringify(organizations));
  }, [organizations]);
  
  // Save users to localStorage when they change
  useEffect(() => {
    localStorage.setItem("users", JSON.stringify(users));
  }, [users]);

  // Save active organization to localStorage when it changes
  useEffect(() => {
    if (activeOrg !== null) {
      localStorage.setItem("activeOrg", activeOrg.toString());
    } else {
      localStorage.removeItem("activeOrg");
    }
  }, [activeOrg]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Toggle form visibility
  const toggleForm = () => {
    setShowForm(!showForm);
    if (!showForm) {
      // Reset form when opening
      setFormData({
        organizationName: "",
        username: "",
        password: "",
        email: "",
      });
      setEditIndex(null);
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editIndex !== null) {
      // Update existing organization
      const updatedOrgs = [...organizations];
      updatedOrgs[editIndex] = formData;
      setOrganizations(updatedOrgs);
      setEditIndex(null);
    } else {
      // Add new organization
      setOrganizations([...organizations, formData]);
      // Set as active org if it's the first one
      if (organizations.length === 0) {
        setActiveOrg(0);
      }
    }
    
    // Hide form after submission
    setShowForm(false);
    
    // Reset form data
    setFormData({
      organizationName: "",
      username: "",
      password: "",
      email: "",
    });
  };

  // Delete organization
  const handleDelete = (index) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this organization?");
    if (!confirmDelete) return;
    
    const updatedOrgs = organizations.filter((_, i) => i !== index);
    setOrganizations(updatedOrgs);
    
    // If the active org was deleted, reset activeOrg
    if (activeOrg === index) {
      setActiveOrg(null);
    } else if (activeOrg > index) {
      // Adjust activeOrg index if a preceding org was deleted
      setActiveOrg(activeOrg - 1);
    }
  };

  // Edit organization
  const handleEdit = (index) => {
    setFormData(organizations[index]);
    setEditIndex(index);
    setShowForm(true);
  };

  // Set active organization
  const handleOrgClick = (index) => {
    if (activeOrg === index) {
      // Toggle off if clicking the active org
      setActiveOrg(null);
    } else {
      setActiveOrg(index);
    }
  };
  
  // New handler to toggle user form visibility
  const toggleUserForm = () => {
    setShowUserForm(!showUserForm);
    if (showUserForm) {
      setEditingUser(null);
    }
  };
  
  // Handler for adding a new user
  const handleAddUser = (userData) => {
    // Add organization ID to the user data
    const newUser = {
      ...userData,
      organizationId: activeOrg !== null ? organizations[activeOrg].organizationName : null
    };
    setUsers([...users, newUser]);
    setShowUserForm(false);
  };
  
  // Handler for updating an existing user
  const handleUpdateUser = (updatedUserData) => {
    const userIndex = users.findIndex(user => user.email === updatedUserData.email);
    if (userIndex !== -1) {
      const updatedUsers = [...users];
      updatedUsers[userIndex] = updatedUserData;
      setUsers(updatedUsers);
    }
    setShowUserForm(false);
    setEditingUser(null);
  };

  // Role cards data based on the second file
  const roles = [
    { id: 'hr', title: "HIRING MANAGERS", type: "HR", icon: Briefcase, color: "#4299e1" },
    { id: 'tech-dept', title: "TECHNICAL", type: "TECHNICAL", icon: Users, color: "#48bb78" },
    { id: 'recruit-dept', title: "RECRUITERS", type: "RECRUITMENT", icon: UserPlus, color: "#9f7aea" },
    { id: 'client-dept', title: "CLIENTS", type: "CLIENT", icon: Building2, color: "#ed8936" }
  ];
  
  // Filter users by active organization
  const orgUsers = activeOrg !== null 
    ? users.filter(user => user.organizationId === organizations[activeOrg].organizationName)
    : [];

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        marginBottom: "20px"
      }}>
        <h1>Organization Management</h1>
        
        {/* Add Organization Button - Now in top right */}
        <button 
          onClick={toggleForm}
          style={{
            padding: "10px 15px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "bold"
          }}
        >
          {showForm ? "Hide" : "Add Organization"}
        </button>
      </div>
      
      {/* Organization Form */}
      {showForm && (
        <div style={{
          border: "1px solid #ddd",
          padding: "20px",
          borderRadius: "8px",
          marginBottom: "20px",
          backgroundColor: "#f9f9f9"
        }}>
          <h2>{editIndex !== null ? "Edit Organization" : "Create New Organization"}</h2>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                Organization Name:
              </label>
              <input
                type="text"
                name="organizationName"
                value={formData.organizationName}
                onChange={handleInputChange}
                required
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "4px",
                  border: "1px solid #ddd"
                }}
              />
            </div>
            
            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                Username:
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "4px",
                  border: "1px solid #ddd"
                }}
              />
            </div>
            
            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                Password:
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "4px",
                  border: "1px solid #ddd"
                }}
              />
            </div>
            
            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                Email:
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "4px",
                  border: "1px solid #ddd"
                }}
              />
            </div>
            
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                type="submit"
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#007BFF",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer"
                }}
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Organizations List */}
      {organizations.length > 0 && (
        <div>
          <h2>Organizations</h2>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#f2f2f2" }}>
                  <th style={{ padding: "12px", textAlign: "left", border: "1px solid #ddd" }}>Organization Name</th>
                  <th style={{ padding: "12px", textAlign: "left", border: "1px solid #ddd" }}>Username</th>
                  <th style={{ padding: "12px", textAlign: "left", border: "1px solid #ddd" }}>Email</th>
                  <th style={{ padding: "12px", textAlign: "left", border: "1px solid #ddd" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {organizations.map((org, index) => (
                  <tr 
                    key={index}
                    onClick={() => handleOrgClick(index)}
                    style={{
                      backgroundColor: activeOrg === index ? "#e6f7ff" : "white",
                      cursor: "pointer"
                    }}
                  >
                    <td style={{ padding: "12px", textAlign: "left", border: "1px solid #ddd" }}>{org.organizationName}</td>
                    <td style={{ padding: "12px", textAlign: "left", border: "1px solid #ddd" }}>{org.username}</td>
                    <td style={{ padding: "12px", textAlign: "left", border: "1px solid #ddd" }}>{org.email}</td>
                    <td style={{ padding: "12px", textAlign: "left", border: "1px solid #ddd" }}>
                      <div style={{ display: "flex", gap: "10px" }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(index);
                          }}
                          style={{
                            padding: "6px 12px",
                            backgroundColor: "#FFC107",
                            color: "black",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer"
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(index);
                          }}
                          style={{
                            padding: "6px 12px",
                            backgroundColor: "#DC3545",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer"
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Organization Details Section - Moved to top */}
      {organizations.length > 0 && activeOrg !== null && (
        <div style={{
          marginTop: "20px",
          marginBottom: "20px",
          padding: "15px",
          backgroundColor: "#f0f8ff",
          borderRadius: "8px",
          border: "1px solid #b8daff"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3>Organization Details: {organizations[activeOrg].organizationName}</h3>
            <button
              onClick={() => setActiveOrg(null)}
              style={{
                padding: "5px 10px",
                backgroundColor: "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "12px"
              }}
            >
              Hide Details
            </button>
          </div>
          
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", 
            gap: "15px",
            marginTop: "15px"
          }}>
            <div style={{ 
              padding: "15px", 
              backgroundColor: "white", 
              borderRadius: "8px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
            }}>
              <h4 style={{ margin: "0 0 10px 0", color: "#4a5568" }}>Organization Details</h4>
              <p><strong>Name:</strong> {organizations[activeOrg].organizationName}</p>
              <p><strong>Username:</strong> {organizations[activeOrg].username}</p>
              <p><strong>Email:</strong> {organizations[activeOrg].email}</p>
            </div>
            
            <div style={{ 
              padding: "15px", 
              backgroundColor: "white", 
              borderRadius: "8px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
            }}>
              <h4 style={{ margin: "0 0 10px 0", color: "#4a5568" }}>Quick Stats</h4>
              <p><strong>Members:</strong> {orgUsers.length}</p>
              <p><strong>Projects:</strong> 0</p>
              <p><strong>Status:</strong> Active</p>
            </div>
            
            <div style={{ 
              padding: "15px", 
              backgroundColor: "white", 
              borderRadius: "8px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
            }}>
              <h4 style={{ margin: "0 0 10px 0", color: "#4a5568" }}>Recent Activity</h4>
              <p>No recent activity</p>
            </div>
          </div>
        </div>
      )}
              {/* Dashboard Overview Section - Now after organization details */}
              {organizations.length > 0 && activeOrg !== null && (
                <div style={{
                  marginBottom: "20px",
                  padding: "15px",
                  backgroundColor: "#f5f9ff",
                  borderRadius: "8px",
                  border: "1px solid #c8daff"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h3>Dashboard Overview: {organizations[activeOrg].organizationName}</h3>
                    <button
                      onClick={toggleUserForm}
                      style={{
                        padding: "8px 12px",
                        backgroundColor: "#4299e1",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                        fontSize: "14px"
                      }}
                    >
                      <UserPlus size={16} />
                      Add User
                    </button>
                  </div>
          
                  {/* Role Cards - Added from OrganizationDashboard */}
                  <div style={{ 
                    display: "grid", 
                    gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", 
                    gap: "15px",
                    marginTop: "15px",
                    marginBottom: "20px"
                  }}>
                    {roles.map((role) => {
                      // Count users for each role
                      const roleCount = orgUsers.filter(user => user.role === role.type).length;
              
                      return (
                        <div 
                          key={role.id}
                          style={{ 
                            backgroundColor: "white", 
                            borderRadius: "12px",
                            padding: "16px",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                            display: "flex",
                            alignItems: "center",
                            gap: "16px",
                            cursor: "pointer",
                            transition: "all 0.2s ease"
                          }}
                        >
                          <div style={{
                            padding: "12px",
                            borderRadius: "8px",
                            backgroundColor: role.color,
                            color: "white"
                          }}>
                            {role.icon && 
                              <role.icon size={24} style={{ color: "white" }} />
                            }
                          </div>
                          <div>
                            <h3 style={{ 
                              color: "#4a5568", 
                              fontWeight: "600",
                              margin: "0"
                            }}>{role.title}</h3>
                            <p style={{ 
                              fontSize: "24px", 
                              fontWeight: "700",
                              marginTop: "4px",
                              marginBottom: "0"
                            }}>{roleCount}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
      
      {/* User Management Section */}
      {organizations.length > 0 && activeOrg !== null && (
        <div style={{ 
          marginTop: "20px", 
          marginBottom: "20px",
          padding: "15px", 
          backgroundColor: "white", 
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
        }}>
          
          
          {/* Users table - Display users for the active organization */}
          {orgUsers.length > 0 ? (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#f2f2f2" }}>
                  <th style={{ padding: "10px", textAlign: "left", border: "1px solid #ddd" }}>Username</th>
                  <th style={{ padding: "10px", textAlign: "left", border: "1px solid #ddd" }}>Email</th>
                  <th style={{ padding: "10px", textAlign: "left", border: "1px solid #ddd" }}>Role</th>
                  <th style={{ padding: "10px", textAlign: "left", border: "1px solid #ddd" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orgUsers.map((user, index) => (
                  <tr key={index}>
                    <td style={{ padding: "10px", textAlign: "left", border: "1px solid #ddd" }}>{user.user_name}</td>
                    <td style={{ padding: "10px", textAlign: "left", border: "1px solid #ddd" }}>{user.email}</td>
                    <td style={{ padding: "10px", textAlign: "left", border: "1px solid #ddd" }}>{user.role}</td>
                    <td style={{ padding: "10px", textAlign: "left", border: "1px solid #ddd" }}>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          onClick={() => {
                            setEditingUser(user);
                            setShowUserForm(true);
                          }}
                          style={{
                            padding: "4px 8px",
                            backgroundColor: "#FFC107",
                            color: "black",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            fontSize: "12px"
                          }}
                        >
                          <Edit size={14} style={{ marginRight: "4px" }} />
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            const confirmDelete = window.confirm("Are you sure you want to delete this user?");
                            if (confirmDelete) {
                              const updatedUsers = users.filter((_, i) => i !== users.findIndex(u => u.email === user.email));
                              setUsers(updatedUsers);
                            }
                          }}
                          style={{
                            padding: "4px 8px",
                            backgroundColor: "#DC3545",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            fontSize: "12px"
                          }}
                        >
                          <Trash2 size={14} style={{ marginRight: "4px" }} />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={{ color: "#718096" }}>No users found in this organization. Click 'Add User' to add members.</p>
          )}
        </div>
      )}
      
      {/* User Form (AddMemberForm) - Moved to the bottom */}
      {showUserForm && activeOrg !== null && (
        <div style={{ marginTop: "20px", marginBottom: "20px" }}>
          <div style={{ 
            border: "1px solid #ddd",
            padding: "20px",
            borderRadius: "8px",
            backgroundColor: "#f9f9f9"
          }}>
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center",
              marginBottom: "15px" 
            }}>
              <h3 style={{ margin: "0" }}>Add User to {organizations[activeOrg].organizationName}</h3>
              <button 
                onClick={toggleUserForm}
                style={{
                  padding: "8px 12px",
                  backgroundColor: "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer"
                }}
              >
                Hide
              </button>
            </div>
            <AddMemberForm 
              onAddMember={handleAddUser} 
              editingMember={editingUser}
              onUpdate={handleUpdateUser}
            />
          </div>
        </div>
      )}
      
      {/* No organizations message */}
      {organizations.length === 0 && (
        <div style={{
          padding: "30px",
          textAlign: "center",
          backgroundColor: "#f9f9f9",
          borderRadius: "8px",
          marginTop: "20px"
        }}>
          <h3 style={{ color: "#6c757d" }}>No Organizations Found</h3>
          <p style={{ color: "#6c757d", marginBottom: "20px" }}>Click the "Add Organization" button to create your first organization.</p>
          
        </div>
      )}
    </div>
  );
};

export default OrganizationManager;