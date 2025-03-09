from rest_framework import viewsets, permissions
from rest_framework.response import Response
from core.models import Manufacturer
from core.serializers import ManufacturerSerializer
from rest_framework.permissions import IsAuthenticated

class ManufacturerViewSet(viewsets.ModelViewSet):
    queryset = Manufacturer.objects.all()
    serializer_class = ManufacturerSerializer
    permission_classes = [IsAuthenticated]

    def list(self, request):
        """GET /api/manufacturers/ → Listar fabricantes"""
        print(f"🔹 Usuario autenticado: {request.user}")
        if not request.user.is_authenticated:
            print("❌ No autenticado en /api/manufacturers")
            return Response({"error": "Unauthorized"}, status=401)

        manufacturers = Manufacturer.objects.all()
        serializer = ManufacturerSerializer(manufacturers, many=True)
        print("✅ Manufacturers enviados con éxito")
        return Response(serializer.data)

    def create(self, request):
        """POST /api/manufacturers/ → Agregar un nuevo fabricante"""
        serializer = ManufacturerSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

    def update(self, request, pk=None):
        """PUT /api/manufacturers/{id}/ → Editar un fabricante"""
        manufacturer = self.get_object()
        serializer = ManufacturerSerializer(manufacturer, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def destroy(self, request, pk=None):
        """DELETE /api/manufacturers/{id}/ → Eliminar un fabricante"""
        manufacturer = self.get_object()
        manufacturer.delete()
        return Response({"message": "Manufacturer deleted successfully"}, status=204)
