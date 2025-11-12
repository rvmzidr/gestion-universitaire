# Tests de sécurité - Page d'inscription

Ce document décrit les scénarios de test pour valider les améliorations de sécurité.

## Prérequis

1. Serveur démarré : `node server.js`
2. Base de données configurée et accessible
3. Au moins un compte admin existant dans la base de données

## Scénario 1 : Validation de la liste blanche des rôles

### Objectif
Vérifier que seuls les rôles autorisés peuvent être utilisés lors de l'inscription.

### Étapes
1. Ouvrir la page d'inscription : http://localhost:3000/auth/register
2. Ouvrir les outils de développement (F12)
3. Dans la console, exécuter :
   ```javascript
   // Ajouter une option non autorisée
   const select = document.getElementById('role');
   const option = document.createElement('option');
   option.value = 'superadmin';
   option.text = 'Super Administrateur';
   select.add(option);
   ```
4. Sélectionner "Super Administrateur"
5. Remplir les autres champs et soumettre

### Résultat attendu
✅ Message d'erreur : "Rôle invalide. Veuillez sélectionner un rôle valide."

### Résultat réel
[ ] Conforme  
[ ] Non conforme

---

## Scénario 2 : Création de compte admin sans authentification

### Objectif
Vérifier qu'un utilisateur non connecté ne peut pas créer de compte administrateur.

### Étapes
1. S'assurer d'être déconnecté (vider les cookies si nécessaire)
2. Ouvrir la page d'inscription : http://localhost:3000/auth/register
3. Observer le menu déroulant "Rôle"

### Résultat attendu
✅ L'option "Administrateur" n'apparaît PAS dans la liste

### Si on manipule le HTML pour ajouter l'option admin
4. Ouvrir la console (F12) et exécuter :
   ```javascript
   const select = document.getElementById('role');
   const option = document.createElement('option');
   option.value = 'admin';
   option.text = 'Administrateur';
   select.add(option);
   ```
5. Sélectionner "Administrateur"
6. Remplir les champs et soumettre

### Résultat attendu
✅ Message d'erreur : "Seuls les administrateurs peuvent créer des comptes administrateur."
✅ Un log est créé dans `logs/admin-creation.log` avec `"success": false` et `"attemptedBy": "anonymous"`

### Résultat réel
[ ] Conforme  
[ ] Non conforme

---

## Scénario 3 : Création de compte admin par un non-admin

### Objectif
Vérifier qu'un utilisateur connecté mais non-admin ne peut pas créer de compte administrateur.

### Étapes
1. Se connecter avec un compte étudiant, enseignant ou directeur
2. Naviguer vers la page d'inscription : http://localhost:3000/auth/register
3. Observer le menu déroulant "Rôle"

### Résultat attendu
✅ L'option "Administrateur" n'apparaît PAS dans la liste

### Si on manipule le HTML pour ajouter l'option admin
4. Suivre les mêmes étapes que le scénario 2 pour ajouter l'option
5. Soumettre le formulaire

### Résultat attendu
✅ Message d'erreur : "Seuls les administrateurs peuvent créer des comptes administrateur."
✅ Un log est créé dans `logs/admin-creation.log` avec :
   - `"success": false`
   - `"attemptedBy"` contient les informations de l'utilisateur connecté (id, login, role)

### Exemple de log attendu
```json
[2025-10-19T10:30:00.000Z] {"success":false,"attemptedBy":{"id":5,"login":"etudiant1","role":"etudiant"},"targetLogin":"admin2","targetEmail":"admin2@test.com","ip":"::1","userAgent":"Mozilla/5.0..."}
```

### Résultat réel
[ ] Conforme  
[ ] Non conforme

---

## Scénario 4 : Création de compte admin par un admin (Succès)

### Objectif
Vérifier qu'un administrateur peut créer un nouveau compte administrateur.

### Étapes
1. Se connecter avec un compte administrateur
2. Naviguer vers la page d'inscription : http://localhost:3000/auth/register
3. Observer le menu déroulant "Rôle"

### Résultat attendu
✅ L'option "Administrateur" APPARAÎT dans la liste

### Création du compte
4. Remplir tous les champs :
   - Nom : "Test"
   - Prénom : "Admin"
   - Email : "testadmin@example.com"
   - Login : "testadmin"
   - Mot de passe : "SecurePass123!"
   - Rôle : "Administrateur"
5. Soumettre le formulaire

### Résultat attendu
✅ Redirection vers la page de connexion avec succès
✅ Le compte est créé dans la base de données
✅ Un log est créé dans `logs/admin-creation.log` avec :
   - `"success": true`
   - `"createdBy"` contient les informations de l'admin créateur
   - `"newAdminId"` contient l'ID du nouveau compte
   - `"newAdminLogin"` contient le login du nouveau compte

