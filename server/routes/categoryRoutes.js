const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/', authenticateToken, categoryController.getCategories);

module.exports = router;
