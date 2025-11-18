const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Departement = require('../models/Departement');
const fs = require('fs');
const path = require('path');

// Liste blanche des rôles autorisés
const ALLOWED_ROLES = ['etudiant', 'enseignant', 'directeur', 'admin'];

class AuthController {
    // Fonction pour logger les tentatives de création de compte admin
    static logAdminCreationAttempt(data) {
        const logDir = path.join(__dirname, '../logs');
        const logFile = path.join(logDir, 'admin-creation.log');
        
        // Créer le dossier logs s'il n'existe pas
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }
        
        const logEntry = `[${new Date().toISOString()}] ${JSON.stringify(data)}\n`;
        fs.appendFileSync(logFile, logEntry);
    }

    // Page de connexion
    static showLogin(req, res) {
        res.render('auth/login', {
            layout: 'main',
            title: 'Connexion'
        });
    }

    // Page d'inscription
    static async showRegister(req, res) {
        try {
            const departements = await Departement.findAll();
            const isAdmin = req.user && req.user.role === 'admin';

            res.render('auth/register', {
                layout: 'main',
                title: 'Inscription',
                isAdmin,
                departements,
                formData: {}
            });
        } catch (error) {
            console.error('Erreur lors du chargement de la page d\'inscription:', error);
            res.render('auth/register', {
                layout: 'main',
                title: 'Inscription',
                isAdmin: req.user && req.user.role === 'admin',
                error: 'Impossible de charger la liste des départements pour le moment.'
            });
        }
    }

    // Traiter l'inscription
    static async register(req, res) {
        try {
            const { nom, prenom, email, login, password, role } = req.body;
            const departements = await Departement.findAll();
            const isAdmin = req.user && req.user.role === 'admin';

            const renderWithError = (message) => {
                res.render('auth/register', {
                    layout: 'main',
                    error: message,
                    title: 'Inscription',
                    isAdmin,
                    departements,
                    formData: req.body
                });
            };

            // 1. Validation du rôle avec liste blanche
            if (!role || !ALLOWED_ROLES.includes(role)) {
                return renderWithError('Rôle invalide. Veuillez sélectionner un rôle valide.');
            }

            // 2. Vérifier que seuls les admins peuvent créer des comptes admin
            if (role === 'admin') {
                const isAdmin = req.user && req.user.role === 'admin';
                
                // 3. Logger toutes les tentatives de création de compte admin
                AuthController.logAdminCreationAttempt({
                    success: false,
                    attemptedBy: req.user ? {
                        id: req.user.id,
                        login: req.user.login,
                        role: req.user.role
                    } : 'anonymous',
                    targetLogin: login,
                    targetEmail: email,
                    ip: req.ip || req.connection.remoteAddress,
                    userAgent: req.get('user-agent')
                });
                
                if (!isAdmin) {
                    return renderWithError('Seuls les administrateurs peuvent créer des comptes administrateur.');
                }
            }

            let directorDepartementId = null;
            if (role === 'directeur') {
                directorDepartementId = req.body.id_departement ? Number.parseInt(req.body.id_departement, 10) : null;

                if (!directorDepartementId || Number.isNaN(directorDepartementId)) {
                    return renderWithError('Veuillez sélectionner le département dont vous êtes directeur.');
                }

                const existingDirector = await User.findDirectorByDepartement(directorDepartementId);
                if (existingDirector) {
                    return renderWithError('Un directeur est déjà associé à ce département. Veuillez contacter l\'administrateur.');
                }
            }

            // Vérifier si l'utilisateur existe
            const existingUser = await User.findByLogin(login);
            if (existingUser) {
                return renderWithError('Ce login existe déjà');
            }

            const existingEmail = await User.findByEmail(email);
            if (existingEmail) {
                return renderWithError('Cet email existe déjà');
            }

            // Hasher le mot de passe
            const mdp_hash = await bcrypt.hash(password, 10);

            // Créer l'utilisateur
            const userId = await User.create({
                nom,
                prenom,
                email,
                login,
                mdp_hash,
                role: role || 'etudiant',
                id_departement: directorDepartementId
            });

            // Logger le succès de la création de compte admin
            if (role === 'admin') {
                AuthController.logAdminCreationAttempt({
                    success: true,
                    createdBy: {
                        id: req.user.id,
                        login: req.user.login,
                        role: req.user.role
                    },
                    newAdminId: userId,
                    newAdminLogin: login,
                    newAdminEmail: email,
                    ip: req.ip || req.connection.remoteAddress,
                    userAgent: req.get('user-agent')
                });
            }

            res.redirect('/auth/login?success=inscription');
        } catch (error) {
            console.error(error);
            const departements = await Departement.findAll();
            res.render('auth/register', {
                layout: 'main',
                error: 'Erreur lors de l\'inscription',
                title: 'Inscription',
                isAdmin: req.user && req.user.role === 'admin',
                departements,
                formData: req.body
            });
        }
    }

    // Traiter la connexion
    static async login(req, res) {
        try {
            const { login, password } = req.body;

            // Trouver l'utilisateur
            const user = await User.findByLogin(login);
            if (!user) {
                return res.render('auth/login', {
                    layout: 'main',
                    error: 'Login ou mot de passe incorrect',
                    title: 'Connexion'
                });
            }

            // Vérifier le mot de passe
            const isMatch = await bcrypt.compare(password, user.mdp_hash);
            if (!isMatch) {
                return res.render('auth/login', {
                    layout: 'main',
                    error: 'Login ou mot de passe incorrect',
                    title: 'Connexion'
                });
            }

            // Créer le token JWT
            const token = jwt.sign(
                {
                    id: user.id,
                    login: user.login,
                    role: user.role,
                    nom: user.nom,
                    prenom: user.prenom,
                    id_departement: user.id_departement || null
                },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRE }
            );

            // Sauvegarder le token
            res.cookie('token', token, {
                httpOnly: true,
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 jours
            });
            req.session.token = token;

            res.redirect('/dashboard');
        } catch (error) {
            console.error(error);
            res.render('auth/login', {
                layout: 'main',
                error: 'Erreur lors de la connexion',
                title: 'Connexion'
            });
        }
    }

    // Déconnexion
    static logout(req, res) {
        res.clearCookie('token');
        req.session.destroy();
        res.redirect('/auth/login');
    }

    // Page de profil
    static async showProfile(req, res) {
        try {
            const user = await User.findById(req.user.id);
            res.render('auth/profile', {
                layout: 'main',
                title: 'Mon Profil',
                user
            });
        } catch (error) {
            console.error(error);
            res.redirect('/dashboard');
        }
    }
}

module.exports = AuthController;