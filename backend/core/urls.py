from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from core.views import (
    UserViewSet, RoleViewSet, ManufacturerViewSet, SizeViewSet,
    StatusViewSet, ComponentTypeViewSet, ModelViewSet, ComponentViewSet,
    RigViewSet, RiggingTypeViewSet, RiggingViewSet
)

# Definir el router y registrar los ViewSets
router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'roles', RoleViewSet)
router.register(r'manufacturers', ManufacturerViewSet)
router.register(r'sizes', SizeViewSet)
router.register(r'status', StatusViewSet)
router.register(r'component_types', ComponentTypeViewSet)
router.register(r'models', ModelViewSet)
router.register(r'components', ComponentViewSet)
router.register(r'rigs', RigViewSet)
router.register(r'rigging_types', RiggingTypeViewSet)
router.register(r'riggings', RiggingViewSet)

# Unificar urlpatterns en una sola lista
urlpatterns = [
    path('admin/', admin.site.urls),  # Panel de administración de Django
    path('', include(router.urls)),  # Endpoints de la API
]