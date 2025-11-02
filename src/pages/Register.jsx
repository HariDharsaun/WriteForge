import React, { useState } from 'react';
import api from '../api';

export default function Register({ switchToLogin, onRegister }) {
  const [name,setName]=useState('');
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [err,setErr]=useState('');

  async function submit(e){
    e.preventDefault();
    const res = await api.register({ name, email, password });
    if (res.token) {
      localStorage.setItem('token', res.token);
      onRegister(res.user);
    } else setErr(res.error || 'Register failed');
  }

  return (
    <div>
      <h3>Register</h3>
      <form onSubmit={submit}>
        <input className="input" placeholder="Name" value={name} onChange={e=>setName(e.target.value)} />
        <input className="input" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="input" type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
        <div className="row">
          <button className="button" type="submit">Register</button>
          <button type="button" className="button" onClick={switchToLogin} style={{background:'#f59e0b'}}>Back to Login</button>
        </div>
        {err && <div className="small" style={{color:'red'}}>{err}</div>}
      </form>
    </div>
  );
}
