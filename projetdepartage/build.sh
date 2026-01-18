#!/bin/bash
set -e

# Installer les dépendances
pip install -r projetdepartage/requirements.txt

# Aller dans le dossier du projet Django
cd projetdepartage || exit 1

# Définir DJANGO_SETTINGS_MODULE
export DJANGO_SETTINGS_MODULE=projetdepartage.settings

# Collecter les fichiers statiques
python manage.py collectstatic --noinput

# Exécuter les migrations
python manage.py migrate --noinput

echo "Build terminé avec succès !"
