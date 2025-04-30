from bis_manager.constants import TOMESTONE_COSTS, PAGE_COSTS, UPGRADE_COSTS
from bis_manager.models import BisSet, BisItem, Item, ResourceTracking

class ResourceCalculationService:
    """비스 세트에 필요한 재화 계산을 위한 서비스 클래스"""
    
    @staticmethod
    def calculate_resources_for_player(player, season):
        """플레이어의 최종 비스에 필요한 모든 재화 계산"""
        try:
            # 최종 비스 세트 가져오기
            final_bis = BisSet.objects.get(player=player, season=season, bis_type='최종')
            
            # 필요한 재화 초기화
            resources = {
                '석판': 0,
                '낱장_1층': 0,
                '낱장_2층': 0,
                '낱장_3층': 0,
                '낱장_4층': 0,
                '경화약': 0,
                '강화섬유': 0,
                '무기석판': 0,
            }
            
            # 각 슬롯별 아이템 확인
            bis_items = BisItem.objects.filter(bis_set=final_bis)
            
            for bis_item in bis_items:
                item = bis_item.item
                item_type = bis_item.slot
                
                # 아이템 출처에 따라 필요한 재화 계산
                if item.source == '보강석판템':
                    # 석판템 + 강화 아이템 비용 추가
                    if item_type in TOMESTONE_COSTS:
                        resources['석판'] += TOMESTONE_COSTS[item_type]
                    
                        # 강화 아이템 필요 (방어구: 강화섬유, 장신구: 경화약, 무기: 무기석판)
                        if item_type in ['모자', '상의', '장갑', '하의', '신발']:
                            resources['강화섬유'] += 1
                        elif item_type in ['귀걸이', '목걸이', '팔찌', '반지1', '반지2']:
                            resources['경화약'] += 1
                        elif item_type == '무기':
                            resources['무기석판'] += 1
                
                elif item.source == '석판템':
                    # 석판 비용만 추가
                    if item_type in TOMESTONE_COSTS:
                        resources['석판'] += TOMESTONE_COSTS[item_type]
                
                elif item.source == '영웅레이드템':
                    # 영웅 레이드템은 낱장으로 교환 가능
                    if item_type in PAGE_COSTS:
                        floor = PAGE_COSTS[item_type]['floor']
                        count = PAGE_COSTS[item_type]['count']
                        resources[f'낱장_{floor}층'] += count
            
            # 강화 아이템을 직접 낱장으로 교환할 경우 필요한 낱장 계산
            if resources['경화약'] > 0:
                resources['낱장_2층'] += resources['경화약'] * UPGRADE_COSTS['경화약']['count']
            
            if resources['강화섬유'] > 0:
                resources['낱장_3층'] += resources['강화섬유'] * UPGRADE_COSTS['강화섬유']['count']
            
            if resources['무기석판'] > 0:
                resources['낱장_2층'] += resources['무기석판'] * UPGRADE_COSTS['무기석판']['count']
            
            # ResourceTracking 모델 업데이트
            for resource_type, amount in resources.items():
                ResourceTracking.objects.update_or_create(
                    player=player,
                    season=season,
                    resource_type=resource_type,
                    defaults={'total_needed': amount}
                )
            
            return resources
        
        except BisSet.DoesNotExist:
            # 최종 비스 세트가 없는 경우
            return None