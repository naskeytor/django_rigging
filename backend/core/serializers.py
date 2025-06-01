from rest_framework import serializers, viewsets
from rest_framework.permissions import IsAuthenticated

from .models import User, Manufacturer, Size, Status, ComponentType, Model, Component, Rig, RiggingType, Rigging


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email"]


class ManufacturerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Manufacturer
        fields = '__all__'


class SizeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Size
        fields = '__all__'


class StatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Status
        fields = '__all__'


class ComponentTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ComponentType
        fields = '__all__'


class ModelSerializer(serializers.ModelSerializer):
    manufacturer_name = serializers.CharField(source='manufacturer.manufacturer', read_only=True)

    class Meta:
        model = Model
        fields = '__all__'


class ComponentSerializer(serializers.ModelSerializer):
    component_type_name = serializers.CharField(source='component_type.component_type', read_only=True)
    model_name = serializers.CharField(source='model.name', read_only=True)
    size_name = serializers.CharField(source='size.size', read_only=True)
    status_name = serializers.CharField(source='status.status', read_only=True)

    class Meta:
        model = Component
        fields = ['id', 'serial_number', 'component_type_name', 'model_name', 'size_name', 'status_name']


class RigSerializer(serializers.ModelSerializer):
    components = ComponentSerializer(many=True, read_only=True)

    class Meta:
        model = Rig
        fields = '__all__'


class RigWriteSerializer(serializers.ModelSerializer):
    components = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Component.objects.all(),
        required=False  # ✅ esto permite que sea opcional
    )

    class Meta:
        model = Rig
        fields = '__all__'


class RigViewSet(viewsets.ModelViewSet):
    queryset = Rig.objects.all()
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return RigWriteSerializer
        return RigSerializer


class RiggingTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = RiggingType
        fields = '__all__'


class RiggingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rigging
        fields = '__all__'
