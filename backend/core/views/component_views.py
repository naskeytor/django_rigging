from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from core.models import Component, Rig
from core.serializers import ComponentSerializer
from rest_framework.permissions import IsAuthenticated


class ComponentViewSet(viewsets.ModelViewSet):
    queryset = Component.objects.all()
    serializer_class = ComponentSerializer
    permission_classes = [IsAuthenticated]  # Solo usuarios autenticados pueden acceder

    def list(self, request, *args, **kwargs):
        """GET /api/components/ → Listar todos los componentes"""
        return super().list(request, *args, **kwargs)

    def create(self, request, *args, **kwargs):
        """POST /api/components/ → Agregar un nuevo componente sin serial duplicado"""
        serial_number = request.data.get("serial_number", "").strip()

        if Component.objects.filter(serial_number__iexact=serial_number).exists():
            return Response(
                {"error": "Este número de serie ya existe."},
                status=status.HTTP_400_BAD_REQUEST
            )

        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        """PUT /api/components/{id}/ → Evitar actualizar con un serial_number duplicado"""
        component = self.get_object()
        serial_number = request.data.get("serial_number", "").strip()

        if Component.objects.filter(serial_number__iexact=serial_number).exclude(id=component.id).exists():
            return Response(
                {"error": "Este número de serie ya existe."},
                status=status.HTTP_400_BAD_REQUEST
            )

        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        """DELETE /api/components/{id}/ → Eliminar un componente"""
        return super().destroy(request, *args, **kwargs)

    @action(detail=True, methods=['post'])
    def mount(self, request, pk=None):
        """POST /api/components/{id}/mount/ → Montar un componente en un rig"""
        component = self.get_object()
        rig_id = request.data.get('rig_id')

        if rig_id:
            rig = Rig.objects.filter(id=rig_id).first()
            if rig:
                component.rigs.add(rig)
                component.save()
                return Response({"message": "Component successfully mounted"}, status=status.HTTP_200_OK)

        return Response({"error": "Invalid rig_id"}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def umount(self, request, pk=None):
        """POST /api/components/{id}/umount/ → Desmontar un componente de un rig"""
        component = self.get_object()
        component.rigs.clear()  # Elimina la relación con el Rig
        component.save()
        return Response({"message": "Component successfully unmounted"}, status=status.HTTP_200_OK)
