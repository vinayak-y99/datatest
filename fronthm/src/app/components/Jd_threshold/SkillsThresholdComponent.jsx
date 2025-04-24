import React, { useState, useEffect } from 'react';
import { FaCheck, FaTimes, FaChartLine, FaAngleDown, FaAngleUp } from 'react-icons/fa';

const ThresholdIndicator = ({ value, selectionThreshold, rejectionThreshold }) => {
  const getColor = () => {
    if (value >= selectionThreshold) return 'bg-green-500';
    if (value <= rejectionThreshold) return 'bg-red-500';
    return 'bg-yellow-400';
  };

  return (
    <div className="relative w-full h-2 bg-gray-200 rounded-full">
      {/* Rejection threshold marker */}
      <div 
        className="absolute h-4 w-1 bg-red-600 rounded-sm -top-1" 
        style={{ left: `${rejectionThreshold * 100}%` }}
      ></div>
      
      {/* Selection threshold marker */}
      <div 
        className="absolute h-4 w-1 bg-green-600 rounded-sm -top-1" 
        style={{ left: `${selectionThreshold * 100}%` }}
      ></div>

      {/* Value bar */}
      <div 
        className={`h-full rounded-full ${getColor()}`}
        style={{ width: `${value * 100}%` }}
      ></div>
    </div>
  );
};

