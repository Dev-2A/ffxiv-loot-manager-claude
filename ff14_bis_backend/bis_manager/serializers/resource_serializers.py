# ff14_bis_backend/bis_manager/serializers/resource_serializers.py
from rest_framework import serializers
from bis_manager.models import ResourceTracking

class ResourceTrackingSerializer(serializers.ModelSerializer):
    player_nickname = serializers.ReadOnlyField(source='player.nickname')
    resource_type_display = serializers.SerializerMethodField()
    progress_percentage = serializers.SerializerMethodField()
    
    class Meta:
        model = ResourceTracking
        fields = ['id', 'player', 'player_nickname', 'season', 'resource_type',
                  'resource_type_display', 'current_amount', 'total_needed', 'progress_percentage']
    
    def get_resource_type_display(self, obj):
        """자원 타입 표시명 반환"""
        resource_names = {
            '석판': '석판',
            '낱장_1층': '1층 낱장',
            '낱장_2층': '2층 낱장',
            '낱장_3층': '3층 낱장',
            '낱장_4층': '4층 낱장',
            '경화약': '경화약',
            '강화섬유': '강화섬유',
            '무기석판': '무기석판'
        }
        return resource_names.get(obj.resource_type, obj.resource_type)
    
    def get_progress_percentage(self, obj):
        """진행률 계산"""
        if obj.total_needed == 0:
            return 100
        return min(100, int((obj.current_amount / obj.total_needed) * 100))