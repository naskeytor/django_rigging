from django.shortcuts import render

# Create your views here.
from django.contrib.auth.models import Group
from rest_framework import viewsets, status
from .models import  Manufacturer, Size, Status, ComponentType, Model, Component, Rig, Rigging, Lineset, Drogue
from .serializers import (UserSerializer, ManufacturerSerializer, SizeSerializer, StatusSerializer, ComponentTypeSerializer,
                          ModelSerializer, ComponentSerializer, RigSerializer, RiggingSerializer, LinesetSerializer, DrogueSerializer)



class ManufacturerViewSet(viewsets.ModelViewSet):
    queryset = Manufacturer.objects.all()
    serializer_class = ManufacturerSerializer

class SizeViewSet(viewsets.ModelViewSet):
    queryset = Size.objects.all()
    serializer_class = SizeSerializer

class StatusViewSet(viewsets.ModelViewSet):
    queryset = Status.objects.all()
    serializer_class = StatusSerializer

class ComponentTypeViewSet(viewsets.ModelViewSet):
    queryset = ComponentType.objects.all()
    serializer_class = ComponentTypeSerializer

class ModelViewSet(viewsets.ModelViewSet):
    queryset = Model.objects.all()
    serializer_class = ModelSerializer

class ComponentViewSet(viewsets.ModelViewSet):
    queryset = Component.objects.prefetch_related("rigs").all()
    serializer_class = ComponentSerializer

class RigViewSet(viewsets.ModelViewSet):
    queryset = Rig.objects.all()
    serializer_class = RigSerializer


class RiggingViewSet(viewsets.ModelViewSet):
    queryset = Rigging.objects.all()
    serializer_class = RiggingSerializer


class LinesetViewSet(viewsets.ModelViewSet):
    queryset = Lineset.objects.all()
    serializer_class = LinesetSerializer


class DrogueViewSet(viewsets.ModelViewSet):
    queryset = Drogue.objects.all()
    serializer_class = DrogueSerializer