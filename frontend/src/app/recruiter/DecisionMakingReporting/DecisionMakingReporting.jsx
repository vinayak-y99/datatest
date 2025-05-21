import { useState } from 'react';
import { FaUsers, FaCheckCircle, FaTimesCircle, FaPauseCircle } from 'react-icons/fa';

const DecisionMakingReporting = () => {
  const [candidates, setCandidates] = useState([
    { name: 'John Doe', score: 85, status: 'Pending', role: 'Frontend Developer' },
    { name: 'Jane Smith', score: 92, status: 'Pending', role: 'Backend Developer' },
    { name: 'Jim Beam', score: 55, status: 'Pending', role: 'UI Designer' },
    { name: 'Sarah Wilson', score: 88, status: 'Pending', role: 'Product Manager' },
  ]);

  const [analytics, setAnalytics] = useState({
    totalInterviews: candidates.length,
    selected: 0,
    rejected: 0,
    hold: 0,
  });

  const [emailSent, setEmailSent] = useState(false);

  const handleAction = (index, action) => {
    const updatedCandidates = [...candidates];
    const updatedAnalytics = { ...analytics };

    if (updatedCandidates[index].status !== 'Pending') {
      switch (updatedCandidates[index].status) {
        case 'Selected': updatedAnalytics.selected -= 1; break;
        case 'Rejected': updatedAnalytics.rejected -= 1; break;
        case 'On Hold': updatedAnalytics.hold -= 1; break;
      }
    }

    switch (action) {
      case 'select':
        updatedCandidates[index].status = 'Selected';
        updatedAnalytics.selected += 1;
        break;
      case 'reject':
        updatedCandidates[index].status = 'Rejected';
        updatedAnalytics.rejected += 1;
        break;
      case 'hold':
        updatedCandidates[index].status = 'On Hold';
        updatedAnalytics.hold += 1;
        break;
    }

    setCandidates(updatedCandidates);
    setAnalytics(updatedAnalytics);
  };

  const sendReport = () => {
    setEmailSent(true);
    setTimeout(() => setEmailSent(false), 3000);
  };

  // Styles
  const containerStyle = {
    maxWidth: '100%',
    margin: '0 auto',
    padding: '10px',
    fontFamily: 'Arial, sans-serif',
  };
    const cardContainer = {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '15px',
      marginBottom: '20px',
    };

    const statCard = {
      padding: '10px',
      borderRadius: '12px',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      color: 'white',
      transition: 'transform 0.3s ease',
      cursor: 'pointer',
      position: 'relative',
      overflow: 'hidden',
    };

    const statCardContent = {
      position: 'relative',
      zIndex: 2,
    };

    const iconStyle = {
      position: 'absolute',
      right: '-5px',
      bottom: '-5px',
      opacity: '0.2',
      transform: 'scale(1.5)',
    };

    const getStatusStyle = (status) => {
      const styles = {
        Selected: { color: '#4CAF50' },
        Rejected: { color: '#f44336' },
        'On Hold': { color: '#ff9800' },
        Pending: { color: '#757575' },
    };
    return styles[status] || {};
  };

  return (
    <div style={containerStyle}>
      <div style={cardContainer}>
        <div 
          style={{ 
            ...statCard, 
            background: 'linear-gradient(135deg, #6B46C1 0%, #805AD5 100%)',
            boxShadow: '0 10px 20px rgba(107, 70, 193, 0.2)',
          }}
          onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'}
          onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={statCardContent}>
            <h3 style={{ fontSize: '16px', margin: 0, opacity: 0.9 }}>Total Interviews</h3>
            <h2 style={{ fontSize: '36px', margin: '10px 0' }}>{analytics.totalInterviews}</h2>
            <p style={{ margin: 0, fontSize: '14px', opacity: 0.8 }}>Active candidates</p>
          </div>
          <div style={iconStyle}><FaUsers size={80} /></div>
        </div>

        <div 
          style={{ 
            ...statCard, 
            background: 'linear-gradient(135deg, #2F855A 0%, #48BB78 100%)',
            boxShadow: '0 10px 20px rgba(47, 133, 90, 0.2)',
          }}
          onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'}
          onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={statCardContent}>
            <h3 style={{ fontSize: '16px', margin: 0, opacity: 0.9 }}>Selected</h3>
            <h2 style={{ fontSize: '36px', margin: '10px 0' }}>{analytics.selected}</h2>
            <p style={{ margin: 0, fontSize: '14px', opacity: 0.8 }}>Approved candidates</p>
          </div>
          <div style={iconStyle}><FaCheckCircle size={80} /></div>
        </div>

        <div 
          style={{ 
            ...statCard, 
            background: 'linear-gradient(135deg, #C53030 0%, #F56565 100%)',
            boxShadow: '0 10px 20px rgba(197, 48, 48, 0.2)',
          }}
          onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'}
          onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={statCardContent}>
            <h3 style={{ fontSize: '16px', margin: 0, opacity: 0.9 }}>Rejected</h3>
            <h2 style={{ fontSize: '36px', margin: '10px 0' }}>{analytics.rejected}</h2>
            <p style={{ margin: 0, fontSize: '14px', opacity: 0.8 }}>Declined candidates</p>
          </div>
          <div style={iconStyle}><FaTimesCircle size={80} /></div>
        </div>

        <div 
          style={{ 
            ...statCard, 
            background: 'linear-gradient(135deg, #C05621 0%, #ED8936 100%)',
            boxShadow: '0 10px 20px rgba(192, 86, 33, 0.2)',
          }}
          onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'}
          onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={statCardContent}>
            <h3 style={{ fontSize: '18px', margin: 0, opacity: 0.9 }}>On Hold</h3>
            <h2 style={{ fontSize: '42px', margin: '12px 0' }}>{analytics.hold}</h2>
            <p style={{ margin: 0, fontSize: '16px', opacity: 0.8 }}>Pending review</p>
          </div>
          <div style={iconStyle}><FaPauseCircle size={80} /></div>
        </div>
      </div>

      {/* Candidate Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f5f5f5' }}>
              <th style={{ padding: '18px', textAlign: 'left', fontSize: '16px' }}>Name</th>
              <th style={{ padding: '18px', textAlign: 'left', fontSize: '16px' }}>Role</th>
              <th style={{ padding: '18px', textAlign: 'center', fontSize: '16px' }}>Score</th>
              <th style={{ padding: '18px', textAlign: 'center', fontSize: '16px' }}>Status</th>
              <th style={{ padding: '18px', textAlign: 'center', fontSize: '16px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {candidates.map((candidate, index) => (
              <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '18px', fontSize: '15px' }}>{candidate.name}</td>
                <td style={{ padding: '18px', fontSize: '15px' }}>{candidate.role}</td>
                <td style={{ padding: '18px', textAlign: 'center', fontSize: '15px' }}>{candidate.score}</td>
                <td style={{ padding: '18px', textAlign: 'center', fontSize: '15px', ...getStatusStyle(candidate.status) }}>
                  {candidate.status}
                </td>
                <td style={{ padding: '18px', textAlign: 'center' }}>
                  <button
                    onClick={() => handleAction(index, 'select')}
                    style={{ 
                      backgroundColor: '#4CAF50', 
                      color: 'white', 
                      padding: '12px 18px', 
                      border: 'none', 
                      borderRadius: '5px', 
                      margin: '5px',
                      fontSize: '14px'
                    }}
                  >
                    Select
                  </button>
                  <button
                    onClick={() => handleAction(index, 'reject')}
                    style={{ 
                      backgroundColor: '#f44336', 
                      color: 'white', 
                      padding: '12px 18px', 
                      border: 'none', 
                      borderRadius: '5px', 
                      margin: '5px',
                      fontSize: '14px'
                    }}
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleAction(index, 'hold')}
                    style={{ 
                      backgroundColor: '#ff9800', 
                      color: 'white', 
                      padding: '12px 18px', 
                      border: 'none', 
                      borderRadius: '5px', 
                      margin: '5px',
                      fontSize: '14px'
                    }}
                  >
                    Hold
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ textAlign: 'center', marginTop: '30px' }}>
        <button
          onClick={sendReport}
          style={{
            backgroundColor: '#2196F3',
            color: 'white',
            padding: '18px 36px',
            border: 'none',
            borderRadius: '5px',
            fontWeight: 'bold',
            fontSize: '16px',
            transition: '0.3s',
          }}
        >
          {emailSent ? 'Report Sent!' : 'Send Report to Hiring Manager'}
        </button>
      </div>
    </div>
  );
};
export default DecisionMakingReporting;
