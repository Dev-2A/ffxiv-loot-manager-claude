# ff14_bis_backend/bis_manager/views/resource_views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from bis_manager.models import ResourceTracking, Player, Season
from bis_manager.serializers import ResourceTrackingSerializer
from bis_manager.permissions import IsAdminOrReadOnly
from bis_manager.services.resource_calculation_service import ResourceCalculationService

import logging
logger = logging.getLogger(__name__)

class ResourceTrackingViewSet(viewsets.ModelViewSet):
    queryset = ResourceTracking.objects.all()
    serializer_class = ResourceTrackingSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['player', 'season', 'resource_type']
    
    def list(self, request, *args, **kwargs):
        """리소스 목록 조회 시 로깅 추가"""
        logger.info(f"자원 목록 조회: 쿼리 파라미터={request.query_params}")
        print(f"[DEBUG] 자원 목록 조회: 쿼리 파라미터={request.query_params}")
        return super().list(request, *args, **kwargs)
    
    @action(detail=False, methods=['post'])
    def calculate_needs(self, request):
        """플레이어의 최종 비스에 필요한 재화 계산"""
        player_id = request.data.get('player')
        season_id = request.data.get('season')
        
        logger.info(f"calculate_needs 호출: player_id={player_id}, season_id={season_id}")
        print(f"[DEBUG] calculate_needs 호출: player_id={player_id}, season_id={season_id}")
        
        if not player_id or not season_id:
            return Response({'error': '플레이어 ID와 시즌 ID를 모두 입력해주세요.'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            player = Player.objects.get(pk=player_id)
            season = Season.objects.get(pk=season_id)
        except (Player.DoesNotExist, Season.DoesNotExist):
            return Response({'error': '존재하지 않는 플레이어 또는 시즌입니다.'}, status=status.HTTP_404_NOT_FOUND)
        
        # 재화 계산 서비스 호출
        try:
            resources = ResourceCalculationService.calculate_resources_for_player(player, season)
            
            if not resources:
                return Response({'error': '이 플레이어의 최종 비스 세트가 존재하지 않습니다.'},
                               status=status.HTTP_404_NOT_FOUND)
            
            # 계산 결과 반환
            response_data = {
                'success': True,
                'player': {
                    'id': player.id,
                    'nickname': player.nickname
                },
                'season': {
                    'id': season.id,
                    'name': season.name
                },
                'resources': resources
            }
            
            # 응답 로깅
            logger.info(f"자원 계산 성공: player_id={player_id}, season_id={season_id}")
            print(f"[DEBUG] 자원 계산 성공: player_id={player_id}, season_id={season_id}")
            
            return Response(response_data)
        except Exception as e:
            logger.error(f"자원 계산 중 오류 발생: {str(e)}", exc_info=True)
            print(f"[ERROR] 자원 계산 중 오류 발생: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response({'error': f'자원 계산 중 오류가 발생했습니다: {str(e)}'},
                           status=status.HTTP_500_INTERNAL_SERVER_ERROR)