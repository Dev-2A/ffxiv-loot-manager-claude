from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db import transaction

from bis_manager.models import BisSet, BisItem, Materia, Item
from bis_manager.serializers import BisSetSerializer, BisItemSerializer, MateriaSerializer
from bis_manager.permissions import IsBisSetOwnerOrAdmin

import logging
logger = logging.getLogger(__name__)

class BisSetViewSet(viewsets.ModelViewSet):
    queryset = BisSet.objects.all()
    serializer_class = BisSetSerializer
    permission_classes = [IsBisSetOwnerOrAdmin]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['player', 'season', 'bis_type']
    
    @action(detail=True, methods=['post'])
    @transaction.atomic
    def add_item(self, request, pk=None):
        """비스 세트에 아이템 추가 - 각 비스 세트는 독립적으로 처리"""
        bis_set = self.get_object()
        logger.info(f"add_item 호출: BisSet ID={pk}, bis_type={bis_set.bis_type}")
        
        # 디버깅 정보 추가
        logger.info(f"사용자: {request.user.username}, 닉네임: {request.user.nickname}")
        logger.info(f"플레이어: {bis_set.player.nickname}, ID: {bis_set.player.id}")
        logger.info(f"권한 검사: {request.user.nickname == bis_set.player.nickname}")
        logger.info(f"사용자 타입: {request.user.user_type}, 관리자 여부: {request.user.is_staff}")
        
        # 권한 추가 검사 - user.nickname과 player.nickname 비교
        if not request.user.is_staff and not request.user.user_type == 'admin':
            if not request.user.nickname or request.user.nickname != bis_set.player.nickname:
                return Response(
                    {'error': '본인의 캐릭터 비스 세트만 수정할 수 있습니다. 프로필에서 닉네임을 확인해주세요.'},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        # 요청 데이터 검증
        item_id = request.data.get('item_id')
        slot = request.data.get('slot')
        
        if not item_id or not slot:
            return Response({'error': '아이템 ID와 슬롯을 모두 입력해주세요.'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            item = Item.objects.get(pk=item_id)
            
            #반지 유효성 검사 추가
            if slot in ['반지1', '반지2'] and item.source == '영웅레이드템':
                # 다른 반지 슬롯 확인
                other_ring_slot = '반지1' if slot == '반지2' else '반지2'
                try:
                    # 다른 반지 슬롯에 같은 아이템이 있는지 확인
                    other_ring_item = BisItem.objects.get(
                        bis_set=bis_set,
                        slot=other_ring_slot
                    )
                    if other_ring_item.item_id == item_id:
                        return Response(
                            {'error': '동일한 레이드 반지 2개를 착용할 수 없습니다.'},
                            status=status.HTTP_400_BAD_REQUEST
                        )
                except BisItem.DoesNotExist:
                    # 다른 슬롯에 아이템이 없으면 검사 통과
                    pass
            
        except Item.DoesNotExist:
            return Response({'error': '존재하지 않는 아이템입니다.'}, status=status.HTTP_400_BAD_REQUEST)
        
        created = False
        # 트랜잭션 내에서 해당 아이템만 업데이트하고, 코드 실행 중 다른 작업을 차단
        with transaction.atomic():
            try:
                # 기존 아이템이 있는지 확인 - 명시적으로 현재 비스 세트만 대상으로 함
                existing_item = BisItem.objects.select_for_update().filter(
                    bis_set_id=bis_set.id,  # 명시적으로 bis_set_id를 지정
                    slot=slot
                ).first()
                
                if existing_item:
                    # 아이템 업데이트 - 특정 필드만 변경
                    existing_item.item = item
                    # 수정된 필드만 저장
                    existing_item.save(update_fields=['item'])
                    logger.info(f"기존 아이템 업데이트: BisItem ID={existing_item.id}, Item ID={item.id}")
                    created = False
                else:
                    # 새 아이템 생성 - 명시적으로 현재 비스 세트에만 추가
                    bis_item = BisItem(
                        bis_set_id=bis_set.id,  # 명시적으로 bis_set_id를 지정
                        item=item,
                        slot=slot
                    )
                    bis_item.save()
                    logger.info(f"새 아이템 생성: BisSet ID={bis_set.id}, Item ID={item.id}")
                    created = True
            except Exception as e:
                logger.error(f"아이템 추가 중 오류 발생: {str(e)}")
                return Response({'error': f'아이템 추가 중 오류가 발생했습니다: {str(e)}'}, 
                               status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # BisSet 객체 갱신하여 프론트엔드가 최신 정보를 받도록 함
        bis_set.refresh_from_db()
        
        return Response({
            'status': '아이템이 추가되었습니다.',
            'created': created
        })

class BisItemViewSet(viewsets.ModelViewSet):
    queryset = BisItem.objects.all()
    serializer_class = BisItemSerializer
    permission_classes = [IsBisSetOwnerOrAdmin]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['bis_set', 'slot']
    
    @action(detail=True, methods=['post'])
    def add_materia(self, request, pk=None):
        """비스 아이템에 마테리쟈 추가"""
        bis_item = self.get_object()
        
        # 요청 데이터 검증
        materia_type = request.data.get('type')
        slot_number = request.data.get('slot_number')
        
        if not materia_type or slot_number is None:
            return Response({'error': '마테리쟈 종류와 슬롯 번호를 모두 입력해주세요.'}, status=status.HTTP_400_BAD_REQUEST)
        
        # 슬롯 수 검증
        max_slots = bis_item.get_max_materia_slots()
        
        if int(slot_number) < 1 or int(slot_number) > max_slots:
            return Response({'error': f'이 아이템에는 최대 {max_slots}개의 마테리쟈만 장착할 수 있습니다.'}, status=status.HTTP_400_BAD_REQUEST)
        
        # 기존 마테리쟈 체크
        created = False
        try:
            existing_materia = Materia.objects.get(bis_item=bis_item, slot_number=slot_number)
            existing_materia.type = materia_type
            existing_materia.save()
        except Materia.DoesNotExist:
            Materia.objects.create(bis_item=bis_item, type=materia_type, slot_number=slot_number)
            created = True
        except Exception as e:
            logger.error(f"마테리쟈 추가 중 오류 발생: {str(e)}")
            return Response({'error': f'마테리쟈 추가 중 오류가 발생했습니다: {str(e)}'}, 
                           status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response({
            'status': '마테리쟈가 추가되었습니다.',
            'created': created
        })
    
    @action(detail=True, methods=['POST'])
    def remove_all_materias(self, request, pk=None):
        """비스 아이템의 모든 마테리쟈 제거"""
        bis_item = self.get_object()
        
        # 로깅 추가
        logger.info(f"remove_all_materias 호출: BisItem ID={bis_item.id}")
        
        # 권한 체크 - 본인 캐릭터의 비스 세트인지 확인
        if not request.user.is_staff and not request.user.user_type == 'admin':
            if not request.user.nickname or request.user.nickname != bis_item.bis_set.player.nickname:
                return Response(
                    {'error': '본인의 캐릭터 비스 세트만 수정할 수 있습니다.'},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        try:
            # 트랜잭션으로 처리하여 일관성 유지
            with transaction.atomic():
                # 해당 BisItem에 연결된 모든 마테리쟈 삭제
                materias_count = bis_item.materias.count()
                bis_item.materias.all().delete()
                
                logger.info(f"마테리쟈 {materias_count}개 삭제 완료: BisItem ID={bis_item.id}")
                
                return Response({
                    'status': '성공',
                    'message': f'{materias_count}개의 마테리쟈가 성공적으로 제거되었습니다.',
                    'removed_count': materias_count
                })
        except Exception as e:
            logger.error(f"마테리쟈 제거 중 오류 발생: {str(e)}")
            return Response(
                {'error': f'마테리쟈 제거 중 오류가 발생했습니다: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )