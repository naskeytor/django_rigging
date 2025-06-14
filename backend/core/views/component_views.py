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

    @action(detail=False, methods=["get"], url_path="available")
    def available_components(self, request):
        component_type = request.query_params.get("type")
        queryset = Component.objects.filter(rigs=None)

        if component_type:
            queryset = queryset.filter(component_type__component_type__iexact=component_type)

        return Response(ComponentSerializer(queryset, many=True).data)

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
        """POST /api/components/{id}/mount/"""
        component = self.get_object()
        rig_id = request.data.get('rig_id')
        aad_jumps = request.data.get('aad_jumps')

        if not rig_id or aad_jumps is None:
            return Response({"error": "rig_id and aad_jumps are required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            rig = Rig.objects.get(id=rig_id)
        except Rig.DoesNotExist:
            return Response({"error": "Rig not found"}, status=status.HTTP_404_NOT_FOUND)

        component.rigs.add(rig)

        if component.component_type.component_type == "AAD":
            # ✅ AAD: actualiza todos los componentes montados, excepto RESERVE
            for c in rig.components.all():
                if c.component_type.component_type != "Reserve":
                    c.aad_jumps_on_mount = aad_jumps
                    c.save()
        elif component.component_type.component_type != "Reserve":
            component.aad_jumps_on_mount = aad_jumps
            component.save()

        return Response({"message": "Component successfully mounted"}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def umount(self, request, pk=None):
        """POST /api/components/{id}/umount/"""
        component = self.get_object()
        aad_jumps = request.data.get('aad_jumps')

        if aad_jumps is None:
            return Response({"error": "aad_jumps is required"}, status=status.HTTP_400_BAD_REQUEST)

        rigs = component.rigs.all()

        for rig in rigs:
            # ✅ Actualizamos TODOS los componentes del rig excepto Reserve
            for c in rig.components.all():
                if c.component_type.component_type == "Reserve":
                    continue

                # Calcular diferencia
                if c.aad_jumps_on_mount is not None:
                    diff = int(aad_jumps) - int(c.aad_jumps_on_mount or 0)
                    c.jumps = (c.jumps or 0) + max(diff, 0)
                    c.save()

        # ✅ Quitar el rig al componente desmontado
        component.rigs.clear()
        component.save()

        return Response({"message": "Component successfully unmounted"}, status=status.HTTP_200_OK)