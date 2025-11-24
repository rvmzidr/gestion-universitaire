const db = require('../config/database');

class Note {
    // Créer une nouvelle note
    static async create(noteData) {
        const query = `
            INSERT INTO notes (
                id_etudiant, id_cours, type_evaluation, note, coefficient, 
                date_evaluation, semestre, annee_universitaire, remarque, id_enseignant
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const [result] = await db.query(query, [
            noteData.id_etudiant,
            noteData.id_cours,
            noteData.type_evaluation,
            noteData.note,
            noteData.coefficient,
            noteData.date_evaluation,
            noteData.semestre,
            noteData.annee_universitaire,
            noteData.remarque || null,
            noteData.id_enseignant
        ]);
        
        return result.insertId;
    }

    // Récupérer toutes les notes avec filtres
    static async findAll(filters = {}) {
        let query = `
            SELECT 
                n.*,
                e.nom AS etudiant_nom,
                e.prenom AS etudiant_prenom,
                e.cin AS etudiant_cin,
                c.titre AS cours_titre,
                ens.nom AS enseignant_nom,
                ens.prenom AS enseignant_prenom,
                g.nom AS groupe_nom,
                s.nom AS specialite_nom,
                d.nom AS departement_nom
            FROM notes n
            JOIN etudiants e ON n.id_etudiant = e.id
            JOIN cours c ON n.id_cours = c.id
            JOIN enseignants ens ON n.id_enseignant = ens.id
            LEFT JOIN groupes g ON e.id_groupe = g.id
            LEFT JOIN specialites s ON g.id_specialite = s.id
            LEFT JOIN departements d ON s.id_departement = d.id
            WHERE 1=1
        `;
        
        const params = [];
        
        if (filters.id_etudiant) {
            query += ' AND n.id_etudiant = ?';
            params.push(filters.id_etudiant);
        }
        
        if (filters.id_cours) {
            query += ' AND n.id_cours = ?';
            params.push(filters.id_cours);
        }
        
        if (filters.id_enseignant) {
            query += ' AND n.id_enseignant = ?';
            params.push(filters.id_enseignant);
        }
        
        if (filters.id_departement) {
            query += ' AND d.id = ?';
            params.push(filters.id_departement);
        }
        
        if (filters.semestre) {
            query += ' AND n.semestre = ?';
            params.push(filters.semestre);
        }
        
        if (filters.annee_universitaire) {
            query += ' AND n.annee_universitaire = ?';
            params.push(filters.annee_universitaire);
        }
        
        if (filters.type_evaluation) {
            query += ' AND n.type_evaluation = ?';
            params.push(filters.type_evaluation);
        }
        
        query += ' ORDER BY n.date_evaluation DESC, n.created_at DESC';
        
        const [rows] = await db.query(query, params);
        return rows;
    }

    // Trouver une note par ID
    static async findById(id) {
        const query = `
            SELECT 
                n.*,
                e.nom AS etudiant_nom,
                e.prenom AS etudiant_prenom,
                e.cin AS etudiant_cin,
                c.titre AS cours_titre,
                ens.nom AS enseignant_nom,
                ens.prenom AS enseignant_prenom
            FROM notes n
            JOIN etudiants e ON n.id_etudiant = e.id
            JOIN cours c ON n.id_cours = c.id
            JOIN enseignants ens ON n.id_enseignant = ens.id
            WHERE n.id = ?
        `;
        
        const [rows] = await db.query(query, [id]);
        return rows[0];
    }

    // Mettre à jour une note
    static async update(id, noteData) {
        const query = `
            UPDATE notes SET
                note = ?,
                coefficient = ?,
                type_evaluation = ?,
                date_evaluation = ?,
                remarque = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;
        
        const [result] = await db.query(query, [
            noteData.note,
            noteData.coefficient,
            noteData.type_evaluation,
            noteData.date_evaluation,
            noteData.remarque || null,
            id
        ]);
        
        return result.affectedRows > 0;
    }

    // Supprimer une note
    static async delete(id) {
        const query = 'DELETE FROM notes WHERE id = ?';
        const [result] = await db.query(query, [id]);
        return result.affectedRows > 0;
    }

    // Calculer la moyenne d'un étudiant pour un cours
    static async calculateMoyenne(idEtudiant, idCours, semestre, anneeUniversitaire) {
        const query = `
            SELECT 
                SUM(note * coefficient) / SUM(coefficient) AS moyenne,
                SUM(coefficient) AS total_coefficient,
                COUNT(*) AS nombre_notes
            FROM notes
            WHERE id_etudiant = ?
                AND id_cours = ?
                AND semestre = ?
                AND annee_universitaire = ?
        `;
        
        const [rows] = await db.query(query, [idEtudiant, idCours, semestre, anneeUniversitaire]);
        return rows[0];
    }

