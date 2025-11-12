const Departement = require('../models/Departement');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

class DepartementController {
    // Liste des départements
    static async index(req, res) {
        try {
            const departements = await Departement.findAll();
            res.render('departements/list', {
                layout: 'main',
                title: 'Liste des départements',
                departements
            });
        } catch (error) {
            console.error(error);
            res.status(500).send('Erreur serveur');
        }
    }

    // Formulaire de création
    static showCreate(req, res) {
        res.render('departements/create', {
            layout: 'main',
            title: 'Créer un département'
        });
    }

    // Créer un département
    static async create(req, res) {
        try {
            await Departement.create(req.body);
            res.redirect('/departements?success=create');
        } catch (error) {
            console.error(error);
            res.render('departements/create', {
                layout: 'main',
                title: 'Créer un département',
                error: 'Erreur lors de la création',
                data: req.body
            });
        }
    }

    // Formulaire de modification
    static async showEdit(req, res) {
        try {
            const departement = await Departement.findById(req.params.id);
            if (!departement) {
                return res.status(404).send('Département non trouvé');
            }
            res.render('departements/edit', {
                layout: 'main',
                title: 'Modifier le département',
                departement
            });
        } catch (error) {
            console.error(error);
            res.status(500).send('Erreur serveur');
        }
    }

    // Modifier un département
    static async update(req, res) {
        try {
            await Departement.update(req.params.id, req.body);
            res.redirect('/departements?success=update');
        } catch (error) {
            console.error(error);
            const departement = await Departement.findById(req.params.id);
            res.render('departements/edit', {
                layout: 'main',
                title: 'Modifier le département',
                error: 'Erreur lors de la modification',
                departement
            });
        }
    }

    // Supprimer un département
    static async delete(req, res) {
        try {
            await Departement.delete(req.params.id);
            res.redirect('/departements?success=delete');
        } catch (error) {
            console.error(error);
            res.redirect('/departements?error=delete');
        }
    }

    // Afficher la page d'importation CSV
    static showImport(req, res) {
        res.render('departements/import', {
            layout: 'main',
            title: 'Importer des départements (CSV)',
            user: req.user
        });
    }

    // Importer des départements depuis un fichier CSV
    static async importCSV(req, res) {
        if (!req.file) {
            return res.render('departements/import', {
                layout: 'main',
                title: 'Importer des départements (CSV)',
                error: 'Aucun fichier n\'a été téléchargé',
                user: req.user
            });
        }

        const results = [];
        const errors = [];
        let lineNumber = 1;

        try {
            // Lire et parser le fichier CSV
            await new Promise((resolve, reject) => {
                fs.createReadStream(req.file.path)
                    .pipe(csv({
                        separator: ',',
                        mapHeaders: ({ header }) => header.trim().toLowerCase()
                    }))
                    .on('data', (data) => {
                        lineNumber++;
                        // Valider les données
                        if (!data.nom || data.nom.trim() === '') {
                            errors.push(`Ligne ${lineNumber}: Le nom du département est requis`);
                            return;
                        }
                        
                        results.push({
                            nom: data.nom.trim(),
                            description: data.description ? data.description.trim() : null,
                            chef_departement: data.chef_departement ? data.chef_departement.trim() : null
                        });
                    })
                    .on('end', resolve)
                    .on('error', reject);
            });

            // Insérer les départements valides dans la base de données
            let successCount = 0;
            for (const dept of results) {
                try {
                    await Departement.create(dept);
                    successCount++;
                } catch (error) {
                    errors.push(`Erreur lors de l'insertion de "${dept.nom}": ${error.message}`);
                }
            }

            // Supprimer le fichier uploadé
            fs.unlinkSync(req.file.path);

            // Afficher le résultat
            res.render('departements/import', {
                layout: 'main',
                title: 'Importer des départements (CSV)',
                success: `${successCount} département(s) importé(s) avec succès`,
                errors: errors.length > 0 ? errors : null,
                user: req.user
            });

        } catch (error) {
            console.error('Erreur lors de l\'importation CSV:', error);
            
            // Supprimer le fichier en cas d'erreur
            if (fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }

            res.render('departements/import', {
                layout: 'main',
                title: 'Importer des départements (CSV)',
                error: 'Erreur lors de l\'importation du fichier CSV',
                user: req.user
            });
        }
    }

    // Télécharger un modèle CSV
    static downloadTemplate(req, res) {
        const csvContent = 'nom,description,chef_departement\n' +
                          'Informatique,Département des sciences informatiques,Dr. Dupont\n' +
                          'Mathématiques,Département de mathématiques,Dr. Martin\n';
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=modele_departements.csv');
        res.send(csvContent);
    }
}

module.exports = DepartementController;