# 🚀 Déploiement Django sur Render - Guide Simple

## 📋 Étapes

### 1. Créer un compte Render
- Allez sur https://render.com
- Cliquez sur "Get Started for Free"
- Connectez-vous avec GitHub

### 2. Créer PostgreSQL
1. Dashboard → "New +" → "PostgreSQL"
2. Nom : `projetdepartage-db`
3. Plan : Free
4. Région : (choisissez)
5. Cliquez sur "Create Database"

### 3. Créer Web Service
1. Dashboard → "New +" → "Web Service"
2. Connectez votre repository GitHub
3. Sélectionnez : `partage-recettes-optimisation`

### 4. Configuration du Service

**Name** : `projetdepartage`

**Root Directory** : `projetdepartage` ⚠️ **IMPORTANT**

**Environment** : `Python 3`

**Build Command** :
```
pip install -r requirements.txt && python manage.py collectstatic --noinput
```

**Start Command** :
```
chmod +x start.sh && ./start.sh
```

**OU** (si le script ne fonctionne pas) :
```
python manage.py migrate --noinput && gunicorn projetdepartage.wsgi:application --bind 0.0.0.0:$PORT
```

**Plan** : Free

### 5. Variables d'Environnement

Dans Settings → Environment, ajoutez :

- `DATABASE_URL` : (créée automatiquement quand vous liez PostgreSQL)
- `DEBUG` : `False`
- `SECRET_KEY` : (générez avec `python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"`)
- `ALLOWED_HOSTS` : `projetdepartage.onrender.com`

### 6. Lier PostgreSQL
- Dans votre Web Service → Settings → Environment
- Cliquez sur "Link Database" ou cherchez dans "Connections"
- Sélectionnez votre base PostgreSQL
- `DATABASE_URL` sera créée automatiquement

### 7. Déployer
- Cliquez sur "Create Web Service"
- Attendez 2-5 minutes
- Votre app sera sur : `https://projetdepartage.onrender.com`

### 8. Exécuter les Migrations ⚠️ **IMPORTANT**

**Avec le plan gratuit, le Shell n'est pas disponible.** Les migrations doivent s'exécuter automatiquement au démarrage.

**Solution** : Utilisez le Start Command modifié ci-dessus qui exécute les migrations avant de démarrer Gunicorn.

**Vérification** : Après le déploiement, vérifiez les logs. Vous devriez voir :
```
Running migrations...
Applying mesrecettes.0001_initial... OK
...
```

### 9. Créer Superutilisateur (Optionnel)

**Problème** : Avec le plan gratuit, vous ne pouvez pas utiliser le Shell pour créer un superutilisateur.

**Solutions alternatives** :

**Option A : Créer via une commande Django personnalisée**
- Créez un script Python qui crée le superutilisateur
- Exécutez-le localement en vous connectant à la base Render

**Option B : Utiliser l'API pour créer un compte**
- Créez un endpoint API temporaire pour créer un admin
- Ou créez un compte via votre frontend

**Option C : Passer au plan payant** (si vous avez besoin du Shell)

---

## ✅ C'est tout !

Votre application Django est maintenant en ligne sur Render ! 🎉

**⚠️ IMPORTANT** : Si vous voyez l'erreur `relation "mesrecettes_user" does not exist`, c'est que les migrations n'ont pas été exécutées. Exécutez `python manage.py migrate` dans le Shell Render.
