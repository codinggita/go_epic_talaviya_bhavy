import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Lock, Mail, User, AlertTriangle, ArrowRight, Check, Code } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Basic Form Validation
    if (!name || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setSubmitting(true);
    try {
      await register({ name, email, password, role });
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err?.message || 'Failed to register. The email might be in use.');
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
          <h1 style={{ fontSize: '1.35rem', margin: '0 0 0.25rem', fontWeight: 700 }}>Create Account</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.775rem' }}>
            Register to join the Go-Epic workspace
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

        {success && (
          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              padding: '0.625rem 0.875rem',
              backgroundColor: 'var(--success-light)',
              color: 'var(--success)',
              borderRadius: '4px',
              marginBottom: '1rem',
              fontSize: '0.75rem',
              alignItems: 'center'
            }}
          >
            <Check size={14} style={{ flexShrink: 0 }} />
            <span>Success! Redirecting to login...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="name" style={{ fontSize: '0.725rem' }}>Full Name</label>
            <div style={{ position: 'relative' }}>
              <User
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
                id="name"
                type="text"
                className="form-input"
                style={{ paddingLeft: '2.4rem', height: '36px', fontSize: '0.8rem' }}
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

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

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="role" style={{ fontSize: '0.725rem' }}>Role Choice</label>
            <select
              id="role"
              className="form-input"
              style={{ height: '36px', fontSize: '0.8rem' }}
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="user">Standard Contributor (User)</option>
              <option value="admin">Platform Manager (Admin)</option>
            </select>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '0 1rem', height: '36px', fontSize: '0.8rem', marginTop: '0.5rem' }}
            disabled={submitting}
          >
            {submitting ? 'Creating Account...' : 'Sign Up'}
            {!submitting && <ArrowRight size={14} />}
          </button>
        </form>

        <div style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.775rem', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent-blue)', fontWeight: 600, textDecoration: 'none' }}>
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
