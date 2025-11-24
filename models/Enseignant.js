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

    static async findByDepartement(id_departement) {
        if (!id_departement) {
            return [];
        }
        const [rows] = await db.query(`
            SELECT e.*, d.nom as departement_nom 
            FROM enseignants e
            LEFT JOIN departements d ON e.id_departement = d.id
            WHERE e.id_departement = ?
            ORDER BY e.nom, e.prenom
        `, [id_departement]);
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

    static async findByEmail(email) {
        if (!email) {
            return null;
        }

        const normalized = email.trim().toLowerCase();

        const [rows] = await db.query(`
            SELECT e.*, d.nom as departement_nom
            FROM enseignants e
            LEFT JOIN departements d ON e.id_departement = d.id
            WHERE LOWER(TRIM(e.email)) = ?
            LIMIT 1
        `, [normalized]);

        return rows[0] || null;
    }

    static async findByUserId(userId) {
        if (!userId) {
            return null;
        }

        const numericId = Number.parseInt(userId, 10);
        if (Number.isNaN(numericId)) {
            return null;
        }

        const [rows] = await db.query(`
            SELECT e.*, d.nom AS departement_nom
            FROM enseignants e
            INNER JOIN utilisateurs u ON LOWER(TRIM(e.email)) = LOWER(TRIM(u.email))
            LEFT JOIN departements d ON e.id_departement = d.id
            WHERE u.id = ?
            LIMIT 1
        `, [numericId]);

        return rows[0] || null;
    }

    static async create(data) {
        const { nom, prenom, email, telephone, id_departement, id_utilisateur } = data;
        
        // Construire la requête avec seulement les colonnes qui existent
        let columns = 'nom, prenom, email, telephone, id_departement';
        let placeholders = '?, ?, ?, ?, ?';
        let values = [nom, prenom, email, telephone, id_departement];
        
        // Ajouter id_utilisateur si fourni
        if (id_utilisateur) {
            columns += ', id_utilisateur';
            placeholders += ', ?';
            values.push(id_utilisateur);
        }
        
        try {
            const [result] = await db.query(
                `INSERT INTO enseignants (${columns}) VALUES (${placeholders})`,
                values
            );
            return result.insertId;
        } catch (error) {
            // Si l'erreur est liée à une colonne manquante, réessayer sans elle
            if (error.code === 'ER_BAD_FIELD_ERROR') {
                // Essayer sans id_utilisateur et specialite
                const [result] = await db.query(
                    'INSERT INTO enseignants (nom, prenom, email, telephone, id_departement) VALUES (?, ?, ?, ?, ?)',
                    [nom, prenom, email, telephone, id_departement]
                );
                console.warn('⚠️ Colonne manquante détectée, insertion sans id_utilisateur/specialite');
                return result.insertId;
            }
            throw error;
        }
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