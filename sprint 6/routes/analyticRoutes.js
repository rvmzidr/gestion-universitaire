const express = require('express');
const router = express.Router();
const { getAbsenceStats, getRoomUsage, exportAbsencePDF, exportAbsenceCSV } = require('../config/controllers/analyticController');

// statistiques
router.get('/absences', getAbsenceStats);
router.get('/room-usage', getRoomUsage);

// exports
router.get('/export/pdf', exportAbsencePDF);
router.get('/export/csv', exportAbsenceCSV);

module.exports = router;
