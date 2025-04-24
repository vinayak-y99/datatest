'use client';
import { useState } from "react";
import { FaUserTie, FaFilter, FaSearch, FaPlus, FaBolt, FaEllipsisV, FaChevronUp, FaChevronDown, FaChevronRight } from 'react-icons/fa';
import { Settings } from 'lucide-react';
import DashboardOverview from './DashboardOverview';
import JobDescriptionsRoleAssignments from '../components/JobDescriptionsRole_tech';
import CandidateSelectionInterviewScheduling from './CandidateSelectionInterviewScheduling';
import CandidatePerformanceEvaluationFeedbackSubmission from './CandidatePerformanceEvaluationFeedbackSubmission';
import ComparativeCandidateAnalysis from './ComparativeCandidateAnalysis';
import MultiPanelCollaborationDiscussion from './Multi-PanelCollaborationDiscussion';
import ComplianceDocumentationManagement from './ComplianceDocumentationManagement';
import AutomatedCandidateCommunication from './AutomatedCandidateCommunication';
import DataDrivenInsightsPredictiveAnalytics from './DataDrivenInsightsPredictiveAnalytics';
import SocialMediaExternalDataIntegration from './SocialMediaExternalDataIntegration';
import RealTimeAlertsNotifications from './RealTimeAlertsNotifications';
import Sidebar from "./Sidebar";
import RightSideBar from "../components/DrawerNavigation.jsx";

