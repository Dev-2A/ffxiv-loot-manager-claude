from django.db.models.signals import post_save
from django.dispatch import receiver
from bis_manager.models import CustomUser, Player

@receiver(post_save, sender=CustomUser)
def link_user_to_player(sender, instance, created, **kwargs):
    """
    사용자 저장 시 닉네임이 있다면 해당 닉네임의 플레이어와 연결
    """
    if not created and instance.nickname:
        # 닉네임이 일치하는 플레이어 검색
        try:
            player = Player.objects.get(nickname=instance.nickname)
            # 해당 플레이어에 사용자 연결
            if player.user != instance:
                player.user = instance
                player.save(update_fields=['user'])
        except Player.DoesNotExist:
            # 일치하는 플레이어가 없는 경우 아무것도 하지 않음
            pass