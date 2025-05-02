import React from 'react'
import './Pages.css'

function Home() {
  return (
    <div className="page-container">
      <h1 className="page-title">Welcome to MemoryTrain</h1>
      
      <div className="card">
        <h2>Improve Your Memory Skills</h2>
        <p>
          MemoryTrain is a comprehensive platform designed to help you enhance your memory 
          through scientifically-backed exercises, scheduled training, and educational resources.
        </p>
      </div>
      
      <div className="features-grid">
        <div className="feature-card">
          <h3>Memory Training</h3>
          <p>Interactive exercises designed to strengthen different aspects of your memory.</p>
          <button onClick={() => window.location.href = '/training'}>Start Training</button>
        </div>
        
        <div className="feature-card">
          <h3>Training Calendar</h3>
          <p>Schedule your memory training sessions to maintain consistency.</p>
          <button onClick={() => window.location.href = '/calendar'}>View Calendar</button>
        </div>
        
        <div className="feature-card">
          <h3>AI Chatbot</h3>
          <p>Get personalized memory improvement tips from our AI assistant.</p>
          <button onClick={() => window.location.href = '/chatbot'}>Chat Now</button>
        </div>
        
        <div className="feature-card">
          <h3>Learning Resources</h3>
          <p>Educational content about memory techniques and brain health.</p>
          <button onClick={() => window.location.href = '/learn'}>Learn More</button>
        </div>
        
        <div className="feature-card">
          <h3>Progress Tracking</h3>
          <p>Monitor your memory improvement over time with detailed analytics.</p>
          <button onClick={() => window.location.href = '/progress'}>Track Progress</button>
        </div>
      </div>
    </div>
  )
}

export default Home