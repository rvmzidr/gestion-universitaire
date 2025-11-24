-- ================================================================
-- SCRIPT DE MISE À JOUR DES MOTS DE PASSE
-- Mot de passe: 12332100
-- Hash: $2b$10$oqPBowmX095/RjmnCLoyGuRlmJOJpdGhHDO/o11wnSXbWsghIBg8m
-- ================================================================

-- Mise à jour pour l'admin dridi
UPDATE utilisateurs 
SET mdp_hash = '$2b$10$oqPBowmX095/RjmnCLoyGuRlmJOJpdGhHDO/o11wnSXbWsghIBg8m' 
WHERE login = 'dridi';

-- Mise à jour pour les enseignants
UPDATE utilisateurs 
SET mdp_hash = '$2b$10$oqPBowmX095/RjmnCLoyGuRlmJOJpdGhHDO/o11wnSXbWsghIBg8m' 
WHERE login IN ('sbouaziz', 'kgharbi', 'amezghani', 'hjebali', 'nsassi', 'rchakroun', 'lmansouri', 'fbensalah');

-- Mise à jour pour les étudiants
UPDATE utilisateurs 
SET mdp_hash = '$2b$10$oqPBowmX095/RjmnCLoyGuRlmJOJpdGhHDO/o11wnSXbWsghIBg8m' 
WHERE login IN ('snasri', 'oayari', 'mzaidi', 'wbenamor', 'rtounsi', 'akhemiri', 'nlazhar', 'bferchichi', 'hghanmi', 'wsahli', 'mtriki', 'sbouslama', 'fkraiem', 'anasr');

-- Vérification des mises à jour
SELECT login, role, 
       CASE WHEN mdp_hash = '$2b$10$oqPBowmX095/RjmnCLoyGuRlmJOJpdGhHDO/o11wnSXbWsghIBg8m' 
            THEN 'OK' 
            ELSE 'NON MODIFIÉ' 
       END as statut
FROM utilisateurs 
WHERE login IN ('dridi', 'sbouaziz', 'kgharbi', 'amezghani', 'hjebali', 'nsassi', 'rchakroun', 'lmansouri', 'fbensalah', 'snasri', 'oayari', 'mzaidi', 'wbenamor', 'rtounsi', 'akhemiri', 'nlazhar', 'bferchichi', 'hghanmi', 'wsahli', 'mtriki', 'sbouslama', 'fkraiem', 'anasr')
ORDER BY role, login;
