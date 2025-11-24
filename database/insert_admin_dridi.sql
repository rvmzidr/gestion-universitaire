-- ================================================================
-- SCRIPT D'INSERTION D'UN NOUVEL ADMINISTRATEUR
-- Login: dridi
-- Mot de passe: 12332100
-- ================================================================

-- Insérer le nouvel administrateur
-- Hash bcrypt pour le mot de passe "12332100"
INSERT INTO utilisateurs (nom, prenom, email, login, mdp_hash, role, id_departement, actif) 
VALUES (
    'Dridi',
    'Ramzi',
    'ramzi.dridi@iset.tn',
    'dridi',
    '$2b$10$oqPBowmX095/RjmnCLoyGuRlmJOJpdGhHDO/o11wnSXbWsghIBg8m',
    'admin',
    NULL,
    1
);

-- ================================================================
-- COMPTE CRÉÉ:
-- Login: dridi
-- Mot de passe: 12332100
-- Rôle: admin (accès complet à tout le système)
-- ================================================================
