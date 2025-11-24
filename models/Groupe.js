const db = require('../config/database');

class Groupe {
    static async findAll() {
        const [rows] = await db.query(`
            SELECT g.*, s.id_departement 
            FROM groupes g
            LEFT JOIN specialites s ON g.id_specialite = s.id
            ORDER BY g.nom
        `);
        return rows;
    }

    static async findByDepartement(id_departement) {
        if (!id_departement) {
            return [];
        }

        const [rows] = await db.query(`
            SELECT g.*
            FROM groupes g
            INNER JOIN specialites s ON g.id_specialite = s.id
            WHERE s.id_departement = ?
            ORDER BY g.nom
        `, [id_departement]);

        return rows;
    }

    static async findById(id) {
        const [rows] = await db.query('SELECT * FROM groupes WHERE id = ?', [id]);
        return rows[0];
    }
}

module.exports = Groupe;
