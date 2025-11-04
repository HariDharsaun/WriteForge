import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import './Profile.css';


export default function Profile({ user, setUser }) {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingPost, setEditingPost] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editCategory, setEditCategory] = useState("");

  useEffect(() => {
    loadPosts();
  }, []);

  async function loadPosts() {
    try {
      setLoading(true);
      const userPosts = await api.getPosts();
      setPosts(userPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (err) {
      setError('Failed to load posts');
    } finally {
      setLoading(false);
    }
  }

  const handleEdit = (post) => {
    setEditingPost(post);
    setEditTitle(post.title);
    setEditCategory(post.category);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await api.updatePost(editingPost._id, {
        ...editingPost,
        title: editTitle,
        category: editCategory
      });
      setEditingPost(null);
      await loadPosts();
    } catch (err) {
      setError('Failed to update post: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (postId) => {
    try {
      if (window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
        setLoading(true);
        await api.deletePost(postId);
        await loadPosts();
      }
    } catch (err) {
      setError('Failed to delete post: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-info">
          <div className="avatar">
            {user.name ? user.name[0].toUpperCase() : '?'}
          </div>
          <div className="user-details">
            <h1 className="user-name">{user.name}</h1>
            <p className="user-email">{user.email}</p>
          </div>
        </div>
        <div className="profile-stats">
          <div className="stat-item">
            <span className="stat-value">{posts.length}</span>
            <span className="stat-label">Posts Created</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{user.credits}</span>
            <span className="stat-label">Credits Left</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">
              {posts.reduce((sum, post) => sum + (post.wordCount || 0), 0)}
            </span>
            <span className="stat-label">Total Words</span>
          </div>
        </div>
      </div>

      <div className="profile-content">
        <h2 className="section-title">Your Posts</h2>
        
        {loading ? (
          <div className="loader">
            <div className="loader-animation" />
          </div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : posts.length === 0 ? (
          <div className="empty-state">
            <h3>No Posts Yet</h3>
            <p>Start creating amazing content with AI</p>
            <button 
              className="primary-button"
              onClick={() => navigate('/generate')}
            >
              Create Your First Post
            </button>
          </div>
        ) : (
          <div className="posts-grid">
              {posts.map((post, index) => (
                <div key={post._id} className="post-card pointer" onClick={()=>{navigate(`/posts/${post.id}`)}} style={{ animationDelay: `${index * 0.1}s` }}>
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
                </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}