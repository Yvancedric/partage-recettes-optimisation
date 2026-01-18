pip install -r requirements.txt
cd projetdepartage
python manage.py collectstatic --noinput
python manage.py migrate --noinput
