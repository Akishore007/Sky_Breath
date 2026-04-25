import os

settings_file = r"e:\MY PROJECTS\backend\weatherhub\settings.py"

# Read current file
with open(settings_file, 'r') as f:
    content = f.read()

# Replace INSTALLED_APPS
old_installed = """INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
]"""

new_installed = """INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third-party apps
    'rest_framework',
    'corsheaders',
    
    # Your apps
    'users.apps.UsersConfig',
    'weather.apps.WeatherConfig',
    'alerts.apps.AlertsConfig',
    'analytics.apps.AnalyticsConfig',
    'news.apps.NewsConfig',
]"""

content = content.replace(old_installed, new_installed)

# Replace MIDDLEWARE
old_middleware = """MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]"""

new_middleware = """MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]"""

content = content.replace(old_middleware, new_middleware)

# Replace ALLOWED_HOSTS
content = content.replace("ALLOWED_HOSTS = []", "ALLOWED_HOSTS = ['localhost', '127.0.0.1', '*']")

# Add REST Framework and CORS configuration at the end
rest_cors_config = """

# ============================================================================
# CORS Configuration - Allow frontend to connect
# ============================================================================

CORS_ALLOWED_ORIGINS = [
    'http://localhost:8080',
    'http://localhost:3000',
    'http://127.0.0.1:8080',
    'http://127.0.0.1:3000',
]

CORS_ALLOW_CREDENTIALS = True


# ============================================================================
# REST Framework Configuration
# ============================================================================

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
}
"""

content += rest_cors_config

# Write updated file
with open(settings_file, 'w') as f:
    f.write(content)

print("✓ settings.py updated successfully!")
