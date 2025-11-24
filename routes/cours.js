const express = require('express');
const router = express.Router();
const CoursController = require('../controllers/coursController');
const { authMiddleware, checkRole } = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', checkRole('admin', 'directeur', 'enseignant', 'etudiant'), CoursController.index);

router.get('/create', checkRole('admin', 'directeur'), CoursController.showCreate);
router.post('/create', checkRole('admin', 'directeur'), CoursController.create);
router.get('/edit/:id', checkRole('admin', 'directeur'), CoursController.showEdit);
router.post('/edit/:id', checkRole('admin', 'directeur'), CoursController.update);
router.post('/delete/:id', checkRole('admin', 'directeur'), CoursController.delete);

module.exports = router;
