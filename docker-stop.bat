@echo off
REM Stop Docker containers

echo ========================================
echo  Stopping PD-SmartDoc Containers
echo ========================================
echo.

echo Stopping production containers...
docker-compose down

echo Stopping development containers...
docker-compose -f docker-compose.dev.yml down

echo.
echo All containers stopped.
echo.
pause

