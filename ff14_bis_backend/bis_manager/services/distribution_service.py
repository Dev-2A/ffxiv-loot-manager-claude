from django.db.models import Count, Sum
from collections import defaultdict
import copy

from bis_manager.models import Season, Player, BisSet, BisItem, DistributionPriority, Item
from bis_manager.constants import ITEM_TYPES, TOMESTONE_COSTS, PAGE_COSTS
from .resource_calculation_service import ResourceCalculationService

class DistributionService:
    """아이템 분배 우선순위 계산을 위한 서비스 클래스"""
    
    @staticmethod
    def calculate_priority_for_season(season_id):
        """시즌의 모든 플레이어에 대한 아이템 분배 우선순위 계산"""
        try:
            season = Season.objects.get(pk=season_id)
            
            # 분배 방식 확인
            if season.distribution_method != '우선순위분배':
                return {
                    'success': False,
                    'error': '이 시즌은 우선순위분배 방식이 아닙니다.'
                }
            
            # 시즌에 참여 중인 모든 플레이어
            players = Player.objects.filter(bis_sets__season=season).distinct()
            
            # 각 플레이어별 필요 아이템 및 자원 계산
            player_resources = {}
            
            for player in players:
                # 자원 계산 서비스 호출
                resources = ResourceCalculationService.calculate_resources_for_player(player, season)
                
                if resources:
                    player_resources[player.id] = {
                        'player': player,
                        'resources': resources,
                        'total_cost': sum(resources.values()),  # 총 자원 비용
                        'items': {}  # 각 슬롯별 아이템 정보
                    }
                    
                    # 최종 비스 세트의 각 슬롯별 아이템 정보 수집
                    try:
                        final_bis = BisSet.objects.get(player=player, season=season, bis_type='최종')
                        bis_items = BisItem.objects.filter(bis_set=final_bis)
                        
                        for bis_item in bis_items:
                            item_type = bis_item.slot
                            item = bis_item.item
                            
                            # 각 슬롯별 아이템 정보와 비용 저장
                            cost = 0
                            
                            if item.source in ['석판템', '보강석판템']:
                                cost += TOMESTONE_COSTS.get(item_type, 0)
                            elif item.source == '영웅레이드템':
                                if item_type in PAGE_COSTS:
                                    floor = PAGE_COSTS[item_type]['floor']
                                    count = PAGE_COSTS[item_type]['count']
                                    cost += count
                            
                            player_resources[player.id]['items'][item_type] = {
                                'item': item,
                                'cost': cost
                            }
                    
                    except BisSet.DoesNotExist:
                        # 최종 비스 세트가 없는 경우
                        pass
            
            # 아이템 타입별 우선순위 계산
            priorities = DistributionService._calculate_item_type_priorities(player_resources)
            
            # 기존 우선순위 데이터 삭제 후 새로 생성
            DistributionPriority.objects.filter(season=season).delete()
            
            # 우선순위 데이터 저장
            priority_objects = []
            
            for item_type, players_priority in priorities.items():
                for priority_rank, player_id in enumerate(players_priority, 1):
                    if player_id in player_resources:  # 플레이어 데이터가 있는 경우만
                        priority_objects.append(
                            DistributionPriority(
                                season=season,
                                player=player_resources[player_id]['player'],
                                item_type=item_type,
                                priority=priority_rank
                            )
                        )
            
            # 벌크 생성으로 성능 최적화
            if priority_objects:
                DistributionPriority.objects.bulk_create(priority_objects)
            
            return {
                'success': True,
                'priorities': priorities,
                'player_resources': {
                    p_id: {
                        'player_name': data['player'].nickname,
                        'total_cost': data['total_cost'],
                        'resources': data['resources']
                    }
                    for p_id, data in player_resources.items()
                }
            }
            
        except Season.DoesNotExist:
            return {
                'success': False,
                'error': '존재하지 않는 시즌입니다.'
            }
    
    @staticmethod
    def _calculate_item_type_priorities(player_resources):
        """아이템 타입별 플레이어 우선순위 계산"""
        priorities = {}
        
        # 모든 아이템 타입에 대해
        for item_type, _ in ITEM_TYPES:
            # 해당 아이템을 필요로 하는 플레이어들 정렬 (비용이 높을수록 우선순위 높음)
            players_by_cost = sorted(
                [
                    (p_id, data['items'].get(item_type, {}).get('cost', 0))
                    for p_id, data in player_resources.items()
                    if item_type in data['items']
                ],
                key=lambda x: x[1], reverse=True
            )
            
            # 플레이어 ID만 추출하여 우선순위 리스트 생성
            priorities[item_type] = [p_id for p_id, _ in players_by_cost]
        
        return priorities
    
    @staticmethod
    def generate_weekly_distribution_plan(season_id, weeks=12):
        """주간 분배 계획 생성 (최대한 공평하게 분배)"""
        try:
            season = Season.objects.get(pk=season_id)
            
            # 우선순위 데이터 가져오기
            all_priorities = DistributionPriority.objects.filter(season=season).order_by('item_type', 'priority')
            
            # 아이템 타입별 우선순위 정렬
            priorities_by_type = defaultdict(list)
            for priority in all_priorities:
                priorities_by_type[priority.item_type].append({
                    'player_id': priority.player_id,
                    'player_name': priority.player.nickname,
                    'priority': priority.priority
                })
            
            # 주간 획득 가능 아이템 (기본 영웅 레이드 4층 구조)
            weekly_items = {
                1: ['귀걸이', '목걸이', '팔찌', '반지1'],  # 1층 드랍
                2: ['모자', '장갑', '신발'],  # 2층 드랍
                3: ['상의', '하의'],  # 3층 드랍
                4: ['무기']  # 4층 드랍
            }
            
            # 주간 분배 계획
            weekly_plan = []
            
            # 플레이어별 아이템 획득 횟수 추적
            player_acquisitions = defaultdict(int)
            
            # 분배 수행할 플레이어 ID 목록 (우선순위 데이터에서 추출)
            player_ids = set()
            for priorities in priorities_by_type.values():
                for p in priorities:
                    player_ids.add(p['player_id'])
            
            # 주별 분배 계획 생성
            for week in range(1, weeks + 1):
                week_plan = {
                    'week': week,
                    'floors': {}
                }
                
                # 각 층별로 아이템 분배
                for floor, item_types in weekly_items.items():
                    floor_plan = []
                    
                    for item_type in item_types:
                        # 해당 아이템 타입에 대한 우선순위 목록
                        type_priorities = copy.deepcopy(priorities_by_type.get(item_type, []))
                        
                        if not type_priorities:
                            continue
                        
                        # 이미 많은 아이템을 획득한 플레이어 우선순위 조정
                        adjusted_priorities = DistributionService._adjust_priorities_for_fairness(
                            type_priorities, 
                            player_acquisitions
                        )
                        
                        # 가장 높은 우선순위 플레이어에게 아이템 분배
                        if adjusted_priorities:
                            winner = adjusted_priorities[0]
                            player_id = winner['player_id']
                            player_name = winner['player_name']
                            
                            # 플레이어 획득 횟수 증가
                            player_acquisitions[player_id] += 1
                            
                            floor_plan.append({
                                'item_type': item_type,
                                'player_id': player_id,
                                'player_name': player_name,
                                'original_priority': winner['priority']
                            })
                    
                    week_plan['floors'][floor] = floor_plan
                
                weekly_plan.append(week_plan)
            
            return {
                'success': True,
                'weekly_plan': weekly_plan,
                'player_acquisitions': {
                    player_id: count 
                    for player_id, count in sorted(
                        player_acquisitions.items(), 
                        key=lambda x: x[1], 
                        reverse=True
                    )
                }
            }
            
        except Season.DoesNotExist:
            return {
                'success': False,
                'error': '존재하지 않는 시즌입니다.'
            }
    
    @staticmethod
    def _adjust_priorities_for_fairness(type_priorities, player_acquisitions):
        """공정한 분배를 위해 우선순위 재조정"""
        # 아이템을 1개도 받지 못한 플레이어 우선
        zero_acquisition_players = [
            p for p in type_priorities
            if player_acquisitions.get(p['player_id'], 0) == 0
        ]
        
        if zero_acquisition_players:
            # 원래 우선순위에 따라 정렬
            return sorted(zero_acquisition_players, key=lambda x: x['priority'])
        
        # 획득 횟수에 따라 우선순위 조정
        for p in type_priorities:
            p['adjusted_priority'] = p['priority'] + (player_acquisitions.get(p['player_id'], 0) * 2)
        
        # 조정된 우선순위에 따라 정렬
        return sorted(type_priorities, key=lambda x: x['adjusted_priority'])