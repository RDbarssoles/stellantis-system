import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { dfmeaStorage, edpsStorage, dvpStorage } from '../models/storage.js';

export const dfmeaRouter = express.Router();

/**
 * GET /api/dfmea
 * List all DFMEA entries
 */
dfmeaRouter.get('/', async (req, res, next) => {
  try {
    const entries = await dfmeaStorage.getAll();
    res.json({ success: true, data: entries, count: entries.length });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/dfmea/:id
 * Get a specific DFMEA entry by ID
 */
dfmeaRouter.get('/:id', async (req, res, next) => {
  try {
    const entry = await dfmeaStorage.getById(req.params.id);
    if (!entry) {
      return res.status(404).json({ success: false, error: 'DFMEA entry not found' });
    }

    // Populate linked EDPS and DVP data
    if (entry.preventionControl?.edpsId) {
      entry.preventionControl.edpsData = await edpsStorage.getById(entry.preventionControl.edpsId);
    }
    if (entry.detectionControl?.dvpId) {
      entry.detectionControl.dvpData = await dvpStorage.getById(entry.detectionControl.dvpId);
    }

    res.json({ success: true, data: entry });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/dfmea
 * Create a new DFMEA entry
 * Body: { 
 *   genericFailure, 
 *   failureMode, 
 *   cause, 
 *   preventionControl: { type, edpsId, description },
 *   detectionControl: { type, dvpId, description }
 * }
 */
dfmeaRouter.post('/', async (req, res, next) => {
  try {
    const { 
      genericFailure, 
      failureMode, 
      cause,
      carPart,
      preventionControl,
      detectionControl,
      severity,
      occurrence,
      detection
    } = req.body;

    // Basic validation
    if (!genericFailure || !failureMode) {
      return res.status(400).json({ 
        success: false, 
        error: 'genericFailure and failureMode are required' 
      });
    }

    // Validate linked EDPS if provided
    if (preventionControl?.edpsId) {
      const edps = await edpsStorage.getById(preventionControl.edpsId);
      if (!edps) {
        return res.status(400).json({ 
          success: false, 
          error: `EDPS norm with ID ${preventionControl.edpsId} not found` 
        });
      }
    }

    // Validate linked DVP if provided
    if (detectionControl?.dvpId) {
      const dvp = await dvpStorage.getById(detectionControl.dvpId);
      if (!dvp) {
        return res.status(400).json({ 
          success: false, 
          error: `DVP procedure with ID ${detectionControl.dvpId} not found` 
        });
      }
    }

    const entry = {
      id: uuidv4(),
      genericFailure,
      failureMode,
      cause: cause || '',
      carPart: carPart || '',
      preventionControl: preventionControl || null,
      detectionControl: detectionControl || null,
      severity: severity || null,
      occurrence: occurrence || null,
      detection: detection || null,
      rpn: (severity || 0) * (occurrence || 0) * (detection || 0),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'active'
    };

    await dfmeaStorage.create(entry);
    res.status(201).json({ success: true, data: entry });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/dfmea/:id
 * Update an existing DFMEA entry
 */
dfmeaRouter.put('/:id', async (req, res, next) => {
  try {
    const { 
      genericFailure, 
      failureMode, 
      cause,
      carPart,
      preventionControl,
      detectionControl,
      severity,
      occurrence,
      detection,
      status
    } = req.body;
    
    const updates = {};
    if (genericFailure !== undefined) updates.genericFailure = genericFailure;
    if (failureMode !== undefined) updates.failureMode = failureMode;
    if (cause !== undefined) updates.cause = cause;
    if (carPart !== undefined) updates.carPart = carPart;
    if (preventionControl !== undefined) updates.preventionControl = preventionControl;
    if (detectionControl !== undefined) updates.detectionControl = detectionControl;
    if (severity !== undefined) updates.severity = severity;
    if (occurrence !== undefined) updates.occurrence = occurrence;
    if (detection !== undefined) updates.detection = detection;
    if (status !== undefined) updates.status = status;

    // Recalculate RPN if any of the components changed
    if (severity !== undefined || occurrence !== undefined || detection !== undefined) {
      const existingEntry = await dfmeaStorage.getById(req.params.id);
      const s = severity !== undefined ? severity : existingEntry.severity;
      const o = occurrence !== undefined ? occurrence : existingEntry.occurrence;
      const d = detection !== undefined ? detection : existingEntry.detection;
      updates.rpn = (s || 0) * (o || 0) * (d || 0);
    }

    const updatedEntry = await dfmeaStorage.update(req.params.id, updates);
    
    if (!updatedEntry) {
      return res.status(404).json({ success: false, error: 'DFMEA entry not found' });
    }

    res.json({ success: true, data: updatedEntry });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/dfmea/:id
 * Delete a DFMEA entry
 */
dfmeaRouter.delete('/:id', async (req, res, next) => {
  try {
    const deleted = await dfmeaStorage.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'DFMEA entry not found' });
    }
    res.json({ success: true, message: 'DFMEA entry deleted successfully' });
  } catch (error) {
    next(error);
  }
});

