-- Création de la table absences pour gérer les absences des étudiants

CREATE TABLE IF NOT EXISTS absences (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_etudiant INT NOT NULL,
    id_cours INT NOT NULL,
    date_absence DATE NOT NULL,
    statut ENUM('absent', 'present', 'retard', 'justifie') DEFAULT 'absent',
    motif TEXT,
    justificatif VARCHAR(255), -- Chemin vers le fichier justificatif
    remarque TEXT,
    id_enseignant INT, -- Enseignant qui a enregistré l'absence
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Clés étrangères
    FOREIGN KEY (id_etudiant) REFERENCES etudiants(id) ON DELETE CASCADE,
    FOREIGN KEY (id_cours) REFERENCES cours(id) ON DELETE CASCADE,
    FOREIGN KEY (id_enseignant) REFERENCES enseignants(id) ON DELETE SET NULL,
    
    -- Index pour optimiser les recherches
    INDEX idx_etudiant (id_etudiant),
    INDEX idx_cours (id_cours),
    INDEX idx_date (date_absence),
    INDEX idx_statut (statut),
    
    -- Éviter les doublons (un étudiant ne peut avoir qu'une seule entrée par cours et par date)
    UNIQUE KEY unique_absence (id_etudiant, id_cours, date_absence)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
  COMMENT = 'Table pour gérer les absences, présences et retards des étudiants aux cours';
