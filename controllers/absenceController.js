const Absence = require('../models/Absence');
const Etudiant = require('../models/Etudiant');
const Enseignant = require('../models/Enseignant');
const Cours = require('../models/Cours');
const Groupe = require('../models/Groupe');

class AbsenceController {
    // Liste des absences selon le rôle
    static async list(req, res) {
        try {
            const filters = {};
            const user = req.user;
            const Departement = require('../models/Departement');

            // Filtres selon le rôle
            if (user.role === 'etudiant') {
                const etudiant = await Etudiant.findByEmail(user.email);
                if (!etudiant) {
                    return res.render('error', {
                        layout: 'main',
                        title: 'Erreur',
                        message: 'Profil étudiant non trouvé'
                    });
                }
                filters.id_etudiant = etudiant.id;
            } else if (user.role === 'enseignant') {
                const enseignant = await Enseignant.findByEmail(user.email);
                if (!enseignant) {
                    return res.render('error', {
                        layout: 'main',
                        title: 'Erreur',
                        message: 'Profil enseignant non trouvé'
                    });
                }
                filters.id_enseignant = enseignant.id;
                console.log('[DEBUG Absences List] Enseignant ID:', enseignant.id);
            } else if (user.role === 'directeur') {
                if (!user.id_departement) {
                    return res.render('error', {
                        layout: 'main',
                        title: 'Erreur',
                        message: 'Département non défini'
                    });
                }
                filters.id_departement = user.id_departement;
            } else if (user.role === 'admin') {
                // Pour admin, permettre le filtrage par département et groupe
                if (req.query.departement) {
                    filters.id_departement = parseInt(req.query.departement);
                }
                if (req.query.groupe) {
                    filters.id_groupe = parseInt(req.query.groupe);
                }
            }

            // Filtres depuis les paramètres de requête
            if (req.query.statut) filters.statut = req.query.statut;
            if (req.query.date_debut) filters.date_debut = req.query.date_debut;
            if (req.query.date_fin) filters.date_fin = req.query.date_fin;
            if (req.query.id_cours) filters.id_cours = req.query.id_cours;

            const absences = await Absence.findAll(filters);
            console.log('[DEBUG Absences List] Filtres:', filters);
            console.log('[DEBUG Absences List] Absences trouvées:', absences.length);

            // Calcul des statistiques
            const stats = {
                total: absences.length,
                absents: absences.filter(a => a.statut === 'absent').length,
                justifies: absences.filter(a => a.statut === 'justifie').length,
                retards: absences.filter(a => a.statut === 'retard').length
            };

            // Vue spéciale pour les étudiants
            if (user.role === 'etudiant') {
                return res.render('absences/student', {
                    layout: 'main',
                    title: 'Mes absences',
                    absences,
                    stats
                });
            }

            // Pour admin, charger les départements et groupes pour les filtres
            let departements = [];
            let groupes = [];
            let selectedDepartement = null;
            let selectedGroupe = null;

            if (user.role === 'admin') {
                departements = await Departement.findAll();
                
                if (req.query.departement) {
                    const selectedDeptId = parseInt(req.query.departement);
                    selectedDepartement = departements.find(d => d.id === selectedDeptId);
                    groupes = await Groupe.findByDepartement(selectedDeptId);
                    
                    if (req.query.groupe) {
                        const selectedGroupeId = parseInt(req.query.groupe);
                        selectedGroupe = groupes.find(g => g.id === selectedGroupeId);
                    }
                }
            }

            res.render('absences/list', {
                layout: 'main',
                title: 'Gestion des absences',
                absences,
                stats,
                filters: req.query,
                canAdd: ['directeur', 'enseignant'].includes(user.role),
                canEdit: ['directeur'].includes(user.role),
                canValidate: ['directeur'].includes(user.role),
                isAdmin: user.role === 'admin',
                departements,
                groupes,
                selectedDepartement,
                selectedGroupe,
                selectedDeptId: req.query.departement ? parseInt(req.query.departement) : null,
                selectedGroupeId: req.query.groupe ? parseInt(req.query.groupe) : null
            });
        } catch (error) {
            console.error('Erreur liste absences:', error);
            res.status(500).render('error', {
                layout: 'main',
                title: 'Erreur',
                message: 'Impossible de charger les absences'
            });
        }
    }

