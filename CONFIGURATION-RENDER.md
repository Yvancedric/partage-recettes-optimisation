# Configuration Render - Migrations Automatiques

## ⚠️ PROBLÈME RENCONTRÉ

Render ne trouve pas le fichier `build.sh` car il n'est pas dans le dépôt Git.

## ✅ SOLUTION IMMÉDIATE (Sans fichier build.sh)

Configurez directement dans le dashboard Render :

### 1. Allez dans votre service web sur Render
### 2. Onglet **Settings** → Section **Build & Deploy**

#### Build Command :
```bash
pip install -r projetdepartage/requirements.txt && cd projetdepartage && python manage.py collectstatic --noinput && python manage.py migrate --noinput
```

#### Start Command :
```bash
cd projetdepartage && gunicorn projetdepartage.wsgi:application
```

### Explication des commandes :

1. **`pip install -r projetdepartage/requirements.txt`** : Installe toutes les dépendances
2. **`cd projetdepartage`** : Se déplace dans le dossier du projet Django
3. **`python manage.py collectstatic --noinput`** : Collecte les fichiers statiques (CSS, JS, images) pour WhiteNoise
4. **`python manage.py migrate --noinput`** : ⭐ Exécute les migrations automatiquement
5. **`gunicorn projetdepartage.wsgi:application`** : Lance le serveur web

---

## ✅ SOLUTION ALTERNATIVE (Avec fichier build.sh)

Si vous préférez utiliser un fichier `build.sh`, vous devez :

### 1. S'assurer que build.sh est dans Git

Vérifiez que le fichier `build.sh` est bien dans votre dépôt Git :

```bash
git status
git add build.sh
git commit -m "Ajout du script de build pour Render"
git push
```

### 2. Vérifier que build.sh n'est pas dans .gitignore

Assurez-vous que `.gitignore` n'ignore pas les fichiers `.sh` :

```bash
# Ne pas mettre ceci dans .gitignore :
# *.sh
```

### 3. Configurer Render

Dans le dashboard Render :

#### Build Command :
```bash
chmod +x build.sh && ./build.sh
```

#### Start Command :
```bash
cd projetdepartage && gunicorn projetdepartage.wsgi:application
```

---

## 📝 Vérification

Après configuration, lors du prochain déploiement, vous devriez voir dans les logs :

```
==> Installing dependencies...
==> Collecting static files...
==> Running migrations...
==> Build succeeded!
```

Et les migrations s'exécuteront automatiquement sans intervention manuelle.

---

## 🔍 Dépannage

### Si les migrations ne s'exécutent pas :

1. Vérifiez les logs de build dans Render
2. Vérifiez que `DATABASE_URL` est correctement configurée dans les variables d'environnement
3. Vérifiez que le chemin vers `manage.py` est correct (ici : `projetdepartage/`)

### Si vous avez une erreur de chemin :

Ajustez les chemins dans les commandes selon la structure de votre projet :
- Si `manage.py` est à la racine : `python manage.py migrate`
- Si `manage.py` est dans `projetdepartage/` : `cd projetdepartage && python manage.py migrate`

---

## 🚀 Après configuration

Une fois configuré, les migrations s'exécuteront automatiquement à chaque déploiement !

Plus besoin d'utiliser le shell Render manuellement. 🎉
