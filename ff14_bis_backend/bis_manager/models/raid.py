from django.db import models
from bis_manager.constants import RAID_FLOORS, ITEM_TYPES
from .season import Season
from .player import Player
from .item import Item

class RaidProgress(models.Model):
    season = models.ForeignKey(
        Season,
        on_delete=models.CASCADE,
        related_name='raid_progresses',
        verbose_name="시즌"
    )
    raid_date = models.DateField(verbose_name="레이드 날짜")
    floor = models.IntegerField(
        choices=RAID_FLOORS,
        verbose_name="층수"
    )
    notes = models.TextField(blank=True, null=True, verbose_name="메모")
    
    class Meta:
        unique_together = ('season', 'raid_date', 'floor')
        verbose_name = "레이드 진행"
        verbose_name_plural = "레이드 진행들"
    
    def __str__(self):
        return f"{self.season.name} - {self.raid_date} - {self.get_floor_display()}"

class ItemAcquisition(models.Model):
    raid_progress = models.ForeignKey(
        RaidProgress,
        on_delete=models.CASCADE,
        related_name='acquisitions',
        verbose_name="레이드 진행"
    )
    player = models.ForeignKey(
        Player,
        on_delete=models.CASCADE,
        related_name='acquisitions',
        verbose_name="플레이어"
    )
    item = models.ForeignKey(
        Item,
        on_delete=models.CASCADE,
        related_name='acquisitions',
        verbose_name="획득 아이템"
    )
    
    class Meta:
        verbose_name = "아이템 획득"
        verbose_name_plural = "아이템 획득들"
    
    def __str__(self):
        return f"{self.raid_progress} - {self.player.nickname}이(가) {self.item.name} 획득"

class DistributionPriority(models.Model):
    season = models.ForeignKey(
        Season,
        on_delete=models.CASCADE,
        related_name='distribution_priorities',
        verbose_name="시즌"
    )
    player = models.ForeignKey(
        Player,
        on_delete=models.CASCADE,
        related_name='distribution_priorities',
        verbose_name="플레이어"
    )
    item_type = models.CharField(
        max_length=20,
        choices=ITEM_TYPES,
        verbose_name="아이템 종류"
    )
    priority = models.IntegerField(verbose_name="우선순위") # 1이 가장 높은 우선순위
    
    class Meta:
        unique_together = ('season', 'player', 'item_type')
        verbose_name = "분배 우선순위"
        verbose_name_plural = "분배 우선순위들"
    
    def __str__(self):
        return f"{self.season.name} - {self.player.nickname}의 {self.get_item_type_display()} 우선순위: {self.priority}"