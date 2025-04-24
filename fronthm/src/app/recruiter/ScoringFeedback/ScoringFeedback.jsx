import { useState, useEffect } from 'react';

const questions = [
  {
    id: 1,
    text: 'Explain your experience with React.',
    criteria: ['Technical depth', 'Real-world examples', 'Best practices'],
    weightage: 0.4,
    category: 'Technical Skills'
  },
  {
    id: 2,
    text: 'How do you manage state in complex applications?',
    criteria: ['Architecture knowledge', 'State patterns', 'Performance considerations'],
    weightage: 0.3,
    category: 'System Design'
  },
  {
    id: 3,
    text: 'Describe a challenging bug you encountered and how you fixed it.',
    criteria: ['Problem-solving', 'Debugging approach', 'Solution implementation'],
    weightage: 0.3,
    category: 'Problem Solving'
  }
];

const InterviewFeedback = () => {
  const [scores, setScores] = useState({});
  const [activeTab, setActiveTab] = useState('evaluation');
  const [feedback, setFeedback] = useState({
    strengths: [],
    improvements: [],
    overallScore: 0,
    recommendation: ''
  });

  useEffect(() => {
    initializeScores();
  }, []);

  const initializeScores = () => {
    const initialScores = questions.reduce((acc, question) => {
      acc[question.id] = {
        criteriaScores: question.criteria.reduce((cAcc, criterion) => {
          cAcc[criterion] = 0;
          return cAcc;
        }, {}),
        notes: '',
        response: ''
      };
      return acc;
    }, {});
    setScores(initialScores);
  };

  const updateScore = (questionId, criterion, value) => {
    setScores(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        criteriaScores: {
          ...prev[questionId].criteriaScores,
          [criterion]: value
        }
      }
    }));
    calculateFeedback();
  };

  const calculateFeedback = () => {
    let totalScore = 0;
    const strengths = [];
    const improvements = [];

    questions.forEach(question => {
      const questionScores = Object.values(scores[question.id]?.criteriaScores || {});
      const avgScore = questionScores.reduce((a, b) => a + b, 0) / questionScores.length;
      totalScore += avgScore * question.weightage;

      if (avgScore >= 8) {
        strengths.push(`Strong ${question.category} capabilities demonstrated`);
      } else if (avgScore <= 5) {
        improvements.push(`Further development needed in ${question.category}`);
      }
    });

    setFeedback({
      strengths,
      improvements,
      overallScore: Math.round(totalScore * 10) / 10,
      recommendation: totalScore >= 7 ? 'Strongly Consider' : totalScore >= 5 ? 'Consider with Reservations' : 'Need Further Evaluation'
    });
  };

  return (
    <div className="evaluation-dashboard">
      <nav className="dashboard-nav">
        <button 
          className={`nav-tab ${activeTab === 'evaluation' ? 'active' : ''}`}
          onClick={() => setActiveTab('evaluation')}
        >
          Evaluation Matrix
        </button>
        <button 
          className={`nav-tab ${activeTab === 'feedback' ? 'active' : ''}`}
          onClick={() => setActiveTab('feedback')}
        >
          Feedback Summary
        </button>
      </nav>

      <div className="dashboard-header">
        <div className="score-badge">
          Overall Score: {feedback.overallScore}/10
        </div>
      </div>

      {activeTab === 'evaluation' ? (
        <div className="evaluation-grid">
          {questions.map(question => (
            <div key={question.id} className="evaluation-card">
              <div className="card-header">
                <h3>{question.category}</h3>
                <span className="weightage">Weightage: {question.weightage * 100}%</span>
              </div>
              
              <p className="question-text">{question.text}</p>
              
              <div className="criteria-list">
                {question.criteria.map(criterion => (
                  <div key={criterion} className="criteria-item">
                    <label>{criterion}</label>
                    <div className="score-control">
                      <input
                        type="range"
                        min="0"
                        max="10"
                        step="0.5"
                        value={scores[question.id]?.criteriaScores[criterion] || 0}
                        onChange={(e) => updateScore(question.id, criterion, parseFloat(e.target.value))}
                      />
                      <span className="score-value">
                        {scores[question.id]?.criteriaScores[criterion] || 0}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="feedback-panel">
          <div className="recommendation-box">
            <h2>Final Recommendation</h2>
            <div className={`recommendation-badge ${feedback.recommendation.toLowerCase().replace(/\s+/g, '-')}`}>
              {feedback.recommendation}
            </div>
          </div>

          <div className="feedback-grid">
            <div className="feedback-section strengths">
              <h3>Key Strengths</h3>
              <ul>
                {feedback.strengths.map((strength, idx) => (
                  <li key={idx}>{strength}</li>
                ))}
              </ul>
            </div>

            <div className="feedback-section improvements">
              <h3>Areas for Development</h3>
              <ul>
                {feedback.improvements.map((improvement, idx) => (
                  <li key={idx}>{improvement}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .evaluation-dashboard {
          max-width: 100%;
          margin: 0 auto;
         
         
          min-height: 100%;
        }

        .dashboard-nav {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          border-bottom: 2px solid #e2e8f0;
        }

        .nav-tab {
          padding: 1rem 2rem;
          border: none;
          background: none;
          font-size: 1.1rem;
          color: #64748b;
          cursor: pointer;
          position: relative;
        }

        .nav-tab.active {
          color: #0f172a;
          font-weight: 600;
        }

        .nav-tab.active::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          right: 0;
          height: 2px;
          background: #3b82f6;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .score-badge {
          background: #1e40af;
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
        }

        .evaluation-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 2rem;
        }

        .evaluation-card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .criteria-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .criteria-item {
          background: #f1f5f9;
          padding: 1rem;
          border-radius: 8px;
        }

        .score-control {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .feedback-panel {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          // box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
        }

        .recommendation-box {
          text-align: center;
          margin-bottom: 2rem;
        }

        .recommendation-badge {
          display: inline-block;
          padding: 1rem 2rem;
          border-radius: 8px;
          font-weight: 600;
          margin-top: 1rem;
        }

        .strongly-consider {
          background: #dcfce7;
          color: #166534;
        }

        .consider-with-reservations {
          background: #fef9c3;
          color: #854d0e;
        }

        .need-further-evaluation {
          background: #fee2e2;
          color: #991b1b;
        }

        .feedback-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
        }

        .feedback-section {
          background: #f8fafc;
          padding: 1.5rem;
          border-radius: 8px;
        }

        .feedback-section ul {
          margin-top: 1rem;
          padding-left: 1.5rem;
        }

        .feedback-section li {
          margin-bottom: 0.5rem;
          color: #334155;
        }
      `}</style>
    </div>
  );
};

export default InterviewFeedback;