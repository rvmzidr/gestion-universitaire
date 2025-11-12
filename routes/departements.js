const express = require('express');
const router = express.Router();
const DepartementController = require('../controllers/departementController');
const { authMiddleware, checkRole } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Toutes les routes nécessitent l'authentification et le rôle admin ou directeur
router.use(authMiddleware);
router.use(checkRole('admin', 'directeur'));

router.get('/', DepartementController.index);
router.get('/create', DepartementController.showCreate);
router.post('/create', DepartementController.create);
router.get('/edit/:id', DepartementController.showEdit);
router.post('/edit/:id', DepartementController.update);
router.post('/delete/:id', DepartementController.delete);

// Routes d'importation CSV
router.get('/import', DepartementController.showImport);
router.post('/import', upload.single('csvFile'), DepartementController.importCSV);
router.get('/template', DepartementController.downloadTemplate);

module.exports = router;