from rest_framework import serializers
from bis_manager.models import RaidProgress, ItemAcquisition, DistributionPriority

class ItemAcquisitionSerializer(serializers.ModelSerializer):
    player_nickname = serializers.ReadOnlyField(source='player.nickname')
    item_name = serializers.ReadOnlyField(source='item.name')
    item_tupe = serializers.ReadOnlyField(source='item.type')
    item_type_display = serializers.ReadOnlyField(source='item.get_type_display')
    
    class Meta:
        model = ItemAcquisition
        fields = ['id', 'player', 'player_nickname', 'item', 'item_name',
                  'item_type', 'item_type_display']

class RaidProgressSerializer(serializers.ModelSerializer):
    acquisitions = ItemAcquisitionSerializer(many=True, read_only=True)
    floor_display = serializers.CharField(source='get_floor_display', read_only=True)
    season_name = serializers.CharField(source='season.name', read_only=True)
    
    class Meta:
        model = RaidProgress
        fields = ['id', 'season', 'season_name', 'raid_date', 'floor',
                  'floor_display', 'notes', 'acquisitions']

class DistributionPrioritySerializer(serializers.ModelSerializer):
    player_nickname = serializers.ReadOnlyField(source='player.nickname')
    player_job = serializers.ReadOnlyField(source='player.job')
    player_job_display = serializers.ReadOnlyField(source='player.get_job_display')
    item_type_display = serializers.ReadOnlyField(source='get_item_type_display')
    
    class Meta:
        model = DistributionPriority
        fields = ['id', 'season', 'player', 'player_nickname', 'player_job',
                  'player_job_display', 'item_type', 'item_type_display', 'priority']