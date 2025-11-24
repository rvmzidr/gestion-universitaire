const express = require('express');
const router = express.Router();
const { authMiddleware, optionalAuth } = require('../middleware/authMiddleware');
const controller = require('../controllers/emploisApiController');

// apiRole returns JSON 403 for API routes (instead of rendering the error view)
const apiRole = (...roles) => (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
        return res.status(403).json({ error: 'Accès non autorisé' });
    }
    next();
};

// List emplois for a groupe (public-ish: optional auth)
router.get('/', optionalAuth, controller.listForGroup);

// Conflict check (requires director/admin)
router.post('/check-conflict', authMiddleware, apiRole('directeur', 'admin'), controller.checkConflict);

// Create / Update / Delete (requires director/admin)
router.post('/', authMiddleware, apiRole('directeur', 'admin'), controller.create);
router.put('/:id', authMiddleware, apiRole('directeur', 'admin'), controller.update);
router.delete('/:id', authMiddleware, apiRole('directeur', 'admin'), controller.remove);

module.exports = router;
