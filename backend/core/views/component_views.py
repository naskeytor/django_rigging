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
            aad_jumps = int(aad_jumps)
        except ValueError:
            return Response({"error": "aad_jumps must be an integer"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            rig = Rig.objects.get(id=rig_id)
        except Rig.DoesNotExist:
            return Response({"error": "Rig not found"}, status=status.HTTP_404_NOT_FOUND)

        ctype = component.component_type.component_type

        # ✅ Paso 2: RESERVE — solo vincular
        if ctype == "Reserve":
            component.rigs.add(rig)
            component.save()
            serializer = self.get_serializer(component)
            return Response(serializer.data, status=status.HTTP_200_OK)

        # ✅ Paso 3: AAD
        if ctype == "AAD":
            component.jumps = aad_jumps
            component.rigs.add(rig)
            component.save()

            for c in rig.components.all():
                if c.component_type.component_type in ["Canopy", "Container"]:
                    c.aad_jumps_on_mount = aad_jumps
                    c.save()

            serializer = self.get_serializer(component)
            return Response(serializer.data, status=status.HTTP_200_OK)

        # ✅ Paso 4: Canopy o Container
        if ctype in ["Canopy", "Container"]:
            component.aad_jumps_on_mount = aad_jumps
            component.rigs.add(rig)
            component.save()

            serializer = self.get_serializer(component)
            return Response(serializer.data, status=status.HTTP_200_OK)

        return Response({"error": "Unsupported component type"}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def umount(self, request, pk=None):
        """POST /api/components/{id}/umount/"""
        component = self.get_object()
        aad_jumps = request.data.get('aad_jumps')

        if aad_jumps is None:
            return Response({"error": "aad_jumps is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            aad_jumps = int(aad_jumps)
        except ValueError:
            return Response({"error": "aad_jumps must be an integer"}, status=status.HTTP_400_BAD_REQUEST)

        # Si no está montado, no hay nada que hacer
        if not component.rigs.exists():
            return Response({"error": "Component is not mounted to any rig"}, status=status.HTTP_400_BAD_REQUEST)

        ctype = component.component_type.component_type

        # ✅ Si es RESERVE: simplemente desvincular
        if ctype == "Reserve":
            component.rigs.clear()
            component.save()
            serializer = self.get_serializer(component)
            return Response(serializer.data, status=status.HTTP_200_OK)

        # ✅ Si es AAD
        if ctype == "AAD":
            for rig in component.rigs.all():
                for c in rig.components.all():
                    if c.id == component.id or c.component_type.component_type == "Reserve":
                        continue
                    if c.aad_jumps_on_mount is not None:
                        diff = aad_jumps - int(c.aad_jumps_on_mount or 0)
                        c.jumps = (c.jumps or 0) + max(diff, 0)
                        c.aad_jumps_on_mount = 0
                        c.save()

            component.jumps = aad_jumps
            component.aad_jumps_on_mount = 0
            component.rigs.clear()
            component.save()

            serializer = self.get_serializer(component)
            return Response(serializer.data, status=status.HTTP_200_OK)

        # ✅ Si es Canopy o Container
        if ctype in ["Canopy", "Container"]:
            for rig in component.rigs.all():
                for c in rig.components.all():
                    if c.component_type.component_type == "Reserve":
                        continue
                    if c.aad_jumps_on_mount is not None:
                        diff = aad_jumps - int(c.aad_jumps_on_mount or 0)
                        c.jumps = (c.jumps or 0) + max(diff, 0)
                        c.aad_jumps_on_mount = aad_jumps
                        c.save()

            component.rigs.clear()
            component.save()

            serializer = self.get_serializer(component)
            return Response(serializer.data, status=status.HTTP_200_OK)

        return Response({"error": "Unsupported component type"}, status=status.HTTP_400_BAD_REQUEST)
