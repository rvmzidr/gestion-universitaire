const Cours = require('../models/Cours');
const Enseignant = require('../models/Enseignant');
const Groupe = require('../models/Groupe');
const Salle = require('../models/Salle');
const Etudiant = require('../models/Etudiant');
const db = require('../config/database');

const DAY_OPTIONS = [
    { value: 'lundi', label: 'Lundi' },
    { value: 'mardi', label: 'Mardi' },
    { value: 'mercredi', label: 'Mercredi' },
    { value: 'jeudi', label: 'Jeudi' },
    { value: 'vendredi', label: 'Vendredi' },
    { value: 'samedi', label: 'Samedi' }
];

const TYPE_OPTIONS = [
    { value: 'cm', label: 'Cours magistral' },
    { value: 'td', label: 'Travaux dirigés' },
    { value: 'tp', label: 'Travaux pratiques' },
    { value: 'atelier', label: 'Atelier' },
    { value: 'examen', label: 'Examen' }
];

class CoursController {
    static async index(req, res) {
        try {
            const role = req.user?.role;
            const successQuery = req.query.success || null;
            const errorQuery = req.query.error || null;

            // Récupération des filtres
            const filterDeptId = req.query.id_departement || '';
            const filterEnseignantId = req.query.id_enseignant || '';
            const filterGroupeId = req.query.id_groupe || '';
            const filterType = req.query.type_cours || '';
            const filterJour = req.query.jour || '';

            let cours = [];
            let missingDepartement = false;
            let infoMessage = null;
            let pageTitle = 'Gestion des cours';

            const isAdmin = role === 'admin';
            const isDirector = role === 'directeur';
            const isTeacher = role === 'enseignant';
            const isStudent = role === 'etudiant';
            const directorDepartementId = CoursController._getDirectorDepartmentId(req.user);

            // Construction des options de filtrage
            const filterOptions = {};
            if (filterDeptId) filterOptions.id_departement = filterDeptId;
            if (filterEnseignantId) filterOptions.id_enseignant = filterEnseignantId;
            if (filterGroupeId) filterOptions.id_groupe = filterGroupeId;
            if (filterType) filterOptions.type_cours = filterType;
            if (filterJour) filterOptions.jour = filterJour;

            if (isAdmin) {
                cours = await Cours.findAllWithDetails(filterOptions);
            } else if (isDirector) {
                pageTitle = 'Cours du département';
                if (directorDepartementId) {
                    const directorOptions = { ...filterOptions, id_departement: directorDepartementId };
                    cours = await Cours.findAllWithDetails(directorOptions);
                } else {
                    missingDepartement = true;
                }
            } else if (isTeacher) {
                pageTitle = 'Mes cours';
                console.log('[DEBUG enseignant] Email recherché:', req.user.email);
                const enseignant = await Enseignant.findByEmail(req.user.email);
                console.log('[DEBUG enseignant] Résultat findByEmail:', enseignant);
                if (!enseignant) {
                    infoMessage = 'Votre profil enseignant n\'est pas lié à un enseignant dans la base. Contactez l\'administration.';
                } else {
                    console.log('[DEBUG enseignant] Recherche cours pour id_enseignant:', enseignant.id);
                    const teacherOptions = { ...filterOptions, id_enseignant: enseignant.id };
                    cours = await Cours.findAllWithDetails(teacherOptions);
                    console.log('[DEBUG enseignant] Cours trouvés:', cours.length);
                }
            } else if (isStudent) {
                pageTitle = 'Mon emploi du temps';
                console.log('[DEBUG etudiant] Email recherché:', req.user.email);
                const etudiant = await Etudiant.findByEmail(req.user.email);
                console.log('[DEBUG etudiant] Résultat findByEmail:', etudiant);
                if (!etudiant) {
                    infoMessage = 'Votre compte n\'est associé à aucun profil étudiant. Contactez l\'administration.';
                } else if (!etudiant.id_groupe) {
                    infoMessage = 'Aucun groupe n\'est associé à votre profil pour le moment.';
                } else {
                    console.log('[DEBUG etudiant] Recherche cours pour id_groupe:', etudiant.id_groupe);
                    const studentOptions = { ...filterOptions, id_groupe: etudiant.id_groupe };
                    cours = await Cours.findAllWithDetails(studentOptions);
                    console.log('[DEBUG etudiant] Cours trouvés:', cours.length);
                }
            }

            const typeLabels = TYPE_OPTIONS.reduce((acc, option) => {
                acc[option.value] = option.label;
                return acc;
            }, {});
            const dayLabels = DAY_OPTIONS.reduce((acc, option) => {
                acc[option.value] = option.label;
                return acc;
            }, {});

            const coursView = cours.map(item => {
                const departementId = item.departement_id || item.specialite_departement || item.enseignant_departement || null;
                return {
                    ...item,
                    type_label: typeLabels[item.type_cours] || item.type_cours,
                    jour_label: dayLabels[item.jour] || item.jour,
                    heure_debut_affiche: item.heure_debut ? item.heure_debut.slice(0, 5) : '',
                    heure_fin_affiche: item.heure_fin ? item.heure_fin.slice(0, 5) : '',
                    specialite_label: item.specialite_nom || 'Non définie',
                    departement_label: item.departement_nom || 'Non défini',
                    canManage: CoursController._userCanManageCourse(req.user, item, departementId)
                };
            });

            const canManageCourses = isAdmin || isDirector;
            const canCreateCourse = isAdmin;
            const showActionsColumn = canManageCourses;

            // Charger les données pour les filtres
            const Departement = require('../models/Departement');
            const departements = isAdmin ? await Departement.findAll() : [];
            
            let enseignants = [];
            let groupes = [];
            
            if (isAdmin) {
                enseignants = await Enseignant.findAll();
                groupes = await Groupe.findAll();
            } else if (isDirector && directorDepartementId) {
                enseignants = await Enseignant.findByDepartement(directorDepartementId);
                groupes = await Groupe.findByDepartement(directorDepartementId);
            }

            res.render('cours/list', {
                layout: 'main',
                title: pageTitle,
                cours: coursView,
                dayOptions: DAY_OPTIONS,
                typeOptions: TYPE_OPTIONS,
                missingDepartement,
                infoMessage,
                success: successQuery,
                error: errorQuery,
                canCreateCourse,
                showActionsColumn,
                // Filtres
                departements,
                enseignants,
                groupes,
                selectedDeptId: filterDeptId,
                selectedEnseignantId: filterEnseignantId,
                selectedGroupeId: filterGroupeId,
                selectedType: filterType,
                selectedJour: filterJour,
                isAdmin,
                isDirector
            });
        } catch (error) {
            console.error('Erreur lors du chargement des cours:', error);
            res.status(500).render('error', {
                layout: 'main',
                title: 'Erreur serveur',
                message: 'Impossible d\'afficher la liste des cours pour le moment.'
            });
        }
    }

