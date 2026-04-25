from django.db import models
from django.utils import timezone


class News(models.Model):
    """
    Weather news and climate articles model
    """
    CATEGORY_CHOICES = [
        ('forecasts', 'Weather Forecasts'),
        ('climate', 'Climate & Research'),
        ('general', 'General News'),
        ('alerts', 'Weather Alerts'),
        ('tips', 'Weather Tips'),
    ]
    
    SOURCE_CHOICES = [
        ('weather_service', 'National Weather Service'),
        ('climate_research', 'Climate Research Center'),
        ('local_news', 'Local News'),
        ('internal', 'Internal'),
    ]
    
    title = models.CharField(
        max_length=300,
        help_text="News article title"
    )
    slug = models.SlugField(
        unique=True,
        max_length=300,
        help_text="URL slug for the article"
    )
    content = models.TextField(
        help_text="Full article content"
    )
    summary = models.TextField(
        max_length=500,
        blank=True,
        help_text="Brief summary of the article"
    )
    source = models.CharField(
        max_length=50,
        choices=SOURCE_CHOICES,
        default='internal',
        help_text="Source of the news"
    )
    source_url = models.URLField(
        blank=True,
        null=True,
        help_text="Original source URL if external"
    )
    category = models.CharField(
        max_length=50,
        choices=CATEGORY_CHOICES,
        default='general',
        help_text="News category"
    )
    featured_image = models.ImageField(
        upload_to='news/images/',
        blank=True,
        null=True,
        help_text="Featured image for the article"
    )
    author = models.CharField(
        max_length=100,
        default='WeatherHub Team',
        help_text="Article author"
    )
    published_date = models.DateTimeField(
        default=timezone.now,
        help_text="Publication date"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_published = models.BooleanField(
        default=True,
        help_text="Whether article is published"
    )
    views_count = models.IntegerField(
        default=0,
        help_text="Number of views"
    )
    
    class Meta:
        ordering = ['-published_date']
        verbose_name = 'News Article'
        verbose_name_plural = 'News Articles'
        indexes = [
            models.Index(fields=['-published_date']),
            models.Index(fields=['category']),
            models.Index(fields=['is_published']),
        ]
    
    def __str__(self):
        return self.title
    
    def increment_views(self):
        """Increment view count"""
        self.views_count += 1
        self.save(update_fields=['views_count'])
