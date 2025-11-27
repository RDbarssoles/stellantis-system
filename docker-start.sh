#!/bin/bash

# Quick start script for Docker deployment on Linux/Mac

echo "========================================"
echo " PD-SmartDoc Docker Deployment"
echo "========================================"
echo

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "ERROR: Docker is not installed!"
    echo "Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "ERROR: Docker Compose is not installed!"
    echo "Please install Docker Compose first."
    exit 1
fi

echo "Docker is available."
echo

echo "Choose deployment mode:"
echo "1. Production (optimized build)"
echo "2. Development (with hot-reload)"
echo
read -p "Enter 1 or 2: " mode

if [ "$mode" = "1" ]; then
    echo
    echo "Starting production deployment..."
    docker-compose up -d --build
    echo
    echo "========================================"
    echo " Application is running!"
    echo "========================================"
    echo " Frontend: http://localhost"
    echo " Backend:  http://localhost:3001"
    echo "========================================"
    echo
    echo "To view logs: docker-compose logs -f"
    echo "To stop:      docker-compose down"
elif [ "$mode" = "2" ]; then
    echo
    echo "Starting development deployment..."
    docker-compose -f docker-compose.dev.yml up -d --build
    echo
    echo "========================================"
    echo " Development environment is running!"
    echo "========================================"
    echo " Frontend: http://localhost:3000"
    echo " Backend:  http://localhost:3001"
    echo "========================================"
    echo
    echo "To view logs: docker-compose -f docker-compose.dev.yml logs -f"
    echo "To stop:      docker-compose -f docker-compose.dev.yml down"
else
    echo "Invalid selection!"
    exit 1
fi

echo

