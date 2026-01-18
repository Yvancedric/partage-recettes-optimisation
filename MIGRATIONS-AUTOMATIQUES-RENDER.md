# Guide : Automatiser les migrations Django sur Render

Ce guide explique comment automatiser les migrations Django lors du déploiement sur Render, évitant ainsi de devoir les exécuter manuellement via le shell.

## 🔧 Solution 1 : Migrations dans le script de build (RECOMMANDÉ)

Cette méthode exécute les migrations pendant le processus de build, avant que l'application ne démarre.

### Configuration

Le fichier `build.sh` a été créé à la racine du projet. Il contient :
- Installation des dépendances
- Collecte des fichiers statiques
- **Exécution automatique des migrations**

### Dans le dashboard Render

1. Allez dans votre service web sur Render
2. Dans l'onglet **Settings**, section **Build & Deploy** :
   - **Build Command** : `chmod +x build.sh && ./build.sh`
   - **Start Command** : `cd projetdepartage && gunicorn projetdepartage.wsgi:application`

### Avantages
- ✅ Migrations exécutées une fois par déploiement
- ✅ L'application démarre avec la base de données à jour
- ✅ Pas besoin d'intervention manuelle

---

## 🔧 Solution 2 : Migrations dans le script de démarrage

Cette méthode exécute les migrations à chaque démarrage de l'application (utile si vous redémarrez souvent).

### Configuration

Le fichier `start.sh` a été créé à la racine du projet.

### Dans le dashboard Render

1. Allez dans votre service web sur Render
2. Dans l'onglet **Settings**, section **Build & Deploy** :
   - **Build Command** : `pip install -r projetdepartage/requirements.txt && cd projetdepartage && python manage.py collectstatic --noinput`
   - **Start Command** : `chmod +x start.sh && ./start.sh`

### Avantages
- ✅ Migrations toujours à jour même après redémarrage
- ✅ Utile si vous modifiez souvent la structure de la base de données

### Inconvénients
- ⚠️ Légèrement plus lent au démarrage (mais négligeable)

---

## 🔧 Solution 3 : Utiliser render.yaml (Configuration par fichier)

Cette méthode utilise un fichier de configuration YAML pour tout configurer en une fois.

### Configuration

Le fichier `render.yaml` a été créé à la racine du projet. Il contient toute la configuration.

### Étapes

1. **Dans le dashboard Render** :
   - Cliquez sur **"New"** → **"Blueprint"**
   - Sélectionnez votre dépôt Git
   - Render détectera automatiquement le fichier `render.yaml`

2. **Ou manuellement** :
   - Configurez votre service avec les mêmes paramètres que dans `render.yaml`

### Variables d'environnement à configurer

Assurez-vous d'avoir configuré dans le dashboard Render :

- `DATABASE_URL` : URL de connexion PostgreSQL (générée automatiquement si vous créez la DB via Render)
- `SECRET_KEY` : Clé secrète Django (générez-en une nouvelle pour la production)
- `DEBUG` : `False` en production
- `ALLOWED_HOSTS` : Votre domaine Render (ex: `votre-app.onrender.com`)

---

## 📝 Commandes utiles

### Tester les migrations localement

```bash
cd projetdepartage
python manage.py migrate --noinput
```

### Créer un superutilisateur après déploiement

Si vous devez créer un superutilisateur, utilisez le shell Render :

1. Dans le dashboard Render → votre service web
2. Cliquez sur **"Shell"**
3. Exécutez :
   ```bash
   cd projetdepartage
   python manage.py createsuperuser
   ```

### Vérifier l'état des migrations

Dans le shell Render :
```bash
cd projetdepartage
python manage.py showmigrations
```

---

## ⚠️ Notes importantes

1. **Variables d'environnement** : Assurez-vous que `DATABASE_URL` est correctement configurée dans Render
2. **SECRET_KEY** : Ne commitez jamais la `SECRET_KEY` dans le code. Utilisez les variables d'environnement Render
3. **Premier déploiement** : Lors du premier déploiement, les migrations créeront automatiquement toutes les tables
4. **Collectstatic** : Le script de build collecte aussi les fichiers statiques pour WhiteNoise

---

## 🚀 Prochaines étapes

1. Choisissez une des solutions ci-dessus
2. Mettez à jour la configuration dans le dashboard Render
3. Déployez votre application
4. Les migrations s'exécuteront automatiquement !

---

## 🔍 Dépannage

### Les migrations ne s'exécutent pas

- Vérifiez que le script `build.sh` a les permissions d'exécution (le `chmod +x` dans le Build Command)
- Vérifiez les logs de build dans Render pour voir les erreurs

### Erreur de connexion à la base de données

- Vérifiez que `DATABASE_URL` est correctement configurée
- Vérifiez que votre base de données PostgreSQL est bien créée et liée au service web

### Erreur de collectstatic

- Assurez-vous que `STATIC_ROOT` est configuré dans `settings.py`
- Vérifiez que WhiteNoise est dans `INSTALLED_APPS`

---

Pour toute question, consultez la [documentation Render](https://render.com/docs).
