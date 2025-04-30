from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from bis_manager.models import Player, BisSet
from bis_manager.serializers import PlayerSerializer, PlayerCreateSerializer, BisSetSerializer
from bis_manager.permissions import IsAdminOrReadOnly

class PlayerViewSet(viewsets.ModelViewSet):
    queryset = Player.objects.all()
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['job', 'job_type']
    search_fields = ['nickname']
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return PlayerCreateSerializer
        return PlayerSerializer
    
    @action(detail=True, methods=['get'])
    def bis_sets(self, request, pk=None):
        """플레이어의 모든 비스 세트 조회"""
        player = self.get_object()
        bis_sets = BisSet.objects.filter(player=player)
        
        season_id = request.query_params.get('season')
        if season_id:
            bis_sets = bis_sets.filter(season_id=season_id)
        
        bis_type = request.query_params.get('bis_type')
        if bis_type:
            bis_sets = bis_sets.filter(bis_type=bis_type)
        
        serializer = BisSetSerializer(bis_sets, many=True)
        return Response(serializer.data)