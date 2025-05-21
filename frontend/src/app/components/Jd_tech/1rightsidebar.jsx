"use client";
import React, { useState, useEffect } from 'react';
import BalticGDPChart from '../charts/BalticGDPChart';
import WeeklyEarningsChart from '../charts/WeeklyEarningsChart';

const RightsideBar = () => {
  // State to store sections data with a more comprehensive structure
  const [sections, setSections] = useState([
    {
      id: 'skills',
      title: 'Skills Matrix',
      fields: [
        'Skills Matrix',
        'Experience Distribution',
        'Location and Availability',
        'Project Experience and Domain Expertise',
        'Soft Skills and Collaboration',
        'Tools and Technologies'
      ],
      genContentId: 'generateContent1',
      isOpen: false
    },
    {
      id: 'Domain',
      title: 'Experience Distribution',
      fields: [
        'Leadership',
        'Communication',
        'Planning',
        'Analysis',
        'Innovation',
        'Strategy'
      ],
      genContentId: 'generateContent2',
      isOpen: false
    },
    {
      id: 'Critical',
      title: 'Location and Availability',
      fields: [
        'Lansing, Illinois',
        'Portland, Illinois',
        'Stockton, New Hampshire',
        'Lafayette, California',
        'Pasadena, Oklahoma',
        'Corona, Michigan'
      ],
      genContentId: 'generateContent3',
      isOpen: false
    },
    {
      id: 'Company',
      title: 'Project Experience and Domain Expertise',
      fields: [
        'Projects',
        'Role',
        'Timeframe',
        'Achievements',
        'Skills',
        'Objective'
      ],
      genContentId: 'generateContent4',
      isOpen: false
    },
    {
      id: 'Managerial',
      title: 'Soft Skills Collaboration',
      fields: [
        'Empathy',
        'Communication',
        'Teamwork',
        'Problem-Solving',
        'Leadership',
        'Creativity'
      ],
      genContentId: 'generateContent5',
      isOpen: false
    },
    {
      id: 'Project',
      title: 'Tools and Technologies',
      fields: [
        'Webpack',
        'Vs Code',
        'GitHub',
        'Chrome DevTools',
        'Leadership',
        'Cypress'
      ],
      genContentId: 'generateContent6',
      isOpen: false
    }
  ]);

  // Question data structure
  const questionData = [
    {
      id: "Mandatory",
      question: "Mandatory Skills ?",
      answer: "Python"
    },
    {
      id: "Education",
      question: "Education ?",
      answer: "B.Tech"
    }
  ];

  // Toggle accordion sections
  const customAcordian = (sectionId) => {
    setSections(prevSections => 
      prevSections.map(section => ({
        ...section,
        isOpen: section.id === sectionId ? !section.isOpen : section.isOpen
      }))
    );
  };

  // Toggle right content panels
  const toggleRightContent = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.style.display = element.style.display === 'none' ? 'block' : 'none';
    }
  };

  // Function to generate content sections
  const genContent = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.style.display = 'block';
    }
  };

  // Function to collapse right divs
  const righCollapseDiv = () => {
    const rightContents = document.querySelectorAll('.right-content');
    rightContents.forEach(content => {
      content.style.display = 'none';
    });
    
    // Additional behavior from second component
    const collapseDiv = document.getElementById("righCollapseDiv");
    if (collapseDiv) {
      const accordionButtons = collapseDiv.querySelectorAll('.accordion-button');
      accordionButtons.forEach(button => {
        button.classList.toggle('open');
        button.nextElementSibling.classList.toggle('open');
      });
      
      const pageHeight = document.getElementById('pageHeight');
      if (pageHeight) {
        if (collapseDiv.style.display === 'none') {
          pageHeight.style.setProperty('height', '3200px');
        } else {
          pageHeight.style.setProperty('height', 'auto');
        }
      }
      
      collapseDiv.style.display = collapseDiv.style.display === 'none' ? 'block' : 'none';
    }
  };

  // Add accordion functionality
  useEffect(() => {
    const accordionButtons = document.querySelectorAll('.accordion-button');
    
    const handleAccordionClick = (event) => {
      const button = event.currentTarget;
      const panel = button.nextElementSibling;
      if (panel) {
        panel.classList.toggle('open');
        button.classList.toggle('open');
      }
    };
    
    accordionButtons.forEach(button => {
      button.addEventListener('click', handleAccordionClick);
    });

    // Cleanup function to remove event listeners
    return () => {
      accordionButtons.forEach(button => {
        button.removeEventListener('click', handleAccordionClick);
      });
    };
  }, []);

  // Render charts and fields section
  const renderSectionContent = (section) => {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* First Column - Fields */}
        <div style={{backgroundColor:'#FFF', border:'0px solid #eee', marginBottom:'10px'}}>
          <div style={{width:'80%', border:'0px solid #ddd', borderRadius:'5px', fontSize:'16px', paddingTop:'0px', paddingBottom:'10px'}}>
            <div style={{width:'80%', marginLeft:'10%'}}>
              {section.fields.map((field, index) => (
                <p 
                  key={index} 
                  style={{
                    color:'#504F4F', 
                    paddingTop:'5px', 
                    paddingBottom:'4px', 
                    borderBottom: index < section.fields.length - 1 ? '0px solid #eee' : 'none'
                  }}
                >
                  {field}
                </p>
              ))}
            </div>
          </div>
        </div>
        
        {/* Second Column - Percentage Chart */}
        <div style={{backgroundColor:'#FFF', border:'0px solid #ddd', marginBottom:'10px', borderRadius:'5px'}}>
          <div style={{width:'100%', backgroundColor:'#fff', color:'#444', fontSize:'14px', paddingLeft:'10px', lineHeight:'30px', borderBottom:'0px solid #ddd'}}>
            <p style={{width:'100%', textAlign:'center'}}>Total Percentage</p>
          </div> 
          <div>
            <BalticGDPChart />
          </div>
          
          <div style={{width:'100%', display:'flex', alignItems:'center', color:'#444', borderTop:'0px solid #ddd', fontSize:'14px', lineHeight:'30px', justifyContent:'center'}}>
            <p style={{marginLeft:'0px'}}>
              <span style={{width:'10px', height:'10px', backgroundColor:'red', borderRadius:'5px', display:'inline-block', float:'left', marginLeft:'8px', marginRight:'8px', marginTop:'10px'}}></span>
              Correct Answer
            </p>
            <p style={{marginLeft:'0px'}}>
              <span style={{width:'10px', height:'10px', backgroundColor:'red', borderRadius:'5px', display:'inline-block', float:'left', marginLeft:'8px', marginRight:'8px', marginTop:'10px'}}></span>
              Wrong Answer
            </p>
            <p style={{marginLeft:'0px'}}>
              <span style={{width:'10px', height:'10px', backgroundColor:'red', borderRadius:'5px', display:'inline-block', float:'left', marginLeft:'8px', marginRight:'8px', marginTop:'10px'}}></span>
              Not Attempt
            </p>
          </div>
        </div>
        
        {/* Third Column - Score Chart */}
        <div style={{backgroundColor:'#FFF', border:'0px solid #ddd', marginBottom:'10px', borderRadius:'5px'}}>
          <div style={{width:'100%', backgroundColor:'#fff', color:'#444', fontSize:'14px', paddingLeft:'10px', lineHeight:'30px', borderBottom:'0px solid #ddd'}}>
            <p style={{width:'100%', textAlign:'center'}}>Total Score</p>
          </div>
          <div>
            <WeeklyEarningsChart />
          </div>
        </div>
      </div>
    );
  };

  // Render generate content section with Q&A
  const renderGenerateContent = (genContentId) => {
    return (
      <div id={genContentId} style={{marginTop:'40px', display:'none'}}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6" style={{borderBottom:'1px solid #ddd'}}>
          <div>
            <p>
              <span style={{color:'#6b76f3', fontWeight:'bold', marginLeft:'0px'}}>Generate AI</span>
              <span style={{color:'#4285F4', fontWeight:'100', marginLeft:'4px'}}>Questions & Answers</span>
            </p>
          </div>
          
          <div>
            <div style={{float:'left'}}>
              <span style={{color:'#4285F4', fontWeight:'bold', marginLeft:'0px'}}>Candidate</span>
              <span style={{color:'#4285F4', fontWeight:'100', marginLeft:'4px'}}>Answer</span>
            </div>
            
            <div style={{float:'right', marginBottom:'6px'}}>
              <div style={{border:'0px solid #ccc', float:'left', borderRadius:'15px', paddingLeft:'6px', paddingRight:'6px'}}>
                <img style={{width:'20px', float:'left', marginRight:'2px', marginTop:'2px'}} src="../../record.svg" />
                <span style={{marginTop:'2px', display:'inline-block'}}> 00:00:00</span>
              </div>
              <img style={{width:'24px', float:'right', margin:'2px 2px auto 10px'}} src="../../stop.svg" />
            </div>
          </div>
        </div>
        
        {/* Question Accordions */}
        {questionData.map((q, qIndex) => (
          <div key={qIndex} className="grid grid-cols-1 sm:grid-cols-2 gap-6" style={{borderBottom: qIndex === 0 ? '1px solid #ddd' : undefined}}>
            <div 
              className="accordion" 
              onClick={() => toggleRightContent(`right-${genContentId}-${qIndex}`)} 
              style={{borderRight:'1px solid #ddd', marginTop:'0px', marginBottom:'0px'}}
            >
              <button className="accordion-button">
                <span className="arrow">▶</span> {q.question}
              </button>
              <div className="panel">
                <ul style={{listStyle:'none', marginLeft:'32px', marginTop:'0px', padding:'0px'}}>
                  <li style={{color:'green'}}>Answer:</li>
                  <li>{q.answer}</li>
                </ul>
              </div>
            </div>
            
            <div className="accordion right-content" id={`right-${genContentId}-${qIndex}`} style={{ display: 'none' }}>
              <button className="accordion-button">
                <span className="arrow">▶</span> {q.question}
              </button>
              <div className="panel">
                <ul style={{listStyle:'none', marginLeft:'32px', marginTop:'0px', padding:'0px'}}>
                  <li style={{color:'green'}}>Answer:</li>
                  <li>{q.answer}</li>
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto pl-6 pt-2" id="pageHeight">
      {sections.map((section, index) => (
        <div 
          key={index} 
          className="accordion" 
          style={{
            borderBottom: index < sections.length - 1 ? '1px solid #666' : '0px'
          }}
        >
          <div style={{display:'flex', alignItems:'center'}}>
            <p 
              style={{width:'20px'}} 
              className="accordion-button" 
              id={`${section.id}Btn`} 
              onClick={() => customAcordian(section.id)}
            >
              <span className="arrow">▶</span>
            </p> 
            <p style={{marginLeft:'10px'}}>{section.title}</p>
            
            <div id={`${section.id}Btns`} className={section.isOpen ? 'displayblock' : 'displaynone'}>
              <img 
                style={{
                  display:'inline-flex',
                  marginBottom:'4px',
                  marginLeft:'15px',
                  marginRight:'8px',
                  width:'16px',
                  cursor:'pointer',
                  float:'left',
                  marginTop:'4px'
                }} 
                src="../../swap.svg" 
              />
              <img 
                style={{
                  display:'inline-flex',
                  marginBottom:'4px',
                  width:'20px',
                  cursor:'pointer',
                  marginTop:'2px',
                  marginRight:'4px'
                }} 
                src="../../generate.svg" 
                onClick={() => genContent(section.genContentId)}
              />
              <img 
                style={{
                  display:'inline-flex',
                  marginBottom:'4px',
                  width:'16px',
                  cursor:'pointer',
                  marginTop:'2px',
                  marginRight:'4px'
                }} 
                src="../../doubleRightArrow.svg" 
                onClick={righCollapseDiv}
              />
            </div>
          </div>
          
          <div 
            className="panel" 
            id={`${section.id}Panel`} 
            style={{display: section.isOpen ? 'block' : 'none'}}
          >
            {renderSectionContent(section)}
            <hr/>
            {renderGenerateContent(section.genContentId)}
          </div>
        </div>
      ))}
    </div>
  );
};

export default RightsideBar;



// "use client";
// import React, { useState, useEffect } from 'react';
// import BalticGDPChart from '../charts/BalticGDPChart';
// import WeeklyEarningsChart from '../charts/WeeklyEarningsChart';
// import axios from 'axios';

// // API base URL - adjust this to your FastAPI server address
// const API_BASE_URL = 'http://localhost:8000/api';

// const RightsideBar = () => {
//   // State to store sections data
//   const [sections, setSections] = useState([]);
//   // State to store question data
//   const [questionData, setQuestionData] = useState([]);
//   // Loading state
//   const [loading, setLoading] = useState(true);
//   // Error state
//   const [error, setError] = useState(null);

//   // Fetch sections data from API
//   useEffect(() => {
//     const fetchSections = async () => {
//       try {
//         setLoading(true);
//         const response = await axios.get(`${API_BASE_URL}/sections`);
//         setSections(response.data.map(section => ({
//           ...section,
//           isOpen: false
//         })));
//         setLoading(false);
//       } catch (err) {
//         console.error("Error fetching sections:", err);
//         setError("Failed to load sections data");
//         setLoading(false);
        
//         // Fallback to default data if API fails
//         setSections([
//           {
//             id: 'skills',
//             title: 'Skills Matrix',
//             fields: [
//               'Skills Matrix',
//               'Experience Distribution',
//               'Location and Availability',
//               'Project Experience and Domain Expertise',
//               'Soft Skills and Collaboration',
//               'Tools and Technologies'
//             ],
//             genContentId: 'generateContent1',
//             isOpen: false
//           },
//           // Add other default sections as needed
//         ]);
//       }
//     };

//     const fetchQuestions = async () => {
//       try {
//         const response = await axios.get(`${API_BASE_URL}/questions`);
//         setQuestionData(response.data);
//       } catch (err) {
//         console.error("Error fetching questions:", err);
        
//         // Fallback to default questions if API fails
//         setQuestionData([
//           {
//             id: "Mandatory",
//             question: "Mandatory Skills ?",
//             answer: "Python"
//           },
//           {
//             id: "Education",
//             question: "Education ?",
//             answer: "B.Tech"
//           }
//         ]);
//       }
//     };

//     fetchSections();
//     fetchQuestions();
//   }, []);

//   // Toggle accordion sections
//   const customAcordian = (sectionId) => {
//     setSections(prevSections => 
//       prevSections.map(section => ({
//         ...section,
//         isOpen: section.id === sectionId ? !section.isOpen : section.isOpen
//       }))
//     );
//   };

//   // Toggle right content panels
//   const toggleRightContent = (id) => {
//     const element = document.getElementById(id);
//     if (element) {
//       element.style.display = element.style.display === 'none' ? 'block' : 'none';
//     }
//   };

//   // Function to generate content sections with API call
//   const genContent = async (id, sectionId) => {
//     try {
//       // Show loading state
//       const element = document.getElementById(id);
//       if (element) {
//         element.style.display = 'block';
//         element.innerHTML = '<div class="text-center py-4">Loading generated content...</div>';
//       }
      
//       // Call FastAPI endpoint to generate content
//       const response = await axios.post(`${API_BASE_URL}/generate-content`, {
//         sectionId: sectionId
//       });
      
//       // Update questions with generated content
//       setQuestionData(prevQuestions => {
//         // Merge new questions with existing ones
//         const newQuestions = response.data;
//         const existingIds = prevQuestions.map(q => q.id);
//         const filteredNewQuestions = newQuestions.filter(q => !existingIds.includes(q.id));
//         return [...prevQuestions, ...filteredNewQuestions];
//       });
      
//       // Display the content
//       if (element) {
//         element.style.display = 'block';
//       }
      
//     } catch (err) {
//       console.error("Error generating content:", err);
//       const element = document.getElementById(id);
//       if (element) {
//         element.innerHTML = '<div class="text-center py-4 text-red-500">Failed to generate content. Please try again.</div>';
//       }
//     }
//   };

//   // Function to collapse right divs
//   const righCollapseDiv = () => {
//     const rightContents = document.querySelectorAll('.right-content');
//     rightContents.forEach(content => {
//       content.style.display = 'none';
//     });
    
//     // Additional behavior from second component
//     const collapseDiv = document.getElementById("righCollapseDiv");
//     if (collapseDiv) {
//       const accordionButtons = collapseDiv.querySelectorAll('.accordion-button');
//       accordionButtons.forEach(button => {
//         button.classList.toggle('open');
//         button.nextElementSibling.classList.toggle('open');
//       });
      
//       const pageHeight = document.getElementById('pageHeight');
//       if (pageHeight) {
//         if (collapseDiv.style.display === 'none') {
//           pageHeight.style.setProperty('height', '3200px');
//         } else {
//           pageHeight.style.setProperty('height', 'auto');
//         }
//       }
      
//       collapseDiv.style.display = collapseDiv.style.display === 'none' ? 'block' : 'none';
//     }
//   };

//   // Add accordion functionality
//   useEffect(() => {
//     const accordionButtons = document.querySelectorAll('.accordion-button');
    
//     const handleAccordionClick = (event) => {
//       const button = event.currentTarget;
//       const panel = button.nextElementSibling;
//       if (panel) {
//         panel.classList.toggle('open');
//         button.classList.toggle('open');
//       }
//     };
    
//     accordionButtons.forEach(button => {
//       button.addEventListener('click', handleAccordionClick);
//     });

//     // Cleanup function to remove event listeners
//     return () => {
//       accordionButtons.forEach(button => {
//         button.removeEventListener('click', handleAccordionClick);
//       });
//     };
//   }, [sections]); // Re-run when sections update

//   // Render charts and fields section
//   const renderSectionContent = (section) => {
//     return (
//       <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
//         {/* First Column - Fields */}
//         <div style={{backgroundColor:'#FFF', border:'0px solid #eee', marginBottom:'10px'}}>
//           <div style={{width:'80%', border:'0px solid #ddd', borderRadius:'5px', fontSize:'16px', paddingTop:'0px', paddingBottom:'10px'}}>
//             <div style={{width:'80%', marginLeft:'10%'}}>
//               {section.fields.map((field, index) => (
//                 <p 
//                   key={index} 
//                   style={{
//                     color:'#504F4F', 
//                     paddingTop:'5px', 
//                     paddingBottom:'4px', 
//                     borderBottom: index < section.fields.length - 1 ? '0px solid #eee' : 'none'
//                   }}
//                 >
//                   {field}
//                 </p>
//               ))}
//             </div>
//           </div>
//         </div>
        
//         {/* Second Column - Percentage Chart */}
//         <div style={{backgroundColor:'#FFF', border:'0px solid #ddd', marginBottom:'10px', borderRadius:'5px'}}>
//           <div style={{width:'100%', backgroundColor:'#fff', color:'#444', fontSize:'14px', paddingLeft:'10px', lineHeight:'30px', borderBottom:'0px solid #ddd'}}>
//             <p style={{width:'100%', textAlign:'center'}}>Total Percentage</p>
//           </div> 
//           <div>
//             <BalticGDPChart sectionId={section.id} />
//           </div>
          
//           <div style={{width:'100%', display:'flex', alignItems:'center', color:'#444', borderTop:'0px solid #ddd', fontSize:'14px', lineHeight:'30px', justifyContent:'center'}}>
//             <p style={{marginLeft:'0px'}}>
//               <span style={{width:'10px', height:'10px', backgroundColor:'red', borderRadius:'5px', display:'inline-block', float:'left', marginLeft:'8px', marginRight:'8px', marginTop:'10px'}}></span>
//               Correct Answer
//             </p>
//             <p style={{marginLeft:'0px'}}>
//               <span style={{width:'10px', height:'10px', backgroundColor:'red', borderRadius:'5px', display:'inline-block', float:'left', marginLeft:'8px', marginRight:'8px', marginTop:'10px'}}></span>
//               Wrong Answer
//             </p>
//             <p style={{marginLeft:'0px'}}>
//               <span style={{width:'10px', height:'10px', backgroundColor:'red', borderRadius:'5px', display:'inline-block', float:'left', marginLeft:'8px', marginRight:'8px', marginTop:'10px'}}></span>
//               Not Attempt
//             </p>
//           </div>
//         </div>
        
//         {/* Third Column - Score Chart */}
//         <div style={{backgroundColor:'#FFF', border:'0px solid #ddd', marginBottom:'10px', borderRadius:'5px'}}>
//           <div style={{width:'100%', backgroundColor:'#fff', color:'#444', fontSize:'14px', paddingLeft:'10px', lineHeight:'30px', borderBottom:'0px solid #ddd'}}>
//             <p style={{width:'100%', textAlign:'center'}}>Total Score</p>
//           </div>
//           <div>
//             <WeeklyEarningsChart sectionId={section.id} />
//           </div>
//         </div>
//       </div>
//     );
//   };

//   // Render generate content section with Q&A
//   const renderGenerateContent = (genContentId, sectionId) => {
//     // Filter questions relevant to this section
//     const sectionQuestions = questionData.filter(q => q.sectionId === sectionId);
    
//     return (
//       <div id={genContentId} style={{marginTop:'40px', display:'none'}}>
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-6" style={{borderBottom:'1px solid #ddd'}}>
//           <div>
//             <p>
//               <span style={{color:'#6b76f3', fontWeight:'bold', marginLeft:'0px'}}>Generate AI</span>
//               <span style={{color:'#4285F4', fontWeight:'100', marginLeft:'4px'}}>Questions & Answers</span>
//             </p>
//           </div>
          
//           <div>
//             <div style={{float:'left'}}>
//               <span style={{color:'#4285F4', fontWeight:'bold', marginLeft:'0px'}}>Candidate</span>
//               <span style={{color:'#4285F4', fontWeight:'100', marginLeft:'4px'}}>Answer</span>
//             </div>
            
//             <div style={{float:'right', marginBottom:'6px'}}>
//               <div style={{border:'0px solid #ccc', float:'left', borderRadius:'15px', paddingLeft:'6px', paddingRight:'6px'}}>
//                 <img style={{width:'20px', float:'left', marginRight:'2px', marginTop:'2px'}} src="../../record.svg" />
//                 <span style={{marginTop:'2px', display:'inline-block'}}> 00:00:00</span>
//               </div>
//               <img 
//                 style={{width:'24px', float:'right', margin:'2px 2px auto 10px'}} 
//                 src="../../stop.svg" 
//                 onClick={() => handleStopRecord(sectionId)}
//               />
//             </div>
//           </div>
//         </div>
        
//         {/* Question Accordions */}
//         {sectionQuestions.length > 0 ? (
//           sectionQuestions.map((q, qIndex) => (
//             <div key={qIndex} className="grid grid-cols-1 sm:grid-cols-2 gap-6" style={{borderBottom: qIndex === 0 ? '1px solid #ddd' : undefined}}>
//               <div 
//                 className="accordion" 
//                 onClick={() => toggleRightContent(`right-${genContentId}-${qIndex}`)} 
//                 style={{borderRight:'1px solid #ddd', marginTop:'0px', marginBottom:'0px'}}
//               >
//                 <button className="accordion-button">
//                   <span className="arrow">▶</span> {q.question}
//                 </button>
//                 <div className="panel">
//                   <ul style={{listStyle:'none', marginLeft:'32px', marginTop:'0px', padding:'0px'}}>
//                     <li style={{color:'green'}}>Answer:</li>
//                     <li>{q.answer}</li>
//                   </ul>
//                 </div>
//               </div>
              
//               <div className="accordion right-content" id={`right-${genContentId}-${qIndex}`} style={{ display: 'none' }}>
//                 <button className="accordion-button">
//                   <span className="arrow">▶</span> {q.question}
//                 </button>
//                 <div className="panel">
//                   <ul style={{listStyle:'none', marginLeft:'32px', marginTop:'0px', padding:'0px'}}>
//                     <li style={{color:'green'}}>Answer:</li>
//                     <li>{q.answer}</li>
//                   </ul>
//                 </div>
//               </div>
//             </div>
//           ))
//         ) : (
//           <div className="text-center py-4">
//             Click the generate button to create questions and answers for this section.
//           </div>
//         )}
//       </div>
//     );
//   };

//   // Handle stop recording
//   const handleStopRecord = async (sectionId) => {
//     try {
//       // Call API to stop recording and save
//       await axios.post(`${API_BASE_URL}/stop-recording`, {
//         sectionId: sectionId
//       });
      
//       // Reload questions after recording stops
//       const response = await axios.get(`${API_BASE_URL}/questions`);
//       setQuestionData(response.data);
      
//     } catch (err) {
//       console.error("Error stopping recording:", err);
//     }
//   };

//   if (loading) {
//     return <div className="container mx-auto pl-6 pt-2 text-center py-8">Loading content...</div>;
//   }

//   if (error) {
//     return <div className="container mx-auto pl-6 pt-2 text-center py-8 text-red-500">{error}</div>;
//   }

//   return (
//     <div className="container mx-auto pl-6 pt-2" id="pageHeight">
//       {sections.map((section, index) => (
//         <div 
//           key={index} 
//           className="accordion" 
//           style={{
//             borderBottom: index < sections.length - 1 ? '1px solid #666' : '0px'
//           }}
//         >
//           <div style={{display:'flex', alignItems:'center'}}>
//             <p 
//               style={{width:'20px'}} 
//               className="accordion-button" 
//               id={`${section.id}Btn`} 
//               onClick={() => customAcordian(section.id)}
//             >
//               <span className="arrow">▶</span>
//             </p> 
//             <p style={{marginLeft:'10px'}}>{section.title}</p>
            
//             <div id={`${section.id}Btns`} className={section.isOpen ? 'displayblock' : 'displaynone'}>
//               <img 
//                 style={{
//                   display:'inline-flex',
//                   marginBottom:'4px',
//                   marginLeft:'15px',
//                   marginRight:'8px',
//                   width:'16px',
//                   cursor:'pointer',
//                   float:'left',
//                   marginTop:'4px'
//                 }} 
//                 src="../../swap.svg" 
//                 onClick={() => handleSwapSection(section.id)}
//               />
//               <img 
//                 style={{
//                   display:'inline-flex',
//                   marginBottom:'4px',
//                   width:'20px',
//                   cursor:'pointer',
//                   marginTop:'2px',
//                   marginRight:'4px'
//                 }} 
//                 src="../../generate.svg" 
//                 onClick={() => genContent(section.genContentId, section.id)}
//               />
//               <img 
//                 style={{
//                   display:'inline-flex',
//                   marginBottom:'4px',
//                   width:'16px',
//                   cursor:'pointer',
//                   marginTop:'2px',
//                   marginRight:'4px'
//                 }} 
//                 src="../../doubleRightArrow.svg" 
//                 onClick={righCollapseDiv}
//               />
//             </div>
//           </div>
          
//           <div 
//             className="panel" 
//             id={`${section.id}Panel`} 
//             style={{display: section.isOpen ? 'block' : 'none'}}
//           >
//             {renderSectionContent(section)}
//             <hr/>
//             {renderGenerateContent(section.genContentId, section.id)}
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// };

// export default RightsideBar;