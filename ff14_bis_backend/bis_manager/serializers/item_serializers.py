from rest_framework import serializers
from bis_manager.models import Item

class ItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = Item
        fields = ['id', 'name', 'type', 'source', 'item_level', 'season']

class ItemDetailSerializer(serializers.ModelSerializer):
    type_display = serializers.CharField(source='get_type_display', read_only=True)
    source_display = serializers.CharField(source='get_source_display', read_only=True)
    season_name = serializers.CharField(source='season.name', read_only=True)
    
    class Meta:
        model = Item
        fields = ['id', 'name', 'type', 'type_display', 'source', 'source_display',
                  'item_level', 'season', 'season_name']