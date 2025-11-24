const db = require('../config/database');

(async () => {
    try {
        console.log('🔄 Suppression de la table notes si elle existe...');
        await db.query('DROP TABLE IF EXISTS notes');
        
        console.log('🔄 Création de la table notes...');
        await db.query(`
            CREATE TABLE notes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                id_etudiant INT NOT NULL,
                id_cours INT NOT NULL,
                type_evaluation ENUM('ds', 'cc', 'tp', 'examen', 'projet', 'oral') NOT NULL DEFAULT 'ds',
                note DECIMAL(5,2) NOT NULL,
                coefficient DECIMAL(3,2) DEFAULT 1.00,
                date_evaluation DATE NOT NULL,
                semestre ENUM('1', '2') NOT NULL,
                annee_universitaire VARCHAR(10) NOT NULL,
                remarque TEXT,
                id_enseignant INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                CONSTRAINT fk_note_etudiant FOREIGN KEY (id_etudiant) REFERENCES etudiants(id) ON DELETE CASCADE,
                CONSTRAINT fk_note_cours FOREIGN KEY (id_cours) REFERENCES cours(id) ON DELETE CASCADE,
                CONSTRAINT fk_note_enseignant FOREIGN KEY (id_enseignant) REFERENCES enseignants(id) ON DELETE CASCADE,
                CONSTRAINT chk_note_valeur CHECK (note >= 0 AND note <= 20),
                CONSTRAINT chk_coefficient CHECK (coefficient > 0 AND coefficient <= 5)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        
        console.log('🔄 Création des index...');
        await db.query('CREATE INDEX idx_notes_etudiant ON notes(id_etudiant)');
        await db.query('CREATE INDEX idx_notes_cours ON notes(id_cours)');
        await db.query('CREATE INDEX idx_notes_enseignant ON notes(id_enseignant)');
        await db.query('CREATE INDEX idx_notes_semestre ON notes(semestre, annee_universitaire)');
        
        console.log('✅ Table notes créée avec succès !');
        process.exit(0);
    } catch (err) {
        console.error('❌ Erreur:', err.message);
        process.exit(1);
    }
})();