    static async showCreate(req, res) {
        const user = req.user;
        if (!user || !['admin', 'directeur'].includes(user.role)) {
            return res.status(403).render('error', {
                layout: 'main',
                title: 'Accès non autorisé',
                message: 'Accès réservé aux administrateurs et directeurs'
            });
        }
        try {
            const directorDepartementId = CoursController._getDirectorDepartmentId(user);
            if (user.role === 'directeur' && !directorDepartementId) {
                return res.status(403).render('error', {
                    layout: 'main',
                    title: 'Département requis',
                    message: 'Votre compte directeur n\'est associé à aucun département. Contactez un administrateur.'
                });
            }

            const formData = await CoursController._getFormDependencies(user);
            res.render('cours/create', {
                layout: 'main',
                title: 'Planifier un cours',
                ...formData,
                restrictedToDepartment: user.role === 'directeur',
                form: {
                    jour: 'lundi',
                    type_cours: 'cm'
                }
            });
        } catch (error) {
            console.error('Erreur lors de l\'affichage du formulaire de création:', error);
            res.status(500).render('error', {
                layout: 'main',
                title: 'Erreur serveur',
                message: 'Impossible d\'afficher le formulaire pour le moment.'
            });
        }
    }

    static async create(req, res) {
        const user = req.user;
        const isAdmin = user && user.role === 'admin';
        const isDirector = user && user.role === 'directeur';

        if (!isAdmin && !isDirector) {
            return res.status(403).render('error', {
                layout: 'main',
                title: 'Accès non autorisé',
                message: 'Accès réservé aux administrateurs et directeurs'
            });
        }

        if (isDirector && !CoursController._getDirectorDepartmentId(user)) {
            return res.status(403).render('error', {
                layout: 'main',
                title: 'Département requis',
                message: 'Votre compte directeur n\'est associé à aucun département. Contactez un administrateur.'
            });
        }

        const payload = CoursController._extractPayload(req.body);
        const formData = await CoursController._getFormDependencies(user);

        const validationErrors = CoursController._validate(payload);
        const departmentCheck = await CoursController._validateDepartmentConsistency(payload);
        const { errors: consistencyErrors, enseignant, groupe } = departmentCheck;
        const directorErrors = CoursController._validateDirectorCourseAccess(user, departmentCheck);
        const allErrors = [...validationErrors, ...consistencyErrors, ...directorErrors];

        if (allErrors.length) {
            return res.render('cours/create', {
                layout: 'main',
                title: 'Planifier un cours',
                ...formData,
                restrictedToDepartment: isDirector,
                form: req.body,
                error: allErrors.join('\n'),
                enseignant,
                groupe
            });
        }

        try {
            const conflicts = await Cours.findConflicts({
                jour: payload.jour,
                heure_debut: payload.heure_debut,
                heure_fin: payload.heure_fin,
                id_enseignant: payload.id_enseignant,
                id_groupe: payload.id_groupe,
                id_salle: payload.id_salle
            });

            if (conflicts.length) {
                return res.render('cours/create', {
                    layout: 'main',
                    title: 'Planifier un cours',
                    ...formData,
                    form: req.body,
                    error: 'Conflit détecté avec un cours existant.',
                    conflicts: CoursController._formatConflicts(conflicts)
                });
            }

            await Cours.create(payload);
            res.redirect('/cours?success=create');
        } catch (error) {
            console.error('Erreur lors de la création du cours:', error);
            const debugInfo = {
                payload,
                erreur: error.message
            };
            console.error('Détails création cours:', debugInfo);
            res.render('cours/create', {
                layout: 'main',
                title: 'Planifier un cours',
                ...formData,
                restrictedToDepartment: isDirector,
                form: req.body,
                error: 'Erreur lors de la création du cours. Veuillez réessayer.',
                enseignant,
                groupe
            });
        }
    }

