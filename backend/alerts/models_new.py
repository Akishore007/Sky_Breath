from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator

User = get_user_model()


class Alert(models.Model):
    """
    Weather alert system model
    """
    SEVERITY_CHOICES = [
        ('info', 'Info'),
        ('warning', 'Warning'),
        ('critical', 'Critical'),
    ]
    
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='alerts',
        help_text="User who received this alert"
    )
    title = models.CharField(
        max_length=200,
        help_text="Alert title"
    )
    message = models.TextField(
        help_text="Alert message details"
    )
    severity = models.CharField(
        max_length=20,
        choices=SEVERITY_CHOICES,
        default='info',
        help_text="Alert severity level"
    )
    alert_type = models.CharField(
        max_length=50,
        choices=[
            ('temperature', 'High Temperature'),
            ('humidity', 'High Humidity'),
            ('wind', 'High Wind Speed'),
            ('rain', 'Heavy Rain'),
            ('cold', 'Cold Weather'),
        ],
        default='temperature'
    )
    is_read = models.BooleanField(
        default=False,
        help_text="Whether user has read this alert"
    )
    is_dismissed = models.BooleanField(
        default=False,
        help_text="Whether user has dismissed this alert"
    )
    location = models.CharField(
        max_length=100,
        help_text="Location of the alert"
    )
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-timestamp']
        verbose_name = 'Alert'
        verbose_name_plural = 'Alerts'
        indexes = [
            models.Index(fields=['user', '-timestamp']),
            models.Index(fields=['severity']),
        ]
    
    def __str__(self):
        return f"{self.title} - {self.get_severity_display()}"
