from django.db import models
from bis_manager.constants import DISTRIBUTION_METHODS

class Season(models.Model):
    name = models.CharField(max_length=100, verbose_name="시즌 이름")
    start_date = models.DateField(verbose_name="시작 날짜")
    end_date = models.DateField(null=True, blank=True, verbose_name="종료 날짜")
    is_active = models.BooleanField(default=True, verbose_name="활성화 여부")
    distribution_method = models.CharField(
        max_length=20,
        choices=DISTRIBUTION_METHODS,
        default='우선순위분배',
        verbose_name="분배 방식"
    )
    
    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name = "시즌"
        verbose_name_plural = "시즌들"