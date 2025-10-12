const db = require('../config/database');

class User {
    static async findByLogin(login) {
        const [rows] = await db.query(
            'SELECT * FROM utilisateurs WHERE login = ?',
            [login]
        );
        return rows[0];
    }

    static async findByEmail(email) {
        const [rows] = await db.query(
            'SELECT * FROM utilisateurs WHERE email = ?',
            [email]
        );
        return rows[0];
    }

    static async findById(id) {
        const [rows] = await db.query(
            'SELECT id, nom, prenom, email, login, role, actif FROM utilisateurs WHERE id = ?',
            [id]
        );
        return rows[0];
    }

    static async create(userData) {
        const { nom, prenom, email, login, mdp_hash, role } = userData;
        const [result] = await db.query(
            'INSERT INTO utilisateurs (nom, prenom, email, login, mdp_hash, role) VALUES (?, ?, ?, ?, ?, ?)',
            [nom, prenom, email, login, mdp_hash, role]
        );
        return result.insertId;
    }

    static async updateProfile(id, userData) {
        const { nom, prenom, email } = userData;
        await db.query(
            'UPDATE utilisateurs SET nom = ?, prenom = ?, email = ? WHERE id = ?',
            [nom, prenom, email, id]
        );
    }
}

module.exports = User;