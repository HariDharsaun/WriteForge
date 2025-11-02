import React from 'react';

export default function PostCard({ post, onDelete, onEdit }) {
  return (
    <div className="post animate-in">
      <div className="row" style={{justifyContent: 'space-between', alignItems: 'flex-start'}}>
        <div style={{flex: 1}}>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            marginBottom: '0.5rem',
            color: 'var(--text)'
          }}>{post.title}</h3>
          <div className="flex" style={{marginBottom: '1rem'}}>
            <div className="badge">
              <span role="img" aria-label={post.category}>
                {getCategoryEmoji(post.category)}
              </span> {post.category}
            </div>
            <div className="small" style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
              <span role="img" aria-label="words">📝</span>
              {post.wordCount} words
            </div>
          </div>
        </div>
        <div className="row" style={{gap: '0.5rem'}}>
          <button className="button" onClick={() => onEdit(post)}>
            <span role="img" aria-label="edit">✏️</span> Edit
          </button>
          <button className="button danger" onClick={() => onDelete(post._id)}>
            <span role="img" aria-label="delete">🗑️</span> Delete
          </button>
        </div>
      </div>
      <div style={{
        color: 'var(--text-secondary)',
        lineHeight: '1.6',
        marginTop: '1rem',
        padding: '1rem',
        background: 'var(--background)',
        borderRadius: '0.5rem',
        fontSize: '0.875rem'
      }}>
        {post.body && post.body.slice(0, 300)}
        {post.body && post.body.length > 300 && (
          <span style={{color: 'var(--primary)', cursor: 'pointer'}}> ... Read more</span>
        )}
      </div>
    </div>
  );
}

function getCategoryEmoji(category) {
  const emojiMap = {
    'Article': '📰',
    'Blog Post': '✍️',
    'Social Media': '📱',
    'Email': '📧',
    'Marketing': '📢',
    'Technical': '💻',
    'Creative': '🎨'
  };
  return emojiMap[category] || '📝';
}
