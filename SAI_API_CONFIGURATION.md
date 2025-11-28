# SAI API Configuration Guide

## 🔑 What is the SAI API Key?

The **SAI API Key** is required to use the AI-powered features in PD-SmartDoc:
- 🤖 AI-assisted EDPS norm creation
- 🤖 AI-assisted DVP test creation  
- 🤖 AI-assisted DFMEA failure analysis

**API Provider:** SAI Library (sai-library.saiapplications.com)

---

## 📋 Configuration Steps

### **Step 1: Get Your SAI API Key**

1. Visit: https://sai-library.saiapplications.com
2. Create an account or login
3. Navigate to **API Settings** or **Developer Settings**
4. Generate or copy your API key
5. Keep it secure! ⚠️

---

### **Step 2: Configure for Local Docker**

#### **Option A: Using .env file (Recommended)**

Create a `.env` file in the project root:

```bash
# .env file
DB_PASSWORD=pdpassword123
SAI_API_KEY=your-actual-api-key-here
```

Then deploy:
```bash
docker-compose -f docker-compose.db.yml up -d
```

The `.env` file is automatically loaded by Docker Compose.

---

#### **Option B: Set environment variable directly**

**Windows PowerShell:**
```powershell
$env:SAI_API_KEY="your-actual-api-key-here"
docker-compose -f docker-compose.db.yml up -d
```

**Mac/Linux:**
```bash
export SAI_API_KEY="your-actual-api-key-here"
docker-compose -f docker-compose.db.yml up -d
```

---

### **Step 3: Verify Configuration**

Check if the API key is loaded:

```bash
docker-compose -f docker-compose.db.yml exec backend env | grep SAI_API_KEY
```

Should show: `SAI_API_KEY=your-actual-api-key-here`

---

## ☁️ AWS Deployment Configuration

### **Option 1: AWS ECS/Fargate (Recommended)**

#### **Using AWS Systems Manager Parameter Store:**

1. **Store the API key securely:**
```bash
aws ssm put-parameter \
  --name "/pdsmartdoc/SAI_API_KEY" \
  --value "your-actual-api-key-here" \
  --type "SecureString" \
  --description "SAI Library API Key for PD-SmartDoc"
```

2. **Update ECS Task Definition:**
```json
{
  "containerDefinitions": [
    {
      "name": "backend",
      "image": "your-ecr-repo/pd-smartdoc-backend:latest",
      "secrets": [
        {
          "name": "SAI_API_KEY",
          "valueFrom": "/pdsmartdoc/SAI_API_KEY"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "DB_HOST",
          "value": "your-rds-endpoint"
        }
      ]
    }
  ]
}
```

---

#### **Using AWS Secrets Manager (Alternative):**

1. **Create secret:**
```bash
aws secretsmanager create-secret \
  --name pdsmartdoc/sai-api-key \
  --secret-string "your-actual-api-key-here"
```

2. **Update ECS Task Definition:**
```json
{
  "secrets": [
    {
      "name": "SAI_API_KEY",
      "valueFrom": "arn:aws:secretsmanager:region:account:secret:pdsmartdoc/sai-api-key"
    }
  ]
}
```

3. **Grant IAM permissions:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue"
      ],
      "Resource": "arn:aws:secretsmanager:region:account:secret:pdsmartdoc/sai-api-key*"
    }
  ]
}
```

---

### **Option 2: AWS Elastic Beanstalk**

1. **Configure environment properties:**

```bash
aws elasticbeanstalk update-environment \
  --environment-name pdsmartdoc-prod \
  --option-settings \
    Namespace=aws:elasticbeanstalk:application:environment,OptionName=SAI_API_KEY,Value=your-actual-api-key-here
