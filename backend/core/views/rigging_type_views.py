from rest_framework import viewsets, status
from rest_framework.response import Response
from core.models import RiggingType
from core.serializers import RiggingTypeSerializer
from rest_framework.permissions import IsAuthenticated

class RiggingTypeViewSet(viewsets.ModelViewSet):
    queryset = RiggingType.objects.all()
    serializer_class = RiggingTypeSerializer
    permission_classes = [IsAuthenticated]  # Solo usuarios autenticados pueden acceder

    def list(self, request, *args, **kwargs):
        """GET /api/rigging_types/ → Listar todos los tipos de rigging"""
        return super().list(request, *args, **kwargs)

    def create(self, request, *args, **kwargs):
        """POST /api/rigging_types/ → Agregar un nuevo tipo de rigging sin duplicados"""
        rigging_type_name = request.data.get("name", "").strip()

        if RiggingType.objects.filter(name__iexact=rigging_type_name).exists():
            return Response(
                {"error": "Este tipo de rigging ya existe."},
                status=status.HTTP_400_BAD_REQUEST
            )

        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        """PUT /api/rigging_types/{id}/ → Evitar actualizar con un tipo de rigging duplicado"""
        rigging_type_instance = self.get_object()
        rigging_type_name = request.data.get("name", "").strip()

        if RiggingType.objects.filter(name__iexact=rigging_type_name).exclude(id=rigging_type_instance.id).exists():
            return Response(
                {"error": "Este tipo de rigging ya existe."},
                status=status.HTTP_400_BAD_REQUEST
            )

        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        """DELETE /api/rigging_types/{id}/ → Eliminar un tipo de rigging"""
        return super().destroy(request, *args, **kwargs)