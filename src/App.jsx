import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Generate from './pages/Generate';
import Profile from './pages/Profile';
import PostView from './pages/PostView';
import Header from './components/Header';
import Footer from './components/Footer';
import api from './api';
import './styles/auth.css';
import './styles/loading.css';

function AppContent() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
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
      return;
    }

    try {
      setLoading(true);
      const response = await api.me();
      if (response && response.email) {
        setUser(response);
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
    setError('Session expired. Please login again.');
  }

  function onLogin(userData) {
    setUser(userData);
    setError(null);
  }

  function logout() {
    localStorage.removeItem('token');
    setUser(null);
    setError(null);
  }
  
  // Function to clear error and go to login
  function handleBackToLogin() {
    setError(null);
    navigate('/login');
  }

  return (
      <div className="app">
        <Header user={user} onLogout={logout} />
        
        {loading ? (
          <div className="loading">
            <div className="loading-spinner"></div>
            <p>Loading...</p>
          </div>
        ) : (
          <main className="main-content">
            <Routes>
                <Route 
                path="/login" 
                element={
                  user ? (
                    <Navigate to="/dashboard" replace />
                  ) : (
                    <Login 
                      onLogin={onLogin}
                      initialError={error}
                      clearError={() => setError(null)}
                      switchToRegister={() => navigate('/register')}
                    />
                  )
                } 
              />
              <Route 
                path="/register" 
                element={
                  user ? (
                    <Navigate to="/dashboard" replace />
                  ) : (
                    <Register 
                      onRegister={onLogin}
                      error={error}
                      setError={setError}
                    />
                  )
                } 
              />
              <Route 
                path="/dashboard" 
                element={
                  user ? (
                    <Dashboard user={user} setUser={setUser} />
                  ) : (
                    <Navigate to="/login" replace />
                  )
                } 
              />
              <Route 
                path="/generate" 
                element={
                  user ? (
                    <Generate user={user} setUser={setUser} />
                  ) : (
                    <Navigate to="/login" replace />
                  )
                } 
              />
              <Route 
                path="/profile" 
                element={
                  user ? (
                    <Profile user={user} setUser={setUser} />
                  ) : (
                    <Navigate to="/login" replace />
                  )
                } 
              />
              <Route 
                path="/posts/:id" 
                element={
                  user ? (
                    <PostView />
                  ) : (
                    <Navigate to="/login" replace />
                  )
                } 
              />
              <Route 
                path="/posts/:id/edit" 
                element={
                  user ? (
                    <Generate user={user} setUser={setUser} mode="edit" />
                  ) : (
                    <Navigate to="/login" replace />
                  )
                } 
              />
              <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
            </Routes>
          </main>
        )}
        
        <Footer />
      </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
