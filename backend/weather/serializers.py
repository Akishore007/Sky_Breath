from rest_framework import serializers
from .models import WeatherData, Forecast


class WeatherDataSerializer(serializers.ModelSerializer):
    """
    Serializer for current weather data
    """
    class Meta:
        model = WeatherData
        fields = [
            'id',
            'location',
            'temperature',
            'humidity',
            'wind_speed',
            'weather_condition',
            'feels_like',
            'pressure',
            'visibility',
            'timestamp',
            'updated_at'
        ]
        read_only_fields = ['id', 'timestamp', 'updated_at']


class ForecastSerializer(serializers.ModelSerializer):
    """
    Serializer for weather forecast
    """
    class Meta:
        model = Forecast
        fields = [
            'id',
            'location',
            'forecast_date',
            'max_temperature',
            'min_temperature',
            'weather_condition',
            'humidity',
            'wind_speed',
            'precipitation_chance',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class CurrentWeatherSerializer(serializers.Serializer):
    """
    Serializer for current weather summary
    """
    location = serializers.CharField()
    temperature = serializers.FloatField()
    humidity = serializers.IntegerField()
    wind_speed = serializers.FloatField()
    weather_condition = serializers.CharField()
    feels_like = serializers.FloatField(required=False)
    pressure = serializers.IntegerField(required=False)
    visibility = serializers.IntegerField(required=False)
    timestamp = serializers.DateTimeField()
    forecast_today = ForecastSerializer(required=False)
    forecast_week = ForecastSerializer(many=True, required=False)
