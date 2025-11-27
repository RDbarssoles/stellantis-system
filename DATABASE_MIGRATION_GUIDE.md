# Database Migration Guide

This guide explains how to migrate from JSON file storage to PostgreSQL database.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Docker Setup](#docker-setup)
3. [Database Schema](#database-schema)
4. [Backend Code Changes](#backend-code-changes)
5. [Migration Strategy](#migration-strategy)
6. [Testing](#testing)

## 🎯 Overview

### Current Architecture
```
Backend → JSON Files (dfmea.json, dvp.json, edps.json)
```

### Target Architecture
```
Backend → PostgreSQL Database
```

### Benefits of Using PostgreSQL

✅ **ACID Compliance** - Guaranteed data consistency  
✅ **Concurrency** - Handle multiple simultaneous users  
✅ **Transactions** - Rollback on errors  
✅ **Relationships** - Foreign keys and data integrity  
✅ **Scalability** - Handle millions of records  
✅ **Backup/Restore** - Built-in tools  
✅ **Performance** - Indexed queries, optimization  

## 🐳 Docker Setup

### Step 1: Use the Database Docker Compose File

```bash
# Start with PostgreSQL
docker-compose -f docker-compose.db.yml up -d

# Or copy docker-compose.db.yml to docker-compose.yml
cp docker-compose.db.yml docker-compose.yml
docker-compose up -d
```

### Step 2: Configure Environment Variables

Create a `.env` file in the root directory:

```bash
# Database Configuration
DB_PASSWORD=your_secure_password_here
DATABASE_URL=postgresql://pduser:your_secure_password_here@postgres:5432/pdsmartdoc

# Backend Configuration
NODE_ENV=production
PORT=3001

# Frontend Configuration
VITE_API_URL=http://localhost:3001/api
```

**Important:** Never commit `.env` to Git! It's already in `.gitignore`.

## 📊 Database Schema

### Step 3: Create Database Schema

Create `database/init/01_schema.sql`:

```sql
-- Create EDPS table
CREATE TABLE edps (
    id VARCHAR(36) PRIMARY KEY,
    norm_number VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    target TEXT,
    images TEXT[], -- Array of image URLs
    status VARCHAR(50) DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create DVP table
CREATE TABLE dvp (
    id VARCHAR(36) PRIMARY KEY,
    procedure_id VARCHAR(50) NOT NULL,
    procedure_type VARCHAR(50),
    performance_objective TEXT,
    test_name VARCHAR(255) NOT NULL,
    acceptance_criteria TEXT,
    responsible VARCHAR(100),
    parameter_range VARCHAR(100),
    status VARCHAR(50) DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create DFMEA table
CREATE TABLE dfmea (
    id VARCHAR(36) PRIMARY KEY,
    generic_failure VARCHAR(255) NOT NULL,
    failure_mode TEXT NOT NULL,
    cause TEXT,
    prevention_control JSONB, -- Store as JSON object
    detection_control JSONB,  -- Store as JSON object
    severity INTEGER CHECK (severity BETWEEN 1 AND 10),
    occurrence INTEGER CHECK (occurrence BETWEEN 1 AND 10),
    detection INTEGER CHECK (detection BETWEEN 1 AND 10),
    rpn INTEGER GENERATED ALWAYS AS (
        COALESCE(severity, 0) * COALESCE(occurrence, 0) * COALESCE(detection, 0)
    ) STORED,
    status VARCHAR(50) DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_edps_norm_number ON edps(norm_number);
CREATE INDEX idx_edps_status ON edps(status);
CREATE INDEX idx_dvp_procedure_id ON dvp(procedure_id);
CREATE INDEX idx_dvp_status ON dvp(status);
CREATE INDEX idx_dfmea_rpn ON dfmea(rpn);
CREATE INDEX idx_dfmea_status ON dfmea(status);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers to auto-update updated_at
CREATE TRIGGER update_edps_updated_at BEFORE UPDATE ON edps
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dvp_updated_at BEFORE UPDATE ON dvp
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dfmea_updated_at BEFORE UPDATE ON dfmea
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Step 4: Create Sample Data (Optional)

Create `database/init/02_seed.sql`:

```sql
-- Sample EDPS data
INSERT INTO edps (id, norm_number, title, description, target, status) VALUES
('edps-001', '10101', 'Tire Change Procedure', 'Step-by-step safe tire changing process', 'Change tire safely', 'active');

-- Sample DVP data
INSERT INTO dvp (id, procedure_id, procedure_type, test_name, acceptance_criteria, status) VALUES
('dvp-001', '7.27', 'FUNCIONAL', 'Tire Extraction Load Test', 'Force between 50N - 100N', 'active');

-- Sample DFMEA data
INSERT INTO dfmea (id, generic_failure, failure_mode, cause, severity, occurrence, detection, status) VALUES
('dfmea-001', 'Tire System', 'Difficult tire change', 'Damaged screw thread', 7, 5, 3, 'active');
```

## 💻 Backend Code Changes

### Step 5: Install PostgreSQL Dependencies

Update `backend/package.json`:

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "uuid": "^9.0.1",
    "exceljs": "^4.4.0",
    "pdfkit": "^0.13.0",
    "axios": "^1.6.2",
    "dotenv": "^16.3.1",
    "pg": "^8.11.3",
    "pg-hstore": "^2.3.4"
  }
}
```

### Step 6: Create Database Connection Module

Create `backend/config/database.js`:

```javascript
import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Or individual connection params:
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'pdsmartdoc',
  user: process.env.DB_USER || 'pduser',
  password: process.env.DB_PASSWORD,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test connection
pool.on('connect', () => {
  console.log('📊 Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected database error:', err);
});

export default pool;
```

### Step 7: Create New Storage Module

Create `backend/models/db-storage.js`:

```javascript
import pool from '../config/database.js';

/**
 * PostgreSQL-based storage implementation
 */
class DbStorage {
  constructor(tableName) {
    this.tableName = tableName;
  }

  async getAll() {
    const result = await pool.query(
      `SELECT * FROM ${this.tableName} ORDER BY created_at DESC`
    );
    return this.convertRows(result.rows);
  }

  async getById(id) {
    const result = await pool.query(
      `SELECT * FROM ${this.tableName} WHERE id = $1`,
      [id]
    );
    return result.rows.length > 0 ? this.convertRow(result.rows[0]) : null;
  }

  async create(item) {
    const columns = Object.keys(item);
    const values = Object.values(item);
    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
    
    const result = await pool.query(
      `INSERT INTO ${this.tableName} (${columns.join(', ')}) 
       VALUES (${placeholders}) 
       RETURNING *`,
      values
    );
    return this.convertRow(result.rows[0]);
  }

  async update(id, updates) {
    const columns = Object.keys(updates);
    const values = Object.values(updates);
    const setClause = columns.map((col, i) => `${col} = $${i + 2}`).join(', ');
    
    const result = await pool.query(
      `UPDATE ${this.tableName} 
       SET ${setClause} 
       WHERE id = $1 
       RETURNING *`,
      [id, ...values]
    );
    return result.rows.length > 0 ? this.convertRow(result.rows[0]) : null;
  }

  async delete(id) {
    const result = await pool.query(
      `DELETE FROM ${this.tableName} WHERE id = $1`,
      [id]
    );
    return result.rowCount > 0;
  }

  // Convert snake_case to camelCase
  convertRow(row) {
    if (!row) return null;
    const converted = {};
    for (const [key, value] of Object.entries(row)) {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      converted[camelKey] = value;
    }
    return converted;
  }

  convertRows(rows) {
    return rows.map(row => this.convertRow(row));
  }
}

// Create storage instances
export const edpsStorage = new DbStorage('edps');
export const dvpStorage = new DbStorage('dvp');
export const dfmeaStorage = new DbStorage('dfmea');

export default pool;
```

### Step 8: Update Backend to Support Both Storage Types

Create `backend/models/index.js`:

```javascript
import dotenv from 'dotenv';
dotenv.config();

// Choose storage based on environment variable
const USE_DATABASE = process.env.USE_DATABASE === 'true';

let edpsStorage, dvpStorage, dfmeaStorage;

if (USE_DATABASE) {
  console.log('📊 Using PostgreSQL database storage');
  const dbStorage = await import('./db-storage.js');
  edpsStorage = dbStorage.edpsStorage;
  dvpStorage = dbStorage.dvpStorage;
  dfmeaStorage = dbStorage.dfmeaStorage;
} else {
  console.log('📁 Using JSON file storage');
  const fileStorage = await import('./storage.js');
  edpsStorage = fileStorage.edpsStorage;
  dvpStorage = fileStorage.dvpStorage;
  dfmeaStorage = fileStorage.dfmeaStorage;
}

export { edpsStorage, dvpStorage, dfmeaStorage };
```

### Step 9: Update Routes to Use New Storage

Update route imports from:
```javascript
import { edpsStorage } from '../models/storage.js';
```

To:
```javascript
import { edpsStorage } from '../models/index.js';
```

Do this for all route files:
- `backend/routes/edps.js`
- `backend/routes/dvp.js`
- `backend/routes/dfmea.js`

## 🔄 Migration Strategy

### Option 1: Fresh Start (Easiest)

If you don't have important existing data:

1. Start with database-enabled Docker Compose
2. Database tables will be created automatically
3. Start using the application

### Option 2: Migrate Existing Data

If you have existing JSON data to migrate:

Create `backend/scripts/migrate-to-db.js`:

```javascript
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../data');

async function migrateTable(tableName, jsonFile) {
  console.log(`\nMigrating ${tableName}...`);
  
  try {
    // Read JSON file
    const filePath = path.join(DATA_DIR, jsonFile);
    const data = JSON.parse(await fs.readFile(filePath, 'utf-8'));
    
    if (!Array.isArray(data) || data.length === 0) {
      console.log(`  No data to migrate for ${tableName}`);
      return;
    }

    // Convert camelCase to snake_case for database
    const convertToSnakeCase = (obj) => {
      const converted = {};
      for (const [key, value] of Object.entries(obj)) {
        const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        converted[snakeKey] = value;
      }
      return converted;
    };

    // Insert each record
    for (const item of data) {
      const dbItem = convertToSnakeCase(item);
      const columns = Object.keys(dbItem);
      const values = Object.values(dbItem);
      const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
      
      await pool.query(
        `INSERT INTO ${tableName} (${columns.join(', ')}) 
         VALUES (${placeholders}) 
         ON CONFLICT (id) DO NOTHING`,
        values
      );
    }
    
    console.log(`  ✅ Migrated ${data.length} records to ${tableName}`);
  } catch (error) {
    console.error(`  ❌ Error migrating ${tableName}:`, error.message);
  }
}

async function migrate() {
  console.log('🚀 Starting migration from JSON to PostgreSQL...\n');
  
  try {
    await migrateTable('edps', 'edps.json');
    await migrateTable('dvp', 'dvp.json');
    await migrateTable('dfmea', 'dfmea.json');
    
    console.log('\n✅ Migration completed successfully!');
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
  } finally {
    await pool.end();
  }
}

migrate();
```

Run migration:
```bash
# From backend directory
node scripts/migrate-to-db.js
```

## 🧪 Testing

### Test Database Connection

Create `backend/scripts/test-db.js`:

```javascript
import pool from '../config/database.js';

async function testConnection() {
  try {
    const result = await pool.query('SELECT NOW() as current_time, version()');
    console.log('✅ Database connection successful!');
    console.log('📊 PostgreSQL version:', result.rows[0].version);
    console.log('🕐 Current time:', result.rows[0].current_time);
    
    // Test tables exist
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log('\n📋 Tables:', tables.rows.map(r => r.table_name).join(', '));
    
    await pool.end();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();
```

Run test:
```bash
node scripts/test-db.js
```

## 🚀 Deployment Steps

### Complete Setup Process

1. **Create database directory structure:**
```bash
mkdir -p database/init
```

2. **Add SQL files:**
   - Create `database/init/01_schema.sql` (schema)
   - Create `database/init/02_seed.sql` (optional sample data)

3. **Update environment:**
```bash
cp env.template .env
# Edit .env with secure database password
```

4. **Start services:**
```bash
docker-compose -f docker-compose.db.yml up -d
```

5. **Verify database:**
```bash
# Check logs
docker-compose logs postgres

# Connect to database
docker exec -it pd-smartdoc-postgres psql -U pduser -d pdsmartdoc

# Inside psql:
\dt  # List tables
SELECT COUNT(*) FROM edps;  # Check data
\q   # Exit
```

6. **Migrate existing data (if needed):**
```bash
cd backend
npm install pg
node scripts/migrate-to-db.js
```

7. **Update backend to use database:**
```bash
# Set in .env or docker-compose
USE_DATABASE=true
```

8. **Restart services:**
```bash
docker-compose restart backend
```

## 📊 Database Management

### Backup Database

```bash
# Backup to file
docker exec pd-smartdoc-postgres pg_dump -U pduser pdsmartdoc > backup.sql

# Or with Docker volume
docker run --rm -v pd-smartdoc_postgres-data:/data -v $(pwd):/backup alpine tar czf /backup/postgres-backup.tar.gz -C /data .
```

### Restore Database

```bash
# Restore from SQL file
docker exec -i pd-smartdoc-postgres psql -U pduser pdsmartdoc < backup.sql

# Or with Docker volume
docker run --rm -v pd-smartdoc_postgres-data:/data -v $(pwd):/backup alpine tar xzf /backup/postgres-backup.tar.gz -C /data
```

### Access Database Console

```bash
# PostgreSQL CLI
docker exec -it pd-smartdoc-postgres psql -U pduser -d pdsmartdoc

# Common commands:
\dt              # List tables
\d edps          # Describe edps table
\l               # List databases
\du              # List users
SELECT * FROM edps LIMIT 10;  # Query data
```

## 🔧 Troubleshooting

### Connection Issues

```bash
# Check if postgres is running
docker-compose ps postgres

# Check postgres logs
docker-compose logs postgres

# Test connection from backend
docker-compose exec backend sh
apk add postgresql-client
psql -h postgres -U pduser -d pdsmartdoc
```

### Performance Issues

```sql
-- Check slow queries
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY total_time DESC
LIMIT 10;

-- Analyze table statistics
ANALYZE edps;
ANALYZE dvp;
ANALYZE dfmea;
```

## 📚 Additional Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [node-postgres (pg) Documentation](https://node-postgres.com/)
- [Docker PostgreSQL Image](https://hub.docker.com/_/postgres)

---

**Ready to migrate to PostgreSQL? Follow the steps above! 🚀**

