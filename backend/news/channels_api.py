"""
News Channels API endpoints with smart filtering and fallback logic
Implements minimum 4 channels requirement with state->country fallback
"""

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from .channel_service import NewsChannelService


@api_view(['GET'])
@permission_classes([AllowAny])
def get_countries(request):
    """
    Get all available countries with news channels
    
    Endpoint: GET /api/v1/news/channels/countries/
    Returns: { "countries": ["India", "USA", ...] }
    """
    try:
        countries = NewsChannelService.get_countries()
        return Response({
            'status': 'success',
            'countries': countries,
            'count': len(countries)
        })
    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_states(request):
    """
    Get all states/regions for a selected country
    
    Endpoint: GET /api/v1/news/channels/states/?country=India
    Params:
        - country (required): Country name
    Returns: { "states": ["Tamil Nadu", "Karnataka", ...] }
    """
    country = request.query_params.get('country', '').strip()
    
    if not country:
        return Response({
            'status': 'error',
            'message': 'Country parameter is required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        states = NewsChannelService.get_states(country)
        
        if not states:
            return Response({
                'status': 'error',
                'message': f'No states found for country: {country}'
            }, status=status.HTTP_404_NOT_FOUND)
        
        return Response({
            'status': 'success',
            'country': country,
            'states': states,
            'count': len(states)
        })
    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_channels_filtered(request):
    """
    Get news channels for a country and state with smart fallback logic.
    
    GUARANTEED: Returns minimum 4 channels whenever possible
    - First: State-specific channels
    - Then: Country fallback sources (if < 4 state channels)
    - Then: Other state channels (if still < 4)
    
    Fallback levels are labeled in response:
    - "state": Official channels from selected state
    - "country": National fallback sources
    - "other_state": Channels from other states in same country
    
    Endpoint: GET /api/v1/news/channels/filter/?country=India&state=Tamil%20Nadu
    
    Params:
        - country (required): Country name (e.g., "India", "USA")
        - state (optional): State/region name (e.g., "Tamil Nadu")
        
    Returns:
    {
        "status": "success",
        "country": "India",
        "state": "Tamil Nadu",
        "channels": [
            {
                "name": "Sun News",
                "language": "Tamil",
                "channel_type": "news",
                "category": "general",
                "state": "Tamil Nadu",
                "country": "India",
                "official_website": "https://...",
                "youtube_channel": "https://...",
                "logo_url": "...",
                "is_official": true,
                "fallback_level": "state",
                "priority": 1
            },
            ...
        ],
        "total": 4,
        "min_requirement": 4,
        "requirement_met": true,
        "fallback_used": false
    }
    """
    country = request.query_params.get('country', '').strip()
    state = request.query_params.get('state', '').strip() or None
    
    if not country:
        return Response({
            'status': 'error',
            'message': 'Country parameter is required',
            'example': '/api/v1/news/channels/filter/?country=India&state=Tamil%20Nadu'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        channels = NewsChannelService.get_channels_by_country_state(country, state)
        
        if not channels:
            return Response({
                'status': 'error',
                'message': f'No channels found for country: {country}' + (f', state: {state}' if state else '')
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Determine if fallback was used
        fallback_used = any(ch.get('fallback_level') != 'state' for ch in channels)
        
        return Response({
            'status': 'success',
            'country': country,
            'state': state or 'National',
            'channels': channels,
            'total': len(channels),
            'min_requirement': 4,
            'requirement_met': len(channels) >= 4,
            'fallback_used': fallback_used,
            'fallback_explanation': (
                'Displaying country-level sources or other state channels due to insufficient state-specific sources'
                if fallback_used else
                'All channels are from the selected state'
            )
        })
        
    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([AllowAny])
def search_channels(request):
    """
    Search for news channels by name or language
    
    Endpoint: GET /api/v1/news/channels/search/?country=India&query=Tamil
    
    Params:
        - country (required): Country to search in
        - query (required): Search term (name or language)
        
    Returns: Array of matching channels
    """
    country = request.query_params.get('country', '').strip()
    query = request.query_params.get('query', '').strip()
    
    if not country:
        return Response({
            'status': 'error',
            'message': 'Country parameter is required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    if not query:
        return Response({
            'status': 'error',
            'message': 'Query parameter is required for search'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        channels = NewsChannelService.search_channels(country, query)
        
        return Response({
            'status': 'success',
            'country': country,
            'query': query,
            'channels': channels,
            'total': len(channels)
        })
        
    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)
