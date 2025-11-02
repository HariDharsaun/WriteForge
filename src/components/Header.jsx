import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Header.css';

const FlameIcon = () => (
  <svg className="flame-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path
      d="M12 2C9.38 2 6.5 3.5 6.5 8.5C6.5 10.5 7.5 12.5 9 13.5C9 13.5 8 11.5 8 9.5C8 7.5 9 6 11 6C13 6 14 7.5 14 9.5C14 11.5 13 13.5 13 13.5C14.5 12.5 15.5 10.5 15.5 8.5C15.5 3.5 12.62 2 12 2Z"
      fill="url(#flame-gradient)"
    />
    <path
      d="M12 22C15.31 22 18 19.31 18 16C18 13.5 16.5 11.5 14.5 10.5C14.5 10.5 15.5 12.5 15.5 14.5C15.5 16.5 14.5 18 12.5 18C10.5 18 9.5 16.5 9.5 14.5C9.5 12.5 10.5 10.5 10.5 10.5C8.5 11.5 7 13.5 7 16C7 19.31 9.69 22 12 22Z"
      fill="url(#flame-gradient)"
    />
    <defs>
      <linearGradient id="flame-gradient" x1="7" y1="2" x2="18" y2="22" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FF7E5F" />
        <stop offset="1" stopColor="#FFB547" />
      </linearGradient>
    </defs>
  </svg>
);

export default function Header({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <header className="header animate-in">
      <div className="header-content">
        <Link to="/" className="logo-section"style={{ textDecoration: "none" }}>
          <h1>
            <FlameIcon />
            <span className="logo-text">Write<span className="gradient-text">Forge</span></span>
          </h1>
        </Link>

        {user && (
          <>
            <nav className="nav-links">
              <Link 
                to="/dashboard" 
                className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 2L14 5V11L8 14L2 11V5L8 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                </svg>
                Dashboard
              </Link>
              <Link 
                to="/generate" 
                className={`nav-link ${location.pathname === '/generate' ? 'active' : ''}`}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 1L10 6L15 8L10 10L8 15L6 10L1 8L6 6L8 1Z" fill="currentColor"/>
                </svg>
                Generate
              </Link>
            </nav>

            <div className="user-section">
              <div 
                className="credits-badge"
                onClick={() => navigate('/generate')}
              >
                <span className="credits-icon">✨</span>
                <span className="credits-amount">{user.credits}</span>
                <span className="credits-label">Credits</span>
              </div>

              <div 
                className="user-profile"
                onClick={() => navigate('/profile')}
                title="View Profile"
              >
                <div className="avatar">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="user-name">{user.name}</span>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
