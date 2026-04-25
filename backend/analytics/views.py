from rest_framework import viewsets, status, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Avg, Max, Min, Count, Q
from django.utils import timezone
from datetime import timedelta
from .models import UserAnalytics, DailyWeatherStats
from .serializers import (
    UserAnalyticsSerializer,
    DailyWeatherStatsSerializer,
    AnalyticsComparisonSerializer
)


class UserAnalyticsViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for user weather analytics
    Endpoints:
    - GET /api/v1/analytics/ - List all analytics
    - GET /api/v1/analytics/{id}/ - Get specific analytics
    """
    queryset = UserAnalytics.objects.all()
    serializer_class = UserAnalyticsSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['user__username', 'user__email']
    ordering_fields = ['avg_temperature', 'avg_humidity', 'engagement_score']
    
    def get_queryset(self):
        """Return analytics for current user or all if staff"""
        user = self.request.user
        if user.is_staff:
            return UserAnalytics.objects.all()
        return UserAnalytics.objects.filter(user=user)
    
    @action(detail=False, methods=['get'])
    def my_analytics(self, request):
        """Get current user's analytics"""
        analytics, created = UserAnalytics.objects.get_or_create(user=request.user)
        serializer = UserAnalyticsSerializer(analytics)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def weather_summary(self, request):
        """Get weather summary for current user"""
        analytics, created = UserAnalytics.objects.get_or_create(user=request.user)
        
        return Response({
            'avg_temperature': analytics.avg_temperature,
            'max_temperature': analytics.max_temperature,
            'min_temperature': analytics.min_temperature,
            'avg_humidity': analytics.avg_humidity,
            'avg_wind_speed': analytics.avg_wind_speed,
            'weather_summary': analytics.get_weather_summary(),
            'total_observations': (
                analytics.rainy_days_count +
                analytics.sunny_days_count +
                analytics.cloudy_days_count
            )
        })
    
    @action(detail=False, methods=['get'])
    def engagement(self, request):
        """Get engagement metrics for current user"""
        analytics, created = UserAnalytics.objects.get_or_create(user=request.user)
        
        return Response({
            'engagement_score': analytics.get_engagement_score(),
            'alerts_triggered': analytics.alerts_triggered,
            'alerts_read': analytics.alerts_read,
            'ai_chats': analytics.ai_chats_initiated,
            'articles_read': analytics.news_articles_read,
            'last_activity': analytics.updated_at,
        })
    
    @action(detail=False, methods=['get'])
    def temperature_stats(self, request):
        """Get temperature statistics"""
        analytics, created = UserAnalytics.objects.get_or_create(user=request.user)
        
        return Response({
            'average': analytics.avg_temperature,
            'maximum': analytics.max_temperature,
            'minimum': analytics.min_temperature,
            'threshold': request.user.temperature_threshold,
            'alerts_count': analytics.alerts_triggered,
        })


class DailyWeatherStatsViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for daily weather statistics
    Endpoints:
    - GET /api/v1/daily-stats/ - List daily stats
    - GET /api/v1/daily-stats/{id}/ - Get specific daily stat
    """
    queryset = DailyWeatherStats.objects.all().order_by('-date')
    serializer_class = DailyWeatherStatsSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['date', 'avg_temperature', 'avg_humidity']
    
    def get_queryset(self):
        """Return stats for current user or all if staff"""
        user = self.request.user
        if user.is_staff:
            return DailyWeatherStats.objects.all().order_by('-date')
        return DailyWeatherStats.objects.filter(user=user).order_by('-date')
    
    @action(detail=False, methods=['get'])
    def my_stats(self, request):
        """Get current user's daily stats"""
        stats = self.get_queryset()[:30]  # Last 30 days
        serializer = DailyWeatherStatsSerializer(stats, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_date(self, request):
        """Get stats for specific date"""
        date = request.query_params.get('date')
        if not date:
            return Response(
                {'error': 'Date parameter required (YYYY-MM-DD)'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        stat = self.get_queryset().filter(date=date).first()
        if not stat:
            return Response(
                {'error': 'No stats found for this date'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = DailyWeatherStatsSerializer(stat)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def date_range(self, request):
        """Get stats for date range"""
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        if not start_date or not end_date:
            return Response(
                {'error': 'Start_date and end_date parameters required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        stats = self.get_queryset().filter(date__gte=start_date, date__lte=end_date)
        serializer = DailyWeatherStatsSerializer(stats, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def trends(self, request):
        """Get weather trends (last 7 days)"""
        seven_days_ago = timezone.now().date() - timedelta(days=7)
        stats = self.get_queryset().filter(date__gte=seven_days_ago)
        
        if not stats.exists():
            return Response({'error': 'No data available'}, status=status.HTTP_404_NOT_FOUND)
        
        avg_temp = stats.aggregate(Avg('avg_temperature'))['avg_temperature__avg']
        avg_humidity = stats.aggregate(Avg('avg_humidity'))['avg_humidity__avg']
        avg_wind = stats.aggregate(Avg('avg_wind_speed'))['avg_wind_speed__avg']
        
        return Response({
            'period': '7 days',
            'avg_temperature': round(avg_temp, 2) if avg_temp else 0,
            'avg_humidity': round(avg_humidity, 2) if avg_humidity else 0,
            'avg_wind_speed': round(avg_wind, 2) if avg_wind else 0,
            'rainy_days': stats.filter(weather_condition='Rainy').count(),
            'sunny_days': stats.filter(weather_condition='Sunny').count(),
        })
