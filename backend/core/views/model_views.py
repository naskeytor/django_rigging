from rest_framework import viewsets, status
from rest_framework.response import Response
from core.models import Model
from core.serializers import ModelSerializer
from rest_framework.permissions import IsAuthenticated


class ModelViewSet(viewsets.ModelViewSet):
    queryset = Model.objects.all()
    serializer_class = ModelSerializer
    permission_classes = [IsAuthenticated]  # Solo usuarios autenticados pueden acceder

    def list(self, request):
        """GET /api/models/ → Listar todos los modelos"""
        print(f"🔹 Usuario autenticado: {request.user}")
        if not request.user.is_authenticated:
            print("❌ No autenticado en /api/models")
            return Response({"error": "Unauthorized"}, status=401)

        models = Model.objects.all()
        serializer = ModelSerializer(models, many=True)
        print("✅ Models enviados con éxito")
        return Response(serializer.data)

    def create(self, request):
        """POST /api/models/ → Agregar un nuevo modelo sin duplicados"""
        model_name = request.data.get("name", "").strip()

        if Model.objects.filter(name__iexact=model_name).exists():
            return Response(
                {"error": "Este modelo ya existe."},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = ModelSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, pk=None):
        """PUT /api/models/{id}/ → Editar un modelo"""
        model = self.get_object()
        serializer = ModelSerializer(model, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def destroy(self, request, pk=None):
        """DELETE /api/models/{id}/ → Eliminar un modelo"""
        model = self.get_object()
        model.delete()
        return Response({"message": "Model deleted successfully"}, status=204)
