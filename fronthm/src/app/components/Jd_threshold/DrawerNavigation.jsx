//RightSide Popup for JD Threshold
import { useState, useRef, useEffect } from 'react';
import JDPage from './page2'; // Ensure this path is correct to your JDPage component

const DrawerNavigationJD = ({ selectedJd, onClose }) => {
  const [isMaximized, setIsMaximized] = useState(false);
  const drawerRef = useRef(null);
  const [drawerWidth, setDrawerWidth] = useState(window.innerWidth * 0.6);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [originalData, setOriginalData] = useState(null);
  const [currentData, setCurrentData] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  // Extract job ID at component level so it can be used in multiple functions
  const jobId = selectedJd?.id || selectedJd?.job_id || selectedJd?.jobId || selectedJd?.database_id;

  // Initialize original data when component mounts
  useEffect(() => {
    if (selectedJd) {
      const initialData = {
        selection_threshold: selectedJd.selection_threshold || selectedJd.data?.selection_threshold || 0.0,
        rejection_threshold: selectedJd.rejection_threshold || selectedJd.data?.rejection_threshold || 0.0,
        selected_prompts: selectedJd.selected_prompts || ''
      };
      setOriginalData(initialData);
      setCurrentData(initialData);
    }
  }, [selectedJd]);

  // Detect changes by comparing original and current data
  useEffect(() => {
    if (originalData && currentData) {
      const changed = 
        originalData.selection_threshold !== currentData.selection_threshold ||
        originalData.rejection_threshold !== currentData.rejection_threshold ||
        originalData.selected_prompts !== currentData.selected_prompts;
      
      setHasChanges(changed);
    }
  }, [originalData, currentData]);

  // Prevent body scrolling when drawer is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const toggleMaximize = () => {
    setIsMaximized(!isMaximized);
    setDrawerWidth(isMaximized ? window.innerWidth * 0.6 : window.innerWidth);
  };

  const handleMouseDown = (e) => {
    if (e.target === document.getElementById('drawer-resize-handle')) {
      setIsDragging(true);
      setStartX(e.clientX);
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      const diff = e.clientX - startX;
      setDrawerWidth((prevWidth) => Math.max(Math.min(prevWidth + diff, window.innerWidth * 0.95), 300));
      setStartX(e.clientX);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleDrawerClick = (e) => {
    e.stopPropagation(); // Prevent clicks inside drawer from closing it
  };

  // Function to handle data changes from JDPage
  const handleDataChange = (newData) => {
    setCurrentData({
      ...currentData,
      ...newData
    });
  };

  // Function to show confirmation card
  const handleShowConfirmation = () => {
    setShowConfirmation(true);
  };

  // Function to handle threshold score update
  const handleUpdateThresholds = async () => {
    setShowConfirmation(false);
    
    if (!selectedJd || !jobId) {
      console.error("Selected JD data:", selectedJd);
      setUpdateMessage('Error: No job selected or invalid job ID');
      return;
    }
  
    setIsUpdating(true);
    setUpdateMessage('Updating threshold scores...');
    
    try {
      const thresholdData = {
        selection_score: currentData.selection_threshold,
        rejection_score: currentData.rejection_threshold,
        threshold_value: (currentData.selection_threshold + currentData.rejection_threshold) / 2,
        threshold_prompts: currentData.selected_prompts
      };
      
      const apiBaseUrl = "http://127.0.0.1:8000";
      const apiUrl = `${apiBaseUrl}/api/threshold-scores/${jobId}`;
      console.log("Calling API endpoint:", apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(thresholdData),
      });
      
      console.log("Response status:", response.status);
      
      if (response.status === 404) {
        throw new Error(`API endpoint not found: ${apiUrl}. Please check your API routes configuration.`);
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        
        let errorDetail;
        try {
          const errorJson = JSON.parse(errorText);
          errorDetail = errorJson.detail || `Server error: ${response.status}`;
        } catch (e) {
          errorDetail = `Server returned status ${response.status}`;
        }
        
        throw new Error(errorDetail);
      }
      
      const result = await response.json();
      console.log("Success response:", result);
      
      // Update original data to match current data after successful update
      setOriginalData({...currentData});
      setHasChanges(false);
      
      setUpdateMessage('Threshold scores updated successfully!');
      setTimeout(() => {
        setUpdateMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error updating threshold scores:', error);
      setUpdateMessage(`Error: ${error.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  // Add event listeners for mouse events outside the component
  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div
      className="fixed top-0 left-0 z-50 bg-gray-800 bg-opacity-50 w-full h-full"
      onClick={onClose}
    >
      <div
        ref={drawerRef}
        style={{ width: `${drawerWidth}px` }}
        className="absolute top-0 right-0 h-full bg-white border-l shadow-lg transition-all duration-300"
        onClick={handleDrawerClick}
      >
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-xl font-semibold">
            {selectedJd?.fileName || selectedJd?.title || 'Job Description'}
          </h3>
          <div className="flex items-center gap-3">
            {(
              <button
                onClick={handleShowConfirmation}
                disabled={isUpdating}
                className="px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed"
              >
                {isUpdating ? 'Updating...' : 'Update Changes'}
              </button>
            )}
            <button 
              onClick={toggleMaximize} 
              className="text-blue-500 hover:text-blue-700"
            >
              {isMaximized ? 'Restore' : 'Maximize'}
            </button>
            <button 
              onClick={onClose} 
              className="text-red-500 hover:text-red-700 font-semibold"
            >
              ✕
            </button>
          </div>
        </div>

        {updateMessage && (
          <div className={`p-2 text-center ${updateMessage.includes('Error') 
            ? 'bg-red-100 text-red-700' 
            : 'bg-green-100 text-green-700'}`}>
            {updateMessage}
          </div>
        )}

        {/* Confirmation Card */}
        {showConfirmation && (
          <div className="fixed inset-0 flex items-center justify-center z-50" onClick={(e) => e.stopPropagation()}>
            <div className="absolute inset-0 bg-black bg-opacity-50"></div>
            <div className="bg-white rounded-lg p-6 shadow-xl z-10 max-w-md w-full">
              <h3 className="text-xl font-semibold mb-4">Confirm Changes</h3>
              <div className="mb-4">
                <p className="mb-2">Are you sure you want to update the following threshold values?</p>
                <div className="bg-gray-100 p-3 rounded">
                  <p><span className="font-medium">Selection Threshold:</span> {currentData?.selection_threshold}</p>
                  <p><span className="font-medium">Rejection Threshold:</span> {currentData?.rejection_threshold}</p>
                  {currentData?.selected_prompts && (
                    <p><span className="font-medium">Selected Prompts:</span> {currentData.selected_prompts.length > 50 
                      ? `${currentData.selected_prompts.substring(0, 50)}...` 
                      : currentData.selected_prompts}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button 
                  onClick={() => setShowConfirmation(false)} 
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleUpdateThresholds} 
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

        <div 
          id="drawer-resize-handle"
          className="absolute top-0 left-0 w-1 h-full cursor-col-resize bg-gray-300 hover:bg-blue-500"
          onMouseDown={handleMouseDown}
        ></div>

        <div className="overflow-auto p-4 h-[calc(100%-64px)]">
          {selectedJd && (
            <JDPage 
              jdId={selectedJd?.id || selectedJd?.job_id || selectedJd?.jobId || selectedJd?.database_id}
              selectedFile={selectedJd.file} 
              jdData={selectedJd}
              onClose={onClose}
              onDataChange={handleDataChange}
            />
          )}
        </div> 
      </div>
    </div>
  );
};

export default DrawerNavigationJD;
