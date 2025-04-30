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
        return request.user and request.user.is_staff