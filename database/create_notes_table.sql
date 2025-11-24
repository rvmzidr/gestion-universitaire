-- ================================================
-- TABLE NOTES - Gestion des notes des étudiants
-- ================================================

-- Supprimer la table si elle existe
DROP TABLE IF EXISTS notes;

-- Créer la table notes
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
    
    -- Contraintes
    CONSTRAINT fk_note_etudiant FOREIGN KEY (id_etudiant) REFERENCES etudiants(id) ON DELETE CASCADE,
    CONSTRAINT fk_note_cours FOREIGN KEY (id_cours) REFERENCES cours(id) ON DELETE CASCADE,
    CONSTRAINT fk_note_enseignant FOREIGN KEY (id_enseignant) REFERENCES enseignants(id) ON DELETE CASCADE,
    CONSTRAINT chk_note_valeur CHECK (note >= 0 AND note <= 20),
    CONSTRAINT chk_coefficient CHECK (coefficient > 0 AND coefficient <= 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Index pour améliorer les performances
CREATE INDEX idx_notes_etudiant ON notes(id_etudiant);
CREATE INDEX idx_notes_cours ON notes(id_cours);
CREATE INDEX idx_notes_enseignant ON notes(id_enseignant);
CREATE INDEX idx_notes_semestre ON notes(semestre, annee_universitaire);
CREATE INDEX idx_notes_type ON notes(type_evaluation);
CREATE INDEX idx_notes_date ON notes(date_evaluation);

-- Index composite pour les recherches fréquentes
CREATE INDEX idx_notes_etudiant_cours ON notes(id_etudiant, id_cours);
CREATE INDEX idx_notes_cours_semestre ON notes(id_cours, semestre, annee_universitaire);

-- ================================================
-- DONNÉES DE TEST (optionnel)
-- ================================================

-- Insertion de quelques notes d'exemple
-- Note: Adapter les IDs selon votre base de données

-- INSERT INTO notes (id_etudiant, id_cours, type_evaluation, note, coefficient, date_evaluation, semestre, annee_universitaire, remarque, id_enseignant) VALUES
-- (1, 1, 'ds', 15.50, 1.00, '2024-10-15', '1', '2024-2025', 'Bon travail', 1),
-- (1, 1, 'cc', 14.00, 2.00, '2024-11-20', '1', '2024-2025', 'Contrôle continu', 1),
-- (1, 1, 'examen', 16.00, 3.00, '2025-01-15', '1', '2024-2025', 'Examen final', 1),
-- (2, 1, 'ds', 12.00, 1.00, '2024-10-15', '1', '2024-2025', NULL, 1),
-- (2, 1, 'cc', 13.50, 2.00, '2024-11-20', '1', '2024-2025', NULL, 1);

-- ================================================
-- Note: Les vues, procédures et triggers sont optionnels
-- Vous pouvez les créer manuellement après si nécessaire
-- ================================================

-- ================================================
-- COMMENTAIRES
-- ================================================

-- Types d'évaluation:
-- - ds: Devoir Surveillé
-- - cc: Contrôle Continu
-- - tp: Travaux Pratiques
-- - examen: Examen final
-- - projet: Projet
-- - oral: Présentation orale

-- Coefficient: Importance de l'évaluation (généralement entre 1 et 3)
-- Note: Entre 0 et 20
-- Semestre: '1' ou '2'
-- Année universitaire: Format '2024-2025'
