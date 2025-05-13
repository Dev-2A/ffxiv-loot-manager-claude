# ff14_bis_backend/bis_manager/services/distribution_service.py
from django.db.models import Count, Sum, Q
from collections import defaultdict
import copy
import traceback

from bis_manager.models import Season, Player, BisSet, BisItem, DistributionPriority, Item
from bis_manager.constants import ITEM_TYPES, TOMESTONE_COSTS, PAGE_COSTS
from .resource_calculation_service import ResourceCalculationService

import logging
logger = logging.getLogger(__name__)

class DistributionService:
    """아이템 분배 우선순위 계산을 위한 서비스 클래스"""
    
    @staticmethod
    def calculate_priority_for_season(season_id):
        """시즌의 모든 플레이어에 대한 아이템 분배 우선순위 계산"""
        try:
            logger.info(f"===== 분배 우선순위 계산 시작: 시즌 ID={season_id} =====")
            
            season = Season.objects.get(pk=season_id)
            
            # 분배 방식 확인
            if season.distribution_method != '우선순위분배':
                logger.warning(f"시즌 {season.name}의 분배 방식이 '우선순위분배'가 아닙니다: {season.distribution_method}")
                return {
                    'success': False,
                    'error': '이 시즌은 우선순위분배 방식이 아닙니다.'
                }
            
            # 시즌에 참여 중인 모든 플레이어
            players = Player.objects.filter(bis_sets__season=season).distinct()
            logger.info(f"시즌 {season.name}에 참여 중인 플레이어 수: {players.count()}")
            
            # 각 플레이어별 필요 아이템 및 자원 계산
            player_resources = {}
            error_players = []
            
            for player in players:
                logger.info(f"플레이어 처리 시작: {player.nickname} (ID={player.id})")
                try:
                    # 최종 비스 세트 확인
                    final_bis_exists = BisSet.objects.filter(
                        player=player, 
                        season=season, 
                        bis_type='최종'
                    ).exists()
                    
                    if not final_bis_exists:
                        logger.warning(f"플레이어 {player.nickname}의 최종 비스 세트가 없습니다.")
                        continue
                        
                    # 자원 계산 서비스 호출
                    resources = ResourceCalculationService.calculate_resources_for_player(player, season)
                    
                    if not resources:
                        logger.warning(f"플레이어 {player.nickname}의 자원 계산 결과가 없습니다.")
                        continue
                    
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
                        
                        logger.info(f"플레이어 {player.nickname}의 최종 비스 아이템 수: {bis_items.count()}")
                        
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
                            
                            logger.info(f"아이템 추가: {player.nickname} - {item_type} ({item.name}), 비용: {cost}")
                    
                    except BisSet.DoesNotExist:
                        # 최종 비스 세트가 없는 경우
                        logger.warning(f"플레이어 {player.nickname}의 최종 비스 세트를 찾을 수 없습니다.")
                        error_players.append(player.nickname)
                    except Exception as e:
                        logger.error(f"플레이어 {player.nickname}의 비스 아이템 처리 중 오류: {str(e)}")
                        logger.error(traceback.format_exc())
                        error_players.append(player.nickname)
                
                except Exception as e:
                    logger.error(f"플레이어 {player.nickname} 처리 중 오류: {str(e)}")
                    logger.error(traceback.format_exc())
                    error_players.append(player.nickname)
            
            logger.info(f"총 {len(player_resources)} 명의 플레이어 자원 계산 완료")
            logger.info(f"오류 발생한 플레이어: {error_players}")
            
            if not player_resources:
                logger.error("계산된 플레이어 자원 데이터가 없습니다.")
                return {
                    'success': False,
                    'error': '최종 비스 세트가 있는 플레이어가 없습니다.'
                }
            
            # 아이템 타입별 우선순위 계산
            priorities = DistributionService._calculate_item_type_priorities(player_resources)
            logger.info(f"우선순위 계산 결과: {len(priorities)} 개의 아이템 타입에 대한 우선순위 생성")
            
            # 기존 우선순위 데이터 삭제 후 새로 생성
            DistributionPriority.objects.filter(season=season).delete()
            logger.info(f"기존 우선순위 데이터 삭제 완료")
            
            # 우선순위 데이터 저장
            priority_objects = []
            created_count = 0
            
            for item_type, players_priority in priorities.items():
                logger.info(f"아이템 타입 {item_type}에 대한 우선순위: {players_priority}")
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
                        created_count += 1
            
            # 벌크 생성으로 성능 최적화
            if priority_objects:
                DistributionPriority.objects.bulk_create(priority_objects)
                logger.info(f"총 {len(priority_objects)}개의 우선순위 객체 생성 완료")
            
            logger.info("===== 분배 우선순위 계산 완료 =====")
            
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
                },
                'created_count': created_count,
                'player_count': len(player_resources)
            }
            
        except Season.DoesNotExist:
            logger.error(f"시즌 ID {season_id}를 찾을 수 없습니다.")
            return {
                'success': False,
                'error': '존재하지 않는 시즌입니다.'
            }
        except Exception as e:
            logger.error(f"우선순위 계산 중 예외 발생: {str(e)}")
            logger.error(traceback.format_exc())
            return {
                'success': False,
                'error': f'우선순위 계산 중 오류가 발생했습니다: {str(e)}'
            }
    
    @staticmethod
    def _calculate_item_type_priorities(player_resources):
        """아이템 타입별 플레이어 우선순위 계산"""
        priorities = {}
        
        logger.info(f"아이템 타입별 우선순위 계산 시작 (플레이어 수: {len(player_resources)})")
        
        # 모든 아이템 타입에 대해
        for item_type, _ in ITEM_TYPES:
            logger.info(f"아이템 타입 {item_type} 우선순위 계산")
            
            # 해당 아이템을 필요로 하는 플레이어들 정렬 (비용이 높을수록 우선순위 높음)
            players_with_cost = []
            
            for p_id, data in player_resources.items():
                if item_type in data['items']:
                    cost = data['items'][item_type].get('cost', 0)
                    players_with_cost.append((p_id, cost))
                    logger.info(f"플레이어 ID {p_id} ({data['player'].nickname}): {item_type} 비용 {cost}")
                    
            # 비용에 따라 정렬 (비용이 높을수록 우선순위 높음)
            sorted_players = sorted(
                players_with_cost,
                key=lambda x: x[1], reverse=True
            )
            
            # 플레이어 ID만 추출하여 우선순위 리스트 생성
            priorities[item_type] = [p_id for p_id, _ in sorted_players]
            logger.info(f"아이템 타입 {item_type} 우선순위 결과: {priorities[item_type]}")
        
        logger.info(f"아이템 타입별 우선순위 계산 완료: {len(priorities)} 개 아이템 타입")
        return priorities
    
    @staticmethod
    def generate_weekly_distribution_plan(season_id, weeks=12):
        """주간 분배 계획 생성 (최대한 공평하게 분배)"""
        try:
            logger.info(f"주간 분배 계획 생성 시작: 시즌 ID={season_id}, 주차={weeks}")
            
            season = Season.objects.get(pk=season_id)
            
            # 우선순위 데이터 가져오기
            all_priorities = DistributionPriority.objects.filter(season=season).order_by('item_type', 'priority')
            logger.info(f"총 {all_priorities.count()}개의 우선순위 데이터 조회됨")
            
            # 우선순위 데이터가 없으면 먼저 계산
            if not all_priorities.exists():
                logger.info("우선순위 데이터가 없습니다. 먼저 우선순위를 계산합니다.")
                priority_result = DistributionService.calculate_priority_for_season(season_id)
                if not priority_result['success']:
                    return priority_result
                
                # 다시 조회
                all_priorities = DistributionPriority.objects.filter(season=season).order_by('item_type', 'priority')
                logger.info(f"새로 계산된 우선순위 데이터: {all_priorities.count()}개")
            
            # 아이템 타입별 우선순위 정렬
            priorities_by_type = defaultdict(list)
            for priority in all_priorities:
                priorities_by_type[priority.item_type].append({
                    'player_id': priority.player_id,
                    'player_name': priority.player.nickname,
                    'priority': priority.priority
                })
            
            logger.info(f"아이템 타입별 우선순위 정리: {len(priorities_by_type)} 개 아이템 타입")
            
            # 주간 획득 가능 아이템 (기본 영웅 레이드 4층 구조)
            weekly_items = {
                1: ['귀걸이', '목걸이', '팔찌', '반지1', '반지2'],  # 1층 드랍
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
            
            logger.info(f"분배 대상 플레이어 수: {len(player_ids)}")
            
            # 주별 분배 계획 생성
            for week in range(1, weeks + 1):
                logger.info(f"==== {week}주차 분배 계획 생성 ====")
                
                week_plan = {
                    'week': week,
                    'floors': {}
                }
                
                # 각 층별로 아이템 분배
                for floor, item_types in weekly_items.items():
                    logger.info(f"{floor}층 아이템 분배 시작")
                    floor_plan = []
                    
                    for item_type in item_types:
                        logger.info(f"아이템 타입 {item_type} 분배 처리")
                        
                        # 해당 아이템 타입에 대한 우선순위 목록
                        type_priorities = copy.deepcopy(priorities_by_type.get(item_type, []))
                        
                        if not type_priorities:
                            logger.warning(f"아이템 타입 {item_type}에 대한 우선순위 데이터가 없습니다.")
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
                            
                            logger.info(f"분배 결과: {item_type} -> {player_name} (원래 우선순위: {winner['priority']})")
                    
                    week_plan['floors'][floor] = floor_plan
                    logger.info(f"{floor}층 분배 완료: {len(floor_plan)}개 아이템 분배됨")
                
                weekly_plan.append(week_plan)
                logger.info(f"{week}주차 분배 계획 생성 완료")
            
            logger.info(f"총 {weeks}주차 분배 계획 생성 완료")
            logger.info(f"플레이어별 획득 수량: {dict(player_acquisitions)}")
            
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
            logger.error(f"시즌 ID {season_id}를 찾을 수 없습니다.")
            return {
                'success': False,
                'error': '존재하지 않는 시즌입니다.'
            }
        except Exception as e:
            logger.error(f"분배 계획 생성 중 예외 발생: {str(e)}")
            logger.error(traceback.format_exc())
            return {
                'success': False,
                'error': f'분배 계획 생성 중 오류가 발생했습니다: {str(e)}'
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