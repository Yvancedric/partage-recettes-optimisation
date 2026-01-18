# 🔧 Exécuter les Migrations sur Render

## Problème

L'erreur `relation "mesrecettes_user" does not exist` signifie que les migrations n'ont pas été exécutées sur la base de données PostgreSQL de Render.

## ✅ Solution : Exécuter les Migrations

### Méthode 1 : Via le Shell Render (Recommandé)

1. **Dans votre Web Service Render**, allez dans l'onglet **"Shell"** (menu de gauche)

2. **Cliquez sur** : **"Open Shell"** ou **"Connect"**

3. **Une fenêtre de terminal** s'ouvrira

4. **Exécutez cette commande** :
```bash
python manage.py migrate
```

5. **Vous devriez voir** :
```
Operations to perform:
  Apply all migrations: admin, auth, contenttypes, mesrecettes, sessions, ...
Running migrations:
  Applying mesrecettes.0001_initial... OK
  Applying mesrecettes.0002_alter_recipe_estimated_cost... OK
  ...
```

6. **Une fois terminé**, essayez d'accéder à `/admin/` à nouveau

### Méthode 2 : Ajouter les Migrations au Build Command

Si vous voulez que les migrations s'exécutent automatiquement à chaque déploiement :

1. **Dans votre Web Service**, allez dans **Settings** → **Build & Deploy**

2. **Modifiez le Build Command** pour inclure les migrations :
```
pip install -r requirements.txt && python manage.py migrate --noinput && python manage.py collectstatic --noinput
```

3. **Sauvegardez** et **redéployez**

---

## ✅ Vérification

Après avoir exécuté les migrations, vérifiez :

1. **Allez sur** : `https://votre-app.onrender.com/admin/`
2. **Vous devriez voir** la page de connexion (sans erreur)
3. **Connectez-vous** avec votre superutilisateur

---

## 🆘 Si ça ne fonctionne toujours pas

### Vérifier que la base de données est bien liée

1. **Settings** → **Environment**
2. **Vérifiez** que `DATABASE_URL` existe
3. Si elle n'existe pas, **liez votre base PostgreSQL** :
   - Dans "Connections" ou "Linked Resources"
   - Cliquez sur "Link Database"
   - Sélectionnez votre base PostgreSQL

### Vérifier les logs

Dans l'onglet **"Logs"**, vérifiez qu'il n'y a pas d'autres erreurs.

---

**Exécutez simplement `python manage.py migrate` dans le Shell Render et le problème sera résolu !** ✅
