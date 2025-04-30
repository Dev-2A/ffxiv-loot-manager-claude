from django.db import models
from bis_manager.constants import RESOURCE_TYPES
from .season import Season
from .player import Player

class ResourceTracking(models.Model):
    player = models.ForeignKey(
        Player,
        on_delete=models.CASCADE,
        related_name='resources',
        verbose_name="플레이어"
    )
    season = models.ForeignKey(
        Season,
        on_delete=models.CASCADE,
        related_name='resources',
        verbose_name="시즌"
    )
    resource_type = models.CharField(
        max_length=20,
        choices=RESOURCE_TYPES,
        verbose_name="재화 종류"
    )
    current_amount = models.IntegerField(default=0, verbose_name="현재 보유량")
    total_needed = models.IntegerField(default=0, verbose_name="총 필요량")
    
    class Meta:
        unique_together = ('player', 'season', 'resource_type')
        verbose_name = "재화 현황"
        verbose_name_plural = "재화 현황들"
    
    def __str__(self):
        return f"{self.player.nickname}의 {self.get_resource_type_display()} - {self.current_amount}/{self.total_needed}"