from rest_framework import viewsets, status
from rest_framework.response import Response
from core.models import Model
from core.serializers import ModelSerializer
from rest_framework.permissions import IsAuthenticated


class ModelViewSet(viewsets.ModelViewSet):
    queryset = Model.objects.all()
    serializer_class = ModelSerializer
    permission_classes = [IsAuthenticated]  # Solo usuarios autenticados pueden acceder

    def list(self, request, *args, **kwargs):
        """GET /api/models/ → Listar todos los modelos"""
        print(f"🔹 Usuario autenticado: {request.user}")
        if not request.user.is_authenticated:
            print("❌ No autenticado en /api/models")
            return Response({"error": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)

        return super().list(request, *args, **kwargs)

    def create(self, request, *args, **kwargs):
        """POST /api/models/ → Agregar un nuevo modelo sin duplicados"""
        model_name = request.data.get("name", "").strip()

        if Model.objects.filter(name__iexact=model_name).exists():
            return Response(
                {"error": "Este modelo ya existe."},
                status=status.HTTP_400_BAD_REQUEST
            )

        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        """PUT /api/models/{id}/ → Evitar actualizar con un modelo duplicado"""
        model_instance = self.get_object()
        model_name = request.data.get("name", "").strip()

        if Model.objects.filter(name__iexact=model_name).exclude(id=model_instance.id).exists():
            return Response(
                {"error": "Este modelo ya existe."},
                status=status.HTTP_400_BAD_REQUEST
            )

        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        """DELETE /api/models/{id}/ → Eliminar un modelo"""
        return super().destroy(request, *args, **kwargs)
