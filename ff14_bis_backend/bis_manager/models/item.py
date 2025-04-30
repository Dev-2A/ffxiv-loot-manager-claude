from django.db import models
from bis_manager.constants import ITEM_TYPES, ITEM_SOURCES
from .season import Season

class Item(models.Model):
    season = models.ForeignKey(
        Season,
        on_delete=models.CASCADE,
        related_name='items',
        verbose_name="소속 시즌"
    )
    name = models.CharField(max_length=100, verbose_name="아이템 이름")
    type = models.CharField(
        max_length=20,
        choices=ITEM_TYPES,
        verbose_name="아이템 종류"
    )
    source = models.CharField(
        max_length=20,
        choices=ITEM_SOURCES,
        verbose_name="아이템 출처"
    )
    item_level = models.IntegerField(verbose_name="아이템 레벨")
    
    def __str__(self):
        return f"{self.name} ({self.get_type_display()}, {self.get_source_display()})"
    
    class Meta:
        verbose_name = "아이템"
        verbose_name_plural = "아이템들"