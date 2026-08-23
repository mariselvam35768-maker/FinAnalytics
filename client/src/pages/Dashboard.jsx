import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  PiggyBank, 
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Calendar,
  Zap,
  Award
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [dailyChart, setDailyChart] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const [dashRes, chartRes] = await Promise.all([
        api.get('/dashboard'),
        api.get('/charts/daily?days=30')
      ]);

      if (dashRes.data.success) {
        setData(dashRes.data);
      }
      if (chartRes.data.success) {
        setDailyChart(chartRes.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading Financial Dashboard...</div>;
  }

  const kpi = data?.kpi || {};
  const currency = data?.currency || '₹';
  const recent = data?.recent_transactions || [];
  const categories = data?.category_breakdown || [];
  const insights = data?.insights || [];

  const val = (num) => (num !== undefined && num !== null && !isNaN(num) ? num : 0);
  const fmt = (num) => val(num).toLocaleString();

  return (
    <div className="page-body">
      
      {/* 4x3 ROW-COLUMN MATRIX GRID (12 COMPACT CARDS) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Financial Metrics Matrix</h3>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>12 Compact KPI Cards</span>
      </div>

      <div className="grid-stats-matrix">
        {/* Card 1: Total Net Balance */}
        <div className="glass-card glass-card-interactive" style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(15, 20, 35, 0.8))' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Net Balance</span>
            <div style={{ background: 'rgba(99, 102, 241, 0.2)', padding: '0.4rem', borderRadius: '8px' }}>
              <Wallet size={18} color="#818cf8" />
            </div>
          </div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0.4rem 0 0.1rem 0' }}>
            {currency}{fmt(kpi.net_balance)}
          </h2>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>All-time net balance</span>
        </div>

        {/* Card 2: This Month Income */}
        <div className="glass-card glass-card-interactive">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>This Month Income</span>
            <div style={{ background: 'rgba(16, 185, 129, 0.2)', padding: '0.4rem', borderRadius: '8px' }}>
              <TrendingUp size={18} color="#34d399" />
            </div>
          </div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0.4rem 0 0.1rem 0', color: '#34d399' }}>
            +{currency}{fmt(kpi.month_income)}
          </h2>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            Growth: {val(kpi.income_growth) > 0 ? `+${val(kpi.income_growth)}%` : `${val(kpi.income_growth)}%`}
          </span>
        </div>

        {/* Card 3: This Month Expense */}
        <div className="glass-card glass-card-interactive">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>This Month Expense</span>
            <div style={{ background: 'rgba(239, 68, 68, 0.2)', padding: '0.4rem', borderRadius: '8px' }}>
              <TrendingDown size={18} color="#f87171" />
            </div>
          </div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0.4rem 0 0.1rem 0', color: '#f87171' }}>
            -{currency}{fmt(kpi.month_expense)}
          </h2>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Ratio: {val(kpi.expense_pct)}% of income</span>
        </div>

        {/* Card 4: Monthly Net Savings */}
        <div className="glass-card glass-card-interactive">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Monthly Net Savings</span>
            <div style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '0.4rem', borderRadius: '8px' }}>
              <PiggyBank size={18} color="#60a5fa" />
            </div>
          </div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0.4rem 0 0.1rem 0', color: val(kpi.month_savings) >= 0 ? '#60a5fa' : '#f87171' }}>
            {currency}{fmt(kpi.month_savings)}
          </h2>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Savings Rate: {val(kpi.savings_pct)}%</span>
        </div>

        {/* Card 5: Today Net Profit */}
        <div className="glass-card glass-card-interactive">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Today's Net Profit</span>
            <div style={{ background: 'rgba(168, 85, 247, 0.2)', padding: '0.4rem', borderRadius: '8px' }}>
              <Clock size={18} color="#c084fc" />
            </div>
          </div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0.4rem 0 0.1rem 0', color: val(kpi.today_profit) >= 0 ? '#c084fc' : '#f87171' }}>
            {currency}{fmt(kpi.today_profit)}
          </h2>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Inc: {currency}{fmt(kpi.today_income)} | Exp: {currency}{fmt(kpi.today_expense)}</span>
        </div>

        {/* Card 6: Yesterday Totals */}
        <div className="glass-card glass-card-interactive">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Yesterday Totals</span>
            <div style={{ background: 'rgba(245, 158, 11, 0.2)', padding: '0.4rem', borderRadius: '8px' }}>
              <Calendar size={18} color="#fbbf24" />
            </div>
          </div>
          <div style={{ margin: '0.4rem 0 0.1rem 0', display: 'flex', gap: '0.6rem' }}>
            <div>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block' }}>Income</span>
              <strong style={{ color: '#34d399', fontSize: '0.95rem' }}>+{currency}{fmt(kpi.yesterday_income)}</strong>
            </div>
            <div>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block' }}>Expense</span>
              <strong style={{ color: '#f87171', fontSize: '0.95rem' }}>-{currency}{fmt(kpi.yesterday_expense)}</strong>
            </div>
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Yesterday's summary</span>
        </div>

        {/* Card 7: Average Daily Burn */}
        <div className="glass-card glass-card-interactive">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Average Daily Burn</span>
            <div style={{ background: 'rgba(236, 72, 153, 0.2)', padding: '0.4rem', borderRadius: '8px' }}>
              <Zap size={18} color="#f472b6" />
            </div>
          </div>
          <div style={{ margin: '0.4rem 0 0.1rem 0', display: 'flex', gap: '0.6rem' }}>
            <div>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block' }}>Avg Inc</span>
              <strong style={{ color: '#34d399', fontSize: '0.95rem' }}>+{currency}{fmt(kpi.avg_daily_income)}</strong>
            </div>
            <div>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block' }}>Avg Exp</span>
              <strong style={{ color: '#f87171', fontSize: '0.95rem' }}>-{currency}{fmt(kpi.avg_daily_expense)}</strong>
            </div>
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Daily avg expense rate</span>
        </div>

        {/* Card 8: Year To Date Totals */}
        <div className="glass-card glass-card-interactive">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>This Year Totals</span>
            <div style={{ background: 'rgba(20, 184, 166, 0.2)', padding: '0.4rem', borderRadius: '8px' }}>
              <Award size={18} color="#2dd4bf" />
            </div>
          </div>
          <div style={{ margin: '0.4rem 0 0.1rem 0', display: 'flex', gap: '0.6rem' }}>
            <div>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block' }}>Year Inc</span>
              <strong style={{ color: '#34d399', fontSize: '0.95rem' }}>+{currency}{fmt(kpi.year_income)}</strong>
            </div>
            <div>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block' }}>Year Exp</span>
              <strong style={{ color: '#f87171', fontSize: '0.95rem' }}>-{currency}{fmt(kpi.year_expense)}</strong>
            </div>
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>YTD accumulated totals</span>
        </div>

        {/* Card 9: Highest Income Day */}
        <div className="glass-card glass-card-interactive">
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Highest Income Day</span>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#34d399', marginTop: '0.3rem' }}>
            {kpi.highest_income_day ? `${currency}${fmt(kpi.highest_income_day.total)}` : 'No Record'}
          </h3>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            {kpi.highest_income_day ? `Date: ${kpi.highest_income_day.transaction_date}` : 'Record income to see peak'}
          </span>
        </div>

        {/* Card 10: Highest Expense Day */}
        <div className="glass-card glass-card-interactive">
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Highest Expense Day</span>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f87171', marginTop: '0.3rem' }}>
            {kpi.highest_expense_day ? `${currency}${fmt(kpi.highest_expense_day.total)}` : 'No Record'}
          </h3>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            {kpi.highest_expense_day ? `Date: ${kpi.highest_expense_day.transaction_date}` : 'Record expense to see peak'}
          </span>
        </div>

        {/* Card 11: Lowest Expense Day */}
        <div className="glass-card glass-card-interactive">
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Lowest Expense Day</span>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#60a5fa', marginTop: '0.3rem' }}>
            {kpi.lowest_expense_day ? `${currency}${fmt(kpi.lowest_expense_day.total)}` : 'No Record'}
          </h3>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            {kpi.lowest_expense_day ? `Date: ${kpi.lowest_expense_day.transaction_date}` : 'Minimum spending day'}
          </span>
        </div>

        {/* Card 12: Expense Growth % */}
        <div className="glass-card glass-card-interactive">
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Expense Growth Rate</span>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: val(kpi.expense_growth) > 0 ? '#f87171' : '#34d399', marginTop: '0.3rem' }}>
            {val(kpi.expense_growth) > 0 ? `+${val(kpi.expense_growth)}%` : `${val(kpi.expense_growth)}%`}
          </h3>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Compared to previous month</span>
        </div>
      </div>

      {/* Monthly Budget Progress Bar */}
      {val(kpi.monthly_budget) > 0 && (
        <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
              Monthly Budget Progress ({currency}{fmt(kpi.month_expense)} / {currency}{fmt(kpi.monthly_budget)})
            </span>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: val(kpi.budget_utilization) > 90 ? '#ef4444' : '#10b981' }}>
              {val(kpi.budget_utilization)}% Used
            </span>
          </div>
          <div style={{ background: 'rgba(255, 255, 255, 0.1)', height: '8px', borderRadius: '8px', overflow: 'hidden' }}>
            <div style={{
              width: `${Math.min(100, val(kpi.budget_utilization))}%`,
              height: '100%',
              background: val(kpi.budget_utilization) > 90 
                ? 'linear-gradient(90deg, #f59e0b, #ef4444)' 
                : 'linear-gradient(90deg, #6366f1, #10b981)',
              borderRadius: '8px',
              transition: 'width 0.5s ease'
            }} />
          </div>
        </div>
      )}

      {/* AI Financial Insights Banner */}
      {insights.length > 0 && (
        <div className="glass-card" style={{ marginBottom: '1.5rem', borderLeft: '4px solid var(--primary)', background: 'rgba(99, 102, 241, 0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Sparkles size={16} color="#818cf8" />
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#a5b4fc' }}>AI Financial Insights</h4>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {insights.map((item, idx) => (
              <p key={idx} style={{ fontSize: '0.82rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: item.type === 'danger' ? '#ef4444' : item.type === 'warning' ? '#f59e0b' : '#10b981'
                }} />
                {item.message}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid-charts">
        {/* Daily Spending Trend Area Chart */}
        <div className="glass-card">
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem' }}>
            Daily Spending & Income Trend (Last 30 Days)
          </h3>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyChart}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#6b7280" tick={{ fontSize: 10 }} />
                <YAxis stroke="#6b7280" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="income" stroke="#10b981" fillOpacity={1} fill="url(#incomeGrad)" name="Income" />
                <Area type="monotone" dataKey="expense" stroke="#ef4444" fillOpacity={1} fill="url(#expenseGrad)" name="Expense" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Donut Chart */}
        <div className="glass-card">
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem' }}>
            Category Expense Distribution
          </h3>
          {categories.length > 0 ? (
            <div style={{ width: '100%', height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categories}
                    dataKey="total"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                  >
                    {categories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || '#6366f1'} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ padding: '3rem 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No expenses recorded for this month yet.
            </div>
          )}
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Recent Transactions</h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Latest 5 entries</span>
        </div>

        <div className="custom-table-wrapper">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Description</th>
                <th>Payment</th>
                <th>Type</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {recent.length > 0 ? (
                recent.map((tx) => (
                  <tr key={tx.id}>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {tx.transaction_date ? tx.transaction_date.split('T')[0] : ''}
                    </td>
                    <td style={{ fontWeight: 600 }}>{tx.category_name}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{tx.description || '-'}</td>
                    <td>{tx.payment_method}</td>
                    <td>
                      <span className={tx.type === 'income' ? 'badge badge-income' : 'badge badge-expense'}>
                        {tx.type === 'income' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                        {tx.type}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: tx.type === 'income' ? '#34d399' : '#f87171' }}>
                      {tx.type === 'income' ? '+' : '-'}{currency}{parseFloat(tx.amount).toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                    No recent transactions found. Click "Add Transaction" to create one!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
