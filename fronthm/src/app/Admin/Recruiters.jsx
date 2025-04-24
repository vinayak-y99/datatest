import React, { useState, useEffect } from 'react';
import styles from './Recruiters.module.css';
import axios from "axios";

const RecruiterApp = () => {
  const [recruiters, setRecruiters] = useState([]);
  const [selectedRecruiter, setSelectedRecruiter] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const API_BASE_URL = "http://localhost:8000";

  // Fetch all recruiters
  const fetchRecruiters = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/recruiters`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
  
      // Direct mapping for the exact data structure you showed
      const recruitersData = data.map(recruiter => ({
        id: recruiter.id,
        name: recruiter.name,
        email: recruiter.email,
        phone: recruiter.phone,
        createdAt: recruiter.created_at
      }));
  
      // Sort recruiters by creation date (most recent first)
      recruitersData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
      setRecruiters(recruitersData);
  
      if (recruitersData.length === 0) {
        setError('No recruiters found. The database might be empty.');
      }
    } catch (error) {
      console.error("Error fetching recruiters:", error);
      setError(`Fetch Error: ${error.message}
  
  Debugging Information:
  - Endpoint: ${API_BASE_URL}/api/recruiters
  - Error Details: ${error.toString()}
  
  Possible Causes:
  1. Network connectivity issues
  2. API endpoint is incorrect
  3. Server is down
  4. Authentication problems`);
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new recruiter
  const createRecruiter = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/recruiters`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create recruiter');
      }
      
      setSuccessMessage('Recruiter created successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchRecruiters();
      resetForm();
      setShowForm(false);
    } catch (error) {
      setError('Error creating recruiter');
      setTimeout(() => setError(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  // Update a recruiter
  const updateRecruiter = async (id) => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/recruiters/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone
        }),
      });
      
      if (!response.ok) {
        // Try to parse error details from response
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || 
          `Failed to update recruiter. Status: ${response.status}`
        );
      }
      
      // Parse the updated recruiter data
      const updatedRecruiter = await response.json();
      
      setSuccessMessage('Recruiter updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      
      // Refresh the recruiters list
      await fetchRecruiters();
      
      setIsEditing(false);
      resetForm();
      setShowForm(false);
    } catch (error) {
      console.error("Comprehensive error updating recruiter:", error);
      
      setError(`Update Error: ${error.message}
  
  Possible Causes:
  1. Network connectivity issues
  2. Invalid input data
  3. Recruiter may no longer exist
  4. Server-side validation failed`);
      
      setTimeout(() => setError(''), 5000);
    } finally {
      setIsLoading(false);
    }
  };
  
  const deleteRecruiter = async (id) => {
    if (!window.confirm('Are you sure you want to delete this recruiter?')) {
      return;
    }
    
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/recruiters/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });
  
      if (!response.ok) {
        // Try to parse error details from response
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || 
          `Failed to delete recruiter. Status: ${response.status}`
        );
      }
      
      setSuccessMessage('Recruiter deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      
      // Refresh the recruiters list
      await fetchRecruiters();
      
      setSelectedRecruiter(null);
    } catch (error) {
      console.error("Comprehensive error deleting recruiter:", error);
      
      setError(`Delete Error: ${error.message}
  
  Possible Causes:
  1. Recruiter may no longer exist
  2. Network connectivity issues
  3. Server-side constraints (e.g., related records)
  4. Insufficient permissions`);
      
      setTimeout(() => setError(''), 5000);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEditing && selectedRecruiter) {
      updateRecruiter(selectedRecruiter.id);
    } else {
      createRecruiter();
    }
  };

  const handleEdit = (recruiter) => {
    setSelectedRecruiter(recruiter);
    setFormData({
      name: recruiter.name,
      email: recruiter.email,
      phone: recruiter.phone
    });
    setIsEditing(true);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: ''
    });
    setIsEditing(false);
    setSelectedRecruiter(null);
  };

  const handleAddNewRecruiter = () => {
    resetForm();
    setShowForm(true);
  };

  const handleCancelForm = () => {
    resetForm();
    setShowForm(false);
  };

  // Fetch recruiters on component mount
  useEffect(() => {
    fetchRecruiters();
  }, []);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Recruiter Management</h1>
      
      {error && <div className={styles.errorMessage}>{error}</div>}
      {successMessage && <div className={styles.successMessage}>{successMessage}</div>}
      {isLoading && <div className={styles.loadingSpinner}>Loading...</div>}
      
      <div className={styles.recruitersSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>All Recruiters</h2>
          <button 
            className={styles.addButton} 
            onClick={handleAddNewRecruiter}
          >
            Add New Recruiter
          </button>
        </div>
        
        {/* Recruiters List Table */}
        <div className={styles.recruitersTable}>
          {recruiters.length > 0 ? (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recruiters.map((recruiter) => (
                  <tr key={recruiter.id}>
                    <td>{recruiter.name}</td>
                    <td>{recruiter.email}</td>
                    <td>{recruiter.phone}</td>
                    <td className={styles.actionButtons}>
                      <button 
                        className={styles.editButton} 
                        onClick={() => handleEdit(recruiter)}
                      >
                        Edit
                      </button>
                      <button 
                        className={styles.deleteButton} 
                        onClick={() => deleteRecruiter(recruiter.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className={styles.noData}>No recruiters found</div>
          )}
        </div>
      </div>
      
      {showForm && (
        <div className={styles.formSection}>
          <h2>{isEditing ? 'Edit Recruiter' : 'Add New Recruiter'}</h2>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="name">Name:</label>
              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className={styles.input}
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="email">Email:</label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className={styles.input}
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="phone">Phone:</label>
              <input
                id="phone"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                className={styles.input}
              />
            </div>
            
            <div className={styles.formActions}>
              <button 
                type="submit" 
                className={`${styles.button} ${isEditing ? styles.updateButton : styles.createButton}`}
                disabled={isLoading}
              >
                {isEditing ? 'Update' : 'Create'}
              </button>
              <button 
                type="button" 
                className={styles.cancelButton}
                onClick={handleCancelForm}
                disabled={isLoading}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default RecruiterApp;
