const express = require('express');
const router = express.Router();
const NoteController = require('../controllers/noteController');
const { authMiddleware, checkRole } = require('../middleware/authMiddleware');

// Toutes les routes nécessitent l'authentification
router.use(authMiddleware);

// Liste des notes (tous les rôles)
router.get('/', NoteController.list);

// Vue étudiant - ses notes
router.get('/etudiant/:id', NoteController.studentView);

// Statistiques d'un cours (enseignant, admin, directeur)
router.get('/statistics', checkRole('enseignant', 'admin', 'directeur'), NoteController.statistics);

// Ajouter une note (enseignant uniquement)
router.get('/create', checkRole('enseignant'), NoteController.createForm);
router.post('/create', checkRole('enseignant'), NoteController.create);

// Modifier une note (enseignant uniquement)
router.get('/edit/:id', checkRole('enseignant'), NoteController.editForm);
router.post('/edit/:id', checkRole('enseignant'), NoteController.update);

// Supprimer une note (enseignant uniquement)
router.post('/delete/:id', checkRole('enseignant'), NoteController.delete);

// API - Récupérer les étudiants d'un cours
router.get('/api/cours/:id_cours/etudiants', checkRole('enseignant'), NoteController.getEtudiantsCours);

module.exports = router;
