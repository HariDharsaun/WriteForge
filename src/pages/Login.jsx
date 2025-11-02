import React, { useState, useEffect } from 'react';
import api from '../api';

export default function Login({ onLogin, switchToRegister, initialError, clearError }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(initialError);

  // Handle initial error from parent component
  useEffect(() => {
    setError(initialError);
  }, [initialError]);

  // Clear error when component unmounts
  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  // Basic email validation
  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  async function submit(e) {
    e.preventDefault();
    
    // Clear any previous errors
    setError('');

    // Validate inputs
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setLoading(true);
      const res = await api.login({ 
        email: email.trim(), 
        password: password.trim() 
      });

      if (res.token) {
        localStorage.setItem('token', res.token);
        onLogin(res.user);
      } else {
        setError('Login failed: ' + (res.error || 'Unknown error'));
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-form">
      <h2>Welcome Back! 👋</h2>
      <p className="auth-subtitle">Log in to continue generating amazing content</p>

      <form onSubmit={submit}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            className="input"
            placeholder="Enter your email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            disabled={loading}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            className="input"
            placeholder="Enter your password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            disabled={loading}
            required
            minLength={6}
          />
        </div>

        {error && (
          <div className="error-message" role="alert">
            {error}
          </div>
        )}

        <div className="auth-actions">
          <button 
            className="button" 
            type="submit" 
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
          
          <button 
            type="button" 
            className="button secondary" 
            onClick={switchToRegister} 
            disabled={loading}
          >
            Create Account
          </button>
        </div>
      </form>
    </div>
  );
}
