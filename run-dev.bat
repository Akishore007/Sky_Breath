@echo off
REM SkyBreath Development Server Launcher
REM This script starts both the frontend and backend servers

cd /d "%~dp0app"
start "SkyBreath Frontend" cmd /k npm run dev:frontend

cd /d "%~dp0backend"
start "SkyBreath Backend" cmd /k "venv\Scripts\python.exe manage.py migrate && venv\Scripts\python.exe manage.py runserver"

REM Open browser after short delay
timeout /t 3 /nobreak
start http://localhost:8080

echo.
echo ========================================
echo SkyBreath Development Environment
echo ========================================
echo Frontend: http://localhost:8080
echo Backend API: http://localhost:8000
echo ========================================
echo Servers started in separate windows
echo Close either window to stop that server
echo ========================================
