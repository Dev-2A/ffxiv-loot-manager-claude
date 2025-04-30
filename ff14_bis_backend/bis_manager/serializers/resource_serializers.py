from rest_framework import serializers
from bis_manager.models import ResourceTracking

class ResourceTrackingSerializer(serializers.ModelSerializer):
    player_nickname = serializers.ReadOnlyField(source='player.nickname')
    resource_type_display = serializers.ReadOnlyField(source='get_resource_type_display')
    progress_percentage = serializers.SerializerMethodField()
    
    class Meta:
        model = ResourceTracking
        fields = ['id', 'player', 'player_nickname', 'season', 'resource_type',
                  'resource_type_display', 'current_amount', 'total_needed', 'progress_percentage']
    
    def get_progress_percentage(self, obj):
        if obj.total_needed == 0:
            return 100
        return min(100, int((obj.current_amount / obj.total_needed) * 100))