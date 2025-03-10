from rest_framework import viewsets, status
from rest_framework.response import Response
from core.models import Size
from core.serializers import SizeSerializer
from rest_framework.permissions import IsAuthenticated

class SizeViewSet(viewsets.ModelViewSet):
    queryset = Size.objects.all()
    serializer_class = SizeSerializer
    permission_classes = [IsAuthenticated]  # Solo usuarios autenticados pueden acceder

    def list(self, request, *args, **kwargs):
        """GET /api/sizes/ → Listar todos los tamaños"""
        print(f"🔹 Usuario autenticado: {request.user}")
        if not request.user.is_authenticated:
            print("❌ No autenticado en /api/sizes")
            return Response({"error": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)

        return super().list(request, *args, **kwargs)

    def create(self, request, *args, **kwargs):
        """POST /api/sizes/ → Agregar un nuevo tamaño sin duplicados"""
        size_name = request.data.get("size", "").strip()

        if Size.objects.filter(size__iexact=size_name).exists():
            return Response(
                {"error": "Este tamaño ya existe."},
                status=status.HTTP_400_BAD_REQUEST
            )

        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        """PUT /api/sizes/{id}/ → Editar un tamaño evitando duplicados"""
        size_instance = self.get_object()
        size_name = request.data.get("size", "").strip()

        if Size.objects.filter(size__iexact=size_name).exclude(id=size_instance.id).exists():
            return Response(
                {"error": "Este tamaño ya existe."},
                status=status.HTTP_400_BAD_REQUEST
            )

        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        """DELETE /api/sizes/{id}/ → Eliminar un tamaño"""
        return super().destroy(request, *args, **kwargs)
