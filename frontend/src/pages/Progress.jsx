import React, { useEffect, useState } from 'react';
import './Pages.css';

function Progress() {
  // For demo, use a static patient_id. In a real app, this would come from context or route params.
  const patientId = 1;
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || ''}/caregiver/progress/summary/${patientId}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch progress summary');
        return res.json();
      })
      .then(data => {
        setSummary(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [patientId]);

  return (
    <div className="page-container">
      <h1 className="page-title">Caregiver Progress Report</h1>
      <div className="card">
        <h2>Weekly Progress Overview</h2>
        <p>
          Here is a summary of your loved one's memory training and activities for the past week. Remember, every effort counts and encouragement goes a long way!
        </p>
      </div>
      {loading && <div>Loading progress summary...</div>}
      {error && <div style={{color: 'red'}}>Error: {error}</div>}
      {summary && (
        <div className="features-grid">
          <div className="feature-card">
            <h3>Games Completed</h3>
            <p>{summary.games_completed} memory exercises completed this week.</p>
          </div>
          <div className="feature-card">
            <h3>Average Game Score</h3>
            <p>{summary.average_game_score} points on average. Great effort!</p>
          </div>
          <div className="feature-card">
            <h3>Missed Calendar Events</h3>
            <p>{summary.missed_events} scheduled activities were missed. That's okay—next week is a new opportunity!</p>
          </div>
        </div>
      )}
      {summary && (
        <div className="card" style={{marginTop: '2rem', background: '#f6fff6'}}>
          <h2 style={{color: '#2e7d32'}}>{summary.message}</h2>
          <p style={{fontSize: '1.1rem'}}>Keep supporting and celebrating every achievement, no matter how small. You're doing a wonderful job!</p>
        </div>
      )}
    </div>
  );
}

export default Progress;