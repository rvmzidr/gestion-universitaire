const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Departement = require('../models/Departement');
const Enseignant = require('../models/Enseignant');
const Etudiant = require('../models/Etudiant');
const fs = require('fs');
const path = require('path');
const db = require('../config/database');

// Liste blanche des rôles autorisés
const ALLOWED_ROLES = ['etudiant', 'enseignant', 'directeur', 'admin'];
const ROLES_REQUIRING_DEPARTMENT = ['etudiant', 'enseignant', 'directeur'];

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

            const formData = {
                nom: '',
                prenom: '',
                email: '',
                login: '',
                role: 'etudiant',
                id_departement: ''
            };

            res.render('auth/register', {
                layout: 'main',
                title: 'Inscription',
                isAdmin,
                departements,
                formData,
                showDepartementField: true
            });
        } catch (error) {
            console.error('Erreur lors du chargement de la page d\'inscription:', error);
            res.render('auth/register', {
                layout: 'main',
                title: 'Inscription',
                isAdmin: req.user && req.user.role === 'admin',
                departements: [],
                formData: {
                    nom: '',
                    prenom: '',
                    email: '',
                    login: '',
                    role: 'etudiant',
                    id_departement: ''
                },
                showDepartementField: true,
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
                const formData = { ...req.body };
                if (!formData.role) {
                    formData.role = 'etudiant';
                }

                res.render('auth/register', {
                    layout: 'main',
                    error: message,
                    title: 'Inscription',
                    isAdmin,
                    departements,
                    formData,
                    showDepartementField: ROLES_REQUIRING_DEPARTMENT.includes(formData.role)
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

            let selectedDepartementId = null;

            if (ROLES_REQUIRING_DEPARTMENT.includes(role)) {
                selectedDepartementId = req.body.id_departement ? Number.parseInt(req.body.id_departement, 10) : null;

                if (!selectedDepartementId || Number.isNaN(selectedDepartementId)) {
                    return renderWithError('Veuillez sélectionner un département pour ce rôle.');
                }
            }

            if (role === 'directeur') {
                const existingDirector = await User.findDirectorByDepartement(selectedDepartementId);
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

            // Vérifier si l'email existe déjà dans les tables enseignants/étudiants
            if (role === 'enseignant') {
                const existingEnseignant = await Enseignant.findByEmail(email);
                if (existingEnseignant) {
                    return renderWithError('Cet email est déjà utilisé par un enseignant. Si vous avez déjà un compte enseignant, veuillez vous connecter.');
                }
            } else if (role === 'etudiant') {
                const existingEtudiant = await Etudiant.findByEmail(email);
                if (existingEtudiant) {
                    return renderWithError('Cet email est déjà utilisé par un étudiant. Si vous avez déjà un compte étudiant, veuillez vous connecter.');
                }
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
                id_departement: selectedDepartementId
            });

            // Créer automatiquement l'entrée dans la table enseignants ou étudiants
            if (role === 'enseignant') {
                await Enseignant.create({
                    nom,
                    prenom,
                    email,
                    id_departement: selectedDepartementId,
                    telephone: req.body.telephone || null,
                    id_utilisateur: userId
                });
                console.log(`✅ Enseignant créé automatiquement pour: ${email}`);
            } else if (role === 'etudiant') {
                // Pour l'étudiant, on a besoin du CIN et potentiellement du groupe
                const cin = req.body.cin || `CIN${userId}`;
                let id_groupe = req.body.id_groupe ? Number.parseInt(req.body.id_groupe, 10) || null : null;
                let id_specialite = req.body.id_specialite ? Number.parseInt(req.body.id_specialite, 10) || null : null;
                
                // Si groupe/spécialité non fournis, utiliser les premiers du département
                if (!id_groupe || !id_specialite) {
                    // Trouver la première spécialité du département
                    const [specialites] = await db.query(
                        'SELECT id FROM specialites WHERE id_departement = ? ORDER BY nom LIMIT 1',
                        [selectedDepartementId]
                    );
                    if (specialites.length > 0) {
                        id_specialite = specialites[0].id;
                        
                        // Trouver le premier groupe de cette spécialité
                        const [groupes] = await db.query(
                            'SELECT id FROM groupes WHERE id_specialite = ? ORDER BY nom LIMIT 1',
                            [id_specialite]
                        );
                        if (groupes.length > 0) {
                            id_groupe = groupes[0].id;
                        }
                    }
                }
                
                // Récupérer le niveau depuis le groupe si disponible
                let id_niveau = null;
                if (id_groupe) {
                    const [rows] = await db.query('SELECT id_niveau FROM groupes WHERE id = ?', [id_groupe]);
                    if (rows.length > 0) {
                        id_niveau = rows[0].id_niveau;
                    }
                }
                
                await Etudiant.create({
                    cin,
                    nom,
                    prenom,
                    email,
                    id_groupe,
                    id_specialite,
                    id_niveau,
                    date_naissance: req.body.date_naissance || null,
                    adresse: req.body.adresse || null,
                    id_utilisateur: userId
                });
                console.log(`✅ Étudiant créé automatiquement pour: ${email}`);
            }

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
                formData: {
                    ...req.body,
                    role: req.body.role || 'etudiant'
                },
                showDepartementField: ROLES_REQUIRING_DEPARTMENT.includes(req.body.role || 'etudiant')
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
                console.log(`❌ Tentative de connexion échouée: Login "${login}" introuvable`);
                return res.render('auth/login', {
                    layout: 'main',
                    error: 'Login ou mot de passe incorrect',
                    title: 'Connexion'
                });
            }

            // Vérifier que mdp_hash existe
            if (!user.mdp_hash) {
                console.error(`❌ Erreur: L'utilisateur ${login} n'a pas de mot de passe hashé dans la base`);
                return res.render('auth/login', {
                    layout: 'main',
                    error: 'Erreur de configuration du compte. Contactez l\'administrateur.',
                    title: 'Connexion'
                });
            }

            // Vérifier le mot de passe
            const isMatch = await bcrypt.compare(password, user.mdp_hash);
            if (!isMatch) {
                console.log(`❌ Tentative de connexion échouée: Mot de passe incorrect pour ${login}`);
                return res.render('auth/login', {
                    layout: 'main',
                    error: 'Login ou mot de passe incorrect',
                    title: 'Connexion'
                });
            }
            
            console.log(`✅ Connexion réussie pour: ${login} (${user.role})`);

            // Créer le token JWT
            const token = jwt.sign(
                {
                    id: user.id,
                    login: user.login,
                    email: user.email,
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
            
            // Charger le département si l'utilisateur en a un
            let departement = null;
            if (user.id_departement) {
                departement = await Departement.findById(user.id_departement);
            }
            
            // Charger tous les départements pour le formulaire de modification
            const departements = await Departement.findAll();
            
            res.render('auth/profile', {
                layout: 'main',
                title: 'Mon Profil',
                user,
                departement,
                departements,
                success: req.query.success,
                error: req.query.error
            });
        } catch (error) {
            console.error(error);
            res.redirect('/dashboard');
        }
    }

    // Mettre à jour le profil
    static async updateProfile(req, res) {
        try {
            const userId = req.user.id;
            const { nom, prenom, email, login } = req.body;

            // Validation
            if (!nom || !prenom || !email || !login) {
                return res.redirect('/auth/profile?error=missing_fields');
            }

            // Vérifier si l'email existe déjà (sauf pour l'utilisateur actuel)
            const existingUserByEmail = await User.findByEmail(email);
            if (existingUserByEmail && existingUserByEmail.id !== userId) {
                return res.redirect('/auth/profile?error=email_exists');
            }

            // Vérifier si le login existe déjà (sauf pour l'utilisateur actuel)
            const existingUserByLogin = await User.findByLogin(login);
            if (existingUserByLogin && existingUserByLogin.id !== userId) {
                return res.redirect('/auth/profile?error=login_exists');
            }

            // Mettre à jour les informations
            await User.update(userId, {
                nom,
                prenom,
                email,
                login
            });

            res.redirect('/auth/profile?success=profile_updated');
        } catch (error) {
            console.error('Erreur lors de la mise à jour du profil:', error);
            res.redirect('/auth/profile?error=update_failed');
        }
    }

    // Changer le mot de passe
    static async changePassword(req, res) {
        try {
            const userId = req.user.id;
            const { current_password, new_password, confirm_password } = req.body;

            // Validation
            if (!current_password || !new_password || !confirm_password) {
                return res.redirect('/auth/profile?error=password_missing_fields');
            }

            if (new_password !== confirm_password) {
                return res.redirect('/auth/profile?error=password_mismatch');
            }

            if (new_password.length < 6) {
                return res.redirect('/auth/profile?error=password_too_short');
            }

            // Récupérer l'utilisateur
            const user = await User.findById(userId);
            if (!user) {
                return res.redirect('/auth/profile?error=user_not_found');
            }

            // Vérifier le mot de passe actuel
            const isPasswordValid = await bcrypt.compare(current_password, user.mdp_hash);
            if (!isPasswordValid) {
                return res.redirect('/auth/profile?error=wrong_current_password');
            }

            // Hasher le nouveau mot de passe
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(new_password, salt);

            // Mettre à jour le mot de passe
            await User.update(userId, {
                mdp_hash: hashedPassword
            });

            res.redirect('/auth/profile?success=password_changed');
        } catch (error) {
            console.error('Erreur lors du changement de mot de passe:', error);
            res.redirect('/auth/profile?error=password_change_failed');
        }
    }
}

module.exports = AuthController;