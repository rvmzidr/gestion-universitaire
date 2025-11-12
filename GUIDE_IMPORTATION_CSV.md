# 📥 Guide d'Importation CSV - Gestion Universitaire

## Vue d'ensemble

Cette fonctionnalité permet aux administrateurs d'importer en masse des départements, enseignants et étudiants via des fichiers CSV.

## 🔒 Restrictions d'accès

- **Rôle requis** : Administrateur ou Directeur
- Seuls les utilisateurs authentifiés avec les bons rôles peuvent accéder aux pages d'importation

## 📋 Formats de fichiers CSV

### 1. Départements (`departements.csv`)

**Colonnes requises :**
- `nom` : Nom du département (obligatoire)

**Colonnes optionnelles :**
- `description` : Description du département
- `chef_departement` : Nom du chef de département

**Exemple :**
```csv
nom,description,chef_departement
Informatique,Département des sciences informatiques,Dr. Dupont
Mathématiques,Département de mathématiques,Dr. Martin
Physique,Département de physique,Dr. Bernard
```

### 2. Enseignants (`enseignants.csv`)

**Colonnes requises :**
- `nom` : Nom de famille (obligatoire)
- `prenom` : Prénom (obligatoire)
- `email` : Adresse email (obligatoire, doit être unique)

**Colonnes optionnelles :**
- `telephone` : Numéro de téléphone
- `specialite` : Spécialité de l'enseignant
- `departement` : Nom du département (doit exister dans la base de données)

**Exemple :**
```csv
nom,prenom,email,telephone,specialite,departement
Dupont,Jean,jean.dupont@universite.fr,0123456789,Programmation,Informatique
Martin,Marie,marie.martin@universite.fr,0987654321,Algèbre,Mathématiques
Bernard,Pierre,pierre.bernard@universite.fr,0147258369,Mécanique,Physique
```

### 3. Étudiants (`etudiants.csv`)

**Colonnes requises :**
- `nom` : Nom de famille (obligatoire)
- `prenom` : Prénom (obligatoire)
- `email` : Adresse email (obligatoire, doit être unique)
- `numero_etudiant` : Numéro d'étudiant unique (obligatoire)

**Colonnes optionnelles :**
- `date_naissance` : Date de naissance au format YYYY-MM-DD
- `telephone` : Numéro de téléphone
- `adresse` : Adresse complète
- `groupe` : Nom du groupe (doit exister dans la base de données)
- `specialite` : Nom de la spécialité (doit exister dans la base de données)

**Exemple :**
```csv
nom,prenom,email,numero_etudiant,date_naissance,telephone,adresse,groupe,specialite
Dupont,Jean,jean.dupont@etudiant.fr,E12345,2000-05-15,0123456789,123 Rue de Paris,Groupe A,Informatique
Martin,Marie,marie.martin@etudiant.fr,E12346,2001-08-20,0987654321,456 Avenue des Champs,Groupe B,Mathématiques
Bernard,Pierre,pierre.bernard@etudiant.fr,E12347,1999-12-10,0147258369,789 Boulevard Victor Hugo,Groupe A,Physique
```

## 🚀 Comment utiliser l'importation CSV

### Étape 1 : Accéder à la page d'importation

1. Connectez-vous en tant qu'administrateur
2. Accédez à la liste des départements, enseignants ou étudiants
3. Cliquez sur le bouton **"📥 Importer CSV"**

### Étape 2 : Télécharger le modèle

1. Sur la page d'importation, cliquez sur **"⬇️ Télécharger le modèle CSV"**
2. Ouvrez le fichier avec Excel, LibreOffice Calc ou un éditeur de texte
3. Remplissez les données en respectant le format

### Étape 3 : Préparer votre fichier CSV

**Règles importantes :**

✅ **À FAIRE :**
- Utiliser l'encodage UTF-8
- Utiliser la virgule (`,`) comme séparateur
- Respecter les noms de colonnes (sensibles à la casse)
- Vérifier que les références (départements, groupes, spécialités) existent
- S'assurer que les emails sont uniques
- Utiliser le format de date YYYY-MM-DD

