@echo off
REM Simple deployment script - Fresh start with updated database
REM Usage: deploy-fresh.bat

echo 🚀 Deploying PD-SmartDoc (Fresh Database)...
echo.

REM Check if .env file exists
if not exist .env (
    echo ⚠️  WARNING: .env file not found!
    echo.
    echo The SAI API key is required for AI features to work.
    echo Please create a .env file with:
    echo   SAI_API_KEY=your-actual-api-key-here
    echo.
    echo See SAI_API_CONFIGURATION.md for details.
    echo.
    pause
)

REM Stop all containers and remove volumes
echo ⏹️  Stopping containers and cleaning up...
docker-compose -f docker-compose.db.yml down -v

echo.
echo 🔨 Building and starting fresh containers...
docker-compose -f docker-compose.db.yml up -d --build

echo.
echo ⏳ Waiting for services to be ready (15 seconds)...
timeout /t 15 /nobreak >nul

echo.
echo 📊 Service Status:
docker-compose -f docker-compose.db.yml ps

echo.
echo ✅ Deployment complete!
echo.
echo 🔗 Application: http://localhost
echo 🔑 Login: stellantis / stellantis_pass
echo 💾 Database: localhost:5432
echo.
echo ⚠️  AI Features: Check if SAI_API_KEY is configured in .env
echo 📝 Check logs: docker-compose -f docker-compose.db.yml logs -f
echo.
pause