    static async showEdit(req, res) {
        const user = req.user;
        const isAdmin = user && user.role === 'admin';
        const isDirector = user && user.role === 'directeur';

        if (!isAdmin && !isDirector) {
            return res.status(403).render('error', {
                layout: 'main',
                title: 'Accès non autorisé',
                message: 'Accès réservé aux administrateurs et directeurs'
            });
        }
        try {
            const cours = await Cours.findByIdWithDetails(req.params.id);
            if (!cours) {
                return res.status(404).render('error', {
                    layout: 'main',
                    title: 'Cours introuvable',
                    message: 'Le cours demandé n\'existe pas.'
                });
            }

            if (!CoursController._userCanManageCourse(user, cours)) {
                return res.status(403).render('error', {
                    layout: 'main',
                    title: 'Accès non autorisé',
                    message: 'Vous ne pouvez modifier que les cours de votre département.'
                });
            }

            const formData = await CoursController._getFormDependencies(user);
            res.render('cours/edit', {
                layout: 'main',
                title: 'Modifier un cours',
                ...formData,
                restrictedToDepartment: isDirector,
                form: {
                    ...cours,
                    id_enseignant: cours.id_enseignant ? String(cours.id_enseignant) : '',
                    id_groupe: cours.id_groupe ? String(cours.id_groupe) : '',
                    id_salle: cours.id_salle ? String(cours.id_salle) : '',
                    heure_debut: cours.heure_debut ? cours.heure_debut.slice(0, 5) : '',
                    heure_fin: cours.heure_fin ? cours.heure_fin.slice(0, 5) : ''
                }
            });
        } catch (error) {
            console.error('Erreur lors de l\'affichage du formulaire de modification:', error);
            res.status(500).render('error', {
                layout: 'main',
                title: 'Erreur serveur',
                message: 'Impossible d\'afficher le formulaire de modification pour le moment.'
            });
        }
    }

