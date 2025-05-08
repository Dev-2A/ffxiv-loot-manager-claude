from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import transaction
from bis_manager.models import Season

User = get_user_model()

class Command(BaseCommand):
    help = '초기 데이터를 로드합니다.'
    
    @transaction.atomic
    def handle(self, *args, **kwargs):
        self.stdout.write('초기 데이터 로드 시작...')
        
        # 관리자 계정 생성
        if not User.objects.filter(username='admin').exists():
            admin_user = User.objects.create_superuser(
                username='admin',
                email='admin@example.com',
                password='admin123',
                user_type='admin'
            )
            admin_user.assign_random_profile_image()
            admin_user.save()
            self.stdout.write(self.style.SUCCESS('관리자 계정이 생성되었습니다.'))
        
        # 테스트 사용자 생성
        if not User.objects.filter(username='test').exists():
            test_user = User.objects.create_user(
                username='test',
                email='test@example.com',
                password='test123',
                user_type='regular'
            )
            test_user.assign_random_profile_image()
            test_user.save()
            self.stdout.write(self.style.SUCCESS('테스트 계정이 생성되었습니다.'))
        
        # 시즌 생성
        if not Season.objects.filter(name='아르카디아 라이트헤비급: 영웅').exists():
            Season.objects.create(
                name='아르카디아 라이트헤비급: 영웅',
                start_date='2025-01-21',
                is_active=True,
                distribution_method='우선순위분배'
            )
            self.stdout.write(self.style.SUCCESS('시즌이 생성되었습니다.'))
        
        self.stdout.write(self.style.SUCCESS('초기 데이터 로드 완료!'))