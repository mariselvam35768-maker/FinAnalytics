const express = require('express');
const router = express.Router();
const chartController = require('../controllers/chartController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/daily', authenticateToken, chartController.getDailyChart);
router.get('/monthly', authenticateToken, chartController.getMonthlyChart);
router.get('/category', authenticateToken, chartController.getCategoryChart);
router.get('/savings', authenticateToken, chartController.getSavingsChart);

module.exports = router;
