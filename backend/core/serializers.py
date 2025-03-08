from rest_framework import serializers
from .models import User, Role, Manufacturer, Size, Status, ComponentType, Model, Component, Rig, RiggingType, Rigging

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'

class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = '__all__'

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
    class Meta:
        model = Model
        fields = '__all__'

class ComponentSerializer(serializers.ModelSerializer):
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
