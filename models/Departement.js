const db = require('../config/database');

class Departement {
    static async findAll() {
        const [rows] = await db.query('SELECT * FROM departements ORDER BY nom');
        return rows;
    }

    static async findById(id) {
        const [rows] = await db.query('SELECT * FROM departements WHERE id = ?', [id]);
        return rows[0];
    }

    static async create(data) {
        const { nom, description, code } = data;
        const [result] = await db.query(
            'INSERT INTO departements (nom, description, code) VALUES (?, ?, ?)',
            [nom, description, code]
        );
        return result.insertId;
    }

    static async update(id, data) {
        const { nom, description, code } = data;
        await db.query(
            'UPDATE departements SET nom = ?, description = ?, code = ? WHERE id = ?',
            [nom, description, code, id]
        );
    }

    static async delete(id) {
        await db.query('DELETE FROM departements WHERE id = ?', [id]);
    }

    static async count() {
        const [rows] = await db.query('SELECT COUNT(*) as total FROM departements');
        return rows[0].total;
    }
}

module.exports = Departement;