from rest_framework import serializers
from bis_manager.models import BisSet, BisItem, Materia
from .item_serializers import ItemSerializer

class MateriaSerializer(serializers.ModelSerializer):
    type_display = serializers.CharField(source='get_type_display', read_only=True)
    
    class Meta:
        model = Materia
        fields = ['id', 'type', 'type_display', 'slot_number']

class BisItemSerializer(serializers.ModelSerializer):
    item = ItemSerializer(read_only=True)
    item_id = serializers.PrimaryKeyRelatedField(
        queryset=Materia.objects.all(),
        source='item',
        write_only=True
    )
    materias = MateriaSerializer(many=True, read_only=True)
    slot_display = serializers.CharField(source='get_slot_display', read_only=True)
    
    class Meta:
        model = BisItem
        fields = ['id', 'slot', 'slot_display', 'item', 'item_id', 'materias']

class BisSetSerializer(serializers.ModelSerializer):
    items = BisItemSerializer(many=True, read_only=True)
    bis_type_display = serializers.CharField(source='get_bis_type_display', read_only=True)
    player_nickname = serializers.CharField(source='player.nickname', read_only=True)
    season_name = serializers.CharField(source='season.name', read_only=True)
    
    class Meta:
        model = BisSet
        fields = ['id', 'player', 'player_nickname', 'season', 'season_name',
                  'bis_type', 'bis_type_display', 'items']