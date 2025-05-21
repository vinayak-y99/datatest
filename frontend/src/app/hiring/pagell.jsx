"use client"
import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Edit2, Trash2, Plus } from 'lucide-react';
import { Switch } from '@mui/material';
import { ResponsiveContainer, PieChart, Pie, BarChart, Bar, XAxis, YAxis, Cell, Tooltip } from 'recharts';

const RightSidebar = ({ closeSidebar, dashboardData = {} }) => {
  const [expandedSections, setExpandedSections] = useState({});
  const [useRatings, setUseRatings] = useState(true);
  const [values, setValues] = useState({});
  const [showPopup, setShowPopup] = useState({});
  const [newItemName, setNewItemName] = useState('');
  const [dashboardDataState, setDashboardDataState] = useState(dashboardData);
  const [hoveredItem, setHoveredItem] = useState(null);
  // Add this state to track recently updated items
  const [recentlyUpdated, setRecentlyUpdated] = useState({});

  useEffect(() => {
    console.log("RightSidebar received dashboard data update:", dashboardData);
  
    // Only update if dashboardData is not empty
    if (dashboardData && Object.keys(dashboardData).length > 0) {
      setDashboardDataState(dashboardData);
    
      // Initialize expanded sections for each dashboard category
      if (dashboardData.dashboards) {
        const newExpandedSections = {};
        Object.keys(dashboardData.dashboards).forEach(category => {
          newExpandedSections[category] = expandedSections[category] || false;
        });
        setExpandedSections(newExpandedSections);
      }
    
      // Reset values to ensure sliders and inputs show new values
      setValues({});
    }

    // Mark all items as recently updated
    const newRecentlyUpdated = {};
    if (dashboardData && dashboardData.dashboards) {
      Object.keys(dashboardData.dashboards).forEach(category => {
        const items = dashboardData.dashboards[category];
        Object.keys(items).forEach(itemName => {
          newRecentlyUpdated[`${category}-${itemName}`] = true;
        });
      });
    }
    setRecentlyUpdated(newRecentlyUpdated);
    
    // Clear the recently updated status after 3 seconds
    const timer = setTimeout(() => {
      setRecentlyUpdated({});
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [dashboardData]);

  useEffect(() => {
    return () => {
      // Cleanup any pending state updates
      setExpandedSections({});
      setValues({});
      setShowPopup({});
      setNewItemName('');
      setDashboardDataState(dashboardData);
      setHoveredItem(null);
    };
  }, [dashboardData]);

  const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#6366f1'];

  const toggleSection = (section) => {
    setExpandedSections(prev => ({...prev, [section]: !prev[section]}));
  };

  const handleDeleteItem = (category, itemName) => {
    const updatedDashboardData = { ...dashboardDataState };
    const updatedItems = { ...updatedDashboardData.dashboards[category] };
    delete updatedItems[itemName];
    updatedDashboardData.dashboards[category] = updatedItems;
    setDashboardDataState(updatedDashboardData);
  };

  const handleAddItem = async (category) => {
    try {
      if (!newItemName.trim()) return;
      
      const updatedDashboardData = { ...dashboardDataState };
      const updatedItems = {
        ...updatedDashboardData.dashboards[category],
        [newItemName]: { 
          importance: 50, 
          selection_score: 20,
          rejection_score: 20,
          rating: 5
        }
      };
      
      updatedDashboardData.dashboards[category] = updatedItems;
      setDashboardDataState(updatedDashboardData);
      setNewItemName('');
      setShowPopup(prev => ({...prev, [category]: false}));
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

  const handleValueChange = (category, itemId, value, field) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      const maxValue = field === 'rating' ? 10 : 100;
      if (numValue >= 0 && numValue <= maxValue) {
        setValues(prev => {
          const existingValues = prev[`${category}-${itemId}`] || {};
          return {
            ...prev,
            [`${category}-${itemId}`]: {
              ...existingValues,
              [field]: numValue
            }
          };
        });
      }
    }
  };

  const getValue = (category, itemName, field) => {
    const storedValue = values[`${category}-${itemName}`];
    if (storedValue && storedValue[field] !== undefined) {
      return storedValue[field];
    }
    
    const defaultData = dashboardDataState?.dashboards?.[category]?.[itemName];
    return defaultData ? defaultData[field] : 0;
  };

  const getCurrentValue = (category, itemName, data) => {
    return useRatings ? 
      getValue(category, itemName, 'rating') : 
      getValue(category, itemName, 'importance');
  };

  const prepareChartData = (category, items) => {
    if (!items) return [];
    return Object.entries(items).map(([itemName, data]) => ({
      name: itemName,
      value: getCurrentValue(category, itemName, data)
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

  const renderSection = (category, items) => {
    if (!items) return null;
    const data = prepareChartData(category, items);
    const itemCount = Object.keys(items).length;
    const chartHeight = Math.min(Math.max(300, itemCount * 50), 400);

    return (
      <div key={category} className="mb-6 rounded-lg p-6 border border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center cursor-pointer" onClick={() => toggleSection(category)}>
            <div className="mr-2">
              {expandedSections[category] ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
            </div>
            <span className="text-gray-800 font-medium text-xl">{category}</span>
          </div>
        </div>
        
        {expandedSections[category] && (
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="w-full lg:w-1/3">
              {Object.entries(items).map(([itemName, data], index) => {
                const currentValue = getCurrentValue(category, itemName, data);
                const isRecentlyUpdated = recentlyUpdated[`${category}-${itemName}`];
                
                return (
                  <div
                    key={itemName}
                    className={`flex items-center mb-4 hover:bg-gray-50 p-2 rounded transition-colors group ${isRecentlyUpdated ? 'bg-blue-50' : ''}`}
                    onMouseEnter={() => setHoveredItem(`${category}-${itemName}`)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <div className="flex items-center space-x-2 min-w-[60px]">
                      {hoveredItem === `${category}-${itemName}` && (
                        <>
                          <button
                            onClick={() => handleDeleteItem(category, itemName)}
                            className="p-1 hover:bg-red-100 rounded transition-opacity"
                          >
                            <Trash2 size={16} className="text-red-500" />
                          </button>
                          <button
                            onClick={() => setShowPopup(prev => ({...prev, [category]: true}))}
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
                          <span className="text-sm font-medium w-8">
                            {currentValue.toFixed(1)}
                          </span>
                          <input
                            type="range"
                            min="0"
                            max="10"
                            step="0.1"
                            value={currentValue}
                            onChange={(e) => handleValueChange(category, itemName, e.target.value, 'rating')}
                            className="w-24 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-600"
                          />
                        </div>
                      ) : (
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={currentValue.toFixed(1)}
                          onChange={(e) => handleValueChange(category, itemName, e.target.value, 'importance')}
                          onFocus={(e) => e.target.select()}
                          className="w-20 p-2 text-sm border rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      )}
                    </div>
                  </div>
                );
              })}

              {showPopup[category] && (
                <div className="mt-2 bg-white shadow-lg rounded-lg p-2">
                  <input
                    type="text"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    placeholder="New item name"
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleAddItem(category);
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
                        border: '1px solid hsl(220, 13.00%, 91.00%)',
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

  // Render content to display dashboard categories
  const renderContent = () => {
    if (!dashboardDataState || !dashboardDataState.dashboards) {
      return (
        <div className="text-center p-6 text-gray-500">
          No dashboard data available. Please analyze a job description first.
        </div>
      );
    }
    
    return (
      <>
        {Object.entries(dashboardDataState.dashboards).map(([category, items]) => 
          renderSection(category, items)
        )}
        
        {dashboardDataState.thresholds && Object.keys(dashboardDataState.thresholds).length > 0 && (
          <div className="mb-6 rounded-lg p-6 border border-gray-200 bg-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center cursor-pointer" onClick={() => toggleSection('Thresholds')}>
                <div className="mr-2">
                  {expandedSections['Thresholds'] ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                </div>
                <span className="text-gray-800 font-medium text-xl">Threshold Recommendations</span>
              </div>
            </div>
            
            {expandedSections['Thresholds'] && (
              <div className="mt-4">
                {Object.entries(dashboardDataState.thresholds).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                    <span className="text-gray-700">{key}</span>
                    <span className="font-medium">{value.toFixed(1)}{key.includes('Multiplier') ? '' : '%'}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </>
    );
  };

  return (
    <div className="h-full bg-white p-0">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">
          {dashboardDataState?.basic_info?.['Position Title'] || 'Job Analysis'}
        </h2>
        <button onClick={closeSidebar} className="text-gray-500 hover:text-gray-700">
          {/* Close button */}
        </button>
      </div>

      <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-lg border border-gray-200">
        <span className="text-lg text-gray-700">Rating Mode</span>
        <div className="flex items-center gap-2">
          <Switch
            checked={useRatings}
            onChange={() => setUseRatings(!useRatings)}
          />
          <span className="text-base text-gray-600">{useRatings ? 'Rating (0-10)' : 'Importance (0-100%)'}</span>
        </div>
      </div>

      <div className="space-y-6 overflow-y-auto">
        {renderContent()}
      </div>
      
      {dashboardDataState?.basic_info && (
        <div className="mt-6 rounded-lg p-6 border border-gray-200 bg-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center cursor-pointer" onClick={() => toggleSection('BasicInfo')}>
              <div className="mr-2">
                {expandedSections['BasicInfo'] ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
              </div>
              <span className="text-gray-800 font-medium text-xl">Basic Information</span>
            </div>
          </div>
          
          {expandedSections['BasicInfo'] && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(dashboardDataState.basic_info).map(([key, value]) => (
                <div key={key} className="p-2 hover:bg-gray-50 rounded">
                  <span className="font-medium text-gray-700">{key}: </span>
                  <span className="text-gray-600">{value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {dashboardDataState?.responsibilities && (
        <div className="mt-6 rounded-lg p-6 border border-gray-200 bg-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center cursor-pointer" onClick={() => toggleSection('Responsibilities')}>
              <div className="mr-2">
                {expandedSections['Responsibilities'] ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
              </div>
              <span className="text-gray-800 font-medium text-xl">Responsibilities</span>
            </div>
          </div>
          
          {expandedSections['Responsibilities'] && (
            <div className="mt-4">
              <p className="text-gray-700 whitespace-pre-line">{dashboardDataState.responsibilities}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RightSidebar;