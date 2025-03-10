from rest_framework import viewsets, status
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
        """POST /api/manufacturers/ → Agregar un nuevo fabricante sin duplicados"""
        manufacturer_name = request.data.get("manufacturer", "").strip()

        if Manufacturer.objects.filter(manufacturer__iexact=manufacturer_name).exists():
            return Response(
                {"error": "Este fabricante ya existe."},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = ManufacturerSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


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
