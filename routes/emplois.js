const express = require('express');
const router = express.Router();
const EmploiController = require('../controllers/emploiController');
const { authMiddleware, checkRole } = require('../middleware/authMiddleware');

router.use(authMiddleware);
router.use(checkRole('etudiant'));

router.get('/mon', EmploiController.showStudentTimetable);

module.exports = router;
