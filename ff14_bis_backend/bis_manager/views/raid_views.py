from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from bis_manager.models import RaidProgress, ItemAcquisition, DistributionPriority
from bis_manager.serializers import RaidProgressSerializer,ItemAcquisitionSerializer, DistributionPrioritySerializer
from bis_manager.permissions import IsAdminOrReadOnly
from bis_manager.services.distribution_service import DistributionService

import logging
logger = logging.getLogger(__name__)

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
    
    def list(self, request, *args, **kwargs):
        """우선순위 목록 조회 시 로깅 추가"""
        logger.info(f"우선순위 목록 조회 요청: {request.query_params}")
        queryset = self.filter_queryset(self.get_queryset())
        logger.info(f"필터링된 우선순위 개수: {queryset.count()}")
        
        # 페이징 관련 디버깅
        page_size = request.query_params.get('page_size', self.paginator.page_size)
        logger.info(f"요청된 페이지 크기: {page_size}")
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            logger.info(f"반환할 우선순위 데이터 수: {len(serializer.data)}")
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        logger.info(f"반환할 우선순위 데이터 수 (페이징 없음): {len(serializer.data)}")
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def calculate(self, request):
        """우선순위 분배 계산 API"""
        season_id = request.data.get('season')
        
        if not season_id:
            return Response({'error': '시즌 ID를 입력해주세요.'}, status=status.HTTP_400_BAD_REQUEST)
        
        logger.info(f"우선순위 계산 요청: season_id={season_id}")
        
        # 분배 서비스 호출
        result = DistributionService.calculate_priority_for_season(season_id)
        
        if not result.get('success', False):
            logger.error(f"우선순위 계산 실패: {result.get('error', '알 수 없는 오류')}")
            return Response({'error': result.get('error', '알 수 없는 오류가 발생했습니다.')}, status=status.HTTP_400_BAD_REQUEST)
        
        logger.info(f"우선순위 계산 성공: {result.get('created_count', 0)}개 생성됨, 플레이어 수: {result.get('player_count', 0)}")
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