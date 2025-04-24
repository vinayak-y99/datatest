import { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, onSnapshot, serverTimestamp } from "firebase/firestore";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaCheckCircle, FaHourglassHalf, FaUserTie } from 'react-icons/fa';

// Firebase Configuration (Replace with your own Firebase project credentials)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
  export default function Workflow() {
    const [candidates, setCandidates] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [chatMessages, setChatMessages] = useState([]);
    const [timelineData, setTimelineData] = useState([
      {
        id: 1,
        candidate: "John Doe",
        stages: [
          { stage: "Applied", date: "2024-01-15", status: "completed" },
          { stage: "Screening", date: "2024-01-16", status: "completed" },
          { stage: "Technical", date: "2024-01-18", status: "current" },
          { stage: "HR Round", date: "", status: "pending" },
          { stage: "Offer", date: "", status: "pending" }
        ]
      },
      {
        id: 2,
        candidate: "Jane Smith",
        stages: [
          { stage: "Applied", date: "2024-01-14", status: "completed" },
          { stage: "Screening", date: "2024-01-15", status: "completed" },
          { stage: "Technical", date: "2024-01-17", status: "completed" },
          { stage: "HR Round", date: "2024-01-19", status: "current" },
          { stage: "Offer", date: "", status: "pending" }
        ]
      }
    ]);
    const [auditLogs, setAuditLogs] = useState([]);
    const [complianceChecks, setComplianceChecks] = useState([
      { id: 1, task: "Background Check", completed: false },
      { id: 2, task: "Document Verification", completed: false },
      { id: 3, task: "Policy Acknowledgment", completed: false }
    ]);
    const logActivity = async (action) => {
      await addDoc(collection(db, "audit_logs"), {
        action,
        user: "Current Recruiter", // Replace with actual user
        timestamp: serverTimestamp(),
        details: JSON.stringify(action)
      });
    };

    // Add notification function inside the component
    const simulateNotification = () => {
      // Get random candidate
      const randomCandidate = timelineData[Math.floor(Math.random() * timelineData.length)];
      
      // Find their current stage
      const currentStage = randomCandidate.stages.find(stage => stage.status === 'current');
      
      // Create dynamic notifications based on stages
      const notifications = [
        `${currentStage.stage} scheduled for ${randomCandidate.candidate}`,
        `${currentStage.stage} completed for ${randomCandidate.candidate}`,
        `${currentStage.stage} in progress for ${randomCandidate.candidate}`,
        `New feedback added for ${randomCandidate.candidate}'s ${currentStage.stage}`,
        `Reminder: Complete ${currentStage.stage} for ${randomCandidate.candidate}`
      ];

      const randomNotification = notifications[Math.floor(Math.random() * notifications.length)];
      toast.info(randomNotification);
    };

    // Simulated Candidate Data
    useEffect(() => {
      setCandidates([
        { id: 1, name: "John Doe", status: "Pending Interview", score: 85 },
        { id: 2, name: "Jane Smith", status: "Technical Review", score: 90 },
      ]);
    }, []);

    // Fetch Real-Time Chat Messages
    useEffect(() => {
      const unsubscribe = onSnapshot(collection(db, "chat"), (snapshot) => {
        setChatMessages(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      });

      return () => unsubscribe();
    }, []);

    // Handle New Chat Message
    const handleAddComment = async () => {
      if (newComment.trim() === "") return;

      await addDoc(collection(db, "chat"), {
        text: newComment,
        timestamp: serverTimestamp(),
      });

      setNewComment("");
      toast.success("Comment added!");
    };

    const updateCandidateStatus = (candidateId, stageIndex) => {
      setTimelineData(prevData => 
        prevData.map(candidate => {
          if (candidate.id === candidateId) {
            const updatedStages = candidate.stages.map((stage, index) => ({
              ...stage,
              status: index < stageIndex ? 'completed' 
                   : index === stageIndex ? 'current' 
                   : 'pending',
              date: index <= stageIndex ? new Date().toISOString().split('T')[0] : ''
            }));
            return { ...candidate, stages: updatedStages };
          }
          return candidate;
        })
      );
    
      // Show notification for status update
      toast.success(`Status updated for ${timelineData.find(c => c.id === candidateId).candidate}`);
    };

    return (
      <div style={styles.container}>
    
    
        {/* Candidate List */}
        <div style={styles.section}>
          <h3 style={styles.subheading}>Candidates</h3>
          <ul style={styles.list}>
            {candidates.map((candidate) => (
              <li key={candidate.id} style={styles.listItem}>
                <strong>{candidate.name}</strong> - {candidate.status} 
                <span style={{ color: "blue", marginLeft: "10px" }}>({candidate.score} Score)</span>
              </li>
            ))}
          </ul>
        </div>

        <div style={styles.section}>
          <h3 style={styles.subheading}>📊 Recruitment Pipeline</h3>
          {timelineData.map((candidate) => (
            <div key={candidate.id} style={styles.timelineContainer}>
              <div style={styles.candidateName}>
                <FaUserTie style={styles.userIcon} />
                {candidate.candidate}
              </div>
              <div style={styles.timeline}>
                {candidate.stages.map((stage, index) => (
                  <div 
                    key={index} 
                    style={styles.timelineStage}
                    onClick={() => updateCandidateStatus(candidate.id, index)}
                    role="button"
                    tabIndex={0}
                  >
                    <div style={styles.stageConnector} />
                    <div style={{
                      ...styles.stageNode,
                      backgroundColor: stage.status === 'completed' ? '#4CAF50' 
                                 : stage.status === 'current' ? '#2196F3' 
                                 : '#grey',
                      cursor: 'pointer'
                    }}>
                      {stage.status === 'completed' ? <FaCheckCircle color="white" /> 
                     : stage.status === 'current' ? <FaHourglassHalf color="white" />
                     : null}
                    </div>
                    <div style={styles.stageInfo}>
                      <div style={styles.stageName}>{stage.stage}</div>
                      <div style={styles.stageDate}>{stage.date || 'Pending'}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      {/* Real-Time Chat */}
      <div style={styles.section}>
        <h3 style={styles.subheading}>💬 Team Chat</h3>
        <div style={styles.chatBox}>
          {chatMessages.map((msg) => (
            <p key={msg.id} style={styles.chatMessage}>{msg.text}</p>
          ))}
        </div>
        <div style={{ display: "flex", marginTop: "10px" }}>
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Type a message..."
            style={styles.input}
          />
          <button onClick={handleAddComment} style={styles.button}>
            Send
          </button>
        </div>
      </div>

      {/* Notifications */}
      <div style={styles.section}>
        <h3 style={styles.subheading}>🔔 Notifications</h3>
        <button onClick={simulateNotification} style={styles.notifyButton}>
          Simulate Notification
        </button>
      </div>
      <ToastContainer />
    </div>
    );
  }// Inline Styles
const styles = {
  container: {
    maxWidth: "100%",
    // margin: "20px auto",
    padding: "20px",
    // backgroundColor: "#fff",
    // boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
    borderRadius: "8px",
    fontFamily: "Arial, sans-serif",
  },
 
  section: {
    marginTop: "0px",
  },
  subheading: {
    fontSize: "18px",
    fontWeight: "bold",
    marginBottom: "8px",
  },
  list: {
    padding: "0",
    listStyle: "none",
  },
  listItem: {
    padding: "8px",
    backgroundColor: "#f4f4f4",
    borderRadius: "5px",
    marginBottom: "5px",
  },
  chatBox: {
    height: "100px",
    overflowY: "auto",
    backgroundColor: "#f9f9f9",
    padding: "5px",
    borderRadius: "5px",
    border: "1px solid #ddd",
  },
  chatMessage: {
    backgroundColor: "#fff",
    padding: "5px",
    borderRadius: "5px",
    marginBottom: "3px",
  },
  input: {
    flex: "1",
    padding: "8px",
    border: "1px solid #ddd",
    borderRadius: "5px",
  },
  button: {
    marginLeft: "10px",
    padding: "8px 12px",
    backgroundColor: "#007BFF",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  notifyButton: {
    padding: "8px 12px",
    backgroundColor: "#28a745",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  timeline: {
    border: '1px solid #ddd',
    borderRadius: '5px',
    padding: '10px',
  },
  timelineEvent: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px',
    borderBottom: '1px solid #eee',
  },
  auditLog: {
    maxHeight: '200px',
    overflowY: 'auto',
    border: '1px solid #ddd',
    borderRadius: '5px',
  },
  compliance: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  complianceItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  
  // Add to your existing styles object
timelineContainer: {
  backgroundColor: '#f8f9fa',
  borderRadius: '10px',
  padding: '20px',
  marginBottom: '20px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
},
candidateName: {
  fontSize: '18px',
  fontWeight: 'bold',
  marginBottom: '15px',
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
},
userIcon: {
  color: '#2196F3',
},
timeline: {
  display: 'flex',
  justifyContent: 'space-between',
  position: 'relative',
  padding: '20px 0',
},
timelineStage: {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  position: 'relative',
  flex: 1,
},
stageConnector: {
  position: 'absolute',
  top: '25px',
  left: '-50%',
  right: '50%',
  height: '2px',
  backgroundColor: '#e0e0e0',
  zIndex: 1,
},
stageNode: {
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  zIndex: 2,
  transition: 'all 0.3s ease',
},
stageInfo: {
  textAlign: 'center',
  marginTop: '10px',
},
stageName: {
  fontWeight: 'bold',
  fontSize: '14px',
  color: '#333',
},
stageDate: {
  fontSize: '12px',
  color: '#666',
  marginTop: '4px',
}

};




