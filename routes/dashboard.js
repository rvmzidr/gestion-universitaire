const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const DashboardController = require('../controllers/dashboardController');

router.get('/', authMiddleware, DashboardController.index);

module.exports = router;