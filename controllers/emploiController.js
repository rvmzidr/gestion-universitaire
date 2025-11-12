const Etudiant = require('../models/Etudiant');
const Cours = require('../models/Cours');
const Groupe = require('../models/Groupe');

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
}

module.exports = EmploiController;
