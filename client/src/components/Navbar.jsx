import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell, Plus, User, Menu } from 'lucide-react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

export default function Navbar({ onOpenAddModal, onToggleMobileSidebar }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchUnread = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setUnreadCount(res.data.unread_count || 0);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header className="app-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* Mobile Hamburger Button */}
        <button 
          className="mobile-hamburger-btn"
          onClick={onToggleMobileSidebar}
        >
          <Menu size={22} />
        </button>

        <div>
          <h3 className="nav-welcome-title">
            Welcome, <span style={{ color: 'var(--primary)' }}>{user?.full_name || 'User'}</span> 👋
          </h3>
          <p className="nav-subtitle">
            Personal Finance Dashboard
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
        <button className="btn btn-primary nav-add-btn" onClick={onOpenAddModal}>
          <Plus size={16} />
          <span className="nav-btn-text">Add Transaction</span>
        </button>

        <button
          onClick={() => navigate('/notifications')}
          style={{
            position: 'relative',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border-color)',
            padding: '0.55rem',
            borderRadius: '10px',
            color: 'var(--text-main)',
            cursor: 'pointer'
          }}
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              background: '#ef4444',
              color: '#fff',
              fontSize: '0.65rem',
              fontWeight: 800,
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {unreadCount}
            </span>
          )}
        </button>

        <div 
          className="nav-user-profile"
          onClick={() => navigate('/settings')}
        >
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1, #10b981)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            color: '#fff',
            fontSize: '0.78rem'
          }}>
            {user?.full_name ? user.full_name.charAt(0).toUpperCase() : <User size={14} />}
          </div>
          <span className="nav-username">{user?.full_name?.split(' ')[0] || 'Profile'}</span>
        </div>
      </div>
    </header>
  );
}
