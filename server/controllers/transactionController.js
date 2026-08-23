const { query } = require('../config/db');

async function getTransactions(req, res) {
  try {
    const userId = req.user.id;
    const {
      type,
      category_id,
      search,
      start_date,
      end_date,
      page = 1,
      limit = 10,
      sort_by = 'transaction_date',
      sort_order = 'DESC'
    } = req.query;

    let whereClause = ['t.user_id = ?'];
    let params = [userId];

    if (type && ['income', 'expense'].includes(type)) {
      whereClause.push('t.type = ?');
      params.push(type);
    }

    if (category_id) {
      whereClause.push('t.category_id = ?');
      params.push(category_id);
    }

    if (search) {
      whereClause.push('(t.description LIKE ? OR t.payment_method LIKE ? OR c.name LIKE ?)');
      const s = `%${search}%`;
      params.push(s, s, s);
    }

    if (start_date) {
      whereClause.push('t.transaction_date >= ?');
      params.push(start_date);
    }

    if (end_date) {
      whereClause.push('t.transaction_date <= ?');
      params.push(end_date);
    }

    const whereSql = whereClause.join(' AND ');

    // Count query
    const countResult = await query(
      `SELECT COUNT(*) as total FROM transactions t JOIN categories c ON t.category_id = c.id WHERE ${whereSql}`,
      params
    );
    const totalRecords = countResult[0]?.total || 0;

    const parsedLimit = parseInt(limit);
    const parsedPage = parseInt(page);
    const offset = (parsedPage - 1) * parsedLimit;

    // Fetch records
    const allowedSort = ['transaction_date', 'amount', 'created_at'];
    const orderCol = allowedSort.includes(sort_by) ? `t.${sort_by}` : 't.transaction_date';
    const orderDir = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const transactions = await query(
      `SELECT t.*, c.name as category_name, c.icon as category_icon, c.color as category_color 
       FROM transactions t 
       JOIN categories c ON t.category_id = c.id 
       WHERE ${whereSql} 
       ORDER BY ${orderCol} ${orderDir}, t.id DESC 
       LIMIT ${parsedLimit} OFFSET ${offset}`,
      params
    );

    return res.json({
      success: true,
      data: transactions,
      pagination: {
        total: totalRecords,
        page: parsedPage,
        limit: parsedLimit,
        total_pages: Math.ceil(totalRecords / parsedLimit)
      }
    });
  } catch (error) {
    console.error('getTransactions error:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching transactions.' });
  }
}

async function getTransactionById(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const result = await query(
      `SELECT t.*, c.name as category_name, c.icon as category_icon, c.color as category_color 
       FROM transactions t 
       JOIN categories c ON t.category_id = c.id 
       WHERE t.id = ? AND t.user_id = ?`,
      [id, userId]
    );

    if (!result || result.length === 0) {
      return res.status(404).json({ success: false, message: 'Transaction not found.' });
    }

    return res.json({ success: true, transaction: result[0] });
  } catch (error) {
    console.error('getTransactionById error:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching transaction.' });
  }
}

async function createTransaction(req, res) {
  try {
    const userId = req.user.id;
    const { category_id, type, amount, description, transaction_date, payment_method, reference } = req.body;

    if (!category_id || !type || !amount || !transaction_date) {
      return res.status(400).json({ success: false, message: 'Category, type, amount, and transaction date are required.' });
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Amount must be greater than zero.' });
    }

    const resDb = await query(
      `INSERT INTO transactions (user_id, category_id, type, amount, description, transaction_date, payment_method, reference)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        category_id,
        type,
        numAmount,
        description || '',
        transaction_date,
        payment_method || 'Cash',
        reference || null
      ]
    );

    const transactionId = resDb.insertId;

    // Check for alerts (Large expense alert)
    if (type === 'expense' && numAmount >= 10000) {
      await query(
        `INSERT INTO notifications (user_id, type, title, message) VALUES (?, 'large_expense', ?, ?)`,
        [
          userId,
          'Large Expense Alert',
          `You recorded a high expense of ${numAmount} on ${transaction_date}.`
        ]
      );
    }

    return res.json({
      success: true,
      message: 'Transaction recorded successfully',
      id: transactionId
    });
  } catch (error) {
    console.error('createTransaction error:', error);
    return res.status(500).json({ success: false, message: 'Server error creating transaction.' });
  }
}

async function updateTransaction(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { category_id, type, amount, description, transaction_date, payment_method, reference } = req.body;

    const existing = await query('SELECT id FROM transactions WHERE id = ? AND user_id = ?', [id, userId]);
    if (!existing || existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Transaction not found.' });
    }

    await query(
      `UPDATE transactions SET 
        category_id = COALESCE(?, category_id),
        type = COALESCE(?, type),
        amount = COALESCE(?, amount),
        description = COALESCE(?, description),
        transaction_date = COALESCE(?, transaction_date),
        payment_method = COALESCE(?, payment_method),
        reference = COALESCE(?, reference)
      WHERE id = ? AND user_id = ?`,
      [category_id, type, amount, description, transaction_date, payment_method, reference, id, userId]
    );

    return res.json({ success: true, message: 'Transaction updated successfully.' });
  } catch (error) {
    console.error('updateTransaction error:', error);
    return res.status(500).json({ success: false, message: 'Server error updating transaction.' });
  }
}

async function deleteTransaction(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const existing = await query('SELECT id FROM transactions WHERE id = ? AND user_id = ?', [id, userId]);
    if (!existing || existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Transaction not found.' });
    }

    await query('DELETE FROM transactions WHERE id = ? AND user_id = ?', [id, userId]);

    return res.json({ success: true, message: 'Transaction deleted successfully.' });
  } catch (error) {
    console.error('deleteTransaction error:', error);
    return res.status(500).json({ success: false, message: 'Server error deleting transaction.' });
  }
}

async function exportCSV(req, res) {
  try {
    const userId = req.user.id;
    const transactions = await query(
      `SELECT t.id, t.transaction_date, t.type, c.name as category, t.amount, t.payment_method, t.description, t.reference
       FROM transactions t
       JOIN categories c ON t.category_id = c.id
       WHERE t.user_id = ?
       ORDER BY t.transaction_date DESC`,
      [userId]
    );

    let csv = 'ID,Date,Type,Category,Amount,Payment Method,Description,Reference\n';
    for (const item of transactions) {
      const desc = `"${(item.description || '').replace(/"/g, '""')}"`;
      csv += `${item.id},${item.transaction_date},${item.type},"${item.category}",${item.amount},"${item.payment_method}",${desc},"${item.reference || ''}"\n`;
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=transactions.csv');
    return res.status(200).send(csv);
  } catch (error) {
    console.error('exportCSV error:', error);
    return res.status(500).json({ success: false, message: 'Server error exporting CSV.' });
  }
}

module.exports = {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  exportCSV
};
