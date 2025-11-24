# PD-SmartDoc - Engineering Document Management System

A modern, conversational AI-powered system for managing engineering documentation including EDPS (Engineering Design Practices), DVP&R (Design Validation Plan & Results), and DFMEA (Design Failure Mode and Effects Analysis).

## 🎯 Project Overview

PD-SmartDoc provides a wizard-style conversational interface that guides users through the creation and management of engineering documents, with full traceability between norms, test procedures, and failure analysis.

### Key Features

- **📋 EDPS Management** - Create and manage engineering norms and standards
- **🔬 DVP&R Management** - Define test procedures with acceptance criteria
- **⚠️ DFMEA Management** - Analyze failure modes and link prevention/detection controls
- **🔗 Document Linking** - Connect norms as prevention controls and tests as detection controls
- **📊 Export Functionality** - Export DFMEA entries to Excel and PDF formats
- **💬 Conversational UI** - Chat-based wizard flows for intuitive document creation

## 🏗️ Architecture

```
PD-SmartDoc/
├── backend/           # Node.js + Express API
│   ├── models/        # Data models and storage
│   ├── routes/        # API endpoints (EDPS, DVP, DFMEA, Export)
│   └── data/          # JSON file storage
│
└── frontend/          # React + TypeScript + Vite
    ├── src/
    │   ├── components/  # Reusable UI components
    │   ├── pages/       # Page components (flows)
    │   └── services/    # API client
    └── public/
```

## 📋 Prerequisites

- **Node.js** 18+ and npm
- **Modern web browser** (Chrome, Firefox, Edge, Safari)
- **Windows/Mac/Linux** operating system

## 🚀 Installation & Setup

### 1. Clone or Navigate to the Project

```bash
cd C:\Users\e_rfdbarssoles\Documents\PoCs\Stellantis
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

## ▶️ Running the Application

### Option 1: Run Backend and Frontend Separately

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```
Backend will run on: `http://localhost:3001`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend will run on: `http://localhost:3000`

### Option 2: Using PowerShell (Windows)

```powershell
# Terminal 1 - Backend
cd backend; npm start

# Terminal 2 - Frontend  
cd frontend; npm run dev
```

## 🎨 How to Use

### 1. Home Page

Open `http://localhost:3000` in your browser. You'll see three modules:

- **EDPS** - Engineering Design Practices
- **DVP&R** - Design Validation Plan & Results
- **DFMEA** - Design Failure Mode and Effects Analysis

### 2. Creating an EDPS Norm

1. Click on the **EDPS** card
2. Choose **"Create new norm"**
3. Follow the conversational wizard:
   - Provide a title (e.g., "Tire Change Procedure")
   - Add detailed description with step-by-step instructions
   - Define the target/objective
   - Optionally add images
   - Confirm and save
4. Optionally link to DFMEA

**Example:**
- **Norm Number:** 10101
- **Title:** Tire Change Procedure
- **Description:** Step-by-step safe tire changing process...
- **Target:** Change the tire safely

### 3. Creating a DVP Test Procedure

1. Click on the **DVP&R** card
2. Choose **"Create new test"**
3. Follow the wizard:
   - Select procedure type (FUNCIONAL, ESTRUTURAL, AMBIENTAL, DURABILIDADE)
   - Define performance objective
   - Name the test (e.g., "Tire Extraction Load Test")
   - Set acceptance criteria (e.g., "Force between 50N - 100N")
   - Assign responsible person
   - Define parameter range
   - Save the test

**Example:**
- **Procedure ID:** 7.27
- **Type:** FUNCIONAL
- **Test Name:** Tire Extraction Load Test
- **Acceptance Criteria:** Force between 50N - 100N

### 4. Creating a DFMEA Entry

1. Click on the **DFMEA** card
2. Choose **"Create new DFMEA"**
3. Follow the wizard:
   - Describe generic failure (e.g., "Tire System")
   - Define failure mode (e.g., "Difficult tire change")
   - Specify cause (e.g., "Damaged screw thread")
   - Link prevention control (select an EDPS norm)
   - Link detection control (select a DVP test)
   - Rate Severity, Occurrence, Detection (1-10 scale)
   - System calculates RPN (Risk Priority Number)
   - Save and optionally export

**Example:**
- **Generic Failure:** Tire System
- **Failure Mode:** Difficult tire change
- **Cause:** Damaged screw thread
- **Prevention:** EDPS Norm 10101 (Tire Change Procedure)
- **Detection:** DVP Test 7.27 (Extraction Load Test)
- **RPN:** 105 (Severity: 7, Occurrence: 5, Detection: 3)

### 5. Exporting Documents

After creating a DFMEA entry:
- Choose **"Export as Excel"** for spreadsheet format
- Choose **"Export as PDF"** for printable report
- Files download automatically to your Downloads folder

## 📡 API Endpoints

### EDPS Endpoints
```
GET    /api/edps           - List all norms
GET    /api/edps/:id       - Get specific norm
POST   /api/edps           - Create new norm
PUT    /api/edps/:id       - Update norm
DELETE /api/edps/:id       - Delete norm
```

