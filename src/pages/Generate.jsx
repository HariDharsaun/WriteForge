import React, { useState } from 'react';
import api from '../api';

export default function Generate({ user, setUser, goBack }) {
  const [prompt, setPrompt] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('general');
  const [loading,setLoading]=useState(false);
  const [result, setResult] = useState(null);
  const [error,setError] = useState('');

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

  return (
    <div>
      <button className="button" onClick={goBack} style={{background:'#6b7280'}}>Back</button>
      <h3>Generate</h3>
      <form onSubmit={generate}>
        <input className="input" placeholder="Title (optional)" value={title} onChange={e=>setTitle(e.target.value)} />
        <select className="input" value={category} onChange={e=>setCategory(e.target.value)}>
          <option value="general">General Content</option>
          <option value="marketing">Marketing Copy</option>
          <option value="product">Product Description</option>
          <option value="blog">Blog Post</option>
          <option value="technical">Technical Content</option>
          <option value="creative">Creative Writing</option>
          <option value="social">Social Media Content</option>
        </select>
        <textarea className="input" rows="8" placeholder="Write prompt... (e.g. Write a 400-word blog about remote work...)" value={prompt} onChange={e=>setPrompt(e.target.value)} />
        <div className="row">
          <button className="button" type="submit">Generate</button>
          <div className="small">Credits: {user.credits}</div>
        </div>
      </form>

      {loading && <div className="small">Generating... (this may take a few seconds)</div>}
      {error && <div className="small" style={{color:'red'}}>{error}</div>}

      {result && (
        <div style={{marginTop:12}}>
          <div className="post">
            <strong>{result.title}</strong>
            <div className="small">{result.category} • {result.wordCount} words</div>
            <div style={{marginTop:8, whiteSpace:'pre-wrap'}}>{result.body}</div>
            <div className="row" style={{marginTop:8}}>
              <button className="button" onClick={copyText}>Copy</button>
              <button className="button" onClick={downloadMd}>Download .md</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
