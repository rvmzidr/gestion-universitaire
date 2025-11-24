const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const MessageController = require('../controllers/messageController');

router.use(authMiddleware);

router.get('/', MessageController.renderInbox);
router.get('/view/:threadId', MessageController.renderThread);
router.get('/contacts', MessageController.listContacts);
router.get('/threads', MessageController.listThreads);
router.get('/thread/:threadId', MessageController.getThread);
router.post('/send', MessageController.sendMessage);
router.patch('/thread/:threadId/read', MessageController.markThreadAsRead);

module.exports = router;
