from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator


class WeatherData(models.Model):
    """
    Real-time weather data model
    """
    CONDITION_CHOICES = [
        ('Sunny', 'Sunny'),
        ('Cloudy', 'Cloudy'),
        ('Rainy', 'Rainy'),
        ('Partly Cloudy', 'Partly Cloudy'),
        ('Windy', 'Windy'),
        ('Foggy', 'Foggy'),
        ('Thunderstorm', 'Thunderstorm'),
    ]
    
    location = models.CharField(max_length=100)
    temperature = models.FloatField(
        validators=[MinValueValidator(-50), MaxValueValidator(60)],
        help_text="Temperature in Celsius"
    )
    humidity = models.IntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="Humidity in percentage"
    )
    wind_speed = models.FloatField(
        validators=[MinValueValidator(0)],
        help_text="Wind speed in km/h"
    )
    weather_condition = models.CharField(
        max_length=50,
        choices=CONDITION_CHOICES,
        default='Partly Cloudy'
    )
    feels_like = models.FloatField(
        null=True,
        blank=True,
        help_text="Feels like temperature in Celsius"
    )
    pressure = models.FloatField(
        null=True,
        blank=True,
        help_text="Atmospheric pressure in hPa"
    )
    visibility = models.FloatField(
        null=True,
        blank=True,
        help_text="Visibility in km"
    )
    timestamp = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-timestamp']
        verbose_name = 'Weather Data'
        verbose_name_plural = 'Weather Data'
        indexes = [
            models.Index(fields=['location', '-timestamp']),
        ]
    
    def __str__(self):
        return f"{self.location} - {self.temperature}°C - {self.weather_condition}"


class Forecast(models.Model):
    """
    Weather forecast model for future predictions
    """
    location = models.CharField(max_length=100)
    forecast_date = models.DateField()
    max_temperature = models.FloatField(
        help_text="Maximum temperature in Celsius"
    )
    min_temperature = models.FloatField(
        help_text="Minimum temperature in Celsius"
    )
    weather_condition = models.CharField(max_length=50)
    humidity = models.IntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="Humidity in percentage"
    )
    wind_speed = models.FloatField(
        validators=[MinValueValidator(0)],
        help_text="Wind speed in km/h"
    )
    precipitation_chance = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="Chance of precipitation in percentage"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['forecast_date']
        verbose_name = 'Forecast'
        verbose_name_plural = 'Forecasts'
        unique_together = ['location', 'forecast_date']
    
    def __str__(self):
        return f"{self.location} - {self.forecast_date} - {self.max_temperature}°C"
