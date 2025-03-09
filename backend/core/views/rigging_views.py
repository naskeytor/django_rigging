from rest_framework import viewsets, permissions
from rest_framework.response import Response
from core.models import Rigging, Component, Rig, RiggingType
from core.serializers import RiggingSerializer
from rest_framework.permissions import IsAuthenticated

class RiggingViewSet(viewsets.ModelViewSet):
    queryset = Rigging.objects.all()
    serializer_class = RiggingSerializer
    permission_classes = [IsAuthenticated]  # Solo usuarios autenticados pueden acceder

    def list(self, request):
        """GET /api/riggings/ → Listar todos los riggings"""
        riggings = Rigging.objects.all()
        serializer = RiggingSerializer(riggings, many=True)
        return Response(serializer.data)

    def create(self, request):
        """POST /api/riggings/ → Agregar un nuevo rigging"""
        data = request.data.copy()
        selected_value = data.get('serial_numbers')
        component_id = None
        rig_id = None

        if selected_value:
            selection_type, selection_id = selected_value.split('-')
            if selection_type == "Component":
                component = Component.objects.filter(id=int(selection_id)).first()
                if component:
                    data['serial_numbers'] = component.serial_number
                    component_id = component.id
            elif selection_type == "Rig":
                rig = Rig.objects.filter(id=int(selection_id)).first()
                if rig:
                    data['serial_numbers'] = rig.rig_number
                    rig_id = rig.id

        data['component'] = component_id
        data['rig'] = rig_id
        data['rigger'] = request.user.id  # Asignamos el usuario autenticado como rigger

        serializer = RiggingSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

    def update(self, request, pk=None):
        """PUT /api/riggings/{id}/ → Editar un rigging"""
        rigging = self.get_object()
        data = request.data.copy()
        selected_value = data.get('serial_numbers')

        if selected_value:
            selection_type, selection_id = selected_value.split('-')
            if selection_type == "Component":
                component = Component.objects.filter(id=int(selection_id)).first()
                if component:
                    data['serial_numbers'] = component.serial_number
                    data['component'] = component.id
            elif selection_type == "Rig":
                rig = Rig.objects.filter(id=int(selection_id)).first()
                if rig:
                    data['serial_numbers'] = rig.rig_number
                    data['rig'] = rig.id

        serializer = RiggingSerializer(rigging, data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def destroy(self, request, pk=None):
        """DELETE /api/riggings/{id}/ → Eliminar un rigging"""
        rigging = self.get_object()
        rigging.delete()
        return Response({"message": "Rigging deleted successfully"}, status=204)