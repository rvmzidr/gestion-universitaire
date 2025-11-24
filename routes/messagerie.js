const express = require('express');
const router = express.Router();
const MessagingController = require('../controllers/messagingController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', MessagingController.index);
router.post('/', MessagingController.sendMessage);

module.exports = router;
