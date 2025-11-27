# 🤖 SAI Library AI Tools - Setup Guide

## ✅ What's Been Integrated

I've successfully integrated the three SAI Library AI tools into your PD-SmartDoc chatbot:

1. **Criador de norma (EDPS)** - AI-powered norm creator
2. **Criador de falhas (DFMEA)** - AI-powered failure analysis
3. **Criador de testes (DVP)** - AI-powered test procedure creator

## 📋 Files Created/Modified

### Backend
- ✅ `backend/config/sai.config.js` - SAI Library configuration
- ✅ `backend/routes/ai-tools.js` - AI tools API endpoints
- ✅ `backend/server.js` - Added AI tools routes
- ✅ `backend/package.json` - Added axios & dotenv dependencies
- ✅ `backend/.env.example` - Environment template
- ✅ `backend/README_AI_INTEGRATION.md` - Detailed integration docs

### Frontend
- ✅ `frontend/src/services/api.ts` - Added AI tools API methods
- ✅ `frontend/src/pages/EDPSFlow.tsx` - Added "Use AI Tool 🤖" option
- ✅ `frontend/src/pages/DVPFlow.tsx` - Added "Use AI Tool 🤖" option
- ✅ `frontend/src/pages/DFMEAFlow.tsx` - Added "Use AI Tool 🤖" option

## 🚀 How to Complete Setup

### Step 1: Configure SAI API Key

1. Open `backend/.env` file (already created for you)
2. Add your SAI API key:

```env
PORT=3001
SAI_API_KEY=your_actual_sai_api_key_here
```

### Step 2: Restart Backend

**Stop the current backend** (press Ctrl+C in Terminal 1) and restart:

```bash
cd backend
npm start
```

The console should show:
```
🚀 PD-SmartDoc API running on http://localhost:3001
📚 API Documentation: http://localhost:3001/
```

### Step 3: Verify Integration

Test if AI tools are configured:

```bash
curl http://localhost:3001/api/ai-tools/status
```

Expected response:
```json
{
  "success": true,
  "configured": true,
  "templates": {
    "edps": "69132d45057530242d71a7c6",
    "dfmea": "69137dd6861d3932bb6e6a00",
    "dvp": "6913977b057530242d720f2c"
  }
}
```

### Step 4: Frontend Will Auto-Reload

The frontend (Terminal 3) should automatically reload with Vite HMR. If not, just refresh your browser at `http://localhost:3000`.

## 🎯 How to Use AI Tools in the Chatbot

### EDPS Module (Engineering Norms)

1. Go to **EDPS** module
2. Click **"Use AI Tool 🤖"** button
3. Enter description:
   ```
   "Create a safety procedure for tire changing including required tools, safety steps, and quality checks"
   ```
4. AI generates structured norm
5. Review and save

### DVP Module (Test Procedures)

1. Go to **DVP&R** module
2. Click **"Use AI Tool 🤖"** button
3. Enter description:
   ```
   "Create a functional test for tire extraction force measurement between 50N and 100N with acceptance criteria"
   ```
4. AI generates test procedure
5. Review and save

### DFMEA Module (Failure Analysis)

1. Go to **DFMEA** module
2. Click **"Use AI Tool 🤖"** button
3. Enter description:
   ```
   "Analyze failure mode for difficult tire change caused by damaged screw threads"
   ```
4. AI generates failure analysis
5. Review and save

## 🔧 API Endpoints

### Generate EDPS Norm
```http
POST /api/ai-tools/edps
Content-Type: application/json

{
  "norma": "Description of the norm to create"
}
```

### Generate DFMEA Analysis
```http
POST /api/ai-tools/dfmea
Content-Type: application/json

{
  "norma": "Description of the failure to analyze"
}
```

### Generate DVP Test
```http
POST /api/ai-tools/dvp
Content-Type: application/json

{
  "norma": "Description of the test to create"
}
```

## 💡 User Experience Flow

```
┌─────────────────────────────────────────────┐
│  User opens EDPS/DVP/DFMEA module          │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│  Bot shows options:                         │
│  • Create new document                      │
│  • Use AI Tool 🤖        ← NEW!            │
│  • View existing documents                  │
└──────────────┬──────────────────────────────┘
               │
               ▼ (User selects AI Tool)
┌─────────────────────────────────────────────┐
│  Bot: "Please describe what you want        │
│        to create..."                        │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│  User: "Create a tire change procedure"    │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│  Bot: "🤖 Generating with AI..."           │
│       (calls SAI Library API)               │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│  Bot: "✅ Here's what I created:           │
│        [AI-generated content]               │
│        Would you like to save it?"          │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│  User: "Yes, save it"                       │
│  → Document saved to database               │
└─────────────────────────────────────────────┘
```

