# PD-SmartDoc Frontend

Modern React frontend for PD-SmartDoc - Engineering Document Management System with conversational UI.

## Features

- **Conversational Interface** - Chat-based wizard flows for document creation
- **Three Main Modules:**
  - **EDPS** - Create engineering norms and standards
  - **DVP&R** - Define test procedures and validation criteria  
  - **DFMEA** - Analyze failure modes and link controls
- **Document Linking** - Connect norms and tests to DFMEA entries
- **Export Functionality** - Download DFMEA reports in Excel and PDF
- **Modern UX** - Beautiful, responsive design with smooth animations

## Technology Stack

- **React 18** with TypeScript
- **Vite** - Fast build tool and dev server
- **Axios** - HTTP client for API calls
- **CSS3** - Custom styling with CSS variables

## Prerequisites

- Node.js 18+ and npm
- Backend API running on `http://localhost:3001`

## Installation

```bash
cd frontend
npm install
```

## Running the Application

### Development Mode

```bash
npm run dev
```

The app will start on `http://localhost:3000`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
frontend/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable components
│   │   └── ChatInterface.tsx  # Conversational chat component
│   ├── pages/          # Page components
│   │   ├── Home.tsx          # Home page with module selection
│   │   ├── EDPSFlow.tsx      # EDPS creation flow
│   │   ├── DVPFlow.tsx       # DVP creation flow
│   │   └── DFMEAFlow.tsx     # DFMEA creation flow
│   ├── services/       # API services
│   │   └── api.ts            # Backend API client
│   ├── App.tsx         # Main app component
│   ├── main.tsx        # App entry point
│   └── index.css       # Global styles
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Environment Variables

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:3001/api
```

## Usage

### Creating an EDPS Norm

1. Click on **EDPS** module from home
2. Choose "Create new norm"
3. Follow the conversational wizard:
   - Provide a title
   - Add detailed description
   - Set target/objective
   - Optionally add images
   - Save the norm
   - Optionally link to DFMEA

### Creating a DVP Test

1. Click on **DVP&R** module from home
2. Choose "Create new test"
3. Follow the wizard:
   - Select procedure type
   - Define performance objective
   - Name the test
   - Set acceptance criteria
   - Assign responsible person
   - Define parameter range
   - Save the test

### Creating a DFMEA Entry

1. Click on **DFMEA** module from home
2. Choose "Create new DFMEA"
3. Follow the wizard:
   - Describe generic failure
   - Define failure mode
   - Specify cause
   - Link prevention control (EDPS norm)
   - Link detection control (DVP test)
   - Rate Severity, Occurrence, Detection
   - Save and export

## API Integration

The frontend connects to the backend API via Axios. All API calls are centralized in `src/services/api.ts`:

- `edpsAPI` - EDPS operations
- `dvpAPI` - DVP operations
- `dfmeaAPI` - DFMEA operations
- `exportAPI` - Export operations

## Design Features

### Conversational UX
- Chat-style interface mimicking a virtual assistant
- Quick reply buttons for common actions
- Step-by-step wizard flows
- Real-time typing indicators

### Modern UI
- Clean, professional design
- Responsive layout (mobile-friendly)
- Smooth animations and transitions
- Color-coded modules
- Accessible interface

### Document Traceability
- Visual linking between documents
- Clear relationship display
- Export with complete linkage information

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Troubleshooting

### Backend Connection Issues

If the frontend can't connect to the backend:

1. Ensure backend is running on port 3001
2. Check CORS settings in backend
3. Verify `VITE_API_URL` in `.env` file

### Build Errors

If you encounter TypeScript errors:

```bash
npm run build --verbose
```

Check `tsconfig.json` settings and ensure all dependencies are installed.

## Next Steps for Production

1. Add authentication (JWT/OAuth)
2. Implement real-time notifications (WebSocket)
3. Add file upload for images
4. Implement advanced search and filtering
5. Add user preferences and settings
6. Implement approval workflows UI
7. Add version control visualization
8. Enhance error handling and retry logic
9. Add offline support (PWA)
10. Implement analytics and usage tracking

## Contributing

This is a prototype for Stefanini's PD-SmartDoc project. For questions or improvements, contact the development team.




