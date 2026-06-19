import React, { useState, useEffect, useRef } from 'react';
import { Menu, Wifi, WifiOff, Bell, Search, Sun, Moon, User, Shield, LogOut, Code } from 'lucide-react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import apiClient from '../services/api/apiClient';
import { useAuth } from '../hooks/useAuth';

const Navbar = ({ toggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();
  const [healthStatus, setHealthStatus] = useState('checking'); // checking, online, offline
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await apiClient.get('/health');
        if (res.data?.success || res.status === 200) {
          setHealthStatus('online');
        } else {
          setHealthStatus('offline');
        }
      } catch (err) {
        setHealthStatus('offline');
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000); // check health every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Handle outside clicks to close profile dropdown
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    if (path.startsWith('/problems')) return 'Problems Directory';
    if (path.startsWith('/solutions')) return 'Solutions Explorer';
    if (path.startsWith('/topics')) return 'Topics & Languages';
    if (path.startsWith('/datasets')) return 'Dataset Management';
    if (path === '/profile') return 'Profile Settings';
    if (path === '/admin/users') return 'Admin User Manager';
    return 'Go-Epic';
  };

  const activeClass = (path) => {
    if (path === '/') {
      return location.pathname === '/' ? 'navbar-link active' : 'navbar-link';
    }
    return location.pathname.startsWith(path) ? 'navbar-link active' : 'navbar-link';
  };

  return (
    <header className="navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', height: '100%' }}>
        {/* Toggle Sidebar (Mobile only) */}
        <button
          onClick={toggleSidebar}
          className="theme-switch-btn"
          style={{ display: 'none' }}
          id="sidebar-mobile-toggle"
        >
          <Menu size={18} />
        </button>

        {/* Brand logo */}
        <Link to="/" className="navbar-brand">
          <div className="navbar-logo-icon">
            <Code size={14} strokeWidth={3} />
          </div>
          <span style={{ fontWeight: 700, letterSpacing: '-0.02em' }}>Go-Epic</span>
        </Link>

        {/* Horizontal Navigation Menu (LeetCode Style) */}
        <nav className="navbar-links" id="desktop-nav-links">
          <Link to="/" className={activeClass('/')}>Dashboard</Link>
          <Link to="/problems" className={activeClass('/problems')}>Problems</Link>
          <Link to="/solutions" className={activeClass('/solutions')}>Solutions</Link>
          <Link to="/topics" className={activeClass('/topics')}>Topics</Link>
          <Link to="/datasets" className={activeClass('/datasets')}>Datasets</Link>
        </nav>
      </div>

      <div className="navbar-actions">
        {/* Health status monitor indicator */}
        <div
          title={healthStatus === 'online' ? 'API connected' : healthStatus === 'offline' ? 'API offline' : 'Checking connection...'}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.25rem 0.625rem',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 500,
            backgroundColor: healthStatus === 'online'
              ? 'var(--success-light)'
              : healthStatus === 'offline'
                ? 'var(--danger-light)'
                : 'var(--bg-tertiary)',
            color: healthStatus === 'online'
              ? 'var(--success)'
              : healthStatus === 'offline'
                ? 'var(--danger)'
                : 'var(--text-secondary)',
            transition: 'all 0.2s ease'
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: healthStatus === 'online' ? 'var(--success)' : healthStatus === 'offline' ? 'var(--danger)' : 'var(--text-tertiary)',
              display: 'inline-block',
              animation: healthStatus === 'checking' ? 'pulse 1s infinite' : 'none'
            }}
          />
          <span style={{ display: 'inline', fontSize: '0.725rem', fontWeight: 600 }}>
            {healthStatus === 'online' ? 'API Connected' : healthStatus === 'offline' ? 'Disconnected' : 'Checking...'}
          </span>
        </div>

        {/* Theme switcher */}
        <button
          onClick={toggleTheme}
          className="theme-switch-btn"
          aria-label="Toggle dark mode"
          title="Toggle Light/Dark Theme"
        >
          {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
        </button>

        {/* Profile Avatar & Dropdown Menu */}
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary)',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            {user?.name?.substring(0, 2) || 'US'}
          </button>

          {profileOpen && (
            <div className="dropdown-menu">
              <div style={{ padding: '0.5rem 1rem', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{ fontWeight: 600, fontSize: '0.825rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.name}
                </div>
                <div style={{ fontSize: '0.725rem', color: 'var(--text-tertiary)', textTransform: 'capitalize' }}>
                  {user?.role}
                </div>
              </div>

              <Link to="/profile" className="dropdown-item" onClick={() => setProfileOpen(false)}>
                <User size={14} />
                <span>My Profile</span>
              </Link>

              {isAdmin() && (
                <Link to="/admin/users" className="dropdown-item" onClick={() => setProfileOpen(false)}>
                  <Shield size={14} />
                  <span>Admin Panel</span>
                </Link>
              )}

              <div style={{ borderTop: '1px solid var(--border-color)', margin: '0.25rem 0' }} />

              <button
                onClick={() => {
                  setProfileOpen(false);
                  logout();
                }}
                className="dropdown-item"
                style={{ width: '100%', color: 'var(--danger)' }}
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Inline styles for responsive header items */}
      <style>{`
        @media (max-width: 768px) {
          #sidebar-mobile-toggle {
            display: flex !important;
          }
          #desktop-nav-links {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
};

export default Navbar;
