from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from core.views.manufacturer_views import ManufacturerViewSet
from core.views.user_views import UserViewSet
from core.views.size_views import SizeViewSet
from core.views.status_views import StatusViewSet
from core.views.component_type_views import ComponentTypeViewSet
from core.views.model_views import ModelViewSet
from core.views.component_views import ComponentViewSet
from core.views.rig_views import RigViewSet
from core.views.rigging_type_views import RiggingTypeViewSet
from core.views.rigging_views import RiggingViewSet

# Definir el router y registrar los ViewSets
router = DefaultRouter()
router.register(r'users', UserViewSet)
#router.register(r'roles', RoleViewSet)
router.register(r'manufacturers', ManufacturerViewSet)
router.register(r'sizes', SizeViewSet)
router.register(r'statuses', StatusViewSet)
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