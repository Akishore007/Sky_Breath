from rest_framework import viewsets, status, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from .models import WeatherData, Forecast
from .serializers import (
    WeatherDataSerializer,
    ForecastSerializer,
    CurrentWeatherSerializer
)
from .openweather_service import OpenWeatherMapService
import logging

logger = logging.getLogger(__name__)


class WeatherDataViewSet(viewsets.ModelViewSet):
    """
    ViewSet for current weather data
    Endpoints:
    - GET /api/v1/weather/ - List all weather data
    - POST /api/v1/weather/ - Create new weather data
    - GET /api/v1/weather/{id}/ - Get specific weather data
    - PATCH /api/v1/weather/{id}/ - Update weather data
    - DELETE /api/v1/weather/{id}/ - Delete weather data
    """
    queryset = WeatherData.objects.all().order_by('-timestamp')
    serializer_class = WeatherDataSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['location', 'weather_condition']
    ordering_fields = ['timestamp', 'temperature', 'location']
    
    @action(detail=False, methods=['get'])
    def by_location(self, request):
        """Get latest weather data by location from OpenWeatherMap"""
        location = request.query_params.get('location')
        if not location:
            return Response(
                {'error': 'Location parameter required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Try to fetch from OpenWeatherMap first
        try:
            service = OpenWeatherMapService()
            weather_data = service.get_current_weather(location)
            
            if weather_data:
                # Return live data from API
                return Response({
                    'location': weather_data['location'],
                    'temperature': weather_data['temperature'],
                    'humidity': weather_data['humidity'],
                    'wind_speed': weather_data['wind_speed'],
                    'weather_condition': weather_data['weather_condition'],
                    'feels_like': weather_data['feels_like'],
                    'pressure': weather_data['pressure'],
                    'visibility': weather_data['visibility'],
                    'description': weather_data.get('description', ''),
                    'icon': weather_data.get('icon', ''),
                    'source': 'openweathermap'
                })
        except Exception as e:
            logger.warning(f"Failed to fetch from OpenWeatherMap: {str(e)}")
        
        # Fallback to database if API fails
        try:
            weather = WeatherData.objects.filter(location=location).latest('timestamp')
            serializer = WeatherDataSerializer(weather)
            data = serializer.data
            data['source'] = 'database'
            return Response(data)
        except WeatherData.DoesNotExist:
            return Response(
                {'error': f'No weather data found for {location}'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['get'])
    def current(self, request):
        """Get current weather for all locations"""
        locations = request.query_params.getlist('locations')
        
        # Get the most recent weather for each location
        if locations:
            # Filter by specific locations
            location_list = locations if locations else WeatherData.objects.values_list('location', flat=True).distinct()
        else:
            # Get all unique locations
            location_list = WeatherData.objects.values_list('location', flat=True).distinct()
        
        # Get latest weather for each location
        weather_data = []
        for location in location_list:
            latest = WeatherData.objects.filter(location=location).latest('timestamp')
            weather_data.append(latest)
        
        serializer = WeatherDataSerializer(weather_data, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def locations(self, request):
        """Get list of all available locations"""
        locations = WeatherData.objects.values_list('location', flat=True).distinct()
        return Response({'locations': list(locations)})
    
    @action(detail=False, methods=['get'])
    def recent(self, request):
        """Get recent weather data for a location"""
        location = request.query_params.get('location')
        limit = int(request.query_params.get('limit', 24))
        
        if not location:
            return Response(
                {'error': 'Location parameter required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        weather = WeatherData.objects.filter(
            location=location
        ).order_by('-timestamp')[:limit]
        serializer = WeatherDataSerializer(weather, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def update_status(self, request):
        """Get the last weather update timestamp"""
        from django.core.cache import cache
        from django.utils import timezone
        
        # Try to get from cache first
        last_update = cache.get('last_weather_update')
        
        # If not in cache, check database for most recent entry
        if not last_update:
            try:
                latest = WeatherData.objects.latest('updated_at')
                last_update = latest.updated_at.isoformat()
            except WeatherData.DoesNotExist:
                last_update = None
        
        return Response({
            'last_update': last_update,
            'current_time': timezone.now().isoformat(),
            'status': 'updating' if last_update else 'pending'
        })


class ForecastViewSet(viewsets.ModelViewSet):
    """
    ViewSet for weather forecasts
    Endpoints:
    - GET /api/v1/forecast/ - List all forecasts
    - POST /api/v1/forecast/ - Create new forecast
    - GET /api/v1/forecast/{id}/ - Get specific forecast
    - PATCH /api/v1/forecast/{id}/ - Update forecast
    - DELETE /api/v1/forecast/{id}/ - Delete forecast
    """
    queryset = Forecast.objects.all().order_by('forecast_date')
    serializer_class = ForecastSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['location', 'weather_condition']
    ordering_fields = ['forecast_date', 'max_temperature', 'location']
    
    @action(detail=False, methods=['get'])
    def by_location(self, request):
        """Get forecast for a specific location from OpenWeatherMap"""
        location = request.query_params.get('location')
        days = int(request.query_params.get('days', 5))
        
        if not location:
            return Response(
                {'error': 'Location parameter required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Try to fetch from OpenWeatherMap first
        try:
            service = OpenWeatherMapService()
            forecasts_data = service.get_forecast(location, days)
            
            if forecasts_data:
                # Return live data from API
                for forecast in forecasts_data:
                    forecast['source'] = 'openweathermap'
                return Response(forecasts_data)
        except Exception as e:
            logger.warning(f"Failed to fetch forecast from OpenWeatherMap: {str(e)}")
        
        # Fallback to database if API fails
        try:
            forecasts = Forecast.objects.filter(
                location=location
            ).order_by('forecast_date')[:days]
            
            if forecasts.exists():
                serializer = ForecastSerializer(forecasts, many=True)
                data = serializer.data
                for item in data:
                    item['source'] = 'database'
                return Response(data)
            else:
                return Response(
                    {'error': f'No forecast data found for {location}'},
                    status=status.HTTP_404_NOT_FOUND
                )
        except Exception as e:
            logger.error(f"Error fetching forecast: {str(e)}")
            return Response(
                {'error': 'Failed to fetch forecast data'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """Get upcoming forecasts for all locations"""
        days = int(request.query_params.get('days', 7))
        forecasts = Forecast.objects.filter(
            forecast_date__gte=request.query_params.get('from_date', '2000-01-01')
        ).order_by('forecast_date')[:days]
        serializer = ForecastSerializer(forecasts, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def locations(self, request):
        """Get list of locations with forecasts"""
        locations = Forecast.objects.values_list('location', flat=True).distinct()
        return Response({'locations': list(locations)})

