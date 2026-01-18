#!/usr/bin/env bash
# Script de build pour Render
# Ce script est exécuté lors du build de l'application sur Render

# Installer les dépendances
pip install -r projetdepartage/requirements.txt

# Collecter les fichiers statiques
cd projetdepartage
python manage.py collectstatic --noinput

# Exécuter les migrations
python manage.py migrate --noinput

# Revenir au répertoire racine
cd ..

echo "Build terminé avec succès !"