```

Or via AWS Console:
- Elastic Beanstalk → Your Environment → Configuration
- Software → Environment Properties
- Add: `SAI_API_KEY` = `your-actual-api-key-here`

---

### **Option 3: AWS EC2 (Direct)**

1. **SSH into EC2 instance**

2. **Create .env file:**
```bash
cd /path/to/pdsmartdoc
nano .env
```

Add:
```
SAI_API_KEY=your-actual-api-key-here
DB_PASSWORD=your-db-password
DATABASE_URL=postgresql://user:pass@rds-endpoint:5432/pdsmartdoc
```

3. **Start Docker Compose:**
```bash
docker-compose -f docker-compose.db.yml up -d
```

---

## 🔒 Security Best Practices

### **DO:**
✅ Use AWS Secrets Manager or Parameter Store for production
✅ Use environment variables (never hardcode)
✅ Rotate API keys periodically
✅ Use IAM roles with least privilege
✅ Keep `.env` files out of Git (already in `.gitignore`)
✅ Use different keys for dev/staging/production

### **DON'T:**
❌ Commit API keys to Git
❌ Hardcode keys in source code
❌ Share keys in Slack/Email
❌ Use production keys in development
❌ Log API keys to console

---

## 🧪 Testing the Configuration

### **Test API Key Locally:**

```bash
# Start containers
docker-compose -f docker-compose.db.yml up -d

# Check backend logs for API key errors
docker-compose -f docker-compose.db.yml logs backend | grep SAI

# Test EDPS AI endpoint
curl -X POST http://localhost:3001/api/ai-tools/edps \
  -H "Content-Type: application/json" \
  -d '{"norma": "Criar uma norma para troca de pneu"}'
```

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "message": "EDPS norm generated successfully using AI"
}
```

**Error (No API Key):**
```json
{
  "success": false,
  "error": "SAI API key not configured. Please set SAI_API_KEY environment variable."
}
```

---

## 📝 Environment Variables Summary

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SAI_API_KEY` | **Yes** (for AI features) | `""` | SAI Library API authentication key |
| `DB_PASSWORD` | Yes (PostgreSQL) | `pdpassword123` | Database password |
| `DATABASE_URL` | No | Auto-generated | Full PostgreSQL connection string |
| `NODE_ENV` | No | `production` | Node.js environment |
| `PORT` | No | `3001` | Backend server port |

---

## 🆘 Troubleshooting

### **Error: "SAI API key not configured"**

**Solution:**
1. Create `.env` file with `SAI_API_KEY=your-key`
2. Restart containers: `docker-compose -f docker-compose.db.yml restart backend`
3. Verify: `docker-compose -f docker-compose.db.yml exec backend env | grep SAI`

### **Error: "Unauthorized" or 401 from SAI API**

**Solution:**
1. Verify API key is correct
2. Check if key has expired
3. Regenerate key from SAI Library dashboard

### **AI Features Not Working**

**Solution:**
1. Check backend logs: `docker-compose -f docker-compose.db.yml logs -f backend`
2. Verify network connectivity to sai-library.saiapplications.com
3. Test API key manually with curl/Postman

---

## 📚 Quick Reference

### **Local Development:**
```bash
# Create .env file
echo "SAI_API_KEY=your-key-here" > .env

# Deploy
docker-compose -f docker-compose.db.yml up -d
```

### **AWS Deployment:**
```bash
# Store in Parameter Store
aws ssm put-parameter --name "/pdsmartdoc/SAI_API_KEY" --value "your-key" --type "SecureString"

# Update ECS task to reference the parameter
# (See AWS ECS section above)
```

---

## ✅ Checklist

- [ ] Obtained SAI API key from sai-library.saiapplications.com
- [ ] Created `.env` file in project root
- [ ] Added `SAI_API_KEY=your-key` to `.env`
- [ ] Verified `.env` is in `.gitignore`
- [ ] Tested locally with Docker Compose
- [ ] Configured AWS Secrets Manager/Parameter Store (for production)
- [ ] Updated ECS task definition with secrets
- [ ] Granted IAM permissions
- [ ] Tested AI endpoints in production

---

**Need help?** Contact your SAI Library account manager or check the [SAI Library API documentation](https://sai-library.saiapplications.com/docs).