## 🔍 Testing Examples

### Test EDPS Generation

```bash
curl -X POST http://localhost:3001/api/ai-tools/edps \
  -H "Content-Type: application/json" \
  -d '{
    "norma": "Create a comprehensive tire change procedure including safety precautions, required tools, step-by-step instructions, and quality verification"
  }'
```

### Test DVP Generation

```bash
curl -X POST http://localhost:3001/api/ai-tools/dvp \
  -H "Content-Type: application/json" \
  -d '{
    "norma": "Create a functional test procedure for measuring tire extraction force with parameter range 50N to 100N, including equipment requirements and acceptance criteria"
  }'
```

### Test DFMEA Generation

```bash
curl -X POST http://localhost:3001/api/ai-tools/dfmea \
  -H "Content-Type: application/json" \
  -d '{
    "norma": "Analyze potential failure modes for tire system focusing on difficult tire change scenarios including damaged threads, incorrect torque, and cross-threading"
  }'
```

## ⚠️ Troubleshooting

### "SAI API key not configured" Error

**Problem:** Backend can't find the API key
**Solution:** 
1. Create `backend/.env` file
2. Add `SAI_API_KEY=your_key_here`
3. Restart backend

### "Use AI Tool 🤖" Not Showing

**Problem:** Frontend not updated
**Solution:**
1. Check if Vite dev server is running
2. Refresh browser (Ctrl+R or Cmd+R)
3. Check browser console for errors

### AI Takes Too Long

**Expected:** SAI Library AI can take 5-30 seconds
**UX:** Bot shows "🤖 Generating with AI..." message
**If Timeout:** Consider increasing axios timeout in `backend/routes/ai-tools.js`

### Invalid API Key Error

**Problem:** SAI Library rejects the key
**Solution:**
1. Verify API key is correct
2. Contact SAI Library support
3. Check if key has necessary permissions

## 📊 What Happens Behind the Scenes

1. **User Input** → Frontend captures description
2. **API Call** → Frontend sends to `/api/ai-tools/{type}`
3. **Backend** → Validates input and API key
4. **SAI Library** → Calls template execute endpoint
5. **AI Processing** → SAI generates structured content
6. **Response** → Backend receives and formats data
7. **Display** → Frontend shows AI-generated content
8. **Save** → User confirms, saves to database

## 🎨 Frontend Changes

### Quick Reply Buttons Updated

**Before:**
```
• Create new norm
• View existing norms
```

**After:**
```
• Create new norm
• Use AI Tool 🤖    ← NEW!
• View existing norms
```

### New Conversation Step

Users can now provide natural language descriptions:
- "Create a safety procedure for..."
- "Analyze failure mode when..."
- "Generate test for measuring..."

## 🔒 Security Notes

⚠️ **Important:**
- Never commit `.env` file to Git
- API key is stored securely in environment variables
- Backend validates all inputs before calling SAI Library
- Error messages don't expose sensitive information

## 📈 Next Steps (Optional Enhancements)

- [ ] Add AI response caching to reduce API calls
- [ ] Implement retry logic for failed AI generations
- [ ] Add user feedback for AI quality (thumbs up/down)
- [ ] Track AI usage metrics per document type
- [ ] Allow users to refine/regenerate AI output
- [ ] Add AI generation history

## 📞 Support

**For SAI Library API issues:**
- Contact SAI Library support team
- Check API status at SAI dashboard

**For Integration issues:**
- Check `backend/README_AI_INTEGRATION.md`
- Review backend logs
- Test with `/api/ai-tools/status` endpoint

---

## ✅ Quick Start Checklist

- [ ] Add SAI_API_KEY to `backend/.env`
- [ ] Restart backend server
- [ ] Test `/api/ai-tools/status` endpoint
- [ ] Try AI tool in EDPS module
- [ ] Try AI tool in DVP module
- [ ] Try AI tool in DFMEA module
- [ ] Verify documents save correctly

**Everything is ready! Just add your SAI API key and restart the backend.** 🚀

