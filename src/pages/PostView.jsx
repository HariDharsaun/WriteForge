import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';
import './PostView.css';

// Icons
const BackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M10 19L1 10L10 1M1 10H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M11.5 2.5L13.5 4.5M12.5 3.5L9 7M3 13H5L12 6L10 4L3 11V13Z" 
          stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const DeleteIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M3 4h10M7 7v4M9 7v4M4 4l.667 8.006C4.713 12.557 5.205 13 5.76 13h4.48c.555 0 1.047-.443 1.093-.994L12 4" 
          stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6 4V3h4v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function PostView() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPost();
  }, [id]);

  async function loadPost() {
    try {
      setLoading(true);
      const post = await api.getPost(id);
      setPost(post);
    } catch (err) {
      setError('Failed to load post');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    
    try {
      await api.deletePost(id);
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to delete post');
    }
  }

  if (loading) {
    return (
      <div className="loader">
        <div className="loader-animation" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">{error}</div>
        <button 
          className="secondary-button"
          onClick={() => navigate(-1)}
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!post) return null;

  return (
    <div className="post-view">
      <div className="post-nav">
        <button 
          className="back-button"
          onClick={() => navigate(-1)}
        >
          <BackIcon />
          Back
        </button>
      </div>

      <article className="post-content">
        <header className="post-header">
          <h1 className="post-title">{post.title}</h1>
          <div className="post-meta">
            <span className="category-badge">{post.category}</span>
            <span className="word-count">{post.wordCount} words</span>
            <span className="date">
              {new Date(post.createdAt).toLocaleDateString()}
            </span>
          </div>
        </header>

        <div className="post-body">
          {post.body}
        </div>
      </article>
    </div>
  );
}