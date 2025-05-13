from rest_framework import permissions
from django.db.models import Q
from django.conf import settings

import logging
logger = logging.getLogger(__name__)

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
    """
    
    def has_permission(self, request, view):
        # 디버깅 정보 추가
        logger.info(f"has_permission 호출: {request.method} {request.path}")
        logger.info(f"사용자: {request.user.username}, 닉네임: {request.user.nickname if hasattr(request.user, 'nickname') else 'None'}")
        logger.info(f"인증 여부: {request.user.is_authenticated}, 관리자 여부: {getattr(request.user, 'is_staff', False)}")
        
        # 읽기 작업은 모든 사용자에게 허용
        if request.method in permissions.SAFE_METHODS:
            logger.info("읽기 작업 허용")
            return True
        
        # 인증되지 않은 사용자는 거부
        if not request.user or not request.user.is_authenticated:
            logger.info("인증되지 않은 사용자 거부")
            return False
        
        # 관리자는 모든 작업 허용
        if getattr(request.user, 'is_staff', False) or getattr(request.user, 'user_type', '') == 'admin':
            logger.info("관리자 작업 허용")
            return True
        
        # 생성 작업인 경우 추가 검사
        if request.method == 'POST' and 'add_item' in request.path:
            logger.info("아이템 추가 작업 감지")
            # 이 부분에서는 request.data를 디버깅할 수 있음
            logger.info(f"Request data: {request.data}")
            logger.info(f"bis_set ID: {view.kwargs.get('pk')}")
            
            # 여기서는 bis_set 객체를 직접 불러와서 검사
            try:
                from bis_manager.models import BisSet
                bis_set_id = view.kwargs.get('pk')
                bis_set = BisSet.objects.get(pk=bis_set_id)
                logger.info(f"비스 세트 플레이어: {bis_set.player.nickname}, 플레이어 ID: {bis_set.player.id}")
                
                if hasattr(request.user, 'nickname'):
                    logger.info(f"닉네임 비교: {request.user.nickname} == {bis_set.player.nickname} = {request.user.nickname == bis_set.player.nickname}")
                
                # DEBUG 모드에서는 권한 체크 우회
                if settings.DEBUG:
                    logger.info("DEBUG 모드에서 권한 체크 우회")
                    return True
                
            except Exception as e:
                logger.error(f"비스 세트 검사 중 오류: {str(e)}")
        
        # 이 부분은 view의 check_object_permissions 메서드에서 처리
        logger.info("기본 권한 체크 통과, object 권한 체크로 이동")
        return True
    
    def has_object_permission(self, request, view, obj):
        # 디버깅 정보 추가
        logger.info(f"has_object_permission 호출: {request.method} {request.path}")
        logger.info(f"사용자: {request.user.username}, 닉네임: {getattr(request.user, 'nickname', 'None')}")
        
        if hasattr(obj, 'player'):
            logger.info(f"비스 세트 플레이어: {obj.player.nickname}")
        
        # 읽기 작업은 모든 사용자에게 허용
        if request.method in permissions.SAFE_METHODS:
            logger.info("읽기 작업 허용")
            return True
        
        # 관리자는 모든 작업 허용
        if getattr(request.user, 'is_staff', False) or getattr(request.user, 'user_type', '') == 'admin':
            logger.info("관리자 작업 허용")
            return True
        
        # DEBUG 모드에서는 권한 체크 우회
        if settings.DEBUG:
            logger.info("DEBUG 모드에서 권한 체크 우회")
            return True
        
        # 해당 비스 세트의 플레이어 닉네임과 사용자 닉네임 비교
        has_perm = False
        if hasattr(obj, 'player') and hasattr(request.user, 'nickname'):
            has_perm = (obj.player.nickname == request.user.nickname)
            logger.info(f"닉네임 비교 결과: {has_perm}")
        return has_perm