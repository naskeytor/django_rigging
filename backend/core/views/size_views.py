from rest_framework import viewsets, permissions
from rest_framework.response import Response
from core.models import Size
from core.serializers import SizeSerializer
from rest_framework.permissions import IsAuthenticated

class SizeViewSet(viewsets.ModelViewSet):
    queryset = Size.objects.all()
    serializer_class = SizeSerializer
    permission_classes = [IsAuthenticated]  # Solo usuarios autenticados pueden acceder

    def list(self, request):
        """GET /api/sizes/ → Listar todos los tamaños"""
        print(f"🔹 Usuario autenticado: {request.user}")
        if not request.user.is_authenticated:
            print("❌ No autenticado en /api/sizes")
            return Response({"error": "Unauthorized"}, status=401)

        sizes = Size.objects.all()
        serializer = SizeSerializer(sizes, many=True)
        print("✅ Sizes enviados con éxito")
        return Response(serializer.data)

    def create(self, request):
        """POST /api/sizes/ → Agregar un nuevo tamaño"""
        serializer = SizeSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

    def update(self, request, pk=None):
        """PUT /api/sizes/{id}/ → Editar un tamaño"""
        size = self.get_object()
        serializer = SizeSerializer(size, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def destroy(self, request, pk=None):
        """DELETE /api/sizes/{id}/ → Eliminar un tamaño"""
        size = self.get_object()
        size.delete()
        return Response({"message": "Size deleted successfully"}, status=204)