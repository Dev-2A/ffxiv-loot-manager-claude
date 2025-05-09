from django.db import models, transaction
from bis_manager.constants import ITEM_TYPES, MATERIA_TYPES, BIS_TYPES
from .season import Season
from .player import Player
from .item import Item

import logging
logger = logging.getLogger(__name__)

class BisSet(models.Model):
    player = models.ForeignKey(
        Player,
        on_delete=models.CASCADE,
        related_name='bis_sets',
        verbose_name="플레이어"
    )
    season = models.ForeignKey(
        Season,
        on_delete=models.CASCADE,
        related_name='bis_sets',
        verbose_name="시즌"
    )
    bis_type = models.CharField(
        max_length=10,
        choices=BIS_TYPES,
        verbose_name="비스 종류"
    )
    
    class Meta:
        unique_together = ('player', 'season', 'bis_type')
        verbose_name = "비스 세트"
        verbose_name_plural = "비스 세트들"
    
    def __str__(self):
        return f"{self.player.nickname}의 {self.get_bis_type_display()} ({self.season.name})"
    
    def save(self, *args, **kwargs):
        """저장 과정을 로깅"""
        # 로깅 - ID가 None인 경우(신규 생성) 처리
        id_info = f"ID={self.id}" if self.id else "새 객체"
        logger.info(
            f"BisSet.save 호출: {id_info}, player_id={self.player_id}, "
            f"season_id={self.season_id}, bis_type={self.bis_type}"
        )
        
        # 원래 저장 로직 실행
        super().save(*args, **kwargs)
        
        # 저장 후 로깅
        logger.info(f"BisSet 저장 완료: ID={self.id}, bis_type={self.bis_type}")

class BisItem(models.Model):
    bis_set = models.ForeignKey(
        BisSet,
        on_delete=models.CASCADE,
        related_name='items',
        verbose_name="소속 비스 세트"
    )
    item = models.ForeignKey(
        Item,
        on_delete=models.CASCADE,
        related_name='bis_items',
        verbose_name="아이템"
    )
    slot = models.CharField(
        max_length=20,
        choices=ITEM_TYPES,
        verbose_name="장착 슬롯"
    )
    
    class Meta:
        unique_together = ('bis_set', 'slot')
        verbose_name = "비스 아이템"
        verbose_name_plural = "비스 아이템들"
    
    def __str__(self):
        return f"{self.bis_set}의 {self.get_slot_display()} - {self.item.name}"
    
    def save(self, *args, **kwargs):
        """저장 과정을 로깅하고 각 비스 세트는 독립적으로 처리"""
        # 로깅
        id_info = f"ID={self.id}" if self.id else "새 객체"
        bis_set_info = f"bis_set_id={self.bis_set_id}" if self.bis_set_id else "bis_set 없음"
        
        logger.info(
            f"BisItem.save 호출: {id_info}, {bis_set_info}, "
            f"slot={self.slot}, item_id={self.item_id if hasattr(self, 'item') else None}"
        )
        
        # 트랜잭션으로 각 비스 세트를 독립적으로 처리
        with transaction.atomic():
            # 원래 저장 로직 실행
            super().save(*args, **kwargs)
        
        # 저장 후 로깅
        logger.info(f"BisItem 저장 완료: ID={self.id}, bis_set_id={self.bis_set_id}, slot={self.slot}")
    
    def get_max_materia_slots(self):
        """아이템에 장착 가능한 최대 마테리쟈 슬롯 수 반환"""
        if self.item.source == '제작템':
            return 5
        elif self.slot in ['귀걸이', '목걸이', '팔찌', '반지1', '반지2']:
            return 1
        else: # 무기, 방어구
            return 2

class Materia(models.Model):
    bis_item = models.ForeignKey(
        BisItem,
        on_delete=models.CASCADE,
        related_name='materias',
        verbose_name="소속 비스 아이템"
    )
    type = models.CharField(
        max_length=20,
        choices=MATERIA_TYPES,
        verbose_name="마테리쟈 종류"
    )
    slot_number = models.IntegerField(verbose_name="마테리쟈 슬롯 번호") # 1부터 시작하는 슬롯 번호
    
    class Meta:
        unique_together = ('bis_item', 'slot_number')
        verbose_name = "마테리쟈"
        verbose_name_plural = "마테리쟈들"
    
    def __str__(self):
        return f"{self.bis_item}의 마테리쟈 {self.slot_number}번 - {self.get_type_display()}"
    
    def save(self, *args, **kwargs):
        """저장 과정 로깅"""
        # 로깅
        id_info = f"ID={self.id}" if self.id else "새 객체"
        logger.info(
            f"Materia.save 호출: {id_info}, "
            f"bis_item_id={self.bis_item_id}, type={self.type}, slot_number={self.slot_number}"
        )
        
        # 원래 저장 로직 실행
        super().save(*args, **kwargs)
        
        # 저장 후 로깅
        logger.info(f"Materia 저장 완료: ID={self.id}, type={self.type}")
    
    def clean(self):
        from django.core.exceptions import ValidationError
        
        # 슬롯 번호 유효성 검사
        max_slots = self.bis_item.get_max_materia_slots()
        if self.slot_number < 1 or self.slot_number > max_slots:
            raise ValidationError(f"마테리쟈 슬롯 번호는 1에서 {max_slots} 사이여야 합니다.")