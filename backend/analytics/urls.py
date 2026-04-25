from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserAnalyticsViewSet, DailyWeatherStatsViewSet

router = DefaultRouter()
router.register(r'user', UserAnalyticsViewSet, basename='user-analytics')
router.register(r'daily', DailyWeatherStatsViewSet, basename='daily-stats')

urlpatterns = [
    path('', include(router.urls)),
]
