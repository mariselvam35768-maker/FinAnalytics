const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/', authenticateToken, transactionController.getTransactions);
router.get('/export-csv', authenticateToken, transactionController.exportCSV);
router.get('/:id', authenticateToken, transactionController.getTransactionById);
router.post('/', authenticateToken, transactionController.createTransaction);
router.put('/:id', authenticateToken, transactionController.updateTransaction);
router.delete('/:id', authenticateToken, transactionController.deleteTransaction);

module.exports = router;
