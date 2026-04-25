"""
OpenWeatherMap API Integration Service
Fetches live weather data from OpenWeatherMap
"""
import requests
from django.conf import settings
from django.core.cache import cache
import logging

logger = logging.getLogger(__name__)


class OpenWeatherMapService:
    """Service to fetch weather data from OpenWeatherMap API"""
    
    BASE_URL = "https://api.openweathermap.org/data/2.5"
    
    def __init__(self, api_key=None):
        self.api_key = api_key or getattr(settings, 'OPENWEATHER_API_KEY', None)
        if not self.api_key:
            raise ValueError(
                "OpenWeatherMap API key not configured. "
                "Set OPENWEATHER_API_KEY in settings.py or environment variable."
            )
    
    def _map_condition(self, openweather_condition):
        """Map OpenWeatherMap condition to our condition choices"""
        condition_map = {
            'Thunderstorm': 'Thunderstorm',
            'Drizzle': 'Rainy',
            'Rain': 'Rainy',
            'Snow': 'Cloudy',
            'Mist': 'Foggy',
            'Smoke': 'Foggy',
            'Haze': 'Foggy',
            'Dust': 'Foggy',
            'Fog': 'Foggy',
            'Sand': 'Foggy',
            'Ash': 'Foggy',
            'Squall': 'Windy',
            'Tornado': 'Windy',
            'Clear': 'Sunny',
            'Clouds': 'Cloudy',
        }
        
        # Check main condition
        for key, value in condition_map.items():
            if key.lower() in openweather_condition.lower():
                return value
        
        # Default to Partly Cloudy
        return 'Partly Cloudy'
    
    def get_current_weather(self, city, country_code=None):
        """
        Fetch current weather for a city from OpenWeatherMap
        
        Args:
            city (str): City name
            country_code (str): Optional country code (e.g., 'IN' for India)
        
        Returns:
            dict: Weather data in our format or None if error
        """
        cache_key = f'weather_{city}_current'
        cached = cache.get(cache_key)
        if cached:
            logger.info(f"Using cached weather data for {city}")
            return cached
        
        try:
            location = city
            if country_code:
                location = f"{city},{country_code}"
            
            url = f"{self.BASE_URL}/weather"
            params = {
                'q': location,
                'appid': self.api_key,
                'units': 'metric'  # Use Celsius
            }
            
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            
            # Transform OpenWeatherMap data to our format
            weather_data = {
                'location': data['name'],
                'temperature': data['main']['temp'],
                'humidity': data['main']['humidity'],
                'wind_speed': data['wind'].get('speed', 0) * 3.6,  # Convert m/s to km/h
                'weather_condition': self._map_condition(data['weather'][0]['main']),
                'feels_like': data['main'].get('feels_like'),
                'pressure': data['main'].get('pressure'),
                'visibility': data.get('visibility', 0) / 1000 if data.get('visibility') else 0,  # Convert m to km
                'description': data['weather'][0]['description'],
                'icon': data['weather'][0]['icon']
            }
            
            # Cache for 10 minutes
            cache.set(cache_key, weather_data, 600)
            logger.info(f"Fetched current weather for {city}")
            return weather_data
        
        except requests.exceptions.RequestException as e:
            logger.error(f"Error fetching weather for {city}: {str(e)}")
            return None
        except (KeyError, IndexError) as e:
            logger.error(f"Error parsing weather response for {city}: {str(e)}")
            return None
    
    def get_forecast(self, city, days=7, country_code=None):
        """
        Fetch weather forecast for a city from OpenWeatherMap
        
        Args:
            city (str): City name
            days (int): Number of days to forecast (1-5 for free tier)
            country_code (str): Optional country code
        
        Returns:
            list: List of forecast dictionaries or None if error
        """
        # Note: Free tier only provides 5-day forecast
        if days > 5:
            days = 5
        
        cache_key = f'weather_{city}_forecast'
        cached = cache.get(cache_key)
        if cached:
            logger.info(f"Using cached forecast data for {city}")
            return cached
        
        try:
            location = city
            if country_code:
                location = f"{city},{country_code}"
            
            url = f"{self.BASE_URL}/forecast"
            params = {
                'q': location,
                'appid': self.api_key,
                'units': 'metric'
            }
            
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            
            # OpenWeatherMap returns 8 forecasts per day (3-hour intervals)
            # Group by day and get the first forecast of each day
            forecasts = {}
            for item in data['list']:
                date = item['dt_txt'].split()[0]  # Extract date
                if date not in forecasts:
                    forecasts[date] = item
            
            # Limit to requested number of days
            forecast_list = []
            for date, item in list(forecasts.items())[:days]:
                forecast_data = {
                    'forecast_date': date,
                    'location': data['city']['name'],
                    'max_temperature': item['main']['temp_max'],
                    'min_temperature': item['main']['temp_min'],
                    'weather_condition': self._map_condition(item['weather'][0]['main']),
                    'humidity': item['main']['humidity'],
                    'wind_speed': item['wind'].get('speed', 0) * 3.6,  # Convert m/s to km/h
                    'precipitation_chance': item.get('pop', 0) * 100,  # PoP (Probability of Precipitation)
                    'description': item['weather'][0]['description'],
                    'icon': item['weather'][0]['icon']
                }
                forecast_list.append(forecast_data)
            
            # Cache for 10 minutes
            cache.set(cache_key, forecast_list, 600)
            logger.info(f"Fetched forecast for {city}")
            return forecast_list
        
        except requests.exceptions.RequestException as e:
            logger.error(f"Error fetching forecast for {city}: {str(e)}")
            return None
        except (KeyError, IndexError) as e:
            logger.error(f"Error parsing forecast response for {city}: {str(e)}")
            return None
    
    @staticmethod
    def clear_cache(city=None):
        """Clear cached weather data"""
        if city:
            cache.delete(f'weather_{city}_current')
            cache.delete(f'weather_{city}_forecast')
        else:
            # Clear all weather cache
            cache.delete_many([
                'weather_Chennai_current',
                'weather_Chennai_forecast',
                'weather_Velachery_current',
                'weather_Velachery_forecast',
                'weather_Anna Nagar_current',
                'weather_Anna Nagar_forecast',
                'weather_T. Nagar_current',
                'weather_T. Nagar_forecast',
                'weather_Adyar_current',
                'weather_Adyar_forecast',
            ])
