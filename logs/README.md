# Logs de sécurité

Ce dossier contient les fichiers de logs de sécurité de l'application.

## admin-creation.log

Ce fichier enregistre toutes les tentatives de création de comptes administrateur :
- **Tentatives réussies** : quand un admin crée un nouveau compte admin
- **Tentatives échouées** : quand un utilisateur non-admin essaie de créer un compte admin

### Format des logs

Chaque entrée contient :
- Date et heure (ISO 8601)
- Statut de la tentative (success: true/false)
- Informations sur l'utilisateur qui tente la création
- Informations sur le compte à créer
- Adresse IP
- User-Agent du navigateur

### Exemples

```json
[2025-10-19T10:30:00.000Z] {"success":false,"attemptedBy":"anonymous","targetLogin":"admin2","targetEmail":"admin2@example.com","ip":"127.0.0.1","userAgent":"Mozilla/5.0..."}

[2025-10-19T10:35:00.000Z] {"success":true,"createdBy":{"id":1,"login":"admin","role":"admin"},"newAdminId":5,"newAdminLogin":"admin2","newAdminEmail":"admin2@example.com","ip":"127.0.0.1","userAgent":"Mozilla/5.0..."}
```

## Recommandations

- Consulter régulièrement ces logs pour détecter les tentatives suspectes
- Mettre en place une rotation des logs pour éviter qu'ils ne deviennent trop volumineux
- Considérer l'utilisation d'un système de monitoring pour alerter en cas de tentatives répétées
