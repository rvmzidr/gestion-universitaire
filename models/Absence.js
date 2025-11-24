const db = require('../config/database');

class Absence {
    // Créer une nouvelle absence
    static async create(absenceData) {
        const { id_etudiant, id_cours, date_absence, statut, motif, justificatif, remarque, id_enseignant } = absenceData;
        
        const [result] = await db.query(`
            INSERT INTO absences 
            (id_etudiant, id_cours, date_absence, statut, motif, justificatif, remarque, id_enseignant)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [id_etudiant, id_cours, date_absence, statut || 'absent', motif, justificatif, remarque, id_enseignant]);
        
        return result.insertId;
    }

    // Récupérer toutes les absences (avec filtres optionnels)
    static async findAll(filters = {}) {
        let query = `
            SELECT 
                a.*,
                e.nom as etudiant_nom,
                e.prenom as etudiant_prenom,
                e.cin as etudiant_cin,
                c.titre as cours_titre,
                c.jour as cours_jour,
                c.heure_debut as cours_heure_debut,
                c.heure_fin as cours_heure_fin,
                ens.nom as enseignant_nom,
                ens.prenom as enseignant_prenom,
                g.nom as groupe_nom,
                s.nom as specialite_nom
            FROM absences a
            INNER JOIN etudiants e ON a.id_etudiant = e.id
            INNER JOIN cours c ON a.id_cours = c.id
            LEFT JOIN enseignants ens ON a.id_enseignant = ens.id
            LEFT JOIN groupes g ON e.id_groupe = g.id
            LEFT JOIN specialites s ON e.id_specialite = s.id
            WHERE 1=1
        `;
        
        const params = [];
        
        if (filters.id_etudiant) {
            query += ' AND a.id_etudiant = ?';
            params.push(filters.id_etudiant);
        }
        
        if (filters.id_cours) {
            query += ' AND a.id_cours = ?';
            params.push(filters.id_cours);
        }
        
        if (filters.id_enseignant) {
            query += ' AND c.id_enseignant = ?';
            params.push(filters.id_enseignant);
        }
        
        if (filters.id_departement) {
            query += ' AND s.id_departement = ?';
            params.push(filters.id_departement);
        }
        
        if (filters.id_groupe) {
            query += ' AND e.id_groupe = ?';
            params.push(filters.id_groupe);
        }
        
        if (filters.statut) {
            query += ' AND a.statut = ?';
            params.push(filters.statut);
        }
        
        if (filters.date_debut) {
            query += ' AND a.date_absence >= ?';
            params.push(filters.date_debut);
        }
        
        if (filters.date_fin) {
            query += ' AND a.date_absence <= ?';
            params.push(filters.date_fin);
        }
        
        query += ' ORDER BY a.date_absence DESC, e.nom, e.prenom';
        
        const [rows] = await db.query(query, params);
        return rows;
    }

    // Récupérer une absence par ID
    static async findById(id) {
        const [rows] = await db.query(`
            SELECT 
                a.*,
                e.nom as etudiant_nom,
                e.prenom as etudiant_prenom,
                e.cin as etudiant_cin,
                e.email as etudiant_email,
                c.titre as cours_titre,
                c.jour as cours_jour,
                c.heure_debut as cours_heure_debut,
                c.heure_fin as cours_heure_fin,
                ens.nom as enseignant_nom,
                ens.prenom as enseignant_prenom
            FROM absences a
            INNER JOIN etudiants e ON a.id_etudiant = e.id
            INNER JOIN cours c ON a.id_cours = c.id
            LEFT JOIN enseignants ens ON a.id_enseignant = ens.id
            WHERE a.id = ?
        `, [id]);
        
        return rows[0];
    }

    // Mettre à jour une absence
    static async update(id, absenceData) {
        const { statut, motif, justificatif, remarque } = absenceData;
        
        const [result] = await db.query(`
            UPDATE absences 
            SET statut = ?, motif = ?, justificatif = ?, remarque = ?
            WHERE id = ?
        `, [statut, motif, justificatif, remarque, id]);
        
        return result.affectedRows;
    }

    // Supprimer une absence
    static async delete(id) {
        const [result] = await db.query('DELETE FROM absences WHERE id = ?', [id]);
        return result.affectedRows;
    }

    // Compter les absences d'un étudiant
    static async countByEtudiant(id_etudiant, statut = 'absent') {
        const [rows] = await db.query(`
            SELECT COUNT(*) as total
            FROM absences
            WHERE id_etudiant = ? AND statut = ?
        `, [id_etudiant, statut]);
        
        return rows[0].total;
    }

    // Statistiques d'absences par cours
    static async getStatsByCours(id_cours) {
        const [rows] = await db.query(`
            SELECT 
                statut,
                COUNT(*) as total
            FROM absences
            WHERE id_cours = ?
            GROUP BY statut
        `, [id_cours]);
        
        return rows;
    }

    // Vérifier si une absence existe déjà
    static async exists(id_etudiant, id_cours, date_absence) {
        const [rows] = await db.query(`
            SELECT id FROM absences
            WHERE id_etudiant = ? AND id_cours = ? AND date_absence = ?
        `, [id_etudiant, id_cours, date_absence]);
        
        return rows.length > 0 ? rows[0] : null;
    }

    // Enregistrer plusieurs absences en une fois (pour une séance de cours)
    static async createBulk(absencesData) {
        if (!absencesData || absencesData.length === 0) {
            return 0;
        }

        const values = absencesData.map(a => [
            a.id_etudiant,
            a.id_cours,
            a.date_absence,
            a.statut || 'absent',
            a.motif || null,
            a.justificatif || null,
            a.remarque || null,
            a.id_enseignant || null
        ]);

        const [result] = await db.query(`
            INSERT INTO absences 
            (id_etudiant, id_cours, date_absence, statut, motif, justificatif, remarque, id_enseignant)
            VALUES ?
            ON DUPLICATE KEY UPDATE
                statut = VALUES(statut),
                motif = VALUES(motif),
                justificatif = VALUES(justificatif),
                remarque = VALUES(remarque),
                id_enseignant = VALUES(id_enseignant)
        `, [values]);

        return result.affectedRows;
    }
}

module.exports = Absence;
