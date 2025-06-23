from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny

from core.models import Rig, Component
from core.serializers import RigSerializer, RigWriteSerializer, RigSummarySerializer


class RigViewSet(viewsets.ModelViewSet):
    queryset = Rig.objects.all().prefetch_related(
        "components__model",
        "components__size",
        "components__component_type",
        "components__status"
    )
    permission_classes = [AllowAny] #[IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'retrieve' and self.request.query_params.get("summary") == "1":
            return RigSummarySerializer
        if self.action == 'list' and self.request.query_params.get("summary") == "1":
            return RigSummarySerializer
        if self.action in ['create', 'update', 'partial_update']:
            return RigWriteSerializer
        return RigSerializer  # ✅ incluir componentes siempre

    @action(detail=True, methods=["patch"], url_path="update-aad-jumps")
    def update_aad_jumps(self, request, pk=None):
        rig = self.get_object()
        try:
            new_value = int(request.data.get("new_value"))
        except (TypeError, ValueError):
            return Response({"error": "Invalid value"}, status=status.HTTP_400_BAD_REQUEST)

        rig.update_aad_jumps(new_value)
        return Response({"status": "updated", "new_value": new_value})

    """def list(self, request, *args, **kwargs):
        # 🔹 Forzar uso de RigSerializer con componentes serializados
        self.serializer_class = RigSerializer
        return super().list(request, *args, **kwargs)"""

    def create(self, request, *args, **kwargs):
        rig_number = request.data.get("rig_number", "").strip()
        if Rig.objects.filter(rig_number__iexact=rig_number).exists():
            return Response(
                {"error": "Este número de rig ya existe."},
                status=status.HTTP_400_BAD_REQUEST
            )
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        rig = self.get_object()
        rig_number = request.data.get("rig_number", "").strip()
        if Rig.objects.filter(rig_number__iexact=rig_number).exclude(id=rig.id).exists():
            return Response(
                {"error": "Este número de rig ya existe."},
                status=status.HTTP_400_BAD_REQUEST
            )
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        return super().destroy(request, *args, **kwargs)

    @action(detail=True, methods=['post'])
    def mount_component(self, request, pk=None):
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
