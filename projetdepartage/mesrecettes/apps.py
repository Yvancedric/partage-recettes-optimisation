from django.apps import AppConfig


class MesrecettesConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'mesrecettes'

    def ready(self):
        import mesrecettes.signals  # Import des signals pour activer les handlers
