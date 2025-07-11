from rest_framework import serializers
from .models import (
    User, Manufacturer, Size, Status, ComponentType,
    Model, Component, Rig, Rigging, Lineset, Drogue
)

# 🔹 User
class UserSerializer(serializers.ModelSerializer):
    group_names = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'group_names']  # ⚠️ incluye group_names aquí

    def get_group_names(self, obj):
        # obj es un usuario
        return [group.name for group in obj.groups.all()]



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
    manufacturer_name = serializers.CharField(source="manufacturer.manufacturer", read_only=True)

    class Meta:
        model = Model
        fields = ['id', 'name', 'manufacturer', 'manufacturer_name']


# 🔹 Component
class ComponentSerializer(serializers.ModelSerializer):
    component_type_name = serializers.CharField(source='component_type.component_type', read_only=True)
    model_name = serializers.CharField(source='model.name', read_only=True)
    size_name = serializers.CharField(source='size.size', read_only=True)
    status_name = serializers.CharField(source='status.status', read_only=True)

    # 🔹 Añadir los rigs con rig_number
    rigs = serializers.SerializerMethodField()

    def get_rigs(self, obj):
        return [{"id": r.id, "rig_number": r.rig_number} for r in obj.rigs.all()]

    class Meta:
        model = Component
        fields = [
            'id',
            'serial_number',
            'component_type',
            'model',
            'size',
            'status',
            'dom',
            'jumps',
            'aad_jumps_on_mount',
            'component_type_name',
            'model_name',
            'size_name',
            'status_name',
            'rigs',  # 🔹 Incluir aquí también
            'usage_type'
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



# 🔹 Rigging
class RiggingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rigging
        fields = '__all__'


class RigSummarySerializer(serializers.ModelSerializer):
    canopy_name = serializers.SerializerMethodField()
    container_name = serializers.SerializerMethodField()
    reserve_name = serializers.SerializerMethodField()
    aad_name = serializers.SerializerMethodField()

    def format_with_size(self, component):
        if not component:
            return ""
        model = getattr(component.model, "name", "")
        size = getattr(component.size, "size", "")
        return f"{model}-{size}" if size else model

    def get_component(self, obj, type_name):
        return obj.components.filter(component_type__component_type=type_name).select_related("model", "size").first()

    def get_canopy_name(self, obj):
        return self.format_with_size(self.get_component(obj, "Canopy"))

    def get_reserve_name(self, obj):
        return self.format_with_size(self.get_component(obj, "Reserve"))

    def get_container_name(self, obj):
        component = self.get_component(obj, "Container")
        return component.model.name if component and component.model else ""

    def get_aad_name(self, obj):
        component = self.get_component(obj, "AAD")
        return component.model.name if component and component.model else ""

    class Meta:
        model = Rig
        fields = [
            "id", "rig_number", "current_aad_jumps",
            "canopy_name", "container_name", "reserve_name", "aad_name"
        ]


class LinesetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lineset
        fields = '__all__'


class DrogueSerializer(serializers.ModelSerializer):
    class Meta:
        model = Drogue
        fields = '__all__'
