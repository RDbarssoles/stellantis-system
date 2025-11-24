import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { dvpStorage } from '../models/storage.js';

export const dvpRouter = express.Router();

/**
 * GET /api/dvp
 * List all DVP&R test procedures
 */
dvpRouter.get('/', async (req, res, next) => {
  try {
    const procedures = await dvpStorage.getAll();
    res.json({ success: true, data: procedures, count: procedures.length });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/dvp/:id
 * Get a specific DVP test procedure by ID
 */
dvpRouter.get('/:id', async (req, res, next) => {
  try {
    const procedure = await dvpStorage.getById(req.params.id);
    if (!procedure) {
      return res.status(404).json({ success: false, error: 'Procedure not found' });
    }
    res.json({ success: true, data: procedure });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/dvp
 * Create a new DVP test procedure
 * Body: { procedureId, procedureType, performanceObjective, testName, acceptanceCriteria, responsible, parameterRange }
 */
dvpRouter.post('/', async (req, res, next) => {
  try {
    const { 
      procedureId, 
      procedureType, 
      performanceObjective, 
      testName, 
      acceptanceCriteria, 
      responsible, 
      parameterRange 
    } = req.body;

    // Basic validation
    if (!procedureId || !testName) {
      return res.status(400).json({ 
        success: false, 
        error: 'procedureId and testName are required' 
      });
    }

    const procedure = {
      id: uuidv4(),
      procedureId,
      procedureType: procedureType || 'FUNCIONAL',
      performanceObjective: performanceObjective || '',
      testName,
      acceptanceCriteria: acceptanceCriteria || '',
      responsible: responsible || '',
      parameterRange: parameterRange || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'active'
    };

    await dvpStorage.create(procedure);
    res.status(201).json({ success: true, data: procedure });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/dvp/:id
 * Update an existing DVP test procedure
 */
dvpRouter.put('/:id', async (req, res, next) => {
  try {
    const { 
      procedureId, 
      procedureType, 
      performanceObjective, 
      testName, 
      acceptanceCriteria, 
      responsible, 
      parameterRange,
      status 
    } = req.body;
    
    const updates = {};
    if (procedureId !== undefined) updates.procedureId = procedureId;
    if (procedureType !== undefined) updates.procedureType = procedureType;
    if (performanceObjective !== undefined) updates.performanceObjective = performanceObjective;
    if (testName !== undefined) updates.testName = testName;
    if (acceptanceCriteria !== undefined) updates.acceptanceCriteria = acceptanceCriteria;
    if (responsible !== undefined) updates.responsible = responsible;
    if (parameterRange !== undefined) updates.parameterRange = parameterRange;
    if (status !== undefined) updates.status = status;

    const updatedProcedure = await dvpStorage.update(req.params.id, updates);
    
    if (!updatedProcedure) {
      return res.status(404).json({ success: false, error: 'Procedure not found' });
    }

    res.json({ success: true, data: updatedProcedure });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/dvp/:id
 * Delete a DVP test procedure
 */
dvpRouter.delete('/:id', async (req, res, next) => {
  try {
    const deleted = await dvpStorage.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Procedure not found' });
    }
    res.json({ success: true, message: 'Procedure deleted successfully' });
  } catch (error) {
    next(error);
  }
});

