from rest_framework import serializers
from .models import Alert


class AlertSerializer(serializers.ModelSerializer):
    """
    Serializer for weather alerts
    """
    user_username = serializers.CharField(source='user.username', read_only=True)
    severity_display = serializers.CharField(source='get_severity_display', read_only=True)
    alert_type_display = serializers.CharField(source='get_alert_type_display', read_only=True)
    
    class Meta:
        model = Alert
        fields = [
            'id',
            'user',
            'user_username',
            'title',
            'message',
            'severity',
            'severity_display',
            'alert_type',
            'alert_type_display',
            'is_read',
            'is_dismissed',
            'location',
            'timestamp'
        ]
        read_only_fields = ['id', 'timestamp']


class AlertCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating alerts
    """
    class Meta:
        model = Alert
        fields = [
            'user',
            'title',
            'message',
            'severity',
            'alert_type',
            'location'
        ]


class AlertUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating alert status
    """
    class Meta:
        model = Alert
        fields = [
            'is_read',
            'is_dismissed'
        ]
