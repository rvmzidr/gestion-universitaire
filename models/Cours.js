const db = require('../config/database');

class Cours {
    static async findAllWithDetails(options = {}) {
        const filters = [];
        const params = [];

        if (options.id_departement) {
            filters.push(`(
                (e.id_departement IS NOT NULL AND e.id_departement = ?)
                OR
                (sp.id_departement IS NOT NULL AND sp.id_departement = ?)
            )`);
            params.push(options.id_departement, options.id_departement);
        }

        const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

        const [rows] = await db.query(`
            SELECT c.*,
                   e.nom AS enseignant_nom,
                   e.prenom AS enseignant_prenom,
                   g.nom AS groupe_nom,
                   s.nom AS salle_nom,
                   s.code AS salle_code,
                   sp.nom AS specialite_nom,
                   d.id AS departement_id,
                   d.nom AS departement_nom
            FROM cours c
            LEFT JOIN enseignants e ON c.id_enseignant = e.id
            LEFT JOIN groupes g ON c.id_groupe = g.id
            LEFT JOIN specialites sp ON g.id_specialite = sp.id
            LEFT JOIN departements d ON sp.id_departement = d.id
            LEFT JOIN salles s ON c.id_salle = s.id
            ${whereClause}
            ORDER BY FIELD(c.jour, 'lundi','mardi','mercredi','jeudi','vendredi','samedi','dimanche'), c.heure_debut
        `, params);
        return rows;
    }

    static async findById(id) {
        const [rows] = await db.query('SELECT * FROM cours WHERE id = ?', [id]);
        return rows[0];
    }

    static async create(data) {
        const { titre, type_cours, description, id_enseignant, id_groupe, id_salle, jour, heure_debut, heure_fin } = data;
        const [result] = await db.query(
            `INSERT INTO cours (titre, type_cours, description, id_enseignant, id_groupe, id_salle, jour, heure_debut, heure_fin)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [titre, type_cours, description, id_enseignant, id_groupe, id_salle, jour, heure_debut, heure_fin]
        );
        return result.insertId;
    }

    static async update(id, data) {
        const { titre, type_cours, description, id_enseignant, id_groupe, id_salle, jour, heure_debut, heure_fin } = data;
        await db.query(
            `UPDATE cours 
             SET titre = ?, type_cours = ?, description = ?, id_enseignant = ?, id_groupe = ?, id_salle = ?, jour = ?, heure_debut = ?, heure_fin = ?
             WHERE id = ?`,
            [titre, type_cours, description, id_enseignant, id_groupe, id_salle, jour, heure_debut, heure_fin, id]
        );
    }

    static async delete(id) {
        await db.query('DELETE FROM cours WHERE id = ?', [id]);
    }

    static async findConflicts({ jour, heure_debut, heure_fin, id_enseignant, id_groupe, id_salle, excludeId = null }) {
        const [rows] = await db.query(`
            SELECT c.*, 
                   e.nom AS enseignant_nom,
                   e.prenom AS enseignant_prenom,
                   g.nom AS groupe_nom,
                   s.nom AS salle_nom,
                   s.code AS salle_code
            FROM cours c
            LEFT JOIN enseignants e ON c.id_enseignant = e.id
            LEFT JOIN groupes g ON c.id_groupe = g.id
            LEFT JOIN salles s ON c.id_salle = s.id
            WHERE c.jour = ?
              AND (? IS NULL OR c.id <> ?)
              AND (
                    c.id_salle = ?
                 OR c.id_enseignant = ?
                 OR c.id_groupe = ?
              )
              AND NOT (c.heure_fin <= ? OR c.heure_debut >= ?)
            ORDER BY c.heure_debut
        `, [
            jour,
            excludeId,
            excludeId,
            id_salle,
            id_enseignant,
            id_groupe,
            heure_debut,
            heure_fin
        ]);

        return rows;
    }

    static async findByGroupe(id_groupe) {
        const [rows] = await db.query(`
            SELECT c.*, 
                   e.nom AS enseignant_nom,
                   e.prenom AS enseignant_prenom,
                   s.nom AS salle_nom,
                   s.code AS salle_code,
                   g.nom AS groupe_nom
            FROM cours c
            LEFT JOIN enseignants e ON c.id_enseignant = e.id
            LEFT JOIN salles s ON c.id_salle = s.id
            LEFT JOIN groupes g ON c.id_groupe = g.id
            WHERE c.id_groupe = ?
            ORDER BY FIELD(c.jour, 'lundi','mardi','mercredi','jeudi','vendredi','samedi','dimanche'), c.heure_debut
        `, [id_groupe]);
        return rows;
    }
}

module.exports = Cours;
