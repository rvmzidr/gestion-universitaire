const express = require('express');
const router = express.Router();
const EtudiantController = require('../controllers/etudiantController');
const { authMiddleware, checkRole } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(authMiddleware);
router.use(checkRole('admin', 'directeur'));

router.get('/', EtudiantController.index);
router.get('/create', EtudiantController.showCreate);
router.post('/create', EtudiantController.create);
router.get('/edit/:id', EtudiantController.showEdit);
router.post('/edit/:id', EtudiantController.update);
router.post('/delete/:id', EtudiantController.delete);

// Routes d'importation CSV
router.get('/import', EtudiantController.showImport);
router.post('/import', upload.single('csvFile'), EtudiantController.importCSV);
router.get('/template', EtudiantController.downloadTemplate);

module.exports = router;