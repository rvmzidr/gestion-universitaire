-- ================================================================
-- SCRIPT D'INSERTION DE NOUVEAUX UTILISATEURS ET DONNÉES
-- Mot de passe pour tous : 12332100
-- Hash bcrypt: $2b$10$YqVZ8vZ3xGxJ5nZ5nZ5nZuO5nZ5nZ5nZ5nZ5nZ5nZ5nZ5nZ5nZ5nZ
-- ================================================================

-- ================================================================
-- 1. NOUVEAUX ENSEIGNANTS
-- ================================================================

-- Insérer les nouveaux enseignants dans la table enseignants
INSERT INTO enseignants (nom, prenom, email, telephone, id_departement) VALUES
('Bouaziz', 'Sarra', 'sarra.bouaziz@iset.tn', '98123456', 1),
('Gharbi', 'Karim', 'karim.gharbi@iset.tn', '95234567', 1),
('Mezghani', 'Amira', 'amira.mezghani@iset.tn', '92345678', 2),
('Jebali', 'Hichem', 'hichem.jebali@iset.tn', '97456789', 2),
('Sassi', 'Nadia', 'nadia.sassi@iset.tn', '93567890', 3),
('Chakroun', 'Riadh', 'riadh.chakroun@iset.tn', '96678901', 3),
('Mansouri', 'Leila', 'leila.mansouri@iset.tn', '94789012', 11),
('Ben Salah', 'Fathi', 'fathi.bensalah@iset.tn', '99890123', 11);

-- Créer les comptes utilisateurs pour les enseignants (mot de passe: 12332100)
INSERT INTO utilisateurs (nom, prenom, email, login, mdp_hash, role, id_departement, actif) VALUES
('Bouaziz', 'Sarra', 'sarra.bouaziz@iset.tn', 'sbouaziz', '$2b$10$oqPBowmX095/RjmnCLoyGuRlmJOJpdGhHDO/o11wnSXbWsghIBg8m', 'enseignant', 1, 1),
('Gharbi', 'Karim', 'karim.gharbi@iset.tn', 'kgharbi', '$2b$10$oqPBowmX095/RjmnCLoyGuRlmJOJpdGhHDO/o11wnSXbWsghIBg8m', 'enseignant', 1, 1),
('Mezghani', 'Amira', 'amira.mezghani@iset.tn', 'amezghani', '$2b$10$oqPBowmX095/RjmnCLoyGuRlmJOJpdGhHDO/o11wnSXbWsghIBg8m', 'enseignant', 2, 1),
('Jebali', 'Hichem', 'hichem.jebali@iset.tn', 'hjebali', '$2b$10$oqPBowmX095/RjmnCLoyGuRlmJOJpdGhHDO/o11wnSXbWsghIBg8m', 'enseignant', 2, 1),
('Sassi', 'Nadia', 'nadia.sassi@iset.tn', 'nsassi', '$2b$10$oqPBowmX095/RjmnCLoyGuRlmJOJpdGhHDO/o11wnSXbWsghIBg8m', 'enseignant', 3, 1),
('Chakroun', 'Riadh', 'riadh.chakroun@iset.tn', 'rchakroun', '$2b$10$oqPBowmX095/RjmnCLoyGuRlmJOJpdGhHDO/o11wnSXbWsghIBg8m', 'enseignant', 3, 1),
('Mansouri', 'Leila', 'leila.mansouri@iset.tn', 'lmansouri', '$2b$10$oqPBowmX095/RjmnCLoyGuRlmJOJpdGhHDO/o11wnSXbWsghIBg8m', 'enseignant', 11, 1),
('Ben Salah', 'Fathi', 'fathi.bensalah@iset.tn', 'fbensalah', '$2b$10$oqPBowmX095/RjmnCLoyGuRlmJOJpdGhHDO/o11wnSXbWsghIBg8m', 'enseignant', 11, 1);

