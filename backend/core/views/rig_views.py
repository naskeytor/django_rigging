from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from core.models import Rig, Component
from core.serializers import RigSerializer
from rest_framework.permissions import IsAuthenticated

class RigViewSet(viewsets.ModelViewSet):
    queryset = Rig.objects.all()
    serializer_class = RigSerializer
    permission_classes = [IsAuthenticated]  # Solo usuarios autenticados pueden acceder

    def list(self, request, *args, **kwargs):
        """GET /api/rigs/ → Listar todos los rigs"""
        return super().list(request, *args, **kwargs)

    def create(self, request, *args, **kwargs):
        """POST /api/rigs/ → Agregar un nuevo rig sin duplicados"""
        rig_number = request.data.get("rig_number", "").strip()

        if Rig.objects.filter(rig_number__iexact=rig_number).exists():
            return Response(
                {"error": "Este número de rig ya existe."},
                status=status.HTTP_400_BAD_REQUEST
            )

        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        """PUT /api/rigs/{id}/ → Evitar actualizar con un rig_number duplicado"""
        rig = self.get_object()
        rig_number = request.data.get("rig_number", "").strip()

        if Rig.objects.filter(rig_number__iexact=rig_number).exclude(id=rig.id).exists():
            return Response(
                {"error": "Este número de rig ya existe."},
                status=status.HTTP_400_BAD_REQUEST
            )

        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        """DELETE /api/rigs/{id}/ → Eliminar un rig"""
        return super().destroy(request, *args, **kwargs)

    @action(detail=True, methods=['post'])
    def mount_component(self, request, pk=None):
        """POST /api/rigs/{id}/mount_component/ → Montar un componente en un rig"""
        rig = self.get_object()
        component_id = request.data.get('component_id')

        if not component_id:
            return Response({"error": "Component ID is required."}, status=status.HTTP_400_BAD_REQUEST)

        component = Component.objects.filter(id=component_id).first()
        if not component:
            return Response({"error": "Invalid component_id"}, status=status.HTTP_400_BAD_REQUEST)

        rig.components.add(component)
        rig.save()
        return Response({"message": "Component successfully mounted"}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def umount_component(self, request, pk=None):
        """POST /api/rigs/{id}/umount_component/ → Desmontar un componente de un rig"""
        rig = self.get_object()
        component_id = request.data.get('component_id')

        if not component_id:
            return Response({"error": "Component ID is required."}, status=status.HTTP_400_BAD_REQUEST)

        component = rig.components.filter(id=component_id).first()
        if not component:
            return Response({"error": "Component not found in this rig"}, status=status.HTTP_400_BAD_REQUEST)

        rig.components.remove(component)
        rig.save()
        return Response({"message": "Component successfully unmounted"}, status=status.HTTP_200_OK)
