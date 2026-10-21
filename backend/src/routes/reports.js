const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { getDb } = require('../utils/firebase');
const { authenticate, authorize } = require('../middleware/auth');
const { logger } = require('../utils/logger');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// POST /api/reports - Report a listing issue
router.post('/', [
  body('trialId').notEmpty().trim(),
  body('reason').isIn(['outdated_status', 'incorrect_contact', 'suspected_fraud', 'other']),
  body('comments').optional().trim(),
  body('contactEmail').optional().isEmail(),
  validate
], async (req, res) => {
  try {
    const { trialId, reason, comments, contactEmail } = req.body;
    const db = getDb();

    // Verify trial exists
    const trialDoc = await db.collection('trials').doc(trialId).get();
    if (!trialDoc.exists) {
      return res.status(404).json({ error: 'Trial not found' });
    }

    // Create report
    const reportRef = await db.collection('reports').add({
      trialId,
      trialNumber: trialDoc.data().ctriNumber,
      reason,
      comments,
      reporterEmail: contactEmail || null,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // Generate reference number
    const referenceNumber = `RPT-${Date.now().toString(36).toUpperCase()}`;

    await db.collection('reports').doc(reportRef.id).update({
      referenceNumber
    });

    res.status(201).json({
      success: true,
      message: 'Report submitted successfully',
      data: {
        id: reportRef.id,
        referenceNumber
      }
    });
  } catch (error) {
    logger.error('Create report error:', error);
    res.status(500).json({ error: 'Failed to submit report' });
  }
});

// GET /api/reports - Get all reports (admin only)
router.get('/', [authenticate, authorize('admin')], async (req, res) => {
  try {
    const db = getDb();
    const { status, limit = 50, offset = 0 } = req.query;

    let query = db.collection('reports').orderBy('createdAt', 'desc');

    if (status) {
      query = query.where('status', '==', status);
    }

    query = query.limit(parseInt(limit)).offset(parseInt(offset));

    const snapshot = await query.get();
    const reports = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    res.json({
      success: true,
      data: reports
    });
  } catch (error) {
    logger.error('Get reports error:', error);
    res.status(500).json({ error: 'Failed to get reports' });
  }
});

// PUT /api/reports/:id - Update report status (admin only)
router.put('/:id', [authenticate, authorize('admin')], async (req, res) => {
  try {
    const { status, resolution } = req.body;
    const db = getDb();

    const reportRef = db.collection('reports').doc(req.params.id);
    const reportDoc = await reportRef.get();

    if (!reportDoc.exists) {
      return res.status(404).json({ error: 'Report not found' });
    }

    await reportRef.update({
      status,
      resolution,
      updatedAt: new Date().toISOString(),
      resolvedAt: status === 'resolved' ? new Date().toISOString() : null
    });

    res.json({
      success: true,
      message: 'Report updated successfully'
    });
  } catch (error) {
    logger.error('Update report error:', error);
    res.status(500).json({ error: 'Failed to update report' });
  }
});

module.exports = router;
