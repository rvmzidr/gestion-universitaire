const db = require('../config/database');

class Enseignant {
    static async findAll() {
        const [rows] = await db.query(`
            SELECT e.*, d.nom as departement_nom 
            FROM enseignants e
            LEFT JOIN departements d ON e.id_departement = d.id
            ORDER BY e.nom, e.prenom
        `);
        return rows;
    }

    static async findById(id) {
        const [rows] = await db.query(`
            SELECT e.*, d.nom as departement_nom 
            FROM enseignants e
            LEFT JOIN departements d ON e.id_departement = d.id
            WHERE e.id = ?
        `, [id]);
        return rows[0];
    }

    static async create(data) {
        const { nom, prenom, email, telephone, id_departement } = data;
        const [result] = await db.query(
            'INSERT INTO enseignants (nom, prenom, email, telephone, id_departement) VALUES (?, ?, ?, ?, ?)',
            [nom, prenom, email, telephone, id_departement]
        );
        return result.insertId;
    }

    static async update(id, data) {
        const { nom, prenom, email, telephone, id_departement } = data;
        await db.query(
            'UPDATE enseignants SET nom = ?, prenom = ?, email = ?, telephone = ?, id_departement = ? WHERE id = ?',
            [nom, prenom, email, telephone, id_departement, id]
        );
    }

    static async delete(id) {
        await db.query('DELETE FROM enseignants WHERE id = ?', [id]);
    }

    static async count() {
        const [rows] = await db.query('SELECT COUNT(*) as total FROM enseignants');
        return rows[0].total;
    }

    static async findByDepartement(id_departement) {
        const [rows] = await db.query(
            `SELECT e.*, d.nom as departement_nom
             FROM enseignants e
             LEFT JOIN departements d ON e.id_departement = d.id
             WHERE e.id_departement = ?
             ORDER BY e.nom, e.prenom`,
            [id_departement]
        );
        return rows;
    }
}

module.exports = Enseignant;