const Note = require('../models/Note');
const Cours = require('../models/Cours');
const Etudiant = require('../models/Etudiant');
const Enseignant = require('../models/Enseignant');

class NoteController {
    // Liste des notes selon le rôle
    static async list(req, res) {
        try {
            const filters = {
                semestre: req.query.semestre || '1',
                annee_universitaire: req.query.annee || '2025-2026'
            };

            let notes = [];
            let canEdit = false;
            let canDelete = false;
            let canAdd = false;

            if (req.user.role === 'enseignant') {
                // L'enseignant voit seulement les notes de ses étudiants
                const enseignant = await Enseignant.findByEmail(req.user.email);
                if (!enseignant) {
                    return res.status(404).render('error', {
                        layout: 'main',
                        title: 'Erreur',
                        message: 'Profil enseignant non trouvé'
                    });
                }

                filters.id_enseignant = enseignant.id;
                notes = await Note.findAll(filters);
                canEdit = true;
                canDelete = true;
                canAdd = true;

            } else if (req.user.role === 'etudiant') {
                // L'étudiant voit seulement ses notes
                const etudiant = await Etudiant.findByEmail(req.user.email);
                if (!etudiant) {
                    return res.render('notes/student', {
                        layout: 'main',
                        title: 'Mes notes',
                        missingProfile: true,
                        user: req.user
                    });
                }

                // Rediriger vers la vue étudiant
                return res.redirect(`/notes/etudiant/${etudiant.id}`);

            } else if (req.user.role === 'directeur') {
                // Le directeur voit toutes les notes de son département
                const enseignant = await Enseignant.findByEmail(req.user.email);
                if (enseignant && enseignant.id_departement) {
                    filters.id_departement = enseignant.id_departement;
                }
                notes = await Note.findAll(filters);

            } else if (req.user.role === 'admin') {
                // L'admin voit toutes les notes (lecture seule)
                notes = await Note.findAll(filters);
            }

            // Filtres supplémentaires
            if (req.query.cours) {
                filters.id_cours = req.query.cours;
                notes = notes.filter(n => n.id_cours == req.query.cours);
            }

            if (req.query.type) {
                filters.type_evaluation = req.query.type;
                notes = notes.filter(n => n.type_evaluation === req.query.type);
            }

            res.render('notes/list', {
                layout: 'main',
                title: 'Gestion des notes',
                notes,
                filters,
                canEdit,
                canDelete,
                canAdd,
                user: req.user
            });

        } catch (error) {
            console.error('Erreur liste notes:', error);
            res.status(500).render('error', {
                layout: 'main',
                title: 'Erreur',
                message: 'Erreur lors du chargement des notes'
            });
        }
    }

    // Formulaire d'ajout de note (enseignant uniquement)
    static async createForm(req, res) {
        try {
            if (req.user.role !== 'enseignant') {
                return res.status(403).render('error', {
                    layout: 'main',
                    title: 'Accès non autorisé',
                    message: 'Seuls les enseignants peuvent ajouter des notes'
                });
            }

            const enseignant = await Enseignant.findByEmail(req.user.email);
            const cours = await Note.getCoursEnseignant(enseignant.id);

            res.render('notes/create', {
                layout: 'main',
                title: 'Ajouter une note',
                cours,
                user: req.user
            });

        } catch (error) {
            console.error('Erreur formulaire création:', error);
            res.status(500).render('error', {
                layout: 'main',
                title: 'Erreur',
                message: 'Erreur lors du chargement du formulaire'
            });
        }
    }

