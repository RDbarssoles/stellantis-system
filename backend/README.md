# PD-SmartDoc Backend API

Minimal backend API for PD-SmartDoc - Engineering Document Management System.

## Features

- **EDPS Management** - Create and manage Engineering Design Practices (norms)
- **DVP&R Management** - Create and manage Design Validation Plans & Results (test procedures)
- **DFMEA Management** - Create and manage Design Failure Mode and Effects Analysis
- **Document Linking** - Link EDPS norms as prevention controls and DVP tests as detection controls in DFMEA
- **Export Functionality** - Export DFMEA entries to Excel and PDF formats

## Technology Stack

- **Node.js** with ES Modules
- **Express.js** - Web framework
- **UUID** - Unique ID generation
- **ExcelJS** - Excel export
- **PDFKit** - PDF export
- **JSON file storage** - Simple persistence (for minimal backend)

## Installation

```bash
cd backend
npm install
```

## Running the Server

```bash
# Production mode
npm start

# Development mode (with auto-reload on Node.js 18+)
npm run dev
```

The server will start on `http://localhost:3001`

## API Endpoints

### Health Check
- `GET /api/health` - Check server status

### EDPS (Engineering Design Practices)
- `GET /api/edps` - List all norms
- `GET /api/edps/:id` - Get specific norm
- `POST /api/edps` - Create new norm
- `PUT /api/edps/:id` - Update norm
- `DELETE /api/edps/:id` - Delete norm

**Example POST body:**
```json
{
  "normNumber": "10101",
  "title": "Tire Change Procedure",
  "description": "Step-by-step procedure for safely changing a tire...",
  "target": "Change the tire safely",
  "images": ["image1.jpg", "image2.jpg"]
}
```

### DVP&R (Design Validation Plan & Results)
- `GET /api/dvp` - List all test procedures
- `GET /api/dvp/:id` - Get specific test
- `POST /api/dvp` - Create new test
- `PUT /api/dvp/:id` - Update test
- `DELETE /api/dvp/:id` - Delete test

**Example POST body:**
```json
{
  "procedureId": "7.27",
  "procedureType": "FUNCIONAL",
  "performanceObjective": "Validate tire extraction force",
  "testName": "Tire Extraction Load Test",
  "acceptanceCriteria": "Force between 50N - 100N",
  "responsible": "Engineering Team",
  "parameterRange": "50N - 100N"
}
```

### DFMEA (Design Failure Mode and Effects Analysis)
- `GET /api/dfmea` - List all DFMEA entries
- `GET /api/dfmea/:id` - Get specific entry (with populated EDPS/DVP data)
- `POST /api/dfmea` - Create new entry
- `PUT /api/dfmea/:id` - Update entry
- `DELETE /api/dfmea/:id` - Delete entry

**Example POST body:**
```json
{
  "genericFailure": "Tire System",
  "failureMode": "Difficult tire change",
  "cause": "Damaged screw thread",
  "preventionControl": {
    "type": "EDPS",
    "edpsId": "uuid-of-norm-10101",
    "description": "Follow tire change procedure"
  },
  "detectionControl": {
    "type": "DVP",
    "dvpId": "uuid-of-test-7.27",
    "description": "Extraction force test"
  },
  "severity": 7,
  "occurrence": 5,
  "detection": 3
}
```

### Export
- `GET /api/export/dfmea/:id/excel` - Export single DFMEA to Excel
- `GET /api/export/dfmea/:id/pdf` - Export single DFMEA to PDF
- `GET /api/export/dfmea/all/excel` - Export all DFMEA entries to Excel

## Data Storage

Data is stored in JSON files in the `backend/data/` directory:
- `edps.json` - EDPS norms
- `dvp.json` - DVP test procedures
- `dfmea.json` - DFMEA entries

**Note:** This is a minimal implementation. For production, replace with a proper database (PostgreSQL, MongoDB, etc.)

## Response Format

All endpoints return JSON with the following structure:

**Success:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "error": "Error message"
}
```

## CORS

CORS is enabled for all origins in this minimal backend. Configure appropriately for production.

## Next Steps for Production

1. Replace JSON storage with a database (PostgreSQL recommended)
2. Add authentication and authorization
3. Implement versioning for norms and tests
4. Add approval workflows
5. Implement proper logging
6. Add rate limiting and security headers
7. Set up proper error tracking (Sentry, etc.)
8. Add API documentation (Swagger/OpenAPI)
9. Implement file upload for images
10. Add search and filtering capabilities