    static async update(req, res) {
        const { id } = req.params;
        const user = req.user;
        const isAdmin = user && user.role === 'admin';
        const isDirector = user && user.role === 'directeur';

        if (!isAdmin && !isDirector) {
            return res.status(403).render('error', {
                layout: 'main',
                title: 'Accès non autorisé',
                message: 'Accès réservé aux administrateurs et directeurs'
            });
        }

        const existingCourse = await Cours.findByIdWithDetails(id);
        if (!existingCourse) {
            return res.status(404).render('error', {
                layout: 'main',
                title: 'Cours introuvable',
                message: 'Le cours demandé n\'existe pas.'
            });
        }

        if (!CoursController._userCanManageCourse(user, existingCourse)) {
            return res.status(403).render('error', {
                layout: 'main',
                title: 'Accès non autorisé',
                message: 'Vous ne pouvez modifier que les cours de votre département.'
            });
        }

        const payload = CoursController._extractPayload(req.body);
        const formData = await CoursController._getFormDependencies(user);

        const validationErrors = CoursController._validate(payload);
        const departmentCheck = await CoursController._validateDepartmentConsistency(payload);
        const { errors: consistencyErrors, enseignant, groupe } = departmentCheck;
        const directorErrors = CoursController._validateDirectorCourseAccess(user, departmentCheck);
        const allErrors = [...validationErrors, ...consistencyErrors, ...directorErrors];

        if (allErrors.length) {
            return res.render('cours/edit', {
                layout: 'main',
                title: 'Modifier un cours',
                ...formData,
                restrictedToDepartment: isDirector,
                form: { ...req.body, id },
                error: allErrors.join('\n'),
                enseignant,
                groupe
            });
        }

        try {
            const conflicts = await Cours.findConflicts({
                jour: payload.jour,
                heure_debut: payload.heure_debut,
                heure_fin: payload.heure_fin,
                id_enseignant: payload.id_enseignant,
                id_groupe: payload.id_groupe,
                id_salle: payload.id_salle,
                excludeId: Number(id)
            });

            if (conflicts.length) {
                return res.render('cours/edit', {
                    layout: 'main',
                    title: 'Modifier un cours',
                    ...formData,
                    form: { ...req.body, id },
                    error: 'Conflit détecté avec un cours existant.',
                    conflicts: CoursController._formatConflicts(conflicts)
                });
            }

            await Cours.update(id, payload);
            res.redirect('/cours?success=update');
        } catch (error) {
            console.error('Erreur lors de la mise à jour du cours:', error);
            const debugInfo = {
                payload,
                erreur: error.message
            };
            console.error('Détails mise à jour cours:', debugInfo);
            res.render('cours/edit', {
                layout: 'main',
                title: 'Modifier un cours',
                ...formData,
                restrictedToDepartment: isDirector,
                form: { ...req.body, id },
                error: 'Erreur lors de la mise à jour du cours. Veuillez réessayer.',
                enseignant,
                groupe
            });
        }
    }

