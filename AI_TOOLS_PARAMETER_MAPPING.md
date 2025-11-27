# SAI Library Template Parameter Mapping

## Summary

Each SAI Library template expects different input parameter names. The frontend always sends `norma`, but the backend maps it to the correct parameter for each template.

## Parameter Mapping Table

| Module | Frontend Sends | Backend Maps To | SAI Template Expects | Status |
|--------|---------------|-----------------|---------------------|---------|
| **EDPS** | `norma` | `norma` | `norma` | ✅ Working |
| **DVP** | `norma` | `teste` | `teste` | ✅ Fixed |
| **DFMEA** | `norma` | `DFMEA` | `DFMEA` (uppercase) | ✅ Fixed |

## Template Details

### EDPS (Criador de Norma)
- **Template ID:** `69132d45057530242d71a7c6`
- **Expected Parameter:** `norma`
- **Backend Mapping:** Direct pass-through
```javascript
data: {
  inputs: {
    norma: norma  // ✅ Direct mapping
  }
}
```

### DVP (Criador de Testes)
- **Template ID:** `6913977b057530242d720f2c`
- **Expected Parameter:** `teste`
- **Backend Mapping:** `norma` → `teste`
```javascript
data: {
  inputs: {
    teste: norma  // ✅ Mapped to 'teste'
  }
}
```

### DFMEA (Criador de Falhas)
- **Template ID:** `69137dd6861d3932bb6e6a00`
- **Expected Parameter:** `DFMEA` (uppercase)
- **Backend Mapping:** `norma` → `DFMEA`
```javascript
data: {
  inputs: {
    DFMEA: norma  // ✅ Mapped to 'DFMEA' (uppercase)
  }
}
```

## Why Different Parameter Names?

Each SAI Library template was created independently and defined its own input parameter names:
- **EDPS template** uses generic `norma` (norm)
- **DVP template** uses `teste` (test in Portuguese)
- **DFMEA template** uses `DFMEA` (uppercase acronym)

## Common Errors

### Error: Missing inputs for template

**Error Message:**
```
Missing inputs: teste for template agente-criador-testes---stellantis-dvp
```

**Cause:** Backend is sending wrong parameter name to SAI Library

**Solution:** Backend has been updated to map parameters correctly

### Error: Missing inputs: DFMEA

**Error Message:**
```
Missing inputs: DFMEA for template agente-criador-deteccao-de-falhas---stellantis-dfmea
```

**Cause:** Backend was sending `norma` instead of `DFMEA`

**Solution:** Updated to send `DFMEA` (uppercase)

## Testing Each Endpoint

### Test EDPS
```bash
curl -X POST http://localhost:3001/api/ai-tools/edps \
  -H "Content-Type: application/json" \
  -H "X-Api-Key: YOUR_KEY" \
  -d '{"norma": "Create a tire change procedure"}'
```

### Test DVP
```bash
curl -X POST http://localhost:3001/api/ai-tools/dvp \
  -H "Content-Type: application/json" \
  -H "X-Api-Key: YOUR_KEY" \
  -d '{"norma": "Create a functional test for tire extraction"}'
```
*Backend automatically maps `norma` → `teste`*

### Test DFMEA
```bash
curl -X POST http://localhost:3001/api/ai-tools/dfmea \
  -H "Content-Type: application/json" \
  -H "X-Api-Key: YOUR_KEY" \
  -d '{"norma": "Analyze tire change failure mode"}'
```
*Backend automatically maps `norma` → `DFMEA`*

## Implementation Notes

### Backend (routes/ai-tools.js)

Each endpoint now has the correct mapping:

```javascript
// EDPS - no mapping needed
data: { inputs: { norma: norma } }

// DVP - maps to 'teste'
data: { inputs: { teste: norma } }

// DFMEA - maps to 'DFMEA' (uppercase)
data: { inputs: { DFMEA: norma } }
```

### Frontend (remains unchanged)

The frontend always sends the same payload:
```javascript
aiToolsAPI.generateEDPS(description)  // sends { norma: description }
aiToolsAPI.generateDVP(description)   // sends { norma: description }
aiToolsAPI.generateDFMEA(description) // sends { norma: description }
```

Backend handles the translation!

## Restart Required

After updating the backend parameter mappings, you must restart the backend server:

```bash
cd backend
npm start
```

## Verification

After restart, all three AI tools should work:
1. ✅ **EDPS** - "Use AI Tool 🤖" → Works
2. ✅ **DVP** - "Use AI Tool 🤖" → Works (after restart)
3. ✅ **DFMEA** - "Use AI Tool 🤖" → Works (after restart)

---

**Last Updated:** November 25, 2025  
**Status:** All parameter mappings fixed and working

