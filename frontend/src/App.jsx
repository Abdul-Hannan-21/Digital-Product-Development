import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState } from 'react'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import MemoryTraining from './pages/MemoryTraining'
import Calendar from './pages/Calendar'
import Chatbot from './pages/Chatbot'
import Learn from './pages/Learn'
import Progress from './pages/Progress'
import './App.css'

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <main className="content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/training" element={<MemoryTraining />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/chatbot" element={<Chatbot />} />
            <Route path="/learn" element={<Learn />} />
            <Route path="/progress" element={<Progress />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App