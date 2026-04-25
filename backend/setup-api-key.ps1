# OpenWeatherMap API Setup Script (PowerShell)
# This script helps you set up the OpenWeatherMap API integration

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  OpenWeatherMap Integration Setup" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "STEP 1: Get Your Free API Key" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Open your browser and go to: https://openweathermap.org/api"
Write-Host "2. Click 'Sign Up' to create a FREE account"
Write-Host "3. Verify your email"
Write-Host "4. Go to https://openweathermap.org/appid"
Write-Host "5. Copy your 'Default' API key"
Write-Host ""
Write-Host ""

$api_key = Read-Host "Enter your OpenWeatherMap API key"

if ($api_key -eq "") {
    Write-Host ""
    Write-Host "ERROR: No API key provided!" -ForegroundColor Red
    Write-Host "Please get your free API key from: https://openweathermap.org/appid" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "Setting environment variable..." -ForegroundColor Green

# Set environment variable for current session
$env:OPENWEATHER_API_KEY = $api_key

# Set permanently (requires admin)
try {
    [System.Environment]::SetEnvironmentVariable('OPENWEATHER_API_KEY', $api_key, 'User')
    Write-Host "SUCCESS! API key has been set permanently." -ForegroundColor Green
} catch {
    Write-Host "WARNING: Could not set permanently (requires admin). Using for this session only." -ForegroundColor Yellow
    Write-Host "To set permanently, run PowerShell as Administrator and execute:" -ForegroundColor Yellow
    Write-Host "[System.Environment]::SetEnvironmentVariable('OPENWEATHER_API_KEY', '$api_key', 'User')" -ForegroundColor Gray
}

Write-Host ""
Write-Host "STEP 2: Restart Django Server" -ForegroundColor Yellow
Write-Host ""
Write-Host "Run these commands in PowerShell:"
Write-Host '  cd "e:\MY PROJECTS\backend"' -ForegroundColor Gray
Write-Host "  python manage.py runserver 0.0.0.0:8000" -ForegroundColor Gray
Write-Host ""

Write-Host "STEP 3: Test the Integration" -ForegroundColor Yellow
Write-Host ""
Write-Host "In a new PowerShell window, run:"
Write-Host 'Invoke-WebRequest -Uri "http://localhost:8000/api/v1/weather/current/by_location/?location=Chennai"' -ForegroundColor Gray
Write-Host ""
Write-Host "Expected response will include:"
Write-Host '  "source": "openweathermap"  (API key is set and working)' -ForegroundColor Green
Write-Host '  "source": "database"         (fallback - check your API key)' -ForegroundColor Yellow
Write-Host ""

Write-Host "Supported Locations:" -ForegroundColor Yellow
Write-Host "  - Any city name: 'London', 'Paris', 'Tokyo'"
Write-Host "  - City with country: 'Chennai, IN', 'New York, US'"
Write-Host ""

Write-Host "============================================================" -ForegroundColor Cyan
Read-Host "Press Enter to exit"
