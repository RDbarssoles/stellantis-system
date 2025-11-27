@echo off
REM Quick start script for Docker deployment on Windows

echo ========================================
echo  PD-SmartDoc Docker Deployment
echo ========================================
echo.

echo Checking Docker...
docker --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker is not installed or not running!
    echo Please install Docker Desktop for Windows.
    pause
    exit /b 1
)

echo Docker is available.
echo.

echo Choose deployment mode:
echo 1. Production (optimized build)
echo 2. Development (with hot-reload)
echo.
set /p mode="Enter 1 or 2: "

if "%mode%"=="1" (
    echo.
    echo Starting production deployment...
    docker-compose up -d --build
    echo.
    echo ========================================
    echo  Application is running!
    echo ========================================
    echo  Frontend: http://localhost
    echo  Backend:  http://localhost:3001
    echo ========================================
    echo.
    echo To view logs: docker-compose logs -f
    echo To stop:      docker-compose down
) else if "%mode%"=="2" (
    echo.
    echo Starting development deployment...
    docker-compose -f docker-compose.dev.yml up -d --build
    echo.
    echo ========================================
    echo  Development environment is running!
    echo ========================================
    echo  Frontend: http://localhost:3000
    echo  Backend:  http://localhost:3001
    echo ========================================
    echo.
    echo To view logs: docker-compose -f docker-compose.dev.yml logs -f
    echo To stop:      docker-compose -f docker-compose.dev.yml down
) else (
    echo Invalid selection!
    pause
    exit /b 1
)

echo.
pause

