from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from bis_manager.models import RaidProgress, ItemAcquisition, DistributionPriority
from bis_manager.serializers import RaidProgressSerializer,ItemAcquisitionSerializer, DistributionPrioritySerializer
from bis_manager.permissions import IsAdminOrReadOnly
from bis_manager.services.distribution_service import DistributionService

class RaidProgressViewSet(viewsets.ModelViewSet):
    queryset = RaidProgress.objects.all()
    serializer_class = RaidProgressSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['season', 'floor', 'raid_date']

class ItemAcquisitionViewSet(viewsets.ModelViewSet):
    queryset = ItemAcquisition.objects.all()
    serializer_class = ItemAcquisitionSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['raid_progress', 'player', 'item']

class DistributionPriorityViewSet(viewsets.ModelViewSet):
    queryset = DistributionPriority.objects.all()
    serializer_class = DistributionPrioritySerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['season', 'player', 'item_type']
    
    @action(detail=False, methods=['post'])
    def calculate(self, request):
        """우선순위 분배 계산 API"""
        season_id = request.data.get('season')
        
        if not season_id:
            return Response({'error': '시즌 ID를 입력해주세요.'}, status=status.HTTP_400_BAD_REQUEST)
        
        # 분배 서비스 호출
        result = DistributionService.calculate_priority_for_season(season_id)
        
        if not result.get('success', False):
            return Response({'error': result.get('error', '알 수 없는 오류가 발생했습니다.')}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response(result)
    
    @action(detail=False, methods=['post'])
    def generate_distribution_plan(self, request):
        """주간 분배 계획 생성 API"""
        season_id = request.data.get('season')
        weeks = request.data.get('weeks', 12) # 기본값 12주
        
        if not season_id:
            return Response({'error': '시즌 ID를 입력해주세요.'}, status=status.HTTP_400_BAD_REQUEST)
        
        # 분배 서비스 호출
        result = DistributionService.generate_weekly_distribution_plan(season_id, weeks)
        
        if not result.get('success', False):
            return Response({'error': result.get('error', '알 수 없는 오류가 발생했습니다.')}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response(result)