from rest_framework import viewsets, permissions
from rest_framework.response import Response
from core.models import Status
from core.serializers import StatusSerializer
from rest_framework.permissions import IsAuthenticated

class StatusViewSet(viewsets.ModelViewSet):
    queryset = Status.objects.all()
    serializer_class = StatusSerializer
    permission_classes = [IsAuthenticated]  # Solo usuarios autenticados pueden acceder

    def list(self, request):
        """GET /api/statuses/ → Listar todos los estados"""
        print(f"🔹 Usuario autenticado: {request.user}")
        if not request.user.is_authenticated:
            print("❌ No autenticado en /api/statuses")
            return Response({"error": "Unauthorized"}, status=401)

        statuses = Status.objects.all()
        serializer = StatusSerializer(statuses, many=True)
        print("✅ Status enviados con éxito")
        return Response(serializer.data)

    def create(self, request):
        """POST /api/statuses/ → Agregar un nuevo estado"""
        serializer = StatusSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

    def update(self, request, pk=None):
        """PUT /api/statuses/{id}/ → Editar un estado"""
        status = self.get_object()
        serializer = StatusSerializer(status, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def destroy(self, request, pk=None):
        """DELETE /api/statuses/{id}/ → Eliminar un estado"""
        status = self.get_object()
        status.delete()
        return Response({"message": "Status deleted successfully"}, status=204)