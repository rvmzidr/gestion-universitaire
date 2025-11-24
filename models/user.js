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
            'SELECT id, nom, prenom, email, login, mdp_hash, role, actif, id_departement FROM utilisateurs WHERE id = ?',
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

    static async update(id, userData) {
        const fields = [];
        const values = [];
        
        Object.keys(userData).forEach(key => {
            fields.push(`${key} = ?`);
            values.push(userData[key]);
        });
        
        values.push(id);
        
        await db.query(
            `UPDATE utilisateurs SET ${fields.join(', ')} WHERE id = ?`,
            values
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

    static async findContactsForUser(user) {
        if (!user) {
            return [];
        }

        const baseFields = 'id, nom, prenom, email, login, role, id_departement';
        const userId = Number.parseInt(user.id, 10) || user.id;
        const departmentId = user.id_departement ? Number.parseInt(user.id_departement, 10) : null;

        let query = `SELECT ${baseFields} FROM utilisateurs WHERE id <> ?`;
        const params = [userId];

        switch (user.role) {
            case 'admin':
                query += ' ORDER BY role, nom, prenom';
                break;
            case 'directeur':
                if (departmentId) {
                    query += " AND ((role IN ('enseignant', 'etudiant') AND id_departement = ?) OR role = 'admin') ORDER BY role, nom, prenom";
                    params.push(departmentId);
                } else {
                    query += " AND role = 'admin' ORDER BY nom, prenom";
                }
                break;
            case 'enseignant':
                if (departmentId) {
                    query += " AND ((role = 'etudiant' AND id_departement = ?) OR (role = 'directeur' AND id_departement = ?) OR role = 'admin') ORDER BY role, nom, prenom";
                    params.push(departmentId, departmentId);
                } else {
                    query += " AND role IN ('etudiant', 'admin', 'directeur') ORDER BY role, nom, prenom";
                }
                break;
            case 'etudiant':
                if (departmentId) {
                    query += " AND ((role = 'enseignant' AND id_departement = ?) OR role = 'admin') ORDER BY role, nom, prenom";
                    params.push(departmentId);
                } else {
                    query += " AND role IN ('enseignant', 'admin') ORDER BY role, nom, prenom";
                }
                break;
            default:
                query += ' ORDER BY role, nom, prenom';
                break;
        }

        const [rows] = await db.query(query, params);
        return rows;
    }
}

module.exports = User;