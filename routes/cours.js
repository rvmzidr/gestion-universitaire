const express = require('express');
const router = express.Router();
const CoursController = require('../controllers/coursController');
const { authMiddleware, checkRole } = require('../middleware/authMiddleware');

router.use(authMiddleware);
router.use(checkRole('admin', 'directeur'));

router.get('/', CoursController.index);
router.get('/create', CoursController.showCreate);
router.post('/create', CoursController.create);
router.get('/edit/:id', CoursController.showEdit);
router.post('/edit/:id', CoursController.update);
router.post('/delete/:id', CoursController.delete);

module.exports = router;
