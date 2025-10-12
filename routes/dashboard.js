const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');

router.get('/', authMiddleware, (req, res) => {
    res.render('dashboard/index', {
        layout: 'main',
        title: 'Tableau de bord',
        user: req.user
    });
});

module.exports = router;