import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { edpsStorage } from '../models/storage.js';

export const edpsRouter = express.Router();

/**
 * GET /api/edps
 * List all EDPS norms
 */
edpsRouter.get('/', async (req, res, next) => {
  try {
    const norms = await edpsStorage.getAll();
    res.json({ success: true, data: norms, count: norms.length });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/edps/:id
 * Get a specific EDPS norm by ID
 */
edpsRouter.get('/:id', async (req, res, next) => {
  try {
    const norm = await edpsStorage.getById(req.params.id);
    if (!norm) {
      return res.status(404).json({ success: false, error: 'Norm not found' });
    }
    res.json({ success: true, data: norm });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/edps
 * Create a new EDPS norm
 * Body: { normNumber, title, description, target, carPart, images }
 */
edpsRouter.post('/', async (req, res, next) => {
  try {
    const { normNumber, title, description, target, carPart, images } = req.body;

    // Basic validation
    if (!normNumber || !title) {
      return res.status(400).json({ 
        success: false, 
        error: 'normNumber and title are required' 
      });
    }

    const norm = {
      id: uuidv4(),
      normNumber,
      title,
      description: description || '',
      target: target || '',
      carPart: carPart || '',
      images: images || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'active'
    };

    await edpsStorage.create(norm);
    res.status(201).json({ success: true, data: norm });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/edps/:id
 * Update an existing EDPS norm
 */
edpsRouter.put('/:id', async (req, res, next) => {
  try {
    const { normNumber, title, description, target, carPart, images, status } = req.body;
    
    const updates = {};
    if (normNumber !== undefined) updates.normNumber = normNumber;
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (target !== undefined) updates.target = target;
    if (carPart !== undefined) updates.carPart = carPart;
    if (images !== undefined) updates.images = images;
    if (status !== undefined) updates.status = status;

    const updatedNorm = await edpsStorage.update(req.params.id, updates);
    
    if (!updatedNorm) {
      return res.status(404).json({ success: false, error: 'Norm not found' });
    }

    res.json({ success: true, data: updatedNorm });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/edps/:id
 * Delete an EDPS norm
 */
edpsRouter.delete('/:id', async (req, res, next) => {
  try {
    const deleted = await edpsStorage.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Norm not found' });
    }
    res.json({ success: true, message: 'Norm deleted successfully' });
  } catch (error) {
    next(error);
  }
});

