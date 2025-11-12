# 🎯 Guide de Configuration Admin vs Directeur

## 📋 ÉTAPES OBLIGATOIRES

### **ÉTAPE 1 : Ajouter la colonne id_departement à users**

```sql
-- Dans PHPMyAdmin, onglet SQL :

-- 1. Ajouter la colonne
ALTER TABLE users 
ADD COLUMN id_departement INT DEFAULT NULL AFTER role;

-- 2. Ajouter la clé étrangère
ALTER TABLE users 
ADD CONSTRAINT fk_users_departement 
FOREIGN KEY (id_departement) REFERENCES departements(id) ON DELETE SET NULL;

-- 3. Créer un index
CREATE INDEX idx_users_departement ON users(id_departement);
```

### **ÉTAPE 2 : Assigner un département au directeur**

```sql
-- 1. Trouver les départements disponibles
SELECT id, nom FROM departements;

-- 2. Assigner le département au directeur (remplacez 1 par l'ID voulu)
UPDATE users 
SET id_departement = 1
WHERE role = 'directeur';

-- Vérifier
SELECT id, login, role, id_departement FROM users WHERE role = 'directeur';
```

### **ÉTAPE 3 : Redémarrer le serveur**

```powershell
npm start
```

### **ÉTAPE 4 : Se reconnecter**

⚠️ **IMPORTANT** : Déconnectez-vous et reconnectez-vous pour que le nouveau token JWT inclue `id_departement` !

---

## ✅ Différences Admin vs Directeur

### 📊 **ADMIN - Vue globale**
- Départements : **TOUS**
- Enseignants : **TOUS**
- Étudiants : **TOUS**
- Cours : **TOUS**
- Graphiques : Répartition globale

### 🎓 **DIRECTEUR - Vue département**
- Enseignants : **Son département uniquement**
- Étudiants : **Son département uniquement** (via specialites)
- Cours : **Son département uniquement** (via enseignants)
- Conflits : **À résoudre dans son département**
- Graphiques : Données de son département

---

## 🔍 Comment ça fonctionne

### Relations de données

```
Directeur (users.id_departement)
    ↓
Département
    ↓
    ├─→ Enseignants (enseignants.id_departement)
    │       ↓
    │   Cours (cours.id_enseignant)
    │
    └─→ Spécialités (specialites.id_departement)
            ↓
        Étudiants (etudiants.id_specialite)
```

### Requêtes SQL utilisées

**Directeur - Compter les enseignants**
```sql
SELECT COUNT(*) 
FROM enseignants 
WHERE id_departement = ?
```

**Directeur - Compter les étudiants**
```sql
SELECT COUNT(DISTINCT e.id) 
FROM etudiants e
INNER JOIN specialites s ON e.id_specialite = s.id
WHERE s.id_departement = ?
```

**Directeur - Compter les cours**
```sql
SELECT COUNT(*) 
FROM cours c
INNER JOIN enseignants ens ON c.id_enseignant = ens.id
WHERE ens.id_departement = ?
```

**Directeur - Détecter les conflits**
```sql
SELECT COUNT(DISTINCT c1.id)
FROM cours c1
INNER JOIN cours c2 ON c1.id < c2.id
INNER JOIN enseignants ens1 ON c1.id_enseignant = ens1.id
INNER JOIN enseignants ens2 ON c2.id_enseignant = ens2.id
WHERE (ens1.id_departement = ? OR ens2.id_departement = ?)
AND c1.jour = c2.jour
AND (c1.id_enseignant = c2.id_enseignant OR c1.id_salle = c2.id_salle OR c1.id_groupe = c2.id_groupe)
AND (c1.heure_debut < c2.heure_fin AND c1.heure_fin > c2.heure_debut);
```

---

## 🎨 Interface Dashboard

### Admin (4 cartes)
1. 🏛️ **Départements** → /departements
2. 👨‍🏫 **Enseignants** → /enseignants
3. 👨‍🎓 **Étudiants** → /etudiants
4. 📚 **Cours** → /cours

### Directeur (6 cartes)
1. 📅 **Emplois du temps** → Créer et modifier
2. ⚠️ **Conflits** (badge rouge si > 0) → Résoudre
3. 👨‍🏫 **Enseignants** → Gérer l'équipe
4. 👨‍🎓 **Étudiants** → Suivi et absences
5. 📚 **Matières & Groupes** → Administration
6. 🏢 **Salles** → Disponibilités

---

## ⚠️ Dépannage

### Problème : Dashboard affiche toujours la vue Admin pour le directeur
**Solution** : 
1. Vérifier que `users.id_departement` est bien rempli
2. Se déconnecter et reconnecter (pour regénérer le JWT)

### Problème : Statistiques à zéro
**Causes** :
- `id_departement` NULL → Exécuter UPDATE users SET id_departement = 1
- Pas de données dans les tables → Ajouter via l'interface
- JWT pas à jour → Se reconnecter

### Problème : Erreur "Unknown column 'g.id_departement'"
**Solution** : ✅ Déjà corrigé ! On utilise maintenant `specialites.id_departement`

---

## 🚀 Vérification finale

```sql
-- 1. Vérifier la structure de users
DESCRIBE users;
-- Doit contenir : id_departement INT

-- 2. Vérifier l'assignation du directeur
SELECT u.login, u.role, u.id_departement, d.nom as departement
FROM users u
LEFT JOIN departements d ON u.id_departement = d.id
WHERE u.role = 'directeur';

-- 3. Tester une requête directeur
SELECT COUNT(*) as total_enseignants
FROM enseignants
WHERE id_departement = 1;  -- Remplacer par l'ID du département
```

Tout est prêt ! 🎉
