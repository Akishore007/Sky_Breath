"""
AI Chat API endpoint with Groq integration
Provides friendly weather assistant with real weather data
"""

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from .groq_service import GroqWeatherAssistant, WeatherIntentDetector
from .openweather_service import OpenWeatherMapService


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def ai_chat(request):
    """
    AI Chat endpoint with weather integration
    
    POST /api/v1/weather/ai-chat/
    
    Request body:
    {
        "message": "What's the weather like?",
        "location": "Chennai"  # Optional, defaults to user's location
    }
    
    Response:
    {
        "status": "success",
        "response": "It's currently 28°C in Chennai with partly cloudy skies...",
        "weather_intent_detected": true,
        "location_mentioned": null,
        "effective_location": "Chennai",
        "needs_location": false,
        "sources": ["Groq AI", "Weather API"]
    }
    """
    
    try:
        # Get message from request
        message = request.data.get('message', '').strip()
        location = request.data.get('location') or request.user.location or 'Chennai'
        
        if not message:
            return Response({
                'status': 'error',
                'message': 'Message is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Initialize Groq assistant
        assistant = GroqWeatherAssistant()
        
        # Detect weather intent
        has_weather_intent = WeatherIntentDetector.detect_weather_intent(message)
        
        # If weather intent detected, try to fetch weather data
        weather_data = None
        if has_weather_intent:
            try:
                weather_service = OpenWeatherMapService()
                weather_data = weather_service.get_current_weather(location)
            except Exception as e:
                # Weather fetch failed - AI will handle gracefully
                print(f"Weather fetch error: {e}")
        
        # Process message with Groq
        result = assistant.process_message(
            message,
            user_location=location,
            weather_data=weather_data
        )
        
        return Response({
            'status': 'success',
            'response': result['response'],
            'weather_intent_detected': result['weather_intent_detected'],
            'location_mentioned': result['location_mentioned'],
            'effective_location': result['effective_location'],
            'needs_location': result['needs_location'],
            'sources': result['sources']
        })
    
    except ValueError as e:
        # Groq API key not configured
        return Response({
            'status': 'error',
            'message': f'AI service not configured: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    except Exception as e:
        return Response({
            'status': 'error',
            'message': f'Error processing message: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def ai_health_check(request):
    """
    Health check for AI service
    
    GET /api/v1/weather/ai-chat/health/
    
    Response:
    {
        "status": "ok" or "error",
        "groq_configured": true/false,
        "message": "..."
    }
    """
    try:
        # Try to initialize Groq
        assistant = GroqWeatherAssistant()
        return Response({
            'status': 'ok',
            'groq_configured': True,
            'message': 'AI service is ready'
        })
    except ValueError:
        return Response({
            'status': 'error',
            'groq_configured': False,
            'message': 'Groq API key not configured. Please set GROQ_API_KEY in environment.'
        }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
    except Exception as e:
        return Response({
            'status': 'error',
            'groq_configured': False,
            'message': f'AI service error: {str(e)}'
        }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
