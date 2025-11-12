const Etudiant = require('../models/Etudiant');
const db = require('../config/database');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

class EtudiantController {
    static async index(req, res) {
        try {
            const etudiants = await Etudiant.findAll();
            res.render('etudiants/list', {
                layout: 'main',
                title: 'Liste des étudiants',
                etudiants
            });
        } catch (error) {
            console.error(error);
            res.status(500).send('Erreur serveur');
        }
    }

    static async showCreate(req, res) {
        try {
            const [groupes] = await db.query('SELECT * FROM groupes ORDER BY nom');
            const [specialites] = await db.query('SELECT * FROM specialites ORDER BY nom');
            res.render('etudiants/create', {
                layout: 'main',
                title: 'Ajouter un étudiant',
                groupes,
                specialites
            });
        } catch (error) {
            console.error(error);
            res.status(500).send('Erreur serveur');
        }
    }

    static async create(req, res) {
        try {
            await Etudiant.create(req.body);
            res.redirect('/etudiants?success=create');
        } catch (error) {
            console.error(error);
            const [groupes] = await db.query('SELECT * FROM groupes ORDER BY nom');
            const [specialites] = await db.query('SELECT * FROM specialites ORDER BY nom');
            res.render('etudiants/create', {
                layout: 'main',
                title: 'Ajouter un étudiant',
                error: 'Erreur lors de la création',
                groupes,
                specialites,
                data: req.body
            });
        }
    }

    static async showEdit(req, res) {
        try {
            const etudiant = await Etudiant.findById(req.params.id);
            const [groupes] = await db.query('SELECT * FROM groupes ORDER BY nom');
            const [specialites] = await db.query('SELECT * FROM specialites ORDER BY nom');
            if (!etudiant) {
                return res.status(404).send('Étudiant non trouvé');
            }
            res.render('etudiants/edit', {
                layout: 'main',
                title: 'Modifier l\'étudiant',
                etudiant,
                groupes,
                specialites
            });
        } catch (error) {
            console.error(error);
            res.status(500).send('Erreur serveur');
        }
    }

    static async update(req, res) {
        try {
            await Etudiant.update(req.params.id, req.body);
            res.redirect('/etudiants?success=update');
        } catch (error) {
            console.error(error);
            res.redirect('/etudiants?error=update');
        }
    }

    static async delete(req, res) {
        try {
            await Etudiant.delete(req.params.id);
            res.redirect('/etudiants?success=delete');
        } catch (error) {
            console.error(error);
            res.redirect('/etudiants?error=delete');
        }
    }

    // Afficher la page d'importation CSV
    static async showImport(req, res) {
        try {
            const [groupes] = await db.query('SELECT * FROM groupes ORDER BY nom');
            const [specialites] = await db.query('SELECT * FROM specialites ORDER BY nom');
            res.render('etudiants/import', {
                layout: 'main',
                title: 'Importer des étudiants (CSV)',
                groupes,
                specialites,
                user: req.user
            });
        } catch (error) {
            console.error(error);
            res.status(500).send('Erreur serveur');
        }
    }

