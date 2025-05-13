from django.db import models
from bis_manager.constants import JOB_CHOICES, JOB_TYPES

class Player(models.Model):
    nickname = models.CharField(max_length=50, unique=True, verbose_name="닉네임")
    job = models.CharField(
        max_length=20,
        choices=JOB_CHOICES,
        verbose_name="직업"
    )
    job_type = models.CharField(
        max_length=10,
        choices=JOB_TYPES,
        verbose_name="직업 타입"
    )
    
    # 연결된 사용자 (옵션) - 사용자와 플레이어 간 연결 추가
    user = models.ForeignKey(
        'CustomUser',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='players',
        verbose_name='연결된 사용자'
    )
    
    def __str__(self):
        return f"{self.nickname} ({self.get_job_display()})"
    
    class Meta:
        verbose_name = "플레이어"
        verbose_name_plural = "플레이어들"
    
    def save(self, *args, **kwargs):
        # 직업에 따라 직업 타입 자동 설정
        job_to_type = {
            '전사': '탱커', '나이트': '탱커', '암흑기사': '탱커', '건브레이커': '탱커',
            '몽크': '딜러', '용기사': '딜러', '닌자': '딜러', '사무라이': '딜러',
            '리퍼': '딜러', '바이퍼': '딜러', '음유시인': '딜러', '기공사': '딜러',
            '무도가': '딜러', '흑마도사': '딜러', '소환사': '딜러', '적마도사': '딜러',
            '픽토맨서': '딜러',
            '백마도사': '힐러', '학자': '힐러', '점성술사': '힐러', '현자': '힐러',
        }
        
        if self.job in job_to_type:
            self.job_type = job_to_type[self.job]
        
        super().save(*args, **kwargs)