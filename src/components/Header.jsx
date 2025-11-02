import React from 'react';

export default function Header({ user }) {
  return (
    <header className="header animate-in">
      <div className="logo-section">
        <h1>✨ AI Content Generator</h1>
        <p className="small" style={{ color: 'rgba(255, 255, 255, 0.9)', marginTop: '-0.5rem' }}>
          Create amazing content with AI
        </p>
      </div>
      {user && (
        <div className="user-section flex">
          <div className="badge" style={{ background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)' }}>
            <span role="img" aria-label="credits">💎</span> {user.credits} Credits
          </div>
          <div className="flex" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
            <span role="img" aria-label="user">👋</span>
            <span>{user.name}</span>
          </div>
        </div>
      )}
    </header>
  );
}
