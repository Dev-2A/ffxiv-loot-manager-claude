from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend

from bis_manager.models import Item
from bis_manager.serializers import ItemSerializer, ItemDetailSerializer
from bis_manager.permissions import IsAdminOrReadOnly

class ItemViewSet(viewsets.ModelViewSet):
    queryset = Item.objects.all()
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['season', 'type', 'source', 'item_level']
    search_fields = ['name']
    
    def get_serializer_class(self):
        if self.action == 'retrieve' or self.action == 'list':
            return ItemDetailSerializer
        return ItemSerializer