from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response

from bis_manager.models import Season, Player
from bis_manager.serializers import SeasonSerializer, PlayerSerializer
from bis_manager.permissions import IsAdminOrReadOnly

class SeasonViewSet(viewsets.ModelViewSet):
    queryset = Season.objects.all()
    serializer_class = SeasonSerializer
    permission_classes = [IsAdminOrReadOnly]
    filterset_fields = ['is_active', 'distribution_method']
    
    @action(detail=True, methods=['get'])
    def active_players(self, request, pk=None):
        """현재 시즌에 참여 중인 플레이어 목록 반환"""
        season = self.get_object()
        players = Player.objects.filter(bis_sets__season=season).distinct()
        serializer = PlayerSerializer(players, many=True)
        return Response(serializer.data)