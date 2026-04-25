from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator, MaxValueValidator


class User(AbstractUser):
    """
    Custom User model extending Django's AbstractUser
    """
    LOCATION_CHOICES = [
        ('Chennai', 'Chennai, Tamil Nadu'),
        ('Velachery', 'Velachery, Chennai'),
        ('Anna Nagar', 'Anna Nagar, Chennai'),
        ('T. Nagar', 'T. Nagar, Chennai'),
        ('Adyar', 'Adyar, Chennai'),
    ]
    
    location = models.CharField(
        max_length=100,
        choices=LOCATION_CHOICES,
        default='Chennai'
    )
    temperature_threshold = models.IntegerField(
        default=35,
        validators=[MinValueValidator(25), MaxValueValidator(50)],
        help_text="Temperature alert threshold in Celsius"
    )
    humidity_threshold = models.IntegerField(
        default=80,
        validators=[MinValueValidator(30), MaxValueValidator(100)],
        help_text="Humidity alert threshold in percentage"
    )
    wind_speed_threshold = models.IntegerField(
        default=40,
        validators=[MinValueValidator(10), MaxValueValidator(80)],
        help_text="Wind speed alert threshold in km/h"
    )
    notifications_enabled = models.BooleanField(
        default=True,
        help_text="Enable/disable push notifications"
    )
    avatar = models.ImageField(
        upload_to='avatars/',
        null=True,
        blank=True,
        help_text="User profile picture"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'User'
        verbose_name_plural = 'Users'
    
    def __str__(self):
        return f"{self.get_full_name()} ({self.username})"
