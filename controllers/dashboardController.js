const Departement = require('../models/Departement');
const Enseignant = require('../models/Enseignant');
const Etudiant = require('../models/Etudiant');
const Cours = require('../models/Cours');
const db = require('../config/database');

class DashboardController {
    static async index(req, res) {
        try {
            const stats = {
                departements: 0,
                enseignants: 0,
                etudiants: 0,
                cours: 0,
                etudiantsParDept: [],
                coursParEnseignant: [],
                inscriptionsParMois: [],
                conflitsEnAttente: 0,
                sallesDisponibles: 0,
                rattrapagesAPlanifier: 0
            };

            // Dashboard ADMIN - Vue globale de tous les départements
            if (req.user.role === 'admin') {
                try {
                    const [departementsCount] = await db.query('SELECT COUNT(*) as total FROM departements');
                    const [enseignantsCount] = await db.query('SELECT COUNT(*) as total FROM enseignants');
                    const [etudiantsCount] = await db.query('SELECT COUNT(*) as total FROM etudiants');

                    stats.departements = departementsCount[0]?.total || 0;
                    stats.enseignants = enseignantsCount[0]?.total || 0;
                    stats.etudiants = etudiantsCount[0]?.total || 0;
                    
                    // Vérifier si la table cours existe
                    try {
                        const [coursCount] = await db.query('SELECT COUNT(*) as total FROM cours');
                        stats.cours = coursCount[0]?.total || 0;
                    } catch (error) {
                        stats.cours = 0; // Table cours n'existe pas encore
                    }
                } catch (error) {
                    console.error('Erreur compteurs:', error);
                }

                // Répartition des étudiants par groupe
                try {
                    const [etudiantsParGroupe] = await db.query(`
                        SELECT g.nom as departement, COUNT(e.id) as total
                        FROM groupes g
                        LEFT JOIN etudiants e ON e.id_groupe = g.id
                        GROUP BY g.id, g.nom
                        HAVING COUNT(e.id) > 0
                        ORDER BY total DESC
                    `);
                    stats.etudiantsParDept = etudiantsParGroupe || [];
                } catch (error) {
                    console.error('Erreur étudiants par groupe:', error);
                }

                // Cours par enseignant (si table cours existe)
                try {
                    const [coursParEnseignant] = await db.query(`
                        SELECT CONCAT(ens.prenom, ' ', ens.nom) as enseignant, COUNT(c.id) as total
                        FROM enseignants ens
                        LEFT JOIN cours c ON c.id_enseignant = ens.id
                        GROUP BY ens.id, ens.prenom, ens.nom
                        HAVING COUNT(c.id) > 0
                        ORDER BY total DESC
                        LIMIT 10
                    `);
                    stats.coursParEnseignant = coursParEnseignant || [];
                } catch (error) {
                    // Table cours n'existe pas encore
                    stats.coursParEnseignant = [];
                }

                // Évolution des inscriptions (6 derniers mois)
                try {
                    const [inscriptionsParMois] = await db.query(`
                        SELECT 
                            DATE_FORMAT(created_at, '%Y-%m') as mois,
                            COUNT(*) as total
                        FROM etudiants
                        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
                        GROUP BY mois
                        ORDER BY mois ASC
                    `);
                    stats.inscriptionsParMois = inscriptionsParMois || [];
                } catch (error) {
                    // Colonne created_at n'existe pas
                    stats.inscriptionsParMois = [];
                }
            }

            // Dashboard DIRECTEUR - Vue limitée à son département
            if (req.user.role === 'directeur') {
                try {
                    // Récupérer le département du directeur depuis la table users
                    let idDepartement = req.user.id_departement;
                    
                    // Si le directeur n'a pas de département assigné, prendre le premier
                    if (!idDepartement) {
                        const [departements] = await db.query('SELECT id FROM departements LIMIT 1');
                        idDepartement = departements[0]?.id;
                    }

                    if (idDepartement) {
                        // Enseignants de son département
                        const [enseignantsCount] = await db.query(
                            'SELECT COUNT(*) as total FROM enseignants WHERE id_departement = ?',
                            [idDepartement]
                        );
                        stats.enseignants = enseignantsCount[0]?.total || 0;

                        // Étudiants de son département (via specialites)
                        const [etudiantsCount] = await db.query(`
                            SELECT COUNT(DISTINCT e.id) as total 
                            FROM etudiants e
                            INNER JOIN specialites s ON e.id_specialite = s.id
                            WHERE s.id_departement = ?
                        `, [idDepartement]);
                        stats.etudiants = etudiantsCount[0]?.total || 0;

                        // Cours de son département (via enseignants)
                        try {
                            const [coursCount] = await db.query(`
                                SELECT COUNT(*) as total 
                                FROM cours c
                                INNER JOIN enseignants ens ON c.id_enseignant = ens.id
                                WHERE ens.id_departement = ?
                            `, [idDepartement]);
                            stats.cours = coursCount[0]?.total || 0;
                        } catch (error) {
                            stats.cours = 0;
                        }

                        // Conflits en attente (cours qui se chevauchent dans son département)
                        try {
                            const [conflits] = await db.query(`
                                SELECT COUNT(DISTINCT c1.id) as total
                                FROM cours c1
                                INNER JOIN cours c2 ON c1.id < c2.id
                                INNER JOIN enseignants ens1 ON c1.id_enseignant = ens1.id
                                INNER JOIN enseignants ens2 ON c2.id_enseignant = ens2.id
                                WHERE (ens1.id_departement = ? OR ens2.id_departement = ?)
                                AND c1.jour = c2.jour
                                AND (c1.id_enseignant = c2.id_enseignant OR c1.id_salle = c2.id_salle OR c1.id_groupe = c2.id_groupe)
                                AND (
                                    (c1.heure_debut < c2.heure_fin AND c1.heure_fin > c2.heure_debut)
                                )
                            `, [idDepartement, idDepartement]);
                            stats.conflitsEnAttente = conflits[0]?.total || 0;
                        } catch (error) {
                            stats.conflitsEnAttente = 0;
                        }

                        // Étudiants par groupe (son département uniquement via specialites)
                        const [etudiantsParGroupe] = await db.query(`
                            SELECT g.nom as departement, COUNT(e.id) as total
                            FROM groupes g
                            LEFT JOIN etudiants e ON e.id_groupe = g.id
                            LEFT JOIN specialites s ON e.id_specialite = s.id
                            WHERE s.id_departement = ?
                            GROUP BY g.id, g.nom
                            HAVING COUNT(e.id) > 0
                            ORDER BY total DESC
                        `, [idDepartement]);
                        stats.etudiantsParDept = etudiantsParGroupe || [];

                        // Cours par enseignant (son département uniquement)
                        try {
                            const [coursParEnseignant] = await db.query(`
                                SELECT CONCAT(ens.prenom, ' ', ens.nom) as enseignant, COUNT(c.id) as total
                                FROM enseignants ens
                                LEFT JOIN cours c ON c.id_enseignant = ens.id
                                WHERE ens.id_departement = ?
                                GROUP BY ens.id, ens.prenom, ens.nom
                                HAVING COUNT(c.id) > 0
                                ORDER BY total DESC
                                LIMIT 10
                            `, [idDepartement]);
                            stats.coursParEnseignant = coursParEnseignant || [];
                        } catch (error) {
                            stats.coursParEnseignant = [];
                        }
                    }
                } catch (error) {
                    console.error('Erreur dashboard directeur:', error);
                }
            }

            res.render('dashboard/index', {
                layout: 'main',
                title: 'Tableau de bord',
                user: req.user,
                stats
            });
        } catch (error) {
            console.error('Erreur dashboard:', error);
            res.render('dashboard/index', {
                layout: 'main',
                title: 'Tableau de bord',
                user: req.user,
                stats: {
                    departements: 0,
                    enseignants: 0,
                    etudiants: 0,
                    cours: 0,
                    etudiantsParDept: [],
                    coursParEnseignant: [],
                    inscriptionsParMois: []
                }
            });
        }
    }
}

module.exports = DashboardController;
