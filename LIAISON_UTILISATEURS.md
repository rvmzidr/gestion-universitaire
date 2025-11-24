# Liaison entre Utilisateurs, Enseignants et Étudiants

## 📋 Vue d'ensemble

Le système crée automatiquement une liaison bidirectionnelle entre les tables `utilisateurs` et les tables `enseignants`/`etudiants`.

## 🔧 Configuration de la base de données

### Étape 1 : Ajouter les colonnes id_utilisateur

Exécutez le script SQL suivant dans votre base de données :

```bash
mysql -u root -p gestion_universitaire < database/add_id_utilisateur.sql
```

Ou via phpMyAdmin, copiez le contenu de `database/add_id_utilisateur.sql`

### Contenu du script

```sql
-- Ajouter la colonne id_utilisateur dans enseignants
ALTER TABLE enseignants 
ADD COLUMN IF NOT EXISTS id_utilisateur INT NULL,
ADD CONSTRAINT fk_enseignants_utilisateur 
    FOREIGN KEY (id_utilisateur) 
    REFERENCES utilisateurs(id) 
    ON DELETE SET NULL;

-- Ajouter la colonne id_utilisateur dans etudiants
ALTER TABLE etudiants 
ADD COLUMN IF NOT EXISTS id_utilisateur INT NULL,
ADD CONSTRAINT fk_etudiants_utilisateur 
    FOREIGN KEY (id_utilisateur) 
    REFERENCES utilisateurs(id) 
    ON DELETE SET NULL;

-- Lier les données existantes
UPDATE enseignants e
INNER JOIN utilisateurs u ON LOWER(TRIM(e.email)) = LOWER(TRIM(u.email))
SET e.id_utilisateur = u.id
WHERE e.id_utilisateur IS NULL AND u.role = 'enseignant';

UPDATE etudiants e
INNER JOIN utilisateurs u ON LOWER(TRIM(e.email)) = LOWER(TRIM(u.email))
SET e.id_utilisateur = u.id
WHERE e.id_utilisateur IS NULL AND u.role = 'etudiant';
```

## 🔄 Fonctionnement automatique

### Scénario 1 : Créer un enseignant via `/enseignants/create`

1. L'admin remplit le formulaire avec les informations de l'enseignant
2. Le système :
   - ✅ Vérifie que l'email n'existe pas déjà
   - ✅ Crée d'abord un compte utilisateur avec :
     - Login généré : `prenom.nom` (minuscules, sans espaces)
     - Mot de passe : `ens123` (temporaire)
     - Rôle : `enseignant`
   - ✅ Crée l'enseignant dans la table `enseignants` avec `id_utilisateur`
3. Les identifiants sont affichés dans la console

**Exemple :**
```
✅ Compte enseignant créé - Login: jean.dupont / Mot de passe: ens123
```

### Scénario 2 : Créer un étudiant via `/etudiants/create`

1. L'admin remplit le formulaire avec les informations de l'étudiant
2. Le système :
   - ✅ Vérifie que l'email n'existe pas déjà
   - ✅ Récupère automatiquement le département depuis la spécialité
   - ✅ Crée d'abord un compte utilisateur avec :
     - Login généré : `prenom.nom` (minuscules, sans espaces)
     - Mot de passe : `etu123` (temporaire)
     - Rôle : `etudiant`
   - ✅ Crée l'étudiant dans la table `etudiants` avec `id_utilisateur`
3. Les identifiants sont affichés dans la console

**Exemple :**
```
✅ Compte étudiant créé - Login: marie.martin / Mot de passe: etu123
```

### Scénario 3 : S'inscrire via `/auth/register` (Enseignant)

1. L'utilisateur choisit le rôle "Enseignant"
2. Remplit : nom, prénom, email, login, mot de passe, département
3. Peut ajouter : téléphone, spécialité (optionnels)
4. Le système :
   - ✅ Crée le compte utilisateur avec le mot de passe choisi
   - ✅ Crée automatiquement l'entrée dans `enseignants` avec `id_utilisateur`
5. L'utilisateur peut se connecter immédiatement

### Scénario 4 : S'inscrire via `/auth/register` (Étudiant)

1. L'utilisateur choisit le rôle "Étudiant"
2. Remplit : nom, prénom, email, login, mot de passe, département
3. Peut ajouter : CIN, téléphone (optionnels)
4. Le système :
   - ✅ Crée le compte utilisateur avec le mot de passe choisi
   - ✅ Génère un CIN automatique si non fourni : `CIN{userId}`
   - ✅ Crée automatiquement l'entrée dans `etudiants` avec `id_utilisateur`
5. L'utilisateur peut se connecter immédiatement

## 📊 Structure des tables