-- Lier les comptes utilisateurs aux enseignants
UPDATE enseignants SET id_utilisateur = (SELECT id FROM utilisateurs WHERE email = 'sarra.bouaziz@iset.tn') WHERE email = 'sarra.bouaziz@iset.tn';
UPDATE enseignants SET id_utilisateur = (SELECT id FROM utilisateurs WHERE email = 'karim.gharbi@iset.tn') WHERE email = 'karim.gharbi@iset.tn';
UPDATE enseignants SET id_utilisateur = (SELECT id FROM utilisateurs WHERE email = 'amira.mezghani@iset.tn') WHERE email = 'amira.mezghani@iset.tn';
UPDATE enseignants SET id_utilisateur = (SELECT id FROM utilisateurs WHERE email = 'hichem.jebali@iset.tn') WHERE email = 'hichem.jebali@iset.tn';
UPDATE enseignants SET id_utilisateur = (SELECT id FROM utilisateurs WHERE email = 'nadia.sassi@iset.tn') WHERE email = 'nadia.sassi@iset.tn';
UPDATE enseignants SET id_utilisateur = (SELECT id FROM utilisateurs WHERE email = 'riadh.chakroun@iset.tn') WHERE email = 'riadh.chakroun@iset.tn';
UPDATE enseignants SET id_utilisateur = (SELECT id FROM utilisateurs WHERE email = 'leila.mansouri@iset.tn') WHERE email = 'leila.mansouri@iset.tn';
UPDATE enseignants SET id_utilisateur = (SELECT id FROM utilisateurs WHERE email = 'fathi.bensalah@iset.tn') WHERE email = 'fathi.bensalah@iset.tn';


-- ================================================================
-- 2. NOUVEAUX ÉTUDIANTS
-- ================================================================

-- Insérer les nouveaux étudiants dans la table etudiants
INSERT INTO etudiants (nom, prenom, email, cin, date_naissance, id_groupe, id_specialite) VALUES
-- DSI1-A
('Nasri', 'Salma', 'salma.nasri@etudiant.tn', '11223344', '2004-03-15', 46, 1),
('Ayari', 'Omar', 'omar.ayari@etudiant.tn', '22334455', '2004-07-22', 46, 1),
('Zaidi', 'Meryem', 'meryem.zaidi@etudiant.tn', '33445566', '2004-01-10', 46, 1),

-- DSI2-G1
('Ben Amor', 'Wassim', 'wassim.benamor@etudiant.tn', '44556677', '2003-09-05', 3, 1),
('Tounsi', 'Rim', 'rim.tounsi@etudiant.tn', '55667788', '2003-11-18', 3, 1),
('Khemiri', 'Amine', 'amine.khemiri@etudiant.tn', '66778899', '2003-04-25', 3, 1),

-- DSI3-G1
('Lazhar', 'Nour', 'nour.lazhar@etudiant.tn', '77889900', '2002-06-30', 1, 1),
('Ferchichi', 'Bilel', 'bilel.ferchichi@etudiant.tn', '88990011', '2002-12-12', 1, 1),

-- ASP2-A (Génie Électrique)
('Ghanmi', 'Houssem', 'houssem.ghanmi@etudiant.tn', '99001122', '2003-02-20', 29, 8),
('Sahli', 'Wiem', 'wiem.sahli@etudiant.tn', '00112233', '2003-08-08', 29, 8),

-- AI2-A (Génie Électrique - Automatisme Industriel)
('Triki', 'Moez', 'moez.triki@etudiant.tn', '11224455', '2003-05-14', 32, 3),
('Bouslama', 'Sonia', 'sonia.bouslama@etudiant.tn', '22335566', '2003-10-29', 32, 3),

-- BAT2-A (Génie Civil - Bâtiment)
('Kraiem', 'Fares', 'fares.kraiem@etudiant.tn', '33446677', '2003-03-07', 20, 11),
('Nasr', 'Amina', 'amina.nasr@etudiant.tn', '44557788', '2003-07-16', 20, 11);

