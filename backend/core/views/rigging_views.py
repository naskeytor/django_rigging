from rest_framework import viewsets
from core.models import Rigging
from core.serializers import RiggingSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny

class RiggingViewSet(viewsets.ModelViewSet):
    queryset = Rigging.objects.all().order_by('-date')
    serializer_class = RiggingSerializer
    permission_classes = [AllowAny]