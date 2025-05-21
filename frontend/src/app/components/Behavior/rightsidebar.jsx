"use client";
import React, { useState, useEffect } from 'react';

export default function RightSidebar({ analysisData }) {
    const [expandedSections, setExpandedSections] = useState({});

    const toggleSection = (sectionId) => {
        setExpandedSections(prev => ({
            ...prev,
            [sectionId]: !prev[sectionId]
        }));
    };

    useEffect(() => {
        console.log('Received analysis data:', analysisData);
    }, [analysisData]);

    if (!analysisData || !analysisData.dashboards) {
        return <div>Waiting for analysis data...</div>;
    }

    return (
        <div className="container mx-auto pl-6 pt-0" id="pageHeight">
            {analysisData.dashboards.map((dashboard, index) => (
                <div key={index} className="accordion" style={{borderBottom:'1px solid #666'}}>
                    <div style={{display:'flex',alignItems:'center'}}>
                        <p 
                            style={{width:'20px', cursor:'pointer'}} 
                            className="accordion-button"
                            onClick={() => toggleSection(dashboard.language)}
                        >
                            <span className="arrow" style={{
                                transform: expandedSections[dashboard.language] ? 'rotate(90deg)' : 'rotate(0)',
                                transition: 'transform 0.3s ease'
                            }}>▶</span>
                        </p>
                        <p style={{marginLeft:'10px'}}>{dashboard.language}</p>
                        <div id={`${dashboard.language}Btns`} className={expandedSections[dashboard.language] ? '' : 'displaynone'}>
                            <img style={{ display:'inline-flex',marginBottom:'4px',marginLeft:'15px',marginRight:'8px',width:'16px',cursor:'pointer',float:'left',marginTop:'4px'}} src="../../swap.svg" alt="swap" />
                            <img style={{ display:'inline-flex',marginBottom:'4px',width:'20px',cursor:'pointer',marginTop:'2px',marginRight:'4px'}} src="../../generate.svg" alt="generate" />
                            <img style={{ display:'inline-flex',marginBottom:'4px',width:'16px',cursor:'pointer',marginTop:'2px',marginRight:'4px'}} src="../../doubleRightArrow.svg" alt="expand" />
                        </div>
                    </div>

                    <div className={`panel ${expandedSections[dashboard.language] ? 'show' : ''}`} style={{
                        display: expandedSections[dashboard.language] ? 'block' : 'none'
                    }}>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            {/* Metrics Column */}
                            <div style={{backgroundColor:'#FFF',border:'0px solid #eee',marginBottom:'10px'}}>
                                <div style={{width:'80%',border:'0px solid #ddd',borderRadius:'5px',fontSize:'16px',paddingTop:'0px',paddingBottom:'10px'}}>
                                    <div style={{width:'80%',marginLeft:'10%'}}>
                                        <h3 style={{fontWeight: 'bold', marginBottom: '10px'}}>Metrics</h3>
                                        <p style={{color:'#504F4F',paddingTop:'5px',paddingBottom:'4px'}}>
                                            Experience: {dashboard.metrics.experience}
                                        </p>
                                        <p style={{color:'#504F4F',paddingTop:'5px',paddingBottom:'4px'}}>
                                            Skill: {dashboard.metrics.skill}
                                        </p>
                                        <p style={{color:'#504F4F',paddingTop:'5px',paddingBottom:'4px'}}>
                                            Confidence: {dashboard.metrics.confidence}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Dashboard Scores */}
                            <div style={{backgroundColor:'#FFF',border:'0px solid #ddd',marginBottom:'10px',borderRadius:'5px'}}>
                                <div style={{width:'80%',marginLeft:'10%'}}>
                                    <h3 style={{fontWeight: 'bold', marginBottom: '10px'}}>Dashboard Scores</h3>
                                    <p style={{color:'#504F4F',paddingTop:'5px',paddingBottom:'4px'}}>
                                        Proficiency: {dashboard.dashboard.proficiency}
                                    </p>
                                    <p style={{color:'#504F4F',paddingTop:'5px',paddingBottom:'4px'}}>
                                        Code Quality: {dashboard.dashboard.code_quality}
                                    </p>
                                    <p style={{color:'#504F4F',paddingTop:'5px',paddingBottom:'4px'}}>
                                        Problem Solving: {dashboard.dashboard.problem_solving}
                                    </p>
                                    <p style={{color:'#504F4F',paddingTop:'5px',paddingBottom:'4px'}}>
                                        Best Practices: {dashboard.dashboard.best_practices}
                                    </p>
                                </div>
                            </div>

                            {/* Questions */}
                            <div style={{backgroundColor:'#FFF',border:'0px solid #ddd',marginBottom:'10px',borderRadius:'5px'}}>
                                <div style={{width:'80%',marginLeft:'10%'}}>
                                    <h3 style={{fontWeight: 'bold', marginBottom: '10px'}}>Questions</h3>
                                    {dashboard.questions.map((question, idx) => (
                                        <p key={idx} style={{color:'#504F4F',paddingTop:'5px',paddingBottom:'4px'}}>
                                            {question}
                                        </p>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
