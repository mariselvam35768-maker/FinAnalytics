import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Calendar, TrendingUp, TrendingDown, PiggyBank } from 'lucide-react';

export default function Reports() {
  const [report, setReport] = useState(null);
  const [dates, setDates] = useState({ start_date: '', end_date: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reports', { params: dates });
      if (res.data.success) {
        setReport(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (e) => {
    e.preventDefault();
    fetchReport();
  };

  return (
    <div className="page-body">
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Financial Reports</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Generate custom date range statements and category summaries
        </p>
      </div>

      {/* Date Range Selector */}
      <div className="glass-card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
        <form onSubmit={handleFilter} style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={18} color="var(--text-muted)" />
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Start Date:</span>
            <input
              type="date"
              className="form-control"
              style={{ width: 'auto' }}
              value={dates.start_date}
              onChange={(e) => setDates({ ...dates, start_date: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>End Date:</span>
            <input
              type="date"
              className="form-control"
              style={{ width: 'auto' }}
              value={dates.end_date}
              onChange={(e) => setDates({ ...dates, end_date: e.target.value })}
            />
          </div>

          <button type="submit" className="btn btn-primary">
            Generate Report
          </button>
        </form>
      </div>

      {/* Report Summary Cards (3 Side-by-Side Cards) */}
      {report && (
        <>
          <div className="grid-stats-3">
            {/* Total Income Card */}
            <div className="glass-card glass-card-interactive">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Income</span>
                <div style={{ background: 'rgba(16, 185, 129, 0.2)', padding: '0.5rem', borderRadius: '10px' }}>
                  <TrendingUp size={20} color="#34d399" />
                </div>
              </div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#34d399', marginTop: '0.6rem' }}>
                ₹{(report.summary.total_income || 0).toLocaleString()}
              </h2>
            </div>

            {/* Total Expense Card */}
            <div className="glass-card glass-card-interactive">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Expense</span>
                <div style={{ background: 'rgba(239, 68, 68, 0.2)', padding: '0.5rem', borderRadius: '10px' }}>
                  <TrendingDown size={20} color="#f87171" />
                </div>
              </div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f87171', marginTop: '0.6rem' }}>
                ₹{(report.summary.total_expense || 0).toLocaleString()}
              </h2>
            </div>

            {/* Net Savings Card */}
            <div className="glass-card glass-card-interactive">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Net Savings</span>
                <div style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '0.5rem', borderRadius: '10px' }}>
                  <PiggyBank size={20} color="#60a5fa" />
                </div>
              </div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: (report.summary.net_savings || 0) >= 0 ? '#60a5fa' : '#f87171', marginTop: '0.6rem' }}>
                ₹{(report.summary.net_savings || 0).toLocaleString()}
              </h2>
            </div>
          </div>

          {/* Category Summary Table */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>
              Category Wise Breakdown
            </h3>
            <div className="custom-table-wrapper">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Category Name</th>
                    <th>Type</th>
                    <th>Transactions Count</th>
                    <th style={{ textAlign: 'right' }}>Total Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {report.category_summary.length > 0 ? (
                    report.category_summary.map((row, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: 600 }}>{row.name}</td>
                        <td>
                          <span className={row.type === 'income' ? 'badge badge-income' : 'badge badge-expense'}>
                            {row.type}
                          </span>
                        </td>
                        <td>{row.count}</td>
                        <td style={{ textAlign: 'right', fontWeight: 700, color: row.type === 'income' ? '#34d399' : '#f87171' }}>
                          ₹{parseFloat(row.total).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                        No transactions found for the selected date range.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
