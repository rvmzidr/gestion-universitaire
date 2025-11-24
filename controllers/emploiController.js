const Etudiant = require('../models/Etudiant');
const Enseignant = require('../models/Enseignant');
const Cours = require('../models/Cours');
const Groupe = require('../models/Groupe');
const Departement = require('../models/Departement');

const DAY_OPTIONS = [
    { value: 'lundi', label: 'Lundi' },
    { value: 'mardi', label: 'Mardi' },
    { value: 'mercredi', label: 'Mercredi' },
    { value: 'jeudi', label: 'Jeudi' },
    { value: 'vendredi', label: 'Vendredi' },
    { value: 'samedi', label: 'Samedi' }
];

const TYPE_LABELS = {
    cm: 'Cours magistral',
    td: 'Travaux dirigés',
    tp: 'Travaux pratiques',
    atelier: 'Atelier',
    examen: 'Examen'
};

const START_DAY_MINUTES = 8 * 60;
const END_DAY_MINUTES = 20 * 60;
const MINUTE_HEIGHT = 1.1; // px per minute

const buildTimeScale = () => {
    const labels = [];
    for (let hour = 8; hour <= 20; hour += 1) {
        const label = `${hour.toString().padStart(2, '0')}:00`;
        labels.push(label);
    }
    return labels;
};

const toMinutes = time => {
    if (!time) {
        return 0;
    }
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
};

class EmploiController {
    static async showMyTimetable(req, res) {
        if (!req.user) {
            return res.status(403).render('error', {
                layout: 'main',
                title: 'Accès non autorisé',
                message: 'Vous devez être connecté pour accéder à cette page.'
            });
        }

        // Rediriger selon le rôle
        if (req.user.role === 'etudiant') {
            return EmploiController.showStudentTimetable(req, res);
        } else if (req.user.role === 'enseignant') {
            return EmploiController.showTeacherTimetable(req, res);
        } else if (req.user.role === 'directeur') {
            return EmploiController.showDirecteurTimetable(req, res);
        } else if (req.user.role === 'admin') {
            return EmploiController.showAdminTimetable(req, res);
        } else {
            return res.status(403).render('error', {
                layout: 'main',
                title: 'Accès non autorisé',
                message: 'Cette page est réservée aux administrateurs, directeurs, enseignants et étudiants.'
            });
        }
    }

    static async showStudentTimetable(req, res) {
        if (!req.user || req.user.role !== 'etudiant') {
            return res.status(403).render('error', {
                layout: 'main',
                title: 'Accès non autorisé',
                message: 'Seuls les étudiants peuvent accéder à cette page.'
            });
        }

        try {
            const etudiant = await Etudiant.findByEmail(req.user.email);

            if (!etudiant) {
                return res.render('emplois/etudiant', {
                    layout: 'main',
                    title: 'Mon emploi du temps',
                    missingProfile: true
                });
            }

            if (!etudiant.id_groupe) {
                return res.render('emplois/etudiant', {
                    layout: 'main',
                    title: 'Mon emploi du temps',
                    student: etudiant,
                    missingGroup: true
                });
            }

            const groupe = await Groupe.findById(etudiant.id_groupe);
            const cours = await Cours.findByGroupe(etudiant.id_groupe);

            const schedule = DAY_OPTIONS.map(day => {
                const sessions = cours
                    .filter(c => c.jour === day.value)
                    .map(c => {
                        const startMinutes = toMinutes(c.heure_debut);
                        const endMinutes = toMinutes(c.heure_fin);
                        const duration = Math.max(endMinutes - startMinutes, 45);
                        const top = Math.max((startMinutes - START_DAY_MINUTES) * MINUTE_HEIGHT, 0);
                        const height = Math.max(duration * MINUTE_HEIGHT, 45);
                        const heureDebut = c.heure_debut ? c.heure_debut.slice(0, 5) : '';
                        const heureFin = c.heure_fin ? c.heure_fin.slice(0, 5) : '';
                        return {
                            ...c,
                            type_label: TYPE_LABELS[c.type_cours] || c.type_cours,
                            heure_debut_affiche: heureDebut,
                            heure_fin_affiche: heureFin,
                            enseignant_affichage: c.enseignant_nom ? `${c.enseignant_prenom} ${c.enseignant_nom}`.trim() : 'Enseignant à confirmer',
                            salle_affichage: c.salle_nom || c.salle_code || 'Salle à confirmer',
                            position: {
                                top,
                                height
                            }
                        };
                    })
                    .sort((a, b) => a.heure_debut.localeCompare(b.heure_debut));

                return {
                    ...day,
                    sessions
                };
            });

            const hasCours = cours.length > 0;
            const activeDayCount = schedule.filter(day => day.sessions.length > 0).length;

            res.render('emplois/etudiant', {
                layout: 'main',
                title: 'Mon emploi du temps',
                student: etudiant,
                groupe,
                schedule,
                hasCours,
                activeDayCount,
                timeScale: buildTimeScale(),
                calendarHeight: (END_DAY_MINUTES - START_DAY_MINUTES) * MINUTE_HEIGHT
            });
        } catch (error) {
            console.error('Erreur lors du chargement de l\'emploi du temps étudiant:', error);
            res.status(500).render('error', {
                layout: 'main',
                title: 'Erreur serveur',
                message: 'Impossible de charger votre emploi du temps pour le moment.'
            });
        }
    }

