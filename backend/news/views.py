from rest_framework import viewsets, status, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from .models import News, NewsChannel
from .serializers import (
    NewsSerializer,
    NewsListSerializer,
    NewsDetailSerializer,
    NewsChannelSerializer,
    NewsChannelListSerializer,
    NewsChannelDetailSerializer
)


class NewsViewSet(viewsets.ModelViewSet):
    """
    ViewSet for news articles
    Endpoints:
    - GET /api/v1/news/ - List all published news
    - POST /api/v1/news/ - Create new article (staff only)
    - GET /api/v1/news/{id}/ - Get article details
    - PATCH /api/v1/news/{id}/ - Update article (staff only)
    - DELETE /api/v1/news/{id}/ - Delete article (staff only)
    """
    queryset = News.objects.filter(is_published=True).order_by('-published_date')
    serializer_class = NewsListSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'content', 'summary', 'category', 'author']
    ordering_fields = ['published_date', 'views_count', 'created_at']
    
    def get_serializer_class(self):
        """Use different serializers for different actions"""
        if self.action == 'retrieve':
            return NewsDetailSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return NewsSerializer
        return NewsListSerializer
    
    def get_queryset(self):
        """Return published articles or all if staff"""
        if self.request.user.is_staff:
            return News.objects.all().order_by('-published_date')
        return News.objects.filter(is_published=True).order_by('-published_date')
    
    def retrieve(self, request, *args, **kwargs):
        """Get article details and increment view count"""
        instance = self.get_object()
        instance.increment_views()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    def create(self, request, *args, **kwargs):
        """Create new article (staff only)"""
        if not request.user.is_staff:
            return Response(
                {'error': 'Only staff can create articles'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().create(request, *args, **kwargs)
    
    @action(detail=False, methods=['get'])
    def by_category(self, request):
        """Get articles by category"""
        category = request.query_params.get('category')
        if not category:
            return Response(
                {'error': 'Category parameter required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        articles = self.get_queryset().filter(category=category)
        serializer = NewsListSerializer(articles, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_source(self, request):
        """Get articles by source"""
        source = request.query_params.get('source')
        if not source:
            return Response(
                {'error': 'Source parameter required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        articles = self.get_queryset().filter(source=source)
        serializer = NewsListSerializer(articles, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def latest(self, request):
        """Get latest articles"""
        limit = int(request.query_params.get('limit', 10))
        articles = self.get_queryset()[:limit]
        serializer = NewsListSerializer(articles, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def trending(self, request):
        """Get trending articles (most viewed)"""
        limit = int(request.query_params.get('limit', 10))
        articles = self.get_queryset().order_by('-views_count')[:limit]
        serializer = NewsListSerializer(articles, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def search(self, request):
        """Search articles"""
        query = request.query_params.get('q')
        if not query:
            return Response(
                {'error': 'Query parameter required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        articles = self.get_queryset().filter(
            Q(title__icontains=query) |
            Q(content__icontains=query) |
            Q(summary__icontains=query)
        )
        serializer = NewsListSerializer(articles, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def categories(self, request):
        """Get all available categories"""
        categories = News.CATEGORY_CHOICES
        return Response({
            'categories': [{'value': cat[0], 'label': cat[1]} for cat in categories]
        })
    
    @action(detail=False, methods=['get'])
    def sources(self, request):
        """Get all available sources"""
        sources = News.SOURCE_CHOICES
        return Response({
            'sources': [{'value': src[0], 'label': src[1]} for src in sources]
        })
    
    @action(detail=True, methods=['get'])
    def related(self, request, pk=None):
        """Get related articles"""
        article = self.get_object()
        related = self.get_queryset().filter(
            category=article.category
        ).exclude(id=article.id)[:5]
        serializer = NewsListSerializer(related, many=True)
        return Response(serializer.data)


class NewsChannelViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for TV News Channels
    Endpoints:
    - GET /api/v1/channels/ - List all channels
    - GET /api/v1/channels/{id}/ - Get channel details
    - GET /api/v1/channels/by_country/ - Filter by country
    - GET /api/v1/channels/by_state/ - Filter by country and state
    - GET /api/v1/channels/search/ - Search channels
    """
    queryset = NewsChannel.objects.filter(is_active=True).order_by('country', 'state', 'name')
    serializer_class = NewsChannelListSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'country', 'state', 'language', 'description']
    ordering_fields = ['country', 'state', 'name', 'views_count']
    
    def get_serializer_class(self):
        """Use different serializers for different actions"""
        if self.action == 'retrieve':
            return NewsChannelDetailSerializer
        return NewsChannelListSerializer
    
    def retrieve(self, request, *args, **kwargs):
        """Get channel details and increment view count"""
        instance = self.get_object()
        instance.increment_views()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_country(self, request):
        """Get channels by country"""
        country = request.query_params.get('country', '').strip()
        if not country:
            return Response(
                {'error': 'Country parameter required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            channels = self.get_queryset().filter(
                country__iexact=country,
                is_active=True
            ).order_by('state', 'name')
            
            if not channels.exists():
                return Response(
                    {'error': f'No channels found for {country}', 'data': []},
                    status=status.HTTP_200_OK
                )
            
            serializer = NewsChannelListSerializer(channels, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {'error': f'Failed to fetch channels: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def by_state(self, request):
        """Get channels by country and state"""
        country = request.query_params.get('country', '').strip()
        state = request.query_params.get('state', '').strip()
        
        if not country or not state:
            return Response(
                {'error': 'Country and state parameters required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Use case-insensitive filtering
            channels = self.get_queryset().filter(
                country__iexact=country,
                state__iexact=state,
                is_active=True
            ).order_by('name')
            
            if not channels.exists():
                return Response(
                    {'error': f'No channels found for {state}, {country}', 'data': []},
                    status=status.HTTP_200_OK
                )
            
            serializer = NewsChannelListSerializer(channels, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {'error': f'Failed to fetch channels: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def list_countries(self, request):
        """Get list of all available countries"""
        try:
            countries = self.get_queryset().values_list('country', flat=True).distinct().order_by('country')
            # Double check deduplication - use set
            unique_countries = sorted(set(list(countries)))
            return Response({
                'countries': unique_countries,
                'count': len(unique_countries)
            })
        except Exception as e:
            return Response(
                {'error': f'Failed to fetch countries: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def list_states(self, request):
        """Get list of states for a country"""
        country = request.query_params.get('country', '').strip()
        if not country:
            return Response(
                {'error': 'Country parameter required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            states = self.get_queryset().filter(
                country__iexact=country
            ).values_list('state', flat=True).distinct().order_by('state')
            
            # Double check deduplication - use set
            unique_states = sorted(set(list(states)))
            
            return Response({
                'country': country,
                'states': unique_states,
                'count': len(unique_states)
            })
        except Exception as e:
            return Response(
                {'error': f'Failed to fetch states: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def by_language(self, request):
        """Get channels by language"""
        language = request.query_params.get('language')
        if not language:
            return Response(
                {'error': 'Language parameter required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        channels = self.get_queryset().filter(language=language)
        serializer = NewsChannelListSerializer(channels, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_type(self, request):
        """Get channels by type"""
        channel_type = request.query_params.get('type')
        if not channel_type:
            return Response(
                {'error': 'Type parameter required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        channels = self.get_queryset().filter(channel_type=channel_type)
        serializer = NewsChannelListSerializer(channels, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def trending(self, request):
        """Get trending channels (most viewed)"""
        limit = int(request.query_params.get('limit', 10))
        channels = self.get_queryset().order_by('-views_count')[:limit]
        serializer = NewsChannelListSerializer(channels, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def search(self, request):
        """Search channels"""
        query = request.query_params.get('q')
        if not query:
            return Response(
                {'error': 'Query parameter required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        channels = self.get_queryset().filter(
            Q(name__icontains=query) |
            Q(country__icontains=query) |
            Q(state__icontains=query) |
            Q(language__icontains=query) |
            Q(description__icontains=query)
        )
        serializer = NewsChannelListSerializer(channels, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def languages(self, request):
        """Get all available languages"""
        languages = self.get_queryset().values_list('language', flat=True).distinct()
        return Response({
            'languages': sorted(list(languages))
        })
    
    @action(detail=False, methods=['get'])
    def types(self, request):
        """Get all available channel types"""
        types = NewsChannel.CHANNEL_TYPE_CHOICES
        return Response({
            'types': [{'value': t[0], 'label': t[1]} for t in types]
        })