-- Créer les comptes utilisateurs pour les étudiants (mot de passe: 12332100)
INSERT INTO utilisateurs (nom, prenom, email, login, mdp_hash, role, id_departement, actif) VALUES
-- DSI1-A
('Nasri', 'Salma', 'salma.nasri@etudiant.tn', 'snasri', '$2b$10$oqPBowmX095/RjmnCLoyGuRlmJOJpdGhHDO/o11wnSXbWsghIBg8m', 'etudiant', 1, 1),
('Ayari', 'Omar', 'omar.ayari@etudiant.tn', 'oayari', '$2b$10$oqPBowmX095/RjmnCLoyGuRlmJOJpdGhHDO/o11wnSXbWsghIBg8m', 'etudiant', 1, 1),
('Zaidi', 'Meryem', 'meryem.zaidi@etudiant.tn', 'mzaidi', '$2b$10$oqPBowmX095/RjmnCLoyGuRlmJOJpdGhHDO/o11wnSXbWsghIBg8m', 'etudiant', 1, 1),
-- DSI2-G1
('Ben Amor', 'Wassim', 'wassim.benamor@etudiant.tn', 'wbenamor', '$2b$10$oqPBowmX095/RjmnCLoyGuRlmJOJpdGhHDO/o11wnSXbWsghIBg8m', 'etudiant', 1, 1),
('Tounsi', 'Rim', 'rim.tounsi@etudiant.tn', 'rtounsi', '$2b$10$oqPBowmX095/RjmnCLoyGuRlmJOJpdGhHDO/o11wnSXbWsghIBg8m', 'etudiant', 1, 1),
('Khemiri', 'Amine', 'amine.khemiri@etudiant.tn', 'akhemiri', '$2b$10$oqPBowmX095/RjmnCLoyGuRlmJOJpdGhHDO/o11wnSXbWsghIBg8m', 'etudiant', 1, 1),
-- DSI3-G1
('Lazhar', 'Nour', 'nour.lazhar@etudiant.tn', 'nlazhar', '$2b$10$oqPBowmX095/RjmnCLoyGuRlmJOJpdGhHDO/o11wnSXbWsghIBg8m', 'etudiant', 1, 1),
('Ferchichi', 'Bilel', 'bilel.ferchichi@etudiant.tn', 'bferchichi', '$2b$10$oqPBowmX095/RjmnCLoyGuRlmJOJpdGhHDO/o11wnSXbWsghIBg8m', 'etudiant', 1, 1),
-- ASP2-A (Génie Électrique)
('Ghanmi', 'Houssem', 'houssem.ghanmi@etudiant.tn', 'hghanmi', '$2b$10$oqPBowmX095/RjmnCLoyGuRlmJOJpdGhHDO/o11wnSXbWsghIBg8m', 'etudiant', 2, 1),
('Sahli', 'Wiem', 'wiem.sahli@etudiant.tn', 'wsahli', '$2b$10$oqPBowmX095/RjmnCLoyGuRlmJOJpdGhHDO/o11wnSXbWsghIBg8m', 'etudiant', 2, 1),
-- AI2-A (Génie Électrique)
('Triki', 'Moez', 'moez.triki@etudiant.tn', 'mtriki', '$2b$10$oqPBowmX095/RjmnCLoyGuRlmJOJpdGhHDO/o11wnSXbWsghIBg8m', 'etudiant', 2, 1),
('Bouslama', 'Sonia', 'sonia.bouslama@etudiant.tn', 'sbouslama', '$2b$10$oqPBowmX095/RjmnCLoyGuRlmJOJpdGhHDO/o11wnSXbWsghIBg8m', 'etudiant', 2, 1),
-- BAT2-A (Génie Civil)
('Kraiem', 'Fares', 'fares.kraiem@etudiant.tn', 'fkraiem', '$2b$10$oqPBowmX095/RjmnCLoyGuRlmJOJpdGhHDO/o11wnSXbWsghIBg8m', 'etudiant', 11, 1),
('Nasr', 'Amina', 'amina.nasr@etudiant.tn', 'anasr', '$2b$10$oqPBowmX095/RjmnCLoyGuRlmJOJpdGhHDO/o11wnSXbWsghIBg8m', 'etudiant', 11, 1);

