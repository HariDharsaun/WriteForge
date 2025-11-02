import React, { useEffect, useState } from 'react';
import api from '../api';
import PostCard from '../components/PostCard';
import Header from '../components/Header';

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

  return (
    <div>
      <Header user={user} />
      <div className="container">
        <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
          <div>
            <h1 className="page-title">Your Content</h1>
            {posts.length > 0 && (
              <div className="flex" style={{ gap: '1rem', marginTop: '-0.5rem' }}>
                <div className="badge">
                  <span role="img" aria-label="posts">📚</span> {stats.total} Posts
                </div>
                <div className="badge">
                  <span role="img" aria-label="words">📝</span> {stats.words} Words
                </div>
              </div>
            )}
          </div>
          <button className="button success" onClick={goGenerate}>
            <span role="img" aria-label="generate">✨</span> Generate New Content
          </button>
        </div>

        {loading ? (
          <div className="loading">Loading your content...</div>
        ) : (
          <div>
            {posts.length === 0 ? (
              <div className="post" style={{ 
                textAlign: 'center', 
                padding: '3rem',
                background: 'linear-gradient(to right, var(--primary-light), var(--secondary))',
                color: 'white'
              }}>
                <span role="img" aria-label="welcome" style={{ fontSize: '3rem' }}>✨</span>
                <h2 style={{ color: 'white', marginTop: '1rem' }}>Welcome to AI Content Generator!</h2>
                <p style={{ marginBottom: '1.5rem', opacity: 0.9 }}>
                  Start creating amazing content with the power of AI
                </p>
                <button className="button" 
                  onClick={goGenerate}
                  style={{ 
                    background: 'white',
                    color: 'var(--primary)',
                    padding: '0.75rem 2rem'
                  }}>
                  <span role="img" aria-label="create">🚀</span> Create Your First Post
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '1rem' }}>
                {posts.map(p => (
                  <PostCard key={p._id} post={p} onDelete={del} onEdit={edit} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
