import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import './Generate.css';

// Icons
const BackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M10 19L1 10L10 1M1 10H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SaveIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M15.5 4H4.5C4.22386 4 4 4.22386 4 4.5V15.5C4 15.7761 4.22386 16 4.5 16H15.5C15.7761 16 16 15.7761 16 15.5V4.5C16 4.22386 15.7761 4 15.5 4Z" 
          stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M8 4V8H12V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const SparkIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M10 1L12.781 6.219L18 9L12.781 11.781L10 17L7.219 11.781L2 9L7.219 6.219L10 1Z" 
          fill="currentColor"/>
  </svg>
);

const CopyIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M8 2H16C17.1 2 18 2.9 18 4V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <rect x="2" y="6" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

const DownloadIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M10 2V13M10 13L6 9M10 13L14 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M2 14V16C2 17.1046 2.89543 18 4 18H16C17.1046 18 18 17.1046 18 16V14" 
          stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export default function Generate({ user, setUser }) {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('general');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  
  const goBack = () => {
    navigate('/dashboard');
  };

  async function generate(e) {
    e.preventDefault();
    
    // Validate input
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    // Reset state
    setError('');
    setLoading(true);
    setResult(null);

    try {
      // Call generation API
      const res = await api.generate({ 
        prompt, 
        category, 
        title,
        model: 'mixtral-8x7b-32768' // Use Mixtral model
      });

      // Handle success
      if (res.post) {
        setResult(res.post);
        // Update user credits
        if (res.creditsLeft !== undefined) {
          setUser(prev => ({...prev, credits: res.creditsLeft}));
        }
      } else {
        throw new Error('No content was generated');
      }
    } catch (err) {
      // Handle different error types
      let errorMessage = 'An error occurred while generating content';
      
      if (err.message.includes('timeout')) {
        errorMessage = 'The request took too long. Please try again.';
      } else if (err.message.includes('credits')) {
        errorMessage = 'Not enough credits. Please purchase more credits.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  function copyText() {
    if (!result) return;
    navigator.clipboard.writeText(result.body);
    alert('Copied');
  }

  function downloadMd() {
    if (!result) return;
    const blob = new Blob([`# ${result.title}\n\n${result.body}`], {type:'text/markdown'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = (result.title || 'post') + '.md'; a.click();
    URL.revokeObjectURL(url);
  }

  async function savePost() {
    if (!result) return;
    
    try {
      setSaving(true);
      // Call API to save the post
      const savedPost = await api.savePost({
        title: result.title,
        body: result.body,
        category: result.category,
        wordCount: result.wordCount
      });
      
      // Navigate back to dashboard after saving
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to save post: ' + (err.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="generator-container">
      <button 
    className="back-button"
    onClick={goBack}
    type="button"
  >
    <BackIcon />
    Back to Dashboard
  </button>
  
  <div className="generator-header">
        <h1 className="generator-title">Forge Powerful Content</h1>
        <p className="generator-subtitle">
          Transform your ideas into engaging content with AI-powered precision
        </p>
      </div>

      <form onSubmit={generate} className="input-container">
        <div className="form-group">
          <select 
            className="category-select"
            value={category} 
            onChange={e => setCategory(e.target.value)}
          >
            <option value="general">✍️ General Content</option>
            <option value="marketing">🎯 Marketing Copy</option>
            <option value="product">🛍️ Product Description</option>
            <option value="blog">📝 Blog Post</option>
            <option value="technical">⚙️ Technical Content</option>
            <option value="creative">🎨 Creative Writing</option>
            <option value="social">📱 Social Media Content</option>
          </select>
        </div>

        <div className="form-group">
          <input 
            className="prompt-textarea"
            style={{ minHeight: '50px' }}
            placeholder="Title (optional)"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
        </div>

        <div className="form-group">
          <textarea 
            className="prompt-textarea"
            rows="8"
            placeholder="What would you like to create? (e.g., Write a 400-word blog post about the future of remote work...)"
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
          />
        </div>

        <div className="actions-container">
          <button 
            className="action-button generate-button" 
            type="submit"
            disabled={loading}
          >
            <SparkIcon />
            {loading ? 'Creating...' : 'Generate Content'}
          </button>
          
          <div className="credits-display">
            {user.credits} credits remaining
          </div>
        </div>
      </form>

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      {loading && (
        <div className="loader">
          <div className="loader-animation" />
        </div>
      )}

      {result && (
        <div className="result-container">
          <h2 className="result-title">{result.title}</h2>
          <div className="result-meta">
            <span className="category-tag">{result.category}</span>
            <span className="word-count">{result.wordCount} words</span>
          </div>
          
          <div className="result-content">
            {result.body}
          </div>

          <div className="actions-container">
            <button 
              className="action-button secondary-button"
              onClick={copyText}
            >
              <CopyIcon />
              Copy Text
            </button>
            
            <button 
              className="action-button secondary-button"
              onClick={downloadMd}
            >
              <DownloadIcon />
              Download as Markdown
            </button>

            <button 
              className="action-button primary-button save-button"
              onClick={savePost}
              disabled={saving}
            >
              <SaveIcon />
              {saving ? 'Saving...' : 'Save Post'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
