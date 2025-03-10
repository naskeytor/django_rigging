from rest_framework import viewsets, status
from rest_framework.response import Response
from core.models import Status
from core.serializers import StatusSerializer
from rest_framework.permissions import IsAuthenticated


class StatusViewSet(viewsets.ModelViewSet):
    queryset = Status.objects.all()
    serializer_class = StatusSerializer
    permission_classes = [IsAuthenticated]  # Solo usuarios autenticados pueden acceder

    def list(self, request, *args, **kwargs):
        """GET /api/statuses/ → Listar todos los estados"""
        print(f"🔹 Usuario autenticado: {request.user}")
        if not request.user.is_authenticated:
            print("❌ No autenticado en /api/statuses")
            return Response({"error": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)

        return super().list(request, *args, **kwargs)

    def create(self, request, *args, **kwargs):
        """POST /api/statuses/ → Agregar un nuevo estado sin duplicados"""
        status_name = request.data.get("status", "").strip()

        if Status.objects.filter(status__iexact=status_name).exists():
            return Response(
                {"error": "Este estado ya existe."},
                status=status.HTTP_400_BAD_REQUEST
            )

        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        """PUT /api/statuses/{id}/ → Editar un estado evitando duplicados"""
        status_instance = self.get_object()
        status_name = request.data.get("status", "").strip()

        if Status.objects.filter(status__iexact=status_name).exclude(id=status_instance.id).exists():
            return Response(
                {"error": "Este estado ya existe."},
                status=status.HTTP_400_BAD_REQUEST
            )

        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        """DELETE /api/statuses/{id}/ → Eliminar un estado"""
        return super().destroy(request, *args, **kwargs)