const Home = () => {
  const [isaccordianOpen, setisaccordianOpen] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeMenuItem, setActiveMenuItem] = useState('Overview');
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleExpandCollapse = () => {
    setIsExpanded(!isExpanded);
    accodianOpenClose();
  };

  const jobTasks = [
    'Overview',
    'JobDescriptions',
    'ResumeScreening',
    'InterviewScheduling',
    'CandidatePerformance',
    'CandidateAnalysis',
    'PanelCollaboration',
    'ComplianceDocs',
    'AutomatedCandidateCommunication',
    'DrivenInsightsPredictivAnalytics',
    'SocialMediaExternalDataIntegration',
    'AlertsNotifications'
  ];

  const accodianOpenClose = () => {
    jobTasks.forEach((item) => {
      // Skip the Overview panel to keep it stable
      if (item === 'Overview') return;

      const panel = document.getElementById(item + 'Panel');
      const img = document.getElementById(item + 'Img');

      if (panel) {
        if (isaccordianOpen === 0) {
          panel.style.display = 'block';
        } else {
          panel.style.display = 'none';
        }
      }

      if (img) {
        img.style.transition = 'transform 0.5s ease';
        img.style.transform = isaccordianOpen === 0 ? 'rotate(90deg)' : 'rotate(0deg)';
      }
    });
    setisaccordianOpen(isaccordianOpen === 0 ? 1 : 0);
  };

  const accodianPanelShow = (customAcordianId) => {
    setActiveMenuItem(customAcordianId);

    const panel = document.getElementById(customAcordianId + 'Panel');
    const label = document.getElementById(customAcordianId + 'Lbl');
    const img = document.getElementById(customAcordianId + 'Img');

    if (panel) {
      panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    }

    if (label) {
      label.style.backgroundColor = panel.style.display === 'block' ? '#fff' : 'transparent';
    }

    if (img) {
      img.style.transition = 'transform 0.5s ease';
      img.style.transform = panel.style.display === 'block' ? 'rotate(90deg)' : 'rotate(0deg)';
    }
  };

  const RightShow = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.style.display = element.style.display === 'none' ? 'block' : 'none';
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      <div className="flex flex-col flex-1 overflow-y-auto">
        <div style={{
          position: 'fixed',
          top: '66px',
          left: '0',
          right: '0',
          width: '100%',
          zIndex: '10',
          backgroundColor: 'white',
          borderBottom: '1px solid #E5E7EB'
        }}>
          <div className="w-full">
            <div className="flex items-center justify-between px-6 py-3">
              <div className="flex items-center space-x-3">
                <div className="group flex items-center gap-2 bg-white/90 px-3 rounded-2xl hover:shadow-md transition-all duration-300 border-blue-100" style={{ maxWidth: "250px" }}>
                  <div className="relative" style={{ width: "35px", height: "35px" }}>
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur opacity-20 group-hover:opacity-60 transition duration-300"></div>
                    <div className="relative bg-gradient-to-r from-blue-50 to-purple-50 p-2 rounded-full">
                      <FaUserTie className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform duration-300" />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent" style={{ fontSize: "18px", marginTop: "5px", lineHeight: "normal" }}>
                      Technical Panel
                    </h2>
                    <span className="text-xs text-gray-600 font-medium" style={{ fontSize: "9px", marginTop: "0px", marginLeft: "6px" }}>
                      Talent Acquisition Hub
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <button
                  style={{
                    marginLeft: '10px',
                    padding: '6px 10px',
                    borderRadius: '9999px',
                    backgroundColor: 'white',
                    border: '1px solid #E5E7EB',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  onClick={handleExpandCollapse}
                  className="p-2.5 rounded-xl bg-gradient-to-r from-indigo-50 to-indigo-100 hover:from-indigo-100 hover:to-indigo-200 transition-all duration-200 group"
                  title="expand / collapse"
                >
                  {isExpanded ? (
                    <FaChevronUp 
                      className="w-4 h-4 group-hover:scale-110 transition-transform"
                    />
                  ) : (
                    <FaChevronDown 
                      className="w-4 h-4 group-hover:scale-110 transition-transform"
                    />
                  )}
                </button>
                <div className="flex items-center gap-3 mr-0">
                  <button className="p-2.5 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 transition-all duration-200 group">
                    <FaFilter size={16} className="text-blue-600 group-hover:scale-110 transition-transform" />
                  </button>
                  <button className="p-2.5 rounded-xl bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 transition-all duration-200 group">
                    <FaSearch size={16} className="text-purple-600 group-hover:scale-110 transition-transform" />
                  </button>
                  <button className="p-2.5 rounded-xl bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 transition-all duration-200 group">
                    <FaPlus size={16} className="text-green-600 group-hover:scale-110 transition-transform" />
                  </button>
                  <button className="p-2.5 rounded-xl bg-gradient-to-r from-amber-50 to-amber-100 hover:from-amber-100 hover:to-amber-200 transition-all duration-200 group">
                    <FaBolt size={16} className="text-amber-600 group-hover:scale-110 transition-transform" />
                  </button>
                  <button className="p-2.5 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 transition-all duration-200 group">
                    <FaEllipsisV size={16} className="text-gray-600 group-hover:scale-110 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ width: 'calc(100% - 74px)', marginLeft: '36px', padding: '8px', marginTop: '28px' }}>
          <RightSideBar />
          <ol>
            <li className="ms-6" id="OverviewLi" style={{ marginTop: '48px', scrollMarginTop: '200px' }}>
              <div id="OverviewLbl" style={{ padding: '4px 8px', display: 'inline-block', borderRadius: '4px' }}>
                <FaChevronRight 
                  id="OverviewImg" 
                  style={{ cursor: 'pointer', width: '11px', float: 'left', marginLeft: '0px', marginRight: '4px', marginTop: '6px' }}
                  className="text-gray-500"
                />
                <span style={{ float: 'left', cursor: 'pointer', fontSize: '15px' }} onClick={() => RightShow('drawer-navigation')}>Dashboard Overview</span>
              </div>
              <div id="OverviewPanel" style={{ display: 'block', transition: 'max-height 0.3s ease-out' }}>
                <DashboardOverview />
              </div>
            </li>

            <li id="JobDescriptionsLi" className="ms-6" style={{ marginTop: '10px', scrollMarginTop: '140px' }}>
              <div id="JobDescriptionsLbl" style={{ padding: '4px 8px', display: 'inline-block', borderRadius: '4px' }}>
                <FaChevronRight 
                  onClick={() => accodianPanelShow('JobDescriptions')} 
                  id="JobDescriptionsImg" 
                  style={{ cursor: 'pointer', width: '11px', float: 'left', marginLeft: '0px', marginRight: '4px', marginTop: '6px' }}
                  className="text-gray-500"
                />
                <span style={{ float: 'left', cursor: 'pointer', fontSize: '15px' }} onClick={() => RightShow('drawer-navigation')}> Job description and Resume</span>
              </div>
              <div id="JobDescriptionsPanel" style={{ display: 'none', transition: 'max-height 0.3s ease-out' }}>
                <JobDescriptionsRoleAssignments />
              </div>
            </li>

            <li id="InterviewSchedulingLi" className="ms-6" style={{ marginTop: '10px', scrollMarginTop: '140px' }}>
              <div id="InterviewSchedulingLbl" style={{ padding: '4px 8px', display: 'inline-block', borderRadius: '4px' }}>
                <FaChevronRight 
                  onClick={() => accodianPanelShow('InterviewScheduling')} 
                  id="InterviewSchedulingImg" 
                  style={{ cursor: 'pointer', width: '11px', float: 'left', marginLeft: '0px', marginRight: '4px', marginTop: '6px' }}
                  className="text-gray-500"
                />
                <span style={{ float: 'left', cursor: 'pointer', fontSize: '15px' }} onClick={() => RightShow('drawer-navigation')}>Candidate Selection & Interview Scheduling</span>
              </div>
              <div id="InterviewSchedulingPanel" style={{ display: 'none', transition: 'max-height 0.3s ease-out' }}>
                <CandidateSelectionInterviewScheduling />
              </div>
            </li>

            <li id="CandidatePerformanceLi" className="ms-6" style={{ marginTop: '10px', scrollMarginTop: '140px' }}>
              <div id="CandidatePerformanceLbl" style={{ padding: '4px 8px', display: 'inline-block', borderRadius: '4px' }}>
                <FaChevronRight 
                  onClick={() => accodianPanelShow('CandidatePerformance')} 
                  id="CandidatePerformanceImg" 
                  style={{ cursor: 'pointer', width: '11px', float: 'left', marginLeft: '0px', marginRight: '4px', marginTop: '6px' }}
                  className="text-gray-500"
                />
                <span style={{ float: 'left', cursor: 'pointer', fontSize: '15px' }} onClick={() => RightShow('drawer-navigation')}>Candidate Performance Evaluation & Feedback Submission</span>
              </div>
              <div id="CandidatePerformancePanel" style={{ display: 'none', transition: 'max-height 0.3s ease-out' }}>
                <CandidatePerformanceEvaluationFeedbackSubmission />
              </div>
            </li>

            <li id="CandidateAnalysisLi" className="ms-6" style={{ marginTop: '10px', scrollMarginTop: '140px' }}>
              <div id="CandidateAnalysisLbl" style={{ padding: '4px 8px', display: 'inline-block', borderRadius: '4px' }}>
                <FaChevronRight 
                  onClick={() => accodianPanelShow('CandidateAnalysis')} 
                  id="CandidateAnalysisImg" 
                  style={{ cursor: 'pointer', width: '11px', float: 'left', marginLeft: '0px', marginRight: '4px', marginTop: '6px' }}
                  className="text-gray-500"
                />
                <span style={{ float: 'left', cursor: 'pointer', fontSize: '15px' }} onClick={() => RightShow('drawer-navigation')}>Comparative Candidate Analysis</span>
              </div>
              <div id="CandidateAnalysisPanel" style={{ display: 'none', transition: 'max-height 0.3s ease-out' }}>
                <ComparativeCandidateAnalysis />
              </div>
            </li>

            <li id="PanelCollaborationLi" className="ms-6" style={{ marginTop: '10px', scrollMarginTop: '140px' }}>
              <div id="PanelCollaborationLbl" style={{ padding: '4px 8px', display: 'inline-block', borderRadius: '4px' }}>
                <FaChevronRight 
                  onClick={() => accodianPanelShow('PanelCollaboration')} 
                  id="PanelCollaborationImg" 
                  style={{ cursor: 'pointer', width: '11px', float: 'left', marginLeft: '0px', marginRight: '4px', marginTop: '6px' }}
                  className="text-gray-500"
                />
                <span style={{ float: 'left', cursor: 'pointer', fontSize: '15px' }} onClick={() => RightShow('drawer-navigation')}>Multi-Panel Collaboration & Discussion</span>
              </div>
              <div id="PanelCollaborationPanel" style={{ display: 'none', transition: 'max-height 0.3s ease-out' }}>
                <MultiPanelCollaborationDiscussion />
                <br />
              </div>
            </li>

            <li id="ComplianceDocsLi" className="ms-6" style={{ marginTop: '10px', scrollMarginTop: '140px' }}>
              <div id="ComplianceDocsLbl" style={{ padding: '4px 8px', display: 'inline-block', borderRadius: '4px' }}>
                <FaChevronRight 
                  onClick={() => accodianPanelShow('ComplianceDocs')} 
                  id="ComplianceDocsImg" 
                  style={{ cursor: 'pointer', width: '11px', float: 'left', marginLeft: '0px', marginRight: '4px', marginTop: '6px' }}
                  className="text-gray-500"
                />
                <span style={{ float: 'left', cursor: 'pointer', fontSize: '15px' }} onClick={() => RightShow('drawer-navigation')}>Compliance & Documentation Management</span>
              </div>
              <div id="ComplianceDocsPanel" style={{ display: 'none', transition: 'max-height 0.3s ease-out' }}>
                <ComplianceDocumentationManagement />
              </div>
            </li>

            <li id="AutomatedCandidateCommunicationLi" className="ms-6" style={{ marginTop: '10px', scrollMarginTop: '140px' }}>
              <div id="AutomatedCandidateCommunicationLbl" style={{ padding: '4px 8px', display: 'inline-block', borderRadius: '4px' }}>
                <FaChevronRight 
                  onClick={() => accodianPanelShow('AutomatedCandidateCommunication')} 
                  id="AutomatedCandidateCommunicationImg" 
                  style={{ cursor: 'pointer', width: '11px', float: 'left', marginLeft: '0px', marginRight: '4px', marginTop: '6px' }}
                  className="text-gray-500"
                />
                <span style={{ float: 'left', cursor: 'pointer', fontSize: '15px' }} onClick={() => RightShow('drawer-navigation')}>Automated Candidate Communication</span>
              </div>
              <div id="AutomatedCandidateCommunicationPanel" style={{ display: 'none', transition: 'max-height 0.3s ease-out' }}>
                <AutomatedCandidateCommunication />
              </div>
            </li>

            <li id="DrivenInsightsPredictivAnalyticsLi" className="ms-6" style={{ marginTop: '10px', scrollMarginTop: '140px' }}>
              <div id="DrivenInsightsPredictivAnalyticsLbl" style={{ padding: '4px 8px', display: 'inline-block', borderRadius: '4px' }}>
                <FaChevronRight 
                  onClick={() => accodianPanelShow('DrivenInsightsPredictivAnalytics')} 
                  id="DrivenInsightsPredictivAnalyticsImg" 
                  style={{ cursor: 'pointer', width: '11px', float: 'left', marginLeft: '0px', marginRight: '4px', marginTop: '6px' }}
                  className="text-gray-500"
                />
                <span style={{ float: 'left', cursor: 'pointer', fontSize: '15px' }} onClick={() => RightShow('drawer-navigation')}>Data-Driven Insights & Predictive Analytics</span>
              </div>
              <div id="DrivenInsightsPredictivAnalyticsPanel" style={{ display: 'none', transition: 'max-height 0.3s ease-out' }}>
                <DataDrivenInsightsPredictiveAnalytics />
              </div>
            </li>

            <li id="SocialMediaExternalDataIntegrationLi" className="ms-6" style={{ marginTop: '10px', scrollMarginTop: '140px' }}>
              <div id="SocialMediaExternalDataIntegrationLbl" style={{ padding: '4px 8px', display: 'inline-block', borderRadius: '4px' }}>
                <FaChevronRight 
                  onClick={() => accodianPanelShow('SocialMediaExternalDataIntegration')} 
                  id="SocialMediaExternalDataIntegrationImg" 
                  style={{ cursor: 'pointer', width: '11px', float: 'left', marginLeft: '0px', marginRight: '4px', marginTop: '6px' }}
                  className="text-gray-500"
                />
                <span style={{ float: 'left', cursor: 'pointer', fontSize: '15px' }} onClick={() => RightShow('drawer-navigation')}>Social Media & External Data Integration</span>
              </div>
              <div id="SocialMediaExternalDataIntegrationPanel" style={{ display: 'none', transition: 'max-height 0.3s ease-out' }}>
                <SocialMediaExternalDataIntegration />
              </div>
            </li>

            <li id="AlertsNotificationsLi" className="ms-6" style={{ marginTop: '10px', scrollMarginTop: '140px' }}>
              <div id="AlertsNotificationsLbl" style={{ padding: '4px 8px', display: 'inline-block', borderRadius: '4px' }}>
                <FaChevronRight 
                  onClick={() => accodianPanelShow('AlertsNotifications')} 
                  id="AlertsNotificationsImg" 
                  style={{ cursor: 'pointer', width: '11px', float: 'left', marginLeft: '0px', marginRight: '4px', marginTop: '6px' }}
                  className="text-gray-500"
                />
                <span style={{ float: 'left', cursor: 'pointer', fontSize: '15px' }} onClick={() => RightShow('drawer-navigation')}>Real-Time Alerts & Notifications</span>
              </div>
              <div id="AlertsNotificationsPanel" style={{ display: 'none', transition: 'max-height 0.3s ease-out' }}>
                <RealTimeAlertsNotifications />
              </div>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default Home;