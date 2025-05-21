"use client";
import React, { useState, useEffect } from 'react';
import { Sliders, Save, AlertCircle, Info, Check, ChevronDown, ChevronUp, Trash2, PlusCircle } from 'lucide-react';

// Mock data for demonstration
const initialRoles = [
  { id: 1, title: 'Senior Frontend Engineer', department: 'Engineering' },
  { id: 2, title: 'Product Marketing Manager', department: 'Marketing' },
  { id: 3, title: 'UX/UI Designer', department: 'Design' },
];

const initialSkillCategories = [
  { id: 1, name: 'Technical Skills', description: 'Programming languages, frameworks, and tools' },
  { id: 2, name: 'Soft Skills', description: 'Communication, teamwork, and adaptability' },
  { id: 3, name: 'Experience', description: 'Years of relevant experience and project complexity' },
  { id: 4, name: 'Education', description: 'Academic qualifications and certifications' },
];

const initialSkills = [
  // Technical Skills
  { id: 1, name: 'JavaScript', categoryId: 1, isMandatory: true, weight: 5 },
  { id: 2, name: 'React', categoryId: 1, isMandatory: true, weight: 5 },
  { id: 3, name: 'TypeScript', categoryId: 1, isMandatory: false, weight: 3 },
  { id: 4, name: 'CSS/SCSS', categoryId: 1, isMandatory: true, weight: 4 },
  // Soft Skills
  { id: 5, name: 'Communication', categoryId: 2, isMandatory: true, weight: 4 },
  { id: 6, name: 'Teamwork', categoryId: 2, isMandatory: true, weight: 4 },
  { id: 7, name: 'Problem Solving', categoryId: 2, isMandatory: true, weight: 5 },
  // Experience
  { id: 8, name: 'Years in Industry', categoryId: 3, isMandatory: true, weight: 4 },
  { id: 9, name: 'Project Complexity', categoryId: 3, isMandatory: false, weight: 3 },
  // Education
  { id: 10, name: 'Degree', categoryId: 4, isMandatory: false, weight: 2 },
  { id: 11, name: 'Certifications', categoryId: 4, isMandatory: false, weight: 2 },
];

