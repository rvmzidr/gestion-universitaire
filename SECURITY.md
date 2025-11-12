# Améliorations de sécurité - Page d'inscription

Ce document décrit les améliorations de sécurité implémentées pour la page d'inscription.

## 1. Liste blanche des rôles (Role Whitelist)

### Description
Une liste blanche prédéfinie contrôle quels rôles peuvent être assignés lors de l'inscription.

### Implémentation
```javascript
const ALLOWED_ROLES = ['etudiant', 'enseignant', 'directeur', 'admin'];
```

### Validation
Le système vérifie que le rôle soumis fait partie de la liste autorisée :
- Si le rôle n'est pas dans la liste → **Erreur : "Rôle invalide"**
- Empêche l'injection de rôles non autorisés via manipulation du formulaire

### Avantages
- ✅ Protection contre la manipulation du paramètre `role`
- ✅ Prévention de l'élévation de privilèges non autorisée
- ✅ Contrôle centralisé des rôles disponibles

## 2. Restriction de création de comptes admin

### Description
Seuls les utilisateurs ayant le rôle `admin` peuvent créer de nouveaux comptes administrateur.

### Règles de sécurité
1. **Utilisateur non connecté** → ❌ Ne peut pas créer de compte admin
2. **Utilisateur connecté (non-admin)** → ❌ Ne peut pas créer de compte admin
3. **Administrateur connecté** → ✅ Peut créer des comptes admin

### Implémentation
```javascript
if (role === 'admin') {
    const isAdmin = req.user && req.user.role === 'admin';
    
    if (!isAdmin) {
        // Refuser la création + Logger la tentative
        return res.render('auth/register', {
            error: 'Seuls les administrateurs peuvent créer des comptes administrateur.'
        });
    }
}
```

### Interface utilisateur
- L'option "Administrateur" n'apparaît dans le menu déroulant **que si** l'utilisateur connecté est admin
- Utilise le middleware `optionalAuth` pour vérifier l'authentification sans forcer la connexion

### Middleware optionalAuth
```javascript
// Vérifie le token JWT s'il existe, mais ne redirige pas si absent
const optionalAuth = (req, res, next) => {
    const token = req.cookies.token || req.session.token;
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
            res.locals.user = decoded;
        } catch (error) {
            req.user = null;
        }
    }
    next();
};
```

## 3. Journalisation (Logging) des tentatives de création admin

### Description
Toutes les tentatives de création de compte administrateur sont enregistrées dans un fichier log.

### Localisation
Fichier : `logs/admin-creation.log`

### Informations enregistrées

#### Tentative échouée
```json
{
  "success": false,
  "attemptedBy": {
    "id": 5,
    "login": "user123",
    "role": "etudiant"
  },
  "targetLogin": "malicious-admin",
  "targetEmail": "hacker@example.com",
  "ip": "192.168.1.100",
  "userAgent": "Mozilla/5.0 ..."
}
```

ou

```json
{
  "success": false,
  "attemptedBy": "anonymous",
  "targetLogin": "admin2",
  "targetEmail": "admin2@example.com",
  "ip": "192.168.1.100",
  "userAgent": "Mozilla/5.0 ..."
}
```

#### Tentative réussie
```json
{
  "success": true,
  "createdBy": {
    "id": 1,
    "login": "admin",
    "role": "admin"
  },
  "newAdminId": 10,
  "newAdminLogin": "admin2",
  "newAdminEmail": "admin2@example.com",
  "ip": "192.168.1.50",
  "userAgent": "Mozilla/5.0 ..."
}
```

### Fonction de logging
```javascript
static logAdminCreationAttempt(data) {
    const logDir = path.join(__dirname, '../logs');
    const logFile = path.join(logDir, 'admin-creation.log');
    
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
    }
    
    const logEntry = `[${new Date().toISOString()}] ${JSON.stringify(data)}\n`;
    fs.appendFileSync(logFile, logEntry);
}
```

