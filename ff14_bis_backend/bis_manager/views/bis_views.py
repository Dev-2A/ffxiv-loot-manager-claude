from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from bis_manager.models import BisSet, BisItem, Materia, Item
from bis_manager.serializers import BisSetSerializer, BisItemSerializer, MateriaSerializer
from bis_manager.permissions import IsAdminOrReadOnly

class BisSetViewSet(viewsets.ModelViewSet):
    queryset = BisSet.objects.all()
    serializer_class = BisSetSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['player', 'season', 'bis_type']
    
    @action(detail=True, methods=['post'])
    def add_item(self, request, pk=None):
        """비스 세트에 아이템 추가"""
        bis_set = self.get_object()
        
        # 요청 데이터 검증
        item_id = request.data.get('item_id')
        slot = request.data.get('slot')
        
        if not item_id or not slot:
            return Response({'error': '아이템 ID와 슬롯을 모두 입력해주세요.'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            item = Item.objects.get(pk=item_id)
        except Item.DoesNotExist:
            return Response({'error': '존재하지 않는 아이템입니다.'}, status=status.HTTP_404_NOT_FOUND)
        
        # 기존 슬롯 아이템 체크
        try:
            existing_item = BisItem.objects.get(bis_set=bis_set, slot=slot)
            existing_item.item = item
            existing_item.save()
            created = False
        except BisItem.DoesNotExist:
            bis_item = BisItem.objects.create(bis_set=bis_set, item=item, slot=slot)
            created = True
        
        return Response({
            'status': '아이템이 추가되었습니다.',
            'created': created
        })

class BisItemViewSet(viewsets.ModelViewSet):
    queryset = BisItem.objects.all()
    serializer_class = BisItemSerializer
    permission_classes = [IsAdminOrReadOnly]
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
        try:
            existing_materia = Materia.objects.get(bis_item=bis_item, slot_number=slot_number)
            existing_materia.type = materia_type
            existing_materia.save()
        except Materia.DoesNotExist:
            Materia.objects.create(bis_item=bis_item, type=materia_type, slot_number=slot_number)
            created = True
        
        return Response({
            'status': '마테리쟈가 추가되었습니다.',
            'created': created
        })