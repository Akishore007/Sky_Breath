# SkyBreath Setup Script for Windows PowerShell
# This script automates the setup process for both frontend and backend

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SkyBreath News & AI Chat - Setup Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if user is in the right directory
if (-not (Test-Path ".\backend") -or -not (Test-Path ".\app")) {
    Write-Host "ERROR: This script must be run from the SkyBreath root directory!" -ForegroundColor Red
    Write-Host "Expected to find 'backend' and 'app' directories here." -ForegroundColor Red
    exit 1
}

Write-Host "✓ Found SkyBreath project structure" -ForegroundColor Green
Write-Host ""

# Step 1: Backend Setup
Write-Host "Step 1: Backend Setup" -ForegroundColor Yellow
Write-Host "=====================" -ForegroundColor Yellow

# Check if Python is installed
Write-Host "Checking Python installation..."
$python = Get-Command python -ErrorAction SilentlyContinue
if ($python) {
    $pythonVersion = python --version
    Write-Host "✓ Found: $pythonVersion" -ForegroundColor Green
} else {
    Write-Host "ERROR: Python not found. Please install Python 3.9+" -ForegroundColor Red
    exit 1
}

# Navigate to backend
Write-Host "Setting up backend..."
cd backend

# Check if virtual environment exists
if (-not (Test-Path "venv")) {
    Write-Host "Creating virtual environment..."
    python -m venv venv
    Write-Host "✓ Virtual environment created" -ForegroundColor Green
}

# Activate virtual environment
Write-Host "Activating virtual environment..."
& .\venv\Scripts\Activate.ps1

# Install requirements
Write-Host "Installing Python packages (this may take a minute)..."
pip install -r requirements.txt -q
Write-Host "✓ Packages installed" -ForegroundColor Green

# Check for Groq specifically
Write-Host "Verifying Groq package..."
pip show groq | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Groq package installed" -ForegroundColor Green
} else {
    Write-Host "Installing Groq..."
    pip install groq==1.0.0 -q
    Write-Host "✓ Groq installed" -ForegroundColor Green
}

# Run migrations
Write-Host "Running Django migrations..."
python manage.py migrate --noinput -q
Write-Host "✓ Database migrations complete" -ForegroundColor Green

Write-Host ""
Write-Host "Backend setup complete! ✓" -ForegroundColor Green
Write-Host ""

# Step 2: Frontend Setup
Write-Host "Step 2: Frontend Setup" -ForegroundColor Yellow
Write-Host "=====================" -ForegroundColor Yellow

# Navigate to app
cd ..\app

# Check if Node.js is installed
Write-Host "Checking Node.js installation..."
$node = Get-Command node -ErrorAction SilentlyContinue
if ($node) {
    $nodeVersion = node --version
    Write-Host "✓ Found Node.js: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "ERROR: Node.js not found. Please install Node.js 16+" -ForegroundColor Red
    exit 1
}

# Check if npm is installed
Write-Host "Checking npm..."
$npm = Get-Command npm -ErrorAction SilentlyContinue
if ($npm) {
    $npmVersion = npm --version
    Write-Host "✓ Found npm: $npmVersion" -ForegroundColor Green
} else {
    Write-Host "ERROR: npm not found" -ForegroundColor Red
    exit 1
}

# Install dependencies
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing npm packages (this may take a minute)..."
    npm install -q
    Write-Host "✓ npm packages installed" -ForegroundColor Green
} else {
    Write-Host "✓ node_modules already exists" -ForegroundColor Green
}

# Check for .env.local
if (-not (Test-Path ".env.local")) {
    Write-Host "Creating .env.local..."
    @"
VITE_API_URL=http://localhost:8000/api/v1
VITE_DEBUG_MODE=true
"@ | Out-File -FilePath ".env.local" -Encoding UTF8
    Write-Host "✓ .env.local created" -ForegroundColor Green
} else {
    Write-Host "✓ .env.local already exists" -ForegroundColor Green
}

Write-Host ""
Write-Host "Frontend setup complete! ✓" -ForegroundColor Green
Write-Host ""

# Step 3: Environment Configuration
Write-Host "Step 3: Environment Configuration" -ForegroundColor Yellow
Write-Host "===================================" -ForegroundColor Yellow

cd ..\backend

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "Creating .env file..."
    @"
# Debug Mode (set to False in production)
DEBUG=True

# Django Security
SECRET_KEY=your-secret-key-here

# Allowed Hosts
ALLOWED_HOSTS=localhost,127.0.0.1

# CORS Settings
CORS_ALLOWED_ORIGINS=http://localhost:8080,http://localhost:3000,http://localhost:5173

# OpenWeatherMap API
# Get your free key from: https://openweathermap.org/api
OPENWEATHER_API_KEY=your_openweathermap_key_here

# Groq AI API
# Get your free key from: https://console.groq.com
GROQ_API_KEY=your_groq_key_here

# OpenWeatherMap Base URL
OPENWEATHER_BASE_URL=https://api.openweathermap.org
"@ | Out-File -FilePath ".env" -Encoding UTF8
    Write-Host "✓ .env file created" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠️  IMPORTANT: Edit .env and add your API keys:" -ForegroundColor Yellow
    Write-Host "    1. OpenWeatherMap key: https://openweathermap.org/api" -ForegroundColor White
    Write-Host "    2. Groq API key: https://console.groq.com" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "✓ .env already exists" -ForegroundColor Green
    
    # Check if keys are configured
    $envContent = Get-Content ".env"
    if ($envContent -match "your_openweathermap_key_here" -or $envContent -match "your_groq_key_here") {
        Write-Host ""
        Write-Host "⚠️  API keys need to be configured in .env:" -ForegroundColor Yellow
        Write-Host "    1. OpenWeatherMap key: https://openweathermap.org/api" -ForegroundColor White
        Write-Host "    2. Groq API key: https://console.groq.com" -ForegroundColor White
        Write-Host ""
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Setup Complete! ✅" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. Edit backend\.env and add your API keys" -ForegroundColor White
Write-Host "2. Start backend: cd backend && python manage.py runserver" -ForegroundColor White
Write-Host "3. In another terminal, start frontend: cd app && npm run dev" -ForegroundColor White
Write-Host "4. Open http://localhost:8080 in your browser" -ForegroundColor White
Write-Host ""
Write-Host "For detailed instructions, see IMPLEMENTATION_GUIDE.md" -ForegroundColor Cyan
Write-Host "For quick reference, see QUICK_CHECKLIST.md" -ForegroundColor Cyan
Write-Host ""

# Offer to open .env for editing
Write-Host "Would you like to open .env for editing? (y/n)" -ForegroundColor Yellow
$response = Read-Host
if ($response -eq "y" -or $response -eq "Y") {
    notepad .env
}

Write-Host ""
Write-Host "Setup script complete! 🎉" -ForegroundColor Green