    // Formulaire d'ajout (enseignant/directeur)
    static async createForm(req, res) {
        if (!['directeur', 'enseignant'].includes(req.user.role)) {
            return res.status(403).render('error', {
                layout: 'main',
                title: 'Accès refusé',
                message: 'Seuls les enseignants et directeurs peuvent ajouter des absences'
            });
        }

        try {
            let cours = [];
            
            if (req.user.role === 'enseignant') {
                const enseignant = await Enseignant.findByEmail(req.user.email);
                console.log('[DEBUG] Enseignant:', enseignant);
                if (enseignant) {
                    cours = await Cours.findAllWithDetails({ id_enseignant: enseignant.id });
                    console.log('[DEBUG] Cours de l\'enseignant:', cours.length);
                }
            } else if (req.user.role === 'directeur') {
                // Le directeur voit les cours de son département
                cours = await Cours.findAllWithDetails({ id_departement: req.user.id_departement });
                console.log('[DEBUG] Cours du département:', cours.length);
            }

            res.render('absences/create', {
                layout: 'main',
                title: 'Enregistrer des absences',
                cours,
                date: new Date().toISOString().split('T')[0]
            });
        } catch (error) {
            console.error('Erreur formulaire absence:', error);
            res.status(500).render('error', {
                layout: 'main',
                title: 'Erreur',
                message: 'Impossible de charger le formulaire'
            });
        }
    }

    // Créer une absence
    static async create(req, res) {
        if (!['directeur', 'enseignant'].includes(req.user.role)) {
            return res.status(403).json({ error: 'Accès refusé' });
        }

        try {
            const { id_cours, date_absence, absents } = req.body;

            if (!id_cours || !date_absence || !absents || absents.length === 0) {
                return res.status(400).json({ error: 'Données manquantes' });
            }

            const enseignant = req.user.role === 'enseignant' 
                ? await Enseignant.findByEmail(req.user.email) 
                : null;

            const absencesData = absents.map(id_etudiant => ({
                id_etudiant: parseInt(id_etudiant),
                id_cours: parseInt(id_cours),
                date_absence,
                statut: 'absent',
                id_enseignant: enseignant ? enseignant.id : null
            }));

            await Absence.createBulk(absencesData);

            res.json({ success: true, message: 'Absences enregistrées' });
        } catch (error) {
            console.error('Erreur création absence:', error);
            res.status(500).json({ error: 'Erreur lors de l\'enregistrement' });
        }
    }

    // Formulaire de modification (directeur uniquement)
    static async editForm(req, res) {
        if (req.user.role !== 'directeur') {
            return res.status(403).render('error', {
                layout: 'main',
                title: 'Accès refusé',
                message: 'Seuls les directeurs peuvent modifier les absences'
            });
        }

        try {
            const absence = await Absence.findById(req.params.id);
            
            if (!absence) {
                return res.status(404).render('error', {
                    layout: 'main',
                    title: 'Non trouvé',
                    message: 'Absence introuvable'
                });
            }

            res.render('absences/edit', {
                layout: 'main',
                title: 'Modifier l\'absence',
                absence
            });
        } catch (error) {
            console.error('Erreur formulaire édition:', error);
            res.status(500).render('error', {
                layout: 'main',
                title: 'Erreur',
                message: 'Impossible de charger l\'absence'
            });
        }
    }

    // Mettre à jour une absence
    static async update(req, res) {
        if (req.user.role !== 'directeur') {
            return res.status(403).redirect('/absences?error=access_denied');
        }

        try {
            const { statut, motif, remarque } = req.body;
            
            await Absence.update(req.params.id, {
                statut,
                motif,
                remarque,
                justificatif: req.file ? req.file.path : null
            });

            res.redirect('/absences?success=updated');
        } catch (error) {
            console.error('Erreur mise à jour absence:', error);
            res.redirect('/absences?error=update_failed');
        }
    }

    // Supprimer une absence (directeur uniquement)
    static async delete(req, res) {
        if (req.user.role !== 'directeur') {
            return res.status(403).redirect('/absences?error=access_denied');
        }

        try {
            await Absence.delete(req.params.id);
            res.redirect('/absences?success=deleted');
        } catch (error) {
            console.error('Erreur suppression absence:', error);
            res.redirect('/absences?error=delete_failed');
        }
    }

