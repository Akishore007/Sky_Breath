from django.db import models
from users.models import User
from django.core.validators import MinValueValidator, MaxValueValidator


class UserAnalytics(models.Model):
    """
    User weather analytics and activity tracking
    """
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='analytics',
        help_text="User whose analytics we're tracking"
    )
    
    # Temperature statistics
    avg_temperature = models.FloatField(
        default=25.0,
        validators=[MinValueValidator(-50), MaxValueValidator(60)],
        help_text="Average temperature in user's location"
    )
    max_temperature = models.FloatField(
        default=35.0,
        validators=[MinValueValidator(-50), MaxValueValidator(60)],
        help_text="Maximum temperature recorded"
    )
    min_temperature = models.FloatField(
        default=15.0,
        validators=[MinValueValidator(-50), MaxValueValidator(60)],
        help_text="Minimum temperature recorded"
    )
    
    # Humidity statistics
    avg_humidity = models.IntegerField(
        default=65,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="Average humidity percentage"
    )
    max_humidity = models.IntegerField(
        default=95,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="Maximum humidity recorded"
    )
    min_humidity = models.IntegerField(
        default=30,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="Minimum humidity recorded"
    )
    
    # Wind statistics
    avg_wind_speed = models.FloatField(
        default=12.0,
        validators=[MinValueValidator(0)],
        help_text="Average wind speed in km/h"
    )
    max_wind_speed = models.FloatField(
        default=40.0,
        validators=[MinValueValidator(0)],
        help_text="Maximum wind speed recorded"
    )
    
    # Weather conditions tracking
    rainy_days_count = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0)],
        help_text="Number of rainy days recorded"
    )
    sunny_days_count = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0)],
        help_text="Number of sunny days recorded"
    )
    cloudy_days_count = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0)],
        help_text="Number of cloudy days recorded"
    )
    
    # Activity and engagement
    alerts_triggered = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0)],
        help_text="Number of alerts triggered for this user"
    )
    alerts_read = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0)],
        help_text="Number of alerts read by user"
    )
    ai_chats_initiated = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0)],
        help_text="Number of AI chat conversations started"
    )
    news_articles_read = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0)],
        help_text="Number of news articles read"
    )
    
    # Temporal tracking
    last_alert_time = models.DateTimeField(
        blank=True,
        null=True,
        help_text="When the last alert was triggered"
    )
    last_check_time = models.DateTimeField(
        blank=True,
        null=True,
        help_text="Last time user checked weather"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'User Analytics'
        verbose_name_plural = 'User Analytics'
    
    def __str__(self):
        return f"Analytics for {self.user.username}"
    
    def get_weather_summary(self):
        """Get summary of weather conditions"""
        total_days = self.rainy_days_count + self.sunny_days_count + self.cloudy_days_count
        if total_days == 0:
            return {}
        return {
            'rainy_percentage': (self.rainy_days_count / total_days) * 100,
            'sunny_percentage': (self.sunny_days_count / total_days) * 100,
            'cloudy_percentage': (self.cloudy_days_count / total_days) * 100,
        }
    
    def get_engagement_score(self):
        """Calculate user engagement score"""
        score = (
            self.alerts_read * 5 +
            self.ai_chats_initiated * 10 +
            self.news_articles_read * 3
        )
        return score


class DailyWeatherStats(models.Model):
    """
    Daily aggregated weather statistics
    """
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='daily_stats',
        help_text="User associated with these stats"
    )
    date = models.DateField(
        help_text="Date of the statistics"
    )
    avg_temperature = models.FloatField(
        validators=[MinValueValidator(-50), MaxValueValidator(60)]
    )
    max_temperature = models.FloatField(
        validators=[MinValueValidator(-50), MaxValueValidator(60)]
    )
    min_temperature = models.FloatField(
        validators=[MinValueValidator(-50), MaxValueValidator(60)]
    )
    avg_humidity = models.IntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    avg_wind_speed = models.FloatField(
        validators=[MinValueValidator(0)]
    )
    weather_condition = models.CharField(max_length=50)
    precipitation_chance = models.IntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        default=0
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['user', 'date']
        ordering = ['-date']
        verbose_name = 'Daily Weather Stats'
        verbose_name_plural = 'Daily Weather Stats'
    
    def __str__(self):
        return f"{self.user.username} - {self.date}"