-- Lier les comptes utilisateurs aux étudiants
UPDATE etudiants SET id_utilisateur = (SELECT id FROM utilisateurs WHERE email = 'salma.nasri@etudiant.tn') WHERE email = 'salma.nasri@etudiant.tn';
UPDATE etudiants SET id_utilisateur = (SELECT id FROM utilisateurs WHERE email = 'omar.ayari@etudiant.tn') WHERE email = 'omar.ayari@etudiant.tn';
UPDATE etudiants SET id_utilisateur = (SELECT id FROM utilisateurs WHERE email = 'meryem.zaidi@etudiant.tn') WHERE email = 'meryem.zaidi@etudiant.tn';
UPDATE etudiants SET id_utilisateur = (SELECT id FROM utilisateurs WHERE email = 'wassim.benamor@etudiant.tn') WHERE email = 'wassim.benamor@etudiant.tn';
UPDATE etudiants SET id_utilisateur = (SELECT id FROM utilisateurs WHERE email = 'rim.tounsi@etudiant.tn') WHERE email = 'rim.tounsi@etudiant.tn';
UPDATE etudiants SET id_utilisateur = (SELECT id FROM utilisateurs WHERE email = 'amine.khemiri@etudiant.tn') WHERE email = 'amine.khemiri@etudiant.tn';
UPDATE etudiants SET id_utilisateur = (SELECT id FROM utilisateurs WHERE email = 'nour.lazhar@etudiant.tn') WHERE email = 'nour.lazhar@etudiant.tn';
UPDATE etudiants SET id_utilisateur = (SELECT id FROM utilisateurs WHERE email = 'bilel.ferchichi@etudiant.tn') WHERE email = 'bilel.ferchichi@etudiant.tn';
UPDATE etudiants SET id_utilisateur = (SELECT id FROM utilisateurs WHERE email = 'houssem.ghanmi@etudiant.tn') WHERE email = 'houssem.ghanmi@etudiant.tn';
UPDATE etudiants SET id_utilisateur = (SELECT id FROM utilisateurs WHERE email = 'wiem.sahli@etudiant.tn') WHERE email = 'wiem.sahli@etudiant.tn';
UPDATE etudiants SET id_utilisateur = (SELECT id FROM utilisateurs WHERE email = 'moez.triki@etudiant.tn') WHERE email = 'moez.triki@etudiant.tn';
UPDATE etudiants SET id_utilisateur = (SELECT id FROM utilisateurs WHERE email = 'sonia.bouslama@etudiant.tn') WHERE email = 'sonia.bouslama@etudiant.tn';
UPDATE etudiants SET id_utilisateur = (SELECT id FROM utilisateurs WHERE email = 'fares.kraiem@etudiant.tn') WHERE email = 'fares.kraiem@etudiant.tn';
UPDATE etudiants SET id_utilisateur = (SELECT id FROM utilisateurs WHERE email = 'amina.nasr@etudiant.tn') WHERE email = 'amina.nasr@etudiant.tn';


-- ================================================================
-- 3. NOUVEAUX COURS
-- ================================================================

-- Cours pour les nouveaux enseignants
INSERT INTO cours (titre, type_cours, description, id_enseignant, id_groupe, id_salle, jour, heure_debut, heure_fin) VALUES

-- Sarra Bouaziz (Informatique)
('Bases de données', 'cm', 'Cours magistral sur les bases de données relationnelles', 
    (SELECT id FROM enseignants WHERE email = 'sarra.bouaziz@iset.tn'), 46, 1, 'mardi', '10:00:00', '12:00:00'),
('Bases de données - TP', 'tp', 'Travaux pratiques SQL et MySQL', 
    (SELECT id FROM enseignants WHERE email = 'sarra.bouaziz@iset.tn'), 46, 2, 'mercredi', '14:00:00', '16:00:00'),

-- Karim Gharbi (Informatique)
('Programmation orientée objet', 'cm', 'Concepts POO en Java', 
    (SELECT id FROM enseignants WHERE email = 'karim.gharbi@iset.tn'), 3, 1, 'lundi', '14:00:00', '16:00:00'),
