from rest_framework import serializers
from .models import UserAnalytics, DailyWeatherStats


class UserAnalyticsSerializer(serializers.ModelSerializer):
    """
    Serializer for user weather analytics
    """
    user_username = serializers.CharField(source='user.username', read_only=True)
    weather_summary = serializers.SerializerMethodField()
    engagement_score = serializers.SerializerMethodField()
    
    class Meta:
        model = UserAnalytics
        fields = [
            'id',
            'user',
            'user_username',
            'avg_temperature',
            'max_temperature',
            'min_temperature',
            'avg_humidity',
            'max_humidity',
            'min_humidity',
            'avg_wind_speed',
            'max_wind_speed',
            'rainy_days_count',
            'sunny_days_count',
            'cloudy_days_count',
            'alerts_triggered',
            'alerts_read',
            'ai_chats_initiated',
            'news_articles_read',
            'last_alert_time',
            'last_check_time',
            'weather_summary',
            'engagement_score',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_weather_summary(self, obj):
        """Get weather condition summary"""
        return obj.get_weather_summary()
    
    def get_engagement_score(self, obj):
        """Get user engagement score"""
        return obj.get_engagement_score()


class DailyWeatherStatsSerializer(serializers.ModelSerializer):
    """
    Serializer for daily weather statistics
    """
    user_username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = DailyWeatherStats
        fields = [
            'id',
            'user',
            'user_username',
            'date',
            'avg_temperature',
            'max_temperature',
            'min_temperature',
            'avg_humidity',
            'avg_wind_speed',
            'weather_condition',
            'precipitation_chance',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class AnalyticsComparisonSerializer(serializers.Serializer):
    """
    Serializer for comparing analytics over time periods
    """
    period = serializers.CharField()
    avg_temperature = serializers.FloatField()
    avg_humidity = serializers.IntegerField()
    avg_wind_speed = serializers.FloatField()
    total_alerts = serializers.IntegerField()
    rainy_days = serializers.IntegerField()