### Exemple de log attendu
```json
[2025-10-19T10:35:00.000Z] {"success":true,"createdBy":{"id":1,"login":"admin","role":"admin"},"newAdminId":10,"newAdminLogin":"testadmin","newAdminEmail":"testadmin@example.com","ip":"::1","userAgent":"Mozilla/5.0..."}
```

### Vérification
6. Se connecter avec le nouveau compte admin
7. Vérifier que le compte fonctionne correctement

### Résultat réel
[ ] Conforme  
[ ] Non conforme

---

## Scénario 5 : Vérification des logs

### Objectif
Vérifier que tous les logs sont correctement enregistrés et lisibles.

### Étapes
1. Après avoir effectué les scénarios 2, 3 et 4
2. Ouvrir le fichier `logs/admin-creation.log`
3. Vérifier la présence de plusieurs entrées

### Résultat attendu
✅ Le fichier existe
✅ Chaque ligne commence par une date ISO 8601 entre crochets
✅ Chaque ligne contient un objet JSON valide
✅ Les tentatives échouées ont `"success": false`
✅ Les tentatives réussies ont `"success": true`
✅ Toutes les tentatives contiennent : ip, userAgent, targetLogin, targetEmail

### Commande pour vérifier le format
```powershell
# Windows PowerShell
Get-Content logs\admin-creation.log | ForEach-Object { 
    if ($_ -match '^\[(.*?)\] (.+)$') {
        $date = $matches[1]
        $json = $matches[2]
        Write-Host "Date: $date"
        $json | ConvertFrom-Json | ConvertTo-Json -Depth 5
    }
}
```

### Résultat réel
[ ] Conforme  
[ ] Non conforme

---

## Scénario 6 : Test de régression - Inscription normale

### Objectif
Vérifier que les utilisateurs normaux peuvent toujours s'inscrire sans problème.

### Étapes
1. Se déconnecter (ou utiliser une session privée)
2. Accéder à la page d'inscription
3. Remplir le formulaire avec un rôle non-admin :
   - Nom : "Jean"
   - Prénom : "Dupont"
   - Email : "jean.dupont@example.com"
   - Login : "jdupont"
   - Mot de passe : "Password123!"
   - Rôle : "Étudiant"
4. Soumettre le formulaire

### Résultat attendu
✅ Redirection vers la page de connexion avec succès
✅ Le compte est créé dans la base de données
✅ AUCUN log dans `admin-creation.log` (car rôle != admin)
✅ Possibilité de se connecter avec le nouveau compte

### Résultat réel
[ ] Conforme  
[ ] Non conforme

---

## Scénario 7 : Test de sécurité - Injection de paramètres

### Objectif
Vérifier la protection contre l'injection de paramètres via des requêtes POST directes.

### Étapes (utiliser Postman, curl ou un outil similaire)

#### Test 1 : Rôle non autorisé
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "nom=Test&prenom=User&email=test@test.com&login=test123&password=pass123&role=superuser"
```

**Résultat attendu** : Erreur "Rôle invalide"

#### Test 2 : Tentative de création admin sans auth
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "nom=Hacker&prenom=Evil&email=hacker@test.com&login=hacker&password=pass123&role=admin"
```

**Résultat attendu** : 
- Erreur "Seuls les administrateurs peuvent créer des comptes administrateur"
- Log créé avec attemptedBy: "anonymous"

#### Test 3 : Création admin avec cookie de session étudiant
```bash
# D'abord se connecter en tant qu'étudiant pour récupérer le cookie
# Puis utiliser ce cookie pour tenter de créer un admin
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -H "Cookie: token=<token_etudiant>" \
  -d "nom=Admin&prenom=Malicious&email=bad@test.com&login=badmin&password=pass123&role=admin"
```

**Résultat attendu** : 
- Erreur "Seuls les administrateurs peuvent créer des comptes administrateur"
- Log créé avec attemptedBy contenant les infos de l'étudiant

### Résultat réel
[ ] Conforme  
[ ] Non conforme

---

## Checklist finale

- [ ] Tous les scénarios ont été testés
- [ ] La liste blanche fonctionne correctement
- [ ] Les non-admins ne peuvent pas créer d'admins
- [ ] Les admins peuvent créer d'autres admins
- [ ] Tous les logs sont enregistrés correctement
- [ ] Les inscriptions normales fonctionnent toujours
- [ ] Aucune régression n'a été détectée

## Nettoyage après les tests

```sql
-- Supprimer les comptes de test créés
DELETE FROM utilisateurs WHERE login IN ('testadmin', 'jdupont', 'test123', 'hacker', 'badmin');
```

```powershell
# Archiver les logs de test
Move-Item logs\admin-creation.log logs\admin-creation-test-backup.log
```

## Problèmes connus / Notes

- [ ] Aucun problème détecté
- [ ] Problèmes à résoudre :
  ```
  [Décrire ici les problèmes rencontrés]
  ```
