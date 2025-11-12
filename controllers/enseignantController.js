const Enseignant = require('../models/Enseignant');
const Departement = require('../models/Departement');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

class EnseignantController {
    static async index(req, res) {
        try {
            const enseignants = await Enseignant.findAll();
            res.render('enseignants/list', {
                layout: 'main',
                title: 'Liste des enseignants',
                enseignants
            });
        } catch (error) {
            console.error(error);
            res.status(500).send('Erreur serveur');
        }
    }

    static async showCreate(req, res) {
        try {
            const departements = await Departement.findAll();
            res.render('enseignants/create', {
                layout: 'main',
                title: 'Ajouter un enseignant',
                departements
            });
        } catch (error) {
            console.error(error);
            res.status(500).send('Erreur serveur');
        }
    }

    static async create(req, res) {
        try {
            await Enseignant.create(req.body);
            res.redirect('/enseignants?success=create');
        } catch (error) {
            console.error(error);
            const departements = await Departement.findAll();
            res.render('enseignants/create', {
                layout: 'main',
                title: 'Ajouter un enseignant',
                error: 'Erreur lors de la création',
                departements,
                data: req.body
            });
        }
    }

    static async showEdit(req, res) {
        try {
            const enseignant = await Enseignant.findById(req.params.id);
            const departements = await Departement.findAll();
            if (!enseignant) {
                return res.status(404).send('Enseignant non trouvé');
            }
            res.render('enseignants/edit', {
                layout: 'main',
                title: 'Modifier l\'enseignant',
                enseignant,
                departements
            });
        } catch (error) {
            console.error(error);
            res.status(500).send('Erreur serveur');
        }
    }

    static async update(req, res) {
        try {
            await Enseignant.update(req.params.id, req.body);
            res.redirect('/enseignants?success=update');
        } catch (error) {
            console.error(error);
            res.redirect('/enseignants?error=update');
        }
    }

    static async delete(req, res) {
        try {
            await Enseignant.delete(req.params.id);
            res.redirect('/enseignants?success=delete');
        } catch (error) {
            console.error(error);
            res.redirect('/enseignants?error=delete');
        }
    }

    // Afficher la page d'importation CSV
    static async showImport(req, res) {
        try {
            const departements = await Departement.findAll();
            res.render('enseignants/import', {
                layout: 'main',
                title: 'Importer des enseignants (CSV)',
                departements,
                user: req.user
            });
        } catch (error) {
            console.error(error);
            res.status(500).send('Erreur serveur');
        }
    }

    // Importer des enseignants depuis un fichier CSV
    static async importCSV(req, res) {
        if (!req.file) {
            const departements = await Departement.findAll();
            return res.render('enseignants/import', {
                layout: 'main',
                title: 'Importer des enseignants (CSV)',
                error: 'Aucun fichier n\'a été téléchargé',
                departements,
                user: req.user
            });
        }

        const results = [];
        const errors = [];
        let lineNumber = 1;

        try {
            const departements = await Departement.findAll();
            const departementMap = {};
            const normalize = value => value
                ? value.normalize('NFD').replace(/[\u0000-\u001f\u0300-\u036f]/g, '').trim().toLowerCase()
                : '';

            departements.forEach(dept => {
                const names = [dept.nom, dept.code].map(normalize).filter(Boolean);
                names.forEach(name => {
                    if (!departementMap[name]) {
                        departementMap[name] = dept.id;
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

                        // Trouver l'ID du département
                        if (!data.departement || data.departement.trim() === '') {
                            errors.push(`Ligne ${lineNumber}: Le département est requis`);
                            return;
                        }

                        const deptName = normalize(data.departement);
                        const departementId = departementMap[deptName];
                        if (!departementId) {
                            errors.push(`Ligne ${lineNumber}: Département "${data.departement}" non trouvé`);
                            return;
                        }
                        
                        results.push({
                            nom: data.nom.trim(),
                            prenom: data.prenom.trim(),
                            email: data.email.trim(),
                            telephone: data.telephone ? data.telephone.trim() : null,
                            specialite: data.specialite ? data.specialite.trim() : null,
                            id_departement: departementId
                        });
                    })
                    .on('end', resolve)
                    .on('error', reject);
            });

            // Insérer les enseignants valides dans la base de données
            let successCount = 0;
            for (const enseignant of results) {
                try {
                    await Enseignant.create(enseignant);
                    successCount++;
                } catch (error) {
                    errors.push(`Erreur lors de l'insertion de "${enseignant.nom} ${enseignant.prenom}": ${error.message}`);
                }
            }

            // Supprimer le fichier uploadé
            fs.unlinkSync(req.file.path);

            // Afficher le résultat
            res.render('enseignants/import', {
                layout: 'main',
                title: 'Importer des enseignants (CSV)',
                success: `${successCount} enseignant(s) importé(s) avec succès`,
                errors: errors.length > 0 ? errors : null,
                departements,
                user: req.user
            });

        } catch (error) {
            console.error('Erreur lors de l\'importation CSV:', error);
            
            // Supprimer le fichier en cas d'erreur
            if (fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }

            const departements = await Departement.findAll();
            res.render('enseignants/import', {
                layout: 'main',
                title: 'Importer des enseignants (CSV)',
                error: 'Erreur lors de l\'importation du fichier CSV',
                departements,
                user: req.user
            });
        }
    }

    // Télécharger un modèle CSV
    static downloadTemplate(req, res) {
        const csvContent = 'nom,prenom,email,telephone,specialite,departement\n' +
                          'Dupont,Jean,jean.dupont@universite.fr,0123456789,Programmation,Informatique\n' +
                          'Martin,Marie,marie.martin@universite.fr,0987654321,Algèbre,Mathématiques\n';
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=modele_enseignants.csv');
        res.send(csvContent);
    }
}

module.exports = EnseignantController;