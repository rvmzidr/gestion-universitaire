-- Ajouter la colonne id_departement à la table users
-- Pour lier les directeurs à leurs départements

-- 1. Ajouter la colonne (commentez si elle existe déjà)
ALTER TABLE users 
ADD COLUMN id_departement INT DEFAULT NULL AFTER role;

-- 2. Ajouter la clé étrangère
ALTER TABLE users 
ADD CONSTRAINT fk_users_departement 
FOREIGN KEY (id_departement) REFERENCES departements(id) ON DELETE SET NULL;

-- 3. Créer un index pour améliorer les performances
CREATE INDEX idx_users_departement ON users(id_departement);

-- 4. Exemple : Assigner le premier département au directeur existant
-- Décommentez et ajustez selon vos besoins
-- UPDATE users 
-- SET id_departement = (SELECT id FROM departements LIMIT 1)
-- WHERE role = 'directeur';
