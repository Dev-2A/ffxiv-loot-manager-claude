from rest_framework import serializers
from bis_manager.models import Season

class SeasonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Season
        fields = ['id', 'name', 'start_date', 'end_date', 'is_active', 'distribution_method']