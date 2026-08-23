import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Bell, Check, Trash2, AlertCircle, Info, DollarSign } from 'lucide-react';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.notifications);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="page-body">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Notification Center</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            System alerts, budget threshold warnings, and updates
          </p>
        </div>

        <button className="btn btn-secondary" onClick={handleMarkAllRead}>
          <Check size={16} />
          <span>Mark All Read</span>
        </button>
      </div>

      <div className="glass-card">
        {notifications.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {notifications.map((n) => (
              <div
                key={n.id}
                style={{
                  display: 'flex',
                  justify: 'space-between',
                  alignItems: 'center',
                  padding: '1rem',
                  borderRadius: '12px',
                  background: n.is_read ? 'rgba(255, 255, 255, 0.02)' : 'rgba(99, 102, 241, 0.08)',
                  border: '1px solid',
                  borderColor: n.is_read ? 'var(--border-color)' : 'rgba(99, 102, 241, 0.3)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    padding: '0.6rem',
                    borderRadius: '10px',
                    background: n.type === 'large_expense' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(99, 102, 241, 0.2)'
                  }}>
                    {n.type === 'large_expense' ? <AlertCircle size={20} color="#f87171" /> : <Info size={20} color="#818cf8" />}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{n.title}</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{n.message}</p>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                      {n.created_at ? new Date(n.created_at).toLocaleString() : ''}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(n.id)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            No notifications available.
          </div>
        )}
      </div>
    </div>
  );
}
