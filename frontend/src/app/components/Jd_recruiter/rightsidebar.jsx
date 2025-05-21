"use client";
import React, { useState, useEffect } from 'react';
import { QASection, MeetingQAConverterPreview } from './meeting';
import { X, ChevronsRight, Mic, StopCircle} from 'lucide-react';
import {
  PieChart, Pie, Cell,
  BarChart, Bar, 
  LineChart, Line,
  AreaChart, Area,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer
} from 'recharts';

// Add global event listeners for file updates
const eventBus = {
  on(event, callback) {
    document.addEventListener(event, (e) => callback(e.detail));
  },
  dispatch(event, data) {
    document.dispatchEvent(new CustomEvent(event, { detail: data }));
  },
  remove(event, callback) {
    document.removeEventListener(event, callback);
  }
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export const Dashboard = () => { // Add file prop
 
  const [file, setFile] = useState(null);
  const [scale, setScale] = useState(1);
  const [prompt, setPrompt] = useState('');
  const [recordingState, setRecordingState] = useState('idle');
  const [samplePrompts, setSamplePrompts] = useState([]);
  const [dashboards, setDashboards] = useState([]);
  const [promptDashboard, setPromptDashboard] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [promptScale, setPromptScale] = useState(5);
  const [keywords, setKeywords] = useState([]);
  const [activeView, setActiveView] = useState(null);
  const [qaScales, setQaScales] = useState({});
  const [activeTab, setActiveTab] = useState('samples');
  const [dashboardHistory, setDashboardHistory] = useState([]);
  const [dashboardTitles, setDashboardTitles] = useState([]);
  const [expandedDashboard, setExpandedDashboard] = useState(null);
  const [generatedContentIndexes, setGeneratedContentIndexes] = useState(new Set());
  const [qaContents, setQaContents] = useState({});
  const [evaluation, setEvaluation] = useState(null);
  const [showEvaluationChart, setShowEvaluationChart] = useState(false);
  const [qaHistory, setQaHistory] = useState([]);
  const [isHovered, setIsHovered] = useState(false);

  
  
     const promptTemplates = [
       "Create a dashboard focusing on",
       "Build an analytics dashboard for",
       "Generate insights dashboard about",
       "Show key metrics dashboard for",
       "Display comprehensive dashboard on",
       "Visualize data in a dashboard for",
       "Present a detailed dashboard about",
       "Develop a dashboard analyzing",
       "Create an executive dashboard for",
       "Generate a performance dashboard for",
       "Design an interactive dashboard for",
       "Compose a metric-driven dashboard for",
       "Construct a data-rich dashboard about",
       "Prepare an analytical dashboard for",
       "Set up a monitoring dashboard for"
     ];
   
    //  const handleExpand = (type, index = null) => {
    //    if (expandedDashboard === null) {   
    //      setExpandedDashboard({ type, index });
    //    } else {
    //      setExpandedDashboard(null);
    //    }
    //  };
   
     const extractDashboardTitle = (content) => {
       const patterns = [
         /(?:^|\n)(?:Title|Dashboard|Report):\s*(.+?)(?:\n|$)/i,
         /(?:^|\n)(?:Analysis of|Overview of|Report on)\s*(.+?)(?:\n|$)/i,
         /^(.+?)(?:\n|$)/
       ];
   
       for (const pattern of patterns) {
         const match = content.match(pattern);
         if (match && match[1]) {
           return match[1].trim().substring(0, 50) + (match[1].length > 50 ? '...' : '');
         }
       }
   
       return 'Untitled Dashboard';
     };
   
     const addToHistory = (type, content) => {
      const historyItem = {
        type,
        content,
        timestamp: new Date().toLocaleString(),
      };
      setDashboardHistory(prev => [historyItem, ...prev]);
    };
     // Listen for file updates from ActionButtons
     useEffect(() => {
      const handleFileUpload = (eventData) => {
        const { file, keywords } = eventData;
        setFile(file);
        
        if (keywords && keywords.length > 0) {
          setKeywords(keywords);
          generateSamplePrompts(keywords, promptScale);
        }
      };
    
      eventBus.on('fileUploaded', handleFileUpload);
      return () => eventBus.remove('fileUploaded', handleFileUpload);
    }, [promptScale]);
    
    const generateSamplePrompts = (keywords, numPrompts) => {
      if (!keywords || keywords.length === 0) return [];
      const selectedKeywords = keywords.slice(0, numPrompts);
      const prompts = selectedKeywords.map(keyword => {
        const template = promptTemplates[Math.floor(Math.random() * promptTemplates.length)];
        return `${template} ${keyword}`;
      });
      setSamplePrompts(prompts);
      setActiveTab('samples');
    };
  
    const handleCreateDashboards = async () => {
      if (!file) {
        setError('Please upload a file first');
        return;
      }
    
      setIsLoading(true);
      setError('');
    
      try {
        const dashboardPromises = Array(scale).fill().map(async (_, index) => {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('scale', scale);
          formData.append('dashboard_index', index);
    
          const response = await fetch('http://localhost:8000/api/v1/jd/generate-dashboard/', {
            method: 'POST',
            body: formData
          });
    
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
    
          const data = await response.json();
          console.log("ASDFGHJKSDFGHJ",data)
          return data.content;
        });
    
        const results = await Promise.all(dashboardPromises);
        setDashboards(results);
        
        const titles = results.map(content => extractDashboardTitle(content));
        setDashboardTitles(titles);
        
        addToHistory('dashboards', results);
        setExpandedDashboard(null);
        setActiveView('created');
        setPromptDashboard('');
      } catch (error) {
        setError(error.message || 'Error generating dashboards');
      } finally {
        setIsLoading(false);
      }
    };
  
    const handlePromptScaleChange = (newScale) => {
      setPromptScale(newScale);
      if (keywords.length > 0) {
        generateSamplePrompts(keywords, newScale);
      }
    };
    
    
     const handleChevronClick = (index) => {
      if (expandedDashboard?.index === index && expandedDashboard?.type === 'content') {
        setExpandedDashboard(null);
      } else {
        setExpandedDashboard({ type: 'content', index });
      }
      
      // Add support for prompt dashboard
      if (index === 'prompt') {
        if (expandedDashboard?.type === 'prompt') {
          setExpandedDashboard(null);
        } else {
          setExpandedDashboard({ type: 'prompt' });
        }
      }
    };
    const handleEvaluationUpdate = (evalData, questionText, answerText) => {
      setEvaluation(evalData);
      setShowEvaluationChart(true);
      setQaHistory(prev => [...prev, {
        question: questionText,
        answer: answerText,
        evaluation: evalData,
        timestamp: new Date().toISOString()
      }]);
    };
     const handleRunPrompt = async (customPrompt = null) => {
      // Use either the provided custom prompt or the prompt from state
      const promptToUse = customPrompt || prompt;
      
      if (!file || !promptToUse) {
        setError('Please upload a file and enter a prompt');
        return;
      }
    
      setIsLoading(true);
      setError('');
    
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('prompt', promptToUse);
        formData.append('scale', 1);
        formData.append('dashboard_index', 0);
    
        const response = await fetch('http://localhost:8000/api/v1/jd/generate-dashboard/', {
          method: 'POST',
          body: formData
        });
    
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
    
        const data = await response.json();
        setPromptDashboard(data.content);
        addToHistory('prompt', { prompt: promptToUse, dashboard: data.content });
        setActiveView('prompt');
        setDashboards([]);
        setExpandedDashboard(null);
      } catch (error) {
        setError(error.message || 'Error generating prompt dashboard');
      } finally {
        setIsLoading(false);
      }
    };
      
     const handleGenerateQA = async (dashboardContent, index, numQA = 5) => {
       setIsLoading(true);
       setError('');
   
       try {
         const formData = new FormData();
         formData.append('dashboard_content', dashboardContent);
         formData.append('num_qa', numQA);
   
         const response = await fetch('http://localhost:8000/api/v1/jd/generate-qa/', {
           method: 'POST',
           body: formData
         });
   
         if (!response.ok) {
           throw new Error(`HTTP error! status: ${response.status}`);
         }
   
         const data = await response.json();
        
         const formattedQA = data.content.split('\n').map((line, idx) => {
           if (line.startsWith('Q:')) {
             return `Q${Math.floor(idx/2) + 1}: ${line.substring(2).trim()}`;
           } else if (line.startsWith('A:')) {
             return `A${Math.floor(idx/2) + 1}: ${line.substring(2).trim()}`;
           }
           return line;
         }).join('\n');
   
         setQaContents(prev => ({
           ...prev,
           [index === 'prompt' ? 'prompt' : index]: formattedQA
         }));
   
       } catch (error) {
         setError(error.message || 'Error generating Q&A');
       } finally {
         setIsLoading(false);
       }
     };
     const handleGenerateClick = (e, index) => {
      e.stopPropagation();
      setGeneratedContentIndexes(prev => {
        const newSet = new Set(prev);
        if (newSet.has(index)) {
          newSet.delete(index);
        } else {
          newSet.add(index);
        }
        return newSet;
      });
    };
    
    const handleQAPairsGenerated = (content, index, scale) => {
      // Handle generated QA pairs
      setQaContents(prev => ({...prev, [index]: generatedQA}));
    };
     const DashboardChart = ({ content, type }) => {
      // Parse dashboard content into data format
      const parseData = (content) => {
        const lines = content.split('\n').filter(line => line.trim());
        return lines.map((line, index) => {
          const value = Math.random() * 100; // Replace with actual data parsing logic
          return {
            name: line.includes(':') ? line.split(':')[1].trim().substring(0, 15) + '...' : line.substring(0, 15) + '...',
            value: parseInt(value),
            amt: parseInt(value * 0.8),
            pv: parseInt(value * 1.2),
            uv: parseInt(value * 0.9)
          };
        });
      };
    
      const data = parseData(content);
    
      const renderChart = () => {
        switch(type) {
          case 'pie':
            return (
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            );
    
          case 'donut':
            return (
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            );
    
          case 'bar':
            return (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            );
    
          case 'line':
            return (
              <ResponsiveContainer width="100%" height={400}>  
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="value" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            );
    
          case 'area':
            return (
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="value" stroke="#8884d8" fill="#8884d8" />
                </AreaChart>
              </ResponsiveContainer>
            );
    
          case 'radar':
            return (
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={data}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="name" />
                  <PolarRadiusAxis />
                  <Radar dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            );
    
          default:
            return null;
        }
      };
    
      return (
        <div className="w-full h-full">
          {renderChart()}
        </div>
      );
    };
    
     const handleClearAll = () => {
       setFile(null);
       setScale(1);
       setPrompt('');
       setSamplePrompts([]);
       setDashboards([]);
       setPromptDashboard('');
       setError('');
       setExpandedDashboard(null);
       setPromptScale(5);
       setKeywords([]);
       setActiveView(null);
       setQaScale(1);
       setQaContents({});
       setDashboardTitles([]);
       const fileInput = document.getElementById('file-upload');
       if (fileInput) fileInput.value = '';
     };
     const getRecordingButtonProps = () => {
      const states = {
        idle: {
          icon: <Mic size={18} className="text-green-600" />,
          text: 'Record',
          className: 'bg-green-50 text-green-600 hover:bg-green-100',
        },
        readyForQuestion: {
          icon: <Mic size={18} className="text-green-600" />,
          text: 'Record Question',
          className: 'bg-green-50 text-green-600 hover:bg-green-100',
        },
        recordingQuestion: {
          icon: <StopCircle size={18} className="text-white" />,
          text: 'Stop Question Recording',
          className: 'bg-red-500 text-white hover:bg-red-600',
        },
        readyForAnswer: {
          icon: <Mic size={18} className="text-green-600" />,
          text: 'Record Answer',
          className: 'bg-green-50 text-green-600 hover:bg-green-100',
        },
        recordingAnswer: {
          icon: <StopCircle size={18} className="text-white" />,
          text: 'Stop Answer Recording',
          className: 'bg-red-500 text-white hover:bg-red-600',
        },
      };
  
      return states[recordingState] || states.idle;
    };
    
    
    const handleRecordingClick = async () => {
      try {
          if (!isInitialized) {
              throw new Error('Transcriber not initialized');
          }

          if (recordingState === 'idle' || recordingState === 'readyForQuestion') {
              const response = await fetch('http://localhost:8000/api/v1/jd/start-recording', {
                  method: 'POST'
              });

              if (!response.ok) throw new Error('Failed to start recording');
              setRecordingState('recordingQuestion');
          } 
          else if (recordingState === 'recordingQuestion' || recordingState === 'recordingAnswer') {
              const response = await fetch('http://localhost:8000/api/v1/jd/stop-recording', {
                  method: 'POST'
              });

              if (!response.ok) throw new Error('Failed to stop recording');

              // Update state based on current recording type
              if (recordingState === 'recordingQuestion') {
                  setRecordingState('readyForAnswer');
              } else {
                  setRecordingState('readyForQuestion');
              }
          }
      } catch (error) {
          console.error('Recording error:', error);
          alert(`Failed to process recording: ${error.message}`);
          setRecordingState('idle');
      }
  };
  


     return (
      <div className="min-h-screen bg-gray-50">
      {/* <Header /> */}
      <div className="flex h-screen relative">
        {/* Sidebar */}
        <div
      className={`absolute left-0 top-0 h-full transition-all duration-300 z-10 ${
        isHovered ? 'translate-x-0' : '-translate-x-[calc(100%-2px)]'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div 
        className={`bg-white shadow-lg p-6 w-80 h-full overflow-hidden ${
          isHovered ? 'custom-scrolling' : ''
        }`}
        style={{
          scrollbarWidth: 'none', /* Firefox */
          msOverflowStyle: 'none', /* IE and Edge */
        }}
        onWheel={(e) => {
          if (isHovered) {
            const container = e.currentTarget;
            const scrollSpeed = 30; // Adjust this value to control scroll speed
            container.scrollTop += e.deltaY > 0 ? scrollSpeed : -scrollSpeed;
            e.preventDefault(); // Prevents default scroll behavior and stops propagation to page
            e.stopPropagation(); // Additional measure to prevent event bubbling to parent elements
          }
        }}
      >
    <div className="space-y-6">
       {/* Display current file name if exists */}
       {file && (
                <div className="text-sm text-gray-600">
                  Current file: {file.name}
                </div>
              )}
             

              {/* Dashboard Scale Section */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Number of Dashboards</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={scale}
                  onChange={(e) => setScale(parseInt(e.target.value))}
                  className="w-full"
                />
                <span className="text-sm text-gray-600">{scale}</span>
              </div>

              {/* Create Dashboards Button */}
              <button
                onClick={handleCreateDashboards}
                disabled={isLoading || !file}
                className="w-full px-4 py-2 text-sm text-white bg-[#5000d3] rounded-md hover:bg-[#4000b0] focus:outline-none focus:ring-2 focus:ring-[#5000d3] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Dashboards
              </button>

              {/* Custom Prompt Section */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Custom Prompt</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Enter your dashboard generation prompt..."
                  className="w-full min-h-[100px] px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black"
                />
              </div>

              {/* Run Prompt Button */}
              <button
                onClick={() => handleRunPrompt(prompt)}
                disabled={isLoading || !file || !prompt}
                className="w-full px-4 py-2 text-sm text-white bg-purple-600 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Run Prompt
              </button>

              {/* Sample Prompts Scale Section */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Number of Sample Prompts</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={promptScale}
                  onChange={(e) => handlePromptScaleChange(parseInt(e.target.value))}
                  className="w-full"
                />
                <span className="text-sm text-gray-600">{promptScale}</span>
              </div>

              {/* Sample Prompts Section with Tabs */}
              <div className="space-y-2 bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setActiveTab('samples')}
                      className={`px-3 py-1 text-sm rounded-md focus:outline-none transition-colors duration-200 ${
                        activeTab === 'samples'
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                          : 'bg-gray-200 text-black hover:bg-gray-300'
                      }`}
                    >
                      Samples
                    </button>
                    <button
                      onClick={() => setActiveTab('history')}
                      className={`px-3 py-1 text-sm rounded-md focus:outline-none transition-colors duration-200 ${
                        activeTab === 'history'
                          ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                          : 'bg-gray-200 text-black hover:bg-gray-300'
                      }`}
                    >
                      History
                    </button>
                  </div>
                </div>
                <div className="border rounded-md p-2 min-h-[200px] max-h-[300px] overflow-y-auto bg-white">
                  {activeTab === 'samples' ? (
                    <div className="space-y-2">
                      {samplePrompts.map((samplePrompt, index) => (
                        <button
                          key={index}
                          onClick={() => handleRunPrompt(samplePrompt)}
                          className="w-full px-4 py-2 text-sm text-black text-left border rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 truncate bg-white"
                          title={samplePrompt}
                        >
                          {samplePrompt}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {dashboardHistory.map((item, index) => (
                        <div key={index} className="p-2 border rounded-md bg-white">
                          <div className="flex justify-between items-center text-xs text-gray-600">
                            <span>{item.timestamp}</span>
                            <span>{item.type === 'dashboards' ? 'Multiple' : 'Single'}</span>
                          </div>
                          {item.type === 'prompt' ? (
                            <div className="mt-1">
                              <div className="text-sm font-medium text-black">{item.content.prompt}</div>
                              <button
                                onClick={() => {
                                  setPrompt(item.content.prompt);
                                  handleRunPrompt(item.content.prompt);
                                }}
                                className="mt-1 text-xs text-black hover:text-gray-700"
                              >
                                Use This Prompt
                              </button>
                            </div>
                          ) : (
                            <div className="mt-1">
                              <div className="text-sm text-black">Generated {item.content.length} dashboards</div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Clear All Button */}
              <button
                onClick={handleClearAll}
                className="w-full px-4 py-2 text-sm text-white bg-gradient-to-r from-red-500 to-pink-600 rounded-md hover:from-pink-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Clear All
              </button>
            </div>
          </div>
          <div className="absolute top-0 left-0 w-2 h-full bg-transparent cursor-pointer" />
</div>
   
           {/* Main Content Area (Middle) - adjusted to respond to sidebar state */}
        <div className={`flex-1 p-0 overflow-y-auto transition-all duration-300 ${
          isHovered ? 'ml-80' : 'ml-0'
        }`}>
          {error && (
            <div className="mb-6 p-4 text-red-700 bg-red-100 rounded-md">
              {error}
            </div>
          )}

          {isLoading && (
            <div className="flex justify-center items-center mb-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}
        </div>

        {/* Right Sidebar - adjusted to respond to left sidebar state */}
        <div className={`bg-white shadow-lg transition-all duration-300 overflow-y-auto border-l ${
          isHovered ? 'w-full' : 'w-full'
        }`}>
          {/* Your existing right sidebar content */}
          <div className="p-4 border-b">
            <div className="flex justify-between items-center">
              <h3 className="font-medium text-gray-700">
                {activeView === 'prompt' ? 'Custom Prompt Dashboard' : 'Job Description'}
              </h3>
              
              
            
            </div>
          </div>
   
             <div className="p-4">
           {/* Custom Prompt Dashboard View */}
<div className="flex flex-col space-y-4 w-full">
  {promptDashboard && (
    <div className="w-full">
      {/* Dashboard Header Container */}
      <div className="w-full flex items-center bg-white rounded-t-lg">
        {/* Chevron Button */}
        <button 
          onClick={() => handleChevronClick('prompt')}
          className="p-2 hover:bg-gray-100 rounded-tl-lg transition-colors duration-200 flex items-center"
        >
          <span 
            className={`text-black transform transition-transform duration-300 ${
              expandedDashboard?.type === 'prompt' 
                ? 'rotate-90' 
                : 'rotate-0'
            }`}
          >
            ▶
          </span>
        </button>

        {/* Dashboard Title with Generate Button */}
        <div className="flex items-center flex-grow">
          <h3 className="text-lg font- text-black p-2">
            Custom Prompt Dashboard
          </h3>
          <div className="flex items-center">
            <button 
              className="inline-flex items-center hover:opacity-80 transition-opacity"
              onClick={(e) => handleGenerateClick(e, 'prompt')}
            >
              <img 
                src="../../generate.svg.jpg"
                alt="Generate"
                className="w-5 h-5 cursor-pointer mx-2"
              />
            </button>
            <button className="inline-flex items-center hover:opacity-80 transition-opacity p-2">
              <ChevronsRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Content Section */}
      {expandedDashboard?.type === 'prompt' && (
        <div className="bg-white rounded-b-lg p-4">
          <div className="flex flex-col gap-6">
            <div className="flex gap-6">
              {/* Left Side: Dashboard Content */}
              <div className="w-1/2">
                <div className="space-y-2">
                  {typeof promptDashboard === 'string' 
                    ? promptDashboard.split('\n').map((line, lineIndex) => (
                        <div key={lineIndex} className="flex items-start space-x-2">
                          <span className="text-blue-500">•</span>
                          <p className="text-sm text-gray-700">{line}</p>
                        </div>
                      ))
                    : null}
                </div>
              </div>
              {/* Right Side: Chart */}
              <div className="w-1/2">
                <DashboardChart 
                  content={promptDashboard}
                  type="pie"
                />
              </div>
            </div>

            {/* Integrated Generated Content Section */}
            {generatedContentIndexes.has('prompt') && (
              <div className="flex gap-4 h-[500px]">
                {/* Left Box - Q&A Section */}
                <div className="flex-1 bg-white rounded-lg border overflow-hidden">
                  <div className="p-3 border-b bg-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-sm font-bold text-black">GenAI</h3>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <input
                            type="range"
                            min="1"
                            max="10"
                            value={qaScales['prompt'] || 5}
                            onChange={(e) => setQaScales(prev => ({...prev, ['prompt']: parseInt(e.target.value)}))}
                            className="w-24"
                          />
                          <span className="text-sm text-black">{qaScales['prompt'] || 5}</span>
                        </div>
                        <button
                          onClick={() => handleGenerateQA(promptDashboard, 'prompt', qaScales['prompt'] || 5)}
                          className="px-3 py-1 text-sm bg-white text-blue-600 rounded-md hover:bg-gray-100"
                        >
                          Generate Q&A
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 overflow-y-auto h-[calc(100%-64px)]">
                    <QASection
                      qaContent={qaContents['prompt']}
                      generatedQAPairs={[]}
                      activeTab="qa"
                      onTabChange={() => {}}
                    />
                  </div>
                </div>
                {/* Right Box - Q&A Converter */}
                <div className="flex-1 bg-white rounded-lg border overflow-hidden">
                  <div className="p-3 border-b bg-white">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-sm font-bold text-black">Candidate Interview</h3>
                    </div>
                  </div>
                  <div className="h-[calc(100%-64px)] overflow-y-auto">
                    <MeetingQAConverterPreview
                      onGenerateQA={handleQAPairsGenerated}
                      onEvaluationUpdate={handleEvaluationUpdate}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )}
</div>
  
  
    
  

 {/* Modified section for Generated Dashboards View */}
<div className="flex flex-col space-y-2 w-full">
    {dashboards.map((content, index) => (
      <div key={index} className="w-full">
        {/* Add divider before each dashboard except the first one */}
        {index > 0 && (
          <hr className="border-t border-black my-2" />
        )}
        
        {/* Dashboard Header Container */}
        <div className="w-full flex items-center">
          <button 
            onClick={() => handleChevronClick(index)}
            className="p-2 hover:bg-gray-100 transition-colors duration-200 flex items-center"
          >
            <span className={`text-black transform transition-transform duration-300 ${
              expandedDashboard?.index === index ? 'rotate-90' : 'rotate-0'
            }`}>▶</span>
          </button>

          <div className="flex items-center flex-grow">
            <h3 className="text-lg font- text-black p-2">
              {dashboardTitles[index] || `Dashboard ${index + 1}`}
            </h3>
            <div className="flex items-center">
              <button 
                className="inline-flex items-center hover:opacity-80 transition-opacity"
                onClick={(e) => handleGenerateClick(e, index)}
              >
                <img 
                  src="../../generate.svg.jpg"
                  alt="Generate"
                  className="w-5 h-5 cursor-pointer mx-2"
                />
              </button>
              <button className="inline-flex items-center hover:opacity-80 transition-opacity p-2">
                <ChevronsRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Expanded Content Section */}
{expandedDashboard?.index === index && (
  <div className="p-4">
    <div className="flex gap-6">
      {/* Dashboard Content and Visualization */}
      <div className="w-1/2">
        <div className="space-y-2">
          {typeof content === 'string' 
            ? content.split('\n').map((line, lineIndex) => (
                <div key={lineIndex} className="flex items-start space-x-2">
                  <span className="text-blue-500">•</span>
                  <p className="text-sm text-gray-700">{line}</p>
                </div>
              ))
            : null}
        </div>
      </div>
      <div className="w-1/2 flex items-middle justify-center">
        <DashboardChart 
          content={content}
          type={['pie', 'donut', 'bar', 'line', 'area', 'radar'][index % 6]}
        />
      </div>
    </div>
            {/* Added horizontal line below content and chart */}
            <hr className="border-t border-black mt-6" />
            

            {/* Generated Content Section */}
{generatedContentIndexes.has(index) && (
  <div className="mt-8">
    <div className="flex gap-4 h-[500px] relative">
      {/* Left Box - Q&A Section */}
      <div className="flex-1 overflow-hidden">
        <div className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <h3 className="text-sm font-bold text-gray-800">GenAI</h3>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={qaScales[index] || 5}
                  onChange={(e) =>
                    setQaScales(prev => ({
                      ...prev,
                      [index]: parseInt(e.target.value)
                    }))
                  }
                  className="w-24"
                />
                <span className="text-sm text-gray-700">
                  {qaScales[index] || 5}
                </span>
              </div>
              <button
                onClick={() => handleGenerateQA(content, index, qaScales[index] || 5)}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
              >
                Generate Q&A
              </button>
            </div>
          </div>
        </div>
        <div className="p-4 overflow-y-auto h-[calc(100%-64px)]">
          <QASection
            qaContent={qaContents[index]}
            generatedQAPairs={[]}
            activeTab="qa"
            onTabChange={() => {}}
            className="divide-y divide-gray-200"
          />
        </div>
      </div>
    
      
      {/* Vertical Divider */}
      <div className="w-px bg-gray-300 h-full"></div>
      <div className="flex-1 overflow-hidden">
  <div className="p-3">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <h3 className="text-sm font-bold text-gray-800">Candidate Interview</h3>
      </div>
      <button
        onClick={handleRecordingClick}
        className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm transition-all duration-200 ${
          getRecordingButtonProps().className
        }`}
      >
        {getRecordingButtonProps().icon}
        <span>{getRecordingButtonProps().text}</span>
      </button>
    </div>
  </div>
  <div className="h-[calc(100%-64px)] overflow-y-auto">
    <MeetingQAConverterPreview
      onGenerateQA={handleQAPairsGenerated}
      onEvaluationUpdate={handleEvaluationUpdate}
    />
  </div>
</div>
    </div>
    </div>

              )}
            </div>

            )}</div>
          ))}</div>
      </div>
      </div>
      </div>
      </div>
     )
    }
export default Dashboard;