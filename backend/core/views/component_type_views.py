from rest_framework import viewsets, permissions
from rest_framework.response import Response
from core.models import ComponentType
from core.serializers import ComponentTypeSerializer
from rest_framework.permissions import IsAuthenticated

class ComponentTypeViewSet(viewsets.ModelViewSet):
    queryset = ComponentType.objects.all()
    serializer_class = ComponentTypeSerializer
    permission_classes = [IsAuthenticated]  # Solo usuarios autenticados pueden acceder

    def list(self, request):
        """GET /api/component_types/ → Listar todos los tipos de componentes"""
        print(f"🔹 Usuario autenticado: {request.user}")
        if not request.user.is_authenticated:
            print("❌ No autenticado en /api/component_types")
            return Response({"error": "Unauthorized"}, status=401)

        component_types = ComponentType.objects.all()
        serializer = ComponentTypeSerializer(component_types, many=True)
        print("✅ ComponentTypes enviados con éxito")
        return Response(serializer.data)

    def create(self, request):
        """POST /api/component_types/ → Agregar un nuevo tipo de componente"""
        serializer = ComponentTypeSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

    def update(self, request, pk=None):
        """PUT /api/component_types/{id}/ → Editar un tipo de componente"""
        component_type = self.get_object()
        serializer = ComponentTypeSerializer(component_type, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def destroy(self, request, pk=None):
        """DELETE /api/component_types/{id}/ → Eliminar un tipo de componente"""
        component_type = self.get_object()
        component_type.delete()
        return Response({"message": "ComponentType deleted successfully"}, status=204)