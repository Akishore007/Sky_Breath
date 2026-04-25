# Start Django backend server
$backendPath = Join-Path (Get-Item $PSScriptRoot).Parent.FullName "backend"
$venvPath = Join-Path $backendPath "venv"

Write-Host "Starting Django backend server..." -ForegroundColor Green
Write-Host "Working directory: $backendPath`n" -ForegroundColor Gray

# Activate venv and run Django
Set-Location $backendPath
& "$venvPath\Scripts\Activate.ps1"
python manage.py runserver
