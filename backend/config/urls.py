from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),  # Panel de administración
    path('api/', include('core.urls')),  # ← Esto conecta las rutas de la app `core`
]