### DVP Endpoints
```
GET    /api/dvp            - List all tests
GET    /api/dvp/:id        - Get specific test
POST   /api/dvp            - Create new test
PUT    /api/dvp/:id        - Update test
DELETE /api/dvp/:id        - Delete test
```

### DFMEA Endpoints
```
GET    /api/dfmea          - List all DFMEA entries
GET    /api/dfmea/:id      - Get specific entry (with populated links)
POST   /api/dfmea          - Create new entry
PUT    /api/dfmea/:id      - Update entry
DELETE /api/dfmea/:id      - Delete entry
```

### Export Endpoints
```
GET    /api/export/dfmea/:id/excel      - Export single DFMEA to Excel
GET    /api/export/dfmea/:id/pdf        - Export single DFMEA to PDF
GET    /api/export/dfmea/all/excel      - Export all DFMEAs to Excel
```

## 🛠️ Technology Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **ExcelJS** - Excel file generation
- **PDFKit** - PDF document generation
- **UUID** - Unique ID generation
- **JSON files** - Simple data storage

### Frontend
- **React 18** - UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **Axios** - HTTP client
- **CSS3** - Modern styling with variables

## 📁 Data Storage

Data is stored in JSON files located in `backend/data/`:

- `edps.json` - EDPS norms
- `dvp.json` - DVP test procedures
- `dfmea.json` - DFMEA entries

**Note:** This is a minimal implementation. For production, replace with a proper database (PostgreSQL, MongoDB, etc.)

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check if port 3001 is already in use
netstat -ano | findstr :3001

# Kill the process if needed (Windows)
taskkill /PID <process_id> /F

# Or change the port in backend/server.js
```

### Frontend can't connect to backend
1. Ensure backend is running on `http://localhost:3001`
2. Check browser console for CORS errors
3. Verify `VITE_API_URL` in frontend (defaults to localhost:3001)

### Duplicate messages in chat
✅ **Fixed!** The issue was React's StrictMode causing `useEffect` to run twice. We now use `useRef` to prevent duplicates.

### Port already in use
```bash
# Windows - kill process on port 3000 or 3001
netstat -ano | findstr :<PORT>
taskkill /PID <process_id> /F

# Or change ports:
# Backend: Edit backend/server.js PORT variable
# Frontend: Edit frontend/vite.config.ts server.port
```

## 🎯 Workflow Example

**Complete Traceability Flow:**

1. **Create EDPS Norm 10101** - "Tire Change Procedure"
   - Defines step-by-step safe tire changing process
   - Status: Active

2. **Create DVP Test 7.27** - "Tire Extraction Load Test"
   - Validates extraction force is between 50N-100N
   - References: Norm LP.7N001
   - Status: Active

3. **Create DFMEA Entry** - "Difficult Tire Change"
   - Generic Failure: Tire System
   - Failure Mode: Difficult tire change
   - Cause: Damaged screw thread
   - **Prevention Control:** Links to → EDPS Norm 10101
   - **Detection Control:** Links to → DVP Test 7.27
   - Risk Ratings: S=7, O=5, D=3
   - **RPN:** 105 (High priority for action)

4. **Export DFMEA** - Generate Excel/PDF report
   - Shows complete traceability
   - Includes all linked norms and tests
   - Ready for audits and reviews

## 📊 Business Value

### Alignment with Stefanini's 7 Management Pillars

- **Excellence in Execution** - Standardizes procedures, improves quality delivery
- **Services Portfolio** - Demonstrates AI-powered vertical specialization (automotive)
- **Customer Satisfaction** - Reduces documentation friction, meets compliance needs
- **Governance & Methods** - Implements standardized processes and KPIs
- **AI Across All Pillars** - Conversational assistant leverages NLP capabilities

### Key Benefits

✅ **Compliance Ready** - Supports ISO 26262, IATF 16949 traceability requirements  
✅ **Knowledge Management** - Codifies tribal knowledge into searchable norms  
✅ **Efficiency** - Wizard-based creation faster than manual spreadsheets  
✅ **Traceability** - Complete linkage between requirements, validation, and risks  
✅ **Collaboration** - Centralized system accessible to all team members  

## 🚀 Next Steps for Production

### Phase 1 - Foundation
- [ ] Replace JSON storage with PostgreSQL/MongoDB
- [ ] Add user authentication (JWT/OAuth)
- [ ] Implement role-based access control (RBAC)
- [ ] Add comprehensive error handling and logging

### Phase 2 - Features
- [ ] Version control for norms and tests
- [ ] Approval workflows (Draft → Review → Approved)
- [ ] Real-time notifications (WebSocket)
- [ ] File upload for images and attachments
- [ ] Advanced search and filtering

### Phase 3 - Enhancement
- [ ] Change impact analysis
- [ ] Bulk import/export
- [ ] Analytics dashboard
- [ ] Integration with PLM/ALM systems
- [ ] Mobile app support

### Phase 4 - AI Enhancement
- [ ] AI-powered suggestion engine
- [ ] Automatic norm generation from descriptions
- [ ] Risk prediction based on historical data
- [ ] Natural language search
- [ ] Automated report generation

## 📝 License

This is a prototype for Stefanini's automotive engineering division.

## 👥 Contact

For questions, improvements, or production deployment inquiries, contact the Stefanini development team.

---

**Built with ❤️ for Engineering Excellence**

