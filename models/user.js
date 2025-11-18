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
            'SELECT id, nom, prenom, email, login, role, actif, id_departement FROM utilisateurs WHERE id = ?',
            [id]
        );
        return rows[0];
    }

    static async create(userData) {
        const { nom, prenom, email, login, mdp_hash, role, id_departement = null } = userData;
        const [result] = await db.query(
            'INSERT INTO utilisateurs (nom, prenom, email, login, mdp_hash, role, id_departement) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [nom, prenom, email, login, mdp_hash, role, id_departement]
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

    static async findDirectorByDepartement(id_departement) {
        if (!id_departement) {
            return null;
        }

        const [rows] = await db.query(
            'SELECT * FROM utilisateurs WHERE role = ? AND id_departement = ? LIMIT 1',
            ['directeur', id_departement]
        );

        return rows[0] || null;
    }
}

module.exports = User;