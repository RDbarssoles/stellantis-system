# Quick Deployment Guide

## ✅ Good News: Init and Seed SQL Files Already Updated!

The `database/init/01_schema.sql` and `02_seed.sql` files **already contain** the car_part ENUM and all required changes. No migration needed!

---

## 🚀 Deploy Your Recent Changes

### **Fix Port Conflict + Deploy Everything**

Your error shows port 3001 is already in use. This simple script will:
1. Stop all containers
2. Remove the old database volume
3. Rebuild everything fresh
4. Start with the updated schema (car_part included)

#### **Windows - Double Click:**
```
deploy-fresh.bat
```

#### **Mac/Linux - Run:**
```bash
chmod +x deploy-fresh.sh
./deploy-fresh.sh
```

---

## 🎯 What This Does:

```bash
# Stops containers and removes volumes (including the database)
docker-compose -f docker-compose.db.yml down -v

# Rebuilds and starts fresh with updated SQL files
docker-compose -f docker-compose.db.yml up -d --build
```

The `-v` flag removes the old database volume, so when it restarts:
- ✅ `01_schema.sql` creates tables with `car_part car_part_enum`
- ✅ `02_seed.sql` inserts sample data with car part values
- ✅ Frontend gets login page and car parts filter
- ✅ Backend handles the new fields

---

## ⚠️ About Your Port 3001 Error

**Problem:** Something is already using port 3001 (probably an old backend instance)

**Solutions:**

### Option 1: Find and kill the process
```powershell
# Find what's using port 3001
netstat -ano | findstr :3001

# Kill the process (replace PID with the number from above)
taskkill /PID <PID> /F
```

### Option 2: Use the script (easier)
The `deploy-fresh.bat` script includes `down -v` which stops all containers, freeing port 3001.

---

## 📋 After Deployment:

1. ✅ Visit: http://localhost
2. ✅ Login: **stellantis** / **stellantis_pass**
3. ✅ Home page shows car parts filter (15 buttons)
4. ✅ Click a car part → filtered search results
5. ✅ Create EDPS → see car part dropdown
6. ✅ Upload images → works (50MB limit)

---

## 🔍 What Changed:

| File | Status | Contains |
|------|--------|----------|
| `database/init/01_schema.sql` | ✅ **Already Updated** | car_part_enum, car_part columns |
| `database/init/02_seed.sql` | ✅ **Already Updated** | Sample data with car parts |
| `backend/routes/*.js` | ✅ **Already Updated** | Handles carPart field |
| `backend/data/*.json` | ✅ **Already Updated** | JSON data with carPart |
| `frontend/src/pages/*.tsx` | ✅ **Already Updated** | Login, car parts UI |

---

## 💡 Why Your Approach is Better:

You're absolutely right! Since:
1. The init/seed SQL files are **already updated**
2. You're in **development/PoC phase**
3. No production data to preserve
4. **Simpler** to just restart fresh

There's **no need for migration scripts**. The init SQL files will create everything correctly from scratch.

---

## 🎯 Bottom Line:

**Just run this:**
```cmd
deploy-fresh.bat
```

**Wait 15 seconds, then:**
- Visit http://localhost
- Login with stellantis/stellantis_pass
- Everything works! 🎉

---

## 🆘 If You Still Get Port Errors:

```powershell
# Stop EVERYTHING Docker
docker stop $(docker ps -aq)

# Then run deploy script
deploy-fresh.bat
```

Done! ✅

