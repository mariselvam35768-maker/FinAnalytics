const { query } = require('../config/db');

async function getReportsData(req, res) {
  try {
    const userId = req.user.id;
    const { start_date, end_date } = req.query;

    let dateWhere = '';
    let params = [userId];

    if (start_date && end_date) {
      dateWhere = 'AND t.transaction_date BETWEEN ? AND ?';
      params.push(start_date, end_date);
    }

    const totals = await query(
      `SELECT 
        COALESCE(SUM(CASE WHEN t.type='income' THEN t.amount ELSE 0 END), 0) as total_income,
        COALESCE(SUM(CASE WHEN t.type='expense' THEN t.amount ELSE 0 END), 0) as total_expense,
        COUNT(*) as total_transactions
       FROM transactions t
       WHERE t.user_id = ? ${dateWhere}`,
      params
    );

    const categorySummary = await query(
      `SELECT c.name, c.type, c.color, SUM(t.amount) as total, COUNT(*) as count
       FROM transactions t
       JOIN categories c ON t.category_id = c.id
       WHERE t.user_id = ? ${dateWhere}
       GROUP BY c.id, c.name, c.type, c.color
       ORDER BY total DESC`,
      params
    );

    const inc = parseFloat(totals[0]?.total_income || 0);
    const exp = parseFloat(totals[0]?.total_expense || 0);

    return res.json({
      success: true,
      summary: {
        total_income: inc,
        total_expense: exp,
        net_savings: inc - exp,
        total_transactions: totals[0]?.total_transactions || 0
      },
      category_summary: categorySummary
    });
  } catch (error) {
    console.error('getReportsData error:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching report data.' });
  }
}

module.exports = { getReportsData };
