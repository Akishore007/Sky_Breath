@echo off
REM OpenWeatherMap API Setup Script
REM This script helps you set up the OpenWeatherMap API integration

echo.
echo ============================================================
echo   OpenWeatherMap Integration Setup
echo ============================================================
echo.
echo STEP 1: Get Your Free API Key
echo..

echo 1. Open your browser and go to: https://openweathermap.org/api
echo 2. Click "Sign Up" to create a FREE account
echo 3. Verify your email
echo 4. Go to https://openweathermap.org/appid
echo 5. Copy your "Default" API key (starts with alphanumeric characters)
echo.
echo.
echo STEP 2: Set Your API Key (Choose one method below)
echo.
echo METHOD A - Set Temporarily (this session only):
echo    Right-click Command Prompt - Run as Administrator
echo    $env:OPENWEATHER_API_KEY = "paste_your_key_here"
echo.
echo METHOD B - Set Permanently (all sessions):
echo    setx OPENWEATHER_API_KEY "paste_your_key_here"
echo.
echo METHOD C - Use the script below:
echo.

setlocal enabledelayedexpansion

set /p api_key="Enter your OpenWeatherMap API key: "

if "%api_key%"=="" (
    echo.
    echo ERROR: No API key provided!
    echo Please get your free API key from: https://openweathermap.org/appid
    pause
    exit /b 1
)

echo.
echo Setting environment variable...
setx OPENWEATHER_API_KEY "%api_key%"

echo.
echo SUCCESS! API key has been set.
echo.
echo STEP 3: Restart Django Server
echo.
echo Run this command:
echo    cd "e:\MY PROJECTS\backend"
echo    python manage.py runserver 0.0.0.0:8000
echo.
echo STEP 4: Test the Integration
echo.
echo Open your browser and test:
echo    http://localhost:8000/api/v1/weather/current/by_location/?location=Chennai
echo.
echo Expected response will include:
echo    "source": "openweathermap"  (if API key is set)
echo    "source": "database"         (if API key is not set - fallback)
echo.
echo ============================================================
echo.
pause
