"""
URL configuration for weatherhub project.

The urlpatterns list routes URLs to views. For more information please see:   
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path     
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework.authtoken import views as token_views

urlpatterns = [
    # Admin panel
    path('admin/', admin.site.urls),
    
    # API endpoints
    path('api/v1/users/', include('users.urls')),
    path('api/v1/weather/', include('weather.urls')),
    path('api/v1/alerts/', include('alerts.urls')),
    path('api/v1/analytics/', include('analytics.urls')),
    path('api/v1/news/', include('news.urls')),
    
    # Authentication
    path('api-token-auth/', token_views.obtain_auth_token, name='api-token-auth'),
    path('api-auth/', include('rest_framework.urls')),
]
