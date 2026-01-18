"""
Middleware personnalisé pour désactiver CSRF pour les endpoints API REST
tout en le gardant pour l'admin Django
"""
from django.utils.deprecation import MiddlewareMixin


class DisableCSRFForAPI(MiddlewareMixin):
    """
    Désactive la vérification CSRF pour les endpoints API REST
    car ils utilisent JWT pour l'authentification
    """
    
    def process_request(self, request):
        # Désactiver CSRF pour les endpoints API
        if request.path.startswith('/mes-recettes/') or request.path.startswith('/api/'):
            setattr(request, '_dont_enforce_csrf_checks', True)
        return None
