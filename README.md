# 🎓 Système de Gestion Universitaire - ISET

## 📋 Table des Matières
1. [Présentation du Projet](#présentation-du-projet)
2. [Technologies Utilisées](#technologies-utilisées)
3. [Architecture du Système](#architecture-du-système)
4. [Fonctionnalités](#fonctionnalités)
5. [Base de Données](#base-de-données)
6. [Gestion des Rôles](#gestion-des-rôles)
7. [Installation et Configuration](#installation-et-configuration)
8. [Structure du Projet](#structure-du-projet)
9. [Diagrammes](#diagrammes)
10. [Captures d'Écran](#captures-décran)

---

## 📝 Présentation du Projet

**Système de Gestion Universitaire** est une application web complète développée pour les Instituts Supérieurs des Études Technologiques (ISET) en Tunisie. Le système permet la gestion intégrale des activités académiques incluant :

- 👨‍🎓 Gestion des étudiants et enseignants
- 📚 Gestion des cours et emplois du temps
- 💯 Gestion des notes et évaluations
- 📊 Gestion des absences
- 📧 Système de messagerie interne
- 🏢 Gestion des départements et spécialités

### 🎯 Objectifs du Projet
- Digitaliser la gestion académique de l'ISET
- Faciliter la communication entre les différents acteurs (admin, directeurs, enseignants, étudiants)
- Automatiser le calcul des moyennes et statistiques
- Offrir un accès sécurisé et personnalisé selon les rôles
- Générer des rapports et bulletins de notes

---

## 💻 Technologies Utilisées

### Backend
- **Node.js** v22.19.0 - Environnement d'exécution JavaScript
- **Express.js** v4.21.1 - Framework web minimaliste
- **MySQL2** v3.11.5 - Client MySQL avec support des Promises
- **JWT** (jsonwebtoken v9.0.2) - Authentification par tokens
- **bcryptjs** v2.4.3 - Hachage sécurisé des mots de passe

### Frontend
- **Handlebars** (express-handlebars v8.0.1) - Moteur de templates
- **CSS3** - Styles personnalisés avec thème sombre
- **JavaScript Vanilla** - Interactivité côté client

### Sécurité & Upload
- **Multer** v1.4.5-lts.1 - Gestion des fichiers uploadés (CSV, documents)
- **Firebase Admin SDK** - Authentification et notifications

### Base de Données
- **MySQL 8.0** - Système de gestion de base de données relationnelle

### Outils de Développement
- **dotenv** v17.2.3 - Gestion des variables d'environnement
- **nodemon** v3.1.9 - Rechargement automatique du serveur
- **npm** - Gestionnaire de paquets

---

## 🏗️ Architecture du Système

### Architecture MVC (Model-View-Controller)

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                     │
│                     HTML + CSS + JavaScript                 │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP Requests
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                      SERVER (Express.js)                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │               Routes (API Endpoints)                 │  │
│  │  /auth | /etudiants | /enseignants | /cours | etc   │  │
│  └───────────────────────┬──────────────────────────────┘  │
│                          │                                  │
│  ┌───────────────────────▼──────────────────────────────┐  │
│  │              Middleware (authMiddleware)             │  │
│  │        JWT Verification + Role-Based Access          │  │
│  └───────────────────────┬──────────────────────────────┘  │
│                          │                                  │
│  ┌───────────────────────▼──────────────────────────────┐  │
│  │                   Controllers                        │  │
│  │  Business Logic & Request Handling                   │  │
│  └───────────────────────┬──────────────────────────────┘  │
│                          │                                  │
│  ┌───────────────────────▼──────────────────────────────┐  │
│  │                      Models                          │  │
│  │  Database Queries & Data Access Layer                │  │
│  └───────────────────────┬──────────────────────────────┘  │
└──────────────────────────┼──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    MySQL Database                           │
│  Tables: utilisateurs, etudiants, enseignants, cours,      │
│          notes, absences, departements, etc.                │
└─────────────────────────────────────────────────────────────┘
```

### Flux d'Authentification

```
1. Utilisateur → Login (email + password)
2. Server → Vérification dans BD (bcrypt.compare)
3. Server → Génération JWT Token (contient: id, email, role)
4. Server → Retour Token au Client
5. Client → Stockage Token (localStorage)
6. Client → Envoi Token dans chaque requête (Authorization Header)
7. Server → Vérification Token (authMiddleware)
8. Server → Autorisation selon le rôle (checkRole)
```

---

## ⚙️ Fonctionnalités

### 🔐 Authentification & Sécurité
- ✅ Connexion sécurisée (JWT)
- ✅ Hachage des mots de passe (bcrypt)
- ✅ Gestion des sessions
- ✅ Protection des routes selon les rôles
- ✅ Déconnexion automatique

### 👥 Gestion des Utilisateurs
- ✅ Création et modification des comptes
- ✅ 4 rôles: Admin, Directeur, Enseignant, Étudiant
- ✅ Profils personnalisés
- ✅ Importation CSV en masse

### 👨‍🎓 Gestion des Étudiants
- ✅ Inscription des étudiants
- ✅ Association aux groupes et spécialités
- ✅ Consultation du dossier étudiant
- ✅ Importation CSV (masse)
- ✅ Modification et suppression

### 👨‍🏫 Gestion des Enseignants
- ✅ Ajout des enseignants
- ✅ Association aux départements
- ✅ Attribution des cours
- ✅ Importation CSV
- ✅ Gestion des informations personnelles

### 📚 Gestion des Cours
- ✅ Création de cours (CM, TD, TP, Atelier, Examen)
- ✅ Attribution des enseignants et groupes
- ✅ Réservation des salles
- ✅ Définition des horaires
- ✅ Détection des conflits horaires
- ✅ Modification et suppression

### 📅 Emploi du Temps
- ✅ Visualisation par jour de la semaine
- ✅ Emploi du temps par rôle:
  - Admin: Vue globale
  - Directeur: Vue département
  - Enseignant: Ses cours
  - Étudiant: Son groupe
- ✅ Affichage des salles et horaires
- ✅ Interface responsive mobile

### 💯 Gestion des Notes
- ✅ Saisie des notes par l'enseignant
- ✅ Types d'évaluation: DS, CC, TP, Examen, Projet, Oral
- ✅ Gestion des coefficients (0.5 à 5)
- ✅ Calcul automatique des moyennes pondérées
- ✅ Bulletin de notes pour les étudiants
- ✅ Statistiques par cours:
  - Nombre d'étudiants évalués
  - Moyenne générale
  - Note minimale et maximale
  - Classement des étudiants
- ✅ Filtrage par semestre et année universitaire
- ✅ Gestion des semestres (S1, S2)

### 📊 Gestion des Absences
- ✅ Enregistrement des absences par cours
- ✅ Statuts: Absent, Présent, Retard, Justifié
- ✅ Upload de justificatifs
- ✅ Statistiques d'assiduité
- ✅ Consultation par étudiant
- ✅ Filtrage par date et cours

### 📧 Messagerie Interne
- ✅ Envoi de messages entre utilisateurs
- ✅ Boîte de réception
- ✅ Notifications en temps réel
- ✅ Historique des conversations

### 🏢 Gestion des Départements
- ✅ Création de départements
- ✅ Attribution des directeurs
- ✅ Gestion des spécialités
- ✅ Importation CSV
- ✅ Statistiques par département

### 📈 Dashboard & Statistiques
- ✅ Tableau de bord personnalisé par rôle
- ✅ Statistiques en temps réel:
  - Nombre d'utilisateurs
  - Cours actifs
  - Notes enregistrées
  - Absences du jour
- ✅ Graphiques et visualisations
- ✅ Accès rapide aux fonctionnalités

---

## 🗄️ Base de Données

### Schéma de la Base de Données

La base de données **gestion_universitaire** contient **12 tables principales** et **3 vues** :

#### Tables Principales

1. **utilisateurs** (32 enregistrements)
   - Gestion centralisée des comptes
   - Champs: id, nom, prenom, email, login, mdp_hash, role, id_departement, actif
   - 4 rôles: admin, directeur, enseignant, etudiant

2. **departements** (4 enregistrements)
   - Informatique, Génie Électrique, Génie Mécanique, Génie Civil
   - Champs: id, nom, description, code

3. **etudiants** (20 enregistrements)
   - Informations des étudiants
   - Champs: id, nom, prenom, email, cin, date_naissance, id_groupe, id_specialite, id_utilisateur

4. **enseignants** (13 enregistrements)
   - Informations des enseignants
   - Champs: id, nom, prenom, email, telephone, id_departement, id_utilisateur

5. **cours** (20 enregistrements)
   - Planning des cours
   - Champs: id, titre, type_cours, description, id_enseignant, id_groupe, id_salle, jour, heure_debut, heure_fin
   - Types: cm, td, tp, atelier, examen

6. **notes** (9 enregistrements)
   - Évaluations des étudiants
   - Champs: id, id_etudiant, id_cours, type_evaluation, note, coefficient, date_evaluation, semestre, annee_universitaire, remarque, id_enseignant
   - Types évaluation: ds, cc, tp, examen, projet, oral

7. **absences** (3 enregistrements)
   - Suivi des présences
   - Champs: id, id_etudiant, id_cours, date_absence, statut, motif, justificatif, remarque, id_enseignant
   - Statuts: absent, present, retard, justifie

8. **groupes** (36 enregistrements)
   - Organisation des classes
   - Champs: id, nom, code, type, id_specialite, id_niveau

9. **salles** (13 enregistrements)
   - Gestion des locaux
   - Champs: id, code, nom, type, capacite, etage, batiment

10. **specialites** (11 enregistrements)
    - DSI, RI, AI, EI, BAT, TOP, etc.
    - Champs: id, nom, code, id_departement

11. **niveaux** (3 enregistrements)
    - 1ère année, 2ème année, 3ème année
    - Champs: id, nom, id_specialite

12. **matieres** (15 enregistrements)
    - Catalogue des matières
    - Champs: id, nom, code, id_niveau, id_enseignant, coefficient, nb_heures

#### Vues SQL

- **vue_bulletin_etudiant**: Bulletin complet avec moyennes
- **vue_moyennes_etudiants**: Calculs des moyennes par semestre
- **vue_statistiques_cours**: Statistiques agrégées par cours

### Relations Entre Tables

```
utilisateurs (1) ──< (N) etudiants
utilisateurs (1) ──< (N) enseignants

departements (1) ──< (N) utilisateurs
departements (1) ──< (N) enseignants
departements (1) ──< (N) specialites

specialites (1) ──< (N) niveaux
specialites (1) ──< (N) groupes

niveaux (1) ──< (N) groupes
niveaux (1) ──< (N) matieres

groupes (1) ──< (N) etudiants
groupes (1) ──< (N) cours

enseignants (1) ──< (N) cours
enseignants (1) ──< (N) notes
enseignants (1) ──< (N) absences
enseignants (1) ──< (N) matieres

etudiants (1) ──< (N) notes
etudiants (1) ──< (N) absences

cours (1) ──< (N) notes
cours (1) ──< (N) absences

salles (1) ──< (N) cours
```

---

## 👤 Gestion des Rôles

### 1️⃣ ADMIN (Administrateur Système)

**Accès**: Vue globale de tout le système

**Permissions**:
- ✅ Gestion complète des utilisateurs
- ✅ Création/modification/suppression de tous les départements
- ✅ Consultation de tous les cours, notes, absences
- ✅ Accès aux statistiques globales
- ✅ Importation CSV en masse
- ✅ Gestion des conflits horaires
- ✅ Configuration système

**Fonctionnalités Dashboard**:
- Vue d'ensemble du système
- Statistiques globales
- Gestion des départements
- Consultation des notes (lecture seule)
- Emploi du temps global

---

### 2️⃣ DIRECTEUR (Directeur de Département)

**Accès**: Limité à son département

**Permissions**:
- ✅ Gestion des enseignants de son département
- ✅ Gestion des étudiants de son département
- ✅ Consultation des cours du département
- ✅ Consultation des notes du département
- ✅ Statistiques du département
- ✅ Gestion des spécialités
- ✅ Emploi du temps du département

**Fonctionnalités Dashboard**:
- Statistiques département
- Gestion enseignants
- Gestion étudiants
- Notes du département (lecture seule)
- Emploi du temps département
- Absences département

---

### 3️⃣ ENSEIGNANT (Professeur)

**Accès**: Limité à ses cours et ses étudiants

**Permissions**:
- ✅ Consultation de ses cours
- ✅ **Saisie et modification des notes** de ses étudiants
- ✅ **Gestion des absences** dans ses cours
- ✅ Consultation de la liste de ses étudiants
- ✅ Statistiques de ses cours
- ✅ Emploi du temps personnel
- ✅ Messagerie

**Fonctionnalités Dashboard**:
- Mes cours
- **Saisir les notes** (création, modification, suppression)
- **Gérer les absences**
- Statistiques de mes cours
- Mon emploi du temps
- Liste de mes étudiants

**Gestion des Notes**:
- Ajouter une note: Sélectionner cours → Cocher étudiants → Type évaluation → Note/Coefficient
- Modifier une note: Uniquement ses propres notes
- Supprimer une note: Uniquement ses propres notes
- Consulter statistiques: Moyenne, min, max, classement

---

### 4️⃣ ÉTUDIANT

**Accès**: Consultation de ses propres données uniquement

**Permissions**:
- ✅ Consultation de **ses notes** et moyennes
- ✅ **Bulletin de notes** avec calcul automatique des moyennes
- ✅ Consultation de ses absences
- ✅ Emploi du temps de son groupe
- ✅ Consultation de ses cours
- ✅ Messagerie
- ❌ Aucune modification possible

**Fonctionnalités Dashboard**:
- **Mes notes** avec moyennes par cours
- **Bulletin** avec moyenne générale
- Mes absences
- Mon emploi du temps
- Mes cours

**Bulletin de Notes**:
- Filtrage par semestre et année
- Affichage par cours:
  - Nom du cours
  - Détails des évaluations: "ds:15.5(1) | cc:14(2) | examen:16(3)"
  - Moyenne du cours
- **Moyenne générale** calculée automatiquement
- Badge: Admis (≥10) / Non admis (<10)

---

## 🚀 Installation et Configuration

### Prérequis
```bash
- Node.js v22.19.0 ou supérieur
- MySQL 8.0 ou supérieur
- npm (Node Package Manager)
```

### Étape 1: Cloner le Projet
```bash
git clone https://github.com/rvmzidr/gestion-universitaire.git
cd gestion-universitaire
```

### Étape 2: Installer les Dépendances
```bash
npm install
```

### Étape 3: Configuration de la Base de Données

1. Créer la base de données MySQL:
```sql
CREATE DATABASE gestion_universitaire CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. Exécuter les scripts SQL dans l'ordre:
```bash
# 1. Création des tables de base
mysql -u root -p gestion_universitaire < database/create_cours_table.sql

# 2. Création de la table absences
mysql -u root -p gestion_universitaire < database/create_absences_table.sql

# 3. Création de la table notes
node database/setup_notes.js

# 4. Insertion des données de test
mysql -u root -p gestion_universitaire < database/insert_admin_dridi.sql
mysql -u root -p gestion_universitaire < database/insert_nouveaux_utilisateurs.sql
```

### Étape 4: Configuration de l'Environnement

Créer un fichier `.env` à la racine:
```env
# Base de données
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=votre_mot_de_passe
DB_NAME=gestion_universitaire
DB_PORT=3306

# Serveur
PORT=3000
NODE_ENV=development

# JWT Secret (générer une clé aléatoire sécurisée)
JWT_SECRET=votre_secret_jwt_tres_securise_ici

# Firebase (optionnel)
FIREBASE_PROJECT_ID=votre_project_id
FIREBASE_CLIENT_EMAIL=votre_email
```

### Étape 5: Démarrer le Serveur

**Mode Développement** (avec auto-reload):
```bash
npm run dev
```

**Mode Production**:
```bash
npm start
```

Le serveur démarre sur: **http://localhost:3000**

### Étape 6: Comptes de Test

**Admin**:
- Email: `ramzi.dridi@iset.tn`
- Login: `admin`

**Directeur Informatique**:
- Email: `hafsi@gmail.com`

**Enseignant**:
- Email: `mohamed.benali@iset.tn`

**Étudiant**:
- Email: `youssef.mansour@etudiant.tn`

*Note: Consultez `database/update_passwords.sql` pour les mots de passe*

---

## 📁 Structure du Projet

```
gestion_universitaire/
│
├── config/
│   ├── database.js          # Configuration MySQL
│   └── firebaseAdmin.js     # Configuration Firebase
│
├── controllers/
│   ├── authController.js        # Authentification
│   ├── dashboardController.js   # Tableau de bord
│   ├── etudiantController.js    # Gestion étudiants
│   ├── enseignantController.js  # Gestion enseignants
│   ├── coursController.js       # Gestion cours
│   ├── noteController.js        # Gestion notes ⭐
│   ├── absenceController.js     # Gestion absences
│   ├── departementController.js # Gestion départements
│   ├── emploiController.js      # Emploi du temps
│   └── messageController.js     # Messagerie
│
├── models/
│   ├── user.js              # Modèle Utilisateur
│   ├── Etudiant.js          # Modèle Étudiant
│   ├── Enseignant.js        # Modèle Enseignant
│   ├── Cours.js             # Modèle Cours
│   ├── Note.js              # Modèle Note ⭐
│   ├── Absence.js           # Modèle Absence
│   ├── Departement.js       # Modèle Département
│   ├── Groupe.js            # Modèle Groupe
│   └── Salle.js             # Modèle Salle
│
├── routes/
│   ├── auth.js              # Routes authentification
│   ├── dashboard.js         # Routes dashboard
│   ├── etudiants.js         # Routes étudiants
│   ├── enseignants.js       # Routes enseignants
│   ├── cours.js             # Routes cours
│   ├── notes.js             # Routes notes ⭐
│   ├── absences.js          # Routes absences
│   ├── departements.js      # Routes départements
│   ├── emplois.js           # Routes emploi du temps
│   └── messages.js          # Routes messagerie
│
├── middleware/
│   ├── authMiddleware.js    # Vérification JWT
│   └── uploadMiddleware.js  # Upload fichiers
│
├── views/
│   ├── layouts/
│   │   └── main.hbs         # Layout principal avec sidebar
│   │
│   ├── auth/
│   │   ├── login.hbs        # Page connexion
│   │   ├── register.hbs     # Page inscription
│   │   └── profile.hbs      # Page profil
│   │
│   ├── dashboard/
│   │   └── index.hbs        # Tableau de bord
│   │
│   ├── etudiants/
│   │   ├── list.hbs         # Liste étudiants
│   │   ├── create.hbs       # Ajouter étudiant
│   │   ├── edit.hbs         # Modifier étudiant
│   │   └── import.hbs       # Import CSV
│   │
│   ├── enseignants/
│   │   ├── list.hbs         # Liste enseignants
│   │   ├── create.hbs       # Ajouter enseignant
│   │   └── import.hbs       # Import CSV
│   │
│   ├── cours/
│   │   ├── list.hbs         # Liste cours
│   │   ├── create.hbs       # Ajouter cours
│   │   └── edit.hbs         # Modifier cours
│   │
│   ├── notes/               # ⭐ Système de Notes
│   │   ├── list.hbs         # Liste notes (enseignant)
│   │   ├── create.hbs       # Ajouter note
│   │   ├── edit.hbs         # Modifier note
│   │   ├── student.hbs      # Bulletin étudiant
│   │   └── statistics.hbs   # Statistiques cours
│   │
│   ├── absences/
│   │   ├── list.hbs         # Liste absences
│   │   ├── create.hbs       # Ajouter absence
│   │   ├── edit.hbs         # Modifier absence
│   │   ├── student.hbs      # Absences étudiant
│   │   └── statistics.hbs   # Statistiques assiduité
│   │
│   ├── emplois/
│   │   ├── admin.hbs        # Emploi admin/directeur
│   │   └── etudiant.hbs     # Emploi étudiant/enseignant
│   │
│   ├── departements/
│   │   ├── list.hbs         # Liste départements
│   │   ├── create.hbs       # Ajouter département
│   │   ├── edit.hbs         # Modifier département
│   │   └── import.hbs       # Import CSV
│   │
│   └── messages/
│       └── inbox.hbs        # Boîte de réception
│
├── public/
│   ├── css/
│   │   └── style.css        # Styles (thème sombre)
│   │
│   └── js/
│       ├── theme.js         # Gestion thème
│       ├── firebase-init.js # Init Firebase
│       └── etudiants-form.js # Scripts formulaires
│
├── database/
│   ├── create_cours_table.sql      # Table cours
│   ├── create_absences_table.sql   # Table absences
│   ├── create_notes_table.sql      # Table notes
│   ├── setup_notes.js              # Script création notes
│   ├── insert_admin_dridi.sql      # Admin initial
│   └── README_NOTES.md             # Doc système notes
│
├── exemples_csv/
│   ├── etudiants_exemple.csv       # Format import étudiants
│   ├── enseignants_exemple.csv     # Format import enseignants
│   └── departements_exemple.csv    # Format import départements
│
├── uploads/                 # Fichiers uploadés (CSV, justificatifs)
├── logs/                    # Logs système
│
├── server.js                # Point d'entrée application
├── package.json             # Dépendances npm
├── .env                     # Variables environnement
├── .gitignore              # Fichiers ignorés Git
│
└── Documentation/
    ├── CONFIG_ADMIN_DIRECTEUR.md
    ├── ROLES_ADMIN_DIRECTEUR.md
    ├── GUIDE_GESTION_COURS.md
    ├── GUIDE_IMPORTATION_CSV.md
    ├── FONCTIONNALITES_CSV.md
    ├── README_NOTES.md
    ├── SECURITY.md
    └── TESTS_SECURITE.md
```

---

## 📊 Diagrammes

### 1. Diagramme de Cas d'Utilisation

```
                    Système de Gestion Universitaire
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  ┌──────────────┐                                              │
│  │    ADMIN     │──┐                                           │
│  └──────────────┘  │                                           │
│        │            │                                           │
│        │            ├── Gérer Départements                     │
│        │            ├── Gérer Tous les Utilisateurs            │
│        │            ├── Consulter Toutes les Notes             │
│        │            ├── Voir Statistiques Globales             │
│        │            └── Gérer Conflits Horaires                │
│        │                                                        │
│  ┌──────────────┐                                              │
│  │  DIRECTEUR   │──┐                                           │
│  └──────────────┘  │                                           │
│        │            ├── Gérer Enseignants Département          │
│        │            ├── Gérer Étudiants Département            │
│        │            ├── Consulter Notes Département            │
│        │            └── Voir Statistiques Département          │
│        │                                                        │
│  ┌──────────────┐                                              │
│  │ ENSEIGNANT   │──┐                                           │
│  └──────────────┘  │                                           │
│        │            ├── Saisir Notes ⭐                        │
│        │            ├── Modifier/Supprimer Ses Notes ⭐        │
│        │            ├── Gérer Absences                         │
│        │            ├── Consulter Ses Cours                    │
│        │            ├── Voir Statistiques Cours                │
│        │            └── Consulter Emploi du Temps              │
│        │                                                        │
│  ┌──────────────┐                                              │
│  │  ÉTUDIANT    │──┐                                           │
│  └──────────────┘  │                                           │
│        │            ├── Consulter Ses Notes ⭐                 │
│        │            ├── Voir Bulletin ⭐                       │
│        │            ├── Consulter Ses Absences                 │
│        │            ├── Voir Emploi du Temps                   │
│        │            └── Consulter Ses Cours                    │
│        │                                                        │
│  ┌──────────────┐                                              │
│  │  TOUS ROLES  │──┐                                           │
│  └──────────────┘  │                                           │
│                    ├── Se Connecter/Déconnecter               │
│                    ├── Gérer Profil                            │
│                    ├── Messagerie Interne                      │
│                    └── Tableau de Bord Personnalisé            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 2. Diagramme de Séquence - Saisie de Notes

```
Enseignant    Interface    Controller    Model Note    Base de Données
    │              │             │             │               │
    │──Login──────>│             │             │               │
    │              │──JWT────────>│             │               │
    │              │<─Token──────│             │               │
    │              │             │             │               │
    │──Accéder─────>│             │             │               │
    │   Notes      │             │             │               │
    │              │──Vérif──────>│             │               │
    │              │   Token     │             │               │
    │              │<─OK─────────│             │               │
    │              │             │             │               │
    │──Sélectionner>│             │             │               │
    │   Cours      │─getCoursEns─>│─findAll────>│──SELECT───────>│
    │              │             │             │               │
    │              │<─Liste cours│<─Résultats──│<─Cours────────│
    │<─Affichage───│             │             │               │
    │              │             │             │               │
    │──Charger─────>│             │             │               │
    │  Étudiants   │─getEtudiants>│─findByCours>│──SELECT───────>│
    │              │             │             │               │
    │              │<─Liste étud.│<─Résultats──│<─Étudiants────│
    │<─Affichage───│             │             │               │
    │              │             │             │               │
    │──Saisir──────>│             │             │               │
    │  Note(s)     │─create()────>│─create()────>│──INSERT───────>│
    │  + Type      │             │             │               │
    │  + Coef      │─Vérifier────>│─exists()────>│──SELECT───────>│
    │              │  doublons   │             │               │
    │              │<─Non────────│<─false──────│<──────────────│
    │              │             │             │               │
    │              │─Calculer────>│─calculate───>│──UPDATE───────>│
    │              │  moyennes   │  Moyenne()  │  moyennes     │
    │              │             │             │               │
    │              │<─Succès─────│<─ID note────│<─OK───────────│
    │<─Confirmation│             │             │               │
    │              │             │             │               │
```

### 3. Diagramme de Classe Principal

```
┌─────────────────────────┐
│    Utilisateur          │
├─────────────────────────┤
│ - id: int               │
│ - nom: string           │
│ - prenom: string        │
│ - email: string         │
│ - mdp_hash: string      │
│ - role: enum            │
│ - id_departement: int   │
├─────────────────────────┤
│ + login()               │
│ + logout()              │
│ + updateProfile()       │
└────────┬────────────────┘
         │ hérite
    ┌────┴────┬──────────┬──────────┐
    │         │          │          │
┌───▼────┐ ┌──▼──────┐ ┌▼────────┐ ┌▼────────┐
│ Admin  │ │Directeur│ │Enseignant│ │Étudiant │
└────────┘ └─────────┘ └─────┬────┘ └───┬─────┘
                              │          │
                              │          │
┌─────────────────────────────▼──────────▼──────┐
│             Note                               │
├────────────────────────────────────────────────┤
│ - id: int                                      │
│ - id_etudiant: int (FK)                        │
│ - id_cours: int (FK)                           │
│ - type_evaluation: enum                        │
│ - note: decimal(5,2)                           │
│ - coefficient: decimal(3,2)                    │
│ - date_evaluation: date                        │
│ - semestre: enum                               │
│ - annee_universitaire: string                  │
│ - id_enseignant: int (FK)                      │
├────────────────────────────────────────────────┤
│ + create()                                     │
│ + update()                                     │
│ + delete()                                     │
│ + calculateMoyenne()                           │
│ + getBulletin()                                │
│ + getStatistiques()                            │
│ + getClassement()                              │
└────────────────────────────────────────────────┘
         │                        │
         │ 1..N                   │ 1..N
         │                        │
┌────────▼────────┐      ┌────────▼────────┐
│    Cours        │      │   Étudiant      │
├─────────────────┤      ├─────────────────┤
│ - id: int       │      │ - id: int       │
│ - titre: string │      │ - cin: string   │
│ - type: enum    │      │ - id_groupe: int│
│ - jour: enum    │      └─────────────────┘
│ - heure: time   │
└─────────────────┘
```

### 4. Diagramme Entité-Association (ERD)

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│ DEPARTEMENT  │ 1───N │ ENSEIGNANT   │ 1───N │    COURS     │
│              │       │              │       │              │
│ PK: id       │       │ PK: id       │       │ PK: id       │
│    nom       │       │    nom       │       │    titre     │
│    code      │       │    email     │       │    type_cours│
└──────┬───────┘       │ FK: id_dept  │       │ FK: id_ens   │
       │               └──────────────┘       │ FK: id_groupe│
       │ 1                                    │ FK: id_salle │
       │                                      └──────┬───────┘
       │ N                                           │
┌──────▼───────┐                                     │ N
│ SPECIALITE   │                                     │
│              │                                     │ 1
│ PK: id       │       ┌──────────────┐       ┌─────▼────────┐
│    nom       │ 1───N │   GROUPE     │ N───1 │   ÉTUDIANT   │
│    code      │       │              │       │              │
│ FK: id_dept  │       │ PK: id       │       │ PK: id       │
└──────┬───────┘       │    nom       │       │    cin       │
       │               │ FK: id_spec  │       │    email     │
       │ 1             │ FK: id_niveau│       │ FK: id_groupe│
       │               └──────────────┘       │ FK: id_spec  │
       │ N                                    └──────┬───────┘
┌──────▼───────┐                                     │
│   NIVEAU     │                                     │ 1
│              │                                     │
│ PK: id       │                                     │ N
│    nom       │       ┌──────────────────────┐     │
│ FK: id_spec  │       │        NOTE          │◄────┘
└──────────────┘       │                      │
                       │ PK: id               │
                       │ FK: id_etudiant      │
                       │ FK: id_cours         │
                       │ FK: id_enseignant    │
┌──────────────┐       │    type_evaluation   │
│    SALLE     │       │    note              │
│              │       │    coefficient       │
│ PK: id       │       │    semestre          │
│    code      │       │    annee_univ        │
│    capacite  │       └──────────────────────┘
└──────────────┘
```

### 5. Diagramme d'État - Cycle de Vie d'une Note

```
          ┌─────────────┐
          │   Début     │
          └──────┬──────┘
                 │
                 ▼
    ┌────────────────────────┐
    │  Enseignant sélectionne│
    │      un cours          │
    └────────────┬───────────┘
                 │
                 ▼
    ┌────────────────────────┐
    │  Charge liste étudiants│
    └────────────┬───────────┘
                 │
                 ▼
    ┌────────────────────────┐
    │  Saisit note + coef    │
    └────────────┬───────────┘
                 │
                 ▼
    ┌────────────────────────┐
    │  Validation (0-20)     │
    └────────┬────────┬──────┘
             │        │
         NON │        │ OUI
             │        ▼
             │   ┌─────────────┐
             │   │Note Enregistrée│
             │   └────────┬────┘
             │            │
             │            ▼
             │   ┌─────────────────┐
             │   │ Calcul Moyenne  │
             │   └────────┬────────┘
             │            │
             │            ▼
             │   ┌─────────────────┐
             │   │   Note Active   │◄──┐
             │   └────────┬────────┘   │
             │            │             │
             │      ┌─────┴─────┐       │
             │      │           │       │
             │      ▼           ▼       │
             │  ┌────────┐  ┌───────┐  │
             │  │Modifier│  │Consulter│─┘
             │  └───┬────┘  └───────┘
             │      │
             │      ▼
             │  ┌────────────┐
             │  │ Validation │
             │  └──────┬─────┘
             │         │ OUI
             │         ▼
             │  ┌─────────────┐
             │  │Note Modifiée│
             │  └──────┬──────┘
             │         │
             └─────────┼───────────┐
                       │           │
                       ▼           ▼
                  ┌─────────┐  ┌────────┐
                  │Supprimer│  │Archiver│
                  └────┬────┘  └────┬───┘
                       │            │
                       ▼            ▼
                  ┌──────────────────┐
                  │   Note Supprimée │
                  └──────────────────┘
```

---

## 📸 Captures d'Écran

### Interface Principale

#### 1. Page de Connexion
- Design moderne avec gradient bleu
- Champs email et mot de passe
- Bouton "Se connecter"
- Lien vers inscription

#### 2. Tableau de Bord (Dashboard)
**Pour chaque rôle, affichage de:**
- Statistiques en cartes (nombre d'utilisateurs, cours, notes, absences)
- Menu latéral gauche (sidebar) avec navigation
- Barre supérieure avec logo et info utilisateur
- Cartes d'accès rapide aux fonctionnalités

#### 3. Gestion des Notes (Enseignant)
- **Liste des notes**: Tableau avec filtres (semestre, année, cours, type)
- **Ajouter une note**:
  - Dropdown: Sélection du cours
  - Liste checkboxes: Étudiants à évaluer
  - Champs: Type évaluation, Note (0-20), Coefficient (0.5-5), Date
  - Bouton "Enregistrer"
- **Statistiques cours**:
  - Cartes: Nombre étudiants, Moyenne, Min, Max
  - Tableau classement avec rang et moyennes

#### 4. Bulletin de Notes (Étudiant)
- Filtres: Semestre et Année universitaire
- Carte **Moyenne Générale** avec badge Admis/Non admis
- Cartes par cours:
  - Nom du cours
  - Détails évaluations: "ds:15.5(1) | cc:14(2) | examen:16(3)"
  - Moyenne du cours
  - Badge couleur selon performance

#### 5. Emploi du Temps
- Vue hebdomadaire (Lundi à Samedi)
- Cartes par cours avec:
  - Heure (08:00 - 10:00)
  - Titre du cours
  - Type (CM/TD/TP)
  - Salle
  - Enseignant/Groupe

#### 6. Sidebar Navigation
- Hamburger menu en haut à gauche
- Thème sombre (gradient bleu)
- Sections par rôle:
  - Dashboard
  - Messagerie
  - Départements
  - Enseignants
  - Étudiants
  - Cours
  - Emploi du temps
  - **Notes** ⭐
  - **Absences**
  - Conflits

---

## 🔒 Sécurité

### Mesures de Sécurité Implémentées

1. **Authentification JWT**
   - Token sécurisé avec expiration
   - Stockage côté client (localStorage)
   - Vérification à chaque requête

2. **Hachage des Mots de Passe**
   - bcrypt avec salt rounds = 10
   - Jamais de stockage en clair

3. **Protection des Routes**
   - Middleware `authMiddleware` sur toutes les routes sensibles
   - Middleware `checkRole` pour les permissions
   - Validation des rôles côté serveur

4. **Validation des Données**
   - Validation côté serveur (contrôleurs)
   - Validation côté client (JavaScript)
   - Protection contre injections SQL (requêtes paramétrées)

5. **Gestion des Fichiers**
   - Validation des types de fichiers (CSV uniquement)
   - Limitation de la taille des uploads
   - Stockage sécurisé dans /uploads

6. **Protection CSRF**
   - Tokens CSRF sur les formulaires sensibles
   - Vérification de l'origine des requêtes

---

## 📈 Formules de Calcul

### Calcul de la Moyenne Pondérée (par cours)

```
Moyenne_Cours = Σ(Note_i × Coefficient_i) / Σ(Coefficient_i)

Exemple:
DS: 15 × 1 = 15
CC: 14 × 2 = 28
Examen: 16 × 3 = 48
─────────────────
Total: 91
Coefficients: 1 + 2 + 3 = 6
Moyenne = 91 / 6 = 15.17
```

### Calcul de la Moyenne Générale (semestre)

```
Moyenne_Générale = Σ(Moyenne_Cours_i) / Nombre_de_Cours

Exemple:
Cours 1: 15.17
Cours 2: 13.50
Cours 3: 16.00
─────────────────
Total: 44.67
Nombre cours: 3
Moyenne Générale = 44.67 / 3 = 14.89
```

### Admission

```
SI Moyenne_Générale ≥ 10 ALORS
    Statut = "Admis"
SINON
    Statut = "Non admis"
FIN SI
```

---

## 🧪 Tests et Validation

### Tests Manuels Effectués

✅ **Authentification**
- Connexion avec différents rôles
- Vérification tokens JWT
- Déconnexion

✅ **Gestion des Notes**
- Ajout de notes par enseignant
- Modification/suppression
- Calcul des moyennes
- Affichage bulletin étudiant
- Statistiques cours

✅ **Gestion des Cours**
- Création de cours
- Détection conflits horaires
- Assignation enseignants/groupes

✅ **Gestion des Absences**
- Enregistrement absences
- Upload justificatifs
- Statistiques assiduité

✅ **Emploi du Temps**
- Affichage par rôle
- Vue responsive mobile

✅ **Importation CSV**
- Import étudiants
- Import enseignants
- Import départements

---

## 📚 Documentation Complémentaire

### Fichiers de Documentation

- **CONFIG_ADMIN_DIRECTEUR.md**: Configuration des rôles Admin et Directeur
- **ROLES_ADMIN_DIRECTEUR.md**: Détails des permissions
- **GUIDE_GESTION_COURS.md**: Guide d'utilisation gestion des cours
- **GUIDE_IMPORTATION_CSV.md**: Guide import CSV
- **FONCTIONNALITES_CSV.md**: Fonctionnalités d'importation
- **README_NOTES.md**: Documentation système de notes
- **SECURITY.md**: Mesures de sécurité
- **TESTS_SECURITE.md**: Tests de sécurité effectués

---

## 🚧 Améliorations Futures

### Fonctionnalités à Ajouter

1. **Export PDF**
   - Bulletin de notes en PDF
   - Attestations de scolarité
   - Emplois du temps imprimables

2. **Notifications**
   - Emails automatiques (nouvelles notes, absences)
   - Notifications push (Firebase)
   - Alertes SMS

3. **Statistiques Avancées**
   - Graphiques interactifs (Chart.js)
   - Comparaisons inter-semestres
   - Tableaux de bord analytiques

4. **Gestion Documentaire**
   - Upload de documents (syllabus, supports de cours)
   - Bibliothèque de ressources
   - Partage de fichiers

5. **Planning Automatique**
   - Génération automatique d'emplois du temps
   - Optimisation des salles
   - Détection intelligente des conflits

6. **Application Mobile**
   - Application Android/iOS
   - Synchronisation en temps réel
   - Mode hors ligne

7. **Visioconférence**
   - Intégration Zoom/Teams
   - Cours en ligne
   - Enregistrement des sessions

---

## 🤝 Contributeurs

- **Ramzi Dridi** - Développeur Principal
- **Équipe ISET** - Tests et Validation

---

## 📞 Contact et Support

**Email**: ramzi.dridi@iset.tn  
**GitHub**: https://github.com/rvmzidr/gestion-universitaire  
**Documentation**: Voir dossier `/documentation`

---

## 📄 Licence

Ce projet est développé pour l'ISET dans le cadre d'un projet académique.  
Tous droits réservés © 2025 ISET Tunisie

---

## 📌 Notes Importantes

### Pour le Rapport

**Sections à Inclure**:
1. **Introduction**: Contexte et problématique
2. **Analyse des Besoins**: Interviews, questionnaires
3. **Conception**: Diagrammes UML (cas d'utilisation, séquence, classe, ERD)
4. **Technologies**: Justification des choix technologiques
5. **Implémentation**: Architecture MVC, structure du code
6. **Tests**: Résultats des tests fonctionnels
7. **Déploiement**: Procédure d'installation
8. **Conclusion**: Bilan et perspectives

### Pour la Présentation

**Slides Suggérés** (15-20 minutes):
1. Page de titre
2. Plan de la présentation
3. Contexte et problématique
4. Objectifs du projet
5. Architecture système (diagramme)
6. Technologies utilisées
7. Fonctionnalités principales (captures d'écran)
8. **Démonstration système de notes** ⭐ (Live demo)
9. Base de données (ERD)
10. Sécurité implémentée
11. Tests et validation
12. Difficultés rencontrées
13. Améliorations futures
14. Conclusion
15. Questions/Réponses

### Conseils Présentation

- **Durée**: 15-20 minutes + 5-10 min questions
- **Démonstration Live**: Préparer un scénario complet
  1. Connexion enseignant
  2. Ajout de notes pour plusieurs étudiants
  3. Consultation statistiques
  4. Connexion étudiant
  5. Visualisation bulletin avec moyennes
- **Supports**: PowerPoint/Google Slides + application en direct
- **Backup**: Captures d'écran au cas où problème technique

---

## 🎯 Points Forts du Projet

1. ✅ **Architecture MVC** bien structurée
2. ✅ **Système de rôles** complet et sécurisé
3. ✅ **Gestion des notes** avec calculs automatiques
4. ✅ **Interface responsive** adaptée mobile
5. ✅ **Importation CSV** en masse
6. ✅ **Base de données** bien normalisée
7. ✅ **Sécurité** JWT + bcrypt
8. ✅ **Documentation** complète
9. ✅ **Code propre** et commenté
10. ✅ **Fonctionnel** et déployable

---

**Dernière mise à jour**: 21 Novembre 2025  
**Version**: 1.0.0  
**Statut**: Production Ready ✅
