import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Wallet, LogIn, Sparkles, CheckCircle2, UserPlus } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [savedEmailNotice, setSavedEmailNotice] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem('lastRegisteredEmail');
    if (saved) {
      setEmail(saved);
      setSavedEmailNotice(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await login('demo@example.com', 'password123');
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      background: 'radial-gradient(circle at top right, rgba(99, 102, 241, 0.12), transparent 40%), radial-gradient(circle at bottom left, rgba(16, 185, 129, 0.08), transparent 40%)'
    }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '440px', padding: '2.5rem' }}>
        
        {/* Navigation Tabs */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.5rem',
          background: 'rgba(255, 255, 255, 0.04)',
          padding: '4px',
          borderRadius: '12px',
          marginBottom: '2rem',
          border: '1px solid var(--border-color)'
        }}>
          <button
            style={{
              padding: '0.6rem',
              borderRadius: '8px',
              border: 'none',
              background: 'var(--primary)',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              cursor: 'pointer'
            }}
          >
            <LogIn size={15} />
            <span>Sign In</span>
          </button>
          <button
            onClick={() => navigate('/register')}
            style={{
              padding: '0.6rem',
              borderRadius: '8px',
              border: 'none',
              background: 'transparent',
              color: 'var(--text-muted)',
              fontWeight: 600,
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              cursor: 'pointer'
            }}
          >
            <UserPlus size={15} />
            <span>Register</span>
          </button>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            display: 'inline-flex',
            background: 'linear-gradient(135deg, #6366f1, #4338ca)',
            padding: '0.8rem',
            borderRadius: '16px',
            boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)',
            marginBottom: '0.75rem'
          }}>
            <Wallet size={32} color="#fff" />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Welcome Back</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
            Sign in with your registered account to continue
          </p>
        </div>

        {savedEmailNotice && (
          <div style={{
            padding: '0.65rem 0.85rem',
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '10px',
            color: '#34d399',
            fontSize: '0.82rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <CheckCircle2 size={16} />
            <span>Pre-filled registered email: <strong>{email}</strong></span>
          </div>
        )}

        {error && (
          <div style={{
            padding: '0.75rem',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            color: '#f87171',
            fontSize: '0.85rem',
            marginBottom: '1.25rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-control"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '1rem', padding: '0.8rem', fontSize: '0.95rem' }}
            disabled={loading}
          >
            <LogIn size={18} />
            <span>{loading ? 'Signing in...' : 'Sign In to Account'}</span>
          </button>
        </form>

        <div style={{ margin: '1.5rem 0 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>OR</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
        </div>

        {/* 1-Click Demo Login Button */}
        <button
          type="button"
          onClick={handleDemoLogin}
          disabled={loading}
          style={{
            width: '100%',
            padding: '0.75rem',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            background: 'rgba(255, 255, 255, 0.05)',
            color: 'var(--text-main)',
            fontSize: '0.88rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            cursor: 'pointer'
          }}
        >
          <Sparkles size={16} color="#f59e0b" />
          <span>Quick Demo Login (1-Click)</span>
        </button>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Don't have an account yet?{' '}
          <Link to="/register" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
            Register Now
          </Link>
        </div>
      </div>
    </div>
  );
}
