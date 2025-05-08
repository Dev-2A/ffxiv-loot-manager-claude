from django.db import models
from .user import CustomUser

class Schedule(models.Model):
    REPEAT_CHOICES = (
        ('none', '반복 없음'),
        ('daily', '매일'),
        ('weekly', '매주'),
        ('monthly', '매월'),
    )
    
    title = models.CharField(max_length=100, verbose_name="일정 제목")
    description = models.TextField(blank=True, null=True, verbose_name="일정 설명")
    start_time = models.DateTimeField(verbose_name="시작 시간")
    end_time = models.DateTimeField(verbose_name="종료 시간")
    creator = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name="created_schedules",
        verbose_name="작성자"
    )
    is_admin_schedule = models.BooleanField(default=False, verbose_name="관리자 일정 여부")
    repeat_type = models.CharField(
        max_length=10,
        choices=REPEAT_CHOICES,
        default='none',
        verbose_name="반복 유형"
    )
    repeat_days = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        verbose_name="반복 요일 (쉼표로 구분 1-7, 1:월요일)"
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="생성 시간")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="수정 시간")
    
    def __str__(self):
        return self.title
    
    class Meta:
        verbose_name = "일정"
        verbose_name_plural = "일정들"