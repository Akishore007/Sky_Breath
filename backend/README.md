# Backend - Django REST API

Django-based backend for SkyBreath weather and air quality platform with multi-agent intelligence.

## Features

- **Weather API**: Real-time weather data from OpenWeatherMap
- **News Integration**: 24 news channels across multiple countries
- **Multi-Agent System**: Data Fetcher, Predictive, and Impact agents
- **Authentication**: Token-based authentication
- **CORS Support**: Enable cross-origin requests
- **RESTful API**: Comprehensive REST endpoints

## Quick Start

### Setup

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment config
cp .env.example .env

# Run migrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Start development server
python manage.py runserver 0.0.0.0:8000
```

### Environment Variables (.env)

```
DEBUG=False
SECRET_KEY=your-secret-key-change-in-production
ALLOWED_HOSTS=localhost,127.0.0.1

OPENWEATHER_API_KEY=your-openweathermap-api-key
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

DATABASE_URL=sqlite:///db.sqlite3  # or PostgreSQL for production
```

## API Endpoints

### Weather
- `GET /api/v1/weather/current/by_location/?location=Chennai`
- `GET /api/v1/weather/aqi/`
- `POST /api/v1/weather/agents/forecast/`

### News
- `GET /api/v1/news/channels/`
- `GET /api/v1/news/channels/?country=India`

### Authentication
- `POST /auth/token/`
- `POST /auth/token/refresh/`

## File Structure

```
backend/
├── weatherhub/              # Django project settings
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── weather/                 # Weather app
│   ├── models.py
│   ├── views.py
│   ├── serializers.py
│   └── agents/             # Multi-agent system
├── news/                    # News app
│   ├── models.py
│   ├── views.py
│   └── serializers.py
├── db.sqlite3               # Database (dev)
├── manage.py
└── requirements.txt
```

## Database Models

### NewsChannel
```python
- name
- slug (unique)
- language
- country, state, city
- stream_url  # YouTube channel URL
- logo
- description
- is_verified
```

### Weather
- Location data
- Temperature, humidity, wind
- Air quality metrics
- Forecast data

## Multi-Agent System

### Data Fetcher Agent
- Collects real-time weather data
- Sources: OpenWeatherMap, NOAA
- Caches data for performance

### Predictive Agent
- ML-based forecasting
- Models: ConvLSTM, GraphCast
- Rain probability, temperature trends

### Impact Agent
- Health recommendations
- Activity suggestions
- Clothing recommendations

## Production Deployment

### 1. Database Setup
```bash
# Use PostgreSQL for production
pip install psycopg2-binary

# Update .env
DATABASE_URL=postgresql://user:password@host:port/skybreath
```

### 2. Settings Update
```python
# Set DEBUG=False in .env
# Update ALLOWED_HOSTS
# Configure SECRET_KEY (use secure random value)
# Enable HTTPS/CSRF settings
```

### 3. Static Files
```bash
python manage.py collectstatic --noinput
```

### 4. Use Gunicorn
```bash
pip install gunicorn
gunicorn weatherhub.wsgi --bind 0.0.0.0:8000
```

## Testing

```bash
# Run tests
python manage.py test

# Run specific test
python manage.py test weather.tests

# With coverage
coverage run --source='.' manage.py test
coverage report
```

## Admin Panel

Access Django admin at `/admin/` after creating superuser.

## Common Issues

**ModuleNotFoundError**: Ensure all packages in requirements.txt are installed
**Configuration Error**: Check .env file exists and contains required keys
**CORS Errors**: Verify CORS_ALLOWED_ORIGINS matches frontend URLs
**Database Error**: Run `python manage.py migrate`

## Performance Optimization

- Use select_related() and prefetch_related() for queries
- Cache API responses with Redis
- Implement pagination for large datasets
- Use database indexes on frequently queried fields

## Security Tips

- Never commit .env files or secrets
- Use strong SECRET_KEY in production
- Enable CSRF and CORS properly
- Sanitize user inputs
- Use HTTPS in production
- Keep dependencies updated

## Contributing

1. Create feature branch from main
2. Make changes and test
3. Submit pull request
4. Ensure tests pass before merge

## License

MIT

---

For frontend, see [Frontend README](../app/README.md)
