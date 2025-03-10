from rest_framework import viewsets, status
from rest_framework.response import Response
from core.models import ComponentType
from core.serializers import ComponentTypeSerializer
from rest_framework.permissions import IsAuthenticated

class ComponentTypeViewSet(viewsets.ModelViewSet):
    queryset = ComponentType.objects.all()
    serializer_class = ComponentTypeSerializer
    permission_classes = [IsAuthenticated]  # Solo usuarios autenticados pueden acceder

    def list(self, request, *args, **kwargs):
        """GET /api/component_types/ → Listar todos los tipos de componentes"""
        print(f"🔹 Usuario autenticado: {request.user}")
        if not request.user.is_authenticated:
            print("❌ No autenticado en /api/component_types")
            return Response({"error": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)

        return super().list(request, *args, **kwargs)

    def create(self, request, *args, **kwargs):
        """POST /api/component_types/ → Agregar un nuevo tipo de componente sin duplicados"""
        component_type_name = request.data.get("component_type", "").strip()

        if ComponentType.objects.filter(component_type__iexact=component_type_name).exists():
            return Response(
                {"error": "Este tipo de componente ya existe."},
                status=status.HTTP_400_BAD_REQUEST
            )

        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        """PUT /api/component_types/{id}/ → Evitar actualizar con un tipo de componente duplicado"""
        component_type_instance = self.get_object()
        component_type_name = request.data.get("component_type", "").strip()

        if ComponentType.objects.filter(component_type__iexact=component_type_name).exclude(id=component_type_instance.id).exists():
            return Response(
                {"error": "Este tipo de componente ya existe."},
                status=status.HTTP_400_BAD_REQUEST
            )

        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        """DELETE /api/component_types/{id}/ → Eliminar un tipo de componente"""
        return super().destroy(request, *args, **kwargs)