    // Valider/Refuser une justification (directeur uniquement)
    static async validateJustification(req, res) {
        if (req.user.role !== 'directeur') {
            return res.status(403).json({ error: 'Accès refusé' });
        }

        try {
            const { statut, remarque } = req.body;
            const absence = await Absence.findById(req.params.id);

            if (!absence) {
                return res.status(404).json({ error: 'Absence introuvable' });
            }

            // Vérifier que le directeur gère le bon département
            const etudiant = await Etudiant.findById(absence.id_etudiant);
            if (etudiant.id_departement !== req.user.id_departement) {
                return res.status(403).json({ error: 'Accès refusé à ce département' });
            }

            await Absence.update(req.params.id, {
                statut,
                remarque,
                motif: absence.motif,
                justificatif: absence.justificatif
            });

            res.json({ success: true, message: 'Justification traitée' });
        } catch (error) {
            console.error('Erreur validation justification:', error);
            res.status(500).json({ error: 'Erreur lors de la validation' });
        }
    }

    // Soumettre un justificatif (étudiant)
    static async submitJustification(req, res) {
        if (req.user.role !== 'etudiant') {
            return res.status(403).json({ error: 'Accès refusé' });
        }

        try {
            const { motif } = req.body;
            const absence = await Absence.findById(req.params.id);

            if (!absence) {
                return res.status(404).json({ error: 'Absence introuvable' });
            }

            const etudiant = await Etudiant.findByEmail(req.user.email);
            if (absence.id_etudiant !== etudiant.id) {
                return res.status(403).json({ error: 'Ce n\'est pas votre absence' });
            }

            await Absence.update(req.params.id, {
                statut: 'justifie',
                motif,
                justificatif: req.file ? req.file.path : absence.justificatif,
                remarque: absence.remarque
            });

            res.json({ success: true, message: 'Justificatif envoyé' });
        } catch (error) {
            console.error('Erreur soumission justificatif:', error);
            res.status(500).json({ error: 'Erreur lors de l\'envoi' });
        }
    }

    // API: Liste des étudiants d'un cours
    static async getStudentsByCours(req, res) {
        try {
            const cours = await Cours.findById(req.params.id_cours);
            
            if (!cours) {
                return res.status(404).json({ error: 'Cours introuvable' });
            }

            const etudiants = await Etudiant.findByGroupe(cours.id_groupe);

            res.json({ etudiants });
        } catch (error) {
            console.error('Erreur récupération étudiants:', error);
            res.status(500).json({ error: 'Erreur serveur' });
        }
    }

    // Statistiques détaillées
    static async statistics(req, res) {
        try {
            const filters = {};
            
            if (req.user.role === 'directeur') {
                filters.id_departement = req.user.id_departement;
            } else if (req.user.role === 'enseignant') {
                const enseignant = await Enseignant.findByEmail(req.user.email);
                filters.id_enseignant = enseignant.id;
            } else if (req.user.role === 'etudiant') {
                const etudiant = await Etudiant.findByEmail(req.user.email);
                filters.id_etudiant = etudiant.id;
            }

            const absences = await Absence.findAll(filters);

            // Calculs statistiques
            const totalAbsencesReelles = absences.filter(a => 
                a.statut === 'absent' || a.statut === 'justifie' || a.statut === 'retard'
            ).length;
            
            const totalPresences = absences.filter(a => a.statut === 'present').length;
            const totalEnregistrements = absences.length;
            
            // Taux d'absence = (absences réelles / total enregistrements) * 100
            const tauxAbsence = totalEnregistrements > 0 
                ? Math.round((totalAbsencesReelles / totalEnregistrements) * 100) 
                : 0;

            const stats = {
                total: absences.length,
                parStatut: {
                    absent: absences.filter(a => a.statut === 'absent').length,
                    justifie: absences.filter(a => a.statut === 'justifie').length,
                    retard: absences.filter(a => a.statut === 'retard').length,
                    present: absences.filter(a => a.statut === 'present').length
                },
                tauxAbsence: tauxAbsence,
                totalAbsencesReelles: totalAbsencesReelles,
                totalPresences: totalPresences
            };

            res.render('absences/statistics', {
                layout: 'main',
                title: 'Statistiques des absences',
                stats,
                absences
            });
        } catch (error) {
            console.error('Erreur statistiques:', error);
            res.status(500).render('error', {
                layout: 'main',
                title: 'Erreur',
                message: 'Impossible de charger les statistiques'
            });
        }
    }
}

module.exports = AbsenceController;
