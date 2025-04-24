"use client"
import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Edit2, Trash2, Plus } from 'lucide-react';
// import FirstPageIcon from '@mui/icons-material/FirstPage';
import { Switch } from '@mui/material';
import { ResponsiveContainer, PieChart, Pie, BarChart, Bar, XAxis, YAxis, Cell, Tooltip } from 'recharts';

const RightSidebar = ({ closeSidebar, skills_data = {} }) => {
  const [expandedSections, setExpandedSections] = useState({});
  const [useRatings, setUseRatings] = useState(true);
  const [values, setValues] = useState({});
  const [showPopup, setShowPopup] = useState({});
  const [newItemName, setNewItemName] = useState('');
  const [skillsDataState, setSkillsDataState] = useState(skills_data);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [updatedSkillsData, setUpdatedSkillsData] = useState(skills_data);
  // Add this state to track recently updated items
  const [recentlyUpdated, setRecentlyUpdated] = useState({});

  useEffect(() => {
    console.log("RightSidebar received skills_data update:", skills_data);
  
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
        console.log("Available skills:");
        const roleData = skills_data[roleKey];
        ['skills', 'achievements', 'activities'].forEach(category => {
          if (roleData[category]) {
            console.log(`${category}:`, Object.keys(skills_data[roleKey][category]));
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
  }, [skills_data]);  // console.log("skills_data: ",skills_data)

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
        setValues(prev => ({
          ...prev,
          [`${section}-${itemId}`]: {
            rating: useRatings ? numValue : data.rating,
            importance: !useRatings ? numValue : data.importance
          }
        }));
      }
    }
  };

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
                        <span className="text-sm font-medium w-8">
                          {getValue(title, itemName, data)}
                        </span>
                        <input
                          type="range"
                          min="0"
                          max="10"
                          step="0.1"
                          value={getValue(title, itemName, data)}
                          onChange={(e) => handleValueChange(title, itemName, e.target.value, data)}
                          className="w-24 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-600"
                        />
                      </div>
                    ) : (
                      <input
                        type="number"
                        value={getValue(title, itemName, data)}
                        onChange={(e) => handleValueChange(title, itemName, e.target.value, data)}
                        onFocus={(e) => e.target.select()}
                        className="w-20 p-2 text-sm border rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
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
        <span className="text-lg text-gray-700">Rating Mode</span>
        <div className="flex items-center gap-2">
          <Switch
            checked={useRatings}
            onChange={() => setUseRatings(!useRatings)}
          />
          <span className="text-base text-gray-600">{useRatings ? '(0-10)' : '(0-100%)'}</span>
        </div>
      </div>

      <div className="space-y-6 overflow-y-auto">
        {renderContent()}
      </div>
    </div>
  );
};

export default RightSidebar;
 