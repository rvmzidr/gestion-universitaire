const Departement = require('../models/Departement');

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
}

module.exports = DepartementController;