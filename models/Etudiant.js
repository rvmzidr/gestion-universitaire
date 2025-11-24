const db = require('../config/database');

class Etudiant {
    static async _supportsIdNiveau() {
        if (typeof Etudiant.__supportsIdNiveau !== 'undefined') {
            return Etudiant.__supportsIdNiveau;
        }

        try {
            const [rows] = await db.query(`
                SELECT COLUMN_NAME
                FROM information_schema.COLUMNS
                WHERE TABLE_SCHEMA = DATABASE()
                  AND TABLE_NAME = 'etudiants'
                  AND COLUMN_NAME = 'id_niveau'
            `);
            Etudiant.__supportsIdNiveau = rows.length > 0;
        } catch (error) {
            console.error('Impossible de déterminer la présence de la colonne id_niveau:', error);
            Etudiant.__supportsIdNiveau = false;
        }

        return Etudiant.__supportsIdNiveau;
    }

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

    static async findAllByDepartement(id_departement) {
        if (!id_departement) {
            return [];
        }

        const [rows] = await db.query(`
            SELECT e.*, g.nom as groupe_nom, s.nom as specialite_nom
            FROM etudiants e
            LEFT JOIN groupes g ON e.id_groupe = g.id
            LEFT JOIN specialites s ON e.id_specialite = s.id
            LEFT JOIN specialites sg ON g.id_specialite = sg.id
            WHERE COALESCE(s.id_departement, sg.id_departement) = ?
            ORDER BY e.nom, e.prenom
        `, [id_departement]);

        return rows;
    }

    static async findById(id) {
        const [rows] = await db.query(`
            SELECT e.*, g.nom as groupe_nom, s.nom as specialite_nom, s.id_departement 
            FROM etudiants e
            LEFT JOIN groupes g ON e.id_groupe = g.id
            LEFT JOIN specialites s ON e.id_specialite = s.id
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
            SELECT e.*, g.nom as groupe_nom, s.nom as specialite_nom 
            FROM etudiants e
            LEFT JOIN groupes g ON e.id_groupe = g.id
            LEFT JOIN specialites s ON e.id_specialite = s.id
            WHERE LOWER(TRIM(e.email)) = ?
        `, [normalized]);
        return rows[0];
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
            SELECT e.*, g.nom as groupe_nom, s.nom as specialite_nom 
            FROM etudiants e
            LEFT JOIN groupes g ON e.id_groupe = g.id
            LEFT JOIN specialites s ON e.id_specialite = s.id
            INNER JOIN utilisateurs u ON LOWER(TRIM(e.email)) = LOWER(TRIM(u.email))
            WHERE u.id = ?
            LIMIT 1
        `, [numericId]);

        return rows[0] || null;
    }

    static async create(data) {
        const { nom, prenom, email, cin, id_utilisateur } = data;
        const dateNaissance = data.date_naissance || null;
        const idGroupe = data.id_groupe || null;
        const idSpecialite = data.id_specialite || null;
        let idNiveau = data.id_niveau || null;
        const supportsIdNiveau = await Etudiant._supportsIdNiveau();

        if (!idNiveau && idGroupe) {
            const [rows] = await db.query('SELECT id_niveau FROM groupes WHERE id = ?', [idGroupe]);
            if (rows.length) {
                idNiveau = rows[0].id_niveau ?? null;
            }
        }

        if (supportsIdNiveau && idNiveau === null) {
            throw new Error('Le groupe sélectionné n\'est associé à aucun niveau.');
        }

        const columns = ['nom', 'prenom', 'email', 'cin', 'date_naissance', 'id_groupe', 'id_specialite'];
        const placeholders = ['?', '?', '?', '?', '?', '?', '?'];
        const values = [nom, prenom, email, cin, dateNaissance, idGroupe, idSpecialite];

        // Ajouter id_utilisateur si fourni
        if (id_utilisateur) {
            columns.push('id_utilisateur');
            placeholders.push('?');
            values.push(id_utilisateur);
        }

        if (supportsIdNiveau) {
            columns.push('id_niveau');
            placeholders.push('?');
            values.push(idNiveau);
        }

        try {
            const [result] = await db.query(
                `INSERT INTO etudiants (${columns.join(', ')}) VALUES (${placeholders.join(', ')})`,
                values
            );
            return result.insertId;
        } catch (error) {
            // Gérer l'absence de la colonne id_niveau
            if (error.code === 'ER_BAD_FIELD_ERROR' && error.message.includes('id_niveau')) {
                Etudiant.__supportsIdNiveau = false;
                return Etudiant.create({ ...data, id_niveau: null });
            }
            // Gérer l'absence de la colonne id_utilisateur
            if (error.code === 'ER_BAD_FIELD_ERROR' && error.message.includes('id_utilisateur')) {
                console.warn('⚠️ La colonne id_utilisateur n\'existe pas dans la table etudiants');
                return Etudiant.create({ ...data, id_utilisateur: null });
            }
            throw error;
        }
    }

    static async update(id, data) {
        const { nom, prenom, email, cin } = data;
        const dateNaissance = data.date_naissance || null;
        const idGroupe = data.id_groupe || null;
        const idSpecialite = data.id_specialite || null;
        let idNiveau = data.id_niveau || null;
        const supportsIdNiveau = await Etudiant._supportsIdNiveau();

        if (!idNiveau && idGroupe) {
            const [rows] = await db.query('SELECT id_niveau FROM groupes WHERE id = ?', [idGroupe]);
            if (rows.length) {
                idNiveau = rows[0].id_niveau ?? null;
            }
        }

        if (supportsIdNiveau && idNiveau === null) {
            throw new Error('Le groupe sélectionné n\'est associé à aucun niveau.');
        }

        const assignments = [
            { clause: 'nom = ?', value: nom },
            { clause: 'prenom = ?', value: prenom },
            { clause: 'email = ?', value: email },
            { clause: 'cin = ?', value: cin },
            { clause: 'date_naissance = ?', value: dateNaissance },
            { clause: 'id_groupe = ?', value: idGroupe },
            { clause: 'id_specialite = ?', value: idSpecialite }
        ];

        if (supportsIdNiveau) {
            assignments.push({ clause: 'id_niveau = ?', value: idNiveau });
        }

        const setFragments = assignments.map(item => item.clause);
        const values = assignments.map(item => item.value);
        values.push(id);

        try {
            await db.query(
                `UPDATE etudiants SET ${setFragments.join(', ')} WHERE id = ?`,
                values
            );
        } catch (error) {
            if (error.code === 'ER_BAD_FIELD_ERROR' && error.message.includes('id_niveau')) {
                Etudiant.__supportsIdNiveau = false;
                return Etudiant.update(id, { ...data, id_niveau: null });
            }
            throw error;
        }
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