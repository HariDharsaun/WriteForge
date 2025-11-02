import React, { useEffect, useState } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Generate from './pages/Generate';
import api from './api';
import './styles/auth.css';
import './styles/loading.css';

function App() {
  const [user, setUser] = useState(null);
  const [route, setRoute] = useState('login');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Function to check authentication status
  async function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      setRoute('login');
      return;
    }

    try {
      setLoading(true);
      const response = await api.me();
      if (response && response.email) {
        setUser(response);
        setRoute('dashboard');
        setError(null);
      } else {
        handleAuthError();
      }
    } catch (err) {
      handleAuthError(err);
    } finally {
      setLoading(false);
    }
  }

  // Handle authentication errors
  function handleAuthError(err) {
    console.error('Auth check failed:', err);
    localStorage.removeItem('token');
    setUser(null);
    setRoute('login');
    setError('Session expired. Please login again.');
  }

  function onLogin(userData) {
    setUser(userData);
    setRoute('dashboard');
    setError(null);
  }

  function logout() {
    localStorage.removeItem('token');
    setUser(null);
    setRoute('login');
    setError(null);
  }
  
  // Function to clear error and go to login
  function handleBackToLogin() {
    setError(null);
    setRoute('login');
  }

  return (
    <div className="container">
      <div className="header">
        <h2>✨ AI Content Generator</h2>
        <div className="flex">
          {user && (
            <>
              <div className="small">
                Credits: <span className="badge">{user.credits}</span>
              </div>
              <button className="button" onClick={logout}>
                <span role="img" aria-label="logout">🚪</span> Logout
              </button>
            </>
          )}
        </div>
      </div>

      {loading ? (
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      ) : (
        <>
          {!user && route === 'login' && (
            <Login 
              onLogin={onLogin} 
              switchToRegister={() => setRoute('register')}
              initialError={error}
              clearError={() => setError(null)}
            />
          )}
          {!user && route === 'register' && (
            <Register 
              switchToLogin={() => setRoute('login')} 
              onRegister={onLogin}
              error={error}
              setError={setError}
            />
          )}
          {user && route === 'dashboard' && (
            <Dashboard 
              user={user} 
              setUser={setUser} 
              goGenerate={() => setRoute('generate')}
            />
          )}
          {user && route === 'generate' && (
            <Generate 
              user={user} 
              setUser={setUser} 
              goBack={() => setRoute('dashboard')}
            />
          )}
        </>
      )}
    </div>
  );
}

export default App;
