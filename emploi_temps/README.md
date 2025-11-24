# Emploi du temps

Petite application Express/HBS pour gérer des cours.

Prérequis
- Node.js (v16+ recommandé)
- MySQL en local

Initialisation de la base de données
1. Ouvrez votre client MySQL (shell, Workbench, etc.)
2. Exécutez le fichier `db_init.sql` fourni pour créer la base `classrom` et la table `cours`.

Exemple de commande (PowerShell) :

```powershell
# Se connecter au serveur MySQL local (vous devez avoir mysql dans le PATH)
mysql -u root -p
# puis dans le shell MySQL
SOURCE C:/chemin/vers/projet_chef/emploi_temps/db_init.sql;
```

Démarrer l'application

```powershell
npm install
npm start
```

Si l'application démarre mais ne peut pas se connecter à la base de données, elle ne plantera plus : la page d'accueil affichera un message indiquant que la base est indisponible.

Sprint 3 - fonctionnalités ajoutées
- Backend: gestion complète des cours (CRUD), détection basique des conflits lors de l'ajout.
- API: `/api/cours` renvoie les cours au format JSON utilisable par FullCalendar. Filtrage par `?studentId=...` disponible.
- Frontend: page calendrier (`/calendar`) utilisant FullCalendar; page étudiant (`/etudiant`) pour afficher l'emploi du temps d'un étudiant.
 - Enseignants: page `/enseignant` pour sélectionner un enseignant et afficher son emploi du temps. API supporte `?enseignant=Nom`.

Tester la vue calendrier
1. Démarrez l'app (voir ci-dessus).
2. Ouvrez http://localhost:3002/calendar pour voir tous les cours.
3. Ouvrez http://localhost:3002/etudiant pour sélectionner un étudiant et voir son emploi du temps.

Initialiser la base de données (avec exemples)
Exécutez `db_init.sql` pour créer les tables `cours`, `students`, `inscriptions` et insérer quelques exemples.

Notes
- FullCalendar est chargé via CDN (internet requis pour charger les scripts CSS/JS).
- Si les heures en base ont des secondes (HH:MM:SS), le calendrier affichera correctement les créneaux.
