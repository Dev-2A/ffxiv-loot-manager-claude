from rest_framework.views import exception_handler
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response

def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)
    
    if isinstance(exc, PermissionDenied):
        # 권한 오류에 더 자세한 메시지 추가
        if hasattr(context['request'], 'user') and context['request'].user.is_authenticated:
            if not context['request'].user.nickname:
                custom_message = "프로필에서 인게임 캐릭터 이름을 설정해야 이 작업을 수행할 수 있습니다."
            else:
                custom_message = "본인의 캐릭터 또는 관리자만 이 작업을 수행할 수 있습니다."
        else:
            custom_message = "로그인 후 이용해주세요."
        
        response.data = {
            'detail': custom_message
        }
    
    return response