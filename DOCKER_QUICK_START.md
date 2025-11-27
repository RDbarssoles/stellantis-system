# Docker Quick Start Guide

## 🚀 Quick Commands

### Windows (PowerShell/CMD)

```bash
# Start Production
docker-start.bat

# Stop All Containers
docker-stop.bat

# Or manually:
docker-compose up -d                           # Start production
docker-compose -f docker-compose.dev.yml up -d # Start development
docker-compose down                            # Stop all
```

### Linux/Mac (Terminal)

```bash
# Make scripts executable (first time only)
chmod +x docker-start.sh docker-stop.sh

# Start Production
./docker-start.sh

# Stop All Containers
./docker-stop.sh

# Or manually:
docker-compose up -d                           # Start production
docker-compose -f docker-compose.dev.yml up -d # Start development
docker-compose down                            # Stop all
```

## 📋 Common Commands

### Starting Services

```bash
# Production mode (optimized, port 80)
docker-compose up -d

# Development mode (hot-reload, port 3000)
docker-compose -f docker-compose.dev.yml up -d

# With rebuild
docker-compose up -d --build
```

### Viewing Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend

# Last 100 lines
docker-compose logs --tail=100
```

### Stopping Services

```bash
# Stop containers (data preserved)
docker-compose down

# Stop and remove volumes (WARNING: deletes data)
docker-compose down -v
```

### Checking Status

```bash
# View running containers
docker-compose ps

# View resource usage
docker stats

# Check health
docker-compose ps
```

### Troubleshooting

```bash
# Rebuild from scratch
docker-compose build --no-cache
docker-compose up -d

# View container details
docker-compose logs backend
docker inspect pd-smartdoc-backend

# Access container shell
docker-compose exec backend sh
docker-compose exec frontend sh

# Restart a specific service
docker-compose restart backend
```

## 🔍 Accessing the Application

### Production Mode
- **Frontend**: http://localhost (port 80)
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/api/health

### Development Mode
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/api/health

## 💾 Data Persistence

Data is stored in Docker volumes and persists even when containers are stopped:

```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect pd-smartdoc_backend-data

# Backup data
docker run --rm -v pd-smartdoc_backend-data:/data -v $(pwd):/backup alpine tar czf /backup/backup.tar.gz -C /data .

# Restore data
docker run --rm -v pd-smartdoc_backend-data:/data -v $(pwd):/backup alpine tar xzf /backup/backup.tar.gz -C /data
```

## 🐛 Common Issues

### Port Already in Use

```bash
# Windows - Find and kill process
netstat -ano | findstr :80
netstat -ano | findstr :3001
taskkill /PID <process_id> /F

# Linux/Mac - Find and kill process
lsof -i :80
lsof -i :3001
kill -9 <process_id>
```

### Container Won't Start

```bash
# Check logs
docker-compose logs backend

# Check if Docker is running
docker ps

# Restart Docker Desktop (Windows/Mac)
# Or restart Docker service (Linux):
sudo systemctl restart docker
```

### Permission Denied (Linux/Mac)

```bash
# Run with sudo
sudo docker-compose up -d

# Or add user to docker group
sudo usermod -aG docker $USER
# Log out and back in
```

### Cannot Connect to Backend

```bash
# Check if backend is healthy
docker-compose ps

# Check backend logs
docker-compose logs backend

# Test backend directly
curl http://localhost:3001/api/health

# Check network
docker network inspect pd-smartdoc_app-network
```

## 📚 Full Documentation

For complete documentation, see [README.Docker.md](README.Docker.md)

## 🔄 Development Workflow

```bash
# 1. Start development environment
docker-compose -f docker-compose.dev.yml up -d

# 2. Make code changes (hot-reload enabled)
# Edit files in ./backend or ./frontend

# 3. View logs to see changes
docker-compose -f docker-compose.dev.yml logs -f

# 4. Stop when done
docker-compose -f docker-compose.dev.yml down
```

## 🚀 Production Deployment

```bash
# 1. Build production images
docker-compose build

# 2. Start services
docker-compose up -d

# 3. Verify everything is running
docker-compose ps
curl http://localhost/api/health

# 4. Monitor logs
docker-compose logs -f
```

## 📊 Monitoring

```bash
# Resource usage
docker stats

# Container processes
docker-compose top

# Network connections
docker network inspect pd-smartdoc_app-network

# Volume usage
docker system df -v
```

## 🧹 Cleanup

```bash
# Remove stopped containers
docker-compose down

# Remove all (including volumes)
docker-compose down -v

# Clean up Docker system
docker system prune -a

# Remove specific volume
docker volume rm pd-smartdoc_backend-data
```

---

**Need Help?** Check the full documentation in [README.Docker.md](README.Docker.md) or [README.md](README.md)

