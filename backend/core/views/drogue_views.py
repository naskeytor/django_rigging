from rest_framework import viewsets
from core.models import Drogue
from core.serializers import DrogueSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny

class DrogueViewSet(viewsets.ModelViewSet):
    queryset = Drogue.objects.all()
    serializer_class = DrogueSerializer
    permission_classes = [AllowAny]