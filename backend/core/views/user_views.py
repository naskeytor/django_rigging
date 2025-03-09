from rest_framework import viewsets
from core.models import User, Group
from core.serializers import UserSerializer

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def perform_create(self, serializer):
        user = serializer.save()
        grupo_usuario, created = Group.objects.get_or_create(name="Usuario")  # Grupo por defecto
        user.groups.add(grupo_usuario)  # Asignar el usuario al grupo
        user.save()