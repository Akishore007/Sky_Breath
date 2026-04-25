from rest_framework import serializers
from .models import News, NewsChannel


class NewsSerializer(serializers.ModelSerializer):
    """
    Serializer for news articles
    """
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    source_display = serializers.CharField(source='get_source_display', read_only=True)
    
    class Meta:
        model = News
        fields = [
            'id',
            'title',
            'slug',
            'content',
            'summary',
            'source',
            'source_display',
            'source_url',
            'category',
            'category_display',
            'featured_image',
            'author',
            'published_date',
            'is_published',
            'views_count',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'slug', 'views_count', 'created_at', 'updated_at']


class NewsListSerializer(serializers.ModelSerializer):
    """
    Simplified serializer for news list view
    """
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    source_display = serializers.CharField(source='get_source_display', read_only=True)
    
    class Meta:
        model = News
        fields = [
            'id',
            'title',
            'slug',
            'summary',
            'source',
            'source_display',
            'category',
            'category_display',
            'featured_image',
            'author',
            'published_date',
            'views_count'
        ]


class NewsDetailSerializer(serializers.ModelSerializer):
    """
    Detailed serializer for single news article
    """
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    source_display = serializers.CharField(source='get_source_display', read_only=True)
    
    class Meta:
        model = News
        fields = [
            'id',
            'title',
            'slug',
            'content',
            'summary',
            'source',
            'source_display',
            'source_url',
            'category',
            'category_display',
            'featured_image',
            'author',
            'published_date',
            'views_count',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'views_count', 'created_at', 'updated_at']


class NewsChannelSerializer(serializers.ModelSerializer):
    """
    Serializer for news channels (YouTube)
    """
    channel_type_display = serializers.CharField(source='get_channel_type_display', read_only=True)
    stream_type_display = serializers.CharField(source='get_stream_type_display', read_only=True)
    
    class Meta:
        model = NewsChannel
        fields = [
            'id',
            'name',
            'slug',
            'language',
            'channel_type',
            'channel_type_display',
            'country',
            'state',
            'city',
            'stream_type',
            'stream_type_display',
            'stream_url',
            'website_url',
            'youtube_channel',
            'logo',
            'thumbnail',
            'description',
            'is_active',
            'is_verified',
            'views_count',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'slug', 'views_count', 'created_at', 'updated_at']


class NewsChannelListSerializer(serializers.ModelSerializer):
    """
    Simplified serializer for news channels list
    """
    channel_type_display = serializers.CharField(source='get_channel_type_display', read_only=True)
    
    class Meta:
        model = NewsChannel
        fields = [
            'id',
            'name',
            'slug',
            'language',
            'channel_type',
            'channel_type_display',
            'state',
            'stream_url',
            'website_url',
            'youtube_channel',
            'logo',
            'thumbnail',
            'is_verified',
            'views_count'
        ]


class NewsChannelSerializer(serializers.ModelSerializer):
    """
    Serializer for TV News Channels
    """
    channel_type_display = serializers.CharField(source='get_channel_type_display', read_only=True)
    stream_type_display = serializers.CharField(source='get_stream_type_display', read_only=True)
    
    class Meta:
        model = NewsChannel
        fields = [
            'id',
            'name',
            'slug',
            'language',
            'channel_type',
            'channel_type_display',
            'country',
            'state',
            'city',
            'stream_type',
            'stream_type_display',
            'stream_url',
            'website_url',
            'youtube_channel',
            'logo',
            'thumbnail',
            'description',
            'is_active',
            'is_verified',
            'views_count',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'views_count', 'created_at', 'updated_at']


class NewsChannelListSerializer(serializers.ModelSerializer):
    """
    Simplified serializer for news channels list
    """
    channel_type_display = serializers.CharField(source='get_channel_type_display', read_only=True)
    stream_type_display = serializers.CharField(source='get_stream_type_display', read_only=True)
    
    class Meta:
        model = NewsChannel
        fields = [
            'id',
            'name',
            'slug',
            'language',
            'channel_type',
            'channel_type_display',
            'country',
            'state',
            'stream_type',
            'stream_type_display',
            'stream_url',
            'website_url',
            'youtube_channel',
            'logo',
            'is_verified',
            'views_count'
        ]


class NewsChannelDetailSerializer(serializers.ModelSerializer):
    """
    Detailed serializer for single channel
    """
    channel_type_display = serializers.CharField(source='get_channel_type_display', read_only=True)
    stream_type_display = serializers.CharField(source='get_stream_type_display', read_only=True)
    
    class Meta:
        model = NewsChannel
        fields = [
            'id',
            'name',
            'slug',
            'language',
            'channel_type',
            'channel_type_display',
            'country',
            'state',
            'city',
            'stream_type',
            'stream_type_display',
            'stream_url',
            'website_url',
            'youtube_channel',
            'logo',
            'thumbnail',
            'description',
            'is_active',
            'is_verified',
            'views_count',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'views_count', 'created_at', 'updated_at']
