-- Script de création de la table cours (Version SAFE)
-- À exécuter dans MySQL/PHPMyAdmin
-- Cette version vérifie l'existence avant d'ajouter la colonne

-- 1. Créer la table cours
CREATE TABLE IF NOT EXISTS cours (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titre VARCHAR(255) NOT NULL,
    type_cours ENUM('cm', 'td', 'tp', 'atelier', 'examen') DEFAULT 'cm',
    description TEXT,
    id_enseignant INT,
    id_groupe INT,
    id_salle INT,
    jour ENUM('lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche') NOT NULL,
    heure_debut TIME NOT NULL,
    heure_fin TIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_enseignant) REFERENCES enseignants(id) ON DELETE SET NULL,
    FOREIGN KEY (id_groupe) REFERENCES groupes(id) ON DELETE CASCADE,
    FOREIGN KEY (id_salle) REFERENCES salles(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Ajouter created_at à etudiants (si elle n'existe pas)
-- Exécute cette procédure qui vérifie avant d'ajouter
DELIMITER $$

CREATE PROCEDURE AddCreatedAtToEtudiants()
BEGIN
    DECLARE column_exists INT DEFAULT 0;
    
    SELECT COUNT(*) INTO column_exists 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'gestion_universitaire' 
    AND TABLE_NAME = 'etudiants' 
    AND COLUMN_NAME = 'created_at';
    
    IF column_exists = 0 THEN
        ALTER TABLE etudiants 
        ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER id_specialite;
    END IF;
END$$

DELIMITER ;

-- Exécuter la procédure
CALL AddCreatedAtToEtudiants();

-- Supprimer la procédure après utilisation
DROP PROCEDURE IF EXISTS AddCreatedAtToEtudiants;

-- 3. Créer les index pour optimiser les requêtes
-- Note: Ignorer les erreurs si les index existent déjà
CREATE INDEX idx_cours_enseignant ON cours(id_enseignant);
CREATE INDEX idx_cours_groupe ON cours(id_groupe);
CREATE INDEX idx_cours_salle ON cours(id_salle);
CREATE INDEX idx_cours_jour_heure ON cours(jour, heure_debut);
