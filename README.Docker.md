# Docker Configuration for PD-SmartDoc

This document describes how to run the PD-SmartDoc application using Docker containers.

## Overview

The application consists of two services:
- **Backend**: Node.js/Express API server (Port 3001)
- **Frontend**: React application served by Nginx (Port 80)

## Database Solution

Currently, the application uses **JSON file-based storage** (filesystem storage). Data is persisted in JSON files located in the `backend/data` directory:
- `dfmea.json` - DFMEA documents
- `dvp.json` - DVP documents  
- `edps.json` - EDPS documents

The data is persisted using Docker volumes to ensure it survives container restarts.

## Prerequisites

- Docker (version 20.10 or higher)
- Docker Compose (version 2.0 or higher)

## 📖 Quick Reference

For quick commands and common operations, see [DOCKER_QUICK_START.md](DOCKER_QUICK_START.md)

## Quick Start - Production Mode

### Using Quick Start Scripts

**Windows:**
```bash
docker-start.bat
```

**Linux/Mac:**
```bash
chmod +x docker-start.sh  # First time only
./docker-start.sh
```

### Manual Commands

1. **Build and start all services:**
```bash
docker-compose up -d
```

2. **View logs:**
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

3. **Access the application:**
- Frontend: http://localhost
- Backend API: http://localhost:3001
- API Health Check: http://localhost:3001/api/health

4. **Stop services:**
```bash
docker-compose down
```

5. **Stop services and remove volumes (WARNING: deletes all data):**
```bash
docker-compose down -v
```

## Development Mode

For development with hot-reload:

1. **Start development environment:**
```bash
docker-compose -f docker-compose.dev.yml up -d
```

2. **Access the application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

3. **Stop development environment:**
```bash
docker-compose -f docker-compose.dev.yml down
```

## Docker Commands Reference

### Building

```bash
# Build all services
docker-compose build

# Build specific service
docker-compose build backend
docker-compose build frontend

# Build without cache
docker-compose build --no-cache
```

### Managing Services

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose stop

# Restart services
docker-compose restart

# Remove containers
docker-compose down

# Remove containers and volumes
docker-compose down -v
```

### Monitoring

```bash
# View running containers
docker-compose ps

# View logs
docker-compose logs -f

# View resource usage
docker stats

# Execute command in container
docker-compose exec backend sh
docker-compose exec frontend sh
```

### Data Management

```bash
# Backup data volume
docker run --rm -v pd-smartdoc_backend-data:/data -v $(pwd):/backup alpine tar czf /backup/data-backup.tar.gz -C /data .

# Restore data volume
docker run --rm -v pd-smartdoc_backend-data:/data -v $(pwd):/backup alpine tar xzf /backup/data-backup.tar.gz -C /data
```

## Architecture

### Production Setup

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       │ Port 80
       ▼
┌─────────────────┐
│   Nginx         │
│   (Frontend)    │
└────────┬────────┘
         │
         │ /api → Port 3001
         ▼
┌─────────────────┐
│   Node.js       │
│   (Backend)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  JSON Files     │
│  (Volume)       │
└─────────────────┘
```

### Network

All services communicate through a custom Docker bridge network called `app-network`.

### Volumes

- `backend-data`: Persists JSON data files for the backend
- `backend-data-dev`: Separate volume for development environment

## Environment Variables

Create a `.env` file in the root directory (optional):

```bash
# Backend
NODE_ENV=production
PORT=3001

# Frontend
VITE_API_URL=http://localhost:3001/api
```

## Health Checks

Both services include health checks:

- **Backend**: Checks `/api/health` endpoint every 30 seconds
- **Frontend**: Checks nginx server availability every 30 seconds

View health status:
```bash
docker-compose ps
```

## Troubleshooting

### Container won't start

```bash
# Check logs
docker-compose logs backend
docker-compose logs frontend

# Check if ports are already in use
netstat -ano | findstr :3001
netstat -ano | findstr :80
```

### Data not persisting

```bash
# Check volumes
docker volume ls
docker volume inspect pd-smartdoc_backend-data

# Verify volume mount
docker-compose exec backend ls -la /app/data
```

### API connection issues

```bash
# Check network
docker network ls
docker network inspect pd-smartdoc_app-network

# Test backend connectivity from frontend container
docker-compose exec frontend wget -O- http://backend:3001/api/health
```

### Permission issues on Windows

If you encounter permission issues on Windows, ensure:
1. Docker Desktop is running with proper permissions
2. The project directory is in a location Docker has access to
3. File sharing is enabled in Docker Desktop settings

### Rebuild after code changes

```bash
# Rebuild and restart
docker-compose up -d --build

# Force rebuild
docker-compose build --no-cache
docker-compose up -d
```

## Production Deployment Considerations

When deploying to production, consider:

1. **Database Migration**: Replace JSON file storage with a proper database (PostgreSQL, MongoDB, etc.)

2. **Environment Variables**: Use proper secrets management instead of `.env` files

3. **Reverse Proxy**: Use a reverse proxy like Traefik or Nginx in front of the services

4. **SSL/TLS**: Enable HTTPS with proper certificates

5. **Backup Strategy**: Implement automated backups of the data volume

6. **Monitoring**: Add monitoring tools (Prometheus, Grafana)

7. **Logging**: Configure centralized logging (ELK stack, Loki)

8. **Resource Limits**: Set appropriate CPU and memory limits in docker-compose.yml

9. **Security**: 
   - Don't expose backend port directly (use only through frontend proxy)
   - Implement authentication/authorization
   - Keep Docker images updated

## Future Improvements

The current JSON file-based storage is suitable for development and small-scale deployments. For production, consider:

1. **Database Integration**: 
   - Add PostgreSQL or MongoDB service to docker-compose.yml
   - Update backend to use proper database connections
   - Implement migrations

2. **Caching Layer**: 
   - Add Redis for caching and session management

3. **Load Balancing**: 
   - Scale frontend and backend services
   - Add load balancer

4. **CI/CD Integration**:
   - Automated builds
   - Registry pushing
   - Deployment automation

## Support

For issues related to Docker configuration, please refer to:
- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)

