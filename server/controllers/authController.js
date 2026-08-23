const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/db');
const { JWT_SECRET } = require('../middleware/authMiddleware');

async function register(req, res) {
  try {
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (e) {}
    }
    if (!body || typeof body !== 'object') {
      body = {};
    }

    const full_name = body.full_name || '';
    const email = body.email || '';
    const password = body.password || '';
    const currency = body.currency || '₹';
    const monthly_budget = body.monthly_budget || 0;

    if (!full_name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await query('SELECT id FROM users WHERE email = ?', [cleanEmail]);
    if (existing && existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Email already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const budget = parseFloat(monthly_budget || 0) || 0;

    const result = await query(
      `INSERT INTO users (full_name, email, password, currency, monthly_budget) VALUES (?, ?, ?, ?, ?)`,
      [full_name.trim(), cleanEmail, hashedPassword, currency, budget]
    );

    let userId = Array.isArray(result) ? (result[0]?.insertId || result[0]?.id) : (result?.insertId || result?.id);
    if (!userId) {
      const inserted = await query('SELECT id FROM users WHERE email = ?', [cleanEmail]);
      userId = inserted[0]?.id || Date.now();
    }

    // Create welcome notification
    try {
      await query(
        `INSERT INTO notifications (user_id, type, title, message) VALUES (?, 'info', ?, ?)`,
        [userId, 'Welcome to Dashboard', 'Thank you for registering! Start tracking your personal finances today.']
      );
    } catch (nErr) {
      console.warn('Welcome notification warning:', nErr.message);
    }

    const token = jwt.sign({ id: userId, email: cleanEmail }, JWT_SECRET, { expiresIn: '7d' });

    let userObj = {
      id: userId,
      full_name: full_name.trim(),
      email: cleanEmail,
      currency: currency,
      monthly_budget: budget,
      language: 'en',
      theme: 'dark'
    };

    try {
      const users = await query('SELECT id, full_name, email, phone, avatar, currency, language, theme, monthly_budget, created_at FROM users WHERE id = ?', [userId]);
      if (users && users[0]) userObj = users[0];
    } catch (uErr) {}

    return res.json({
      success: true,
      message: 'Registration successful!',
      token,
      user: userObj
    });
  } catch (error) {
    console.error('Register controller error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error during registration.' });
  }
}

async function login(req, res) {
  try {
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (e) {}
    }
    if (!body || typeof body !== 'object') body = {};

    const email = body.email || '';
    const password = body.password || '';

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const users = await query('SELECT * FROM users WHERE email = ?', [cleanEmail]);
    if (!users || users.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const user = users[0];
    if (user.is_active === 0) {
      return res.status(403).json({ success: false, message: 'Account is deactivated.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    delete user.password;
    delete user.reset_token;
    delete user.reset_expires;

    return res.json({
      success: true,
      message: 'Login successful',
      token,
      user
    });
  } catch (error) {
    console.error('Login controller error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error during login.' });
  }
}

async function getProfile(req, res) {
  try {
    const userId = req.user.id;
    const users = await query('SELECT id, full_name, email, phone, avatar, currency, language, theme, monthly_budget, created_at FROM users WHERE id = ?', [userId]);

    if (!users || users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.json({ success: true, user: users[0] });
  } catch (error) {
    console.error('getProfile error:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching profile.' });
  }
}

async function updateProfile(req, res) {
  try {
    const userId = req.user.id;
    let body = req.body || {};
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (e) {}
    }

    const { full_name, phone, currency, language, theme, monthly_budget } = body;

    await query(
      `UPDATE users SET 
        full_name = COALESCE(?, full_name),
        phone = COALESCE(?, phone),
        currency = COALESCE(?, currency),
        language = COALESCE(?, language),
        theme = COALESCE(?, theme),
        monthly_budget = COALESCE(?, monthly_budget)
      WHERE id = ?`,
      [full_name, phone, currency, language, theme, monthly_budget, userId]
    );

    const users = await query('SELECT id, full_name, email, phone, avatar, currency, language, theme, monthly_budget, created_at FROM users WHERE id = ?', [userId]);

    return res.json({ success: true, message: 'Profile updated successfully', user: users[0] });
  } catch (error) {
    console.error('updateProfile error:', error);
    return res.status(500).json({ success: false, message: 'Server error updating profile.' });
  }
}

async function changePassword(req, res) {
  try {
    const userId = req.user.id;
    let body = req.body || {};
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (e) {}
    }

    const { current_password, new_password } = body;

    if (!current_password || !new_password) {
      return res.status(400).json({ success: false, message: 'Current and new passwords are required.' });
    }

    const users = await query('SELECT password FROM users WHERE id = ?', [userId]);
    if (!users || users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const isMatch = await bcrypt.compare(current_password, users[0].password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password does not match.' });
    }

    const hashed = await bcrypt.hash(new_password, 10);
    await query('UPDATE users SET password = ? WHERE id = ?', [hashed, userId]);

    return res.json({ success: true, message: 'Password changed successfully.' });
  } catch (error) {
    console.error('changePassword error:', error);
    return res.status(500).json({ success: false, message: 'Server error changing password.' });
  }
}

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword
};