### Table `utilisateurs`
```sql
- id (PK)
- nom
- prenom
- email (UNIQUE)
- login (UNIQUE)
- mdp_hash
- role (admin/directeur/enseignant/etudiant)
- id_departement (FK → departements)
- actif
- date_creation
```

### Table `enseignants`
```sql
- id (PK)
- nom
- prenom
- email (UNIQUE)
- telephone
- id_departement (FK → departements)
- specialite
- id_utilisateur (FK → utilisateurs) ← NOUVEAU
```

### Table `etudiants`
```sql
- id (PK)
- cin (UNIQUE)
- nom
- prenom
- email (UNIQUE)
- date_naissance
- adresse
- telephone
- id_groupe (FK → groupes)
- id_specialite (FK → specialites)
- id_niveau (FK → niveaux)
- id_utilisateur (FK → utilisateurs) ← NOUVEAU
```

## 🔐 Sécurité

### Validation des emails
- Vérification de duplication avant création
- Un email = un seul compte

### Génération des logins
- Format standardisé : `prenom.nom`
- Nettoyage automatique des espaces
- Conversion en minuscules

### Mots de passe
- Hashés avec bcrypt (10 rounds)
- Mots de passe temporaires pour création admin : `ens123` / `etu123`
- Mots de passe personnalisés lors de l'inscription

## 🔍 Requêtes utiles

### Vérifier les liaisons
```sql
-- Enseignants avec leur compte utilisateur
SELECT e.id, e.nom, e.prenom, e.email, 
       u.id as user_id, u.login, u.role
FROM enseignants e
LEFT JOIN utilisateurs u ON e.id_utilisateur = u.id;

-- Étudiants avec leur compte utilisateur
SELECT et.id, et.nom, et.prenom, et.email, 
       u.id as user_id, u.login, u.role
FROM etudiants et
LEFT JOIN utilisateurs u ON et.id_utilisateur = u.id;
```

### Trouver les comptes non liés
```sql
-- Enseignants sans compte utilisateur
SELECT * FROM enseignants WHERE id_utilisateur IS NULL;

-- Étudiants sans compte utilisateur
SELECT * FROM etudiants WHERE id_utilisateur IS NULL;

-- Utilisateurs enseignants sans fiche enseignant
SELECT u.* FROM utilisateurs u
WHERE u.role = 'enseignant'
AND NOT EXISTS (SELECT 1 FROM enseignants e WHERE e.id_utilisateur = u.id);

-- Utilisateurs étudiants sans fiche étudiant
SELECT u.* FROM utilisateurs u
WHERE u.role = 'etudiant'
AND NOT EXISTS (SELECT 1 FROM etudiants e WHERE e.id_utilisateur = u.id);
```

## 🐛 Dépannage

### Problème : id_utilisateur reste NULL

**Cause :** La colonne n'existe pas dans la base de données

**Solution :**
```bash
mysql -u root -p gestion_universitaire < database/add_id_utilisateur.sql
```

### Problème : Erreur "Email déjà utilisé"

**Cause :** Un compte avec cet email existe déjà

**Solution :**
1. Vérifiez dans la table `utilisateurs`
2. Si doublon, supprimez ou modifiez l'email existant

### Problème : Login généré déjà pris

**Cause :** Un utilisateur avec le même prénom.nom existe

**Solution :**
- Le système devrait gérer automatiquement
- Ou modifier manuellement le login avant création

## 📝 Notes importantes

1. **Ordre de création** : Toujours créer l'utilisateur AVANT l'enseignant/étudiant
2. **Email unique** : Impossible d'avoir le même email dans utilisateurs et enseignants/étudiants
3. **Suppression** : Si un utilisateur est supprimé, `id_utilisateur` devient NULL (ON DELETE SET NULL)
4. **Migration** : Les données existantes sont automatiquement liées par email lors de l'exécution du script SQL

## ✅ Checklist de vérification

- [ ] Script SQL exécuté (`add_id_utilisateur.sql`)
- [ ] Colonnes `id_utilisateur` présentes dans `enseignants` et `etudiants`
- [ ] Foreign keys créées correctement
- [ ] Données existantes liées (vérifier avec les requêtes SQL)
- [ ] Test de création d'un nouvel enseignant
- [ ] Test de création d'un nouvel étudiant
- [ ] Test d'inscription via le formulaire
- [ ] Vérification des id_utilisateur non NULL

## 🎯 Résultat attendu

Après configuration :
- ✅ Chaque enseignant a un compte utilisateur lié
- ✅ Chaque étudiant a un compte utilisateur lié
- ✅ Création automatique dans les deux sens
- ✅ Pas de doublons d'email
- ✅ Identifiants générés automatiquement
