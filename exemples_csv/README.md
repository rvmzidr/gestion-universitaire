# 📁 Exemples CSV - Fichiers de Test

Ce dossier contient des fichiers CSV d'exemple pour tester la fonctionnalité d'importation.

## 📄 Fichiers disponibles

### 1. `departements_exemple.csv`
Contient 5 départements d'exemple avec descriptions et chefs de département.

**Utilisation** :
1. Aller sur http://localhost:3000/departements
2. Cliquer sur "📥 Importer CSV"
3. Sélectionner ce fichier
4. Importer

### 2. `enseignants_exemple.csv`
Contient 8 enseignants avec leurs spécialités et départements associés.

**⚠️ Prérequis** : Les départements doivent exister avant d'importer les enseignants !

**Utilisation** :
1. Importer d'abord `departements_exemple.csv`
2. Aller sur http://localhost:3000/enseignants
3. Cliquer sur "📥 Importer CSV"
4. Sélectionner ce fichier
5. Importer

### 3. `etudiants_exemple.csv`
Contient 10 étudiants avec toutes leurs informations.

**⚠️ Prérequis** : Les groupes et spécialités doivent exister avant d'importer les étudiants !

**Utilisation** :
1. Créer les groupes (Groupe A, Groupe B) dans la base de données
2. Créer les spécialités (Informatique, Mathématiques, Physique, etc.) dans la base de données
3. Aller sur http://localhost:3000/etudiants
4. Cliquer sur "📥 Importer CSV"
5. Sélectionner ce fichier
6. Importer

## 🧪 Test complet

Pour tester toute la chaîne d'importation :

```bash
# 1. Départements (aucun prérequis)
Importer : departements_exemple.csv
Résultat : 5 départements créés

# 2. Enseignants (nécessite les départements)
Importer : enseignants_exemple.csv
Résultat : 8 enseignants créés et associés aux départements

# 3. Étudiants (nécessite les groupes et spécialités)
Créer manuellement :
  - Groupe A
  - Groupe B
  - Spécialités : Informatique, Mathématiques, Physique, Génie Civil, Électronique

Importer : etudiants_exemple.csv
Résultat : 10 étudiants créés
```

## 📝 Format des fichiers

Tous les fichiers utilisent :
- **Encodage** : UTF-8
- **Séparateur** : virgule (,)
- **En-tête** : Première ligne avec noms de colonnes
- **Format** : Standard CSV

## 🔧 Modification des exemples

Vous pouvez modifier ces fichiers avec :
- Microsoft Excel
- LibreOffice Calc
- Google Sheets
- Éditeur de texte (avec encodage UTF-8)

**Important** : Toujours sauvegarder en format CSV avec séparateur virgule et encodage UTF-8.

## ⚠️ Notes importantes

1. **Emails uniques** : Chaque email doit être unique dans la base de données
2. **Numéros étudiants uniques** : Chaque numéro d'étudiant doit être unique
3. **Références valides** : Les noms de départements, groupes et spécialités doivent correspondre exactement
4. **Format de date** : Utiliser YYYY-MM-DD pour les dates de naissance

## 🎯 Cas de test

### Test 1 : Import réussi
Utiliser les fichiers tels quels → Toutes les données doivent être importées

### Test 2 : Département manquant
Importer `enseignants_exemple.csv` sans avoir importé `departements_exemple.csv` d'abord
→ Erreurs pour les enseignants avec département inexistant

### Test 3 : Email en doublon
Modifier un fichier pour avoir deux fois le même email
→ Une ligne importée, l'autre rejetée avec erreur

### Test 4 : Colonne manquante
Supprimer une colonne requise (ex: email)
→ Erreur pour toutes les lignes concernées

## 💡 Conseils

- Commencez toujours par un petit fichier de test (2-3 lignes)
- Vérifiez les dépendances (départements → enseignants)
- Créez les entités de référence d'abord (groupes, spécialités)
- Gardez une copie de sauvegarde de vos données

---

**Note** : Ces fichiers sont fournis à titre d'exemple uniquement. Adaptez-les à vos besoins réels.
