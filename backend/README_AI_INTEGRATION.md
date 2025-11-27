# SAI Library AI Tools Integration

This document explains how to configure and use the SAI Library AI tools integration in PD-SmartDoc.

## Overview

PD-SmartDoc integrates with SAI Library's AI-powered document generation tools to help users create:
- **EDPS** (Engineering Design Practices) - AI-generated norms
- **DVP&R** (Design Validation Plans) - AI-generated test procedures  
- **DFMEA** (Failure Mode Analysis) - AI-generated failure analysis

## Configuration

### 1. Get SAI API Key

Contact SAI Library to obtain your API key.

### 2. Configure Environment Variables

Create or edit `backend/.env` file:

```env
PORT=3001
SAI_API_KEY=your_actual_api_key_here
```

### 3. Install Dependencies

```bash
cd backend
npm install
```

New dependencies added:
- `axios` - HTTP client for API calls
- `dotenv` - Environment variable management

### 4. Restart Backend

```bash
npm start
```

## API Endpoints

### Check Configuration Status

```bash
GET /api/ai-tools/status
```

Response:
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

### Generate EDPS Norm

```bash
POST /api/ai-tools/edps
Content-Type: application/json

{
  "norma": "Create a procedure for safe tire changing including tools and safety steps"
}
```

**SAI Library Parameter:** `norma`

### Generate DFMEA Analysis

```bash
POST /api/ai-tools/dfmea
Content-Type: application/json

{
  "norma": "Analyze failure mode for difficult tire change due to damaged threads"
}
```

**SAI Library Parameter:** `DFMEA` (uppercase)

### Generate DVP Test Procedure

```bash
POST /api/ai-tools/dvp
Content-Type: application/json

{
  "norma": "Create functional test for tire extraction force between 50N and 100N"
}
```

**SAI Library Parameter:** `teste` (note: different from EDPS/DFMEA)

## Frontend Integration

### User Flow

1. User navigates to EDPS/DVP/DFMEA module
2. Selects **"Use AI Tool 🤖"** option
3. Provides description of what to create
4. AI generates structured content
5. User reviews and saves

### Example Usage

**EDPS Flow:**
```
User: "Use AI Tool"
Bot: "Please describe the norm you want to create..."
User: "Create a tire change safety procedure"
Bot: "🤖 Generating... ✅ Here's what I created..."
User: "Yes, save it"
```

## SAI Library Templates

The integration uses these SAI Library template IDs:

| Document Type | Template ID | Parameter Name | Purpose |
|--------------|-------------|----------------|---------|
| EDPS | `69132d45057530242d71a7c6` | `norma` | Norm Creator |
| DFMEA | `69137dd6861d3932bb6e6a00` | `DFMEA` | Failure Analysis |
| DVP | `6913977b057530242d720f2c` | `teste` | Test Procedure Creator |

**Important:** Each template expects different input parameter names:
- EDPS uses `norma`
- DFMEA uses `DFMEA` (uppercase)
- DVP uses `teste`

## Error Handling

### API Key Not Configured
```json
{
  "success": false,
  "error": "SAI API key not configured. Please set SAI_API_KEY environment variable."
}
```

**Solution:** Add SAI_API_KEY to `.env` file and restart backend.

### Missing Input Parameter
```json
{
  "success": false,
  "error": "Missing inputs: teste for template..."
}
```

**Solution:** This error occurs when the wrong parameter name is used. Make sure:
- EDPS uses `norma`
- DFMEA uses `DFMEA` (uppercase)
- DVP uses `teste`

### SAI Library API Error
```json
{
  "success": false,
  "error": "API error message from SAI Library",
  "details": { ... }
}
```

**Common causes:**
- Invalid API key
- Rate limiting
- Template not found
- Network issues
- Wrong parameter name for template

## Data Flow

```
Frontend (User Input)
    ↓
Backend API (/api/ai-tools/edps)
    ↓
SAI Library API (template/execute)
    ↓
AI Processing
    ↓
Structured Response
    ↓
Backend (parse & format)
    ↓
Frontend (display & save)
```

## Response Format

SAI Library returns AI-generated content. The backend wraps it:

```json
{
  "success": true,
  "data": {
    // AI-generated content structure varies by template
    "title": "...",
    "description": "...",
    "content": "..."
  },
  "message": "Document generated successfully using AI"
}
```

## Testing

### Test AI Tool Status

```bash
curl http://localhost:3001/api/ai-tools/status
```

### Test EDPS Generation

```bash
curl -X POST http://localhost:3001/api/ai-tools/edps \
  -H "Content-Type: application/json" \
  -d '{"norma": "Create a tire change procedure"}'
```

### Test DVP Generation

```bash
curl -X POST http://localhost:3001/api/ai-tools/dvp \
  -H "Content-Type: application/json" \
  -d '{"norma": "Create a functional test for tire extraction"}'
```

## Security Considerations

⚠️ **Important:**
- Never commit `.env` file to version control
- Keep API keys secret
- Use environment-specific keys (dev/staging/prod)
- Implement rate limiting for production
- Add authentication/authorization before production deployment

## Troubleshooting

### AI Tool Not Available
1. Check `.env` file exists with SAI_API_KEY
2. Verify API key is valid
3. Check backend logs for errors
4. Test with `/api/ai-tools/status` endpoint

### Wrong Parameter Name Error
**Error:** "Missing inputs: teste for template..."

**Cause:** The frontend is sending data to an endpoint, but the SAI template expects a different parameter name.

**Solution:** Backend now correctly maps:
- EDPS: `norma` → SAI template expects `norma`
- DVP: `norma` → SAI template expects `teste` (mapped in backend)
- DFMEA: `norma` → SAI template expects `DFMEA` (uppercase, mapped in backend)

### Slow Response
- SAI Library AI processing can take 5-30 seconds
- Frontend shows "Generating..." message
- Consider adding timeout handling

### Unexpected Response Format
- AI responses may vary in structure
- Backend attempts to parse common fields
- May need to adjust parsing logic based on actual responses

## Future Enhancements

- [ ] Cache AI responses to reduce API calls
- [ ] Add response time monitoring
- [ ] Implement retry logic for failures
- [ ] Add AI response quality scoring
- [ ] Allow users to refine AI output
- [ ] Track AI usage metrics
- [ ] Add cost tracking per document type

## Support

For issues with:
- **SAI Library API**: Contact SAI support
- **PD-SmartDoc Integration**: Check backend logs and open issue
