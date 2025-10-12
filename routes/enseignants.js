const express = require('express');
const router = express.Router();
const EnseignantController = require('../controllers/enseignantController');
const { authMiddleware, checkRole } = require('../middleware/authMiddleware');

router.use(authMiddleware);
router.use(checkRole('admin', 'directeur'));

router.get('/', EnseignantController.index);
router.get('/create', EnseignantController.showCreate);
router.post('/create', EnseignantController.create);
router.get('/edit/:id', EnseignantController.showEdit);
router.post('/edit/:id', EnseignantController.update);
router.post('/delete/:id', EnseignantController.delete);

module.exports = router;