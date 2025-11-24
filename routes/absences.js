const express = require('express');
const router = express.Router();
const AbsenceController = require('../controllers/absenceController');
const { authMiddleware, checkRole } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

// Configuration multer pour les justificatifs
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'justificatif-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = /pdf|jpg|jpeg|png/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Seuls les fichiers PDF, JPG et PNG sont acceptés'));
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB max
    }
});

router.use(authMiddleware);

// Liste des absences (tous les rôles)
router.get('/', AbsenceController.list);

// Statistiques
router.get('/statistics', AbsenceController.statistics);

// Formulaire d'ajout (enseignant/directeur)
router.get('/create', checkRole('directeur', 'enseignant'), AbsenceController.createForm);

// Créer des absences
router.post('/create', checkRole('directeur', 'enseignant'), AbsenceController.create);

// Formulaire de modification (directeur uniquement)
router.get('/edit/:id', checkRole('directeur'), AbsenceController.editForm);

// Mettre à jour une absence (directeur uniquement)
router.post('/edit/:id', checkRole('directeur'), upload.single('justificatif'), AbsenceController.update);

// Supprimer une absence (directeur uniquement)
router.post('/delete/:id', checkRole('directeur'), AbsenceController.delete);

// Valider/Refuser une justification (directeur uniquement)
router.post('/validate/:id', checkRole('directeur'), AbsenceController.validateJustification);

// Soumettre un justificatif (étudiant)
router.post('/justify/:id', checkRole('etudiant'), upload.single('justificatif'), AbsenceController.submitJustification);

// API: Liste des étudiants d'un cours
router.get('/api/cours/:id_cours/etudiants', checkRole('admin', 'enseignant'), AbsenceController.getStudentsByCours);

module.exports = router;