    // Obtenir le bulletin d'un étudiant
    static async getBulletin(idEtudiant, semestre, anneeUniversitaire) {
        // Récupérer toutes les notes de l'étudiant
        const notesQuery = `
            SELECT 
                n.*,
                c.id AS cours_id,
                c.titre AS cours_titre
            FROM notes n
            JOIN cours c ON n.id_cours = c.id
            WHERE n.id_etudiant = ?
                AND n.semestre = ?
                AND n.annee_universitaire = ?
            ORDER BY c.titre, n.date_evaluation
        `;
        
        const [notes] = await db.query(notesQuery, [idEtudiant, semestre, anneeUniversitaire]);
        
        // Regrouper les notes par cours
        const coursMap = new Map();
        
        notes.forEach(note => {
            if (!coursMap.has(note.cours_id)) {
                coursMap.set(note.cours_id, {
                    cours_id: note.cours_id,
                    cours_titre: note.cours_titre,
                    notes: [],
                    somme_ponderee: 0,
                    somme_coefficients: 0
                });
            }
            
            const cours = coursMap.get(note.cours_id);
            cours.notes.push({
                type: note.type_evaluation,
                note: note.note,
                coefficient: note.coefficient,
                date: note.date_evaluation
            });
            cours.somme_ponderee += parseFloat(note.note) * parseFloat(note.coefficient);
            cours.somme_coefficients += parseFloat(note.coefficient);
        });
        
        // Calculer les moyennes et formater
        const bulletin = Array.from(coursMap.values()).map(cours => {
            const moyenne = cours.somme_coefficients > 0 
                ? (cours.somme_ponderee / cours.somme_coefficients).toFixed(2)
                : 0;
            
            const details_notes = cours.notes
                .map(n => `${n.type}:${n.note}(${n.coefficient})`)
                .join(' | ');
            
            return {
                cours_id: cours.cours_id,
                cours_titre: cours.cours_titre,
                moyenne: moyenne,
                nombre_evaluations: cours.notes.length,
                details_notes: details_notes
            };
        });
        
        // Trier par titre de cours
        bulletin.sort((a, b) => a.cours_titre.localeCompare(b.cours_titre));
        
        return bulletin;
    }

    // Obtenir les statistiques d'un cours
    static async getStatistiquesCours(idCours, semestre, anneeUniversitaire) {
        const query = `
            SELECT 
                COUNT(DISTINCT n.id_etudiant) AS nombre_etudiants,
                AVG(n.note) AS moyenne_generale,
                MIN(n.note) AS note_min,
                MAX(n.note) AS note_max,
                STDDEV(n.note) AS ecart_type,
                COUNT(n.id) AS total_evaluations
            FROM notes n
            WHERE n.id_cours = ?
                AND n.semestre = ?
                AND n.annee_universitaire = ?
        `;
        
        const [rows] = await db.query(query, [idCours, semestre, anneeUniversitaire]);
        return rows[0];
    }

    // Obtenir le classement des étudiants pour un cours
    static async getClassement(idCours, semestre, anneeUniversitaire) {
        const query = `
            SELECT 
                e.id,
                e.nom,
                e.prenom,
                e.cin,
                SUM(n.note * n.coefficient) / SUM(n.coefficient) AS moyenne,
                COUNT(n.id) AS nombre_notes
            FROM notes n
            JOIN etudiants e ON n.id_etudiant = e.id
            WHERE n.id_cours = ?
                AND n.semestre = ?
                AND n.annee_universitaire = ?
            GROUP BY e.id, e.nom, e.prenom, e.cin
            ORDER BY moyenne DESC
        `;
        
        const [rows] = await db.query(query, [idCours, semestre, anneeUniversitaire]);
        
        // Ajouter le rang
        return rows.map((row, index) => ({
            ...row,
            rang: index + 1
        }));
    }

    // Obtenir les cours d'un enseignant
    static async getCoursEnseignant(idEnseignant) {
        const query = `
            SELECT DISTINCT c.*
            FROM cours c
            WHERE c.id_enseignant = ?
            ORDER BY c.titre
        `;
        
        const [rows] = await db.query(query, [idEnseignant]);
        return rows;
    }

    // Obtenir les étudiants d'un cours
    static async getEtudiantsCours(idCours) {
        const query = `
            SELECT DISTINCT e.*
            FROM etudiants e
            JOIN groupes g ON e.id_groupe = g.id
            JOIN cours c ON c.id_groupe = g.id
            WHERE c.id = ?
            ORDER BY e.nom, e.prenom
        `;
        
        const [rows] = await db.query(query, [idCours]);
        return rows;
    }

    // Vérifier si une note existe déjà
    static async exists(idEtudiant, idCours, typeEvaluation, semestre, anneeUniversitaire) {
        const query = `
            SELECT COUNT(*) as count
            FROM notes
            WHERE id_etudiant = ?
                AND id_cours = ?
                AND type_evaluation = ?
                AND semestre = ?
                AND annee_universitaire = ?
        `;
        
        const [rows] = await db.query(query, [
            idEtudiant, idCours, typeEvaluation, semestre, anneeUniversitaire
        ]);
        
        return rows[0].count > 0;
    }

    // Obtenir les moyennes par département
    static async getMoyennesDepartement(idDepartement, semestre, anneeUniversitaire) {
        const query = `
            SELECT 
                c.id AS cours_id,
                c.titre AS cours_titre,
                COUNT(DISTINCT n.id_etudiant) AS nombre_etudiants,
                AVG(n.note) AS moyenne_generale,
                MIN(n.note) AS note_min,
                MAX(n.note) AS note_max
            FROM notes n
            JOIN cours c ON n.id_cours = c.id
            JOIN etudiants e ON n.id_etudiant = e.id
            JOIN groupes g ON e.id_groupe = g.id
            JOIN specialites s ON g.id_specialite = s.id
            WHERE s.id_departement = ?
                AND n.semestre = ?
                AND n.annee_universitaire = ?
            GROUP BY c.id, c.titre
            ORDER BY c.titre
        `;
        
        const [rows] = await db.query(query, [idDepartement, semestre, anneeUniversitaire]);
        return rows;
    }
}

module.exports = Note;
