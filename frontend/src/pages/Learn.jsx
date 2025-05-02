import React, { useEffect, useState } from 'react';
import './Pages.css';

function Learn() {
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || ''}/caregiver/learn/tips/`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch tips');
        return res.json();
      })
      .then(data => {
        setTips(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div className="page-container">
      <h1 className="page-title">Caregiver Education</h1>
      <div className="card">
        <h2>Helpful Tips for Caregivers</h2>
        <p>
          Explore these educational tips to support your loved one. Remember, small steps and encouragement make a big difference!
        </p>
      </div>
      {loading && <div>Loading tips...</div>}
      {error && <div style={{color: 'red'}}>Error: {error}</div>}
      <div className="features-grid">
        {tips.map((tip, idx) => (
          <div key={idx} className="feature-card resource-card">
            <h3>{tip.title}</h3>
            <p>{tip.text}</p>
            {tip.source_url && (
              <a href={tip.source_url} target="_blank" rel="noopener noreferrer" className="source-link">Learn more</a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Learn;