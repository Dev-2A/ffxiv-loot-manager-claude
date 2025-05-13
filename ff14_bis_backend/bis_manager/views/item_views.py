from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
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
    
    @action(detail=False, methods=['get'])
    def count(self, request):
        """아이템 전체 개수 반환 API"""
        # 필터링 파라미터 적용
        queryset = self.filter_queryset(self.get_queryset())
        count = queryset.count()
        
        return Response({'count': count})