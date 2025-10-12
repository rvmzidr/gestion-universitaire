const express = require('express');
const { engine } = require('express-handlebars');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const app = express();

// Configuration Handlebars
app.engine('hbs', engine({
    extname: '.hbs',
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views/layouts'),
    helpers: {
        eq: (a, b) => a === b
    }
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// Middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 }
}));
app.use(express.static(path.join(__dirname, 'public')));

// Middleware pour passer les paramètres query aux vues
app.use((req, res, next) => {
    res.locals.success = req.query.success;
    res.locals.error = req.query.error;
    next();
});

// Routes
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const departementRoutes = require('./routes/departements');
const enseignantRoutes = require('./routes/enseignants');
const etudiantRoutes = require('./routes/etudiants');

app.use('/auth', authRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/departements', departementRoutes);
app.use('/enseignants', enseignantRoutes);
app.use('/etudiants', etudiantRoutes);

// Page d'accueil (redirection)
app.get('/', (req, res) => {
    res.redirect('/auth/login');
});

// Gestion des erreurs 404
app.use((req, res) => {
    res.status(404).render('error', {
        layout: 'main',
        title: 'Page non trouvée',
        message: 'La page que vous recherchez n\'existe pas.'
    });
});

// Démarrer le serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Serveur démarré sur http://localhost:${PORT}`);
    console.log(`📊 Base de données: ${process.env.DB_NAME}`);
});