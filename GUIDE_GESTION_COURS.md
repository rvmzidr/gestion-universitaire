# Guide de gestion des cours

Ce document résume, rôle par rôle, la manière de planifier, consulter et exploiter les cours dans l'application *Gestion Universitaire*. Il sert de référence fonctionnelle pour l'équipe pédagogique et administrative.

---

## 1. Administrateur

Rôle : gestion globale des emplois du temps et des affectations.

### Accès
- Tableau de bord : `/dashboard`
- Gestion des cours : `/cours`

### Création d'un cours
1. Cliquez sur **« + Planifier un cours »** depuis la page `/cours`.
2. Remplissez le formulaire :
   - *Titre* et *type* (CM, TD, TP, etc.).
   - *Enseignant* : choisissez un enseignant disponible.
   - *Groupe* : sélectionnez un groupe rattaché à la spécialité voulue.
   - *Salle* : indiquez la salle utilisée.
   - *Jour* et *horaires*.
3. Validez ; le système vérifie automatiquement :
   - les conflits d'occupation (enseignant, groupe ou salle).
   - la cohérence de département entre l'enseignant et le groupe (une alerte apparaît si les deux ne correspondent pas).

### Modification ou suppression
- Depuis `/cours`, utilisez les boutons **Modifier** ou **Supprimer** sur la ligne du cours.
- Toute modification repasse par la validation des conflits.

### Bonnes pratiques
- Vérifier que l'enseignant, le groupe et la salle appartiennent au même département pour faciliter la lecture côté directeurs.
- Mettre à jour les groupes et enseignants avant de planifier les cours.

---

## 2. Directeur de département

Rôle : supervision pédagogique limitée à son département.

### Accès
- Tableau de bord filtré : `/dashboard`
- Liste des cours : `/cours` (affiche uniquement les cours de son département).

### Consultation
- La liste montre les cours dont l'enseignant ou le groupe est rattaché à votre département.
- Les colonnes *Spécialité* et *Département* permettent de contrôler rapidement les affectations.
- Aucune action de modification n'est possible : c'est un mode lecture seule.
- En cas d'absence de département configuré sur votre compte, une alerte apparaît ; contactez l'administrateur pour régulariser.

### Utilisation quotidienne
- Vérifier les affectations pour préparer les réunions pédagogiques.
- Repérer rapidement les cours sans salle ou sans enseignant grâce aux libellés « À affecter ».

---

## 3. Enseignant

Rôle : consulter les cours qui lui sont attribués et préparer ses séances.

### Accès recommandé
- Tableau de bord (métriques personnelles si configurées).
- Liste des cours (/cours) pour vérifier ses propres créneaux.

### Bonnes pratiques
- S'assurer auprès de l'administration que les cours programmés correspondent à votre service.
- Signaler tout conflit ou absence de salle à l'administrateur ou au directeur.

> Astuce : la vue `/cours` affiche désormais également la spécialité et le département pour chaque cours, utile pour contrôler vos affectations.

---

## 4. Étudiant

Rôle : suivre l'emploi du temps de son groupe.

### Accès principal
- Page emploi du temps : `/emplois/etudiant` (accessible uniquement après connexion avec un compte étudiant).

### Contenu affiché
- Emploi du temps graphique sur la semaine, uniquement pour le groupe auquel l'étudiant est rattaché.
- Détails des cours : enseignant, salle, horaires.

### Points d'attention
- Si aucune donnée n'apparaît, vérifier que l'étudiant est bien associé à un groupe par l'administrateur.
- Les cours affichés sont automatiquement alignés sur le département correspondant à la spécialité du groupe.

---

## Résumé des droits

| Action                                      | Admin | Directeur | Enseignant | Étudiant |
|---------------------------------------------|:-----:|:---------:|:----------:|:--------:|
| Créer / modifier / supprimer un cours       |  ✅   |    ❌     |     ❌      |    ❌     |
| Voir tous les cours                         |  ✅   |    ❌     |     ❌      |    ❌     |
| Voir les cours de son département           |  ✅   |    ✅     |     ❌      |    ❌     |
| Voir uniquement ses cours / son emploi du temps |  ❌ |    ❌     |     ✅      |    ✅     |

---

## Prochaines étapes techniques (rappel)

1. Vérifier que chaque utilisateur directeur possède un `id_departement` défini.
2. Maintenir la cohérence des affectations (enseignants et groupes liés au même département) pour éviter des vues incomplètes.
3. Documenter les procédures internes (import CSV, création de comptes) en se basant sur ce guide.
