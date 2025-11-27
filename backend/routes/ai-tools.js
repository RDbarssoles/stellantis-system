import express from 'express';
import axios from 'axios';
import { SAI_CONFIG } from '../config/sai.config.js';

export const aiToolsRouter = express.Router();

/**
 * POST /api/ai-tools/edps
 * Generate EDPS norm using SAI Library AI tool
 * Body: { norma: "description of the norm to create" }
 */
aiToolsRouter.post('/edps', async (req, res, next) => {
  try {
    const { norma } = req.body;

    if (!norma) {
      return res.status(400).json({ 
        success: false, 
        error: 'norma parameter is required' 
      });
    }

    if (!SAI_CONFIG.apiKey) {
      return res.status(500).json({ 
        success: false, 
        error: 'SAI API key not configured. Please set SAI_API_KEY environment variable.' 
      });
    }

    const response = await axios({
      method: 'post',
      url: `${SAI_CONFIG.baseUrl}/${SAI_CONFIG.templates.edps}/execute`,
      headers: {
        'X-Api-Key': SAI_CONFIG.apiKey
      },
      data: {
        inputs: {
          norma: norma
        }
      }
    });

    // Log the actual response structure for debugging
    console.log('SAI EDPS Response Structure:', JSON.stringify(response.data, null, 2));

    res.json({ 
      success: true, 
      data: response.data,
      message: 'EDPS norm generated successfully using AI'
    });
  } catch (error) {
    console.error('SAI Library EDPS Error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ 
      success: false, 
      error: error.response?.data?.message || error.message,
      details: error.response?.data
    });
  }
});

/**
 * POST /api/ai-tools/dfmea
 * Generate DFMEA using SAI Library AI tool
 * Body: { norma: "description of the failure mode to analyze" }
 */
aiToolsRouter.post('/dfmea', async (req, res, next) => {
  try {
    const { norma } = req.body;

    if (!norma) {
      return res.status(400).json({ 
        success: false, 
        error: 'norma parameter is required' 
      });
    }

    if (!SAI_CONFIG.apiKey) {
      return res.status(500).json({ 
        success: false, 
        error: 'SAI API key not configured. Please set SAI_API_KEY environment variable.' 
      });
    }

    const response = await axios({
      method: 'post',
      url: `${SAI_CONFIG.baseUrl}/${SAI_CONFIG.templates.dfmea}/execute`,
      headers: {
        'X-Api-Key': SAI_CONFIG.apiKey
      },
      data: {
        inputs: {
          DFMEA: norma  // DFMEA template expects 'DFMEA' parameter (uppercase)
        }
      }
    });

    // Log the actual response structure for debugging
    console.log('SAI DFMEA Response Structure:', JSON.stringify(response.data, null, 2));

    res.json({ 
      success: true, 
      data: response.data,
      message: 'DFMEA generated successfully using AI'
    });
  } catch (error) {
    console.error('SAI Library DFMEA Error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ 
      success: false, 
      error: error.response?.data?.message || error.message,
      details: error.response?.data
    });
  }
});

/**
 * POST /api/ai-tools/dvp
 * Generate DVP test procedure using SAI Library AI tool
 * Body: { norma: "description of the test to create" }
 */
aiToolsRouter.post('/dvp', async (req, res, next) => {
  try {
    const { norma } = req.body;

    if (!norma) {
      return res.status(400).json({ 
        success: false, 
        error: 'norma parameter is required' 
      });
    }

    if (!SAI_CONFIG.apiKey) {
      return res.status(500).json({ 
        success: false, 
        error: 'SAI API key not configured. Please set SAI_API_KEY environment variable.' 
      });
    }

    const response = await axios({
      method: 'post',
      url: `${SAI_CONFIG.baseUrl}/${SAI_CONFIG.templates.dvp}/execute`,
      headers: {
        'X-Api-Key': SAI_CONFIG.apiKey
      },
      data: {
        inputs: {
          teste: norma  // DVP template expects 'teste' parameter
        }
      }
    });

    // Log the actual response structure for debugging
    console.log('SAI DVP Response Structure:', JSON.stringify(response.data, null, 2));

    res.json({ 
      success: true, 
      data: response.data,
      message: 'DVP test procedure generated successfully using AI'
    });
  } catch (error) {
    console.error('SAI Library DVP Error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ 
      success: false, 
      error: error.response?.data?.message || error.message,
      details: error.response?.data
    });
  }
});

/**
 * GET /api/ai-tools/status
 * Check if SAI Library integration is configured
 */
aiToolsRouter.get('/status', (req, res) => {
  res.json({
    success: true,
    configured: !!SAI_CONFIG.apiKey,
    templates: {
      edps: SAI_CONFIG.templates.edps,
      dfmea: SAI_CONFIG.templates.dfmea,
      dvp: SAI_CONFIG.templates.dvp
    }
  });
});

