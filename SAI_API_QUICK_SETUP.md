# Quick Setup: SAI API Key

## 🎯 What You Need to Do Right Now

The error you're seeing is because the **SAI API Key** is not configured. Here's how to fix it:

---

## ⚡ Quick Fix (2 minutes)

### **Step 1: Get Your SAI API Key**

1. Visit: **https://sai-library.saiapplications.com**
2. Login to your account
3. Go to **Settings** → **API Keys**
4. Copy your API key

---

### **Step 2: Create .env File**

In your project root folder (where docker-compose.yml is), create a file named **`.env`**:

**Windows (PowerShell):**
```powershell
@"
DB_PASSWORD=pdpassword123
SAI_API_KEY=paste-your-api-key-here
"@ | Out-File -FilePath .env -Encoding utf8
```

**Or manually:**
1. Right-click in folder → New → Text Document
2. Name it `.env` (no .txt extension!)
3. Open with Notepad and add:
```
DB_PASSWORD=pdpassword123
SAI_API_KEY=paste-your-api-key-here
```
4. Save and close

---

### **Step 3: Restart Backend**

```powershell
docker-compose -f docker-compose.db.yml restart backend
```

That's it! ✅

---

## 🧪 Test It Works

1. Visit your app: http://localhost
2. Login: stellantis / stellantis_pass
3. Click **EDPS** module
4. Click **"Usar Ferramenta IA"** (Use AI Tool) button
5. Should work now! 🎉

---

## ☁️ For AWS Deployment

### **Quick Method:**

Store the API key in AWS Systems Manager Parameter Store:

```bash
aws ssm put-parameter \
  --name "/pdsmartdoc/SAI_API_KEY" \
  --value "your-actual-api-key-here" \
  --type "SecureString"
```

Then update your ECS Task Definition to reference it (see `SAI_API_CONFIGURATION.md` for details).

---

## 📋 Summary

| What | Where | Value |
|------|-------|-------|
| **Local Docker** | `.env` file in project root | `SAI_API_KEY=your-key` |
| **AWS ECS** | Parameter Store | `/pdsmartdoc/SAI_API_KEY` |
| **AWS EC2** | `.env` file on server | `SAI_API_KEY=your-key` |

---

## 🆘 Still Getting the Error?

### Check if the key is loaded:
```powershell
docker-compose -f docker-compose.db.yml exec backend env | findstr SAI_API_KEY
```

Should show: `SAI_API_KEY=your-key`

### If empty:
1. Make sure `.env` file exists in project root
2. Make sure the file has the right content
3. Restart: `docker-compose -f docker-compose.db.yml restart backend`

---

**Full documentation:** See `SAI_API_CONFIGURATION.md`

