from django.db import models
from django.contrib.auth.models import AbstractUser, Group, Permission
from django.utils.translation import gettext_lazy as _

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
    
    # 명시적인 관계 선언 추가
    groups = models.ManyToManyField(
        Group,
        verbose_name=_('groups'),
        blank=True,
        related_name='custom_user_set',
        related_query_name='custom_user',
    )
    user_permissions = models.ManyToManyField(
        Permission,
        verbose_name=_('user permissions'),
        blank=True,
        related_name='custom_user_set',
        related_query_name='custom_user',
    )
    
    class Meta:
        verbose_name = "사용자"
        verbose_name_plural = "사용자들"
    
    def __str__(self):
        return self.username