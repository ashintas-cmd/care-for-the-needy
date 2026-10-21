const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const dataSyncService = require('../services/dataSync');
const { logger } = require('../utils/logger');

// POST /api/sync/ctri - Trigger CTRI data sync (admin only)
router.post('/ctri', [authenticate, authorize('admin')], async (req, res) => {
  try {
    const { fullSync = false, batchSize = 50 } = req.body;

    // Start sync in background
    const syncPromise = dataSyncService.syncTrials({ fullSync, batchSize });

    res.json({
      success: true,
      message: 'CTRI data sync started',
      data: { fullSync, batchSize }
    });

    // Continue sync in background
    const results = await syncPromise;
    logger.info('CTRI sync completed:', results);
  } catch (error) {
    logger.error('CTRI sync error:', error);
    res.status(500).json({ error: 'Failed to start sync' });
  }
});

// GET /api/sync/status - Get sync status
router.get('/status', async (req, res) => {
  try {
    const status = await dataSyncService.getSyncStatus();
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    logger.error('Get sync status error:', error);
    res.status(500).json({ error: 'Failed to get sync status' });
  }
});

module.exports = router;
