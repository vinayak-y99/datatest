"use client";

import { useEffect, useState } from "react";
import io from "socket.io-client";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Default fallback data
const DEFAULT_EVALUATIONS = [];

const DEFAULT_NOTIFICATIONS = [
  {
    type: 'interview',
    candidate: 'John Doe',
    role: 'Frontend Developer',
    time: '2:00 PM',
    date: dayjs().add(2, 'day').format('YYYY-MM-DD')
  },
  {
    type: 'evaluation',
    candidate: 'Jane Smith',
    role: 'Backend Developer',
    interviewer: 'Tech Lead'
  },
  {
    type: 'decision',
    candidate: 'Mike Johnson',
    role: 'DevOps Engineer',
    status: 'Pending Final Decision'
  }
];

export default function CollaborationBoard() {
  // States with null initial values
  const [socket, setSocket] = useState(null);
  const [evaluations, setEvaluations] = useState(DEFAULT_EVALUATIONS);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form states
  const [message, setMessage] = useState("");
  const [user, setUser] = useState("");
  const [userRole, setUserRole] = useState("recruiter");
  const [category, setCategory] = useState("evaluation");

  // Modified fetch function for better development experience
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Simulate API delay in development
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Use default data directly in development
      setEvaluations(DEFAULT_EVALUATIONS);
      initializeNotifications(DEFAULT_NOTIFICATIONS);
      
      console.log("Development mode: Using default data (no backend)");

    } catch (error) {
      console.log("Development mode: Using fallback data");
      setEvaluations(DEFAULT_EVALUATIONS);
      initializeNotifications(DEFAULT_NOTIFICATIONS);
    } finally {
      setIsLoading(false);
    }
  };

  // Modified socket initialization for development
  useEffect(() => {
    console.log("Development mode: Socket connection disabled");
    // Don't attempt socket connection in development
    return () => {};
  }, []);

  // Initialize socket connection
  useEffect(() => {
    try {
      const newSocket = io("http://localhost:4000", {
        reconnection: false,
        timeout: 5000,
      });

      newSocket.on("connect_error", (error) => {
        console.log("Socket connection failed, using local updates only");
      });

      newSocket.on("evaluationUpdate", (newEvaluation) => {
        setEvaluations(prev => [...prev, newEvaluation]);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    } catch (error) {
      console.log("Socket initialization failed, using local updates only");
    }
  }, []);

  // Initialize notifications with mock data
  const initializeNotifications = (initialNotifications) => {
    const formattedNotifications = initialNotifications.map(notification => {
      let message = '';
      switch(notification.type) {
        case 'interview':
          message = `Interview scheduled: ${notification.candidate} for ${notification.role} position on ${notification.date} at ${notification.time}`;
          break;
        case 'evaluation':
          message = `Evaluation needed: ${notification.candidate} (${notification.role}) - Awaiting review from ${notification.interviewer}`;
          break;
        case 'decision':
          message = `${notification.candidate} - ${notification.role}: ${notification.status}`;
          break;
      }
      return {
        id: Date.now() + Math.random(),
        message,
        timestamp: dayjs().format("YYYY-MM-DD HH:mm"),
        isNew: true
      };
    });

    setNotifications(formattedNotifications);
  };

  // Modified submission handler for development
  const submitEvaluation = async () => {
    if (!user || !message) {
      toast.error("Please complete all fields!");
      return;
    }

    if (userRole === "recruiter" || userRole === "technical-panel") {
      const newEvaluation = {
        user,
        message,
        category,
        userRole,
        timestamp: dayjs().format("YYYY-MM-DD HH:mm"),
      };

      // In development, just update local state
      setEvaluations(prev => [...prev, newEvaluation]);
      addNotification(`New ${category} submitted by ${user}`);
      toast.success("Evaluation saved (development mode)");
      setMessage("");
      
      console.log("Development mode: Evaluation saved locally");
    } else {
      toast.error("Insufficient permissions for this action.");
    }
  };

  // Add new notification
  const addNotification = (message) => {
    setNotifications(prev => [{
      id: Date.now(),
      message,
      timestamp: dayjs().format("YYYY-MM-DD HH:mm"),
      isNew: true
    }, ...prev].slice(0, 10));
  };

  // Initial data fetch
  useEffect(() => {
    fetchData();
    // Refresh data periodically
    const intervalId = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.roleTag}>{userRole}</span>
      </div>

      <div style={styles.inputSection}>
        <div style={styles.roleButtons}>
          <button
            style={{
              ...styles.roleButton,
              background: userRole === 'recruiter' ? 'linear-gradient(90deg, #4158D0, #C850C0)' : '#e0e0e0'
            }}
            onClick={() => setUserRole('recruiter')}
          >
            Recruiter
          </button>
          <button
            style={{
              ...styles.roleButton,
              background: userRole === 'technical-panel' ? 'linear-gradient(90deg, #4158D0, #C850C0)' : '#e0e0e0'
            }}
            onClick={() => setUserRole('technical-panel')}
          >
            Technical Panel
          </button>
          <button
            style={{
              ...styles.roleButton,
              background: userRole === 'hiring-manager' ? 'linear-gradient(90deg, #4158D0, #C850C0)' : '#e0e0e0'
            }}
            onClick={() => setUserRole('hiring-manager')}
          >
            Hiring Manager
          </button>
        </div>

        <input
          type="text"
          placeholder="Your Name"
          value={user}
          onChange={(e) => setUser(e.target.value)}
          style={styles.input}
        />

        <div style={styles.categoryButtons}>
          <button
            style={{
              ...styles.categoryButton,
              background: category === 'evaluation' ? 'linear-gradient(90deg, #4158D0, #C850C0)' : '#e0e0e0'
            }}
            onClick={() => setCategory('evaluation')}
          >
            Candidate Evaluation
          </button>
          <button
            style={{
              ...styles.categoryButton,
              background: category === 'schedule' ? 'linear-gradient(90deg, #4158D0, #C850C0)' : '#e0e0e0'
            }}
            onClick={() => setCategory('schedule')}
          >
            Interview Schedule
          </button>
          <button
            style={{
              ...styles.categoryButton,
              background: category === 'decision' ? 'linear-gradient(90deg, #4158D0, #C850C0)' : '#e0e0e0'
            }}
            onClick={() => setCategory('decision')}
          >
            Hiring Decision
          </button>
        </div>

        <textarea
          placeholder="Share your insights..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          style={styles.textarea}
        />

        <button onClick={submitEvaluation} style={styles.button}>
          Share Update
        </button>
      </div>

      <div style={styles.collaborationFeed}>
        <h3 style={{
  background: 'linear-gradient(90deg, #4158D0, #C850C0)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  fontSize: '18px',
  fontWeight: '600',
  marginBottom: '20px'
}}>
  Notifications
</h3>

        <ul style={styles.list}>
          {notifications.map((notification) => (
            <li key={notification.id} style={{
              ...styles.listItem,
              backgroundColor: notification.isNew ? '#f0f7ff' : 'transparent'
            }}>
              <div style={styles.notificationContent}>
                <p style={styles.message}>{notification.message}</p>
                <small style={styles.timestamp}>{notification.timestamp}</small>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "20px",
    maxWidth: "100%",
    minHeight: "100%",
    borderRadius: "12px",
    // background: "linear-gradient(145deg, #f8f9fa, #e9ecef)",
    // boxShadow: "0 8px 32px rgba(31, 38, 135, 0.15)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  roleTag: {
    padding: "8px 15px",
    fontSize: "16px",
    color: "#4158D0",
    fontWeight: "600",
    letterSpacing: "0.5px",
    textTransform: "capitalize",
  },
  roleButtons: {
    display: 'flex',
    gap: '10px',
    marginBottom: '15px',
  },
  roleButton: {
    flex: 1,
    padding: '12px',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    color: 'white',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontWeight: '600',
  },  inputSection: {
    background: "rgba(255, 255, 255, 0.95)",
    padding: "25px",
    borderRadius: "15px",
    marginBottom: "20px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
  },
  select: {
    width: "100%",
    padding: "12px",
    marginBottom: "15px",
    border: "2px solid #e0e0e0",
    borderRadius: "10px",
    fontSize: "14px",
    transition: "all 0.3s ease",
    cursor: "pointer",
  },
  categoryButtons: {
    display: 'flex',
    gap: '10px',
    marginBottom: '15px',
  },
  categoryButton: {
    flex: 1,
    padding: '12px',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    color: 'white',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontWeight: '600',
  },
  input: {
    width: "100%",
    padding: "12px",
    marginBottom: "15px",
    border: "2px solid #e0e0e0",
    borderRadius: "10px",
    fontSize: "14px",
  },
  textarea: {
    width: "100%",
    padding: "12px",
    marginBottom: "15px",
    border: "2px solid #e0e0e0",
    borderRadius: "10px",
    fontSize: "14px",
    height: "100px",
    resize: "vertical",
  },
  button: {
    background: "linear-gradient(90deg, #4158D0, #C850C0)",
    color: "white",
    padding: "15px 25px",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    width: "100%",
    fontSize: "16px",
    fontWeight: "600",
    transition: "transform 0.3s ease",
  },
  collaborationFeed: {
    background: "rgba(255, 255, 255, 0.95)",
    padding: "25px",
    borderRadius: "15px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    maxHeight: "500px",
    overflowY: "auto",
  },
  list: {
    margin: "0",
    padding: "0",
    listStyle: "none",
  },
  listItem: {
    margin: "12px 0",
    padding: "15px",
    borderRadius: "12px",
    background: "linear-gradient(145deg, #ffffff, #f5f5f5)",
    boxShadow: "5px 5px 15px #d9d9d9, -5px -5px 15px #ffffff",
    transition: "all 0.3s ease",
    cursor: "pointer",
  },
  notificationContent: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "15px"
  },
  message: {
    margin: "0",
    fontSize: "14px",
    lineHeight: "1.6",
    color: "#2d3748",
    flex: 1,
    fontWeight: "500",
  },
  timestamp: {
    color: "#C850C0",
    fontSize: "12px",
    whiteSpace: "nowrap",
    fontWeight: "600",
  }
};
