# 🚀 Guide Complet : Déployer le Frontend sur Vercel

Ce guide vous explique comment déployer votre application React/Vite sur Vercel et la lier avec votre backend Django sur Render.

---

## 📋 Prérequis

1. ✅ Un compte GitHub (votre code doit être sur GitHub)
2. ✅ Un compte Vercel (gratuit) : https://vercel.com
3. ✅ Votre backend Django déployé sur Render et fonctionnel
4. ✅ L'URL de votre API Render (ex: `https://partage-recettes-optimisation.onrender.com`)

---

## 🎯 Étape 1 : Préparer le Projet

### 1.1 Vérifier la Configuration

Assurez-vous que votre `vercel.json` est correct :

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

✅ **C'est déjà configuré dans votre projet !**

---

## 🚀 Étape 2 : Déployer sur Vercel

### Option A : Via le Dashboard Vercel (Recommandé)

1. **Allez sur** : https://vercel.com
2. **Connectez votre compte GitHub** si ce n'est pas déjà fait
3. **Cliquez sur** : "Add New..." → "Project"
4. **Importez votre repository** : `partage-recettes-optimisation`
5. **Configurez le projet** :
   - **Root Directory** : `appderecettes` (important !)
   - **Framework Preset** : Vite (détecté automatiquement)
   - **Build Command** : `npm run build` (déjà configuré)
   - **Output Directory** : `dist` (déjà configuré)

### Option B : Via Vercel CLI

```powershell
# Installer Vercel CLI
npm install -g vercel

# Se connecter
vercel login

# Dans le dossier appderecettes
cd appderecettes
vercel
```

---

## 🔧 Étape 3 : Configurer les Variables d'Environnement

### 3.1 Dans Vercel Dashboard

1. **Allez dans** votre projet sur Vercel
2. **Cliquez sur** : "Settings" → "Environment Variables"
3. **Ajoutez** la variable suivante :

| Variable | Valeur | Environnements |
|----------|--------|----------------|
| `VITE_API_URL` | `https://partage-recettes-optimisation.onrender.com/mes-recettes` | Production, Preview, Development |

**⚠️ Important** : Remplacez `partage-recettes-optimisation.onrender.com` par votre vraie URL Render si elle est différente.

### 3.2 Vérifier l'URL de votre API Render

- Allez sur votre dashboard Render
- Copiez l'URL de votre service Django
- L'URL complète de l'API sera : `https://VOTRE-URL-RENDER.onrender.com/mes-recettes`

---

## 🔗 Étape 4 : Configurer CORS et CSRF sur Render

### 4.1 Ajouter les Variables d'Environnement sur Render

Dans votre dashboard Render, allez dans votre service Django → "Environment" et ajoutez :

| Variable | Valeur |
|----------|--------|
| `CORS_ALLOWED_ORIGINS` | `https://VOTRE-APP-VERCEL.vercel.app` |
| `CSRF_TRUSTED_ORIGINS` | `https://VOTRE-APP-VERCEL.vercel.app` |
| `ALLOWED_HOSTS` | `partage-recettes-optimisation.onrender.com` (votre URL Render) |

**Exemple** :
```
CORS_ALLOWED_ORIGINS=https://partage-recettes-optimisation.vercel.app
CSRF_TRUSTED_ORIGINS=https://partage-recettes-optimisation.vercel.app
```

### 4.2 Redémarrer le Service

Après avoir ajouté les variables, **redémarrez** votre service Render pour que les changements prennent effet.

---

## ✅ Étape 5 : Vérifier le Déploiement

1. **Votre app Vercel** devrait être accessible à : `https://VOTRE-APP.vercel.app`
2. **Testez la connexion** :
   - Ouvrez votre app Vercel
   - Essayez de vous connecter
   - Vérifiez que les requêtes API fonctionnent

---

## 🔄 Étape 6 : Mettre à Jour les URLs OAuth (Optionnel)

Si vous utilisez l'authentification sociale (Google/Facebook), mettez à jour les URLs de redirection :

### 6.1 Dans Render (Variables d'Environnement)

Ajoutez/modifiez :
```
SOCIAL_AUTH_GOOGLE_OAUTH2_REDIRECT_URI=https://VOTRE-URL-RENDER.onrender.com/api/auth/social/callback/
SOCIAL_AUTH_FACEBOOK_REDIRECT_URI=https://VOTRE-URL-RENDER.onrender.com/api/auth/social/callback/
```

### 6.2 Dans Google Cloud Console

1. Allez sur : https://console.cloud.google.com
2. **APIs & Services** → **Credentials**
3. **Modifiez votre OAuth 2.0 Client**
4. **Ajoutez** dans "Authorized redirect URIs" :
   - `https://VOTRE-URL-RENDER.onrender.com/api/auth/social/callback/` 

### 6.3 Dans Facebook Developers

1. Allez sur : https://developers.facebook.com
2. **Settings** → **Basic**
3. **Ajoutez** dans "Valid OAuth Redirect URIs" :
   - `https://VOTRE-URL-RENDER.onrender.com/api/auth/social/callback/`

---

## 🐛 Dépannage

### Erreur CORS

**Symptôme** : `Access to XMLHttpRequest has been blocked by CORS policy`

**Solution** :
1. Vérifiez que `CORS_ALLOWED_ORIGINS` sur Render contient votre URL Vercel
2. Vérifiez que l'URL Vercel est exacte (avec `https://`)
3. Redémarrez le service Render

### Erreur 404 sur les Routes

**Symptôme** : Les pages ne se chargent pas après un refresh

**Solution** : Vérifiez que `vercel.json` contient bien les rewrites pour SPA :
```json
"rewrites": [
  {
    "source": "/(.*)",
    "destination": "/index.html"
  }
]
```

### L'API ne répond pas

**Symptôme** : Les requêtes API échouent

**Solution** :
1. Vérifiez que `VITE_API_URL` est bien configurée sur Vercel
2. Vérifiez que l'URL Render est correcte et accessible
3. Vérifiez les logs Render pour voir les erreurs

---

## 📝 Résumé des URLs

| Service | URL | Usage |
|---------|-----|-------|
| **Frontend Vercel** | `https://VOTRE-APP.vercel.app` | Application React |
| **Backend Render** | `https://VOTRE-APP.onrender.com` | API Django |
| **API Endpoint** | `https://VOTRE-APP.onrender.com/mes-recettes` | Point d'accès API |

---

## 🎉 C'est Terminé !

Votre application est maintenant déployée :
- ✅ Frontend sur Vercel
- ✅ Backend sur Render
- ✅ Les deux sont liés et fonctionnent ensemble

**Prochaine étape** : Une fois l'abonnement Render activé, créez votre superutilisateur via le Shell !

---

## 📚 Ressources

- **Documentation Vercel** : https://vercel.com/docs
- **Documentation Render** : https://render.com/docs
- **Vite + Vercel** : https://vercel.com/docs/frameworks/vite
