import { useState } from 'react';
import { 
  FaTachometerAlt,
  FaFileAlt,
  FaCalendarAlt,
  FaChartBar,
  FaChartLine,
  FaUsers,
  FaFileContract,
  FaComments,
  FaChartPie,
  FaShareAlt,
  FaBell
} from 'react-icons/fa';

export default function Sidebar({ isSidebarOpen, toggleSidebar }) {
  const [activeItem, setActiveItem] = useState('');

  // Define colors for each menu item (base and hover colors)
  const menuColors = {
    Overview: { 
      base: 'invert(17%) sepia(98%) saturate(2876%) hue-rotate(210deg) brightness(97%) contrast(98%)',
      hover: '#1E40AF',
      hoverFilter: 'invert(19%) sepia(98%) saturate(2644%) hue-rotate(217deg) brightness(95%) contrast(107%)'
    },
    JobDescriptions: {
      base: 'invert(10%) sepia(93%) saturate(7471%) hue-rotate(287deg) brightness(88%) contrast(114%)',
      hover: '#6B21A8',
      hoverFilter: 'invert(12%) sepia(83%) saturate(5434%) hue-rotate(282deg) brightness(82%) contrast(111%)'
    },
    // ResumeScreening: {
    //   base: 'invert(26%) sepia(75%) saturate(1395%) hue-rotate(93deg) brightness(97%) contrast(93%)',
    //   hover: '#15803D',
    //   hoverFilter: 'invert(23%) sepia(97%) saturate(1970%) hue-rotate(115deg) brightness(94%) contrast(106%)'
    // },
    InterviewScheduling: {
      base: 'invert(47%) sepia(98%) saturate(1721%) hue-rotate(359deg) brightness(91%) contrast(106%)',
      hover: '#A16207',
      hoverFilter: 'invert(35%) sepia(57%) saturate(1037%) hue-rotate(16deg) brightness(95%) contrast(89%)'
    },
    CandidatePerformance: {
      base: 'invert(17%) sepia(93%) saturate(7471%) hue-rotate(356deg) brightness(89%) contrast(124%)',
      hover: '#991B1B',
      hoverFilter: 'invert(11%) sepia(68%) saturate(5544%) hue-rotate(358deg) brightness(108%) contrast(76%)'
    },
    CandidateAnalysis: {
      base: 'invert(14%) sepia(90%) saturate(2720%) hue-rotate(230deg) brightness(80%) contrast(108%)',
      hover: '#3730A3',
      hoverFilter: 'invert(16%) sepia(41%) saturate(5305%) hue-rotate(241deg) brightness(88%) contrast(96%)'
    },
    PanelCollaboration: {
      base: 'invert(22%) sepia(99%) saturate(7471%) hue-rotate(308deg) brightness(91%) contrast(111%)',
      hover: '#9D174D',
      hoverFilter: 'invert(13%) sepia(74%) saturate(4069%) hue-rotate(319deg) brightness(78%) contrast(101%)'
    },
    ComplianceDocs: {
      base: 'invert(32%) sepia(40%) saturate(1463%) hue-rotate(127deg) brightness(87%) contrast(94%)',
      hover: '#115E59',
      hoverFilter: 'invert(25%) sepia(58%) saturate(1173%) hue-rotate(155deg) brightness(93%) contrast(101%)'
    },
    AutomatedCandidateCommunication: {
      base: 'invert(35%) sepia(85%) saturate(2079%) hue-rotate(325deg) brightness(91%) contrast(111%)',
      hover: '#C2410C',
      hoverFilter: 'invert(23%) sepia(75%) saturate(4709%) hue-rotate(19deg) brightness(95%) contrast(96%)'
    },
    DrivenInsightsPredictivAnalytics: {
      base: 'invert(39%) sepia(51%) saturate(1456%) hue-rotate(156deg) brightness(89%) contrast(94%)',
      hover: '#0E7490',
      hoverFilter: 'invert(27%) sepia(92%) saturate(1119%) hue-rotate(168deg) brightness(95%) contrast(101%)'
    },
    SocialMediaExternalDataIntegration: {
      base: 'invert(22%) sepia(93%) saturate(1100%) hue-rotate(87deg) brightness(99%) contrast(119%)',
      hover: '#065F46',
      hoverFilter: 'invert(21%) sepia(98%) saturate(751%) hue-rotate(125deg) brightness(96%) contrast(102%)'
    },
    AlertsNotifications: {
      base: 'invert(19%) sepia(79%) saturate(2404%) hue-rotate(316deg) brightness(85%) contrast(98%)',
      hover: '#9F1239',
      hoverFilter: 'invert(9%) sepia(83%) saturate(4068%) hue-rotate(334deg) brightness(102%) contrast(99%)'
    }
  };

  const handleItemClick = (itemName) => {
    // Reset previous active item's background
    if (activeItem) {
      const prevElement = document.getElementById(activeItem);
      if (prevElement) {
        prevElement.style.backgroundColor = '#fff';
      }
    }

    setActiveItem(itemName);
    const element = document.getElementById(itemName);
    if (element) {
      element.style.backgroundColor = menuColors[itemName].hover;
    }

    // Handle panel display
    const panel = document.getElementById(itemName + 'Panel');
    if (panel && panel.style.display === 'none') {
      panel.style.display = 'block';
      const img = document.getElementById(itemName + 'Img');
      if (img) {
        img.style.transition = 'transform 0.5s ease';
        img.style.transform = 'rotate(90deg)';
      }
    }

    // Handle scrolling
    const li = document.getElementById(itemName + 'Li');
    if (li) {
      li.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const menuItems = [
    { 
      name: 'Overview', 
      icon: FaTachometerAlt, 
      href: '/DashboardOverview' 
    },
    { 
      name: 'JobDescriptions', 
      icon: FaFileAlt, 
      href: './JobDescription' 
    },
  
    { 
      name: 'InterviewScheduling', 
      icon: FaCalendarAlt, 
      href: '/SelectionInterviewScheduling' 
    },
    { 
      name: 'CandidatePerformance', 
      icon: FaChartBar, 
      href: '/CandidatePerformance' 
    },
    { 
      name: 'CandidateAnalysis', 
      icon: FaChartLine, 
      href: '/ComparativeCandidateAnalysis' 
    },
    { 
      name: 'PanelCollaboration', 
      icon: FaUsers, 
      href: '/Multi-PanelCollaboration' 
    },
    { 
      name: 'ComplianceDocs', 
      icon: FaFileContract, 
      href: '/ComplianceDocumentationManagement' 
    },
    { 
      name: 'AutomatedCandidateCommunication', 
      icon: FaComments, 
      href: '/AutomatedCandidateCommunication' 
    },
    { 
      name: 'DrivenInsightsPredictivAnalytics', 
      icon: FaChartPie, 
      href: '/DrivenInsightsPredictivAnalytics' 
    },
    { 
      name: 'SocialMediaExternalDataIntegration', 
      icon: FaShareAlt, 
      href: '/SocialMediaExternalDataIntegration' 
    },
    { 
      name: 'AlertsNotifications', 
      icon: FaBell, 
      href: '/AlertsNotifications' 
    }
  ];

  return (
    <div style={{backgroundColor:'#fff',marginTop:'75px',position:'fixed',zIndex:'1',marginLeft:'4px',borderRadius:'6px'}}>
      <nav className="mt-3">
        <ul className="px-1.5 space-y-1" style={{width:'50px'}}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.name}>
                <span
                  id={item.name}
                  title={item.name}
                  onClick={() => handleItemClick(item.name)}
                  className="flex items-center px-2.5 py-2 rounded-md transition-all duration-300"
                  style={{
                    cursor: 'pointer',
                    backgroundColor: activeItem === item.name ? menuColors[item.name].hover : '#fff'
                  }}
                >
                  <Icon 
                    className="w-6 h-6 transition-all duration-300 transform hover:scale-110"
                    style={{ 
                      filter: activeItem === item.name ? 'brightness(0) invert(1)' : menuColors[item.name].base,
                      transition: 'all 0.3s ease',
                    }}
                    onMouseOver={(e) => {
                      const span = e.target.parentElement;
                      span.style.backgroundColor = menuColors[item.name].hover;
                      e.target.style.filter = 'brightness(0) invert(1)';
                    }}
                    onMouseOut={(e) => {
                      const span = e.target.parentElement;
                      if (activeItem !== item.name) {
                        span.style.backgroundColor = '#fff';
                        e.target.style.filter = menuColors[item.name].base;
                      }
                    }}
                  />
                </span>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}