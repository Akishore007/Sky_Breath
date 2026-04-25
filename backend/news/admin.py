from django.contrib import admin
from .models import News, NewsChannel


@admin.register(News)
class NewsAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'source', 'published_date', 'is_published', 'views_count')
    list_filter = ('category', 'source', 'is_published', 'published_date')
    search_fields = ('title', 'content', 'summary', 'author')
    prepopulated_fields = {'slug': ('title',)}
    readonly_fields = ('views_count', 'created_at', 'updated_at')
    fieldsets = (
        ('Content', {
            'fields': ('title', 'slug', 'content', 'summary')
        }),
        ('Metadata', {
            'fields': ('source', 'source_url', 'category', 'author', 'featured_image')
        }),
        ('Publishing', {
            'fields': ('is_published', 'published_date')
        }),
        ('Statistics', {
            'fields': ('views_count', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(NewsChannel)
class NewsChannelAdmin(admin.ModelAdmin):
    list_display = ('name', 'country', 'state', 'language', 'channel_type', 'is_verified', 'is_active', 'views_count')
    list_filter = ('country', 'state', 'language', 'channel_type', 'is_active', 'is_verified')
    search_fields = ('name', 'country', 'state', 'language', 'description')
    prepopulated_fields = {'slug': ('name',)}
    readonly_fields = ('views_count', 'created_at', 'updated_at')
    fieldsets = (
        ('Basic Info', {
            'fields': ('name', 'slug', 'language', 'channel_type', 'description')
        }),
        ('Location', {
            'fields': ('country', 'state', 'city')
        }),
        ('Streaming', {
            'fields': ('stream_type', 'stream_url', 'website_url', 'youtube_channel')
        }),
        ('Media', {
            'fields': ('logo', 'thumbnail')
        }),
        ('Status', {
            'fields': ('is_active', 'is_verified')
        }),
        ('Statistics', {
            'fields': ('views_count', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
