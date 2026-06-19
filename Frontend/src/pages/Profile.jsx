import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { User, Lock, Mail, ShieldAlert, CheckCircle, AlertTriangle } from 'lucide-react';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  
  const [name, setName] = useState(user?.name || '');
  const [email] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [updating, setUpdating] = useState(false);
  const [status, setStatus] = useState(null); // null, success, error
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);
    setMessage('');

    if (!name.trim()) {
      setStatus('error');
      setMessage('Name cannot be empty.');
      return;
    }

    if (password && password !== confirmPassword) {
      setStatus('error');
      setMessage('New passwords do not match.');
      return;
    }

    setUpdating(true);
    try {
      const payload = { name };
      if (password) {
        payload.password = password;
      }
      
      await updateProfile(payload);
      
      setStatus('success');
      setMessage('Profile updated successfully!');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      setStatus('error');
      setMessage(err?.message || 'Failed to update profile.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '550px' }}>
      
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <h3 style={{ fontSize: '1.05rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', margin: 0, fontWeight: 700 }}>
          Account Settings
        </h3>

        {message && (
          <div 
            style={{ 
              display: 'flex', 
              gap: '0.5rem', 
              padding: '0.625rem 0.875rem', 
              backgroundColor: status === 'success' ? 'var(--success-light)' : 'var(--danger-light)', 
              color: status === 'success' ? 'var(--success)' : 'var(--danger)', 
              borderRadius: '4px', 
              fontSize: '0.8rem',
              alignItems: 'center'
            }}
          >
            {status === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
            <span>{message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address (Read Only)</label>
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
                style={{ paddingLeft: '2.4rem', backgroundColor: 'var(--bg-tertiary)', cursor: 'not-allowed', height: '36px', fontSize: '0.8rem' }}
                value={email}
                disabled
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="role">Platform Permission Role</label>
            <div style={{ position: 'relative' }}>
              <ShieldAlert 
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
                id="role"
                type="text"
                className="form-input"
                style={{ paddingLeft: '2.4rem', backgroundColor: 'var(--bg-tertiary)', cursor: 'not-allowed', textTransform: 'capitalize', height: '36px', fontSize: '0.8rem' }}
                value={user?.role || 'User'}
                disabled
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="name">Full Display Name</label>
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
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', margin: '0.5rem 0', paddingTop: '0.75rem' }}>
            <h4 style={{ fontSize: '0.85rem', marginBottom: '0.75rem', fontWeight: 600 }}>Change Password (Optional)</h4>
            
            <div className="form-group">
              <label className="form-label" htmlFor="password">New Password</label>
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
                  placeholder="Leave blank to keep current password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
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
                  id="confirmPassword"
                  type="password"
                  className="form-input"
                  style={{ paddingLeft: '2.4rem', height: '36px', fontSize: '0.8rem' }}
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-sm" 
            style={{ alignSelf: 'flex-start', marginTop: '0.5rem', height: '36px', padding: '0 1rem' }}
            disabled={updating}
          >
            {updating ? 'Saving Profile...' : 'Save Settings'}
          </button>

        </form>
      </div>

    </div>
  );
};

export default Profile;