    static async showTeacherTimetable(req, res) {
        if (!req.user || req.user.role !== 'enseignant') {
            return res.status(403).render('error', {
                layout: 'main',
                title: 'Accès non autorisé',
                message: 'Seuls les enseignants peuvent accéder à cette page.'
            });
        }

        try {
            const enseignant = await Enseignant.findByEmail(req.user.email);

            if (!enseignant) {
                return res.render('emplois/etudiant', {
                    layout: 'main',
                    title: 'Mon emploi du temps',
                    missingProfile: true,
                    isTeacher: true
                });
            }

            const cours = await Cours.findAllWithDetails({ id_enseignant: enseignant.id });

            const schedule = DAY_OPTIONS.map(day => {
                const sessions = cours
                    .filter(c => c.jour === day.value)
                    .map(c => {
                        const startMinutes = toMinutes(c.heure_debut);
                        const endMinutes = toMinutes(c.heure_fin);
                        const duration = Math.max(endMinutes - startMinutes, 45);
                        const top = Math.max((startMinutes - START_DAY_MINUTES) * MINUTE_HEIGHT, 0);
                        const height = Math.max(duration * MINUTE_HEIGHT, 45);
                        const heureDebut = c.heure_debut ? c.heure_debut.slice(0, 5) : '';
                        const heureFin = c.heure_fin ? c.heure_fin.slice(0, 5) : '';
                        return {
                            ...c,
                            type_label: TYPE_LABELS[c.type_cours] || c.type_cours,
                            heure_debut_affiche: heureDebut,
                            heure_fin_affiche: heureFin,
                            groupe_affichage: c.groupe_nom || 'Groupe à confirmer',
                            salle_affichage: c.salle_nom || c.salle_code || 'Salle à confirmer',
                            position: {
                                top,
                                height
                            }
                        };
                    })
                    .sort((a, b) => a.heure_debut.localeCompare(b.heure_debut));

                return {
                    ...day,
                    sessions
                };
            });

            const hasCours = cours.length > 0;
            const activeDayCount = schedule.filter(day => day.sessions.length > 0).length;

            res.render('emplois/etudiant', {
                layout: 'main',
                title: 'Mon emploi du temps',
                teacher: enseignant,
                isTeacher: true,
                schedule,
                hasCours,
                activeDayCount,
                timeScale: buildTimeScale(),
                calendarHeight: (END_DAY_MINUTES - START_DAY_MINUTES) * MINUTE_HEIGHT
            });
        } catch (error) {
            console.error('Erreur lors du chargement de l\'emploi du temps enseignant:', error);
            res.status(500).render('error', {
                layout: 'main',
                title: 'Erreur serveur',
                message: 'Impossible de charger votre emploi du temps pour le moment.'
            });
        }
    }

