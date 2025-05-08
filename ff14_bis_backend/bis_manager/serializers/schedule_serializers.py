from rest_framework import serializers
from bis_manager.models import Schedule
from .user_serializers import UserSerializer

class ScheduleSerializer(serializers.ModelSerializer):
    creator_username = serializers.ReadOnlyField(source='creator.username')
    creator_details = UserSerializer(source='creator', read_only=True)
    
    class Meta:
        model = Schedule
        fields = [
            'id', 'title', 'description', 'start_time', 'end_time',
            'creator', 'creator_username', 'creator_details',
            'is_admin_schedule', 'repeat_type', 'repeat_days',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['creator']
    
    def create(self, validated_data):
        # 현재 요청한 사용자를 creator로 설정
        validated_data['creator'] = self.context['request'].user
        
        # 관리자만 관리자 일정 생성 가능
        if validated_data.get('is_admin_shcedule', False):
            user = self.context['request'].user
            if not (user.is_staff or user.user_type == 'admin'):
                raise serializers.ValidationError("관리자 권한이 필요합니다.")
        
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        # 관리자 일정은 관리자만 수정 가능
        if instance.is_admin_schedule:
            user = self.context['request'].user
            if not (user.is_staff or user.user_type == 'admin'):
                raise serializers.ValidationError("관리자 권한이 필요합니다.")
        
        # 일반 일정은 작성자만 수정 가능
        elif instance.creator != self.context['request'].user:
            raise serializers.ValidationError("자신이 작성한 일정만 수정할 수 있습니다.")
        
        return super().update(instance, validated_data)