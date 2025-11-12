const express = require('express');
const router = express.Router();
const EnseignantController = require('../controllers/enseignantController');
const { authMiddleware, checkRole } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(authMiddleware);
router.use(checkRole('admin', 'directeur'));

router.get('/', EnseignantController.index);
router.get('/create', EnseignantController.showCreate);
router.post('/create', EnseignantController.create);
router.get('/edit/:id', EnseignantController.showEdit);
router.post('/edit/:id', EnseignantController.update);
router.post('/delete/:id', EnseignantController.delete);

// Routes d'importation CSV
router.get('/import', EnseignantController.showImport);
router.post('/import', upload.single('csvFile'), EnseignantController.importCSV);
router.get('/template', EnseignantController.downloadTemplate);

module.exports = router;