    static async showDirecteurTimetable(req, res) {
        if (!req.user || req.user.role !== 'directeur') {
            return res.status(403).render('error', {
                layout: 'main',
                title: 'Accès non autorisé',
                message: 'Seuls les directeurs peuvent accéder à cette page.'
            });
        }

        try {
            const departementId = req.user.id_departement;

            if (!departementId) {
                return res.render('emplois/etudiant', {
                    layout: 'main',
                    title: 'Emploi du temps du département',
                    missingProfile: true,
                    isDirecteur: true
                });
            }

            // Récupérer tous les cours du département
            const cours = await Cours.findAllWithDetails({ id_departement: departementId });

            const schedule = DAY_OPTIONS.map(day => {
                const sessions = cours
                    .filter(c => c.jour === day.value)
                    .map(c => {
                        const startMinutes = toMinutes(c.heure_debut);
                        const endMinutes = toMinutes(c.heure_fin);
                        const duration = Math.max(endMinutes - startMinutes, 45);
                        const top = Math.max((startMinutes - START_DAY_MINUTES) * MINUTE_HEIGHT, 0);
                        const height = Math.max(duration * MINUTE_HEIGHT, 45);
                        const heureDebut = c.heure_debut ? c.heure_debut.slice(0, 5) : '';
                        const heureFin = c.heure_fin ? c.heure_fin.slice(0, 5) : '';
                        return {
                            ...c,
                            type_label: TYPE_LABELS[c.type_cours] || c.type_cours,
                            heure_debut_affiche: heureDebut,
                            heure_fin_affiche: heureFin,
                            enseignant_affichage: c.enseignant_nom ? `${c.enseignant_prenom} ${c.enseignant_nom}`.trim() : 'Enseignant à confirmer',
                            groupe_affichage: c.groupe_nom || 'Groupe à confirmer',
                            salle_affichage: c.salle_nom || c.salle_code || 'Salle à confirmer',
                            position: {
                                top,
                                height
                            }
                        };
                    })
                    .sort((a, b) => a.heure_debut.localeCompare(b.heure_debut));

                return {
                    ...day,
                    sessions
                };
            });

            const hasCours = cours.length > 0;
            const activeDayCount = schedule.filter(day => day.sessions.length > 0).length;

            res.render('emplois/etudiant', {
                layout: 'main',
                title: 'Emploi du temps du département',
                isDirecteur: true,
                departementNom: cours.length > 0 ? cours[0].departement_nom : 'Département',
                schedule,
                hasCours,
                activeDayCount,
                timeScale: buildTimeScale(),
                calendarHeight: (END_DAY_MINUTES - START_DAY_MINUTES) * MINUTE_HEIGHT
            });
        } catch (error) {
            console.error('Erreur lors du chargement de l\'emploi du temps directeur:', error);
            res.status(500).render('error', {
                layout: 'main',
                title: 'Erreur serveur',
                message: 'Impossible de charger l\'emploi du temps pour le moment.'
            });
        }
    }

    static async showAdminTimetable(req, res) {
        if (!req.user || req.user.role !== 'admin') {
            return res.status(403).render('error', {
                layout: 'main',
                title: 'Accès non autorisé',
                message: 'Seuls les administrateurs peuvent accéder à cette page.'
            });
        }

        try {
            const Departement = require('../models/Departement');
            const departements = await Departement.findAll();
            
            // Récupérer le département et groupe sélectionnés
            const selectedDeptId = req.query.departement ? parseInt(req.query.departement) : null;
            const selectedGroupeId = req.query.groupe ? parseInt(req.query.groupe) : null;
            
            let cours = [];
            let selectedDepartement = null;
            let groupes = [];
            let selectedGroupe = null;

            // Si un département est sélectionné, charger ses groupes
            if (selectedDeptId) {
                selectedDepartement = departements.find(d => d.id === selectedDeptId);
                groupes = await Groupe.findByDepartement(selectedDeptId);
                
                // Afficher les cours SEULEMENT si un groupe est sélectionné
                if (selectedGroupeId) {
                    selectedGroupe = groupes.find(g => g.id === selectedGroupeId);
                    cours = await Cours.findAllWithDetails({ id_groupe: selectedGroupeId });
                }
                // Si seulement le département est sélectionné, ne rien afficher (cours reste vide)
            }

            const schedule = DAY_OPTIONS.map(day => {
                const sessions = cours
                    .filter(c => c.jour === day.value)
                    .map(c => {
                        const startMinutes = toMinutes(c.heure_debut);
                        const endMinutes = toMinutes(c.heure_fin);
                        const duration = Math.max(endMinutes - startMinutes, 45);
                        const top = Math.max((startMinutes - START_DAY_MINUTES) * MINUTE_HEIGHT, 0);
                        const height = Math.max(duration * MINUTE_HEIGHT, 45);
                        const heureDebut = c.heure_debut ? c.heure_debut.slice(0, 5) : '';
                        const heureFin = c.heure_fin ? c.heure_fin.slice(0, 5) : '';
                        return {
                            ...c,
                            type_label: TYPE_LABELS[c.type_cours] || c.type_cours,
                            heure_debut_affiche: heureDebut,
                            heure_fin_affiche: heureFin,
                            enseignant_affichage: c.enseignant_nom ? `${c.enseignant_prenom} ${c.enseignant_nom}`.trim() : 'Enseignant à confirmer',
                            groupe_affichage: c.groupe_nom || 'Groupe à confirmer',
                            salle_affichage: c.salle_nom || c.salle_code || 'Salle à confirmer',
                            position: {
                                top,
                                height
                            }
                        };
                    })
                    .sort((a, b) => a.heure_debut.localeCompare(b.heure_debut));

                return {
                    ...day,
                    sessions
                };
            });

            const hasCours = cours.length > 0;
            const activeDayCount = schedule.filter(day => day.sessions.length > 0).length;

            res.render('emplois/admin', {
                layout: 'main',
                title: 'Emploi du temps',
                isAdmin: true,
                departements,
                selectedDeptId,
                departementNom: selectedDepartement ? selectedDepartement.nom : null,
                groupes,
                selectedGroupeId,
                groupeNom: selectedGroupe ? selectedGroupe.nom : null,
                schedule,
                hasCours,
                activeDayCount,
                timeScale: buildTimeScale(),
                calendarHeight: (END_DAY_MINUTES - START_DAY_MINUTES) * MINUTE_HEIGHT
            });
        } catch (error) {
            console.error('Erreur lors du chargement de l\'emploi du temps admin:', error);
            res.status(500).render('error', {
                layout: 'main',
                title: 'Erreur serveur',
                message: 'Impossible de charger l\'emploi du temps pour le moment.'
            });
        }
    }

