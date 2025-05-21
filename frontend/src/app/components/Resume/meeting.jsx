"use client";
import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';
import {  
  X, 
  ChevronDown, 
  ChevronRight, 
  Mic, 
  StopCircle, 
  Shield, 
  History, 
  Eye,
  Award,
  Users,
  TrendingUp,
  Calendar,
  MessageSquare,
  Star
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
// import Header from '../../components/header';


// New History type component for the Score dashboard
const HistoryDashboard = ({ qaHistory }) => {
  const calculateAverageScore = () => {
    if (!qaHistory.length) return 0;
    const sum = qaHistory.reduce((acc, item) => acc + parseFloat(item.evaluation.score), 0);
    return (sum / qaHistory.length).toFixed(2);
  };

  const getPerformanceTrend = () => {
    if (qaHistory.length < 2) return null;
    const recentScores = qaHistory.slice(-5).map(item => parseFloat(item.evaluation.score));
    const trend = recentScores[recentScores.length - 1] - recentScores[0];
    return trend > 0 ? 'Improving' : trend < 0 ? 'Declining' : 'Stable';
  };

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Performance Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <Award className="w-6 h-6 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold">Overall Performance</h3>
          </div>
          <div className="text-3xl font-bold text-blue-600">{calculateAverageScore()}%</div>
          <p className="text-sm text-gray-600">Average Score</p>
        </div>

        {/* Total Responses Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <Users className="w-6 h-6 text-green-600 mr-2" />
            <h3 className="text-lg font-semibold">Total Responses</h3>
          </div>
          <div className="text-3xl font-bold text-green-600">{qaHistory.length}</div>
          <p className="text-sm text-gray-600">Questions Answered</p>
        </div>

        {/* Performance Trend Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <TrendingUp className="w-6 h-6 text-purple-600 mr-2" />
            <h3 className="text-lg font-semibold">Performance Trend</h3>
          </div>
          <div className="text-3xl font-bold text-purple-600">{getPerformanceTrend() || 'N/A'}</div>
          <p className="text-sm text-gray-600">Based on last 5 responses</p>
        </div>
      </div>

      <div className="mt-8">
        <div className="flex items-center mb-4">
          <History className="w-6 h-6 text-gray-600 mr-2" />
          <h3 className="text-xl font-semibold">Response History</h3>
        </div>
        <div className="space-y-4">
          {qaHistory.map((item, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <MessageSquare className="w-5 h-5 text-gray-600 mr-2" />
                    <p className="font-medium text-gray-800">{item.question}</p>
                  </div>
                  <p className="text-gray-600 ml-7">{item.answer}</p>
                </div>
                <div className="ml-4 text-right">
                  <div className="flex items-center justify-end mb-1">
                    <Star className="w-4 h-4 mr-1" color={
                      parseFloat(item.evaluation.score) >= 80 ? '#22c55e' :
                      parseFloat(item.evaluation.score) >= 60 ? '#eab308' :
                      '#ef4444'
                    } />
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      parseFloat(item.evaluation.score) >= 80 ? 'bg-green-100 text-green-800' :
                      parseFloat(item.evaluation.score) >= 60 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      Score: {item.evaluation.score}%
                    </span>
                  </div>
                  <div className="flex items-center justify-end text-sm text-gray-500">
                    <Calendar className="w-4 h-4 mr-1" />
                    <p>{new Date(item.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              </div>
              <div className="mt-2 ml-7 text-sm text-gray-600">
                <p><strong>Feedback:</strong> {item.evaluation.explanation}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Modified ScoreButton component to include history
const ScoreButton = ({ qaHistory = [] }) => {
  const [showDashboard, setShowDashboard] = useState(false);

  const toggleDashboard = () => {
    setShowDashboard(!showDashboard);
  };

  return (
    <>
      <button
        onClick={toggleDashboard}
        className="px-4 py-2 text-sm text-white bg-purple-600 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 flex items-center space-x-2 ml-2"
      >
        <Eye size={16} />
        <span>Score</span>
      </button>

      {showDashboard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-3/4 h-3/4 relative overflow-auto">
            <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white">
              <div className="flex items-center">
                <Award className="w-6 h-6 text-purple-600 mr-2" />
                <h2 className="text-lg font-semibold">Score Dashboard</h2>
              </div>
              <button
                onClick={toggleDashboard}
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                <X size={20} />
              </button>
            </div>
            <HistoryDashboard qaHistory={qaHistory} />
          </div>
        </div>
      )}
    </>
  );
};




// QASection Component
const QASection = ({ qaContent, generatedQAPairs, activeTab, onTabChange }) => {
  const [expandedQuestions, setExpandedQuestions] = useState({});
  const [expandedCandidates, setExpandedCandidates] = useState({});

  if (!qaContent && !generatedQAPairs?.length) return null;

  const colorPair = { q: 'text-black', a: 'text-black' };

  const parseQAContent = (content) => {
    const qaRegex = /Q\d+:\s*(.+?)\s*(?=A\d+:)\s*A\d+:\s*(.+?)(?=(?:\n\s*Q\d+:|$))/gs;
    const matches = Array.from(content.matchAll(qaRegex));
    return matches.map((match) => ({
      question: match[1].trim(),
      answer: match[2].trim(),
      colorPair
    }));
  };

  const qaItems = qaContent ? parseQAContent(qaContent) : [];

  const toggleQuestion = (index) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const toggleCandidate = (index) => {
    setExpandedCandidates(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  

  const TabButton = ({ tabId, label }) => (
    <button
      onClick={() => onTabChange(tabId)}
      className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ${
        activeTab === tabId
          ? 'border-b-2 border-blue-600 text-blue-600'
          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
      }`}
    >
      {label}
    </button>
  );

  const QATabContent = () => (
    <div className="space-y-4">
      {qaItems.map((item, index) => (
        <div key={index}>
          <div className="bg-white">
            <button
              onClick={() => toggleQuestion(index)}
              className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 transition-colors duration-200"
            >
              <div className="flex items-center space-x-2">
                <span 
                  className={`text-black transform transition-transform duration-300 ${
                    expandedQuestions[index] ? 'rotate-90' : 'rotate-0'
                  }`}
                >
                  ▶
                </span>
                <span className={`font-medium text-sm ${item.colorPair.q}`}>
                  {item.num} {item.question}
                </span>
              </div>
            </button>
            {expandedQuestions[index] && (
              <>
                <hr className="border-t border-black" />
                <div className="px-4 py-3 bg-gray-50">
                  <p className={`text-sm ${item.colorPair.a}`}>{item.answer}</p>
                </div>
              </>
            )}
          </div>
          {index < qaItems.length - 1 && <hr className="border-t border-black my-4" />}
        </div>
      ))}
      {qaItems.length === 0 && (
        <p className="text-gray-500 text-sm text-center py-4">No Q&A content available.</p>
      )}
      <hr className="border-gray-200" />
    </div>
  );
  
  const CandidatesTabContent = () => (
    <div className="space-y-4">
      {generatedQAPairs && generatedQAPairs.length > 0 ? (
        generatedQAPairs.map((pair, index) => (
          <div key={index}>
            <div className="bg-white">
              <button
                onClick={() => toggleCandidate(index)}
                className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="flex items-center space-x-2">
                  <span 
                    className={`text-black transform transition-transform duration-300 ${
                      expandedCandidates[index] ? 'rotate-90' : 'rotate-0'
                    }`}
                  >
                    ▶
                  </span>
                  <span className={`font-medium text-sm ${colorPairs[index % colorPairs.length].q}`}>
                    Q{index + 1}: {pair.question}
                  </span>
                </div>
              </button>
              {expandedCandidates[index] && (
                <>
                  <hr className="border-t border-black" />
                  <div className="px-4 py-3 bg-gray-50">
                    <p className={`text-sm ${colorPairs[index % colorPairs.length].a}`}>
                      A{index + 1}: {pair.answer}
                    </p>
                  </div>
                </>
              )}
            </div>
            {index < generatedQAPairs.length - 1 && <hr className="border-t border-black my-4" />}
          </div>
        ))
      ) : (
        <p className="text-gray-500 text-sm text-center py-4">
          No candidate answers generated yet. Use the "Similar Q&A" button to create some.
        </p>
      )}
    </div>
  );

  return (
    <div className="flex flex-col h-full">
       <div className="flex-1 overflow-y-auto scrollbar-hide p-4 overflow-x-hidden" 
            style={{ 
              msOverflowStyle: 'none', 
              scrollbarWidth: 'none'
            }}>
          {activeTab === 'qa' && <QATabContent />}
          {activeTab === 'candidates' && <CandidatesTabContent />}
          <style jsx>{`
            div::-webkit-scrollbar {
              display: none;
            }
          `}</style>
        </div>
    </div>
  );
}

// MeetingQAConverterPreview Component
const MeetingQAConverterPreview = ({ onGenerateQA, onEvaluationUpdate }) => {
  // Add isInitialized state
  const [isInitialized, setIsInitialized] = useState(false);
  const [recordingState, setRecordingState] = useState('idle');
  const [questionTexts, setQuestionTexts] = useState([]);
  const [answerTexts, setAnswerTexts] = useState([]);
  const [currentQuestionText, setCurrentQuestionText] = useState('');
  const [currentAnswerText, setCurrentAnswerText] = useState('');
  const [qaGenerationScale, setQAGenerationScale] = useState(3);
  const [evaluation, setEvaluation] = useState(null);
  const [currentAudioFilename, setCurrentAudioFilename] = useState('');
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [qaHistory, setQAHistory] = useState([]);

  // Initialize the transcriber when component mounts
  // useEffect(() => {
  //     const initializeTranscriber = async () => {
  //         try {
  //             const initResponse = await fetch('http://localhost:8000/api/v1/resume/initialize', {
  //                 method: 'POST',
  //                 headers: { 'Content-Type': 'application/json' },
  //                 body: JSON.stringify({ api_key: process.env.REACT_APP_API_KEY })
  //             });

  //             if (!initResponse.ok) {
  //                 throw new Error('Failed to initialize transcriber');
  //             }
  //             setIsInitialized(true);
  //         } catch (error) {
  //             console.error('Initialization error:', error);
  //             alert('Failed to initialize transcriber');
  //         }
  //     };

  //     initializeTranscriber();
  // }, []);
   
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
              const response = await fetch('http://localhost:8000/api/v1/resume/start-recording', {
                  method: 'POST'
              });

              if (!response.ok) throw new Error('Failed to start recording');
              setRecordingState('recordingQuestion');
          } 
          else if (recordingState === 'recordingQuestion' || recordingState === 'recordingAnswer') {
              const response = await fetch('http://localhost:8000/api/v1/resume/stop-recording', {
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

  const handleMapAnswer = async () => {
      try {
          const response = await fetch('http://localhost:8000/api/v1/resume/evaluate-qa', {
              method: 'POST'
          });

          if (!response.ok) {
              throw new Error('Failed to evaluate QA');
          }

          const data = await response.json();
          
          const formattedEvaluation = {
              mark: data.mark,
              score: data.score,
              explanation: data.explanation,
              relevance: parseFloat(data.score) || 0,
              accuracy: Math.min(parseFloat(data.score) * 0.8, 100) || 0,
              completeness: Math.min(parseFloat(data.score) * 0.7, 100) || 0,
              partially_relevant: Math.max(100 - parseFloat(data.score), 0) || 0,
              not_relevant: Math.max(20 - parseFloat(data.score), 0) || 0
          };

          setEvaluation(formattedEvaluation);
          setShowEvaluation(true);

          if (onEvaluationUpdate) {
              onEvaluationUpdate(formattedEvaluation);
          }

          // Update QA history
          setQAHistory(prev => [...prev, {
              question: currentQuestionText,
              answer: currentAnswerText,
              evaluation: formattedEvaluation
          }]);

      } catch (error) {
          console.error('Error evaluating answer:', error);
          alert('Failed to evaluate answer');
      }
  };

  const handleClear = async () => {
      try {
          const response = await fetch('http://localhost:8000/api/v1/resume/clear-transcription', {
              method: 'POST'
          });

          if (!response.ok) {
              throw new Error('Failed to clear transcription');
          }

          setCurrentQuestionText('');
          setCurrentAnswerText('');
          setQuestionTexts([]);
          setAnswerTexts([]);
          setEvaluation(null);
          setRecordingState('idle');
          setShowEvaluation(false);
      } catch (error) {
          console.error('Error clearing transcription:', error);
          alert('Failed to clear transcription');
      }
  };

  const generateQAPairs = async () => {
      if (!currentQuestionText || !currentAnswerText) {
          alert('Please record both question and answer first');
          return;
      }

      try {
          const response = await fetch('http://localhost:8000/api/v1/resume/generate-qa-from-audio', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                  num_pairs: qaGenerationScale,
                  original_qa: `${currentQuestionText}\n${currentAnswerText}`
              })
          });

          if (!response.ok) {
              throw new Error('Failed to generate QA pairs');
          }

          const data = await response.json();
          if (onGenerateQA) {
              onGenerateQA(data);
          }
      } catch (error) {
          console.error('Error generating QA pairs:', error);
          alert('Failed to generate QA pairs');
      }
  };
    return (
      <div className="bg-white-100 h-full flex justify-center items-center p-4 overflow-hidden">
  <div className="w-full h-full max-w-7xl rounded-lg">
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
        </div>
        <div>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          {/* <div className="border rounded-md p-4 bg-gray-50 mb-4 overflow-y-auto max-h-[calc(100vh-200px)]"> */}
            <div className="mb-2">
              {/* <h4 className="text-sm font-semibold text-gray-700 mb-2">Previous Questions:</h4> */}
              {questionTexts.map((qt, index) => (
                <p key={index} className="text-sm text-gray-800 mb-1">{qt}</p>
              ))}
            </div>
            {/* <hr className="border-t border-black mt-6" /> */}
            
            <div className="mt-2">
              {/* <h4 className="text-sm font-semibold text-gray-700 mb-2">Previous Answers:</h4> */}
              {answerTexts.map((at, index) => (
                <p key={index} className="text-sm text-gray-800 mb-1">{at}</p>
              ))}
            </div>
            {/* <hr className="border-t border-black mt-6" /> */}
            
            {/* <div className="border-t mt-2 pt-2"> */}
              {currentQuestionText && (
                <div className="mb-2">
                  {/* <p className="text-sm text-gray-800"><strong>Current Question:</strong> {currentQuestionText}</p> */}
                </div>
              )}
              {/* <hr className="border-t border-black mt-6" /> */}
              
              {currentAnswerText && (
                <div className="mt-2">
                  {/* <p className="text-sm text-gray-800"><strong>Current Answer:</strong> {currentAnswerText}</p> */}
                </div>
              )}
            </div>
          </div>

          {/* <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700">Generate Similar Q&A Pairs</h3>
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-sm text-gray-600">Scale:</span>
              <input
                type="range"
                min="1"
                max="10"
                value={qaGenerationScale}
                onChange={(e) => setQAGenerationScale(Number(e.target.value))}
                className="w-32 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-sm font-medium text-gray-700">{qaGenerationScale}</span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={generateQAPairs}
                className="w-medium px-4 py-2 text-sm text-white bg-blue-500 rounded-md hover:bg-blue-600"
              >
                Follow-UP Queries
              </button>
              <div className="flex-grow"></div>
              <button
                onClick={handleClear}
                className="w-medium px-3 py-1 text-sm text-white bg-orange-500 rounded-md hover:bg-orange-600"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col relative">
          <div className="flex flex-col ml-4">
            {showEvaluation && evaluation && (
              <div className="p-4 bg-gray-50 rounded-lg mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Evaluation</h3>
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-2xl">{evaluation.mark}</span>
                  <span className="text-lg font-medium text-black">{evaluation.score}</span>
                </div>
                <p className="text-sm text-gray-600">{evaluation.explanation}</p>
              </div>
            )}
          </div>
          <div className="flex-grow relative">
            <div className="absolute bottom-0 right-0">
              <button
                onClick={handleMapAnswer}
                className="px-3 py-1 text-sm text-white bg-blue-500 rounded-md hover:bg-blue-600"
              >
                Map
              </button>
            </div> */}
          </div>
        </div>
                </div>
              
            
          
        
      
    );
  };
  

