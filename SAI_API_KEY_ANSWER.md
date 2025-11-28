# Answer: SAI API Key Configuration

## 🎯 Yes, You Need to Configure the API Key!

The error you're seeing is expected because the **SAI_API_KEY** environment variable is not set.

---

## 🔧 What I've Done:

### **1. Updated Docker Compose Files**
- ✅ Added `SAI_API_KEY=${SAI_API_KEY}` to `docker-compose.yml`
- ✅ Added `SAI_API_KEY=${SAI_API_KEY}` to `docker-compose.db.yml`

### **2. Created Configuration Files**
- ✅ `SAI_API_QUICK_SETUP.md` - 2-minute setup guide
- ✅ `SAI_API_CONFIGURATION.md` - Complete guide with AWS instructions
- ✅ Updated `deploy-fresh.bat` and `deploy-fresh.sh` to warn about missing API key

### **3. Updated Deployment Scripts**
- ✅ Scripts now check for `.env` file and warn if missing

---

## ⚡ Quick Fix for Local Docker (Right Now):

### **Step 1: Create `.env` File**

In your project root (where docker-compose.yml is), create a file named `.env`:

```
DB_PASSWORD=pdpassword123
SAI_API_KEY=your-actual-api-key-here
```

**Where to get the key:** https://sai-library.saiapplications.com

### **Step 2: Restart Backend**

```powershell
docker-compose -f docker-compose.db.yml restart backend
```

### **Step 3: Test**

- Visit: http://localhost
- Login: stellantis / stellantis_pass
- Click EDPS → "Usar Ferramenta IA"
- Should work now! ✅

---

## ☁️ For AWS Deployment:

### **Option 1: AWS Parameter Store (Recommended)**

```bash
# Store the API key securely
aws ssm put-parameter \
  --name "/pdsmartdoc/SAI_API_KEY" \
  --value "your-actual-api-key-here" \
  --type "SecureString"
```

Then update your **ECS Task Definition**:

```json
{
  "containerDefinitions": [{
    "name": "backend",
    "secrets": [{
      "name": "SAI_API_KEY",
      "valueFrom": "/pdsmartdoc/SAI_API_KEY"
    }]
  }]
}
```

### **Option 2: AWS Secrets Manager**

```bash
# Create secret
aws secretsmanager create-secret \
  --name pdsmartdoc/sai-api-key \
  --secret-string "your-actual-api-key-here"
```

Then reference in ECS task definition.

### **Option 3: Elastic Beanstalk**

AWS Console → Elastic Beanstalk → Environment → Configuration → Software:
- Add environment property: `SAI_API_KEY` = `your-key`

### **Option 4: EC2 Direct**

Create `.env` file on the EC2 instance in the project directory.

---

## 📋 Configuration Summary:

| Deployment Type | Configuration Method | File/Service |
|----------------|---------------------|--------------|
| **Local Docker** | `.env` file | Project root |
| **AWS ECS/Fargate** | Parameter Store or Secrets Manager | AWS Systems Manager |
| **AWS Elastic Beanstalk** | Environment Properties | AWS Console |
| **AWS EC2** | `.env` file | On the server |

---

## 🔒 Security Best Practices:

### ✅ DO:
- Use environment variables
- Use AWS Secrets Manager/Parameter Store for production
- Keep `.env` out of Git (already in `.gitignore`)
- Use different keys for dev/staging/production

### ❌ DON'T:
- Commit API keys to Git
- Hardcode in source code
- Share keys via email/Slack
- Use production keys in development

---

## 🧪 Verify It's Working:

### Check if key is loaded:
```powershell
docker-compose -f docker-compose.db.yml exec backend env | findstr SAI_API_KEY
```

### Test the API:
```powershell
curl -X POST http://localhost:3001/api/ai-tools/edps `
  -H "Content-Type: application/json" `
  -d '{"norma": "Criar uma norma para troca de pneu"}'
```

**Success:** Returns JSON with generated norm  
**Error:** Returns `"SAI API key not configured"` message

---

## 📚 Documentation Created:

1. **`SAI_API_QUICK_SETUP.md`** - Quick 2-minute setup guide
2. **`SAI_API_CONFIGURATION.md`** - Complete guide with AWS examples
3. Updated deployment scripts with API key warnings

---

## ✅ Next Steps:

1. **Get your SAI API key** from https://sai-library.saiapplications.com
2. **Create `.env` file** in project root with the key
3. **Restart backend**: `docker-compose -f docker-compose.db.yml restart backend`
4. **Test the AI features** in the application

---

## 🆘 Still Need Help?

See:
- **Quick setup:** `SAI_API_QUICK_SETUP.md`
- **Full AWS guide:** `SAI_API_CONFIGURATION.md`
- **Backend logs:** `docker-compose -f docker-compose.db.yml logs -f backend`

The AI features will show an error message if the key is not configured, but the rest of the application will work normally! 🚀