const ThresholdScoreManagementSection = () => {
  const [roles, setRoles] = useState(initialRoles);
  const [selectedRole, setSelectedRole] = useState(null);
  const [skillCategories, setSkillCategories] = useState(initialSkillCategories);
  const [skills, setSkills] = useState(initialSkills);
  const [notification, setNotification] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [passingThreshold, setPassingThreshold] = useState(70);
  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [newSkill, setNewSkill] = useState({ name: '', categoryId: 1, isMandatory: false, weight: 3 });
  const [categoryWeights, setCategoryWeights] = useState({
    1: 40, // Technical Skills
    2: 25, // Soft Skills
    3: 25, // Experience
    4: 10, // Education
  });

  // Initialize expanded categories
  useEffect(() => {
    const expanded = {};
    skillCategories.forEach(category => {
      expanded[category.id] = true;
    });
    setExpandedCategories(expanded);
  }, [skillCategories]);

  // Handle role selection
  const handleRoleChange = (roleId) => {
    setSelectedRole(parseInt(roleId));
  };

  // Toggle category expansion
  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  // Update skill property
  const updateSkill = (skillId, property, value) => {
    setSkills(prev => prev.map(skill =>
      skill.id === skillId ? { ...skill, [property]: value } : skill
    ));
  };

  // Delete skill
  const deleteSkill = (skillId) => {
    setSkills(prev => prev.filter(skill => skill.id !== skillId));
    showNotification('info', 'Skill removed successfully');
  };

  // Save changes
  const saveChanges = () => {
    // Here you would typically save to a backend
    showNotification('success', 'Threshold scores saved successfully!');
  };

  // Show notification
  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // Add new skill
  const addNewSkill = () => {
    if (!newSkill.name.trim()) {
      showNotification('error', 'Skill name cannot be empty');
      return;
    }
   
    const newId = Math.max(...skills.map(s => s.id)) + 1;
    const skillToAdd = { ...newSkill, id: newId };
   
    setSkills(prev => [...prev, skillToAdd]);
    setNewSkill({ name: '', categoryId: 1, isMandatory: false, weight: 3 });
    setIsAddingSkill(false);
    showNotification('success', 'New skill added successfully');
  };

  // Cancel adding new skill
  const cancelAddSkill = () => {
    setNewSkill({ name: '', categoryId: 1, isMandatory: false, weight: 3 });
    setIsAddingSkill(false);
  };

  // Update category weight
  const updateCategoryWeight = (categoryId, value) => {
    setCategoryWeights(prev => ({
      ...prev,
      [categoryId]: value
    }));
  };

  // Get skills for a category
  const getSkillsByCategory = (categoryId) => {
    return skills.filter(skill => skill.categoryId === categoryId);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Threshold Score Management</h1>
          <p className="mt-1 text-gray-500">Define scoring criteria and weights for candidate evaluation</p>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div
          className={`mb-6 p-4 rounded-md flex items-start gap-3 ${
            notification.type === 'success' ? 'bg-green-50 border border-green-200' :
            notification.type === 'info' ? 'bg-blue-50 border border-blue-200' :
            'bg-red-50 border border-red-200'
          }`}
        >
          {notification.type === 'success' ? (
            <Check className={`h-5 w-5 mt-0.5 text-green-600`} />
          ) : notification.type === 'info' ? (
            <Info className={`h-5 w-5 mt-0.5 text-blue-600`} />
          ) : (
            <AlertCircle className={`h-5 w-5 mt-0.5 text-red-600`} />
          )}
          <div>
            <p className={`text-sm ${
              notification.type === 'success' ? 'text-green-700' :
              notification.type === 'info' ? 'text-blue-700' :
              'text-red-700'
            }`}>
              {notification.message}
            </p>
          </div>
        </div>
      )}

      {/* Role Selection */}
      <div className="mb-8">
        <label htmlFor="role-select" className="block text-sm font-medium text-gray-700 mb-2">
          Select Role for Threshold Configuration
        </label>
        <select
          id="role-select"
          value={selectedRole || ''}
          onChange={(e) => handleRoleChange(e.target.value)}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          <option value="" disabled>Select a role</option>
          {roles.map((role) => (
            <option key={role.id} value={role.id}>
              {role.title} - {role.department}
            </option>
          ))}
        </select>
      </div>

      {selectedRole && (
        <>
          {/* Global Passing Threshold */}
          <div className="mb-8 p-6 border border-gray-200 rounded-lg bg-gray-50">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-medium text-gray-900">Passing Threshold</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Candidates must score at least this percentage to pass
                </p>
              </div>
              <div className="mt-4 md:mt-0 flex items-center">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={passingThreshold}
                  onChange={(e) => setPassingThreshold(parseInt(e.target.value))}
                  className="w-20 px-2 py-1 text-center border border-gray-300 rounded-md mr-2"
                />
                <span className="text-gray-700">%</span>
              </div>
            </div>
            <div className="mt-4">
              <div className="relative h-2 bg-gray-200 rounded-full">
                <div
                  className="absolute top-0 left-0 h-2 bg-green-500 rounded-full"
                  style={{width: `${passingThreshold}%`}}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="mb-8">
            <h2 className="text-xl font-medium text-gray-900 mb-4">Evaluation Categories</h2>
            <p className="text-sm text-gray-500 mb-6">
              Adjust the weight of each category to prioritize different aspects of candidate assessment
            </p>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {skillCategories.map((category) => (
                <div
                  key={category.id}
                  className="p-4 border border-gray-200 rounded-lg"
                >
                  <h3 className="font-medium text-gray-900">{category.name}</h3>
                  <div className="flex items-center mt-2">
                    <input
                      type="range"
                      min="5"
                      max="50"
                      value={categoryWeights[category.id]}
                      onChange={(e) => updateCategoryWeight(category.id, parseInt(e.target.value))}
                      className="flex-grow"
                    />
                    <span className="ml-2 text-gray-700 w-12 text-right">{categoryWeights[category.id]}%</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Warning for total weights */}
            {Object.values(categoryWeights).reduce((a, b) => a + b, 0) !== 100 && (
              <div className="mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded-md flex items-start">
                <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5 mr-2" />
                <p className="text-sm text-yellow-700">
                  Total category weights must equal 100%. Current total: {Object.values(categoryWeights).reduce((a, b) => a + b, 0)}%
                </p>
              </div>
            )}
          </div>

          {/* Skills Configuration */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-medium text-gray-900">Skills Configuration</h2>
              <button
                onClick={() => setIsAddingSkill(true)}
                className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800"
              >
                <PlusCircle className="h-4 w-4" />
                Add Skill
              </button>
            </div>

            {/* Add New Skill Form */}
            {isAddingSkill && (
              <div className="mb-6 p-4 border border-indigo-200 bg-indigo-50 rounded-md">
                <h3 className="text-md font-medium text-indigo-900 mb-3">Add New Skill</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Skill Name</label>
                    <input
                      type="text"
                      value={newSkill.name}
                      onChange={(e) => setNewSkill({...newSkill, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Enter skill name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      value={newSkill.categoryId}
                      onChange={(e) => setNewSkill({...newSkill, categoryId: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      {skillCategories.map(category => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Weight (1-5)</label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      value={newSkill.weight}
                      onChange={(e) => setNewSkill({...newSkill, weight: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <input
                    type="checkbox"
                    id="new-skill-mandatory"
                    checked={newSkill.isMandatory}
                    onChange={(e) => setNewSkill({...newSkill, isMandatory: e.target.checked})}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="new-skill-mandatory" className="ml-2 block text-sm text-gray-700">
                    This skill is mandatory for the role
                  </label>
                </div>
                <div className="mt-4 flex justify-end space-x-3">
                  <button
                    onClick={cancelAddSkill}
                    className="px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addNewSkill}
                    className="px-3 py-1.5 bg-indigo-600 border border-transparent rounded-md text-sm text-white hover:bg-indigo-700"
                  >
                    Add Skill
                  </button>
                </div>
              </div>
            )}

            {/* Skills by Category */}
            {skillCategories.map((category) => (
              <div key={category.id} className="mb-6 border border-gray-200 rounded-lg overflow-hidden">
                <div
                  className="flex justify-between items-center p-4 bg-gray-50 border-b cursor-pointer"
                  onClick={() => toggleCategory(category.id)}
                >
                  <div>
                    <h3 className="font-medium text-gray-900">{category.name}</h3>
                    <p className="text-sm text-gray-500">{category.description}</p>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-500 mr-2">Weight: {categoryWeights[category.id]}%</span>
                    {expandedCategories[category.id] ?
                      <ChevronUp className="h-5 w-5 text-gray-400" /> :
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    }
                  </div>
                </div>
               
                {expandedCategories[category.id] && (
                  <div className="p-4">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Skill
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Mandatory
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Weight (1-5)
                          </th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {getSkillsByCategory(category.id).map((skill) => (
                          <tr key={skill.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{skill.name}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={skill.isMandatory}
                                  onChange={(e) => updateSkill(skill.id, 'isMandatory', e.target.checked)}
                                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                />
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <select
                                value={skill.weight}
                                onChange={(e) => updateSkill(skill.id, 'weight', parseInt(e.target.value))}
                                className="mt-1 block w-20 py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                              >
                                <option value={1}>1</option>
                                <option value={2}>2</option>
                                <option value={3}>3</option>
                                <option value={4}>4</option>
                                <option value={5}>5</option>
                              </select>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={() => deleteSkill(skill.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                   
                    {getSkillsByCategory(category.id).length === 0 && (
                      <div className="py-6 text-center text-gray-500">
                        <p>No skills added for this category yet.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Save Button */}
          <div className="mt-8 flex justify-end">
            <button
              onClick={saveChanges}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md flex items-center gap-2"
            >
              <Save className="h-5 w-5" />
              Save Threshold Configuration
            </button>
          </div>
        </>
      )}

      {/* No Role Selected State */}
      {!selectedRole && (
        <div className="mt-8 text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <Sliders className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">Select a role to configure threshold scores</h3>
          <p className="mt-1 text-sm text-gray-500 max-w-md mx-auto">
            Choose a role from the dropdown above to set evaluation criteria and threshold scores for candidate assessment.
          </p>
        </div>
      )}
    </div>
  );
};

export default ThresholdScoreManagementSection;
