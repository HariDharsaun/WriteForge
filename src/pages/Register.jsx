import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import '../styles/auth.css';

export default function Register({ onRegister }) {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validateInputs = () => {
    if (!name || !email || !password) {
      setError('All fields are required');
      return false;
    }

    if (name.length < 2) {
      setError('Name must be at least 2 characters long');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }

    return true;
  };

  async function submit(e) {
    e.preventDefault();
    setError('');
    
    if (!validateInputs()) {
      return;
    }

    try {
      setLoading(true);
      const res = await api.register({ name, email, password });
      
      if (res.token) {
        localStorage.setItem('token', res.token);
        if (res.user) {
          localStorage.setItem('user', JSON.stringify(res.user));
        }
        onRegister(res.user);
      } else {
        setError('Registration failed - invalid server response');
      }
    } catch (err) {
      console.error('Registration error:', err);
      if (err.message.includes('already exists')) {
        setError('An account with this email already exists. Please try logging in.');
      } else if (err.message.includes('internet connection')) {
        setError('Unable to connect to the server. Please check your internet connection.');
      } else if (err.message.includes('required fields')) {
        setError('Please fill in all required fields.');
      } else {
        setError(err.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Create Account</h2>
        <p className="auth-subtitle">Join WriteForge and start creating amazing content</p>
        
        <form className="auth-form" onSubmit={submit}>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              type="text"
              className="input"
              placeholder="Enter your full name"
              value={name}
              onChange={e => setName(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              className="input"
              placeholder="Enter your email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="input"
              placeholder="Create a password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="auth-actions">
            <button 
              type="submit" 
              className="primary-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  <span className="loading-text">Creating Account...</span>
                </>
              ) : (
                'Create Account'
              )}
            </button>

            <button
              type="button"
              className="secondary-button"
              onClick={() => navigate('/login')}
              disabled={loading}
            >
              Already have an account? Log in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
