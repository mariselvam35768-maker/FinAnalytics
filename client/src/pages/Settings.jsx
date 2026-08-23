import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { User, Lock, Save, Check } from 'lucide-react';

export default function Settings() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState({
    full_name: '',
    phone: '',
    currency: '₹',
    monthly_budget: ''
  });
  const [password, setPassword] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [pwdMsg, setPwdMsg] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setProfile({
        full_name: user.full_name || '',
        phone: user.phone || '',
        currency: user.currency || '₹',
        monthly_budget: user.monthly_budget || ''
      });
    }
  }, [user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });
    setLoading(true);

    try {
      const res = await api.put('/auth/profile', profile);
      if (res.data.success) {
        updateUser(res.data.user);
        setMsg({ type: 'success', text: 'Profile updated successfully!' });
      }
    } catch (err) {
      setMsg({ type: 'danger', text: err.response?.data?.message || 'Failed to update profile.' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPwdMsg({ type: '', text: '' });

    if (password.new_password !== password.confirm_password) {
      setPwdMsg({ type: 'danger', text: 'New passwords do not match.' });
      return;
    }

    try {
      const res = await api.post('/auth/change-password', {
        current_password: password.current_password,
        new_password: password.new_password
      });
      if (res.data.success) {
        setPwdMsg({ type: 'success', text: 'Password changed successfully!' });
        setPassword({ current_password: '', new_password: '', confirm_password: '' });
      }
    } catch (err) {
      setPwdMsg({ type: 'danger', text: err.response?.data?.message || 'Failed to change password.' });
    }
  };

  return (
    <div className="page-body">
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Account & System Settings</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Manage your personal profile, currency preference, monthly budget, and security
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.5rem' }}>
        {/* Profile Settings */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <User size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Profile Information</h3>
          </div>

          {msg.text && (
            <div style={{
              padding: '0.75rem',
              borderRadius: '8px',
              marginBottom: '1rem',
              fontSize: '0.85rem',
              background: msg.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              color: msg.type === 'success' ? '#34d399' : '#f87171'
            }}>
              {msg.text}
            </div>
          )}

          <form onSubmit={handleProfileSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-control"
                value={profile.full_name}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="text"
                className="form-control"
                placeholder="+91 9876543210"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Preferred Currency</label>
                <select
                  className="form-control"
                  value={profile.currency}
                  onChange={(e) => setProfile({ ...profile, currency: e.target.value })}
                >
                  <option value="₹">₹ (INR)</option>
                  <option value="$">$ (USD)</option>
                  <option value="€">€ (EUR)</option>
                  <option value="£">£ (GBP)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Monthly Target Budget</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="25000"
                  value={profile.monthly_budget}
                  onChange={(e) => setProfile({ ...profile, monthly_budget: e.target.value })}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={loading}>
              <Save size={18} />
              <span>{loading ? 'Saving...' : 'Save Profile Settings'}</span>
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Lock size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Security & Password</h3>
          </div>

          {pwdMsg.text && (
            <div style={{
              padding: '0.75rem',
              borderRadius: '8px',
              marginBottom: '1rem',
              fontSize: '0.85rem',
              background: pwdMsg.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              color: pwdMsg.type === 'success' ? '#34d399' : '#f87171'
            }}>
              {pwdMsg.text}
            </div>
          )}

          <form onSubmit={handlePasswordSubmit}>
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={password.current_password}
                onChange={(e) => setPassword({ ...password, current_password: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">New Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={password.new_password}
                onChange={(e) => setPassword({ ...password, new_password: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={password.confirm_password}
                onChange={(e) => setPassword({ ...password, confirm_password: e.target.value })}
                required
              />
            </div>

            <button type="submit" className="btn btn-secondary" style={{ width: '100%', marginTop: '0.5rem' }}>
              <Check size={18} />
              <span>Update Password</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
