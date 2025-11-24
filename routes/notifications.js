const express = require('express');
const router = express.Router();
const NotificationController = require('../controllers/notificationController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', NotificationController.index);
router.post('/mark-read/:id', NotificationController.markRead);
router.post('/mark-all', NotificationController.markAllRead);

module.exports = router;
