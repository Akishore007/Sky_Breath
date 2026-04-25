# SkyBreath Development Server Launcher
# This PowerShell script starts both the frontend and backend servers

$rootPath = Split-Path -Parent $MyInvocation.MyCommand.Path

# Start Frontend
Write-Host "Starting SkyBreath Frontend..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$($rootPath)\app'; npm run dev:frontend"

# Start Backend
Write-Host "Starting SkyBreath Backend..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$($rootPath)\backend'; .\venv\Scripts\python.exe manage.py migrate; .\venv\Scripts\python.exe manage.py runserver"

# Open browser
Write-Host "Opening browser in 3 seconds..." -ForegroundColor Yellow
Start-Sleep -Seconds 3
Start-Process "http://localhost:8080"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SkyBreath Development Environment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:8080" -ForegroundColor Green
Write-Host "Backend API: http://localhost:8000" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Servers started in separate windows" -ForegroundColor Yellow
Write-Host "Close any window to stop that server" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
