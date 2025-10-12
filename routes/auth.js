const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Routes publiques
router.get('/login', AuthController.showLogin);
router.post('/login', AuthController.login);
router.get('/register', AuthController.showRegister);
router.post('/register', AuthController.register);

// Routes protégées
router.get('/logout', authMiddleware, AuthController.logout);
router.get('/profile', authMiddleware, AuthController.showProfile);

module.exports = router;