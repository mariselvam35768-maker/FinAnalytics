/**
 * Personal Finance Analytics Dashboard
 * Chart.js Configurations and Data Loading
 */

// Color palettes
const COLORS = {
    income: 'rgba(16, 185, 129, 1)',
    incomeLight: 'rgba(16, 185, 129, 0.15)',
    expense: 'rgba(239, 68, 68, 1)',
    expenseLight: 'rgba(239, 68, 68, 0.15)',
    savings: 'rgba(99, 102, 241, 1)',
    savingsLight: 'rgba(99, 102, 241, 0.15)',
    grid: 'rgba(148, 163, 184, 0.1)',
    text: 'rgba(148, 163, 184, 0.8)',
    pie: [
        '#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f59e0b',
        '#10b981', '#06b6d4', '#3b82f6', '#a855f7', '#f97316',
        '#14b8a6', '#84cc16', '#d946ef', '#0ea5e9', '#f43f5e',
        '#22c55e', '#eab308'
    ]
};

// Default Chart.js options
const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            labels: {
                color: COLORS.text,
                font: { family: "'Inter', sans-serif", size: 12 },
                usePointStyle: true,
                padding: 16
            }
        },
        tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            titleColor: '#f1f5f9',
            bodyColor: '#94a3b8',
            borderColor: 'rgba(148, 163, 184, 0.2)',
            borderWidth: 1,
            cornerRadius: 10,
            padding: 12,
            titleFont: { family: "'Inter', sans-serif", weight: '600' },
            bodyFont: { family: "'Inter', sans-serif" },
            displayColors: true,
            usePointStyle: true
        }
    },
    scales: {
        x: {
            grid: { color: COLORS.grid, drawBorder: false },
            ticks: { color: COLORS.text, font: { family: "'Inter', sans-serif", size: 11 } }
        },
        y: {
            grid: { color: COLORS.grid, drawBorder: false },
            ticks: {
                color: COLORS.text,
                font: { family: "'Inter', sans-serif", size: 11 },
                callback: function(value) {
                    if (value >= 10000000) return '₹' + (value / 10000000).toFixed(1) + 'Cr';
                    if (value >= 100000) return '₹' + (value / 100000).toFixed(1) + 'L';
                    if (value >= 1000) return '₹' + (value / 1000).toFixed(1) + 'K';
                    return '₹' + value;
                }
            }
        }
    }
};

const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'right',
            labels: {
                color: COLORS.text,
                font: { family: "'Inter', sans-serif", size: 11 },
                usePointStyle: true,
                padding: 10
            }
        },
        tooltip: defaultOptions.plugins.tooltip
    }
};

// Store chart instances
const charts = {};

// Month names
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/* ============================================================
   Initialize All Charts
   ============================================================ */
document.addEventListener('DOMContentLoaded', function() {
    loadDailyChart(30);
    loadMonthlyTrend();
    loadCategoryCharts();
    loadSavingsTrend();
    loadCashFlow();
    loadWeeklyChart();
    loadYearlyChart();
});

/* ============================================================
   Daily Income vs Expense Bar Chart
   ============================================================ */
function loadDailyChart(days) {
    fetch('index.php?page=charts&action=daily&days=' + days)
        .then(function(r) { return r.json(); })
        .then(function(data) {
            const labels = data.map(function(d) {
                var dt = new Date(d.date);
                return dt.getDate() + ' ' + MONTHS[dt.getMonth()];
            });

            if (charts.daily) charts.daily.destroy();

            charts.daily = new Chart(document.getElementById('dailyChart'), {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: 'Income',
                            data: data.map(function(d) { return d.income; }),
                            backgroundColor: COLORS.incomeLight,
                            borderColor: COLORS.income,
                            borderWidth: 2,
                            borderRadius: 6,
                            barPercentage: 0.6
                        },
                        {
                            label: 'Expense',
                            data: data.map(function(d) { return d.expense; }),
                            backgroundColor: COLORS.expenseLight,
                            borderColor: COLORS.expense,
                            borderWidth: 2,
                            borderRadius: 6,
                            barPercentage: 0.6
                        }
                    ]
                },
                options: defaultOptions
            });
        }).catch(function() {});
}

/* ============================================================
   Monthly Income & Expense Trend Line Charts
   ============================================================ */
