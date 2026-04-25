from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import WeatherDataViewSet, ForecastViewSet
from .agent_views import (
    agent_forecast_endpoint,
    agent_raw_data_endpoint,
    agent_prediction_endpoint,
    agent_impact_endpoint,
    agent_health_check
)
from .ai_views import ai_chat, ai_health_check

router = DefaultRouter()
router.register(r'current', WeatherDataViewSet, basename='weather-data')
router.register(r'forecast', ForecastViewSet, basename='forecast')

urlpatterns = [
    path('', include(router.urls)),
    
    # Multi-Agent System Endpoints
    path('agents/', include([
        path('forecast/', agent_forecast_endpoint, name='agent-forecast'),
        path('raw-data/', agent_raw_data_endpoint, name='agent-raw-data'),
        path('prediction/', agent_prediction_endpoint, name='agent-prediction'),
        path('impact/', agent_impact_endpoint, name='agent-impact'),
        path('health/', agent_health_check, name='agent-health'),
    ])),
    
    # AI Chat Endpoints (Groq-powered friendly assistant)
    path('ai-chat/', ai_chat, name='ai-chat'),
    path('ai-chat/health/', ai_health_check, name='ai-health-check'),
]
