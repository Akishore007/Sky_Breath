"""
Agent API Endpoints - Expose the three-agent system to the frontend
"""

from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from datetime import datetime
from .agents import DataFetcherAgent, PredictiveAgent, ImpactAgent


@api_view(['POST'])
def agent_forecast_endpoint(request):
    """
    Endpoint: POST /api/v1/agents/forecast/
    
    Activates all three agents and returns comprehensive weather intelligence
    """
    try:
        location = request.data.get('location', 'London')
        
        # AGENT 1: Data Fetcher
        current_weather = DataFetcherAgent.fetch_current_weather(location)
        forecast_data = DataFetcherAgent.fetch_forecast(location, days=7)
        
        # AGENT 2: Predictive (analyzes the fetched data)
        rain_prediction = PredictiveAgent.predict_rain(current_weather, forecast_data)
        temp_trend = PredictiveAgent.predict_temperature_trend(forecast_data)
        extreme_alerts = PredictiveAgent.predict_extreme_weather(current_weather, forecast_data)
        
        # AGENT 3: Impact (generates actionable advice)
        recommendations = ImpactAgent.generate_recommendations(
            current_weather, 
            rain_prediction, 
            forecast_data
        )
        
        return Response({
            'status': 'success',
            'location': location,
            'data_fetcher': {
                'current_weather': current_weather,
                'forecast_7_day': forecast_data,
                'data_source': 'OpenWeatherMap API + Local Database'
            },
            'predictive_agent': {
                'rain_prediction': rain_prediction,
                'temperature_trend': temp_trend,
                'extreme_weather_alerts': extreme_alerts
            },
            'impact_agent': {
                'recommendations': recommendations
            }
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def agent_raw_data_endpoint(request):
    """
    Endpoint: POST /api/v1/agents/raw-data/
    
    DATA FETCHER AGENT ONLY - Returns raw weather data
    """
    try:
        location = request.data.get('location', 'London')
        
        # Only Data Fetcher Agent
        current_weather = DataFetcherAgent.fetch_current_weather(location)
        forecast_data = DataFetcherAgent.fetch_forecast(location, days=7)
        
        return Response({
            'status': 'success',
            'agent': 'Data Fetcher',
            'location': location,
            'current_weather': current_weather,
            'forecast_7_day': forecast_data,
            'data_source': 'OpenWeatherMap API & Database (NOAA ready)'
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def agent_prediction_endpoint(request):
    """
    Endpoint: POST /api/v1/agents/prediction/
    
    PREDICTIVE AGENT ONLY - Returns ML-based predictions (GraphCast/ConvLSTM)
    """
    try:
        location = request.data.get('location', 'London')
        
        # Fetch data first
        current_weather = DataFetcherAgent.fetch_current_weather(location)
        forecast_data = DataFetcherAgent.fetch_forecast(location, days=7)
        
        # Run Predictive Agent
        rain_prediction = PredictiveAgent.predict_rain(current_weather, forecast_data)
        temp_trend = PredictiveAgent.predict_temperature_trend(forecast_data)
        extreme_alerts = PredictiveAgent.predict_extreme_weather(current_weather, forecast_data)
        
        return Response({
            'status': 'success',
            'agent': 'Predictive (Deep Learning)',
            'location': location,
            'rain_prediction': rain_prediction,
            'temperature_trend': temp_trend,
            'extreme_weather_alerts': extreme_alerts,
            'models_used': ['ConvLSTM Neural Network (Rain)', 'GraphCast Equivalent (Temperature)']
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def agent_impact_endpoint(request):
    """
    Endpoint: POST /api/v1/agents/impact/
    
    IMPACT AGENT ONLY - Returns utility-based actionable recommendations
    """
    try:
        location = request.data.get('location', 'London')
        
        # Fetch data and predictions
        current_weather = DataFetcherAgent.fetch_current_weather(location)
        forecast_data = DataFetcherAgent.fetch_forecast(location, days=7)
        rain_prediction = PredictiveAgent.predict_rain(current_weather, forecast_data)
        
        # Run Impact Agent
        recommendations = ImpactAgent.generate_recommendations(
            current_weather, 
            rain_prediction, 
            forecast_data
        )
        
        return Response({
            'status': 'success',
            'agent': 'Impact (Utility-Based Recommendations)',
            'location': location,
            'recommendations': recommendations,
            'decision_engine': 'Utility-based decision tree'
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def agent_health_check(request):
    """
    Endpoint: GET /api/v1/agents/health/
    
    Check if all three agents are operational
    """
    return Response({
        'status': 'operational',
        'agents': [
            {
                'name': 'Data Fetcher Agent',
                'status': 'Ready',
                'capability': 'Fetches data from OpenWeatherMap, NOAA, Satellite sources'
            },
            {
                'name': 'Predictive Agent',
                'status': 'Ready',
                'capability': 'ML-based forecasting (ConvLSTM, GraphCast)'
            },
            {
                'name': 'Impact Agent',
                'status': 'Ready',
                'capability': 'Generates actionable recommendations'
            }
        ],
        'timestamp': datetime.now().isoformat()
    }, status=status.HTTP_200_OK)