// DashboardView Component
const DashboardView = ({
  content,
  title,
  qaScale,
  onQaScaleChange,
  onGenerateQa,
  isLoading,
  isExpanded,
  onCollapse,
  showControls,
  qaContent
}) => {
  const [activeQaTab, setActiveQaTab] = useState('qa');
  const [generatedQAPairs, setGeneratedQAPairs] = useState([]);
  const [evaluation, setEvaluation] = useState(null);
  const [showEvaluationChart, setShowEvaluationChart] = useState(false);
  const [qaHistory, setQAHistory] = useState([]);

  // Add new state for tracking questions and answers
  const [questionCount, setQuestionCount] = useState({
    asked: 0,
    answered: 0,
    unanswered: 0
  });

  // Function to check if an answer is considered "not really answered"
  const isNonAnswer = (answer) => {
    if (!answer) return true;
    
    const nonAnswerPhrases = [
      "i don't know",
      "i dont know",
      "don't know",
      "cant say",
      "can't say",
      "i will tell you later",
      "tell you later",
      "ask another question",
      "skip this question",
      "next question",
      "pass",
      "no idea",
      "not sure",
      "will get back",
      "let me think",
      "i'm not sure",
      "no answer",
      "no response",
      "i need time",
      "can't answer",
      "cannot answer",
      "let's move on",
      "maybe later",
      "not now",
    ];

    const lowerAnswer = answer.toLowerCase().trim();
    
    // Check for simple negative responses
    if (['no', 'nope', 'n/a', '-'].includes(lowerAnswer)) return true;
    
    // Check for phrases indicating non-answers
    return nonAnswerPhrases.some(phrase => lowerAnswer.includes(phrase));
  };

  useEffect(() => {
    // Update counts whenever qaHistory changes
    if (qaHistory.length > 0) {
      const asked = qaHistory.length;
      const answered = qaHistory.filter(item => {
        return item.answer && 
               item.answer.trim() !== '' && 
               !isNonAnswer(item.answer);
      }).length;
      const unanswered = asked - answered;
      
      setQuestionCount({
        asked,
        answered,
        unanswered
      });
    }
  }, [qaHistory]);

 


  const handleGenerateQA = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/resume/generate-qa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          num_pairs: qaScale,
          original_qa: content
        })
      });

      if (response.ok) {
        const data = await response.json();
        const pairs = data.generated.split('\n\n').map((pair, index) => {
          const [question, answer] = pair.split('\n');
          return {
            id: index + 1,
            question: question.replace(/^Q\d+:\s*/, ''),
            answer: answer.replace(/^A\d+:\s*/, '')
          };
        });
        setGeneratedQAPairs(pairs);
        setActiveQaTab('candidates');
      }
    } catch (error) {
      console.error('Error generating Q&A pairs:', error);
    }
  };

  const handleQAPairsGenerated = (pairs) => {
    setGeneratedQAPairs(pairs);
    setActiveQaTab('candidates');
  };

  const handleEvaluationUpdate = (evalData, questionText, answerText) => {
    setEvaluation(evalData);
    setShowEvaluationChart(true);
    
    // Add to history when evaluation is updated
    const historyItem = {
      question: questionText,
      answer: answerText,
      evaluation: evalData,
      timestamp: new Date().toISOString()
    };
    setQAHistory(prev => [...prev, historyItem]);
  };
    

    const containerClasses = isExpanded
    ? 'fixed top-0 left-0 w-full h-full bg-white z-50 overflow-hidden'
    : 'relative bg-white rounded-lg shadow-md';
   
    const ScoreAnalysisChart = ({ qaHistory }) => {
      // Process qaHistory to get the required data format for the chart
      const prepareChartData = (history) => {
        const qaScores = history.map((item, index) => ({
          name: `Q${index + 1}`,
          score: parseFloat(item.evaluation.score) || 0
        }));
    
        // Calculate total/average score
        const totalScore = history.length > 0 
          ? (history.reduce((acc, item) => acc + parseFloat(item.evaluation.score), 0) / history.length)
          : 0;
    
        // Add total score to the data
        qaScores.push({
          name: 'Average',
          score: parseFloat(totalScore.toFixed(2))
        });
    
        return qaScores;
      };
    
      const data = prepareChartData(qaHistory);
      const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
    
      return (
        <div className="flex flex-col items-center bg-gray-50 p-4 rounded-lg h-full">
          <h4 className="text-sm font-semibold text-gray-700 mb-4">Q&A Score Analysis</h4>
          <BarChart
            width={400}
            height={250}
            data={data}
            layout="vertical"
            margin={{ left: 20, right: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              type="number" 
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
            />
            <YAxis 
              dataKey="name" 
              type="category"
              width={80}
            />
            <Tooltip 
              formatter={(value) => [`${value}%`, 'Score']}
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                border: '1px solid #ddd',
                borderRadius: '8px'
              }}
            />
            <Bar dataKey="score">
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]}
                  className="hover:opacity-80 transition-opacity"
                />
              ))}
            </Bar>
          </BarChart>
        </div>
      );
    };
    
    
    const DetailedDonutChart = ({ evaluation }) => {
    // Default values if no evaluation is present
    const defaultEvaluation = {
    relevance: 0,
    accuracy: 0,
    completeness: 0,
    partially_relevant: 0,
    not_relevant: 0
    };
   
    // Use provided evaluation or default
    const evalData = evaluation || defaultEvaluation;
   
    // Prepare data for the pie chart
    const data = [
    {
    name: 'Fully Relevant',  
    value: evalData.relevance || 0,
    color: '#00C49F' // Green
    },
    {
    name: 'Partially Relevant',
    value: evalData.partially_relevant || 0,
    color: '#FFBB28' // Yellow
    },
    {
    name: 'Not Relevant',
    value: evalData.not_relevant || 0,
    color: '#FF8042' // Orange
    },
    {
    name: 'Accuracy',
    value: evalData.accuracy || 0,
    color: '#0088FE' // Blue
    },
    {
    name: 'Completeness',
    value: evalData.completeness || 0,
    color: '#8884D8' // Purple
    }
    ];
   
    return (
    <div className="flex flex-col items-center bg-gray-50 p-4 rounded-lg h-full">
    <h4 className="text-sm font-semibold text-gray-700 mb-4">Evaluation Metrics</h4>
    <div className="flex flex-col items-center">
    <PieChart width={300} height={300}>
    <Pie
    data={data}
    innerRadius={60}
    outerRadius={90}
    paddingAngle={5}
    dataKey="value"
    startAngle={90}
    endAngle={-270}
    >
    {data.map((entry, index) => (
    <Cell
    key={`cell-${index}`}
    fill={entry.color}
    stroke="#fff"
    strokeWidth={2}
    />
    ))}
    </Pie>
    <Tooltip
    formatter={(value, name) => [`${value.toFixed(2)}%`, name]}
    contentStyle={{
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    border: '1px solid #ddd',
    borderRadius: '8px'
    }}
    />
    </PieChart>
    <div className="mt-2 text-sm text-gray-700">
    <div className="flex justify-center space-x-4 flex-wrap">
    {data.map((entry, index) => (
    <div key={index} className="flex items-center m-1">
    <div
    className="w-3 h-3 mr-1"
    style={{ backgroundColor: entry.color }}
    />
    <span>{entry.name}: {entry.value.toFixed(2)}%</span>
    </div>
    ))}
    </div>
    </div>
    </div>
    </div>
    );
    };
   
    

    return (
    <div className={containerClasses}>
    <div className="h-full flex flex-col">
    {/* <Header /> */}
    <div className="p-4 border-b sticky top-0 bg-white z-10">
    <div className="flex justify-between items-center">
    <h3 className="text-sm font-medium text-gray-700">{title}</h3>
    <div className="flex items-center space-x-4">
    {showControls && (
    <>
    <Header />
    <div className="flex items-center space-x-2">
    <label className="text-sm text-gray-600">Q&A pairs:</label>
    <input
    type="range"
    min="1"
    max="10"
    value={qaScale}
    onChange={(e) => onQaScaleChange(parseInt(e.target.value))}
    className="w-24"
    />
    <span className="text-sm text-gray-600">{qaScale}</span>
    </div>
    {/* Enhanced statistics display with tooltips */}
    <div className="flex items-center space-x-4 text-sm bg-gray-50 p-2 rounded-md">
                      <div className="flex items-center space-x-2 group relative">
                        <span className="text-gray-600">Questions Asked:</span>
                        <span className="font-semibold text-blue-600 px-2 py-1 bg-blue-50 rounded">
                          {questionCount.asked}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 group relative">
                        <span className="text-gray-600">Properly Answered:</span>
                        <span className="font-semibold text-green-600 px-2 py-1 bg-green-50 rounded">
                          {questionCount.answered}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 group relative">
                        <span className="text-gray-600">Not Properly Answered:</span>
                        <span className="font-semibold text-red-600 px-2 py-1 bg-red-50 rounded">
                          {questionCount.unanswered}
                        </span>
                        <div className="hidden group-hover:block absolute bottom-full left-0 w-48 p-2 bg-gray-800 text-white text-xs rounded shadow-lg mb-2">
                          Includes responses like "I don't know", "Will tell later", etc.
                        </div>
                      </div>
                    </div>
                  
                  
     <button
     onClick={() => {
       onGenerateQa();
       handleGenerateQA();
     }}
     disabled={isLoading}
     className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
   >
     Generate Q&A
   </button>
   <ScoreButton qaHistory={qaHistory} />
 </>
)}
{isExpanded && (
 <button
   onClick={onCollapse}
   className="text-gray-500 hover:text-gray-700"
 >
   <X size={20} />
 </button>
)}
</div>
</div>
</div>

   
    {/* Main Content Area */}
    <div className="flex-1 overflow-auto">
    {isExpanded && (  
    <div className="p-4">
    <div className="grid grid-cols-3 gap-4 mb-4">
    <div className="bg-white rounded-lg shadow-md p-4 col-span-1">
    <pre className="whitespace-pre-wrap text-sm text-gray-600">
    {content}
    </pre>
    </div>
    {showEvaluationChart && evaluation ? (
  <div className="col-span-2 grid grid-cols-2 gap-4">
    <DetailedDonutChart evaluation={evaluation} />
    <ScoreAnalysisChart qaHistory={qaHistory} /> {/* Replace ContentHorizontalBarChart with ScoreAnalysisChart */}
  </div>
) : (
  <div className="col-span-2 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
    <div className="flex justify-center items-center h-screen">
    </div>
  </div>
  )}
    </div>
   
    
    </div>
    )}
    </div>
    </div>
  
    </div>
    );
  }
// Export all components
export { QASection, MeetingQAConverterPreview, DashboardView, ScoreButton};