USE `gestion_universitaire`;

-- Create table for emplois du temps
CREATE TABLE IF NOT EXISTS `emplois_du_temps` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `titre` VARCHAR(255) NOT NULL,
  `type_cours` ENUM('cm','td','tp','atelier','examen') NOT NULL DEFAULT 'cm',
  `description` TEXT DEFAULT NULL,
  `id_enseignant` INT DEFAULT NULL,
  `id_groupe` INT DEFAULT NULL,
  `id_salle` INT DEFAULT NULL,
  `jour` ENUM('lundi','mardi','mercredi','jeudi','vendredi','samedi','dimanche') NOT NULL,
  `heure_debut` TIME NOT NULL,
  `heure_fin` TIME NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_emplois_enseignant` (`id_enseignant`),
  INDEX `idx_emplois_groupe` (`id_groupe`),
  INDEX `idx_emplois_salle` (`id_salle`),
  INDEX `idx_emplois_jour_heure` (`jour`, `heure_debut`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE `emplois_du_temps`
  ADD CONSTRAINT `emplois_ibfk_1` FOREIGN KEY (`id_enseignant`) REFERENCES `enseignants` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `emplois_ibfk_2` FOREIGN KEY (`id_groupe`) REFERENCES `groupes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `emplois_ibfk_3` FOREIGN KEY (`id_salle`) REFERENCES `salles` (`id`) ON DELETE SET NULL;

-- Example rows (optional) - uncomment to insert
-- INSERT INTO `emplois_du_temps` (`titre`,`type_cours`,`description`,`id_enseignant`,`id_groupe`,`id_salle`,`jour`,`heure_debut`,`heure_fin`) VALUES
-- ('Architecture des Systèmes','cm','CM - Architecture',1,1,1,'lundi','08:00:00','10:00:00');
