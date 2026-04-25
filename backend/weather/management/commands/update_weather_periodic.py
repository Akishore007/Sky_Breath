"""
Management command to periodically update weather data every 10 minutes
Run with: python manage.py update_weather_periodic
"""

from django.core.management.base import BaseCommand
from django.utils import timezone
from django.core.cache import cache
from weather.models import WeatherData, Forecast
from weather.openweather_service import OpenWeatherMapService
import time
import logging
import threading

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Periodically update weather data from OpenWeatherMap every 10 minutes'

    # List of locations to update
    LOCATIONS = [
        'Chennai', 'Velachery', 'Anna Nagar', 'T. Nagar', 'Adyar',
        'London', 'Paris', 'Tokyo', 'New York', 'Sydney', 'Toronto', 'Dubai'
    ]

    def add_arguments(self, parser):
        parser.add_argument(
            '--interval',
            type=int,
            default=600,  # 10 minutes in seconds
            help='Update interval in seconds (default: 600 = 10 minutes)'
        )

    def handle(self, *args, **options):
        interval = options['interval']
        self.stdout.write(
            self.style.SUCCESS(
                f'Starting periodic weather updates every {interval} seconds ({interval // 60} minutes)'
            )
        )
        self.stdout.write('Press Ctrl+C to stop')

        try:
            while True:
                self.update_all_weather()
                self.stdout.write(
                    self.style.SUCCESS(
                        f'Weather update completed at {timezone.now().strftime("%Y-%m-%d %H:%M:%S")}'
                    )
                )
                
                # Set last update timestamp in cache for API to use
                cache.set('last_weather_update', timezone.now().isoformat(), timeout=None)
                
                # Wait for next update
                time.sleep(interval)
        except KeyboardInterrupt:
            self.stdout.write(self.style.WARNING('\nStopping periodic weather updates'))

    def update_all_weather(self):
        """Update weather data for all locations"""
        service = OpenWeatherMapService()
        
        for location in self.LOCATIONS:
            try:
                # Fetch current weather
                weather_data = service.get_current_weather(location)
                
                if weather_data:
                    # Save to database
                    WeatherData.objects.create(
                        location=weather_data['location'],
                        temperature=weather_data['temperature'],
                        humidity=weather_data['humidity'],
                        wind_speed=weather_data['wind_speed'],
                        weather_condition=weather_data['weather_condition'],
                        feels_like=weather_data.get('feels_like'),
                        pressure=weather_data.get('pressure'),
                        visibility=weather_data.get('visibility'),
                    )
                    
                    logger.info(f"Updated weather for {location}")
                    self.stdout.write(
                        f"  ✓ {location}: {weather_data['temperature']}°C, {weather_data['weather_condition']}"
                    )
                else:
                    self.stdout.write(f"  ✗ Failed to fetch weather for {location}")
                    
            except Exception as e:
                logger.error(f"Error updating weather for {location}: {str(e)}")
                self.stdout.write(self.style.ERROR(f"  ✗ {location}: {str(e)}"))

            # Brief delay between requests to avoid rate limiting
            time.sleep(0.5)
        
        # Also fetch forecasts
        self.update_forecasts(service)

    def update_forecasts(self, service):
        """Update weather forecasts for all locations"""
        for location in self.LOCATIONS[:5]:  # Update forecasts for first 5 locations
            try:
                forecasts = service.get_forecast(location, days=7)
                
                if forecasts:
                    for forecast_data in forecasts:
                        Forecast.objects.update_or_create(
                            location=location,
                            forecast_date=forecast_data['forecast_date'],
                            defaults={
                                'max_temperature': forecast_data['max_temperature'],
                                'min_temperature': forecast_data['min_temperature'],
                                'weather_condition': forecast_data['weather_condition'],
                                'humidity': forecast_data.get('humidity', 50),
                                'wind_speed': forecast_data.get('wind_speed', 0),
                            }
                        )
                    
                    logger.info(f"Updated forecasts for {location}")
                    
            except Exception as e:
                logger.error(f"Error updating forecast for {location}: {str(e)}")

            time.sleep(0.5)
