from django.db import models
from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):
    USER_TYPE_CHOICES = (
        ('regular', '공대원'),
        ('admin', '공대장'),
    )
    
    user_type = models.CharField(
        max_length=10,
        choices=USER_TYPE_CHOICES,
        default='regular',
        verbose_name='회원 유형'
    )
    
    class Meta:
        verbose_name = "사용자"
        verbose_name_plural = "사용자들"