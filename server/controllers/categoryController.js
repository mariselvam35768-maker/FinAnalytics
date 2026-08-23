const { query } = require('../config/db');

async function getCategories(req, res) {
  try {
    const { type } = req.query;
    let sql = 'SELECT * FROM categories';
    let params = [];

    if (type) {
      sql += ' WHERE type = ?';
      params.push(type);
    }

    sql += ' ORDER BY type ASC, name ASC';

    const categories = await query(sql, params);
    return res.json({ success: true, categories });
  } catch (error) {
    console.error('getCategories error:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching categories.' });
  }
}

module.exports = { getCategories };
