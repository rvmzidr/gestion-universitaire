const Etudiant = require('../models/Etudiant');
const db = require('../config/database');

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
}

module.exports = EtudiantController;