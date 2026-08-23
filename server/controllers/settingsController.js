const { query } = require('../config/db');

async function getSettings(req, res) {
  try {
    const userId = req.user.id;
    const users = await query('SELECT currency, language, theme, monthly_budget FROM users WHERE id = ?', [userId]);

    if (!users || users.length === 0) {
      return res.status(404).json({ success: false, message: 'Settings not found.' });
    }

    return res.json({ success: true, settings: users[0] });
  } catch (error) {
    console.error('getSettings error:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching settings.' });
  }
}

async function updateSettings(req, res) {
  try {
    const userId = req.user.id;
    const { currency, language, theme, monthly_budget } = req.body;

    await query(
      `UPDATE users SET 
        currency = COALESCE(?, currency),
        language = COALESCE(?, language),
        theme = COALESCE(?, theme),
        monthly_budget = COALESCE(?, monthly_budget)
      WHERE id = ?`,
      [currency, language, theme, monthly_budget, userId]
    );

    return res.json({ success: true, message: 'Settings updated successfully.' });
  } catch (error) {
    console.error('updateSettings error:', error);
    return res.status(500).json({ success: false, message: 'Server error updating settings.' });
  }
}

module.exports = {
  getSettings,
  updateSettings
};
