from rest_framework import viewsets, permissions
from rest_framework.response import Response
from core.models import RiggingType
from core.serializers import RiggingTypeSerializer
from rest_framework.permissions import IsAuthenticated

class RiggingTypeViewSet(viewsets.ModelViewSet):
    queryset = RiggingType.objects.all()
    serializer_class = RiggingTypeSerializer
    permission_classes = [IsAuthenticated]  # Solo usuarios autenticados pueden acceder

    def list(self, request):
        """GET /api/rigging_types/ → Listar todos los tipos de rigging"""
        rigging_types = RiggingType.objects.all()
        serializer = RiggingTypeSerializer(rigging_types, many=True)
        return Response(serializer.data)

    def create(self, request):
        """POST /api/rigging_types/ → Agregar un nuevo tipo de rigging"""
        serializer = RiggingTypeSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

    def update(self, request, pk=None):
        """PUT /api/rigging_types/{id}/ → Editar un tipo de rigging"""
        rigging_type = self.get_object()
        serializer = RiggingTypeSerializer(rigging_type, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def destroy(self, request, pk=None):
        """DELETE /api/rigging_types/{id}/ → Eliminar un tipo de rigging"""
        rigging_type = self.get_object()
        rigging_type.delete()
        return Response({"message": "RiggingType deleted successfully"}, status=204)