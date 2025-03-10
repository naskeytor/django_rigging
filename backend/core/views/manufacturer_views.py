from rest_framework import viewsets, status
from rest_framework.response import Response
from core.models import Manufacturer
from core.serializers import ManufacturerSerializer
from rest_framework.permissions import IsAuthenticated

class ManufacturerViewSet(viewsets.ModelViewSet):
    queryset = Manufacturer.objects.all()
    serializer_class = ManufacturerSerializer
    permission_classes = [IsAuthenticated]

    def list(self, request, *args, **kwargs):
        """GET /api/manufacturers/ → Listar fabricantes"""
        print(f"🔹 Usuario autenticado: {request.user}")
        if not request.user.is_authenticated:
            print("❌ No autenticado en /api/manufacturers")
            return Response({"error": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)

        return super().list(request, *args, **kwargs)

    def create(self, request, *args, **kwargs):
        """POST /api/manufacturers/ → Agregar un nuevo fabricante sin duplicados"""
        manufacturer_name = request.data.get("manufacturer", "").strip()

        if Manufacturer.objects.filter(manufacturer__iexact=manufacturer_name).exists():
            return Response(
                {"error": "Este fabricante ya existe."},
                status=status.HTTP_400_BAD_REQUEST
            )

        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        """PUT /api/manufacturers/{id}/ → Evitar actualizar con un fabricante duplicado"""
        manufacturer_instance = self.get_object()
        manufacturer_name = request.data.get("manufacturer", "").strip()

        if Manufacturer.objects.filter(manufacturer__iexact=manufacturer_name).exclude(id=manufacturer_instance.id).exists():
            return Response(
                {"error": "Este fabricante ya existe."},
                status=status.HTTP_400_BAD_REQUEST
            )

        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        """DELETE /api/manufacturers/{id}/ → Eliminar un fabricante"""
        return super().destroy(request, *args, **kwargs)
