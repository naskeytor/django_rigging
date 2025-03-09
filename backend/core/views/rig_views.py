from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from core.models import Rig, Component
from core.serializers import RigSerializer
from rest_framework.permissions import IsAuthenticated

class RigViewSet(viewsets.ModelViewSet):
    queryset = Rig.objects.all()
    serializer_class = RigSerializer
    permission_classes = [IsAuthenticated]  # Solo usuarios autenticados pueden acceder

    def list(self, request):
        """GET /api/rigs/ → Listar todos los rigs"""
        rigs = Rig.objects.all()
        serializer = RigSerializer(rigs, many=True)
        return Response(serializer.data)

    def create(self, request):
        """POST /api/rigs/ → Agregar un nuevo rig"""
        serializer = RigSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

    def update(self, request, pk=None):
        """PUT /api/rigs/{id}/ → Editar un rig"""
        rig = self.get_object()
        serializer = RigSerializer(rig, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def destroy(self, request, pk=None):
        """DELETE /api/rigs/{id}/ → Eliminar un rig"""
        rig = self.get_object()
        rig.delete()
        return Response({"message": "Rig deleted successfully"}, status=204)

    @action(detail=True, methods=['post'])
    def mount_component(self, request, pk=None):
        """POST /api/rigs/{id}/mount_component/ → Montar un componente en un rig"""
        rig = self.get_object()
        component_id = request.data.get('component_id')

        if component_id:
            component = Component.objects.filter(id=component_id).first()
            if component:
                rig.components.add(component)
                rig.save()
                return Response({"message": "Component successfully mounted"}, status=200)

        return Response({"error": "Invalid component_id"}, status=400)

    @action(detail=True, methods=['post'])
    def umount_component(self, request, pk=None):
        """POST /api/rigs/{id}/umount_component/ → Desmontar un componente de un rig"""
        rig = self.get_object()
        component_id = request.data.get('component_id')

        if component_id:
            component = rig.components.filter(id=component_id).first()
            if component:
                rig.components.remove(component)
                rig.save()
                return Response({"message": "Component successfully unmounted"}, status=200)

        return Response({"error": "Component not found in this rig"}, status=400)