function loadMonthlyTrend() {
    fetch('index.php?page=charts&action=monthly')
        .then(function(r) { return r.json(); })
        .then(function(data) {
            var labels = data.map(function(d) { return MONTHS[d.month - 1]; });
            var incomeData = data.map(function(d) { return d.income; });
            var expenseData = data.map(function(d) { return d.expense; });

            // Income Trend
            if (charts.monthlyIncome) charts.monthlyIncome.destroy();
            charts.monthlyIncome = new Chart(document.getElementById('monthlyIncomeChart'), {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Income',
                        data: incomeData,
                        borderColor: COLORS.income,
                        backgroundColor: COLORS.incomeLight,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 4,
                        pointBackgroundColor: COLORS.income,
                        borderWidth: 2
                    }]
                },
                options: defaultOptions
            });

            // Expense Trend
            if (charts.monthlyExpense) charts.monthlyExpense.destroy();
            charts.monthlyExpense = new Chart(document.getElementById('monthlyExpenseChart'), {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Expense',
                        data: expenseData,
                        borderColor: COLORS.expense,
                        backgroundColor: COLORS.expenseLight,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 4,
                        pointBackgroundColor: COLORS.expense,
                        borderWidth: 2
                    }]
                },
                options: defaultOptions
            });

            // Comparison chart (Income vs Expense)
            if (charts.comparison) charts.comparison.destroy();
            var compEl = document.getElementById('comparisonChart');
            if (compEl) {
                charts.comparison = new Chart(compEl, {
                    type: 'bar',
                    data: {
                        labels: labels,
                        datasets: [
                            {
                                label: 'Income',
                                data: incomeData,
                                backgroundColor: COLORS.incomeLight,
                                borderColor: COLORS.income,
                                borderWidth: 2,
                                borderRadius: 6
                            },
                            {
                                label: 'Expense',
                                data: expenseData,
                                backgroundColor: COLORS.expenseLight,
                                borderColor: COLORS.expense,
                                borderWidth: 2,
                                borderRadius: 6
                            }
                        ]
                    },
                    options: defaultOptions
                });
            }
        }).catch(function() {});
}

/* ============================================================
   Category Pie/Doughnut Charts
   ============================================================ */
function loadCategoryCharts() {
    // Expense Pie
    fetch('index.php?page=charts&action=category&type=expense')
        .then(function(r) { return r.json(); })
        .then(function(data) {
            if (charts.expensePie) charts.expensePie.destroy();
            var el = document.getElementById('expensePieChart');
            if (!el) return;
            charts.expensePie = new Chart(el, {
                type: 'doughnut',
                data: {
                    labels: data.map(function(d) { return d.name; }),
                    datasets: [{
                        data: data.map(function(d) { return d.total; }),
                        backgroundColor: data.map(function(d, i) { return d.color || COLORS.pie[i % COLORS.pie.length]; }),
                        borderWidth: 0,
                        hoverOffset: 6
                    }]
                },
                options: pieOptions
            });
        }).catch(function() {});

    // Income Pie
    fetch('index.php?page=charts&action=category&type=income')
        .then(function(r) { return r.json(); })
        .then(function(data) {
            if (charts.incomePie) charts.incomePie.destroy();
            var el = document.getElementById('incomePieChart');
            if (!el) return;
            charts.incomePie = new Chart(el, {
                type: 'doughnut',
                data: {
                    labels: data.map(function(d) { return d.name; }),
                    datasets: [{
                        data: data.map(function(d) { return d.total; }),
                        backgroundColor: data.map(function(d, i) { return d.color || COLORS.pie[i % COLORS.pie.length]; }),
                        borderWidth: 0,
                        hoverOffset: 6
                    }]
                },
                options: pieOptions
            });
        }).catch(function() {});
}

/* ============================================================
   Savings Trend
   ============================================================ */
function loadSavingsTrend() {
    fetch('index.php?page=charts&action=savings')
        .then(function(r) { return r.json(); })
        .then(function(data) {
            if (charts.savings) charts.savings.destroy();
            var el = document.getElementById('savingsChart');
            if (!el) return;
            charts.savings = new Chart(el, {
                type: 'line',
                data: {
                    labels: data.map(function(d) { return MONTHS[d.month - 1]; }),
                    datasets: [{
                        label: 'Savings',
                        data: data.map(function(d) { return d.savings; }),
                        borderColor: COLORS.savings,
                        backgroundColor: COLORS.savingsLight,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 5,
                        pointBackgroundColor: COLORS.savings,
                        borderWidth: 2
                    }]
                },
                options: defaultOptions
            });
        }).catch(function() {});
}

