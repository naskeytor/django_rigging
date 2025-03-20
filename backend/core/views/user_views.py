from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from core.models import User, Group
from core.serializers import UserSerializer

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        user = serializer.save()
        grupo_usuario, created = Group.objects.get_or_create(name="Usuario")  # Grupo por defecto
        user.groups.add(grupo_usuario)  # Asignar el usuario al grupo
        user.save()

    # ✅ Endpoint para obtener los datos del usuario autenticado
    @action(detail=False, methods=["get"], permission_classes=[IsAuthenticated])
    def me(self, request):
        user = request.user
        groups = user.groups.all()
        group_name = groups[0].name if groups else "No Group"

        return Response({
            "username": user.username,
            "email": user.email,
            "group_name": group_name
        })