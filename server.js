const express = require('express');
const { engine } = require('express-handlebars');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./config/database');
require('dotenv').config();

const app = express();

// Configuration Handlebars
app.engine('hbs', engine({
    extname: '.hbs',
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views/layouts'),
    helpers: {
        eq: (a, b) => {
            if (a === undefined || a === null) return false;
            if (b === undefined || b === null) return false;
            return String(a) === String(b);
        },
        isIn: (value, ...args) => {
            const options = args.pop();
            if (value === undefined || value === null) return false;
            return args.some(item => String(item) === String(value));
        },
        substring: (str, start, end) => {
            if (!str) return '';
            return String(str).substring(start, end);
        },
        json: (context) => {
            return JSON.stringify(context);
        },
        math: (value, total) => {
            if (!total || total === 0) return { percent: 0 };
            const percent = Math.round((value / total) * 100);
            return { percent };
        },
        or: function(...args) {
            // Le dernier argument est l'objet options de Handlebars
            const options = args.pop();
            // Retourne true si au moins un argument est truthy
            return args.some(arg => !!arg);
        }
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
const coursRoutes = require('./routes/cours');
const emploisRoutes = require('./routes/emplois');
const messagesRoutes = require('./routes/messages');
const absencesRoutes = require('./routes/absences');
const notesRoutes = require('./routes/notes');

app.use('/auth', authRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/departements', departementRoutes);
app.use('/enseignants', enseignantRoutes);
app.use('/etudiants', etudiantRoutes);
app.use('/cours', coursRoutes);
app.use('/emplois', emploisRoutes);
app.use('/messages', messagesRoutes);
app.use('/absences', absencesRoutes);
app.use('/notes', notesRoutes);

// Routes API pour le formulaire d'inscription
app.get('/api/specialites', async (req, res) => {
    try {
        const { id_departement } = req.query;
        const [specialites] = await db.query(
            'SELECT id, nom FROM specialites WHERE id_departement = ? ORDER BY nom',
            [id_departement]
        );
        res.json(specialites);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors du chargement des spécialités' });
    }
});

app.get('/api/groupes', async (req, res) => {
    try {
        const { id_specialite } = req.query;
        const [groupes] = await db.query(
            'SELECT id, nom FROM groupes WHERE id_specialite = ? ORDER BY nom',
            [id_specialite]
        );
        res.json(groupes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors du chargement des groupes' });
    }
});

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