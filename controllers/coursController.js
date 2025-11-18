const Cours = require('../models/Cours');
const Enseignant = require('../models/Enseignant');
const Groupe = require('../models/Groupe');
const Salle = require('../models/Salle');

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
            const isDirector = req.user && req.user.role === 'directeur';
            let missingDepartement = false;
            let cours = [];

            if (isDirector) {
                const directorDepartementId = req.user.id_departement || null;
                if (directorDepartementId) {
                    cours = await Cours.findAllWithDetails({ id_departement: directorDepartementId });
                } else {
                    missingDepartement = true;
                }
            } else {
                cours = await Cours.findAllWithDetails();
            }
            const typeLabels = TYPE_OPTIONS.reduce((acc, option) => {
                acc[option.value] = option.label;
                return acc;
            }, {});
            const dayLabels = DAY_OPTIONS.reduce((acc, option) => {
                acc[option.value] = option.label;
                return acc;
            }, {});
            const coursView = cours.map(item => ({
                ...item,
                type_label: typeLabels[item.type_cours] || item.type_cours,
                jour_label: dayLabels[item.jour] || item.jour,
                heure_debut_affiche: item.heure_debut ? item.heure_debut.slice(0, 5) : '',
                heure_fin_affiche: item.heure_fin ? item.heure_fin.slice(0, 5) : ''
            }));
            res.render('cours/list', {
                layout: 'main',
                title: 'Gestion des cours',
                cours: coursView,
                dayOptions: DAY_OPTIONS,
                typeOptions: TYPE_OPTIONS,
                missingDepartement
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
        if (!req.user || req.user.role !== 'admin') {
            return res.status(403).render('error', {
                layout: 'main',
                title: 'Accès non autorisé',
                message: 'Accès réservé aux administrateurs'
            });
        }
        try {
            const formData = await this._getFormDependencies();
            res.render('cours/create', {
                layout: 'main',
                title: 'Planifier un cours',
                ...formData,
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
        if (!req.user || req.user.role !== 'admin') {
            return res.status(403).render('error', {
                layout: 'main',
                title: 'Accès non autorisé',
                message: 'Accès réservé aux administrateurs'
            });
        }
        const payload = CoursController._extractPayload(req.body);
        const formData = await this._getFormDependencies();

        const validationErrors = CoursController._validate(payload);
        if (validationErrors.length) {
            return res.render('cours/create', {
                layout: 'main',
                title: 'Planifier un cours',
                ...formData,
                form: req.body,
                error: validationErrors.join('\n')
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
            res.render('cours/create', {
                layout: 'main',
                title: 'Planifier un cours',
                ...formData,
                form: req.body,
                error: 'Erreur lors de la création du cours. Veuillez réessayer.'
            });
        }
    }

    static async showEdit(req, res) {
        if (!req.user || req.user.role !== 'admin') {
            return res.status(403).render('error', {
                layout: 'main',
                title: 'Accès non autorisé',
                message: 'Accès réservé aux administrateurs'
            });
        }
        try {
            const cours = await Cours.findById(req.params.id);
            if (!cours) {
                return res.status(404).render('error', {
                    layout: 'main',
                    title: 'Cours introuvable',
                    message: 'Le cours demandé n\'existe pas.'
                });
            }

            const formData = await this._getFormDependencies();
            res.render('cours/edit', {
                layout: 'main',
                title: 'Modifier un cours',
                ...formData,
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
        if (!req.user || req.user.role !== 'admin') {
            return res.status(403).render('error', {
                layout: 'main',
                title: 'Accès non autorisé',
                message: 'Accès réservé aux administrateurs'
            });
        }
        const { id } = req.params;
        const payload = CoursController._extractPayload(req.body);
        const formData = await this._getFormDependencies();

        const validationErrors = CoursController._validate(payload);
        if (validationErrors.length) {
            return res.render('cours/edit', {
                layout: 'main',
                title: 'Modifier un cours',
                ...formData,
                form: { ...req.body, id },
                error: validationErrors.join('\n')
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
            res.render('cours/edit', {
                layout: 'main',
                title: 'Modifier un cours',
                ...formData,
                form: { ...req.body, id },
                error: 'Erreur lors de la mise à jour du cours. Veuillez réessayer.'
            });
        }
    }

    static async delete(req, res) {
        if (!req.user || req.user.role !== 'admin') {
            return res.status(403).render('error', {
                layout: 'main',
                title: 'Accès non autorisé',
                message: 'Accès réservé aux administrateurs'
            });
        }
        try {
            await Cours.delete(req.params.id);
            res.redirect('/cours?success=delete');
        } catch (error) {
            console.error('Erreur lors de la suppression du cours:', error);
            res.redirect('/cours?error=delete');
        }
    }

    static async _getFormDependencies() {
        const [enseignants, groupes, salles] = await Promise.all([
            Enseignant.findAll(),
            Groupe.findAll(),
            Salle.findAll()
        ]);

        return {
            enseignants,
            groupes,
            salles,
            dayOptions: DAY_OPTIONS,
            typeOptions: TYPE_OPTIONS
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

    static _normalizeTime(value) {
        if (!value) {
            return null;
        }
        return value.length === 5 ? `${value}:00` : value;
    }
}

module.exports = CoursController;
