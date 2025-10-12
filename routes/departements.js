const express = require('express');
const router = express.Router();
const DepartementController = require('../controllers/departementController');
const { authMiddleware, checkRole } = require('../middleware/authMiddleware');

// Toutes les routes nécessitent l'authentification et le rôle admin
router.use(authMiddleware);
router.use(checkRole('admin'));

router.get('/', DepartementController.index);
router.get('/create', DepartementController.showCreate);
router.post('/create', DepartementController.create);
router.get('/edit/:id', DepartementController.showEdit);
router.post('/edit/:id', DepartementController.update);
router.post('/delete/:id', DepartementController.delete);

module.exports = router;