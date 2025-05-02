import { Link, useLocation } from 'react-router-dom'
import './Navbar.css'

function Navbar() {
  const location = useLocation()

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          MemoryTrain
        </Link>
        <ul className="nav-menu">
          <li className="nav-item">
            <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
              Home
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/training" className={`nav-link ${location.pathname === '/training' ? 'active' : ''}`}>
              Memory Training
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/calendar" className={`nav-link ${location.pathname === '/calendar' ? 'active' : ''}`}>
              Calendar
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/chatbot" className={`nav-link ${location.pathname === '/chatbot' ? 'active' : ''}`}>
              Chatbot
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/learn" className={`nav-link ${location.pathname === '/learn' ? 'active' : ''}`}>
              Learn
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/progress" className={`nav-link ${location.pathname === '/progress' ? 'active' : ''}`}>
              Progress
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  )
}

export default Navbar