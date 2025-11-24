const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { authMiddleware, optionalAuth } = require('../middleware/authMiddleware');

// Routes publiques (avec authentification optionnelle pour register)
router.get('/login', AuthController.showLogin);
router.post('/login', AuthController.login);
router.get('/register', optionalAuth, AuthController.showRegister);
router.post('/register', optionalAuth, AuthController.register);

// Routes protégées
router.get('/logout', authMiddleware, AuthController.logout);
router.get('/profile', authMiddleware, AuthController.showProfile);
router.post('/profile/update', authMiddleware, AuthController.updateProfile);
router.post('/profile/change-password', authMiddleware, AuthController.changePassword);

module.exports = router;