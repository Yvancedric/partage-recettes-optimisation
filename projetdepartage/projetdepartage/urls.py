from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import RedirectView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('mes-recettes/', include('mesrecettes.urls')),
    path('api/', include('mesrecettes.urls')),  # Alias pour l'API
    path('auth/', include('social_django.urls', namespace='social')),
    path('', RedirectView.as_view(url='/mes-recettes/', permanent=False)),  # Redirection de la racine
]

# Servir les fichiers média et statiques
# En développement (DEBUG=True), Django sert les fichiers statiques directement
# En production (DEBUG=False), WhiteNoise sert les fichiers statiques
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)