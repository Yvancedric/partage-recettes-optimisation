#!/usr/bin/env bash
# Script de démarrage alternatif
# Ce script exécute les migrations avant de lancer l'application
# Utilisez ceci comme commande de démarrage si vous préférez exécuter les migrations au démarrage plutôt qu'au build

cd projetdepartage

# Exécuter les migrations
python manage.py migrate --noinput

# Lancer l'application avec Gunicorn
exec gunicorn projetdepartage.wsgi:application
