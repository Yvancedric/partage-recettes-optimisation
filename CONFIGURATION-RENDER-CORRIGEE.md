# Configuration Render - Commandes Corrigées

## 🔧 Configuration Render Dashboard

### Build Command (CORRIGÉ) :

```bash
cd projetdepartage && pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate --noinput
```

### Start Command :

```bash
cd projetdepartage && gunicorn projetdepartage.wsgi:application
```

---

## 📝 Explication de la correction

**Problème** : Le chemin `projetdepartage/requirements.txt` ne fonctionnait pas.

**Solution** : D'abord se déplacer dans le dossier `projetdepartage` avec `cd projetdepartage`, puis utiliser les chemins relatifs.

### Ordre des commandes :

1. **`cd projetdepartage`** : Se déplace dans le dossier du projet Django (où se trouve `manage.py` et `requirements.txt`)
2. **`pip install -r requirements.txt`** : Installe les dépendances (chemin relatif depuis `projetdepartage/`)
3. **`python manage.py collectstatic --noinput`** : Collecte les fichiers statiques
4. **`python manage.py migrate --noinput`** : ⭐ Exécute les migrations automatiquement
5. **`gunicorn projetdepartage.wsgi:application`** : Lance le serveur (le module `projetdepartage` est au même niveau)

---

## ✅ Vérification

Après avoir mis à jour ces commandes dans Render, lors du prochain déploiement :

1. Render se déplacera dans `projetdepartage/`
2. Installera les dépendances depuis `requirements.txt`
3. Collectera les fichiers statiques
4. **Exécutera les migrations automatiquement** ✅
5. Lancera l'application

---

## 🚨 Alternative si cela ne fonctionne toujours pas

Si le chemin ne fonctionne toujours pas, essayez cette variante :

### Build Command (Alternative) :

```bash
pip install -r ./projetdepartage/requirements.txt && cd projetdepartage && python manage.py collectstatic --noinput && python manage.py migrate --noinput
```

Ou si `requirements.txt` est à la racine du dépôt Git :

### Build Command (Si requirements.txt est à la racine) :

```bash
pip install -r requirements.txt && cd projetdepartage && python manage.py collectstatic --noinput && python manage.py migrate --noinput
```

---

## 📍 Pour vérifier où est requirements.txt dans votre dépôt Git

Dans votre dépôt GitHub, vérifiez la structure :
- Si `requirements.txt` est dans `projetdepartage/` → Utilisez la **première solution**
- Si `requirements.txt` est à la racine → Utilisez la **solution alternative**

---

## 🔍 Structure attendue

```
partage-recettes-optimisation/
├── projetdepartage/
│   ├── manage.py
│   ├── requirements.txt  ← ICI
│   ├── projetdepartage/
│   │   ├── settings.py
│   │   ├── wsgi.py
│   │   └── ...
│   └── mesrecettes/
│       └── ...
└── ...
```

Si c'est votre structure, utilisez les commandes corrigées ci-dessus ! ✅
