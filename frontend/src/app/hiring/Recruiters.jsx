'use client'

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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const API_BASE_URL = "http://localhost:8000";

  const fetchRecruiters = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await axios.get(`${API_BASE_URL}/api/recruiters`);
      
      const recruitersData = response.data.map((job) => ({
        id: job.id,
        name: job.name,
        email: job.email || 'N/A',
        phone: job.phone
      }));
      
      setRecruiters(recruitersData);
    } catch (error) {
      console.error("Error fetching recruiters:", error);
      setError('Error fetching recruiters');
      setTimeout(() => setError(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

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

  const updateRecruiter = async (id) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/recruiters/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update recruiter');
      }
      
      setSuccessMessage('Recruiter updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchRecruiters();
      setIsEditing(false);
      resetForm();
      setShowForm(false);
    } catch (error) {
      setError('Error updating recruiter');
      setTimeout(() => setError(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteRecruiter = async (id) => {
    if (!window.confirm('Are you sure you want to delete this recruiter?')) {
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await axios.delete(`${API_BASE_URL}/api/recruiters/${id}`);
      
      setSuccessMessage('Recruiter deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchRecruiters();
      setSelectedRecruiter(null);
    } catch (error) {
      console.error("Error deleting recruiter:", error);
      setError('Error deleting recruiter');
      setTimeout(() => setError(''), 3000);
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
    setIsDropdownOpen(false);
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

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleAddNewRecruiter = () => {
    resetForm();
    setShowForm(true);
  };

  const handleCancelForm = () => {
    resetForm();
    setShowForm(false);
  };

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
        
        <div className={styles.dropdownContainer}>
          <button 
            className={styles.dropdownButton} 
            onClick={toggleDropdown}
          >
            {selectedRecruiter ? selectedRecruiter.name : 'Select a Recruiter'} ▼
          </button>
          
          {isDropdownOpen && (
            <div className={styles.dropdownMenu}>
              {recruiters.length > 0 ? (
                recruiters.map((recruiter) => (
                  <div 
                    key={recruiter.id} 
                    className={styles.dropdownItem}
                    onClick={() => {
                      setSelectedRecruiter(recruiter);
                      setIsDropdownOpen(false);
                    }}
                  >
                    <div className={styles.recruiterInfo}>
                      <div className={styles.recruiterName}>{recruiter.name}</div>
                      <div className={styles.recruiterEmail}>{recruiter.email}</div>
                      <div className={styles.recruiterPhone}>{recruiter.phone}</div>
                    </div>
                    <div className={styles.dropdownActions}>
                      <button 
                        className={styles.editButton} 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(recruiter);
                        }}
                      >
                        Edit
                      </button>
                      <button 
                        className={styles.deleteButton} 
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteRecruiter(recruiter.id);
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles.noData}>No recruiters found</div>
              )}
            </div>
          )}
        </div>
        
        {selectedRecruiter && !isEditing && (
          <div className={styles.selectedRecruiterDetails}>
            <h3>Selected Recruiter Details</h3>
            <p><strong>Name:</strong> {selectedRecruiter.name}</p>
            <p><strong>Email:</strong> {selectedRecruiter.email}</p>
            <p><strong>Phone:</strong> {selectedRecruiter.phone}</p>
            <div className={styles.detailActions}>
              <button 
                className={styles.editButton} 
                onClick={() => handleEdit(selectedRecruiter)}
              >
                Edit
              </button>
              <button 
                className={styles.deleteButton} 
                onClick={() => deleteRecruiter(selectedRecruiter.id)}
              >
                Delete
              </button>
            </div>
          </div>
        )}
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