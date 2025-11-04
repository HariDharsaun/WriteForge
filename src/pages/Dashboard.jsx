import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import PostCard from '../components/PostCard';
import './Dashboard.css';

// Icons
const ChartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M2 16H18M5 8V13M10 4V13M15 6V13" 
          stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const WordsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M4 5h12M4 9h12M4 13h8" 
          stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
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

export default function Dashboard({ user, setUser, goGenerate }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ total: 0, words: 0 });

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    // Calculate stats when posts change
    const total = posts.length;
    const words = posts.reduce((acc, post) => acc + (post.wordCount || 0), 0);
    setStats({ total, words });
  }, [posts]);

  async function load() {
    setLoading(true);
    const res = await api.getPosts();
    setPosts(res || []);
    setLoading(false);
    // refresh credits
    const me = await api.me();
    if (me && me.email) setUser(me);
  }

  async function del(id) {
    if (!confirm('Are you sure you want to delete this post?')) return;
    await api.deletePost(id);
    load();
  }

  function edit(post) {
    const newTitle = prompt('Enter new title', post.title);
    if (newTitle === null) return;
    api.updatePost(post._id, { ...post, title: newTitle }).then(() => load());
  }

  const navigate = useNavigate();
  
  const goToGenerate = () => {
    navigate('/generate');
  };

  return (
    <div className="dashboard">
      
      <div className="dashboard-header">
        <h1 className="dashboard-title">
          Your Creative <span>Workspace</span>
        </h1>
        <p className="dashboard-subtitle">
          Manage and refine your AI-generated content collection
        </p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Posts</div>
          <div className="stat-value">{stats.total}</div>
          <div className="stat-trend trend-up">
            <ChartIcon />
            <span>Active Collection</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Total Words</div>
          <div className="stat-value">{stats.words}</div>
          <div className="stat-trend">
            <WordsIcon />
            <span>Words Generated</span>
          </div>
        </div>

        <div className="stat-card" onClick={goToGenerate} style={{ cursor: 'pointer' }}>
          <div className="stat-label">Credits Available</div>
          <div className="stat-value">{user.credits}</div>
          <div className="stat-trend trend-up">
            <span>✨</span>
            <span>Ready to Generate</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loader">
          <div className="loader-animation" />
        </div>
      ) : (
        <>
          {posts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">✨</div>
              <h2 className="empty-title">Start Creating Amazing Content</h2>
              <p className="empty-description">
                Use AI to generate high-quality content for your blog, marketing, or creative projects
              </p>
              <button className="action-button generate-button" onClick={goToGenerate}>
                Create Your First Post
              </button>
            </div>
          ) : (
            <div className="posts-grid">
              {posts.map((post, index) => (
                <div key={post._id} className="post-card" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="post-header">
                    <h3 className="post-title">{post.title}</h3>
                    <div className="post-meta">
                      <span className="category-badge">{post.category}</span>
                      <span className="word-count">{post.wordCount} words</span>
                    </div>
                  </div>
                  
                  <div className="post-preview">
                    {post.body}
                  </div>
                  
                  <div className="post-actions">
                    <button className="action-button edit-button" onClick={() => edit(post)}>
                      <EditIcon />
                      Edit
                    </button>
                    <button className="action-button delete-button" onClick={() => del(post._id)}>
                      <DeleteIcon />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