('POO - Atelier', 'atelier', 'Pratique Java et conception objet', 
    (SELECT id FROM enseignants WHERE email = 'karim.gharbi@iset.tn'), 3, 2, 'jeudi', '08:00:00', '11:00:00'),

-- Amira Mezghani (Génie Électrique)
('Électronique de puissance', 'cm', 'Cours sur les convertisseurs électroniques', 
    (SELECT id FROM enseignants WHERE email = 'amira.mezghani@iset.tn'), 29, 1, 'lundi', '08:00:00', '10:00:00'),
('Électronique - TP', 'tp', 'Manipulation des convertisseurs', 
    (SELECT id FROM enseignants WHERE email = 'amira.mezghani@iset.tn'), 29, 2, 'mardi', '14:00:00', '17:00:00'),

-- Hichem Jebali (Génie Électrique)
('Automatisme industriel', 'cm', 'API et automates programmables', 
    (SELECT id FROM enseignants WHERE email = 'hichem.jebali@iset.tn'), 32, 1, 'mercredi', '10:00:00', '12:00:00'),
('Automatisme - TP', 'tp', 'Programmation automates', 
    (SELECT id FROM enseignants WHERE email = 'hichem.jebali@iset.tn'), 32, 2, 'vendredi', '08:00:00', '11:00:00'),

-- Nadia Sassi (Génie Mécanique)
('Maintenance industrielle', 'cm', 'Stratégies de maintenance préventive', 
    (SELECT id FROM enseignants WHERE email = 'nadia.sassi@iset.tn'), 34, 1, 'mardi', '08:00:00', '10:00:00'),

-- Riadh Chakroun (Génie Mécanique)
('Mécatronique', 'cm', 'Systèmes mécatroniques', 
    (SELECT id FROM enseignants WHERE email = 'riadh.chakroun@iset.tn'), 37, 1, 'jeudi', '10:00:00', '12:00:00'),

-- Leila Mansouri (Génie Civil)
('Construction bâtiment', 'cm', 'Techniques de construction', 
    (SELECT id FROM enseignants WHERE email = 'leila.mansouri@iset.tn'), 20, 1, 'lundi', '10:00:00', '12:00:00'),
('Construction - TD', 'td', 'Études de cas en construction', 
    (SELECT id FROM enseignants WHERE email = 'leila.mansouri@iset.tn'), 20, 3, 'mercredi', '08:00:00', '10:00:00'),

-- Fathi Ben Salah (Génie Civil)
('Topographie', 'cm', 'Techniques de levé topographique', 
    (SELECT id FROM enseignants WHERE email = 'fathi.bensalah@iset.tn'), 22, 1, 'mardi', '14:00:00', '16:00:00'),
('Topographie - TP', 'tp', 'Pratique sur le terrain', 
    (SELECT id FROM enseignants WHERE email = 'fathi.bensalah@iset.tn'), 22, 2, 'jeudi', '14:00:00', '17:00:00'),

-- Cours supplémentaires pour les enseignants existants
-- Mohamed Ben Ali (déjà 1 cours)
('Programmation web', 'tp', 'Développement web HTML/CSS/JS', 
    (SELECT id FROM enseignants WHERE email = 'mohamed.benali@iset.tn'), 1, 2, 'jeudi', '08:00:00', '11:00:00'),

-- Ahmed Karray
('Réseaux industriels', 'cm', 'Communication industrielle', 
    (SELECT id FROM enseignants WHERE email = 'ahmed.karray@iset.tn'), 32, 1, 'lundi', '10:00:00', '12:00:00'),

-- Ramzi Dridi
('Architecture logicielle', 'cm', 'Patterns et architecture', 
    (SELECT id FROM enseignants WHERE email = 'dr@gmail.com'), 1, 1, 'vendredi', '10:00:00', '12:00:00');


-- ================================================================
-- 4. NOUVELLES SALLES
-- ================================================================

