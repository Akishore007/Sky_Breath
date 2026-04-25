from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import NewsViewSet, NewsChannelViewSet
from .channels_api import (
    get_countries,
    get_states,
    get_channels_filtered,
    search_channels
)

router = DefaultRouter()
router.register(r'articles', NewsViewSet, basename='news')
router.register(r'channels', NewsChannelViewSet, basename='channels')

urlpatterns = [
    path('', include(router.urls)),
    
    # Smart channels API with filtering and fallback
    path('channels/countries/', get_countries, name='get-countries'),
    path('channels/states/', get_states, name='get-states'),
    path('channels/filter/', get_channels_filtered, name='filter-channels'),
    path('channels/search/', search_channels, name='search-channels'),
]