### Utilisation des logs
- **Audit de sécurité** : Tracer qui crée des comptes admin
- **Détection d'intrusion** : Identifier les tentatives suspectes
- **Conformité** : Répondre aux exigences réglementaires
- **Investigation** : Analyser les incidents de sécurité

## Flux de sécurité complet

```
┌─────────────────────────────────────────────────────────────┐
│                  Tentative d'inscription                     │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
           ┌──────────────────────┐
           │ Validation du rôle   │
           │ (Liste blanche)      │
           └──────────┬───────────┘
                      │
                      ▼
              ┌───────────────┐
              │ Role == admin?│
              └───────┬───────┘
                      │
            ┌─────────┴─────────┐
            │                   │
           OUI                 NON
            │                   │
            ▼                   ▼
  ┌──────────────────┐   ┌──────────────┐
  │ User est admin?  │   │ Continuer    │
  └────────┬─────────┘   │ inscription  │
           │             └──────────────┘
     ┌─────┴─────┐
     │           │
    OUI         NON
     │           │
     │           ▼
     │    ┌──────────────────┐
     │    │ Logger tentative │
     │    │ (success: false) │
     │    └────────┬─────────┘
     │             │
     │             ▼
     │    ┌──────────────┐
     │    │ Refuser      │
     │    │ + Message    │
     │    └──────────────┘
     │
     ▼
┌─────────────────┐
│ Créer compte    │
│ admin           │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Logger succès   │
│ (success: true) │
└─────────────────┘
```

## Tests recommandés

### 1. Test de la liste blanche
```bash
# Tentative avec un rôle invalide
curl -X POST http://localhost:3000/auth/register \
  -d "nom=Test&prenom=User&email=test@test.com&login=test&password=123&role=superadmin"
# Attendu : Erreur "Rôle invalide"
```

### 2. Test de création admin sans authentification
```bash
# Tentative de création admin en étant déconnecté
curl -X POST http://localhost:3000/auth/register \
  -d "nom=Test&prenom=Admin&email=admin@test.com&login=admin2&password=123&role=admin"
# Attendu : Erreur + Log dans admin-creation.log
```

### 3. Test de création admin par non-admin
1. Se connecter avec un compte étudiant/enseignant
2. Modifier le HTML pour afficher l'option admin
3. Soumettre le formulaire
4. Vérifier : Erreur + Log créé

### 4. Test de création admin par admin
1. Se connecter avec un compte admin
2. Créer un nouveau compte admin via le formulaire
3. Vérifier : Succès + Log créé

## Recommandations supplémentaires

### 1. Rotation des logs
Mettre en place un système de rotation pour éviter que `admin-creation.log` ne devienne trop volumineux.

### 2. Alertes en temps réel
Configurer des alertes pour notifier les administrateurs en cas de tentatives répétées :
```javascript
// Exemple : Envoyer un email après 3 tentatives échouées
```

### 3. Rate limiting
Limiter le nombre de tentatives d'inscription depuis une même IP :
```javascript
const rateLimit = require('express-rate-limit');

const registerLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5 // Max 5 inscriptions
});
```

### 4. Double authentification pour admins
Exiger une 2FA pour les comptes administrateur.

### 5. Analyse des logs
Utiliser des outils comme ELK Stack (Elasticsearch, Logstash, Kibana) pour analyser les logs.

## Conformité et bonnes pratiques

✅ **OWASP Top 10**
- A01:2021 – Broken Access Control → Résolu par restriction admin
- A04:2021 – Insecure Design → Résolu par liste blanche
- A09:2021 – Security Logging and Monitoring → Résolu par logging

✅ **RGPD**
- Les logs contiennent des données personnelles (email, IP)
- Prévoir une politique de rétention des logs
- Informer les utilisateurs dans la politique de confidentialité

✅ **ISO 27001**
- Traçabilité des accès privilégiés
- Contrôle d'accès basé sur les rôles (RBAC)
