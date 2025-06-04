from rest_framework import serializers
from .models import (
    User, Manufacturer, Size, Status, ComponentType,
    Model, Component, Rig, RiggingType, Rigging
)


# 🔹 User
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email"]


# 🔹 Manufacturer
class ManufacturerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Manufacturer
        fields = '__all__'


# 🔹 Size
class SizeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Size
        fields = '__all__'


# 🔹 Status
class StatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Status
        fields = '__all__'


# 🔹 Component Type
class ComponentTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ComponentType
        fields = '__all__'


# 🔹 Model
class ModelSerializer(serializers.ModelSerializer):
    manufacturer_name = serializers.CharField(source='manufacturer.manufacturer', read_only=True)

    class Meta:
        model = Model
        fields = '__all__'


# 🔹 Component
class ComponentSerializer(serializers.ModelSerializer):
    component_type_name = serializers.CharField(source='component_type.component_type', read_only=True)
    model_name = serializers.CharField(source='model.name', read_only=True)
    size_name = serializers.CharField(source='size.size', read_only=True)
    status_name = serializers.CharField(source='status.status', read_only=True)

    class Meta:
        model = Component
        fields = [
            'id', 'serial_number', 'component_type_name',
            'model_name', 'size_name', 'status_name', 'component_type_name'
        ]


# 🔹 Rig Read
class RigSerializer(serializers.ModelSerializer):
    components = ComponentSerializer(many=True, read_only=True)

    class Meta:
        model = Rig
        fields = '__all__'


# 🔹 Rig Write
class RigWriteSerializer(serializers.ModelSerializer):
    components = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Component.objects.all(),
        required=False
    )

    class Meta:
        model = Rig
        fields = '__all__'

    def create(self, validated_data):
        components = validated_data.pop("components", [])
        print("🧪 Components recibidos para guardar:", components)
        rig = Rig.objects.create(**validated_data)
        rig.components.set(components)
        return rig

    def update(self, instance, validated_data):
        components = validated_data.pop("components", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if components is not None:
            instance.components.set(components)
        return instance


# 🔹 Rigging Type
class RiggingTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = RiggingType
        fields = '__all__'


# 🔹 Rigging
class RiggingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rigging
        fields = '__all__'
