"use client"
import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Edit2, Trash2, Plus, Info } from 'lucide-react';
// import FirstPageIcon from '@mui/icons-material/FirstPage';
import { Switch } from '@mui/material';
import { ResponsiveContainer, PieChart, Pie, BarChart, Bar, XAxis, YAxis, Cell, Tooltip } from 'recharts';

const RightSidebar = ({ jobId, skills_data = {}, activeTab = 'skills', initialUseRatings = true, categoryTotals = {}, closeSidebar = () => {} }) => {
  const [expandedSections, setExpandedSections] = useState({});
  const [useRatings, setUseRatings] = useState(initialUseRatings);
  const [values, setValues] = useState({});
  const [showPopup, setShowPopup] = useState({});
  const [newItemName, setNewItemName] = useState('');
  const [skillsDataState, setSkillsDataState] = useState(skills_data);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [updatedSkillsData, setUpdatedSkillsData] = useState(skills_data);
  // Add this state to track recently updated items
  const [recentlyUpdated, setRecentlyUpdated] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Only update if skills_data is not empty
    if (skills_data && Object.keys(skills_data).length > 0) {
      setSkillsDataState(skills_data);
    
      // Reset expanded sections to ensure charts re-render
      const sections = ['Skills', 'Achievements', 'Activities'];
      const newExpandedSections = {};
      sections.forEach(section => {
        newExpandedSections[section] = expandedSections[section] || false;
      });
      setExpandedSections(newExpandedSections);
    
      // Reset values to ensure sliders and inputs show new values
      setValues({});
    }

    // Mark all items as recently updated
    const newRecentlyUpdated = {};
    if (skills_data) {
      const roleKey = Object.keys(skills_data)[0];
      if (roleKey && skills_data[roleKey]) {
        ['skills', 'achievements', 'activities'].forEach(category => {
          if (roleData[category]) {
            Object.keys(roleData[category]).forEach(itemName => {
              newRecentlyUpdated[`${category}-${itemName}`] = true;
            });
          }
        });
      }
    }
    setRecentlyUpdated(newRecentlyUpdated);
    
    // Clear the recently updated status after 3 seconds
    const timer = setTimeout(() => {
      setRecentlyUpdated({});
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [skills_data]);

  useEffect(() => {
    // Initialize skills data
    setSkillsDataState(skills_data);
    
    return () => {
      // Cleanup any pending state updates
      setExpandedSections({});
      setValues({});
      setShowPopup({});
      setNewItemName('');
      setSkillsDataState(skills_data);
      setHoveredItem(null);
      setUpdatedSkillsData(skills_data);
    };
  }, [skills_data]);

  const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#6366f1'];

  const toggleSection = (section) => {
    setExpandedSections(prev => ({...prev, [section]: !prev[section]}));
  };

  const handleDeleteItem = (section, itemName) => {
    const roleKey = Object.keys(skillsDataState)[0];
    const updatedSkillsData = { ...skillsDataState };
    const updatedItems = { ...updatedSkillsData[roleKey][section.toLowerCase()] };
    delete updatedItems[itemName];
    updatedSkillsData[roleKey][section.toLowerCase()] = updatedItems;
    setSkillsDataState(updatedSkillsData);
  };

  const handleAddItem = async (section) => {
    try {
      if (!newItemName.trim()) return;
      
      const roleKey = Object.keys(skillsDataState)[0];
      const updatedSkillsData = { ...skillsDataState };
      const updatedItems = {
        ...updatedSkillsData[roleKey][section.toLowerCase()],
        [newItemName]: { rating: 5, importance: 50 }
      };
      
      updatedSkillsData[roleKey][section.toLowerCase()] = updatedItems;
      setSkillsDataState(updatedSkillsData);
      setNewItemName('');
      setShowPopup(prev => ({...prev, [section]: false}));
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

  const handleValueChange = (section, itemId, value, data) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue)) {
      const maxValue = useRatings ? 10 : 100;
      if (numValue >= 0 && numValue <= maxValue) {
        // Store the new value locally without saving immediately
        setValues(prev => ({
          ...prev,
          [`${section}-${itemId}`]: {
            rating: useRatings ? numValue : data.rating,
            importance: !useRatings ? numValue : data.importance,
            modified: true // Mark as modified but not saved
          }
        }));
      }
    }
  };

  // Function to call the API to update the dashboard item
  const updateDashboardItem = async (category, itemName, newValue) => {
    try {
      setLoading(true);

      // Get the role key from skillsDataState
      const roleKey = Object.keys(skillsDataState)[0];
      if (!roleKey) {
        throw new Error("No role data found");
      }

      // Get current values from the state
      const currentItem = skillsDataState[roleKey][category][itemName] || { rating: 5, importance: 50 };

      // Prepare data for API call - only include the field being modified 
      const updateData = {
        role: roleKey,
        category: category,
        item_name: itemName,
        job_id: jobId // Use the jobId prop directly
      };

      // Add the field being updated based on which mode is active
      if (useRatings) {
        updateData.new_rating = newValue;
      } else {
        updateData.new_importance = newValue;
      }

      // Call the API endpoint
      const response = await fetch('http://127.0.0.1:8000/api/update_dashboard_item/', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });

      const responseText = await response.text();
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} - ${responseText}`);
      }
      
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        console.error("Error parsing JSON response:", e);
        result = { status: "error", message: "Invalid JSON response" };
      }
      
      // Update the local state to reflect the change
      const updatedSkillsData = { ...skillsDataState };
      if (updatedSkillsData[roleKey] && updatedSkillsData[roleKey][category] && updatedSkillsData[roleKey][category][itemName]) {
        // If we received both values in the response, use them
        if (result.new_rating !== undefined && result.new_importance !== undefined) {
          updatedSkillsData[roleKey][category][itemName].rating = result.new_rating;
          updatedSkillsData[roleKey][category][itemName].importance = result.new_importance;
        } else {
          // Fallback to only updating the field that was changed
          if (useRatings) {
            updatedSkillsData[roleKey][category][itemName].rating = newValue;
          } else {
            updatedSkillsData[roleKey][category][itemName].importance = newValue;
          }
        }
        setSkillsDataState(updatedSkillsData);
      }

      // Mark as saved and update values store with both fields
      setValues(prev => {
        const prevValues = prev[`${category}-${itemName}`] || {};
        return {
          ...prev,
          [`${category}-${itemName}`]: {
            rating: result.new_rating !== undefined ? result.new_rating : prevValues.rating,
            importance: result.new_importance !== undefined ? result.new_importance : prevValues.importance,
            modified: false
          }
        };
      });

      return true;
    } catch (error) {
      console.error("Error updating dashboard item:", error);
      alert(`Failed to update dashboard: ${error.message}`);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Function to save all modified values
  const saveAllChanges = async () => {
    if (!confirm("Save all modified values?")) return;
    
    setLoading(true);
    let allSucceeded = true;
    const promises = [];
    
    for (const [key, value] of Object.entries(values)) {
      if (value.modified) {
        const [category, itemName] = key.split('-');
        
        // Get the field that was modified based on the current mode
        if (useRatings) {
          promises.push(updateDashboardItem(category, itemName, value.rating));
        } else {
          promises.push(updateDashboardItem(category, itemName, value.importance));
        }
      }
    }
    
    try {
      const results = await Promise.all(promises);
      allSucceeded = results.every(result => result === true);
      
      if (allSucceeded) {
        alert("All changes saved successfully!");
        
        // Request fresh data to ensure UI matches database
        try {
          // Make a call to get the latest job description data
          const response = await fetch(`http://127.0.0.1:8000/api/job-description/${jobId}`);
          
          if (response.ok) {
            const updatedJobData = await response.json();
            // If we have a callback in parent components to update the data, use it
            if (typeof window !== 'undefined' && window.dispatchEvent) {
              // Dispatch a custom event to notify parent components
              window.dispatchEvent(new CustomEvent('dashboardDataUpdated', {
                detail: { jobId, data: updatedJobData }
              }));
            }
          }
        } catch (refreshError) {
          console.error("Error refreshing job data:", refreshError);
          // Continue with success message even if refresh fails
        }
      } else {
        alert("Some changes could not be saved. Please try again.");
      }
    } catch (error) {
      console.error("Error saving changes:", error);
      alert("An error occurred while saving changes.");
    } finally {
      setLoading(false);
    }
  };

  // Check if there are any modified values
  const hasModifiedValues = Object.values(values).some(value => value.modified);

  const getValue = (section, itemName, data) => {
    const storedValue = values[`${section}-${itemName}`];
    if (storedValue) {
      return useRatings ? storedValue.rating : storedValue.importance;
    }
    return useRatings ? data.rating : data.importance;
  };

  const prepareChartData = (title, items) => {
    if (!items) return [];
    return Object.entries(items).map(([itemName, data]) => ({
      name: itemName,
      value: getValue(title, itemName, data)
    }));
  };

  const ColorDot = ({ color }) => (
    <span
      className="inline-block w-3 h-3 rounded-full mr-2"
      style={{ backgroundColor: color }}
    />
  );

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value, name }) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius * 1.2;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="#4B5563"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-sm font-bold"
      >
        {`${name}: ${value}`}
      </text>
    );
  };

  const renderSection = (title, items) => {
    if (!items) return null;
    const data = prepareChartData(title, items);
    const itemCount = Object.keys(items).length;
    const chartHeight = Math.min(Math.max(300, itemCount * 50), 400);

    return (
      <div key={title} className="mb-6 rounded-lg p-6 border border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center cursor-pointer" onClick={() => toggleSection(title)}>
            <div className="mr-2">
              {expandedSections[title] ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
            </div>
            <span className="text-gray-800 font-medium text-xl">{title}</span>
          </div>
        </div>
        
        {expandedSections[title] && (
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="w-full lg:w-1/3">
              {Object.entries(items).map(([itemName, data], index) => (
                <div
                  key={itemName}
                  className="flex items-center mb-4 hover:bg-gray-50 p-2 rounded transition-colors group"
                  onMouseEnter={() => setHoveredItem(`${title}-${itemName}`)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <div className="flex items-center space-x-2 min-w-[60px]">
                    {hoveredItem === `${title}-${itemName}` && (
                      <>
                        <button
                          onClick={() => handleDeleteItem(title, itemName)}
                          className="p-1 hover:bg-red-100 rounded transition-opacity"
                        >
                          <Trash2 size={16} className="text-red-500" />
                        </button>
                        <button
                          onClick={() => setShowPopup(prev => ({...prev, [title]: true}))}
                          className="p-1 hover:bg-blue-100 rounded transition-opacity"
                        >
                          <Plus size={16} className="text-blue-500" />
                        </button>
                      </>
                    )}
                  </div>
                  <ColorDot color={COLORS[index % COLORS.length]} />
                  <span className="text-sm text-gray-700 flex-grow ml-2">{itemName}</span>
                  
                  <div className="flex items-center gap-4">
                    {useRatings ? (
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col items-end mr-1">
                          <span className="text-sm font-medium text-blue-600">{getValue(title, itemName, data).toFixed(1)}</span>
                          <span className="text-xs text-gray-500">{data.importance.toFixed(1)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="10"
                          step="0.1"
                          value={getValue(title, itemName, data)}
                          onChange={(e) => handleValueChange(title, itemName, e.target.value, data)}
                          className={`w-24 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-600 ${
                            loading ? 'opacity-50' : ''
                          }`}
                          disabled={loading}
                        />
                        {loading && (
                          <span className="ml-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-blue-500 border-t-transparent"></span>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col items-end mr-1">
                          <span className="text-sm font-medium text-purple-600">{data.importance.toFixed(1)}%</span>
                          <span className="text-xs text-gray-500">{data.rating.toFixed(1)}</span>
                        </div>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={getValue(title, itemName, data)}
                          onChange={(e) => handleValueChange(title, itemName, e.target.value, data)}
                          onFocus={(e) => e.target.select()}
                          className={`w-20 p-2 text-sm border rounded text-center focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                            loading ? 'opacity-50' : ''
                          }`}
                          disabled={loading}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {showPopup[title] && (
                <div className="mt-2 bg-white shadow-lg rounded-lg p-2">
                  <input
                    type="text"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    placeholder="New item name"
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleAddItem(title);
                      }
                    }}
                    autoFocus
                  />
                </div>
              )}
            </div>
            
            <div className="w-full lg:w-2/3 grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="w-full" style={{ height: `${chartHeight}px` }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
                    <Pie
                      data={data}
                      cx="50%"
                      cy="50%"
                      innerRadius={Math.min(chartHeight * 0.25, 60)}
                      outerRadius={Math.min(chartHeight * 0.4, 90)}
                      paddingAngle={10}
                      dataKey="value"
                      label={<CustomLabel />}
                      labelLine={true}
                    >
                      {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="w-full" style={{ height: `${chartHeight}px` }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data}
                    margin={{ top: 20, right: 20, left: 20, bottom: 60 }}
                  >
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      height={60}
                      interval={0}
                      tick={{ fontSize: 12, fontWeight: 'bold' }}
                    />
                    <YAxis domain={[0, useRatings ? 10 : 100]} />
                    <Tooltip
                      cursor={{fill: 'white'}}
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solidhsl(220, 13.00%, 91.00%)',
                        borderRadius: '6px',
                        padding: '8px',
                        fontWeight: 'bold'
                      }}
                    />
                    <Bar dataKey="value" barSize={30}>
                      {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };
    // Update the initial useEffect to handle the nested array structure
    useEffect(() => {
      if (Array.isArray(skills_data) && skills_data[0] && Array.isArray(skills_data[0])) {
        const firstRole = skills_data[0][0];
        setSkillsDataState(firstRole);
      }
    }, [skills_data]);

    // Update renderContent to handle the role-based structure
    const renderContent = () => {
      if (!skillsDataState) return null;
    
      // Get the first role key (either 'AI / ML Engineer' or 'Machine Learning Engineer')
      const roleKey = Object.keys(skillsDataState)[0];
      const roleData = skillsDataState[roleKey];

      return (
        <>
          {renderSection('Skills', roleData.skills)}
          {renderSection('Achievements', roleData.achievements)}
          {renderSection('Activities', roleData.activities)}
        </>
      );
    };
  return (
    <div className="h-full bg-white p-0">
      <div className="flex justify-between items-center mb-6">
        {/* <h2 className="text-2xl font-semibold text-gray-800">Threshold Score</h2> */}
        <button onClick={closeSidebar} className="text-gray-500 hover:text-gray-700">
          {/* <FirstPageIcon /> */}
        </button>
      </div>

      <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center gap-2">
          <span className="text-base font-medium text-gray-700">Value Mode</span>
          <div className="relative group">
            <div className="cursor-help text-gray-500 hover:text-blue-500">
              <Info size={16} />
            </div>
            <div className="absolute left-0 bottom-full mb-2 w-64 bg-gray-800 text-white text-xs rounded p-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
              Rating and Importance values are synchronized. When you change one, the other updates proportionally.
              <div className="border-t border-gray-600 mt-1 pt-1">
                <div>Rating: 0-10 scale</div>
                <div>Importance: 0-100% weight</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <span className={`text-sm ${useRatings ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>Rating (0-10)</span>
          <div className="relative">
            <button
              onClick={() => setUseRatings(!useRatings)}
              className={`relative w-12 h-6 rounded-full transition-colors flex items-center ${
                useRatings ? 'bg-blue-600 justify-start' : 'bg-purple-600 justify-end'
              }`}
              title="Toggle between rating and importance mode"
            >
              <div className="absolute inset-0 flex items-center justify-center text-white text-[10px] font-medium">
                <span className={`absolute left-1 ${useRatings ? 'opacity-0' : 'opacity-100'}`}>%</span>
                <span className={`absolute right-1 ${useRatings ? 'opacity-100' : 'opacity-0'}`}>★</span>
              </div>
              <div
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-md transition-transform ${
                  useRatings ? 'translate-x-0' : 'translate-x-6'
                }`}
              />
            </button>
          </div>
          <span className={`text-sm ${!useRatings ? 'text-purple-600 font-medium' : 'text-gray-500'}`}>Importance (%)</span>
        </div>
      </div>

      {/* Save Changes button - only visible when there are modified values */}
      {hasModifiedValues && (
        <div className="sticky top-0 z-10 bg-white p-3 border-b border-gray-200 shadow-sm mb-4">
          <button
            onClick={saveAllChanges}
            disabled={loading}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400 flex items-center justify-center"
          >
            {loading ? (
              <>
                <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-t-transparent"></span>
                Saving Changes...
              </>
            ) : (
              'Save All Changes'
            )}
          </button>
        </div>
      )}

      <div className="space-y-6 overflow-y-auto">
        {renderContent()}
      </div>
    </div>
  );
};

export default RightSidebar;
 