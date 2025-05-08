from django.db import models
from django.contrib.auth.models import AbstractUser, Group, Permission
from django.utils.translation import gettext_lazy as _
import random
import os

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
    
    profile_image = models.ImageField(
        upload_to='profile_images/',
        null=True,
        blank=True,
        verbose_name='프로필 이미지'
    )
    
    profile_image_url = models.URLField(
        max_length=500,
        null=True,
        blank=True,
        verbose_name='프로필 이미지 URL'
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
    
    @property
    def get_profile_image(self):
        """프로필 이미지가 있으면 이미지 경로 반환, 없으면 URL 반환"""
        if self.profile_image:
            return self.profile_image.url
        return self.profile_image_url
    
    def assign_random_profile_image(self):
        """랜덤 프로필 이미지 URL 할당"""
        base_url = "/images/profile/"
        profile_images = [
            "마테_1.png", "마테_2.png", "마테_3.png", "마테_4.png", "마테_5.png",
            "마테_6.png", "마테_7.png", "마테_8.png", "마테_9.png", "마테_10.png",
            "마테_11.png", "마테_12.png", "마테_13.png", "마테_14.png", "마테_15.png",
            "마테_16.png", "마테_17.png", "마테_18.png", "마테_19.png", "마테_20.png"
        ]
        random_image = random.choice(profile_images)
        self.profile_image_url = f"{base_url}{random_image}"