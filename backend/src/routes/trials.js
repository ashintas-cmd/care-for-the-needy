const express = require('express');
const router = express.Router();
const { body, query, validationResult } = require('express-validator');
const Trial = require('../models/Trial');
const { authenticate } = require('../middleware/auth');
const { logger } = require('../utils/logger');

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// GET /api/trials - Search trials
router.get('/', [
  query('q').optional().trim().escape(),
  query('condition').optional().trim().escape(),
  query('state').optional().trim().escape(),
  query('phase').optional().trim().escape(),
  query('status').optional().trim().escape(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('offset').optional().isInt({ min: 0 }).toInt(),
  validate
], async (req, res) => {
  try {
    const { q, condition, state, phase, status, limit, offset } = req.query;

    const filters = {};
    if (condition) filters.condition = condition;
    if (state) filters.state = state;
    if (phase) filters.phase = phase;
    if (status) filters.recruitmentStatus = status;

    const options = { limit, offset };

    let trials;
    if (q) {
      trials = await Trial.search(q, filters, options);
    } else {
      trials = await Trial.findAll(filters, options);
    }

    const total = await Trial.count(filters);

    res.json({
      success: true,
      data: trials,
      pagination: {
        total,
        limit: parseInt(limit) || 20,
        offset: parseInt(offset) || 0,
        hasMore: (parseInt(offset) || 0) + trials.length < total
      }
    });
  } catch (error) {
    logger.error('Search trials error:', error);
    res.status(500).json({ error: 'Failed to search trials' });
  }
});

// GET /api/trials/recruiting - Get recruiting trials
router.get('/recruiting', async (req, res) => {
  try {
    const { limit, offset } = req.query;
    const trials = await Trial.findAll(
      { recruitmentStatus: 'Recruiting' },
      { limit, offset }
    );

    res.json({
      success: true,
      data: trials
    });
  } catch (error) {
    logger.error('Get recruiting trials error:', error);
    res.status(500).json({ error: 'Failed to get recruiting trials' });
  }
});

// GET /api/trials/stats - Get trial statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await Trial.getStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to get statistics' });
  }
});

// GET /api/trials/:id - Get trial by ID
router.get('/:id', async (req, res) => {
  try {
    const trial = await Trial.findById(req.params.id);
    if (!trial) {
      return res.status(404).json({ error: 'Trial not found' });
    }

    res.json({
      success: true,
      data: trial
    });
  } catch (error) {
    logger.error('Get trial error:', error);
    res.status(500).json({ error: 'Failed to get trial' });
  }
});

// POST /api/trials - Create trial (admin only)
router.post('/', [
  authenticate,
  require('../middleware/auth').authorize('admin'),
  body('ctriNumber').notEmpty().trim(),
  body('title').notEmpty().trim(),
  body('condition').notEmpty().trim(),
  validate
], async (req, res) => {
  try {
    const trial = await Trial.create(req.body);
    res.status(201).json({
      success: true,
      data: trial
    });
  } catch (error) {
    logger.error('Create trial error:', error);
    res.status(500).json({ error: 'Failed to create trial' });
  }
});

// PUT /api/trials/:id - Update trial (admin only)
router.put('/:id', [
  authenticate,
  require('../middleware/auth').authorize('admin'),
  validate
], async (req, res) => {
  try {
    const trial = await Trial.update(req.params.id, req.body);
    res.json({
      success: true,
      data: trial
    });
  } catch (error) {
    logger.error('Update trial error:', error);
    res.status(500).json({ error: 'Failed to update trial' });
  }
});

// DELETE /api/trials/:id - Delete trial (admin only)
router.delete('/:id', [authenticate, require('../middleware/auth').authorize('admin')], async (req, res) => {
  try {
    const result = await Trial.delete(req.params.id);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Delete trial error:', error);
    res.status(500).json({ error: 'Failed to delete trial' });
  }
});

module.exports = router;
