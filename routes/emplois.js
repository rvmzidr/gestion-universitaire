const express = require('express');
const router = express.Router();
const EmploiController = require('../controllers/emploiController');
const { authMiddleware, checkRole } = require('../middleware/authMiddleware');

router.use(authMiddleware);

// Route commune pour étudiants et enseignants
router.get('/mon', EmploiController.showMyTimetable);

// Routes pour admin et directeur
router.get('/admin', checkRole('admin'), EmploiController.showAdminTimetable);
router.get('/directeur', checkRole('directeur'), EmploiController.showDirecteurTimetable);

// Route pour afficher l'emploi d'un étudiant spécifique (pour directeurs/admins)
router.get('/etudiant/:id', checkRole('admin', 'directeur'), EmploiController.showSpecificStudentTimetable);

module.exports = router;
