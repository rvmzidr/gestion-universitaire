const db = require('../config/database');

class Groupe {
    static async findAll() {
        const [rows] = await db.query('SELECT * FROM groupes ORDER BY nom');
        return rows;
    }

    static async findById(id) {
        const [rows] = await db.query('SELECT * FROM groupes WHERE id = ?', [id]);
        return rows[0];
    }
}

module.exports = Groupe;
