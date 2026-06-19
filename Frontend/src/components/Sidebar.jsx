import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Code2, 
  CheckSquare, 
  BookOpen, 
  Database, 
  User, 
  LogOut,
  Shield,
  Code
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user, logout, isAdmin } = useAuth();

  const handleNavClick = () => {
    if (window.innerWidth <= 768) {
      toggleSidebar();
    }
  };

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/problems', label: 'Problems', icon: Code2 },
    { path: '/solutions', label: 'Solutions', icon: CheckSquare },
    { path: '/topics', label: 'Topics', icon: BookOpen },
    { path: '/datasets', label: 'Datasets', icon: Database },
    { path: '/profile', label: 'My Profile', icon: User },
  ];

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={handleNavClick}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              end={item.path === '/'}
            >
              <Icon size={16} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}

        {isAdmin() && (
          <>
            <div style={{ padding: '0.875rem 0.75rem 0.25rem', fontSize: '0.675rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Admin Space
            </div>
            <NavLink
              to="/admin/users"
              onClick={handleNavClick}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <Shield size={16} />
              <span>User Manager</span>
            </NavLink>
          </>
        )}
      </div>

      <div className="sidebar-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.25rem 0.5rem' }}>
          <div style={{ 
            width: '28px', 
            height: '28px', 
            borderRadius: '50%', 
            backgroundColor: 'var(--bg-tertiary)', 
            color: 'var(--text-secondary)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            fontWeight: 'bold', 
            fontSize: '0.75rem' 
          }}>
            {user?.name?.substring(0, 2).toUpperCase() || 'US'}
          </div>
          <div style={{ overflow: 'hidden', flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              {user?.name}
            </div>
          </div>
        </div>
        
        <button 
          onClick={logout} 
          className="btn btn-secondary btn-sm" 
          style={{ width: '100%', justifyContent: 'flex-start', border: 'none', background: 'transparent', padding: '0.375rem 0.5rem' }}
        >
          <LogOut size={14} />
          <span style={{ fontSize: '0.8rem' }}>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