    // Importer des étudiants depuis un fichier CSV
    static async importCSV(req, res) {
        if (!req.file) {
            const [groupes] = await db.query('SELECT * FROM groupes ORDER BY nom');
            const [specialites] = await db.query('SELECT * FROM specialites ORDER BY nom');
            return res.render('etudiants/import', {
                layout: 'main',
                title: 'Importer des étudiants (CSV)',
                error: 'Aucun fichier n\'a été téléchargé',
                groupes,
                specialites,
                user: req.user
            });
        }

        const results = [];
        const errors = [];
        let lineNumber = 1;

        try {
            // Récupérer les groupes et spécialités
            const [groupes] = await db.query('SELECT * FROM groupes ORDER BY nom');
            const [specialites] = await db.query('SELECT * FROM specialites ORDER BY nom');
            
            const normalize = value => value
                ? value.normalize('NFD').replace(/[\u0000-\u001f\u0300-\u036f]/g, '').trim().toLowerCase()
                : '';

            const groupeMap = {};
            const specialiteMap = {};

            groupes.forEach(groupe => {
                const keys = [groupe.nom, groupe.code, groupe.type].map(normalize).filter(Boolean);
                keys.forEach(key => {
                    if (!groupeMap[key]) {
                        groupeMap[key] = groupe.id;
                    }
                });
            });

            specialites.forEach(specialite => {
                const keys = [specialite.nom, specialite.code].map(normalize).filter(Boolean);
                keys.forEach(key => {
                    if (!specialiteMap[key]) {
                        specialiteMap[key] = specialite.id;
                    }
                });
            });

            // Lire et parser le fichier CSV
            await new Promise((resolve, reject) => {
                fs.createReadStream(req.file.path)
                    .pipe(csv({
                        separator: ',',
                        mapHeaders: ({ header }) => header.trim().toLowerCase()
                    }))
                    .on('data', (data) => {
                        lineNumber++;
                        
                        // Validation des données
                        if (!data.nom || data.nom.trim() === '') {
                            errors.push(`Ligne ${lineNumber}: Le nom est requis`);
                            return;
                        }
                        if (!data.prenom || data.prenom.trim() === '') {
                            errors.push(`Ligne ${lineNumber}: Le prénom est requis`);
                            return;
                        }
                        if (!data.email || data.email.trim() === '') {
                            errors.push(`Ligne ${lineNumber}: L'email est requis`);
                            return;
                        }
                        const identification = (data.numero_etudiant || data.cin || '').trim();
                        if (!identification) {
                            errors.push(`Ligne ${lineNumber}: Le numéro étudiant (ou CIN) est requis`);
                            return;
                        }

                        // Trouver l'ID du groupe
                        if (!data.groupe || data.groupe.trim() === '') {
                            errors.push(`Ligne ${lineNumber}: Le groupe est requis`);
                            return;
                        }

                        const groupeName = normalize(data.groupe);
                        const groupeId = groupeMap[groupeName];
                        if (!groupeId) {
                            errors.push(`Ligne ${lineNumber}: Groupe "${data.groupe}" non trouvé`);
                            return;
                        }

                        // Trouver l'ID de la spécialité
                        let specialiteId = null;
                        if (data.specialite && data.specialite.trim() !== '') {
                            const specialiteName = normalize(data.specialite);
                            specialiteId = specialiteMap[specialiteName];
                            if (!specialiteId) {
                                errors.push(`Ligne ${lineNumber}: Spécialité "${data.specialite}" non trouvée`);
                                return;
                            }
                        }
                        
                        results.push({
                            nom: data.nom.trim(),
                            prenom: data.prenom.trim(),
                            email: data.email.trim(),
                            cin: identification,
                            date_naissance: data.date_naissance ? data.date_naissance.trim() : null,
                            telephone: data.telephone ? data.telephone.trim() : null,
                            adresse: data.adresse ? data.adresse.trim() : null,
                            id_groupe: groupeId,
                            id_specialite: specialiteId
                        });
                    })
                    .on('end', resolve)
                    .on('error', reject);
            });

            // Insérer les étudiants valides dans la base de données
            let successCount = 0;
            for (const etudiant of results) {
                try {
                    await Etudiant.create(etudiant);
                    successCount++;
                } catch (error) {
                    errors.push(`Erreur lors de l'insertion de "${etudiant.nom} ${etudiant.prenom}": ${error.message}`);
                }
            }

            // Supprimer le fichier uploadé
            fs.unlinkSync(req.file.path);

            // Afficher le résultat
            res.render('etudiants/import', {
                layout: 'main',
                title: 'Importer des étudiants (CSV)',
                success: `${successCount} étudiant(s) importé(s) avec succès`,
                errors: errors.length > 0 ? errors : null,
                groupes,
                specialites,
                user: req.user
            });

        } catch (error) {
            console.error('Erreur lors de l\'importation CSV:', error);
            
            // Supprimer le fichier en cas d'erreur
            if (fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }

            const [groupes] = await db.query('SELECT * FROM groupes ORDER BY nom');
            const [specialites] = await db.query('SELECT * FROM specialites ORDER BY nom');
            res.render('etudiants/import', {
                layout: 'main',
                title: 'Importer des étudiants (CSV)',
                error: 'Erreur lors de l\'importation du fichier CSV',
                groupes,
                specialites,
                user: req.user
            });
        }
    }

    // Télécharger un modèle CSV
    static downloadTemplate(req, res) {
        const csvContent = 'nom,prenom,email,numero_etudiant,date_naissance,telephone,adresse,groupe,specialite\n' +
                          'Dupont,Jean,jean.dupont@etudiant.fr,E12345,2000-05-15,0123456789,123 Rue de Paris,Groupe A,Informatique\n' +
                          'Martin,Marie,marie.martin@etudiant.fr,E12346,2001-08-20,0987654321,456 Avenue des Champs,Groupe B,Mathématiques\n';
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=modele_etudiants.csv');
        res.send(csvContent);
    }
}

module.exports = EtudiantController;