    static async delete(req, res) {
        try {
            const user = req.user;
            const isAdmin = user && user.role === 'admin';
            const isDirector = user && user.role === 'directeur';

            if (!isAdmin && !isDirector) {
                return res.status(403).render('error', {
                    layout: 'main',
                    title: 'Accès non autorisé',
                    message: 'Accès réservé aux administrateurs et directeurs'
                });
            }

            const cours = await Cours.findByIdWithDetails(req.params.id);
            if (!cours) {
                return res.status(404).render('error', {
                    layout: 'main',
                    title: 'Cours introuvable',
                    message: 'Le cours demandé n\'existe pas.'
                });
            }

            if (!CoursController._userCanManageCourse(user, cours)) {
                return res.status(403).render('error', {
                    layout: 'main',
                    title: 'Accès non autorisé',
                    message: 'Vous ne pouvez supprimer que les cours de votre département.'
                });
            }

            await Cours.delete(req.params.id);
            res.redirect('/cours?success=delete');
        } catch (error) {
            console.error('Erreur lors de la suppression du cours:', error);
            res.redirect('/cours?error=delete');
        }
    }

    static async _getFormDependencies(user) {
        const role = user?.role || null;
        const directorDepartementId = CoursController._getDirectorDepartmentId(user);

        const enseignantsPromise = role === 'directeur' && directorDepartementId
            ? Enseignant.findByDepartement(directorDepartementId)
            : Enseignant.findAll();

        const groupesPromise = role === 'directeur' && directorDepartementId
            ? Groupe.findByDepartement(directorDepartementId)
            : Groupe.findAll();

        const [enseignants, groupes, salles] = await Promise.all([
            enseignantsPromise,
            groupesPromise,
            Salle.findAll()
        ]);

        return {
            enseignants,
            groupes,
            salles,
            dayOptions: DAY_OPTIONS,
            typeOptions: TYPE_OPTIONS,
            restrictedToDepartment: role === 'directeur',
            hasAssignableTeachers: enseignants.length > 0,
            hasAssignableGroups: groupes.length > 0
        };
    }

    static _extractPayload(body) {
        return {
            titre: body.titre ? body.titre.trim() : '',
            type_cours: body.type_cours || 'cm',
            description: body.description ? body.description.trim() : null,
            id_enseignant: body.id_enseignant ? Number(body.id_enseignant) : null,
            id_groupe: body.id_groupe ? Number(body.id_groupe) : null,
            id_salle: body.id_salle ? Number(body.id_salle) : null,
            jour: body.jour,
            heure_debut: CoursController._normalizeTime(body.heure_debut),
            heure_fin: CoursController._normalizeTime(body.heure_fin)
        };
    }

    static _validate(payload) {
        const errors = [];

        if (!payload.titre) {
            errors.push('Le titre du cours est obligatoire.');
        }
        if (!payload.id_enseignant) {
            errors.push('Veuillez sélectionner un enseignant.');
        }
        if (!payload.id_groupe) {
            errors.push('Veuillez sélectionner un groupe.');
        }
        if (!payload.id_salle) {
            errors.push('Veuillez sélectionner une salle.');
        }
        if (!payload.jour) {
            errors.push('Veuillez sélectionner un jour.');
        }
        if (!payload.heure_debut || !payload.heure_fin) {
            errors.push('Les horaires de début et de fin sont obligatoires.');
        } else if (payload.heure_debut >= payload.heure_fin) {
            errors.push('L\'heure de fin doit être postérieure à l\'heure de début.');
        }

        return errors;
    }

    static async _validateDepartmentConsistency(payload) {
        const result = {
            errors: [],
            enseignant: null,
            groupe: null
        };

        if (!payload.id_enseignant || !payload.id_groupe) {
            return result;
        }

        try {
            const [enseignantRows] = await db.query(
                `SELECT e.id, e.nom, e.prenom, e.id_departement, d.nom AS departement_nom
                 FROM enseignants e
                 LEFT JOIN departements d ON e.id_departement = d.id
                 WHERE e.id = ?`,
                [payload.id_enseignant]
            );
            result.enseignant = enseignantRows[0] || null;

            const [groupeRows] = await db.query(`
                SELECT g.id, g.nom, g.id_specialite,
                       s.id_departement AS specialite_departement,
                       s.nom AS specialite_nom,
                       d.nom AS departement_nom
                FROM groupes g
                LEFT JOIN specialites s ON g.id_specialite = s.id
                LEFT JOIN departements d ON s.id_departement = d.id
                WHERE g.id = ?
            `, [payload.id_groupe]);
            result.groupe = groupeRows[0] || null;

            if (!result.enseignant) {
                result.errors.push('Enseignant sélectionné introuvable.');
                return result;
            }

            if (!result.groupe) {
                result.errors.push('Groupe sélectionné introuvable.');
                return result;
            }

            const enseignantDepartement = result.enseignant.id_departement || null;
            const groupeDepartement = result.groupe.specialite_departement || null;

            if (enseignantDepartement && groupeDepartement && enseignantDepartement !== groupeDepartement) {
                result.errors.push('L\'enseignant sélectionné est rattaché à un département différent de celui du groupe.');
            }
        } catch (error) {
            console.error('Erreur lors de la vérification des départements:', error);
            result.errors.push('Impossible de vérifier la cohérence des départements.');
        }

        return result;
    }

