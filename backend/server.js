import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { edpsRouter } from './routes/edps.js';
import { dvpRouter } from './routes/dvp.js';
import { dfmeaRouter } from './routes/dfmea.js';
import { exportRouter } from './routes/export.js';
import { aiToolsRouter } from './routes/ai-tools.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
// Increase limit for base64 image uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/edps', edpsRouter);
app.use('/api/dvp', dvpRouter);
app.use('/api/dfmea', dfmeaRouter);
app.use('/api/export', exportRouter);
app.use('/api/ai-tools', aiToolsRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'PD-SmartDoc API',
    version: '1.0.0',
    endpoints: {
      edps: '/api/edps',
      dvp: '/api/dvp',
      dfmea: '/api/dfmea',
      export: '/api/export',
      aiTools: '/api/ai-tools'
    }
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 PD-SmartDoc API running on http://localhost:${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/`);
});

