from rest_framework import permissions
from django.db.models import Q

class IsAdminOrReadOnly(permissions.BasePermission):
    """
    관리자만 쓰기 권한을 갖고, 나머지는 읽기만 가능한 권한 클래스
    """
    def has_permission(self, request, view):
        # 읽기 작업은 모두에게 허용
        if request.method in permissions.SAFE_METHODS:
            return True
        # 쓰기 작업은 인증된 관리자만 허용
        return request.user and (request.user.is_staff or request.user.user_type == 'admin')

class IsAdminUser(permissions.BasePermission):
    """
    관리자만 접근 가능한 권한 클래스
    """
    def has_permission(self, request, view):
        return request.user and (request.user.is_staff or request.user.user_type == 'admin')

class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    객체의 소유자만 쓰기 권한을 가짐
    """
    def has_object_permission(self, request, view, obj):
        # 읽기 권한은 모든 요청에 허용
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # 관리자는 항상 모든 권한 가짐
        if request.user.is_staff or request.user.user_type == 'admin':
            return True
        
        # 작성자만 객체 수정 가능
        return obj.creator == request.user

class IsBisSetOwnerOrAdmin(permissions.BasePermission):
    """
    비스 세트 소유자나 관리자만 접근 가능한 클래스
    
    1. 관리자는 모든 작업 가능
    2. 일반 사용자는 자신의 닉네임과 일치하는 플레이어의 비스만 관리 가능
    3. 읽기 작업은 모든 사용자에게 허용
    """
    
    def has_permission(self, request, view):
        # 읽기 작업은 모든 사용자에게 허용
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # 인증되지 않은 사용자는 거부
        if not request.user or not request.user.is_authenticated:
            return False
        
        # 관리자는 모든 작업 허용
        if request.user.is_staff or request.user.user_type == 'admin':
            return True
        
        # 생성 작업인 경우 추가 검사 필요 (player_id와 닉네임 비교)
        if request.method == 'POST':
            # player_id 가져오기
            player_id = request.data.get('player')
            if not player_id:
                return False
            
            # 데이터베이스에서 플레이어 정보 조회
            from bis_manager.models import Player
            try:
                player = Player.objects.get(id=player_id)
                # 사용자 닉네임과 플레이어 닉네임 비교
                return player.nickname == request.user.nickname
            except Player.DoesNotExist:
                return False
        
        return False
    
    def has_object_permission(self, request, view, obj):
        # 읽기 작업은 모든 사용자에게 허용
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # 관리자는 모든 작업 허용
        if request.user.is_staff or request.user.user_type == 'admin':
            return True
        
        # 해당 비스 세트의 플레이어 닉네임과 사용자 닉네임 비교
        return obj.player.nickname == request.user.nickname