/* ============================================================
   Cash Flow Chart
   ============================================================ */
function loadCashFlow() {
    fetch('index.php?page=charts&action=cashflow')
        .then(function(r) { return r.json(); })
        .then(function(data) {
            if (charts.cashFlow) charts.cashFlow.destroy();
            var el = document.getElementById('cashFlowChart');
            if (!el) return;

            var runningTotal = 0;
            var runningData = data.map(function(d) {
                runningTotal += parseFloat(d.net);
                return runningTotal;
            });

            charts.cashFlow = new Chart(el, {
                type: 'line',
                data: {
                    labels: data.map(function(d) {
                        var dt = new Date(d.transaction_date);
                        return dt.getDate() + ' ' + MONTHS[dt.getMonth()];
                    }),
                    datasets: [{
                        label: 'Cash Flow',
                        data: runningData,
                        borderColor: '#06b6d4',
                        backgroundColor: 'rgba(6, 182, 212, 0.1)',
                        fill: true,
                        tension: 0.4,
                        pointRadius: 3,
                        borderWidth: 2
                    }]
                },
                options: defaultOptions
            });
        }).catch(function() {});
}

/* ============================================================
   Weekly Analytics
   ============================================================ */
function loadWeeklyChart() {
    fetch('index.php?page=charts&action=weekly')
        .then(function(r) { return r.json(); })
        .then(function(data) {
            if (charts.weekly) charts.weekly.destroy();
            var el = document.getElementById('weeklyChart');
            if (!el) return;

            charts.weekly = new Chart(el, {
                type: 'bar',
                data: {
                    labels: data.map(function(d, i) { return 'Week ' + (i + 1); }),
                    datasets: [
                        {
                            label: 'Income',
                            data: data.map(function(d) { return d.income; }),
                            backgroundColor: COLORS.incomeLight,
                            borderColor: COLORS.income,
                            borderWidth: 2,
                            borderRadius: 6
                        },
                        {
                            label: 'Expense',
                            data: data.map(function(d) { return d.expense; }),
                            backgroundColor: COLORS.expenseLight,
                            borderColor: COLORS.expense,
                            borderWidth: 2,
                            borderRadius: 6
                        }
                    ]
                },
                options: defaultOptions
            });
        }).catch(function() {});
}

/* ============================================================
   Yearly Analytics
   ============================================================ */
function loadYearlyChart() {
    fetch('index.php?page=charts&action=yearly')
        .then(function(r) { return r.json(); })
        .then(function(data) {
            if (charts.yearly) charts.yearly.destroy();
            var el = document.getElementById('yearlyChart');
            if (!el) return;

            charts.yearly = new Chart(el, {
                type: 'bar',
                data: {
                    labels: data.map(function(d) { return d.year; }),
                    datasets: [
                        {
                            label: 'Income',
                            data: data.map(function(d) { return d.income; }),
                            backgroundColor: COLORS.incomeLight,
                            borderColor: COLORS.income,
                            borderWidth: 2,
                            borderRadius: 8
                        },
                        {
                            label: 'Expense',
                            data: data.map(function(d) { return d.expense; }),
                            backgroundColor: COLORS.expenseLight,
                            borderColor: COLORS.expense,
                            borderWidth: 2,
                            borderRadius: 8
                        }
                    ]
                },
                options: defaultOptions
            });
        }).catch(function() {});
}

/* ============================================================
   Theme Update for Charts
   ============================================================ */
function updateChartTheme(theme) {
    var textColor = theme === 'dark' ? 'rgba(148, 163, 184, 0.8)' : 'rgba(71, 85, 105, 0.8)';
    var gridColor = theme === 'dark' ? 'rgba(148, 163, 184, 0.1)' : 'rgba(0, 0, 0, 0.06)';

    Object.values(charts).forEach(function(chart) {
        if (!chart || !chart.options) return;
        if (chart.options.scales && chart.options.scales.x) {
            chart.options.scales.x.grid.color = gridColor;
            chart.options.scales.x.ticks.color = textColor;
        }
        if (chart.options.scales && chart.options.scales.y) {
            chart.options.scales.y.grid.color = gridColor;
            chart.options.scales.y.ticks.color = textColor;
        }
        if (chart.options.plugins && chart.options.plugins.legend) {
            chart.options.plugins.legend.labels.color = textColor;
        }
        chart.update('none');
    });
}
