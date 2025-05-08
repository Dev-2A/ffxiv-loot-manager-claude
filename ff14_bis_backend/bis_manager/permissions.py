from rest_framework import permissions

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