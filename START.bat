@echo off
REM Quick Start Script - Run this to start SkyBreath Development Environment
REM Simply double-click this file and both servers will start automatically

echo.
echo ========================================
echo   SkyBreath Development Server
echo ========================================
echo.

REM Change to app directory and start frontend
cd /d "%~dp0app"
if exist "package.json" (
    echo Starting Frontend Server...
    start "SkyBreath Frontend - Vite" cmd /k npm run dev:frontend
) else (
    echo ERROR: package.json not found in app directory
    pause
    exit /b 1
)

REM Change to backend directory and start backend
cd /d "%~dp0backend"
if exist "manage.py" (
    echo Starting Backend Server...
    start "SkyBreath Backend - Django" cmd /k "venv\Scripts\python.exe manage.py migrate && venv\Scripts\python.exe manage.py runserver"
) else (
    echo ERROR: manage.py not found in backend directory
    pause
    exit /b 1
)

REM Wait for servers to start
echo.
echo Waiting for servers to start...
timeout /t 4 /nobreak

REM Open browser
echo Opening application in browser...
start http://localhost:8080

echo.
echo ========================================
echo  ✓ SkyBreath is Starting!
echo ========================================
echo.
echo Frontend:  http://localhost:8080
echo Backend:   http://localhost:8000
echo.
echo Two windows should open. Close them to stop the servers.
echo.

exit /b 0
