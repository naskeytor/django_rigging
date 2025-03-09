from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from core.models import Component, Rig
from core.serializers import ComponentSerializer
from rest_framework.permissions import IsAuthenticated

class ComponentViewSet(viewsets.ModelViewSet):
    queryset = Component.objects.all()
    serializer_class = ComponentSerializer
    permission_classes = [IsAuthenticated]  # Solo usuarios autenticados pueden acceder

    def list(self, request):
        """GET /api/components/ → Listar todos los componentes"""
        components = Component.objects.all()
        serializer = ComponentSerializer(components, many=True)
        return Response(serializer.data)

    def create(self, request):
        """POST /api/components/ → Agregar un nuevo componente"""
        serializer = ComponentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

    def update(self, request, pk=None):
        """PUT /api/components/{id}/ → Editar un componente"""
        component = self.get_object()
        serializer = ComponentSerializer(component, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def destroy(self, request, pk=None):
        """DELETE /api/components/{id}/ → Eliminar un componente"""
        component = self.get_object()
        component.delete()
        return Response({"message": "Component deleted successfully"}, status=204)

    @action(detail=True, methods=['post'])
    def mount(self, request, pk=None):
        """POST /api/components/{id}/mount/ → Montar un componente en un rig"""
        component = self.get_object()
        rig_id = request.data.get('rig_id')
        current_aad_jumps = request.data.get('current_aad_jumps', 0)

        if rig_id:
            rig = Rig.objects.filter(id=rig_id).first()
            if rig:
                component.rigs.add(rig)
                component.save()
                return Response({"message": "Component successfully mounted"}, status=200)

        return Response({"error": "Invalid rig_id"}, status=400)

    @action(detail=True, methods=['post'])
    def umount(self, request, pk=None):
        """POST /api/components/{id}/umount/ → Desmontar un componente de un rig"""
        component = self.get_object()
        current_aad_jumps = request.data.get('current_aad_jumps', 0)

        component.rigs.clear()  # Elimina la relación con el Rig
        component.save()
        return Response({"message": "Component successfully unmounted"}, status=200)