    // Créer une note (enseignant uniquement)
    static async create(req, res) {
        try {
            if (req.user.role !== 'enseignant') {
                return res.status(403).json({ success: false, message: 'Accès non autorisé' });
            }

            const enseignant = await Enseignant.findByEmail(req.user.email);
            const {
                id_etudiant,
                id_cours,
                type_evaluation,
                note,
                coefficient,
                date_evaluation,
                semestre,
                annee_universitaire,
                remarque
            } = req.body;

            // Vérifier si la note existe déjà
            const existe = await Note.exists(
                id_etudiant,
                id_cours,
                type_evaluation,
                semestre,
                annee_universitaire
            );

            if (existe) {
                return res.status(400).json({
                    success: false,
                    message: 'Une note de ce type existe déjà pour cet étudiant'
                });
            }

            const noteData = {
                id_etudiant,
                id_cours,
                type_evaluation,
                note: parseFloat(note),
                coefficient: parseFloat(coefficient),
                date_evaluation,
                semestre,
                annee_universitaire,
                remarque,
                id_enseignant: enseignant.id
            };

            await Note.create(noteData);

            res.json({ success: true, message: 'Note ajoutée avec succès' });

        } catch (error) {
            console.error('Erreur création note:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de l\'ajout de la note'
            });
        }
    }

    // Formulaire de modification (enseignant uniquement)
    static async editForm(req, res) {
        try {
            if (req.user.role !== 'enseignant') {
                return res.status(403).render('error', {
                    layout: 'main',
                    title: 'Accès non autorisé',
                    message: 'Seuls les enseignants peuvent modifier des notes'
                });
            }

            const note = await Note.findById(req.params.id);
            
            if (!note) {
                return res.status(404).render('error', {
                    layout: 'main',
                    title: 'Erreur',
                    message: 'Note non trouvée'
                });
            }

            // Vérifier que c'est bien l'enseignant de cette note
            const enseignant = await Enseignant.findByEmail(req.user.email);
            if (note.id_enseignant !== enseignant.id) {
                return res.status(403).render('error', {
                    layout: 'main',
                    title: 'Accès non autorisé',
                    message: 'Vous ne pouvez modifier que vos propres notes'
                });
            }

            res.render('notes/edit', {
                layout: 'main',
                title: 'Modifier la note',
                note,
                user: req.user
            });

        } catch (error) {
            console.error('Erreur formulaire modification:', error);
            res.status(500).render('error', {
                layout: 'main',
                title: 'Erreur',
                message: 'Erreur lors du chargement du formulaire'
            });
        }
    }

    // Mettre à jour une note (enseignant uniquement)
    static async update(req, res) {
        try {
            if (req.user.role !== 'enseignant') {
                return res.status(403).json({ success: false, message: 'Accès non autorisé' });
            }

            const note = await Note.findById(req.params.id);
            const enseignant = await Enseignant.findByEmail(req.user.email);

            if (note.id_enseignant !== enseignant.id) {
                return res.status(403).json({
                    success: false,
                    message: 'Vous ne pouvez modifier que vos propres notes'
                });
            }

            const noteData = {
                note: parseFloat(req.body.note),
                coefficient: parseFloat(req.body.coefficient),
                type_evaluation: req.body.type_evaluation,
                date_evaluation: req.body.date_evaluation,
                remarque: req.body.remarque
            };

            await Note.update(req.params.id, noteData);

            res.json({ success: true, message: 'Note modifiée avec succès' });

        } catch (error) {
            console.error('Erreur modification note:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la modification'
            });
        }
    }

    // Supprimer une note (enseignant uniquement)
    static async delete(req, res) {
        try {
            if (req.user.role !== 'enseignant') {
                return res.status(403).json({ success: false, message: 'Accès non autorisé' });
            }

            const note = await Note.findById(req.params.id);
            const enseignant = await Enseignant.findByEmail(req.user.email);

            if (note.id_enseignant !== enseignant.id) {
                return res.status(403).json({
                    success: false,
                    message: 'Vous ne pouvez supprimer que vos propres notes'
                });
            }

            await Note.delete(req.params.id);

            res.json({ success: true, message: 'Note supprimée avec succès' });

        } catch (error) {
            console.error('Erreur suppression note:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la suppression'
            });
        }
    }

    // Vue étudiant - ses notes et moyennes
    static async studentView(req, res) {
        try {
            const etudiantId = req.params.id;
            
            // Vérifier les permissions
            if (req.user.role === 'etudiant') {
                const etudiant = await Etudiant.findByEmail(req.user.email);
                if (etudiant.id != etudiantId) {
                    return res.status(403).render('error', {
                        layout: 'main',
                        title: 'Accès non autorisé',
                        message: 'Vous ne pouvez voir que vos propres notes'
                    });
                }
            }
            

            const semestre = req.query.semestre || '1';
            const annee = req.query.annee || '2025-2026';

            const bulletin = await Note.getBulletin(etudiantId, semestre, annee);
            const etudiant = await Etudiant.findById(etudiantId);

            // Calculer moyenne générale
            let moyenneGenerale = 0;
            if (bulletin.length > 0) {
                const sommeMoyennes = bulletin.reduce((sum, cours) => sum + parseFloat(cours.moyenne || 0), 0);
                moyenneGenerale = sommeMoyennes / bulletin.length;
            }

            res.render('notes/student', {
                layout: 'main',
                title: 'Mes notes',
                etudiant,
                bulletin,
                moyenneGenerale: moyenneGenerale.toFixed(2),
                semestre,
                annee,
                user: req.user
            });

        } catch (error) {
            console.error('Erreur vue étudiant:', error);
            res.status(500).render('error', {
                layout: 'main',
                title: 'Erreur',
                message: 'Erreur lors du chargement des notes'
            });
        }
    }

    // Statistiques (enseignant, admin, directeur)
    static async statistics(req, res) {
        try {
            const idCours = req.query.cours;
            const semestre = req.query.semestre || '1';
            const annee = req.query.annee || '2025-2026';

            if (!idCours) {
                return res.status(400).render('error', {
                    layout: 'main',
                    title: 'Erreur',
                    message: 'Veuillez sélectionner un cours'
                });
            }

            // Vérifier les permissions
            if (req.user.role === 'enseignant') {
                const enseignant = await Enseignant.findByEmail(req.user.email);
                const cours = await Cours.findById(idCours);
                
                if (cours.id_enseignant !== enseignant.id) {
                    return res.status(403).render('error', {
                        layout: 'main',
                        title: 'Accès non autorisé',
                        message: 'Vous ne pouvez voir que les statistiques de vos cours'
                    });
                }
            }

            const stats = await Note.getStatistiquesCours(idCours, semestre, annee);
            const classement = await Note.getClassement(idCours, semestre, annee);
            const cours = await Cours.findById(idCours);

            res.render('notes/statistics', {
                layout: 'main',
                title: 'Statistiques du cours',
                stats,
                classement,
                cours,
                semestre,
                annee,
                user: req.user
            });

        } catch (error) {
            console.error('Erreur statistiques:', error);
            res.status(500).render('error', {
                layout: 'main',
                title: 'Erreur',
                message: 'Erreur lors du chargement des statistiques'
            });
        }
    }

    // API - Obtenir les étudiants d'un cours
    static async getEtudiantsCours(req, res) {
        try {
            const etudiants = await Note.getEtudiantsCours(req.params.id_cours);
            res.json({ success: true, etudiants });
        } catch (error) {
            console.error('Erreur récupération étudiants:', error);
            res.status(500).json({ success: false, message: 'Erreur serveur' });
        }
    }
}

module.exports = NoteController;
