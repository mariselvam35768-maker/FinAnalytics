const { query } = require('../config/db');

async function getDailyChart(req, res) {
  try {
    const userId = req.user.id;
    const days = parseInt(req.query.days) || 30;

    const data = await query(
      `SELECT 
        DATE_FORMAT(transaction_date, '%Y-%m-%d') as date,
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
       FROM transactions
       WHERE user_id = ? AND transaction_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
       GROUP BY DATE_FORMAT(transaction_date, '%Y-%m-%d')
       ORDER BY date ASC`,
      [userId, days]
    );

    return res.json({ success: true, data });
  } catch (error) {
    console.error('getDailyChart error:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching daily chart.' });
  }
}

async function getMonthlyChart(req, res) {
  try {
    const userId = req.user.id;

    const data = await query(
      `SELECT 
        DATE_FORMAT(transaction_date, '%Y-%m') as month,
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
       FROM transactions
       WHERE user_id = ?
       GROUP BY DATE_FORMAT(transaction_date, '%Y-%m')
       ORDER BY month ASC
       LIMIT 12`,
      [userId]
    );

    return res.json({ success: true, data });
  } catch (error) {
    console.error('getMonthlyChart error:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching monthly chart.' });
  }
}

async function getCategoryChart(req, res) {
  try {
    const userId = req.user.id;
    const type = req.query.type || 'expense';

    const data = await query(
      `SELECT c.name, c.color, c.icon, SUM(t.amount) as value
       FROM transactions t
       JOIN categories c ON t.category_id = c.id
       WHERE t.user_id = ? AND t.type = ?
       GROUP BY c.id, c.name, c.color, c.icon
       ORDER BY value DESC`,
      [userId, type]
    );

    return res.json({ success: true, data });
  } catch (error) {
    console.error('getCategoryChart error:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching category chart.' });
  }
}

async function getSavingsChart(req, res) {
  try {
    const userId = req.user.id;

    const raw = await query(
      `SELECT 
        DATE_FORMAT(transaction_date, '%Y-%m') as month,
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
       FROM transactions
       WHERE user_id = ?
       GROUP BY DATE_FORMAT(transaction_date, '%Y-%m')
       ORDER BY month ASC`,
      [userId]
    );

    const data = raw.map(item => {
      const inc = parseFloat(item.income);
      const exp = parseFloat(item.expense);
      const savings = inc - exp;
      const rate = inc > 0 ? Math.round((savings / inc) * 100) : 0;
      return {
        month: item.month,
        savings: savings > 0 ? savings : 0,
        savings_rate: rate
      };
    });

    return res.json({ success: true, data });
  } catch (error) {
    console.error('getSavingsChart error:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching savings chart.' });
  }
}

module.exports = {
  getDailyChart,
  getMonthlyChart,
  getCategoryChart,
  getSavingsChart
};
