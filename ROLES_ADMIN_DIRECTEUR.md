# 🔐 Différences entre Admin et Directeur

## 👑 ADMINISTRATEUR (admin)
**Portée** : Vue globale de toute l'université

### Dashboard
- ✅ Nombre total de **tous les départements**
- ✅ Nombre total de **tous les enseignants**
- ✅ Nombre total de **tous les étudiants**
- ✅ Nombre total de **tous les cours**
- 📊 Répartition des étudiants par **tous les départements**
- 📈 Cours par **tous les enseignants**
- 📉 Évolution des inscriptions (6 derniers mois)

### Permissions
- ✅ **Créer/modifier/supprimer** les départements
- ✅ **Créer/modifier/supprimer** les enseignants (tous)
- ✅ **Créer/modifier/supprimer** les étudiants (tous)
- ✅ **Créer/modifier/supprimer** les cours (tous)
- ✅ **Gérer** tous les emplois du temps
- ✅ **Accès** à toutes les statistiques
- ✅ **Administrer** les utilisateurs et rôles

---

## 🎓 DIRECTEUR DE DÉPARTEMENT (directeur)
**Portée** : Vue limitée à son département uniquement

### Dashboard
- ✅ Nombre d'enseignants **de son département**
- ✅ Nombre d'étudiants **de son département**
- ✅ Nombre de cours **de son département**
- ⚠️ Nombre de **conflits en attente** (emplois du temps)
- 📊 Répartition des étudiants par **groupes de son département**
- 📈 Charge de travail **des enseignants de son département**

### Permissions spécifiques
- 📅 **Créer et modifier** les emplois du temps de son département
- ⚠️ **Valider** les propositions d'emplois du temps
- ⚠️ **Résoudre** les conflits d'horaires
- 📊 **Accéder** au tableau de bord (absences, occupation des salles)
- 👨‍🎓 **Consulter** la performance des étudiants
- 🔄 **Gérer** les rattrapages et ajustements
- 📚 **Administrer** les matières et groupes de son département
- 🏢 **Consulter** la disponibilité des salles

### Restrictions
- ❌ **NE PEUT PAS** gérer d'autres départements
- ❌ **NE PEUT PAS** créer/supprimer des départements
- ❌ **NE PEUT PAS** voir les données d'autres départements
- ❌ **NE PEUT PAS** administrer les utilisateurs

---

## 🔧 Configuration technique

### Base de données
```sql
-- Ajouter id_departement à la table users
ALTER TABLE users 
ADD COLUMN id_departement INT DEFAULT NULL;

-- Lier le directeur à son département
UPDATE users 
SET id_departement = 1  -- ID du département
WHERE role = 'directeur' AND email = 'directeur@iset.tn';
```

### Contrôle d'accès dans le code
```javascript
// Admin : accès global
if (req.user.role === 'admin') {
    // Requêtes sans filtre de département
    db.query('SELECT * FROM enseignants');
}

// Directeur : accès filtré
if (req.user.role === 'directeur') {
    const idDept = req.user.id_departement;
    // Requêtes filtrées par département
    db.query('SELECT * FROM enseignants WHERE id_departement = ?', [idDept]);
}
```

---

## 📋 Fonctionnalités à implémenter

### Pour le Directeur
- [ ] Page "Conflits" dédiée avec liste des chevauchements
- [ ] Page "Rattrapages" pour planifier des sessions
- [ ] Page "Absences" avec suivi par étudiant/cours
- [ ] Page "Salles" avec calendrier d'occupation
- [ ] Validation d'emplois du temps (workflow)
- [ ] Statistiques de performance des étudiants
- [ ] Notifications de conflits automatiques

### Cartes d'accès rapide (Dashboard Directeur)
1. **📅 Emplois du temps** - Créer et modifier
2. **⚠️ Conflits** - Résoudre les chevauchements (badge rouge si > 0)
3. **👨‍🏫 Enseignants** - Gérer son équipe
4. **👨‍🎓 Étudiants** - Suivi et absences
5. **📚 Matières & Groupes** - Administration
6. **🏢 Salles** - Disponibilités

---

## 🎨 Interface utilisateur

### Admin
- Couleur principale : **Bleu** 🔵
- Icône : 👑 Couronne
- Navigation : Accès complet au menu

### Directeur
- Couleur principale : **Violet** 🟣
- Icône : 🎓 Mortier
- Navigation : Menu filtré (pas de "Départements")
- Badge "Département : [Nom]" visible dans le header

---

## 📊 Exemples de statistiques

### Admin voit
```
Départements : 5
Enseignants : 120
Étudiants : 1500
Cours : 450
```

### Directeur (Informatique) voit
```
Enseignants : 25 (de son département)
Étudiants : 300 (inscrits dans ses groupes)
Cours : 90 (planifiés pour son département)
Conflits : 3 (à résoudre)
```
