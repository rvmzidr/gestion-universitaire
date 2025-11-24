-- Script pour initialiser la base de données 'classrom' et la table 'cours'
-- Exécutez depuis MySQL shell ou MySQL Workbench :
-- > SOURCE path/to/db_init.sql;  (ou copiez/collez les commandes)

CREATE DATABASE IF NOT EXISTS classrom CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE classrom;

CREATE TABLE IF NOT EXISTS cours (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nom_cours VARCHAR(255) NOT NULL,
  enseignant VARCHAR(255) NOT NULL,
  salle VARCHAR(100) NOT NULL,
  jour VARCHAR(50) NOT NULL,
  heure_debut TIME NOT NULL,
  heure_fin TIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table des étudiants (simple)
CREATE TABLE IF NOT EXISTS students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(255) NOT NULL,
  email VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table d'inscription liant étudiants et cours (many-to-many)
CREATE TABLE IF NOT EXISTS inscriptions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  cours_id INT NOT NULL,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (cours_id) REFERENCES cours(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Exemple de données
INSERT INTO students (nom, email) VALUES
('Ali Student','ali@example.com'),
('Sara Etudiant','sara@example.com')
ON DUPLICATE KEY UPDATE nom=VALUES(nom);

INSERT INTO cours (nom_cours, enseignant, salle, jour, heure_debut, heure_fin) VALUES
('Mathématiques','M. Ben','A101','Lundi','08:00:00','10:00:00'),
('Physique','Mme. Nour','B202','Mardi','10:00:00','12:00:00'),
('Programmation','M. Sami','C303','Mercredi','14:00:00','16:00:00')
ON DUPLICATE KEY UPDATE nom_cours=VALUES(nom_cours);

-- Lier Ali au cours de Mathématiques (id 1) et Programmation (id 3)
INSERT INTO inscriptions (student_id, cours_id) VALUES
(1,1),(1,3),(2,2)
ON DUPLICATE KEY UPDATE student_id=VALUES(student_id);