INSERT INTO salles (code, nom, type, capacite, etage, batiment) VALUES
('A102', 'Salle A102', 'cours', 35, 1, 'Bâtiment A'),
('A103', 'Salle A103', 'td', 30, 1, 'Bâtiment A'),
('B101', 'Lab Info 1', 'tp', 25, 1, 'Bâtiment B'),
('B202', 'Lab Réseau 2', 'tp', 20, 2, 'Bâtiment B'),
('B203', 'Lab Électronique', 'tp', 18, 2, 'Bâtiment B'),
('C101', 'Salle C101', 'cours', 40, 1, 'Bâtiment C'),
('C201', 'Salle C201', 'td', 30, 2, 'Bâtiment C'),
('C302', 'Amphi 2', 'amphi', 120, 3, 'Bâtiment C'),
('D101', 'Atelier Mécanique', 'tp', 15, 1, 'Bâtiment D'),
('D102', 'Atelier Électrique', 'tp', 15, 1, 'Bâtiment D');


-- ================================================================
-- 5. NOUVELLES MATIÈRES
-- ================================================================

INSERT INTO matieres (nom, code, id_niveau, id_enseignant, coefficient, nb_heures) VALUES
-- Niveau 1 - DSI
('Programmation orientée objet', 'INF103', 1, (SELECT id FROM enseignants WHERE email = 'karim.gharbi@iset.tn'), 2.50, 60),
('Bases de données', 'INF104', 1, (SELECT id FROM enseignants WHERE email = 'sarra.bouaziz@iset.tn'), 2.50, 60),
('Développement web', 'INF105', 1, (SELECT id FROM enseignants WHERE email = 'mohamed.benali@iset.tn'), 2.00, 45),

-- Niveau 2 - DSI
('Architecture logicielle', 'INF203', 2, (SELECT id FROM enseignants WHERE email = 'dr@gmail.com'), 2.50, 60),
('Programmation web avancée', 'INF204', 2, (SELECT id FROM enseignants WHERE email = 'mohamed.benali@iset.tn'), 2.00, 45),

-- Niveau 3 - DSI
('Projet de développement', 'INF303', 3, (SELECT id FROM enseignants WHERE email = 'karim.gharbi@iset.tn'), 3.00, 90);


-- ================================================================
-- RÉSUMÉ DES NOUVEAUX COMPTES CRÉÉS
-- ================================================================
-- 
-- ENSEIGNANTS (login / mot de passe: 12332100):
-- ------------------------------------------------
-- sbouaziz      - Sarra Bouaziz (Informatique)
-- kgharbi       - Karim Gharbi (Informatique)
-- amezghani     - Amira Mezghani (Génie Électrique)
-- hjebali       - Hichem Jebali (Génie Électrique)
-- nsassi        - Nadia Sassi (Génie Mécanique)
-- rchakroun     - Riadh Chakroun (Génie Mécanique)
-- lmansouri     - Leila Mansouri (Génie Civil)
-- fbensalah     - Fathi Ben Salah (Génie Civil)
--
-- ÉTUDIANTS (login / mot de passe: 12332100):
-- ------------------------------------------------
-- snasri        - Salma Nasri (DSI1-A)
-- oayari        - Omar Ayari (DSI1-A)
-- mzaidi        - Meryem Zaidi (DSI1-A)
-- wbenamor      - Wassim Ben Amor (DSI2-G1)
-- rtounsi       - Rim Tounsi (DSI2-G1)
-- akhemiri      - Amine Khemiri (DSI2-G1)
-- nlazhar       - Nour Lazhar (DSI3-G1)
-- bferchichi    - Bilel Ferchichi (DSI3-G1)
-- hghanmi       - Houssem Ghanmi (ASP2-A)
-- wsahli        - Wiem Sahli (ASP2-A)
-- mtriki        - Moez Triki (AI2-A)
-- sbouslama     - Sonia Bouslama (AI2-A)
-- fkraiem       - Fares Kraiem (BAT2-A)
-- anasr         - Amina Nasr (BAT2-A)
--
-- TOTAL: 8 nouveaux enseignants + 14 nouveaux étudiants = 22 comptes
-- TOTAL COURS: 17 nouveaux cours créés
-- TOTAL SALLES: 10 nouvelles salles créées
-- TOTAL MATIÈRES: 6 nouvelles matières créées
-- ================================================================
