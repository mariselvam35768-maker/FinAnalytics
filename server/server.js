const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { initDB } = require('./config/db');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static upload files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const chartRoutes = require('./routes/chartRoutes');
const reportRoutes = require('./routes/reportRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const settingsRoutes = require('./routes/settingsRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/charts', chartRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/settings', settingsRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Personal Finance API Server is running' });
});

// Initialize Database & Start Server for local execution
initDB().catch(err => console.error('DB Init Error:', err));

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
  });
}

module.exports = app;
