import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Lock, Mail, AlertTriangle, ArrowRight, Code } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Basic Form Validation
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setSubmitting(true);
    try {
      await login({ email, password });
      navigate('/');
    } catch (err) {
      setError(err?.message || 'Invalid email or password. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: '350px', padding: '1.5rem 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '42px',
              height: '42px',
              borderRadius: '8px',
              backgroundColor: 'var(--primary)',
              color: 'white',
              marginBottom: '0.75rem',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <Code size={20} strokeWidth={3} />
          </div>
          <h1 style={{ fontSize: '1.35rem', margin: '0 0 0.25rem', fontWeight: 700 }}>Sign In</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.775rem' }}>
            Access Go-Epic Problems & Workspace
          </p>
        </div>

        {error && (
          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              padding: '0.625rem 0.875rem',
              backgroundColor: 'var(--danger-light)',
              color: 'var(--danger)',
              borderRadius: '4px',
              marginBottom: '1rem',
              fontSize: '0.75rem',
              alignItems: 'center'
            }}
          >
            <AlertTriangle size={14} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="email" style={{ fontSize: '0.725rem' }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={14}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-tertiary)'
                }}
              />
              <input
                id="email"
                type="email"
                className="form-input"
                style={{ paddingLeft: '2.4rem', height: '36px', fontSize: '0.8rem' }}
                placeholder="name@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="password" style={{ fontSize: '0.725rem' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={14}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-tertiary)'
                }}
              />
              <input
                id="password"
                type="password"
                className="form-input"
                style={{ paddingLeft: '2.4rem', height: '36px', fontSize: '0.8rem' }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '0 1rem', height: '36px', fontSize: '0.8rem', marginTop: '0.5rem' }}
            disabled={submitting}
          >
            {submitting ? 'Authenticating...' : 'Sign In'}
            {!submitting && <ArrowRight size={14} />}
          </button>
        </form>

        <div style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.775rem', color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--accent-blue)', fontWeight: 600, textDecoration: 'none' }}>
            Register here
          </Link>
        </div>

        <div style={{ marginTop: '1.25rem', padding: '0.75rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '6px', fontSize: '0.7rem' }}>
          <div style={{ fontWeight: 600, marginBottom: '0.25rem', color: 'var(--text-primary)' }}>Demo Credentials:</div>
          <div style={{ color: 'var(--text-secondary)' }}>Admin: <code style={{ fontSize: '10px', padding: '1px 3px', backgroundColor: 'var(--bg-secondary)', borderRadius: '2px', border: '1px solid var(--border-color)' }}>admin@gmail.com</code> / <code style={{ fontSize: '10px', padding: '1px 3px', backgroundColor: 'var(--bg-secondary)', borderRadius: '2px', border: '1px solid var(--border-color)' }}>password123</code></div>
          <div style={{ marginTop: '0.25rem', color: 'var(--text-secondary)' }}>User: <code style={{ fontSize: '10px', padding: '1px 3px', backgroundColor: 'var(--bg-secondary)', borderRadius: '2px', border: '1px solid var(--border-color)' }}>demo@gmail.com</code> / <code style={{ fontSize: '10px', padding: '1px 3px', backgroundColor: 'var(--bg-secondary)', borderRadius: '2px', border: '1px solid var(--border-color)' }}>password123</code></div>
        </div>
      </div>
    </div>
  );
};

export default Login;