    static _formatConflicts(conflicts) {
        const formatTime = time => (time ? time.slice(0, 5) : '');
        return conflicts.map(conflict => {
            const enseignant = conflict.enseignant_nom ? `${conflict.enseignant_prenom} ${conflict.enseignant_nom}`.trim() : 'Enseignant non assigné';
            const groupe = conflict.groupe_nom || 'Groupe non assigné';
            const salle = conflict.salle_nom || conflict.salle_code || 'Salle non assignée';
            return {
                titre: conflict.titre,
                jour: conflict.jour,
                heure_debut: formatTime(conflict.heure_debut),
                heure_fin: formatTime(conflict.heure_fin),
                enseignant,
                groupe,
                salle
            };
        });
    }

    static _getDirectorDepartmentId(user) {
        if (!user || user.role !== 'directeur') {
            return null;
        }

        const value = Number.parseInt(user.id_departement, 10);
        return Number.isNaN(value) ? null : value;
    }

    static _userCanManageCourse(user, course, fallbackDepartementId = null) {
        if (!user) {
            return false;
        }

        if (user.role === 'admin') {
            return true;
        }

        if (user.role !== 'directeur') {
            return false;
        }

        const directorDepartementId = CoursController._getDirectorDepartmentId(user);
        if (!directorDepartementId) {
            return false;
        }

        const candidateDepartments = [
            course?.departement_id,
            course?.specialite_departement,
            course?.enseignant_departement,
            fallbackDepartementId
        ]
            .map((value) => {
                if (value === null || typeof value === 'undefined') {
                    return null;
                }
                const parsed = Number.parseInt(value, 10);
                return Number.isNaN(parsed) ? null : parsed;
            })
            .filter((value) => value !== null);

        if (!candidateDepartments.length) {
            return false;
        }

        return candidateDepartments.some((departmentId) => departmentId === directorDepartementId);
    }

    static _validateDirectorCourseAccess(user, departmentCheckResult) {
        if (!user || user.role !== 'directeur') {
            return [];
        }

        const errors = [];
        const directorDepartementId = CoursController._getDirectorDepartmentId(user);

        if (!directorDepartementId) {
            errors.push('Votre compte directeur n\'est associé à aucun département.');
            return errors;
        }

        if (!departmentCheckResult) {
            return errors;
        }

        const enseignantDept = departmentCheckResult.enseignant && departmentCheckResult.enseignant.id_departement
            ? Number.parseInt(departmentCheckResult.enseignant.id_departement, 10)
            : null;
        const groupeDept = departmentCheckResult.groupe && departmentCheckResult.groupe.specialite_departement
            ? Number.parseInt(departmentCheckResult.groupe.specialite_departement, 10)
            : null;

        if (departmentCheckResult.enseignant && (!enseignantDept || enseignantDept !== directorDepartementId)) {
            errors.push('Vous ne pouvez sélectionner que des enseignants de votre département.');
        }

        if (departmentCheckResult.groupe && (!groupeDept || groupeDept !== directorDepartementId)) {
            errors.push('Vous ne pouvez sélectionner que des groupes de votre département.');
        }

        return errors;
    }

    static _normalizeTime(value) {
        if (!value) {
            return null;
        }
        return value.length === 5 ? `${value}:00` : value;
    }
}

module.exports = CoursController;
