# 🖥️ Utiliser le Shell Render (Après Abonnement)

Une fois que vous avez souscrit à l'abonnement Render (7£/mois), vous aurez accès au Shell.

## 📋 Accéder au Shell

1. **Allez sur** : https://dashboard.render.com
2. **Sélectionnez** votre service Django
3. **Cliquez sur** : "Shell" dans le menu de gauche
4. **Ouvrez** le terminal qui s'affiche

## 🎯 Créer un Superutilisateur

Une fois dans le Shell, exécutez ainsi :

```bash
python manage.py createsuperuser
```

Vous serez invité à saisir :
- **Username** : Entrez un nom d'utilisateur (ex: `admin`)
- **Email** : Entrez votre email
- **Password** : Entrez un mot de passe (il ne s'affichera pas)
- **Password (again)** : Retapez le même mot de passe

## ✅ Vérifier

1. Allez sur : `https://partage-recettes-optimisation.onrender.com/admin/`
2. Connectez-vous avec les identifiants que vous venez de créer

## 🔧 Autres Commandes Utiles

### Voir les migrations
```bash
python manage.py showmigrations
```

### Appliquer les migrations
```bash
python manage.py migrate
```

### Ouvrir le shell Django
```bash
python manage.py shell
```

### Collecter les fichiers statiques
```bash
python manage.py collectstatic --noinput
```

---

**Une fois l'abonnement activé, vous pourrez utiliser toutes ces commandes !** ✅
