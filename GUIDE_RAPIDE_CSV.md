# ⚡ Guide Rapide - Importation CSV

## 🚀 Démarrage en 3 minutes

### Étape 1 : Accéder à la page d'importation
```
1. Se connecter en tant qu'admin
2. Aller sur la page de liste (départements/enseignants/étudiants)
3. Cliquer sur "📥 Importer CSV"
```

### Étape 2 : Préparer le fichier
```
1. Cliquer sur "⬇️ Télécharger le modèle CSV"
2. Ouvrir avec Excel ou LibreOffice
3. Remplir avec vos données
4. Sauvegarder en CSV (UTF-8)
```

### Étape 3 : Importer
```
1. Sélectionner le fichier CSV
2. Cliquer sur "📤 Importer"
3. Vérifier le rapport de succès/erreurs
```

## 📋 Format minimal

### Départements
```csv
nom,description,chef_departement
Informatique,Sciences informatiques,Dr. Dupont
```

### Enseignants
```csv
nom,prenom,email,telephone,specialite,departement
Dupont,Jean,jean.dupont@universite.fr,0123456789,Programmation,Informatique
```

### Étudiants
```csv
nom,prenom,email,numero_etudiant,date_naissance,telephone,adresse,groupe,specialite
Benali,Ahmed,ahmed.benali@etudiant.fr,E2025001,2003-05-15,0612345678,12 Rue de Tunis,Groupe A,Informatique
```

## ⚠️ Points importants

| ❗ Règle | ✅ Exemple valide | ❌ Exemple invalide |
|---------|-------------------|---------------------|
| Colonnes requises | Toutes présentes | Email manquant |
| Email unique | nouveau@email.fr | doublon@email.fr |
| Format date | 2003-05-15 | 15/05/2003 |
| Séparateur | Virgule (,) | Point-virgule (;) |
| Encodage | UTF-8 | ANSI |
| Taille | < 5 MB | > 5 MB |

## 🎯 Ordre d'importation

```
1. Départements  ← Aucun prérequis
2. Enseignants   ← Nécessite départements
3. Étudiants     ← Nécessite groupes + spécialités
```

## 🆘 Erreurs fréquentes

### "Département XXX non trouvé"
→ Créer le département d'abord

### "Email déjà existant"
→ Vérifier les doublons

### "Aucun fichier téléchargé"
→ Sélectionner un fichier

### Caractères bizarres (Ã©, Ã )
→ Utiliser encodage UTF-8

## 📞 Aide

- Guide complet : `GUIDE_IMPORTATION_CSV.md`
- Exemples : `exemples_csv/`
- Documentation technique : `FONCTIONNALITES_CSV.md`

---

**💡 Astuce** : Commencez toujours par un petit fichier de test (2-3 lignes) !
