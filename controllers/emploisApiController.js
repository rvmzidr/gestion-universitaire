const Emploi = require('../models/Emploi');

const listForGroup = async (req, res) => {
    try {
        const id_groupe = req.query.groupe || req.query.id_groupe;
        if (!id_groupe) return res.status(400).json({ error: 'groupe param required' });

        const rows = await Emploi.findByGroupe(id_groupe);
        // If no rows and demo flag provided, return sample events for testing interactive mode
        if ((rows == null || rows.length === 0) && (req.query.demo === '1' || process.env.NODE_ENV !== 'production' && req.query.demo === '1')) {
            const sample = [
                { id: 1001, titre: 'Mathématiques - CM', type_cours: 'cm', jour: 'lundi', heure_debut: '08:30:00', heure_fin: '10:00:00', enseignant_affichage: 'Dr. Dupont', salle_affichage: 'A101' },
                { id: 1002, titre: 'Algorithmique - TD', type_cours: 'td', jour: 'mardi', heure_debut: '10:15:00', heure_fin: '11:45:00', enseignant_affichage: 'Mme. Martin', salle_affichage: 'B203' },
                { id: 1003, titre: 'Réseaux - TP', type_cours: 'tp', jour: 'mercredi', heure_debut: '14:00:00', heure_fin: '16:00:00', enseignant_affichage: 'M. Leroy', salle_affichage: 'Salle TP' }
            ];
            return res.json(sample);
        }
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

const checkConflict = async (req, res) => {
    try {
        const payload = req.body;
        const conflicts = await Emploi.findConflicts(payload);
        res.json({ conflict: conflicts.length > 0, conflicts });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

const create = async (req, res) => {
    try {
        const payload = req.body;
        if (!payload.titre || !payload.jour || !payload.heure_debut || !payload.heure_fin || !payload.id_groupe) {
            return res.status(400).json({ error: 'Champs manquants' });
        }

        const conflicts = await Emploi.findConflicts(payload);
        if (conflicts.length) {
            return res.status(400).json({ error: 'Conflit détecté', conflicts });
        }

        const insertId = await Emploi.create(payload);
        const created = await Emploi.findById(insertId);
        res.status(201).json(created);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

const update = async (req, res) => {
    try {
        const id = req.params.id;
        const payload = req.body;

        const existing = await Emploi.findById(id);
        if (!existing) return res.status(404).json({ error: 'Non trouvé' });

        payload.excludeId = id;
        const conflicts = await Emploi.findConflicts(payload);
        if (conflicts.length) {
            return res.status(400).json({ error: 'Conflit détecté', conflicts });
        }

        await Emploi.update(id, payload);
        const updated = await Emploi.findById(id);
        res.json(updated);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

const remove = async (req, res) => {
    try {
        const id = req.params.id;
        const existing = await Emploi.findById(id);
        if (!existing) return res.status(404).json({ error: 'Non trouvé' });
        await Emploi.delete(id);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

module.exports = { listForGroup, checkConflict, create, update, remove };