    static async showSpecificStudentTimetable(req, res) {
        const etudiantId = req.params.id;

        try {
            const etudiant = await Etudiant.findById(etudiantId);

            if (!etudiant) {
                return res.status(404).render('error', {
                    layout: 'main',
                    title: 'Étudiant non trouvé',
                    message: 'L\'étudiant demandé n\'existe pas.'
                });
            }

            // Vérifier les permissions
            if (req.user.role === 'directeur' && req.user.id_departement !== etudiant.id_departement) {
                return res.status(403).render('error', {
                    layout: 'main',
                    title: 'Accès non autorisé',
                    message: 'Vous ne pouvez voir que les étudiants de votre département.'
                });
            }

            if (!etudiant.id_groupe) {
                return res.render('emplois/etudiant', {
                    layout: 'main',
                    title: `Emploi du temps - ${etudiant.prenom} ${etudiant.nom}`,
                    student: etudiant,
                    missingGroup: true
                });
            }

            const groupe = await Groupe.findById(etudiant.id_groupe);
            const coursList = await Cours.findByGroupe(etudiant.id_groupe);

            if (!coursList || coursList.length === 0) {
                return res.render('emplois/etudiant', {
                    layout: 'main',
                    title: `Emploi du temps - ${etudiant.prenom} ${etudiant.nom}`,
                    student: etudiant,
                    groupe,
                    hasCours: false
                });
            }

            const dayMap = {};
            DAY_OPTIONS.forEach(d => {
                dayMap[d.value] = { value: d.value, label: d.label, sessions: [] };
            });

            let activeDays = new Set();

            coursList.forEach(c => {
                const jour = c.jour.toLowerCase();
                if (dayMap[jour]) {
                    activeDays.add(jour);
                    const start = toMinutes(c.heure_debut);
                    const end = toMinutes(c.heure_fin);
                    const top = (start - START_DAY_MINUTES) * MINUTE_HEIGHT;
                    const height = (end - start) * MINUTE_HEIGHT;

                    dayMap[jour].sessions.push({
                        id: c.id,
                        titre: c.titre,
                        heure_debut_affiche: c.heure_debut.substring(0, 5),
                        heure_fin_affiche: c.heure_fin.substring(0, 5),
                        type_label: TYPE_LABELS[c.type] || c.type,
                        enseignant_affichage: c.enseignant_nom ? `${c.enseignant_prenom} ${c.enseignant_nom}` : 'Non assigné',
                        salle_affichage: c.salle_nom || 'Non définie',
                        position: { top, height }
                    });
                }
            });

            const schedule = DAY_OPTIONS.map(d => dayMap[d.value]);

            res.render('emplois/etudiant', {
                layout: 'main',
                title: `Emploi du temps - ${etudiant.prenom} ${etudiant.nom}`,
                student: etudiant,
                groupe,
                schedule,
                hasCours: true,
                activeDayCount: activeDays.size,
                timeScale: buildTimeScale(),
                calendarHeight: (END_DAY_MINUTES - START_DAY_MINUTES) * MINUTE_HEIGHT
            });
        } catch (error) {
            console.error('Erreur lors du chargement de l\'emploi du temps de l\'étudiant:', error);
            res.status(500).render('error', {
                layout: 'main',
                title: 'Erreur serveur',
                message: 'Impossible de charger l\'emploi du temps pour le moment.'
            });
        }
    }
}

module.exports = EmploiController;
