const db = require('../config/database');

class Emploi {
    static async findByGroupe(id_groupe) {
        const [rows] = await db.query(`
            SELECT e.*, 
                   en.nom AS enseignant_nom,
                   en.prenom AS enseignant_prenom,
                   s.nom AS salle_nom,
                   s.code AS salle_code,
                   g.nom AS groupe_nom
            FROM emplois_du_temps e
            LEFT JOIN enseignants en ON e.id_enseignant = en.id
            LEFT JOIN salles s ON e.id_salle = s.id
            LEFT JOIN groupes g ON e.id_groupe = g.id
            WHERE e.id_groupe = ?
            ORDER BY FIELD(e.jour, 'lundi','mardi','mercredi','jeudi','vendredi','samedi','dimanche'), e.heure_debut
        `, [id_groupe]);
        return rows;
    }

    static async findById(id) {
        const [rows] = await db.query('SELECT * FROM emplois_du_temps WHERE id = ?', [id]);
        return rows[0];
    }

    static async create(data) {
        const { titre, type_cours, description, id_enseignant, id_groupe, id_salle, jour, heure_debut, heure_fin } = data;
        const [result] = await db.query(
            `INSERT INTO emplois_du_temps (titre, type_cours, description, id_enseignant, id_groupe, id_salle, jour, heure_debut, heure_fin)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [titre, type_cours, description, id_enseignant, id_groupe, id_salle, jour, heure_debut, heure_fin]
        );
        return result.insertId;
    }

    static async update(id, data) {
        const { titre, type_cours, description, id_enseignant, id_groupe, id_salle, jour, heure_debut, heure_fin } = data;
        await db.query(
            `UPDATE emplois_du_temps SET titre = ?, type_cours = ?, description = ?, id_enseignant = ?, id_groupe = ?, id_salle = ?, jour = ?, heure_debut = ?, heure_fin = ? WHERE id = ?`,
            [titre, type_cours, description, id_enseignant, id_groupe, id_salle, jour, heure_debut, heure_fin, id]
        );
    }

    static async delete(id) {
        await db.query('DELETE FROM emplois_du_temps WHERE id = ?', [id]);
    }

    static async findConflicts({ jour, heure_debut, heure_fin, id_enseignant, id_groupe, id_salle, excludeId = null }) {
        const [rows] = await db.query(`
            SELECT e.*,
                   en.nom AS enseignant_nom,
                   en.prenom AS enseignant_prenom,
                   g.nom AS groupe_nom,
                   s.nom AS salle_nom,
                   s.code AS salle_code
            FROM emplois_du_temps e
            LEFT JOIN enseignants en ON e.id_enseignant = en.id
            LEFT JOIN groupes g ON e.id_groupe = g.id
            LEFT JOIN salles s ON e.id_salle = s.id
            WHERE e.jour = ?
              AND (? IS NULL OR e.id <> ?)
              AND (
                    e.id_salle = ?
                 OR e.id_enseignant = ?
                 OR e.id_groupe = ?
              )
              AND NOT (e.heure_fin <= ? OR e.heure_debut >= ?)
            ORDER BY e.heure_debut
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
}

module.exports = Emploi;
