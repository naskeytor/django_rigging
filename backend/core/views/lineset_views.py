from rest_framework import viewsets
from core.models import Lineset
from core.serializers import LinesetSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny

class LinesetViewSet(viewsets.ModelViewSet):
    queryset = Lineset.objects.all()
    serializer_class = LinesetSerializer
    permission_classes = [AllowAny]