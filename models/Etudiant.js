const db = require('../config/database');

class Etudiant {
    static async findAll() {
        const [rows] = await db.query(`
            SELECT e.*, g.nom as groupe_nom, s.nom as specialite_nom 
            FROM etudiants e
            LEFT JOIN groupes g ON e.id_groupe = g.id
            LEFT JOIN specialites s ON e.id_specialite = s.id
            ORDER BY e.nom, e.prenom
        `);
        return rows;
    }

    static async findById(id) {
        const [rows] = await db.query(`
            SELECT e.*, g.nom as groupe_nom, s.nom as specialite_nom 
            FROM etudiants e
            LEFT JOIN groupes g ON e.id_groupe = g.id
            LEFT JOIN specialites s ON e.id_specialite = s.id
            WHERE e.id = ?
        `, [id]);
        return rows[0];
    }

    static async create(data) {
        const { nom, prenom, email, cin, date_naissance, id_groupe, id_specialite } = data;
        const [result] = await db.query(
            'INSERT INTO etudiants (nom, prenom, email, cin, date_naissance, id_groupe, id_specialite) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [nom, prenom, email, cin, date_naissance, id_groupe, id_specialite]
        );
        return result.insertId;
    }

    static async update(id, data) {
        const { nom, prenom, email, cin, date_naissance, id_groupe, id_specialite } = data;
        await db.query(
            'UPDATE etudiants SET nom = ?, prenom = ?, email = ?, cin = ?, date_naissance = ?, id_groupe = ?, id_specialite = ? WHERE id = ?',
            [nom, prenom, email, cin, date_naissance, id_groupe, id_specialite, id]
        );
    }

    static async delete(id) {
        await db.query('DELETE FROM etudiants WHERE id = ?', [id]);
    }

    static async count() {
        const [rows] = await db.query('SELECT COUNT(*) as total FROM etudiants');
        return rows[0].total;
    }

    static async findByGroupe(id_groupe) {
        const [rows] = await db.query(
            'SELECT * FROM etudiants WHERE id_groupe = ? ORDER BY nom, prenom',
            [id_groupe]
        );
        return rows;
    }
}

module.exports = Etudiant;