❌ **À ÉVITER :**
- Laisser des colonnes requises vides
- Utiliser des caractères spéciaux dans les noms de colonnes
- Dépasser la limite de taille (5 MB)
- Inclure des doublons d'email ou de numéro étudiant

### Étape 4 : Importer le fichier

1. Cliquez sur **"📄 Sélectionner le fichier CSV"**
2. Choisissez votre fichier CSV préparé
3. Cliquez sur **"📤 Importer"**
4. Attendez la confirmation

### Étape 5 : Vérifier les résultats

Après l'importation, vous verrez :

- ✅ **Message de succès** : Nombre d'enregistrements importés
- ⚠️ **Liste des erreurs** : Si certaines lignes ont échoué
- 📊 **Détails** : Numéro de ligne et raison de l'erreur

## 🔍 Validation des données

Le système valide automatiquement :

### Pour tous les types
- ✓ Présence des colonnes requises
- ✓ Format des données
- ✓ Unicité des emails
- ✓ Références valides (départements, groupes, spécialités)

### Pour les étudiants
- ✓ Unicité du numéro étudiant
- ✓ Format de la date de naissance

### Pour les enseignants
- ✓ Validité du département associé

## ⚠️ Gestion des erreurs

Si une ligne contient une erreur :
- ✅ Les lignes valides sont quand même importées
- ❌ Les lignes avec erreurs sont ignorées
- 📝 Une liste détaillée des erreurs est affichée

**Exemples d'erreurs courantes :**

```
Ligne 5: Le nom est requis
Ligne 8: Email déjà existant
Ligne 12: Département "Chimie" non trouvé
Ligne 15: Format de date invalide
```

## 💡 Bonnes pratiques

### 1. Testez avec un petit fichier d'abord
Commencez par importer 5-10 lignes pour vérifier le format

### 2. Créez les dépendances d'abord
- Créez les départements avant d'importer les enseignants
- Créez les groupes et spécialités avant d'importer les étudiants

### 3. Gardez une copie de sauvegarde
Conservez toujours une copie de votre fichier CSV original

### 4. Vérifiez les données après l'importation
Consultez la liste pour vous assurer que tout est correct

### 5. Utilisez Excel/LibreOffice pour préparer les données
Ces outils facilitent la manipulation et la validation des données

## 🔐 Sécurité

### Mesures de protection

1. **Authentification requise** : Seuls les utilisateurs connectés peuvent importer
2. **Contrôle d'accès** : Uniquement les admins et directeurs
3. **Validation des données** : Toutes les données sont validées avant insertion
4. **Taille limitée** : Maximum 5 MB par fichier
5. **Types de fichiers** : Seuls les fichiers .csv sont acceptés
6. **Nettoyage automatique** : Les fichiers uploadés sont supprimés après traitement

### Logs de sécurité

Toutes les importations sont enregistrées dans les logs avec :
- Utilisateur qui a effectué l'importation
- Date et heure
- Nombre d'enregistrements importés
- Erreurs rencontrées

## 🛠️ Dépannage

### Problème : "Aucun fichier n'a été téléchargé"
**Solution** : Assurez-vous de sélectionner un fichier avant de cliquer sur "Importer"

### Problème : "Erreur lors de l'importation du fichier CSV"
**Solutions** :
- Vérifiez que le fichier est bien au format CSV
- Vérifiez l'encodage (doit être UTF-8)
- Vérifiez que le séparateur est une virgule

### Problème : "Département XXX non trouvé"
**Solution** : Créez d'abord le département avant d'importer les enseignants

### Problème : "Email déjà existant"
**Solution** : Vérifiez que l'email n'est pas déjà dans la base de données

### Problème : Caractères spéciaux mal affichés (é, à, ç)
**Solution** : Enregistrez le fichier CSV avec l'encodage UTF-8

## 📞 Support

Pour toute question ou problème :
- Consultez ce guide
- Téléchargez les modèles CSV fournis
- Contactez l'administrateur système

---

**Version** : 1.0  
**Dernière mise à jour** : 19 octobre 2025
