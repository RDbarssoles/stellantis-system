# Database Setup - Quick Start

## 🚀 Quick Start with PostgreSQL

### Step 1: Start with Database

```bash
# Start all services including PostgreSQL
docker-compose -f docker-compose.db.yml up -d
```

This starts:
- ✅ PostgreSQL database (port 5432)
- ✅ Backend API (port 3001)
- ✅ Frontend (port 80)

### Step 2: Verify Everything is Running

```bash
# Check status
docker-compose -f docker-compose.db.yml ps

# Should show all services as "healthy"
```

### Step 3: Access the Application

- **Frontend:** http://localhost
- **Backend API:** http://localhost:3001/api/health
- **Database:** localhost:5432 (from host machine)

### Step 4: Verify Database

```bash
# Connect to database
docker exec -it pd-smartdoc-postgres psql -U pduser -d pdsmartdoc

# Inside psql, run:
\dt              # List tables (should see: edps, dvp, dfmea)
SELECT COUNT(*) FROM edps;    # Check sample data
\q               # Exit
```

## 📊 What You Get

### Database Tables

1. **edps** - Engineering Design Practices (3 sample records)
2. **dvp** - Design Validation Plans (3 sample records)
3. **dfmea** - Design Failure Mode Analysis (3 sample records)

### Sample Data Included

The database comes with sample data so you can test immediately:
- Sample tire change procedure
- Sample validation tests
- Sample failure mode analysis with RPN calculations

## 🔧 Configuration

### Environment Variables

Create a `.env` file (or use defaults):

```bash
# Database password
DB_PASSWORD=pdpassword123

# Use database instead of JSON files
USE_DATABASE=true
```

**Note:** The `.env` file is optional for quick start. Defaults are provided.

## 🎯 Common Commands

### View Logs

```bash
# All services
docker-compose -f docker-compose.db.yml logs -f

# Just database
docker-compose -f docker-compose.db.yml logs -f postgres

# Just backend
docker-compose -f docker-compose.db.yml logs -f backend
```

### Stop Services

```bash
# Stop but keep data
docker-compose -f docker-compose.db.yml down

# Stop and remove all data (⚠️ WARNING: deletes everything!)
docker-compose -f docker-compose.db.yml down -v
```

### Restart Services

```bash
# Restart all
docker-compose -f docker-compose.db.yml restart

# Restart specific service
docker-compose -f docker-compose.db.yml restart backend
```

### Access Database

```bash
# PostgreSQL command line
docker exec -it pd-smartdoc-postgres psql -U pduser -d pdsmartdoc

# Inside psql:
\dt                           # List tables
\d edps                       # Describe edps table
SELECT * FROM edps;           # View all EDPS records
SELECT * FROM dfmea ORDER BY rpn DESC;  # View DFMEA by risk
\q                            # Exit
```

### Backup Database

```bash
# Create backup
docker exec pd-smartdoc-postgres pg_dump -U pduser pdsmartdoc > backup.sql

# Restore from backup
docker exec -i pd-smartdoc-postgres psql -U pduser pdsmartdoc < backup.sql
```

## 🔄 Switching from JSON to Database

If you've been using JSON files and want to migrate:

1. **Keep JSON files as backup:**
```bash
cp backend/data/edps.json backend/data/edps.json.backup
cp backend/data/dvp.json backend/data/dvp.json.backup
cp backend/data/dfmea.json backend/data/dfmea.json.backup
```

2. **Start database services:**
```bash
docker-compose -f docker-compose.db.yml up -d
```

3. **Use the migration script (when implemented):**
```bash
cd backend
node scripts/migrate-to-db.js
```

For complete migration instructions, see [DATABASE_MIGRATION_GUIDE.md](DATABASE_MIGRATION_GUIDE.md)

## 🎨 Architecture with Database

```
┌─────────────────────────────────────────┐
│           Docker Host                    │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │  Frontend (Nginx) - Port 80        │ │
│  └───────────┬────────────────────────┘ │
│              │                           │
│              │ /api → backend:3001       │
│              ▼                           │
│  ┌────────────────────────────────────┐ │
│  │  Backend (Node.js) - Port 3001     │ │
│  └───────────┬────────────────────────┘ │
│              │                           │
│              │ SQL queries               │
│              ▼                           │
│  ┌────────────────────────────────────┐ │
│  │  PostgreSQL - Port 5432            │ │
│  │  Database: pdsmartdoc              │ │
│  │  Tables: edps, dvp, dfmea          │ │
│  └────────────────────────────────────┘ │
│              │                           │
│              ▼                           │
│  ┌────────────────────────────────────┐ │
│  │  Docker Volume: postgres-data      │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

## 📝 Database Connection Details

### From Host Machine (your computer)

```
Host: localhost
Port: 5432
Database: pdsmartdoc
Username: pduser
Password: pdpassword123 (or from .env)
```

### From Docker Network (container-to-container)

```
Host: postgres
Port: 5432
Database: pdsmartdoc
Username: pduser
Password: pdpassword123 (or from .env)
```

### Connection String

```
postgresql://pduser:pdpassword123@localhost:5432/pdsmartdoc
```

## 🛠️ Troubleshooting

### Database Won't Start

```bash
# Check if port 5432 is in use
netstat -ano | findstr :5432

# Check logs
docker-compose -f docker-compose.db.yml logs postgres
```

### Can't Connect to Database

```bash
# Wait for database to be ready (takes ~10 seconds)
docker-compose -f docker-compose.db.yml ps

# Test connection
docker exec pd-smartdoc-postgres pg_isready -U pduser
```

### Reset Everything

```bash
# Stop and remove everything
docker-compose -f docker-compose.db.yml down -v

# Start fresh
docker-compose -f docker-compose.db.yml up -d
```

## 📚 Learn More

- **Complete Migration Guide:** [DATABASE_MIGRATION_GUIDE.md](DATABASE_MIGRATION_GUIDE.md)
- **Database Schema Details:** [database/README.md](database/README.md)
- **Docker Documentation:** [README.Docker.md](README.Docker.md)

## 💡 Tips

### Development Workflow

1. Start services once:
```bash
docker-compose -f docker-compose.db.yml up -d
```

2. Make code changes (backend/frontend)

3. Rebuild and restart:
```bash
docker-compose -f docker-compose.db.yml up -d --build
```

4. Data persists between restarts!

### Production Deployment

For production, remember to:
- ✅ Change default database password in `.env`
- ✅ Use proper secrets management
- ✅ Enable SSL/TLS
- ✅ Set up automated backups
- ✅ Configure monitoring

See [DATABASE_MIGRATION_GUIDE.md](DATABASE_MIGRATION_GUIDE.md) for production best practices.

---

**Ready to use PostgreSQL? Just run:**
```bash
docker-compose -f docker-compose.db.yml up -d
```

**That's it! 🎉**

