const Enseignant = require('../models/Enseignant');
const Departement = require('../models/Departement');

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
}

module.exports = EnseignantController;