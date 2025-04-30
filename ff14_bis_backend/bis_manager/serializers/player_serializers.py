from rest_framework import serializers
from bis_manager.models import Player

class PlayerSerializer(serializers.ModelSerializer):
    job_display = serializers.CharField(source='get_job_display', read_only=True)
    job_type_display = serializers.CharField(source='get_job_type_display', read_only=True)
    
    class Meta:
        model = Player
        fields = ['id', 'nickname', 'job', 'job_display', 'job_type', 'job_type_display']

class PlayerCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Player
        fields = ['id', 'nickname', 'job', 'job_type']