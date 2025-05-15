from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from bis_manager.models import RaidProgress, ItemAcquisition, DistributionPriority, Season
from bis_manager.serializers import RaidProgressSerializer,ItemAcquisitionSerializer, DistributionPrioritySerializer
from bis_manager.permissions import IsAdminOrReadOnly
from bis_manager.services.distribution_service import DistributionService

import traceback
from django.core.cache import cache

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
    
    @action(detail=False, methods=['post'])
    def update_distribution_plan(self, request):
        """주간 분배 계획 수동 업데이트 API (9주차 이후)"""
        season_id = request.data.get('season')
        week = request.data.get('week')
        floor = request.data.get('floor')
        plan_data = request.data.get('plan_data', [])
        
        logger.info(f"분배 계획 수동 업데이트: season_id={season_id}, week={week}, floor={floor}")
        
        if not season_id or not week or not floor:
            return Response({
                'success': False,
                'error': '시즌 ID, 주차, 층 정보가 필요합니다.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if int(week) <= 8:
            return Response({
                'success': False,
                'error': '9주차 이후의 계획만 수동으로 업데이트할 수 있습니다.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            logger.info(f"수동 분배 계획 데이터: {plan_data}")
            
            # 이 시즌에 대한 기존 분배 계획 조회 또는 새로 생성
            season = Season.objects.get(pk=season_id)
            
            # 새 계획 생성 및 캐시에 저장
            cache_key = f"distribution_plan_{season_id}"
            distribution_plan = cache.get(cache_key)
            
            if not distribution_plan:
                # 새로 계획 생성
                result = DistributionService.generate_weekly_distribution_plan(season_id, 12)
                if not result.get('success', False):
                    return Response(result, status=status.HTTP_400_BAD_REQUEST)
                
                distribution_plan = result
            
            # 해당 주차, 층의 계획 업데이트
            updated = False
            for week_plan in distribution_plan['weekly_plan']:
                if week_plan['week'] == int(week):
                    week_plan['floors'][str(floor)] = plan_data
                    week_plan['manual_input'] = True
                    updated = True
                    break
            
            if not updated:
                return Response({
                    'success': False,
                    'error': f'{week}주차 분배 계획을 찾을 수 없습니다.'
                }, status=status.HTTP_404_NOT_FOUND)
            
            # 캐시에 업데이트된 계획 저장
            cache.set(cache_key, distribution_plan, 60*60*24) # 24시간 캐시
            
            # 업데이트 된 계획 반환
            return Response({
                'success': True,
                'message': f'{week}주차 {floor}층 분배 계획이 업데이트되었습니다.',
                'updated_plan': distribution_plan
            })
            
        except Season.DoesNotExist:
            return Response({
                'success': False,
                'error': '존재하지 않는 시즌입니다.'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"분배 계획 수동 업데이트 중 예외 발생: {str(e)}")
            logger.error(traceback.format_exc())
            return Response({
                'success': False,
                'error': f'분배 계획 업데이트 중 오류가 발생했습니다: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)