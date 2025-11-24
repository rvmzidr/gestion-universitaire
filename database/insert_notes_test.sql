-- ================================================
-- DONNÉES DE TEST - Table NOTES
-- ================================================

-- Note: Assurez-vous que les IDs des étudiants, cours et enseignants existent

-- Obtenir l'année universitaire courante
SET @annee_courante = '2025-2026';
SET @semestre_courant = '1';

-- ================================================
-- Notes pour le cours 1 (Info) - Semestre 1
-- ================================================

-- Étudiant 1 - Excellent
INSERT INTO notes (id_etudiant, id_cours, type_evaluation, note, coefficient, date_evaluation, semestre, annee_universitaire, remarque, id_enseignant) VALUES
(1, 1, 'ds', 17.50, 1.00, '2024-10-10', '1', '2024-2025', 'Très bon travail', 1),
(1, 1, 'cc', 16.00, 2.00, '2024-11-15', '1', '2024-2025', 'Contrôle continu - Excellente maîtrise', 1),
(1, 1, 'tp', 18.00, 1.50, '2024-11-20', '1', '2024-2025', 'TP bien réalisé', 1);

-- Étudiant 2 - Bon
INSERT INTO notes (id_etudiant, id_cours, type_evaluation, note, coefficient, date_evaluation, semestre, annee_universitaire, remarque, id_enseignant) VALUES
(2, 1, 'ds', 14.00, 1.00, '2024-10-10', '1', '2024-2025', 'Bon niveau', 1),
(2, 1, 'cc', 13.50, 2.00, '2024-11-15', '1', '2024-2025', 'Travail régulier', 1),
(2, 1, 'tp', 15.00, 1.50, '2024-11-20', '1', '2024-2025', 'Bien', 1);

-- Étudiant 3 - Moyen
INSERT INTO notes (id_etudiant, id_cours, type_evaluation, note, coefficient, date_evaluation, semestre, annee_universitaire, remarque, id_enseignant) VALUES
(3, 1, 'ds', 11.50, 1.00, '2024-10-10', '1', '2024-2025', 'Peut mieux faire', 1),
(3, 1, 'cc', 12.00, 2.00, '2024-11-15', '1', '2024-2025', 'Effort à fournir', 1),
(3, 1, 'tp', 10.50, 1.50, '2024-11-20', '1', '2024-2025', 'Travail incomplet', 1);

-- Étudiant 4 - Faible
INSERT INTO notes (id_etudiant, id_cours, type_evaluation, note, coefficient, date_evaluation, semestre, annee_universitaire, remarque, id_enseignant) VALUES
(4, 1, 'ds', 8.00, 1.00, '2024-10-10', '1', '2024-2025', 'Travail insuffisant', 1),
(4, 1, 'cc', 9.50, 2.00, '2024-11-15', '1', '2024-2025', 'Doit se ressaisir', 1),
(4, 1, 'tp', 7.50, 1.50, '2024-11-20', '1', '2024-2025', 'TP non terminé', 1);

-- ================================================
-- Notes pour le cours 18 (Programmation Web) - Semestre 1
-- ================================================

-- Étudiant 1
INSERT INTO notes (id_etudiant, id_cours, type_evaluation, note, coefficient, date_evaluation, semestre, annee_universitaire, remarque, id_enseignant) VALUES
(1, 18, 'ds', 16.00, 1.00, '2024-10-20', '1', '2024-2025', 'Bonne compréhension', 1),
(1, 18, 'projet', 17.50, 3.00, '2024-12-01', '1', '2024-2025', 'Excellent projet web', 1);

-- Étudiant 2
INSERT INTO notes (id_etudiant, id_cours, type_evaluation, note, coefficient, date_evaluation, semestre, annee_universitaire, remarque, id_enseignant) VALUES
(2, 18, 'ds', 13.00, 1.00, '2024-10-20', '1', '2024-2025', 'Correct', 1),
(2, 18, 'projet', 14.50, 3.00, '2024-12-01', '1', '2024-2025', 'Bon projet', 1);

-- Étudiant 3
INSERT INTO notes (id_etudiant, id_cours, type_evaluation, note, coefficient, date_evaluation, semestre, annee_universitaire, remarque, id_enseignant) VALUES
(3, 18, 'ds', 10.50, 1.00, '2024-10-20', '1', '2024-2025', 'Lacunes', 1),
(3, 18, 'projet', 11.00, 3.00, '2024-12-01', '1', '2024-2025', 'Projet basique', 1);

-- ================================================
-- Notes variées pour d'autres étudiants
-- ================================================

-- Étudiant 5
INSERT INTO notes (id_etudiant, id_cours, type_evaluation, note, coefficient, date_evaluation, semestre, annee_universitaire, remarque, id_enseignant) VALUES
(5, 1, 'ds', 15.50, 1.00, '2024-10-10', '1', '2024-2025', 'Très bien', 1),
(5, 1, 'cc', 14.50, 2.00, '2024-11-15', '1', '2024-2025', 'Bon travail', 1);

-- Étudiant 6
INSERT INTO notes (id_etudiant, id_cours, type_evaluation, note, coefficient, date_evaluation, semestre, annee_universitaire, remarque, id_enseignant) VALUES
(6, 1, 'ds', 12.00, 1.00, '2024-10-10', '1', '2024-2025', 'Moyen', 1),
(6, 1, 'cc', 11.50, 2.00, '2024-11-15', '1', '2024-2025', 'Peut progresser', 1);

-- ================================================
-- Vérification des données insérées
-- ================================================

-- Compter le nombre total de notes
SELECT COUNT(*) AS total_notes FROM notes;

-- Voir la répartition par type d'évaluation
SELECT type_evaluation, COUNT(*) AS nombre
FROM notes
GROUP BY type_evaluation;

-- Voir les moyennes par étudiant
SELECT 
    e.id,
    e.nom,
    e.prenom,
    COUNT(n.id) AS nombre_notes,
    AVG(n.note) AS moyenne_simple,
    SUM(n.note * n.coefficient) / SUM(n.coefficient) AS moyenne_ponderee
FROM etudiants e
LEFT JOIN notes n ON e.id = n.id_etudiant
WHERE n.semestre = '1' AND n.annee_universitaire = '2024-2025'
GROUP BY e.id, e.nom, e.prenom
ORDER BY moyenne_ponderee DESC;

-- Voir les statistiques par cours
SELECT 
    c.id,
    c.titre,
    COUNT(n.id) AS nombre_notes,
    COUNT(DISTINCT n.id_etudiant) AS nombre_etudiants,
    AVG(n.note) AS moyenne,
    MIN(n.note) AS note_min,
    MAX(n.note) AS note_max
FROM cours c
LEFT JOIN notes n ON c.id = n.id_cours
WHERE n.semestre = '1' AND n.annee_universitaire = '2024-2025'
GROUP BY c.id, c.titre
ORDER BY moyenne DESC;