const CategorySection = ({ title, items, selectionThreshold, rejectionThreshold, expanded, onToggle }) => {
  const totalImportance = Object.values(items).reduce((sum, item) => sum + item.importance, 0);

  return (
    <div className="mb-4 border rounded-lg overflow-hidden">
      <div 
        className="flex justify-between items-center bg-gray-50 p-3 cursor-pointer"
        onClick={onToggle}
      >
        <h3 className="font-medium text-gray-800">{title}</h3>
        <div className="flex items-center">
          {expanded ? <FaAngleUp /> : <FaAngleDown />}
        </div>
      </div>
      
      {expanded && (
        <div className="p-3">
          {Object.entries(items).map(([name, data]) => {
            const { importance, selection_score, rejection_score, rating } = data;
            const weightedScore = (rating / 10) * (importance / 100);
            
            return (
              <div key={name} className="mb-3 last:mb-0">
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center">
                    <span className="text-sm font-medium">{name}</span>
                    <span className="ml-2 text-xs text-gray-500">
                      (Importance: {importance}%)
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                      Rating: {rating}/10
                    </span>
                    <span className="ml-2 text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                      Score: {weightedScore.toFixed(2)}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="flex-grow">
                    <ThresholdIndicator 
                      value={weightedScore} 
                      selectionThreshold={selection_score / 100} 
                      rejectionThreshold={rejection_score / 100}
                    />
                  </div>
                  <div className="ml-2 w-6">
                    {weightedScore >= (selection_score / 100) ? (
                      <FaCheck className="text-green-500" />
                    ) : weightedScore <= (rejection_score / 100) ? (
                      <FaTimes className="text-red-500" />
                    ) : (
                      <span className="text-yellow-500 text-xs">≈</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          
          <div className="mt-4 pt-3 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold">Category Total</span>
              <span className="text-sm font-bold">
                Importance: {totalImportance}%
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SkillsThresholdComponent = ({ data, onUpdateThresholds }) => {
  const [expanded, setExpanded] = useState({
    skills: true,
    achievements: true,
    activities: true
  });
  const [selectionThreshold, setSelectionThreshold] = useState(data.selection_threshold || 0.14075);
  const [rejectionThreshold, setRejectionThreshold] = useState(data.rejection_threshold || 0.14);
  const [selectedPrompts, setSelectedPrompts] = useState(data.selected_prompts || "");
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (data) {
      setSelectionThreshold(data.selection_threshold || 0.14075);
      setRejectionThreshold(data.rejection_threshold || 0.14);
      setSelectedPrompts(data.selected_prompts || "");
    }
  }, [data]);

  const handleToggleSection = (section) => {
    setExpanded(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleSelectionThresholdChange = (e) => {
    const value = parseFloat(e.target.value);
    setSelectionThreshold(value);
    setHasChanges(true);
  };

  const handleRejectionThresholdChange = (e) => {
    const value = parseFloat(e.target.value);
    setRejectionThreshold(value);
    setHasChanges(true);
  };

  const handlePromptsChange = (e) => {
    setSelectedPrompts(e.target.value);
    setHasChanges(true);
  };

  const handleSaveChanges = () => {
    if (onUpdateThresholds) {
      onUpdateThresholds({
        selection_threshold: selectionThreshold,
        rejection_threshold: rejectionThreshold,
        selected_prompts: selectedPrompts
      });
    }
    setHasChanges(false);
  };

  const role = data.roles?.[0] || "Unknown Role";
  const roleData = data.skills_data?.[role];

  if (!roleData) {
    return <div className="p-4 text-red-500">No data available for this role</div>;
  }

  const { skills, achievements, activities } = roleData;

  // Calculate total scores
  const calculateTotalScore = (items) => {
    return Object.values(items).reduce((sum, item) => {
      const weightedScore = (item.rating / 10) * (item.importance / 100);
      return sum + weightedScore;
    }, 0);
  };

  const skillsScore = calculateTotalScore(skills);
  const achievementsScore = calculateTotalScore(achievements);
  const activitiesScore = calculateTotalScore(activities);
  const totalScore = skillsScore + achievementsScore + activitiesScore;

  // Determine overall status
  const getOverallStatus = () => {
    if (totalScore >= selectionThreshold) return "Selection";
    if (totalScore <= rejectionThreshold) return "Rejection";
    return "Review";
  };

  const statusColors = {
    Selection: "bg-green-100 text-green-800",
    Rejection: "bg-red-100 text-red-800",
    Review: "bg-yellow-100 text-yellow-800"
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Role Analysis: {role}</h2>
        <div>
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className="px-3 py-1 rounded bg-blue-50 text-blue-600 hover:bg-blue-100 text-sm mr-2"
          >
            {isEditing ? "Cancel" : "Edit Thresholds"}
          </button>
          {isEditing && hasChanges && (
            <button 
              onClick={handleSaveChanges}
              className="px-3 py-1 rounded bg-green-500 text-white hover:bg-green-600 text-sm"
            >
              Save Changes
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:space-x-4 mb-6">
        <div className="md:w-1/2 mb-4 md:mb-0">
          <div className="p-4 border rounded-lg">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Threshold Settings</h3>
            
            <div className="mb-4">
              <label className="block text-xs text-gray-500 mb-1">Selection Threshold</label>
              <div className="flex items-center">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={selectionThreshold}
                  onChange={handleSelectionThresholdChange}
                  disabled={!isEditing}
                  className="w-full"
                />
                <span className="ml-2 text-sm font-medium">{selectionThreshold.toFixed(3)}</span>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-xs text-gray-500 mb-1">Rejection Threshold</label>
              <div className="flex items-center">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={rejectionThreshold}
                  onChange={handleRejectionThresholdChange}
                  disabled={!isEditing}
                  className="w-full"
                />
                <span className="ml-2 text-sm font-medium">{rejectionThreshold.toFixed(3)}</span>
              </div>
            </div>
            
            {isEditing && (
              <div>
                <label className="block text-xs text-gray-500 mb-1">Threshold Adjustment Prompts</label>
                <textarea
                  className="w-full p-2 border rounded text-sm"
                  rows="3"
                  value={selectedPrompts}
                  onChange={handlePromptsChange}
                  placeholder="Enter prompts for threshold adjustments..."
                />
              </div>
            )}
          </div>
        </div>
        
        <div className="md:w-1/2">
          <div className="p-4 border rounded-lg">
            <h3 className="text-sm font-medium text-gray-600 mb-3">Overall Score Analysis</h3>
            
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium">Total Score:</span>
              <span className="text-lg font-bold text-blue-600">{totalScore.toFixed(3)}</span>
            </div>
            
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium">Status:</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[getOverallStatus()]}`}>
                {getOverallStatus()}
              </span>
            </div>
            
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-600">Skills Score</span>
                  <span className="text-xs font-medium">{skillsScore.toFixed(3)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${skillsScore * 100}%` }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-600">Achievements Score</span>
                  <span className="text-xs font-medium">{achievementsScore.toFixed(3)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: `${achievementsScore * 100}%` }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-600">Activities Score</span>
                  <span className="text-xs font-medium">{activitiesScore.toFixed(3)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div className="bg-teal-500 h-1.5 rounded-full" style={{ width: `${activitiesScore * 100}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <CategorySection 
          title="Skills" 
          items={skills} 
          selectionThreshold={selectionThreshold} 
          rejectionThreshold={rejectionThreshold}
          expanded={expanded.skills}
          onToggle={() => handleToggleSection('skills')}
        />
        
        <CategorySection 
          title="Achievements" 
          items={achievements} 
          selectionThreshold={selectionThreshold} 
          rejectionThreshold={rejectionThreshold}
          expanded={expanded.achievements}
          onToggle={() => handleToggleSection('achievements')}
        />
        
        <CategorySection 
          title="Activities" 
          items={activities} 
          selectionThreshold={selectionThreshold} 
          rejectionThreshold={rejectionThreshold}
          expanded={expanded.activities}
          onToggle={() => handleToggleSection('activities')}
        />
      </div>
    </div>
  );
};

export default SkillsThresholdComponent;