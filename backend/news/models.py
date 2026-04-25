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


class NewsChannel(models.Model):
    """
    TV News Channels with official streaming URLs
    Organized by Country -> State -> Channel
    """
    CHANNEL_TYPE_CHOICES = [
        ('news', 'News'),
        ('weather', 'Weather'),
        ('sports', 'Sports'),
        ('business', 'Business'),
        ('entertainment', 'Entertainment'),
    ]
    
    STREAM_TYPE_CHOICES = [
        ('youtube', 'YouTube Live'),
        ('official_website', 'Official Website'),
        ('streaming_platform', 'Streaming Platform'),
        ('direct_stream', 'Direct Stream URL'),
        ('website_link', 'Website Link'),
    ]
    
    # Basic Info
    name = models.CharField(
        max_length=200,
        help_text="Channel name (e.g., Sun News)"
    )
    slug = models.SlugField(
        unique=True,
        help_text="URL-friendly name"
    )
    language = models.CharField(
        max_length=50,
        help_text="Primary language (e.g., Tamil, English, Hindi)"
    )
    channel_type = models.CharField(
        max_length=20,
        choices=CHANNEL_TYPE_CHOICES,
        default='news',
        help_text="Type of channel"
    )
    
    # Location
    country = models.CharField(
        max_length=100,
        help_text="Country (e.g., India, USA)"
    )
    state = models.CharField(
        max_length=200,
        help_text="State/Region (e.g., Tamil Nadu, New York)"
    )
    city = models.CharField(
        max_length=200,
        blank=True,
        help_text="City (optional)"
    )
    
    # Streaming URLs
    stream_type = models.CharField(
        max_length=30,
        choices=STREAM_TYPE_CHOICES,
        default='youtube',
        help_text="Type of streaming source"
    )
    stream_url = models.URLField(
        help_text="Official streaming URL or YouTube embed link"
    )
    website_url = models.URLField(
        blank=True,
        help_text="Channel's official website"
    )
    youtube_channel = models.CharField(
        max_length=255,
        blank=True,
        help_text="YouTube channel ID or URL"
    )
    
    # Media
    logo = models.URLField(
        blank=True,
        help_text="Channel logo URL"
    )
    thumbnail = models.URLField(
        blank=True,
        help_text="Channel thumbnail/cover image"
    )
    
    # Metadata
    description = models.TextField(
        blank=True,
        help_text="Channel description"
    )
    is_active = models.BooleanField(
        default=True,
        help_text="Whether channel is currently streaming"
    )
    is_verified = models.BooleanField(
        default=False,
        help_text="Official channel verified"
    )
    views_count = models.IntegerField(
        default=0,
        help_text="Number of times this channel was viewed"
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['country', 'state', 'name']
        verbose_name = 'News Channel'
        verbose_name_plural = 'News Channels'
        unique_together = [['country', 'state', 'name']]
        indexes = [
            models.Index(fields=['country', 'state']),
            models.Index(fields=['language']),
            models.Index(fields=['is_active']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.country} - {self.state})"
    
    def increment_views(self):
        """Increment view count"""
        self.views_count += 1
        self.save(update_fields=['views_count'])
