const { query } = require('../config/db');

async function getDashboardData(req, res) {
  try {
    const userId = req.user.id;

    // User budget & currency
    const userRes = await query('SELECT currency, monthly_budget FROM users WHERE id = ?', [userId]);
    const currency = userRes[0]?.currency || '₹';
    const monthlyBudget = parseFloat(userRes[0]?.monthly_budget || 0);

    // 1. Today Totals
    const todayRes = await query(
      `SELECT 
        COALESCE(SUM(CASE WHEN type='income' THEN amount ELSE 0 END), 0) as income,
        COALESCE(SUM(CASE WHEN type='expense' THEN amount ELSE 0 END), 0) as expense
       FROM transactions 
       WHERE user_id = ? AND transaction_date = CURDATE()`,
      [userId]
    );

    // 2. Yesterday Totals
    const yesterdayRes = await query(
      `SELECT 
        COALESCE(SUM(CASE WHEN type='income' THEN amount ELSE 0 END), 0) as income,
        COALESCE(SUM(CASE WHEN type='expense' THEN amount ELSE 0 END), 0) as expense
       FROM transactions 
       WHERE user_id = ? AND transaction_date = DATE_SUB(CURDATE(), INTERVAL 1 DAY)`,
      [userId]
    );

    // 3. Current Month Totals
    const monthRes = await query(
      `SELECT 
        COALESCE(SUM(CASE WHEN type='income' THEN amount ELSE 0 END), 0) as income,
        COALESCE(SUM(CASE WHEN type='expense' THEN amount ELSE 0 END), 0) as expense,
        COUNT(DISTINCT transaction_date) as active_days
       FROM transactions 
       WHERE user_id = ? AND MONTH(transaction_date) = MONTH(CURDATE()) AND YEAR(transaction_date) = YEAR(CURDATE())`,
      [userId]
    );

    // 4. Previous Month Totals (for Growth Calculation)
    const prevMonthRes = await query(
      `SELECT 
        COALESCE(SUM(CASE WHEN type='income' THEN amount ELSE 0 END), 0) as income,
        COALESCE(SUM(CASE WHEN type='expense' THEN amount ELSE 0 END), 0) as expense
       FROM transactions 
       WHERE user_id = ? AND MONTH(transaction_date) = MONTH(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)) AND YEAR(transaction_date) = YEAR(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))`,
      [userId]
    );

    // 5. Current Year Totals
    const yearRes = await query(
      `SELECT 
        COALESCE(SUM(CASE WHEN type='income' THEN amount ELSE 0 END), 0) as income,
        COALESCE(SUM(CASE WHEN type='expense' THEN amount ELSE 0 END), 0) as expense
       FROM transactions 
       WHERE user_id = ? AND YEAR(transaction_date) = YEAR(CURDATE())`,
      [userId]
    );

    // 6. Net Overall Balance
    const netRes = await query(
      `SELECT 
        COALESCE(SUM(CASE WHEN type='income' THEN amount ELSE -amount END), 0) as net_balance
       FROM transactions 
       WHERE user_id = ?`,
      [userId]
    );

    // 7. Highest Income Day
    const highIncomeRes = await query(
      `SELECT transaction_date, SUM(amount) as total
       FROM transactions
       WHERE user_id = ? AND type = 'income'
       GROUP BY transaction_date
       ORDER BY total DESC
       LIMIT 1`,
      [userId]
    );

    // 8. Highest Expense Day
    const highExpenseRes = await query(
      `SELECT transaction_date, SUM(amount) as total
       FROM transactions
       WHERE user_id = ? AND type = 'expense'
       GROUP BY transaction_date
       ORDER BY total DESC
       LIMIT 1`,
      [userId]
    );

    // 9. Lowest Expense Day
    const lowExpenseRes = await query(
      `SELECT transaction_date, SUM(amount) as total
       FROM transactions
       WHERE user_id = ? AND type = 'expense'
       GROUP BY transaction_date
       ORDER BY total ASC
       LIMIT 1`,
      [userId]
    );

    // 10. Recent Transactions
    const recent = await query(
      `SELECT t.*, c.name as category_name, c.icon as category_icon, c.color as category_color 
       FROM transactions t 
       JOIN categories c ON t.category_id = c.id 
       WHERE t.user_id = ? 
       ORDER BY t.transaction_date DESC, t.id DESC 
       LIMIT 5`,
      [userId]
    );

    // 11. Category Breakdown
    const categoryBreakdown = await query(
      `SELECT c.name, c.color, c.icon, SUM(t.amount) as total
       FROM transactions t
       JOIN categories c ON t.category_id = c.id
       WHERE t.user_id = ? AND t.type = 'expense' AND MONTH(t.transaction_date) = MONTH(CURDATE()) AND YEAR(t.transaction_date) = YEAR(CURDATE())
       GROUP BY c.id, c.name, c.color, c.icon
       ORDER BY total DESC`,
      [userId]
    );

    // Metric Calculations
    const todayIncome = parseFloat(todayRes[0]?.income || 0);
    const todayExpense = parseFloat(todayRes[0]?.expense || 0);
    const todayProfit = todayIncome - todayExpense;

    const yesterdayIncome = parseFloat(yesterdayRes[0]?.income || 0);
    const yesterdayExpense = parseFloat(yesterdayRes[0]?.expense || 0);

    const monthIncome = parseFloat(monthRes[0]?.income || 0);
    const monthExpense = parseFloat(monthRes[0]?.expense || 0);
    const monthSavings = monthIncome - monthExpense;

    const prevMonthIncome = parseFloat(prevMonthRes[0]?.income || 0);
    const prevMonthExpense = parseFloat(prevMonthRes[0]?.expense || 0);

    const yearIncome = parseFloat(yearRes[0]?.income || 0);
    const yearExpense = parseFloat(yearRes[0]?.expense || 0);

    const netBalance = parseFloat(netRes[0]?.net_balance || 0);

    const activeDays = parseInt(monthRes[0]?.active_days || 1) || 1;
    const avgDailyIncome = Math.round(monthIncome / activeDays);
    const avgDailyExpense = Math.round(monthExpense / activeDays);

    const savingsPct = monthIncome > 0 ? Math.round((monthSavings / monthIncome) * 100) : 0;
    const expensePct = monthIncome > 0 ? Math.round((monthExpense / monthIncome) * 100) : 0;

    const incomeGrowth = prevMonthIncome > 0 ? Math.round(((monthIncome - prevMonthIncome) / prevMonthIncome) * 100) : 0;
    const expenseGrowth = prevMonthExpense > 0 ? Math.round(((monthExpense - prevMonthExpense) / prevMonthExpense) * 100) : 0;

    const budgetRemaining = monthlyBudget > 0 ? monthlyBudget - monthExpense : 0;
    const budgetUtilization = monthlyBudget > 0 ? Math.min(100, Math.round((monthExpense / monthlyBudget) * 100)) : 0;

    // AI Insights Generator
    const insights = [];
    if (monthExpense > monthIncome && monthIncome > 0) {
      insights.push({ type: 'danger', message: `Your monthly expenses (${currency}${monthExpense}) exceed your income (${currency}${monthIncome}). Consider cutting back non-essential spending.` });
    } else if (monthIncome > 0) {
      insights.push({ type: 'success', message: `Great job! You saved ${savingsPct}% of your income this month (${currency}${monthSavings}).` });
    }

    if (incomeGrowth > 0) {
      insights.push({ type: 'success', message: `Income Growth: Your income increased by ${incomeGrowth}% compared to last month!` });
    }
    if (expenseGrowth > 15) {
      insights.push({ type: 'warning', message: `Spending Spike: Your monthly expenses grew by ${expenseGrowth}% compared to last month.` });
    }

    if (monthlyBudget > 0 && budgetUtilization >= 80) {
      insights.push({ type: 'warning', message: `Budget Alert: You have used ${budgetUtilization}% of your set monthly budget.` });
    }

    return res.json({
      success: true,
      currency,
      kpi: {
        today_income: todayIncome,
        today_expense: todayExpense,
        today_profit: todayProfit,
        yesterday_income: yesterdayIncome,
        yesterday_expense: yesterdayExpense,
        month_income: monthIncome,
        month_expense: monthExpense,
        month_savings: monthSavings,
        year_income: yearIncome,
        year_expense: yearExpense,
        net_balance: netBalance,
        savings_pct: savingsPct,
        expense_pct: expensePct,
        income_growth: incomeGrowth,
        expense_growth: expenseGrowth,
        avg_daily_income: avgDailyIncome,
        avg_daily_expense: avgDailyExpense,
        highest_income_day: highIncomeRes[0] || null,
        highest_expense_day: highExpenseRes[0] || null,
        lowest_expense_day: lowExpenseRes[0] || null,
        monthly_budget: monthlyBudget,
        budget_remaining: budgetRemaining,
        budget_utilization: budgetUtilization
      },
      recent_transactions: recent,
      category_breakdown: categoryBreakdown,
      insights
    });
  } catch (error) {
    console.error('getDashboardData error:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching dashboard data.' });
  }
}

module.exports = { getDashboardData };
