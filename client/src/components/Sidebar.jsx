import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Receipt, 
  BarChart3, 
  FileText, 
  Bell, 
  Settings, 
  LogOut,
  Wallet,
  X
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
    if (onClose) onClose();
  };

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Transactions', path: '/transactions', icon: Receipt },
    { label: 'Analytics', path: '/analytics', icon: BarChart3 },
    { label: 'Reports', path: '/reports', icon: FileText },
    { label: 'Notifications', path: '/notifications', icon: Bell },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div 
          className="mobile-sidebar-overlay"
          onClick={onClose}
        />
      )}

      <aside className={`app-sidebar ${isOpen ? 'mobile-open' : ''}`}>
        {/* Brand Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 0.5rem 1.25rem 0.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              background: 'linear-gradient(135deg, #6366f1, #4338ca)',
              padding: '0.5rem',
              borderRadius: '10px',
              display: 'flex',
              boxShadow: '0 0 15px rgba(99, 102, 241, 0.4)'
            }}>
              <Wallet size={22} color="#fff" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 800, background: 'linear-gradient(135deg, #fff, #a5b4fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                FinAnalytics
              </h2>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>
                Personal Finance
              </span>
            </div>
          </div>

          {/* Close button for Mobile */}
          <button 
            className="mobile-close-btn"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav Links */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '1.25rem', flex: 1 }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                onClick={() => { if (onClose) onClose(); }}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '10px',
                  color: isActive ? '#ffffff' : 'var(--text-muted)',
                  background: isActive ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.25), rgba(99, 102, 241, 0.1))' : 'transparent',
                  border: isActive ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
                  textDecoration: 'none',
                  fontWeight: isActive ? 700 : 500,
                  transition: 'all 0.2s ease',
                  fontSize: '0.88rem'
                })}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}

          {/* Logout Option directly below Settings */}
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.65rem 0.85rem',
              borderRadius: '10px',
              color: '#f87171',
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.18)',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.88rem',
              marginTop: '0.5rem',
              transition: 'all 0.2s ease',
              textAlign: 'left',
              width: '100%'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.16)';
              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.35)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)';
              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.18)';
            }}
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </nav>
      </aside>
    </>
  );
}
