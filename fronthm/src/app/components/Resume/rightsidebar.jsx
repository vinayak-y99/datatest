"use client";
import React from 'react';
import { useEffect } from 'react';
import Link from 'next/link';

import { useState } from 'react';

import { blue } from '@mui/material/colors';

// import RightSideBar from "../../components/rightSidebar";
import BalticGDPChart from "../charts/BalticGDPChart";
import WeeklyEarningsChart from "../charts/WeeklyEarningsChart";
function RightsideBar() {

  const toggleRightContent = (rightContentId) => {
    const rightContent = document.getElementById(rightContentId);
    if (rightContent) {
      rightContent.style.display = rightContent.style.display === 'none' ? 'block' : 'block';
    }
  };

  const titleBtns = (titleBtnsId) => {
    const titleBtns = document.getElementById(titleBtnsId);
    if (titleBtns) {
      titleBtns.style.display = titleBtns.style.display === 'none' ? 'block' : 'none';
    }
  };

  const genContent = (genContentId) => {
    const genContent = document.getElementById(genContentId);
    if (genContent) {
      genContent.style.display = genContent.style.display === 'none' ? 'block' : 'none';
    }
  };


  
  const righCollapseDiv = () => {
    const righCollapseDiv = document.getElementById("righCollapseDiv");
    
    if (righCollapseDiv) {

      const Mydiv = document.getElementById('righCollapseDiv');
      const accordionButtonsMydiv = Mydiv.querySelectorAll('.accordion-button'); // Assuming these buttons exist inside #mydiv
  
        accordionButtonsMydiv.forEach(button => {
        button.classList.toggle('open');
        button.nextElementSibling.classList.toggle('open');


      });

        
      righCollapseDiv.style.display === 'none' ? document.getElementById('pageHeight').style.setProperty('height', '3200px') : document.getElementById('pageHeight').style.setProperty('height', 'auto'); 
      
      

      righCollapseDiv.style.display = righCollapseDiv.style.display === 'none' ? 'block' : 'none';
      pieChartElementclick();
      
    }

    
  };


  const customAcordian = (customAcordianId) => {
    // alert(customAcordianId+'Panel');
    document.getElementById(customAcordianId+'Panel').classList.toggle('open');
    // document.getElementById(customAcordianId+'Btn').classList.toggle('open');
    document.getElementById(customAcordianId+'Btns').classList.toggle('displaynone');
  };



  
  
  useEffect(() => {
const accordionButtons = document.querySelectorAll('.accordion-button');
    accordionButtons.forEach(button => {
      button.addEventListener('click', () => {
        const panel = button.nextElementSibling;
        panel.classList.toggle('open');
        button.classList.toggle('open');
      });

    });

    // Cleanup function to remove event listeners
    return () => {
      accordionButtons.forEach(button => {
        button.removeEventListener('click', () => {});
      });
    };
  }, []);


  return (


    // className="borderBtm"
   
    <div className="container mx-auto pl-6 pt-2" id="pageHeight"  >  







          {/* Skills Starting */}
      <div className="accordion" style={{borderBottom:'1px solid #666'}}>
         
        <div style={{display:'flex',alignItems:'center'}}>
          <p style={{width:'20px'}} className="accordion-button" id="skillsBtn" onClick={() => customAcordian('skills')}>
            <span className="arrow">▶</span>
          </p> 
          <p style={{marginLeft:'10px'}}>Skills Matrix  </p>

          <div id="skillsBtns" className='displaynone'>
          <img style={{ display:'inline-flex',marginBottom:'4px',marginLeft:'15px',marginRight:'8px',width:'16px',cursor:'pointer',float:'left',marginTop:'4px'}} src="../../swap.svg" />
          <img style={{ display:'inline-flex',marginBottom:'4px',width:'20px',cursor:'pointer',marginTop:'2px',marginRight:'4px'}} src="../../generate.svg" onClick={() => genContent('generateContent1')}/>
          <img style={{ display:'inline-flex',marginBottom:'4px',width:'16px',cursor:'pointer',marginTop:'2px',marginRight:'4px'}} src="../../doubleRightArrow.svg" onClick={righCollapseDiv}/>   
        
         </div>
        </div> 
        
        <div className="panel" id="skillsPanel">
         <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
           <div style={{backgroundColor:'#FFF',border:'0px solid #eee',marginBottom:'10px'}} > {/* grid-First-Col-Starting */}

            <div style={{width:'80%',border:'0px solid #ddd',borderRadius:'5px',fontSize:'16px',paddingTop:'0px',paddingBottom:'10px'}}>
              <div style={{width:'80%',marginLeft:'10%'}}>
              <p style={{color:'#504F4F',paddingTop:'5px',paddingBottom:'4px',borderBottom:'0px solid #eee'}}>Skills Matrix</p>
              <p style={{color:'#504F4F',paddingTop:'5px',paddingBottom:'4px',borderBottom:'0px solid #eee'}}>Experience Distribution</p>
              <p style={{color:'#504F4F',paddingTop:'5px',paddingBottom:'4px',borderBottom:'0px solid #eee'}}>Location and Availability</p>
              <p style={{color:'#504F4F',paddingTop:'5px',paddingBottom:'4px',borderBottom:'0px solid #eee'}}>Project Experience and Domain Expertise</p>
              <p style={{color:'#504F4F',paddingTop:'5px',paddingBottom:'4px',borderBottom:'0px solid #eee'}}>Soft Skills and Collaboration</p>
              <p style={{color:'#504F4F',paddingTop:'5px',paddingBottom:'4px'}}>Tools and Technologies</p>
            </div>
            </div>
          
          {/* grid-First-Col-Ending */}
       </div>{/* Question Title Panel ends */}
            

            {/* grid-Second-Col-Starting */}
            <div style={{backgroundColor:'#FFF',border:'0px solid #ddd',marginBottom:'10px',borderRadius:'5px' }}>
            <div style={{width:'100%',backgroundColor:'#fff',color:'#444',fontSize:'14px',paddingLeft:'10px', lineHeight:'30px',borderBottom:'0px solid #ddd'}}>
                <p style={{width:'100%',textAlign:'center'}}>Total Percentage </p>
            </div> 
            <div>
            <BalticGDPChart  />
              {/* Chart chart area */}

            </div>

            <div style={{width:'100%',display:'flex', alignItems:'center',color:'#444',borderTop:'0px solid #ddd',fontSize:'14px',lineHeight:'30px',justifyContent:'center'}}>
                <p style={{marginLeft:'0px'}}>
                  <span style={{width:'10px',height:'10px',backgroundColor:'red',borderRadius:'5px',display:'inline-block',float:'left',marginLeft:'8px',marginRight:'8px',marginTop:'10px'}}></span>
                  Correct Answer
                </p>
                <p style={{marginLeft:'0px'}}>
                <span style={{width:'10px',height:'10px',backgroundColor:'red',borderRadius:'5px',display:'inline-block',float:'left',marginLeft:'8px',marginRight:'8px',marginTop:'10px'}}></span>
                  Wrong Answer</p>
                <p style={{marginLeft:'0px'}}>
                <span style={{width:'10px',height:'10px',backgroundColor:'red',borderRadius:'5px',display:'inline-block',float:'left',marginLeft:'8px',marginRight:'8px',marginTop:'10px'}}></span>
                  Not Attempt</p>
               </div>
            </div> {/* grid-Second-Col-Ending */}
            

              {/* grid-Third-Col-Starting */}
              <div style={{backgroundColor:'#FFF',border:'0px solid #ddd',marginBottom:'10px',borderRadius:'5px' }}>
            <div style={{width:'100%',backgroundColor:'#fff',color:'#444',fontSize:'14px',paddingLeft:'10px', lineHeight:'30px',borderBottom:'0px solid #ddd'}}>
                <p style={{width:'100%',textAlign:'center'}}>Total Score </p>
            </div> 
            <div>
            <WeeklyEarningsChart/>
            </div>

            </div>
             {/* grid-Third-Col-Ending*/}
        </div> {/* Grid ends */}

    <hr/>
        <div id="generateContent1" style={{marginTop:'40px',display:'none'}}>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6" style={{borderBottom:'1px solid #ddd'}}>
          <div> {/*col-1 */}
            <p><span style={{color:'#6b76f3',fontWeight:'bold',marginLeft:'0px'}}>Generate AI </span>  <span style={{color:'#4285F4',fontWeight:'100',marginLeft:'4px'}}>Questions & Answers</span>  </p>
          </div> {/*col-1 */}

          <div> {/*col-2 */}
            <div style={{float:'left'}}>
              <span style={{color:'#4285F4',fontWeight:'bold',marginLeft:'0px'}}>Candidate</span> 
              <span style={{color:'#4285F4',fontWeight:'100',marginLeft:'4px'}}>Answer</span>  
            </div>

            <div style={{float:'right',marginBottom:'6px'}}>
              <div style={{border:'0px solid #ccc',float:'left', borderRadius:'15px',paddingLeft:'6px',paddingRight:'6px'}}>
                <img style={{width:'20px',float:'left',marginRight:'2px',marginTop:'2px'}} src="../../record.svg" />
                <span style={{marginTop:'2px',display:'inline-block'}}> 00:00:00</span> 
              </div>  
              <img style={{width:'24px',float:'right',margin:'2px 2px auto 10px'}} src="../../stop.svg" />
              </div>
            </div> {/*col-2 */}
        </div>{/*grid */}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6" style={{borderBottom:'1px solid #ddd'}}>
          <div className="accordion" onClick={() => toggleRightContent('right1')} style={{borderRight:'1px solid #ddd',marginTop:'0px',marginBottom:'0px'}}>
              <button className="accordion-button">
                <span className="arrow">▶</span> Mandatory Skills ?  
              </button>
              <div className="panel">
                  <ul style={{listStyle:'none',marginLeft:'32px',marginTop:'0px',padding:'0px'}}>
                    <li style={{color:'green'}}>Answer:</li>
                    <li>Python</li>
                  </ul>
              </div> {/* Hr Title Panel ends */}
            </div> {/* Hr Title accordion ENDS */}
 
            <div className="accordion right-content" id="right1" style={{ display: 'none' }}>
                        <button className="accordion-button">
                          <span className="arrow">▶</span> Mandatory Skills ?  
                        </button>
                        <div className="panel">
                            <ul style={{listStyle:'none',marginLeft:'32px',marginTop:'0px',padding:'0px'}}>
                              <li style={{color:'green'}}>Answer:</li>
                              <li>Python</li>
                            </ul>
                        </div> {/* Hr Title Panel ends */}
                      </div> {/* Hr Title accordion ENDS */}
            </div> {/*grid */}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6" >
          <div className="accordion" onClick={() => toggleRightContent('right2')} style={{borderRight:'1px solid #ddd',marginTop:'0px',marginBottom:'0px'}}>
              <button className="accordion-button">
                <span className="arrow">▶</span> Education ?  
              </button>
              <div className="panel">
                  <ul style={{listStyle:'none',marginLeft:'32px',marginTop:'0px',padding:'0px'}}>
                    <li style={{color:'green'}}>Answer:</li>
                    <li>B.Tech</li>
                  </ul>
              </div> {/* Hr Title Panel ends */}
            </div> {/* Hr Title accordion ENDS */}
 
            <div className="accordion right-content" id="right2" style={{ display: 'none' }}>
                        <button className="accordion-button">
                          <span className="arrow">▶</span> Education ?  
                        </button>
                        <div className="panel">
                            <ul style={{listStyle:'none',marginLeft:'32px',marginTop:'0px',padding:'0px'}}>
                              <li style={{color:'green'}}>Answer:</li>
                              <li>B.Tech</li>
                              
                            </ul>
                        </div> {/* Hr Title Panel ends */}
                      </div> {/* Hr Title accordion ENDS */}

        </div> {/*grid */}
        </div> {/*generateContent ends */} 

        </div> {/* Question Title Panel ends */}
      </div> {/* Question Title accordion ENDS */}  
       {/* Skills Ending */}


      {/* Domain Expertise Presentation Starting   */}
      <div className="accordion" style={{borderBottom:'1px solid #666'}}>
         
         <div style={{display:'flex',alignItems:'center'}}>
           <p style={{width:'20px'}} className="accordion-button" id="DomainBtn" onClick={() => customAcordian('Domain')}>
             <span className="arrow">▶</span>
           </p> 
           <p style={{marginLeft:'10px'}}>Experience Distribution</p>
 
           <div id="DomainBtns" className='displaynone'>
           <img style={{ display:'inline-flex',marginBottom:'4px',marginLeft:'15px',marginRight:'8px',width:'16px',cursor:'pointer',float:'left',marginTop:'4px'}} src="../../swap.svg" />
           <img style={{ display:'inline-flex',marginBottom:'4px',width:'20px',cursor:'pointer',marginTop:'2px',marginRight:'4px'}} src="../../generate.svg" onClick={() => genContent('generateContent2')}/>
           <img style={{ display:'inline-flex',marginBottom:'4px',width:'16px',cursor:'pointer',marginTop:'2px',marginRight:'4px'}} src="../../doubleRightArrow.svg" onClick={righCollapseDiv}/>   
       
           </div>
         </div> 
         
         <div className="panel" id="DomainPanel">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div style={{backgroundColor:'#FFF',border:'0px solid #eee',marginBottom:'10px'}} > {/* grid-First-Col-Starting */}
 
             <div style={{width:'80%',border:'0px solid #ddd',borderRadius:'5px',fontSize:'16px',paddingTop:'0px',paddingBottom:'10px'}}>
               <div style={{width:'80%',marginLeft:'10%'}}>
               <p style={{color:'#504F4F',paddingTop:'5px',paddingBottom:'4px',borderBottom:'0px solid #eee'}}>Leadership</p>
               <p style={{color:'#504F4F',paddingTop:'5px',paddingBottom:'4px',borderBottom:'0px solid #eee'}}>Communication</p>
               <p style={{color:'#504F4F',paddingTop:'5px',paddingBottom:'4px',borderBottom:'0px solid #eee'}}>Planning</p>
               <p style={{color:'#504F4F',paddingTop:'5px',paddingBottom:'4px',borderBottom:'0px solid #eee'}}>Analysis</p>
               <p style={{color:'#504F4F',paddingTop:'5px',paddingBottom:'4px',borderBottom:'0px solid #eee'}}>Innovation</p>
               <p style={{color:'#504F4F',paddingTop:'5px',paddingBottom:'4px'}}>Strategy</p>
             </div>
             </div>
           
           {/* grid-First-Col-Ending */}
        </div>{/* Question Title Panel ends */}
             
 
             {/* grid-Second-Col-Starting */}
             <div style={{backgroundColor:'#FFF',border:'0px solid #ddd',marginBottom:'10px',borderRadius:'5px' }}>
             <div style={{width:'100%',backgroundColor:'#fff',color:'#444',fontSize:'14px',paddingLeft:'10px', lineHeight:'30px',borderBottom:'0px solid #ddd'}}>
                 <p style={{width:'100%',textAlign:'center'}}>Total Percentage </p>
             </div> 
             <div>
             <BalticGDPChart  />
               {/* Chart chart area */}
 
             </div>
 
             <div style={{width:'100%',display:'flex', alignItems:'center',color:'#444',borderTop:'0px solid #ddd',fontSize:'14px',lineHeight:'30px',justifyContent:'center'}}>
                 <p style={{marginLeft:'0px'}}>
                   <span style={{width:'10px',height:'10px',backgroundColor:'red',borderRadius:'5px',display:'inline-block',float:'left',marginLeft:'8px',marginRight:'8px',marginTop:'10px'}}></span>
                   Correct Answer
                 </p>
                 <p style={{marginLeft:'0px'}}>
                 <span style={{width:'10px',height:'10px',backgroundColor:'red',borderRadius:'5px',display:'inline-block',float:'left',marginLeft:'8px',marginRight:'8px',marginTop:'10px'}}></span>
                   Wrong Answer</p>
                 <p style={{marginLeft:'0px'}}>
                 <span style={{width:'10px',height:'10px',backgroundColor:'red',borderRadius:'5px',display:'inline-block',float:'left',marginLeft:'8px',marginRight:'8px',marginTop:'10px'}}></span>
                   Not Attempt</p>
                </div>
             </div> {/* grid-Second-Col-Ending */}
             
 
               {/* grid-Third-Col-Starting */}
               <div style={{backgroundColor:'#FFF',border:'0px solid #ddd',marginBottom:'10px',borderRadius:'5px' }}>
             <div style={{width:'100%',backgroundColor:'#fff',color:'#444',fontSize:'14px',paddingLeft:'10px', lineHeight:'30px',borderBottom:'0px solid #ddd'}}>
                 <p style={{width:'100%',textAlign:'center'}}>Total Score </p>
             </div> 
             <div>
             <WeeklyEarningsChart/>
             </div>
 
             </div>
              {/* grid-Third-Col-Ending*/}
         </div> {/* Grid ends */}
 
     <hr/>
         <div id="generateContent2" style={{marginTop:'40px',display:'none'}}>
         <div class="grid grid-cols-1 sm:grid-cols-2 gap-6" style={{borderBottom:'1px solid #ddd'}}>
           <div> {/*col-1 */}
             <p><span style={{color:'#6b76f3',fontWeight:'bold',marginLeft:'0px'}}>Generate AI </span>  <span style={{color:'#4285F4',fontWeight:'100',marginLeft:'4px'}}>Questions & Answers</span>  </p>
           </div> {/*col-1 */}
 
           <div> {/*col-2 */}
             <div style={{float:'left'}}>
               <span style={{color:'#4285F4',fontWeight:'bold',marginLeft:'0px'}}>Candidate</span> 
               <span style={{color:'#4285F4',fontWeight:'100',marginLeft:'4px'}}>Answer</span>  
             </div>
 
             <div style={{float:'right',marginBottom:'6px'}}>
               <div style={{border:'0px solid #ccc',float:'left', borderRadius:'15px',paddingLeft:'6px',paddingRight:'6px'}}>
                 <img style={{width:'20px',float:'left',marginRight:'2px',marginTop:'2px'}} src="../../record.svg" />
                 <span style={{marginTop:'2px',display:'inline-block'}}> 00:00:00</span> 
               </div>  
               <img style={{width:'24px',float:'right',margin:'2px 2px auto 10px'}} src="../../stop.svg" />
               </div>
             </div> {/*col-2 */}
         </div>{/*grid */}
 
         <div className="grid grid-cols-1 sm:grid-cols-2 gap-6" style={{borderBottom:'1px solid #ddd'}}>
           <div className="accordion" onClick={() => toggleRightContent('right20')} style={{borderRight:'1px solid #ddd',marginTop:'0px',marginBottom:'0px'}}>
               <button className="accordion-button">
                 <span className="arrow">▶</span> Mandatory Skills ?  
               </button>
               <div className="panel">
                   <ul style={{listStyle:'none',marginLeft:'32px',marginTop:'0px',padding:'0px'}}>
                     <li style={{color:'green'}}>Answer:</li>
                     <li>Python</li>
                   </ul>
               </div> {/* Hr Title Panel ends */}
             </div> {/* Hr Title accordion ENDS */}
  
             <div className="accordion right-content" id="right20" style={{ display: 'none' }}>
                         <button className="accordion-button">
                           <span className="arrow">▶</span> Mandatory Skills ?  
                         </button>
                         <div className="panel">
                             <ul style={{listStyle:'none',marginLeft:'32px',marginTop:'0px',padding:'0px'}}>
                               <li style={{color:'green'}}>Answer:</li>
                               <li>Python</li>
                             </ul>
                         </div> {/* Hr Title Panel ends */}
                       </div> {/* Hr Title accordion ENDS */}
             </div> {/*grid */}
 
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6" >
           <div className="accordion" onClick={() => toggleRightContent('right21')} style={{borderRight:'1px solid #ddd',marginTop:'0px',marginBottom:'0px'}}>
               <button className="accordion-button">
                 <span className="arrow">▶</span> Education ?  
               </button>
               <div className="panel">
                   <ul style={{listStyle:'none',marginLeft:'32px',marginTop:'0px',padding:'0px'}}>
                     <li style={{color:'green'}}>Answer:</li>
                     <li>B.Tech</li>
                   </ul>
               </div> {/* Hr Title Panel ends */}
             </div> {/* Hr Title accordion ENDS */}
  
             <div className="accordion right-content" id="right21" style={{ display: 'none' }}>
                         <button className="accordion-button">
                           <span className="arrow">▶</span> Education ?  
                         </button>
                         <div className="panel">
                             <ul style={{listStyle:'none',marginLeft:'32px',marginTop:'0px',padding:'0px'}}>
                               <li style={{color:'green'}}>Answer:</li>
                               <li>B.Tech</li>
                               
                             </ul>
                         </div> {/* Hr Title Panel ends */}
                       </div> {/* Hr Title accordion ENDS */}
 
         </div> {/*grid */}
         </div> {/*generateContent ends */} 
 
         </div> {/* Question Title Panel ends */}
       </div> {/* Question Title accordion ENDS */} 
       {/* Domain Expertise Presentation Ending   */}



       {/* Critical Problems Solved highlight Starting */}
       <div className="accordion" style={{borderBottom:'1px solid #666'}}>
         
         <div style={{display:'flex',alignItems:'center'}}>
           <p style={{width:'20px'}} className="accordion-button" id="CriticalBtn" onClick={() => customAcordian('Critical')}>
             <span className="arrow">▶</span>
           </p> 
           <p style={{marginLeft:'10px'}}>Location and Availability</p>
 
           <div id="CriticalBtns" className='displaynone'>
           <img style={{ display:'inline-flex',marginBottom:'4px',marginLeft:'15px',marginRight:'8px',width:'16px',cursor:'pointer',float:'left',marginTop:'4px'}} src="../../swap.svg" />
          <img style={{ display:'inline-flex',marginBottom:'4px',width:'20px',cursor:'pointer',marginTop:'2px',marginRight:'4px'}} src="../../generate.svg" onClick={() => genContent('generateContent3')}/>
          <img style={{ display:'inline-flex',marginBottom:'4px',width:'16px',cursor:'pointer',marginTop:'2px',marginRight:'4px'}} src="../../doubleRightArrow.svg" onClick={righCollapseDiv}/>   
        
           </div>
         </div> 
         
         <div className="panel" id="CriticalPanel">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div style={{backgroundColor:'#FFF',border:'0px solid #eee',marginBottom:'10px'}} > {/* grid-First-Col-Starting */}
 
             <div style={{width:'80%',border:'0px solid #ddd',borderRadius:'5px',fontSize:'16px',paddingTop:'0px',paddingBottom:'10px'}}>
               <div style={{width:'80%',marginLeft:'10%'}}>
               <p style={{color:'#504F4F',paddingTop:'5px',paddingBottom:'4px',borderBottom:'0px solid #eee'}}>Lansing, Illinois</p>
               <p style={{color:'#504F4F',paddingTop:'5px',paddingBottom:'4px',borderBottom:'0px solid #eee'}}>Portland, Illinois</p>
               <p style={{color:'#504F4F',paddingTop:'5px',paddingBottom:'4px',borderBottom:'0px solid #eee'}}>Stockton, New Hampshire</p>
               <p style={{color:'#504F4F',paddingTop:'5px',paddingBottom:'4px',borderBottom:'0px solid #eee'}}>Lafayette,California</p>
               <p style={{color:'#504F4F',paddingTop:'5px',paddingBottom:'4px',borderBottom:'0px solid #eee'}}>Pasadena, Oklahoma</p>
               <p style={{color:'#504F4F',paddingTop:'5px',paddingBottom:'4px'}}>Corona, Michigan</p>
             </div>
             </div>
           
           {/* grid-First-Col-Ending */}
        </div>{/* Question Title Panel ends */}
             
 
             {/* grid-Second-Col-Starting */}
             <div style={{backgroundColor:'#FFF',border:'0px solid #ddd',marginBottom:'10px',borderRadius:'5px' }}>
             <div style={{width:'100%',backgroundColor:'#fff',color:'#444',fontSize:'14px',paddingLeft:'10px', lineHeight:'30px',borderBottom:'0px solid #ddd'}}>
                 <p style={{width:'100%',textAlign:'center'}}>Total Percentage </p>
             </div> 
             <div>
             <BalticGDPChart  />
               {/* Chart chart area */}
 
             </div>
 
             <div style={{width:'100%',display:'flex', alignItems:'center',color:'#444',borderTop:'0px solid #ddd',fontSize:'14px',lineHeight:'30px',justifyContent:'center'}}>
                 <p style={{marginLeft:'0px'}}>
                   <span style={{width:'10px',height:'10px',backgroundColor:'red',borderRadius:'5px',display:'inline-block',float:'left',marginLeft:'8px',marginRight:'8px',marginTop:'10px'}}></span>
                   Correct Answer
                 </p>
                 <p style={{marginLeft:'0px'}}>
                 <span style={{width:'10px',height:'10px',backgroundColor:'red',borderRadius:'5px',display:'inline-block',float:'left',marginLeft:'8px',marginRight:'8px',marginTop:'10px'}}></span>
                   Wrong Answer</p>
                 <p style={{marginLeft:'0px'}}>
                 <span style={{width:'10px',height:'10px',backgroundColor:'red',borderRadius:'5px',display:'inline-block',float:'left',marginLeft:'8px',marginRight:'8px',marginTop:'10px'}}></span>
                   Not Attempt</p>
                </div>
             </div> {/* grid-Second-Col-Ending */}
             
 
               {/* grid-Third-Col-Starting */}
               <div style={{backgroundColor:'#FFF',border:'0px solid #ddd',marginBottom:'10px',borderRadius:'5px' }}>
             <div style={{width:'100%',backgroundColor:'#fff',color:'#444',fontSize:'14px',paddingLeft:'10px', lineHeight:'30px',borderBottom:'0px solid #ddd'}}>
                 <p style={{width:'100%',textAlign:'center'}}>Total Score </p>
             </div> 
             <div>
             <WeeklyEarningsChart/>
             </div>
 
             </div>
              {/* grid-Third-Col-Ending*/}
         </div> {/* Grid ends */}
 
     <hr/>
         <div id="generateContent3" style={{marginTop:'40px',display:'none'}}>
         <div class="grid grid-cols-1 sm:grid-cols-2 gap-6" style={{borderBottom:'1px solid #ddd'}}>
           <div> {/*col-1 */}
             <p><span style={{color:'#6b76f3',fontWeight:'bold',marginLeft:'0px'}}>Generate AI </span>  <span style={{color:'#4285F4',fontWeight:'100',marginLeft:'4px'}}>Questions & Answers</span>  </p>
           </div> {/*col-1 */}
 
           <div> {/*col-2 */}
             <div style={{float:'left'}}>
               <span style={{color:'#4285F4',fontWeight:'bold',marginLeft:'0px'}}>Candidate</span> 
               <span style={{color:'#4285F4',fontWeight:'100',marginLeft:'4px'}}>Answer</span>  
             </div>
 
             <div style={{float:'right',marginBottom:'6px'}}>
               <div style={{border:'0px solid #ccc',float:'left', borderRadius:'15px',paddingLeft:'6px',paddingRight:'6px'}}>
                 <img style={{width:'20px',float:'left',marginRight:'2px',marginTop:'2px'}} src="../../record.svg" />
                 <span style={{marginTop:'2px',display:'inline-block'}}> 00:00:00</span> 
               </div>  
               <img style={{width:'24px',float:'right',margin:'2px 2px auto 10px'}} src="../../stop.svg" />
               </div>
             </div> {/*col-2 */}
         </div>{/*grid */}
 
         <div className="grid grid-cols-1 sm:grid-cols-2 gap-6" style={{borderBottom:'1px solid #ddd'}}>
           <div className="accordion" onClick={() => toggleRightContent('right30')} style={{borderRight:'1px solid #ddd',marginTop:'0px',marginBottom:'0px'}}>
               <button className="accordion-button">
                 <span className="arrow">▶</span> Mandatory Skills ?  
               </button>
               <div className="panel">
                   <ul style={{listStyle:'none',marginLeft:'32px',marginTop:'0px',padding:'0px'}}>
                     <li style={{color:'green'}}>Answer:</li>
                     <li>Python</li>
                   </ul>
               </div> {/* Hr Title Panel ends */}
             </div> {/* Hr Title accordion ENDS */}
  
             <div className="accordion right-content" id="right30" style={{ display: 'none' }}>
                         <button className="accordion-button">
                           <span className="arrow">▶</span> Mandatory Skills ?  
                         </button>
                         <div className="panel">
                             <ul style={{listStyle:'none',marginLeft:'32px',marginTop:'0px',padding:'0px'}}>
                               <li style={{color:'green'}}>Answer:</li>
                               <li>Python</li>
                             </ul>
                         </div> {/* Hr Title Panel ends */}
                       </div> {/* Hr Title accordion ENDS */}
             </div> {/*grid */}
 
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6" >
           <div className="accordion" onClick={() => toggleRightContent('right31')} style={{borderRight:'1px solid #ddd',marginTop:'0px',marginBottom:'0px'}}>
               <button className="accordion-button">
                 <span className="arrow">▶</span> Education ?  
               </button>
               <div className="panel">
                   <ul style={{listStyle:'none',marginLeft:'32px',marginTop:'0px',padding:'0px'}}>
                     <li style={{color:'green'}}>Answer:</li>
                     <li>B.Tech</li>
                   </ul>
               </div> {/* Hr Title Panel ends */}
             </div> {/* Hr Title accordion ENDS */}
  
             <div className="accordion right-content" id="right31" style={{ display: 'none' }}>
                         <button className="accordion-button">
                           <span className="arrow">▶</span> Education ?  
                         </button>
                         <div className="panel">
                             <ul style={{listStyle:'none',marginLeft:'32px',marginTop:'0px',padding:'0px'}}>
                               <li style={{color:'green'}}>Answer:</li>
                               <li>B.Tech</li>
                               
                             </ul>
                         </div> {/* Hr Title Panel ends */}
                       </div> {/* Hr Title accordion ENDS */}
 
         </div> {/*grid */}
         </div> {/*generateContent ends */} 
 
         </div> {/* Question Title Panel ends */}
       </div> {/* Question Title accordion ENDS */} 
       {/* Critical Problems Solved highlight Ending */}



       {/* Company Changes Analysis Starting */}
       <div className="accordion" style={{borderBottom:'1px solid #666'}}>
         
         <div style={{display:'flex',alignItems:'center'}}>
           <p style={{width:'20px'}} className="accordion-button" id="CompanyBtn" onClick={() => customAcordian('Company')}>
             <span className="arrow">▶</span>
           </p> 
           <p style={{marginLeft:'10px'}}>Project Experience and Domain Expertise</p>
 
          <div id="CompanyBtns" className='displaynone'>
           <img style={{ display:'inline-flex',marginBottom:'4px',marginLeft:'15px',marginRight:'8px',width:'16px',cursor:'pointer',float:'left',marginTop:'4px'}} src="../../swap.svg" />
           <img style={{ display:'inline-flex',marginBottom:'4px',width:'20px',cursor:'pointer',marginTop:'2px',marginRight:'4px'}} src="../../generate.svg" onClick={() => genContent('generateContent4')}/>
           <img style={{ display:'inline-flex',marginBottom:'4px',width:'16px',cursor:'pointer',marginTop:'2px',marginRight:'4px'}} src="../../doubleRightArrow.svg" onClick={righCollapseDiv}/>   
          </div>
        </div> 
         
         <div className="panel" id="CompanyPanel">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div style={{backgroundColor:'#FFF',border:'0px solid #eee',marginBottom:'10px'}} > {/* grid-First-Col-Starting */}
 
             <div style={{width:'80%',border:'0px solid #ddd',borderRadius:'5px',fontSize:'16px',paddingTop:'0px',paddingBottom:'10px'}}>
               <div style={{width:'80%',marginLeft:'10%'}}>
               <p style={{color:'#504F4F',paddingTop:'5px',paddingBottom:'4px',borderBottom:'0px solid #eee'}}>Projects</p>
               <p style={{color:'#504F4F',paddingTop:'5px',paddingBottom:'4px',borderBottom:'0px solid #eee'}}>Role</p>
               <p style={{color:'#504F4F',paddingTop:'5px',paddingBottom:'4px',borderBottom:'0px solid #eee'}}>Timeframe</p>
               <p style={{color:'#504F4F',paddingTop:'5px',paddingBottom:'4px',borderBottom:'0px solid #eee'}}>Achievements</p>
               <p style={{color:'#504F4F',paddingTop:'5px',paddingBottom:'4px',borderBottom:'0px solid #eee'}}>Skills</p>
               <p style={{color:'#504F4F',paddingTop:'5px',paddingBottom:'4px'}}>Objective</p>
             </div>
             </div>
           
           {/* grid-First-Col-Ending */}
        </div>{/* Question Title Panel ends */}
             
 
             {/* grid-Second-Col-Starting */}
             <div style={{backgroundColor:'#FFF',border:'0px solid #ddd',marginBottom:'10px',borderRadius:'5px' }}>
             <div style={{width:'100%',backgroundColor:'#fff',color:'#444',fontSize:'14px',paddingLeft:'10px', lineHeight:'30px',borderBottom:'0px solid #ddd'}}>
                 <p style={{width:'100%',textAlign:'center'}}>Total Percentage </p>
             </div> 
             <div>
             <BalticGDPChart  />
               {/* Chart chart area */}
 
             </div>
 
             <div style={{width:'100%',display:'flex', alignItems:'center',color:'#444',borderTop:'0px solid #ddd',fontSize:'14px',lineHeight:'30px',justifyContent:'center'}}>
                 <p style={{marginLeft:'0px'}}>
                   <span style={{width:'10px',height:'10px',backgroundColor:'red',borderRadius:'5px',display:'inline-block',float:'left',marginLeft:'8px',marginRight:'8px',marginTop:'10px'}}></span>
                   Correct Answer
                 </p>
                 <p style={{marginLeft:'0px'}}>
                 <span style={{width:'10px',height:'10px',backgroundColor:'red',borderRadius:'5px',display:'inline-block',float:'left',marginLeft:'8px',marginRight:'8px',marginTop:'10px'}}></span>
                   Wrong Answer</p>
                 <p style={{marginLeft:'0px'}}>
                 <span style={{width:'10px',height:'10px',backgroundColor:'red',borderRadius:'5px',display:'inline-block',float:'left',marginLeft:'8px',marginRight:'8px',marginTop:'10px'}}></span>
                   Not Attempt</p>
                </div>
             </div> {/* grid-Second-Col-Ending */}
             
 
               {/* grid-Third-Col-Starting */}
               <div style={{backgroundColor:'#FFF',border:'0px solid #ddd',marginBottom:'10px',borderRadius:'5px' }}>
             <div style={{width:'100%',backgroundColor:'#fff',color:'#444',fontSize:'14px',paddingLeft:'10px', lineHeight:'30px',borderBottom:'0px solid #ddd'}}>
                 <p style={{width:'100%',textAlign:'center'}}>Total Score </p>
             </div> 
             <div>
             <WeeklyEarningsChart/>
             </div>
 
             </div>
              {/* grid-Third-Col-Ending*/}
         </div> {/* Grid ends */}
 
     <hr/>
         <div id="generateContent4" style={{marginTop:'40px',display:'none'}}>
         <div class="grid grid-cols-1 sm:grid-cols-2 gap-6" style={{borderBottom:'1px solid #ddd'}}>
           <div> {/*col-1 */}
             <p><span style={{color:'#6b76f3',fontWeight:'bold',marginLeft:'0px'}}>Generate AI </span>  <span style={{color:'#4285F4',fontWeight:'100',marginLeft:'4px'}}>Questions & Answers</span>  </p>
           </div> {/*col-1 */}
 
           <div> {/*col-2 */}
             <div style={{float:'left'}}>
               <span style={{color:'#4285F4',fontWeight:'bold',marginLeft:'0px'}}>Candidate</span> 
               <span style={{color:'#4285F4',fontWeight:'100',marginLeft:'4px'}}>Answer</span>  
             </div>
 
             <div style={{float:'right',marginBottom:'6px'}}>
               <div style={{border:'0px solid #ccc',float:'left', borderRadius:'15px',paddingLeft:'6px',paddingRight:'6px'}}>
                 <img style={{width:'20px',float:'left',marginRight:'2px',marginTop:'2px'}} src="../../record.svg" />
                 <span style={{marginTop:'2px',display:'inline-block'}}> 00:00:00</span> 
               </div>  
               <img style={{width:'24px',float:'right',margin:'2px 2px auto 10px'}} src="../../stop.svg" />
               </div>
             </div> {/*col-2 */}
         </div>{/*grid */}
 
         <div className="grid grid-cols-1 sm:grid-cols-2 gap-6" style={{borderBottom:'1px solid #ddd'}}>
           <div className="accordion" onClick={() => toggleRightContent('right40')} style={{borderRight:'1px solid #ddd',marginTop:'0px',marginBottom:'0px'}}>
               <button className="accordion-button">
                 <span className="arrow">▶</span> Mandatory Skills ?  
               </button>
               <div className="panel">
                   <ul style={{listStyle:'none',marginLeft:'32px',marginTop:'0px',padding:'0px'}}>
                     <li style={{color:'green'}}>Answer:</li>
                     <li>Python</li>
                   </ul>
               </div> {/* Hr Title Panel ends */}
             </div> {/* Hr Title accordion ENDS */}
  
             <div className="accordion right-content" id="right40" style={{ display: 'none' }}>
                         <button className="accordion-button">
                           <span className="arrow">▶</span> Mandatory Skills ?  
                         </button>
                         <div className="panel">
                             <ul style={{listStyle:'none',marginLeft:'32px',marginTop:'0px',padding:'0px'}}>
                               <li style={{color:'green'}}>Answer:</li>
                               <li>Python</li>
                             </ul>
                         </div> {/* Hr Title Panel ends */}
                       </div> {/* Hr Title accordion ENDS */}
             </div> {/*grid */}
 
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6" >
           <div className="accordion" onClick={() => toggleRightContent('right41')} style={{borderRight:'1px solid #ddd',marginTop:'0px',marginBottom:'0px'}}>
               <button className="accordion-button">
                 <span className="arrow">▶</span> Education ?  
               </button>
               <div className="panel">
                   <ul style={{listStyle:'none',marginLeft:'32px',marginTop:'0px',padding:'0px'}}>
                     <li style={{color:'green'}}>Answer:</li>
                     <li>B.Tech</li>
                   </ul>
               </div> {/* Hr Title Panel ends */}
             </div> {/* Hr Title accordion ENDS */}
  
             <div className="accordion right-content" id="right41" style={{ display: 'none' }}>
                         <button className="accordion-button">
                           <span className="arrow">▶</span> Education ?  
                         </button>
                         <div className="panel">
                             <ul style={{listStyle:'none',marginLeft:'32px',marginTop:'0px',padding:'0px'}}>
                               <li style={{color:'green'}}>Answer:</li>
                               <li>B.Tech</li>
                               
                             </ul>
                         </div> {/* Hr Title Panel ends */}
                       </div> {/* Hr Title accordion ENDS */}
 
         </div> {/*grid */}
         </div> {/*generateContent ends */} 
 
         </div> {/* Question Title Panel ends */}
       </div> {/* Question Title accordion ENDS */} 
        {/* Company Changes Analysis Ending */}



       {/* Managerial Skills Progess Visualization Starting */}
       <div className="accordion" style={{borderBottom:'1px solid #666'}}>
         
         <div style={{display:'flex',alignItems:'center'}}>
           <p style={{width:'20px'}} className="accordion-button" id="ManagerialBtn" onClick={() => customAcordian('Managerial')}>
             <span className="arrow">▶</span>
           </p> 
           <p style={{marginLeft:'10px'}}>Soft Skills Collaboration</p>
 
          <div id="ManagerialBtns" className='displaynone'>
           <img style={{ display:'inline-flex',marginBottom:'4px',marginLeft:'15px',marginRight:'8px',width:'16px',cursor:'pointer',float:'left',marginTop:'4px'}} src="../../swap.svg" />
           <img style={{ display:'inline-flex',marginBottom:'4px',width:'20px',cursor:'pointer',marginTop:'2px',marginRight:'4px'}} src="../../generate.svg" onClick={() => genContent('generateContent5')}/>
           <img style={{ display:'inline-flex',marginBottom:'4px',width:'16px',cursor:'pointer',marginTop:'2px',marginRight:'4px'}} src="../../doubleRightArrow.svg" onClick={righCollapseDiv}/>   
          </div>
        </div> 
         
         <div className="panel" id="ManagerialPanel">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div style={{backgroundColor:'#FFF',border:'0px solid #eee',marginBottom:'10px'}} > {/* grid-First-Col-Starting */}
 
             <div style={{width:'80%',border:'0px solid #ddd',borderRadius:'5px',fontSize:'16px',paddingTop:'0px',paddingBottom:'10px'}}>
               <div style={{width:'80%',marginLeft:'10%'}}>
               <p style={{color:'#504F4F',paddingTop:'5px',paddingBottom:'4px',borderBottom:'0px solid #eee'}}>Empathy</p>
               <p style={{color:'#504F4F',paddingTop:'5px',paddingBottom:'4px',borderBottom:'0px solid #eee'}}>Communication</p>
               <p style={{color:'#504F4F',paddingTop:'5px',paddingBottom:'4px',borderBottom:'0px solid #eee'}}>Teamwork</p>
               <p style={{color:'#504F4F',paddingTop:'5px',paddingBottom:'4px',borderBottom:'0px solid #eee'}}>Problem-Solving</p>
               <p style={{color:'#504F4F',paddingTop:'5px',paddingBottom:'4px',borderBottom:'0px solid #eee'}}>Leadership</p>
               <p style={{color:'#504F4F',paddingTop:'5px',paddingBottom:'4px'}}>Creativity</p>
             </div>
             </div>
           
           {/* grid-First-Col-Ending */}
        </div>{/* Question Title Panel ends */}
             
 
             {/* grid-Second-Col-Starting */}
             <div style={{backgroundColor:'#FFF',border:'0px solid #ddd',marginBottom:'10px',borderRadius:'5px' }}>
             <div style={{width:'100%',backgroundColor:'#fff',color:'#444',fontSize:'14px',paddingLeft:'10px', lineHeight:'30px',borderBottom:'0px solid #ddd'}}>
                 <p style={{width:'100%',textAlign:'center'}}>Total Percentage </p>
             </div> 
             <div>
             <BalticGDPChart  />
               {/* Chart chart area */}
 
             </div>
 
             <div style={{width:'100%',display:'flex', alignItems:'center',color:'#444',borderTop:'0px solid #ddd',fontSize:'14px',lineHeight:'30px',justifyContent:'center'}}>
                 <p style={{marginLeft:'0px'}}>
                   <span style={{width:'10px',height:'10px',backgroundColor:'red',borderRadius:'5px',display:'inline-block',float:'left',marginLeft:'8px',marginRight:'8px',marginTop:'10px'}}></span>
                   Correct Answer
                 </p>
                 <p style={{marginLeft:'0px'}}>
                 <span style={{width:'10px',height:'10px',backgroundColor:'red',borderRadius:'5px',display:'inline-block',float:'left',marginLeft:'8px',marginRight:'8px',marginTop:'10px'}}></span>
                   Wrong Answer</p>
                 <p style={{marginLeft:'0px'}}>
                 <span style={{width:'10px',height:'10px',backgroundColor:'red',borderRadius:'5px',display:'inline-block',float:'left',marginLeft:'8px',marginRight:'8px',marginTop:'10px'}}></span>
                   Not Attempt</p>
                </div>
             </div> {/* grid-Second-Col-Ending */}
             
 
               {/* grid-Third-Col-Starting */}
               <div style={{backgroundColor:'#FFF',border:'0px solid #ddd',marginBottom:'10px',borderRadius:'5px' }}>
             <div style={{width:'100%',backgroundColor:'#fff',color:'#444',fontSize:'14px',paddingLeft:'10px', lineHeight:'30px',borderBottom:'0px solid #ddd'}}>
                 <p style={{width:'100%',textAlign:'center'}}>Total Score </p>
             </div> 
             <div>
             <WeeklyEarningsChart/>
             </div>
 
             </div>
              {/* grid-Third-Col-Ending*/}
         </div> {/* Grid ends */}
 
     <hr/>
         <div id="generateContent5" style={{marginTop:'40px',display:'none'}}>
         <div class="grid grid-cols-1 sm:grid-cols-2 gap-6" style={{borderBottom:'1px solid #ddd'}}>
           <div> {/*col-1 */}
             <p><span style={{color:'#6b76f3',fontWeight:'bold',marginLeft:'0px'}}>Generate AI </span>  <span style={{color:'#4285F4',fontWeight:'100',marginLeft:'4px'}}>Questions & Answers</span>  </p>
           </div> {/*col-1 */}
 
           <div> {/*col-2 */}
             <div style={{float:'left'}}>
               <span style={{color:'#4285F4',fontWeight:'bold',marginLeft:'0px'}}>Candidate</span> 
               <span style={{color:'#4285F4',fontWeight:'100',marginLeft:'4px'}}>Answer</span>  
             </div>
 
             <div style={{float:'right',marginBottom:'6px'}}>
               <div style={{border:'0px solid #ccc',float:'left', borderRadius:'15px',paddingLeft:'6px',paddingRight:'6px'}}>
                 <img style={{width:'20px',float:'left',marginRight:'2px',marginTop:'2px'}} src="../../record.svg" />
                 <span style={{marginTop:'2px',display:'inline-block'}}> 00:00:00</span> 
               </div>  
               <img style={{width:'24px',float:'right',margin:'2px 2px auto 10px'}} src="../../stop.svg" />
               </div>
             </div> {/*col-2 */}
         </div>{/*grid */}
 
         <div className="grid grid-cols-1 sm:grid-cols-2 gap-6" style={{borderBottom:'1px solid #ddd'}}>
           <div className="accordion" onClick={() => toggleRightContent('right50')} style={{borderRight:'1px solid #ddd',marginTop:'0px',marginBottom:'0px'}}>
               <button className="accordion-button">
                 <span className="arrow">▶</span> Mandatory Skills ?  
               </button>
               <div className="panel">
                   <ul style={{listStyle:'none',marginLeft:'32px',marginTop:'0px',padding:'0px'}}>
                     <li style={{color:'green'}}>Answer:</li>
                     <li>Python</li>
                   </ul>
               </div> {/* Hr Title Panel ends */}
             </div> {/* Hr Title accordion ENDS */}
  
             <div className="accordion right-content" id="right50" style={{ display: 'none' }}>
                         <button className="accordion-button">
                           <span className="arrow">▶</span> Mandatory Skills ?  
                         </button>
                         <div className="panel">
                             <ul style={{listStyle:'none',marginLeft:'32px',marginTop:'0px',padding:'0px'}}>
                               <li style={{color:'green'}}>Answer:</li>
                               <li>Python</li>
                             </ul>
                         </div> {/* Hr Title Panel ends */}
                       </div> {/* Hr Title accordion ENDS */}
             </div> {/*grid */}
 
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6" >
           <div className="accordion" onClick={() => toggleRightContent('right51')} style={{borderRight:'1px solid #ddd',marginTop:'0px',marginBottom:'0px'}}>
               <button className="accordion-button">
                 <span className="arrow">▶</span> Education ?  
               </button>
               <div className="panel">
                   <ul style={{listStyle:'none',marginLeft:'32px',marginTop:'0px',padding:'0px'}}>
                     <li style={{color:'green'}}>Answer:</li>
                     <li>B.Tech</li>
                   </ul>
               </div> {/* Hr Title Panel ends */}
             </div> {/* Hr Title accordion ENDS */}
  
             <div className="accordion right-content" id="right51" style={{ display: 'none' }}>
                         <button className="accordion-button">
                           <span className="arrow">▶</span> Education ?  
                         </button>
                         <div className="panel">
                             <ul style={{listStyle:'none',marginLeft:'32px',marginTop:'0px',padding:'0px'}}>
                               <li style={{color:'green'}}>Answer:</li>
                               <li>B.Tech</li>
                               
                             </ul>
                         </div> {/* Hr Title Panel ends */}
                       </div> {/* Hr Title accordion ENDS */}
 
         </div> {/*grid */}
         </div> {/*generateContent ends */} 
 
         </div> {/* Question Title Panel ends */}
       </div> {/* Question Title accordion ENDS */} 
        {/* Managerial Skills Progess Visualization Ending */}
    


       {/* Project Imapact and Soft Slills Highlight Starting */}
       <div className="accordion" style={{borderBottom:'0px solid #666'}}>
         
         <div style={{display:'flex',alignItems:'center'}}>
           <p style={{width:'20px'}} className="accordion-button" id="ProjectBtn" onClick={() => customAcordian('Project')}>
             <span className="arrow">▶</span>
           </p> 
           <p style={{marginLeft:'10px'}}>Tools and Technologies </p>
 
          <div id="ProjectBtns" className='displaynone'>
           <img style={{ display:'inline-flex',marginBottom:'4px',marginLeft:'15px',marginRight:'8px',width:'16px',cursor:'pointer',float:'left',marginTop:'4px'}} src="../swap.svg" />
           <img style={{ display:'inline-flex',marginBottom:'4px',width:'20px',cursor:'pointer',marginTop:'2px',marginRight:'4px'}} src="../../generate.svg" onClick={() => genContent('generateContent6')}/>
           <img style={{ display:'inline-flex',marginBottom:'4px',width:'16px',cursor:'pointer',marginTop:'2px',marginRight:'4px'}} src="../doubleRightArrow.svg" onClick={righCollapseDiv}/>   
          </div>
        </div> 
         
         <div className="panel" id="ProjectPanel">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div style={{backgroundColor:'#FFF',border:'0px solid #eee',marginBottom:'10px'}} > {/* grid-First-Col-Starting */}
 
             <div style={{width:'80%',border:'0px solid #ddd',borderRadius:'5px',fontSize:'16px',paddingTop:'0px',paddingBottom:'10px'}}>
               <div style={{width:'80%',marginLeft:'10%'}}>
               <p style={{color:'#504F4F',paddingTop:'5px',paddingBottom:'4px',borderBottom:'0px solid #eee'}}>Webpack</p>
               <p style={{color:'#504F4F',paddingTop:'5px',paddingBottom:'4px',borderBottom:'0px solid #eee'}}>Vs Code</p>
               <p style={{color:'#504F4F',paddingTop:'5px',paddingBottom:'4px',borderBottom:'0px solid #eee'}}>GitHub</p>
               <p style={{color:'#504F4F',paddingTop:'5px',paddingBottom:'4px',borderBottom:'0px solid #eee'}}>Chrome DevTools</p>
               <p style={{color:'#504F4F',paddingTop:'5px',paddingBottom:'4px',borderBottom:'0px solid #eee'}}>Leadership</p>
               <p style={{color:'#504F4F',paddingTop:'5px',paddingBottom:'4px'}}>Cypress</p>
             </div>
             </div>
           
           {/* grid-First-Col-Ending */}
        </div>{/* Question Title Panel ends */}
             
 
             {/* grid-Second-Col-Starting */}
             <div style={{backgroundColor:'#FFF',border:'0px solid #ddd',marginBottom:'10px',borderRadius:'5px' }}>
             <div style={{width:'100%',backgroundColor:'#fff',color:'#444',fontSize:'14px',paddingLeft:'10px', lineHeight:'60px',borderBottom:'0px solid #ddd'}}>
                 <p style={{width:'100%',textAlign:'center'}}>Total Percentage </p>
             </div> 
             <div>
             <BalticGDPChart  />
               {/* Chart chart area */}
 
             </div>
 
             <div style={{width:'100%',display:'flex', alignItems:'center',color:'#444',borderTop:'0px solid #ddd',fontSize:'14px',lineHeight:'30px',justifyContent:'center'}}>
                 <p style={{marginLeft:'0px'}}>
                   <span style={{width:'10px',height:'10px',backgroundColor:'red',borderRadius:'5px',display:'inline-block',float:'left',marginLeft:'8px',marginRight:'8px',marginTop:'10px'}}></span>
                   Correct Answer
                 </p>
                 <p style={{marginLeft:'0px'}}>
                 <span style={{width:'10px',height:'10px',backgroundColor:'red',borderRadius:'5px',display:'inline-block',float:'left',marginLeft:'8px',marginRight:'8px',marginTop:'10px'}}></span>
                   Wrong Answer</p>
                 <p style={{marginLeft:'0px'}}>
                 <span style={{width:'10px',height:'10px',backgroundColor:'red',borderRadius:'5px',display:'inline-block',float:'left',marginLeft:'8px',marginRight:'8px',marginTop:'10px'}}></span>
                   Not Attempt</p>
                </div>
             </div> {/* grid-Second-Col-Ending */}
             
 
               {/* grid-Third-Col-Starting */}
               <div style={{backgroundColor:'#FFF',border:'0px solid #ddd',marginBottom:'10px',borderRadius:'5px' }}>
             <div style={{width:'100%',backgroundColor:'#fff',color:'#444',fontSize:'14px',paddingLeft:'10px', lineHeight:'61px',borderBottom:'0px solid #ddd'}}>
                 <p style={{width:'100%',textAlign:'center'}}>Total Score </p>
             </div> 
             <div>
             <WeeklyEarningsChart/>
             </div>
 
             </div>
              {/* grid-Third-Col-Ending*/}
         </div> {/* Grid ends */}
 
     <hr/>
         <div id="generateContent6" style={{marginTop:'40px',display:'none'}}>
         <div class="grid grid-cols-1 sm:grid-cols-2 gap-6" style={{borderBottom:'1px solid #ddd'}}>
           <div> {/*col-1 */}
             <p><span style={{color:'#6b76f3',fontWeight:'bold',marginLeft:'0px'}}>Generate AI </span>  <span style={{color:'#4285F4',fontWeight:'100',marginLeft:'4px'}}>Questions & Answers</span>  </p>
           </div> {/*col-1 */}
 
           <div> {/*col-2 */}
             <div style={{float:'left'}}>
               <span style={{color:'#4285F4',fontWeight:'bold',marginLeft:'0px'}}>Candidate</span> 
               <span style={{color:'#4285F4',fontWeight:'100',marginLeft:'4px'}}>Answer</span>  
             </div>
 
             <div style={{float:'right',marginBottom:'6px'}}>
               <div style={{border:'0px solid #ccc',float:'left', borderRadius:'15px',paddingLeft:'6px',paddingRight:'6px'}}>
                 <img style={{width:'20px',float:'left',marginRight:'2px',marginTop:'2px'}} src="../../record.svg" />
                 <span style={{marginTop:'2px',display:'inline-block'}}> 00:00:00</span> 
               </div>  
               <img style={{width:'24px',float:'right',margin:'2px 2px auto 10px'}} src="../../stop.svg" />
               </div>
             </div> {/*col-2 */}
         </div>{/*grid */}
 
         <div className="grid grid-cols-1 sm:grid-cols-2 gap-6" style={{borderBottom:'1px solid #ddd'}}>
           <div className="accordion" onClick={() => toggleRightContent('right60')} style={{borderRight:'1px solid #ddd',marginTop:'0px',marginBottom:'0px'}}>
               <button className="accordion-button">
                 <span className="arrow">▶</span> Mandatory Skills ?  
               </button>
               <div className="panel">
                   <ul style={{listStyle:'none',marginLeft:'32px',marginTop:'0px',padding:'0px'}}>
                     <li style={{color:'green'}}>Answer:</li>
                     <li>Python</li>
                   </ul>
               </div> {/* Hr Title Panel ends */}
             </div> {/* Hr Title accordion ENDS */}
  
             <div className="accordion right-content" id="right60" style={{ display: 'none' }}>
                         <button className="accordion-button">
                           <span className="arrow">▶</span> Mandatory Skills ?  
                         </button>
                         <div className="panel">
                             <ul style={{listStyle:'none',marginLeft:'32px',marginTop:'0px',padding:'0px'}}>
                               <li style={{color:'green'}}>Answer:</li>
                               <li>Python</li>
                             </ul>
                         </div> {/* Hr Title Panel ends */}
                       </div> {/* Hr Title accordion ENDS */}
             </div> {/*grid */}
 
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6" >
           <div className="accordion" onClick={() => toggleRightContent('right61')} style={{borderRight:'1px solid #ddd',marginTop:'0px',marginBottom:'0px'}}>
               <button className="accordion-button">
                 <span className="arrow">▶</span> Education ?  
               </button>
               <div className="panel">
                   <ul style={{listStyle:'none',marginLeft:'32px',marginTop:'0px',padding:'0px'}}>
                     <li style={{color:'green'}}>Answer:</li>
                     <li>B.Tech</li>
                   </ul>
               </div> {/* Hr Title Panel ends */}
             </div> {/* Hr Title accordion ENDS */}
  
             <div className="accordion right-content" id="right61" style={{ display: 'none' }}>
                         <button className="accordion-button">
                           <span className="arrow">▶</span> Education ?  
                         </button>
                         <div className="panel">
                             <ul style={{listStyle:'none',marginLeft:'32px',marginTop:'0px',padding:'0px'}}>
                               <li style={{color:'green'}}>Answer:</li>
                               <li>B.Tech</li>
                               
                             </ul>
                         </div> {/* Hr Title Panel ends */}
                       </div> {/* Hr Title accordion ENDS */}
 
         </div> {/*grid */}
         </div> {/*generateContent ends */} 
 
         </div> {/* Question Title Panel ends */}
       </div> {/* Question Title accordion ENDS */} 
        {/* Project Imapact and Soft Slills Highlight Ending */}


        
        {/* Right pannel Starting */}
     {/* <RightSideBar /> */}

{/* Right pannel Ends */}
   </div>  // container ends

              

)}
export default RightsideBar;