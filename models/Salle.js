const db = require('../config/database');

class Salle {
    static async findAll() {
        const [rows] = await db.query('SELECT * FROM salles ORDER BY code');
        return rows;
    }

    static async findById(id) {
        const [rows] = await db.query('SELECT * FROM salles WHERE id = ?', [id]);
        return rows[0];
    }

    static async create(data) {
        const { code, nom, type, capacite, etage, batiment } = data;
        const [result] = await db.query(
            'INSERT INTO salles (code, nom, type, capacite, etage, batiment) VALUES (?, ?, ?, ?, ?, ?)',
            [code, nom, type, capacite, etage, batiment]
        );
        return result.insertId;
    }

    static async update(id, data) {
        const { code, nom, type, capacite, etage, batiment } = data;
        await db.query(
            'UPDATE salles SET code = ?, nom = ?, type = ?, capacite = ?, etage = ?, batiment = ? WHERE id = ?',
            [code, nom, type, capacite, etage, batiment, id]
        );
    }

    static async delete(id) {
        await db.query('DELETE FROM salles WHERE id = ?', [id]);
    }

    static async count() {
        const [rows] = await db.query('SELECT COUNT(*) as total FROM salles');
        return rows[0].total;
    }
}

module.exports = Salle;