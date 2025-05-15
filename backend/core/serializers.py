from rest_framework import serializers
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
        fields = '__all__'

class RigSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rig
        fields = '__all__'

class RiggingTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = RiggingType
        fields = '__all__'

class RiggingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rigging
        fields = '__all__'
