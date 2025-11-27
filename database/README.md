# Database Configuration

This directory contains PostgreSQL database initialization scripts.

## 📁 Directory Structure

```
database/
├── init/                    # Initialization scripts (run on first startup)
│   ├── 01_schema.sql       # Database schema (tables, indexes, triggers)
│   └── 02_seed.sql         # Sample data (optional)
└── README.md               # This file
```

## 🚀 How It Works

When PostgreSQL container starts for the first time, it automatically executes all `.sql` and `.sh` files in the `/docker-entrypoint-initdb.d` directory in alphabetical order.

The `docker-compose.db.yml` mounts this `init` directory to that location:

```yaml
volumes:
  - ./database/init:/docker-entrypoint-initdb.d
```

## 📋 Initialization Scripts

### 01_schema.sql

Creates the database schema:
- **edps** table - Engineering Design Practices
- **dvp** table - Design Validation Plans
- **dfmea** table - Design Failure Mode and Effects Analysis
- Indexes for performance
- Triggers for automatic timestamp updates

### 02_seed.sql (Optional)

Inserts sample data for testing:
- 3 sample EDPS records
- 3 sample DVP records
- 3 sample DFMEA records

**Note:** You can delete or comment out this file if you don't want sample data.

## 🔧 Usage

### First Time Setup

1. **Start the database:**
```bash
docker-compose -f docker-compose.db.yml up -d postgres
```

2. **Check initialization logs:**
```bash
docker-compose logs postgres
```

You should see:
```
NOTICE:  Schema created successfully for PD-SmartDoc
NOTICE:  Sample data inserted successfully
```

3. **Verify tables were created:**
```bash
docker exec -it pd-smartdoc-postgres psql -U pduser -d pdsmartdoc -c "\dt"
```

### Resetting the Database

If you need to reset and reinitialize:

```bash
# Stop and remove containers and volumes
docker-compose -f docker-compose.db.yml down -v

# Start fresh (will run init scripts again)
docker-compose -f docker-compose.db.yml up -d
```

⚠️ **Warning:** This deletes all data!

## 🔍 Database Access

### Using psql (PostgreSQL CLI)

```bash
# Access database console
docker exec -it pd-smartdoc-postgres psql -U pduser -d pdsmartdoc

# Common commands inside psql:
\dt              # List all tables
\d edps          # Describe edps table structure
\d+ edps         # Detailed table info with indexes
\l               # List all databases
\du              # List database users
\q               # Quit psql

# Run queries:
SELECT COUNT(*) FROM edps;
SELECT * FROM dfmea ORDER BY rpn DESC LIMIT 10;
```

### Using SQL Files

```bash
# Execute SQL file
docker exec -i pd-smartdoc-postgres psql -U pduser -d pdsmartdoc < your-script.sql

# Or from inside the container:
docker exec -it pd-smartdoc-postgres bash
psql -U pduser -d pdsmartdoc -f /path/to/script.sql
```

## 📊 Database Schema Details

### EDPS Table
```sql
- id (VARCHAR) - Primary key
- norm_number (VARCHAR) - Norm identification
- title (VARCHAR) - Short title
- description (TEXT) - Detailed description
- target (TEXT) - Objective/target
- images (TEXT[]) - Array of image URLs
- status (VARCHAR) - Status (draft/active/archived)
- created_at (TIMESTAMP) - Creation timestamp
- updated_at (TIMESTAMP) - Last update timestamp
```

### DVP Table
```sql
- id (VARCHAR) - Primary key
- procedure_id (VARCHAR) - Test procedure ID
- procedure_type (VARCHAR) - Type (FUNCIONAL/DURABILIDADE/etc)
- performance_objective (TEXT) - Test objective
- test_name (VARCHAR) - Name of the test
- acceptance_criteria (TEXT) - Pass/fail criteria
- responsible (VARCHAR) - Person responsible
- parameter_range (VARCHAR) - Test parameter ranges
- status (VARCHAR) - Status
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### DFMEA Table
```sql
- id (VARCHAR) - Primary key
- generic_failure (VARCHAR) - High-level failure category
- failure_mode (TEXT) - Specific failure description
- cause (TEXT) - Root cause
- prevention_control (JSONB) - Prevention measures (links to EDPS)
- detection_control (JSONB) - Detection measures (links to DVP)
- severity (INTEGER) - Severity rating (1-10)
- occurrence (INTEGER) - Occurrence rating (1-10)
- detection (INTEGER) - Detection rating (1-10)
- rpn (INTEGER) - Risk Priority Number (computed)
- status (VARCHAR) - Status
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

## 🔐 Security Notes

### Default Credentials

The sample configuration uses:
- **Username:** pduser
- **Password:** pdpassword123 (or from .env DB_PASSWORD)
- **Database:** pdsmartdoc

⚠️ **Important for Production:**
1. Change the default password in `.env` file
2. Use strong, randomly generated passwords
3. Never commit `.env` to version control
4. Consider using Docker secrets for production

### Connection String

```bash
postgresql://pduser:password@localhost:5432/pdsmartdoc
```

In Docker network (container-to-container):
```bash
postgresql://pduser:password@postgres:5432/pdsmartdoc
```

## 📦 Backup and Restore

### Backup

```bash
# SQL dump
docker exec pd-smartdoc-postgres pg_dump -U pduser pdsmartdoc > backup-$(date +%Y%m%d).sql

# Compressed backup
docker exec pd-smartdoc-postgres pg_dump -U pduser pdsmartdoc | gzip > backup-$(date +%Y%m%d).sql.gz
```

### Restore

```bash
# From SQL dump
docker exec -i pd-smartdoc-postgres psql -U pduser pdsmartdoc < backup.sql

# From compressed backup
gunzip -c backup.sql.gz | docker exec -i pd-smartdoc-postgres psql -U pduser pdsmartdoc
```

## 🛠️ Troubleshooting

### Database Won't Start

```bash
# Check logs
docker-compose logs postgres

# Common issues:
# 1. Port 5432 already in use
# 2. Permission issues with volume
# 3. Corrupted data directory
```

### Init Scripts Not Running

Init scripts only run on **first startup** when the data directory is empty.

To force re-initialization:
```bash
docker-compose down -v  # Removes volumes
docker-compose up -d    # Fresh start
```

### Connection Refused

```bash
# Check if postgres is running
docker-compose ps postgres

# Check if it's healthy
docker-compose ps  # Look for "healthy" status

# Test connection
docker exec pd-smartdoc-postgres pg_isready -U pduser
```

## 📚 Additional Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/15/)
- [Docker PostgreSQL Image](https://hub.docker.com/_/postgres)
- [SQL Tutorial](https://www.postgresqltutorial.com/)

---

**Questions?** See the main [DATABASE_MIGRATION_GUIDE.md](../DATABASE_MIGRATION_GUIDE.md) for complete migration instructions.

