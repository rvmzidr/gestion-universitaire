# 📝 Système de Gestion des Notes

## 📋 Structure de la Table

La table `notes` contient les informations suivantes :

### Champs principaux
- **id** : Identifiant unique de la note
- **id_etudiant** : Référence à l'étudiant
- **id_cours** : Référence au cours
- **type_evaluation** : Type d'évaluation (DS, CC, TP, Examen, Projet, Oral)
- **note** : Valeur de la note (0-20)
- **coefficient** : Coefficient de la note (0.5-5)
- **date_evaluation** : Date de l'évaluation
- **semestre** : Semestre (1 ou 2)
- **annee_universitaire** : Année universitaire (ex: "2024-2025")
- **remarque** : Commentaire de l'enseignant (optionnel)
- **id_enseignant** : Référence à l'enseignant qui a saisi la note

## 🎯 Types d'Évaluation

| Code | Description | Coefficient typique |
|------|-------------|---------------------|
| `ds` | Devoir Surveillé | 1.0 |
| `cc` | Contrôle Continu | 2.0 |
| `tp` | Travaux Pratiques | 1.5 |
| `examen` | Examen Final | 3.0 |
| `projet` | Projet | 3.0 |
| `oral` | Présentation Orale | 1.0 |

## 🔧 Installation

### 1. Créer la table
```bash
mysql -u root -p gestion_universitaire < database/create_notes_table.sql
```

### 2. Insérer des données de test (optionnel)
```bash
mysql -u root -p gestion_universitaire < database/insert_notes_test.sql
```

## 📊 Vues Disponibles

### vue_moyennes_etudiants
Calcule la moyenne pondérée par étudiant et cours
```sql
SELECT * FROM vue_moyennes_etudiants WHERE id_etudiant = 1;
```

### vue_statistiques_cours
Statistiques par cours (moyenne, min, max, écart-type)
```sql
SELECT * FROM vue_statistiques_cours WHERE id_cours = 1;
```

### vue_bulletin_etudiant
Bulletin complet d'un étudiant
```sql
SELECT * FROM vue_bulletin_etudiant WHERE id_etudiant = 1 AND semestre = '1';
```

## 🔍 Requêtes Utiles

### Moyenne d'un étudiant pour un cours
```sql
SELECT 
    SUM(note * coefficient) / SUM(coefficient) AS moyenne
FROM notes
WHERE id_etudiant = 1 
    AND id_cours = 1 
    AND semestre = '1' 
    AND annee_universitaire = '2024-2025';
```

### Classement des étudiants d'un cours
```sql
CALL sp_classement_cours(1, '1', '2024-2025');
```

### Notes d'un étudiant
```sql
SELECT 
    c.titre AS cours,
    n.type_evaluation,
    n.note,
    n.coefficient,
    n.date_evaluation,
    n.remarque
FROM notes n
JOIN cours c ON n.id_cours = c.id
WHERE n.id_etudiant = 1 
    AND n.semestre = '1'
    AND n.annee_universitaire = '2024-2025'
ORDER BY c.titre, n.date_evaluation;
```

### Statistiques d'un cours
```sql
SELECT 
    COUNT(DISTINCT id_etudiant) AS nombre_etudiants,
    AVG(note) AS moyenne,
    MIN(note) AS note_min,
    MAX(note) AS note_max,
    COUNT(*) AS nombre_evaluations
FROM notes
WHERE id_cours = 1 
    AND semestre = '1' 
    AND annee_universitaire = '2024-2025';
```

## ⚠️ Contraintes et Validations

1. **Note** : Entre 0 et 20
2. **Coefficient** : Entre 0.5 et 5
3. **Unicité** : Un étudiant ne peut pas avoir deux notes du même type pour le même cours dans le même semestre
4. **Clés étrangères** : Les IDs doivent exister dans les tables référencées

## 🎓 Calcul de Moyenne

La moyenne est calculée avec la formule pondérée :
```
Moyenne = Σ(note × coefficient) / Σ(coefficient)
```

### Exemple
- DS : 15/20 (coef 1) → 15 points
- CC : 14/20 (coef 2) → 28 points
- Examen : 16/20 (coef 3) → 48 points
- **Moyenne = (15 + 28 + 48) / (1 + 2 + 3) = 91/6 = 15.17/20**

## 📈 Procédures Stockées

### sp_calculer_moyenne
Calcule la moyenne d'un étudiant pour un cours spécifique
```sql
CALL sp_calculer_moyenne(1, 1, '1', '2024-2025', @moyenne);
SELECT @moyenne;
```

### sp_classement_cours
Obtient le classement des étudiants pour un cours
```sql
CALL sp_classement_cours(1, '1', '2024-2025');
```

## 🔐 Sécurité

- Les suppressions en cascade sont activées
- Les triggers empêchent les doublons
- Les contraintes vérifient les valeurs valides
- Index optimisés pour les performances

## 📝 Prochaines Étapes

1. Créer le modèle `Note.js`
2. Créer le contrôleur `noteController.js`
3. Créer les routes `/notes`
4. Créer les vues (list, create, edit, bulletin)
5. Ajouter au menu de navigation
6. Implémenter l'export PDF des bulletins

## 🎨 Fonctionnalités à Implémenter

- ✅ Saisie des notes par l'enseignant
- ✅ Consultation des notes par l'étudiant
- ✅ Génération de bulletins
- ✅ Statistiques par cours
- ✅ Classement des étudiants
- ⏳ Export PDF des bulletins
- ⏳ Graphiques de progression
- ⏳ Comparaison inter-semestres
- ⏳ Notifications aux étudiants
