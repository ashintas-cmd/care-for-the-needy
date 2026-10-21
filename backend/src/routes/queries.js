const express = require('express');
const router = express.Router();
const { body, param, validationResult } = require('express-validator');
const { getDb } = require('../utils/firebase');
const { authenticate, authorize } = require('../middleware/auth');
const { logger } = require('../utils/logger');

const COLLECTION_NAME = 'patientQueries';
const ALLOWED_STATUSES = ['pending', 'contacted', 'closed'];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// POST /api/queries - Submit a patient query (public)
router.post('/', [
  body('patientName').trim().notEmpty().isLength({ max: 100 }),
  body('contactNumber').trim().notEmpty().isLength({ min: 10, max: 15 }),
  body('email').optional({ checkFalsy: true }).isEmail().normalizeEmail(),
  body('whatsappNumber').optional({ checkFalsy: true }).trim().isLength({ min: 10, max: 15 }),
  body('queryDetails').trim().notEmpty().isLength({ max: 2000 }),
  validate
], async (req, res) => {
  try {
    const db = getDb();
    const queryRef = await db.collection(COLLECTION_NAME).add({
      patientName: req.body.patientName,
      contactNumber: req.body.contactNumber,
      email: req.body.email || null,
      whatsappNumber: req.body.whatsappNumber || null,
      queryDetails: req.body.queryDetails,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    res.status(201).json({
      success: true,
      message: 'Query submitted successfully',
      data: { id: queryRef.id }
    });
  } catch (error) {
    logger.error('Patient query submission error:', error);
    res.status(500).json({ error: 'Failed to submit query' });
  }
});

// GET /api/queries/stats - Counts by status (admin only)
router.get('/stats', [authenticate, authorize('admin')], async (req, res) => {
  try {
    const col = getDb().collection(COLLECTION_NAME);

    const [total, pending, contacted, closed] = await Promise.all([
      col.count().get(),
      col.where('status', '==', 'pending').count().get(),
      col.where('status', '==', 'contacted').count().get(),
      col.where('status', '==', 'closed').count().get()
    ]);

    res.json({
      success: true,
      data: {
        total: total.data().count,
        pending: pending.data().count,
        contacted: contacted.data().count,
        closed: closed.data().count
      }
    });
  } catch (error) {
    logger.error('Query stats error:', error);
    res.status(500).json({ error: 'Failed to load query statistics' });
  }
});

// GET /api/queries - List patient queries (admin only)
router.get('/', [authenticate, authorize('admin')], async (req, res) => {
  try {
    const db = getDb();
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 1000, 1), 2000);
    const status = (req.query.status || '').trim();
    const search = (req.query.q || '').trim().toLowerCase();

    const snapshot = await db.collection(COLLECTION_NAME).limit(limit).get();

    let queries = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    if (status && status !== 'all') {
      queries = queries.filter(item => (item.status || 'pending') === status);
    }

    if (search) {
      queries = queries.filter(item =>
        [
          item.patientName,
          item.contactNumber,
          item.email,
          item.whatsappNumber,
          item.queryDetails
        ].some(value => String(value || '').toLowerCase().includes(search))
      );
    }

    // Newest first. createdAt is stored as an ISO date string.
    queries.sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));

    res.json({
      success: true,
      data: queries,
      meta: {
        returned: queries.length,
        limit
      }
    });
  } catch (error) {
    logger.error('List patient queries error:', error);
    res.status(500).json({ error: 'Failed to load queries' });
  }
});

// PATCH /api/queries/:id - Update the status of a query (admin only)
router.patch('/:id', [
  authenticate,
  authorize('admin'),
  param('id').isString().trim().notEmpty(),
  body('status').isIn(ALLOWED_STATUSES),
  validate
], async (req, res) => {
  try {
    const ref = getDb().collection(COLLECTION_NAME).doc(req.params.id);
    const doc = await ref.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Query not found' });
    }

    const updatedAt = new Date().toISOString();
    await ref.update({ status: req.body.status, updatedAt });

    res.json({
      success: true,
      data: { id: ref.id, ...doc.data(), status: req.body.status, updatedAt }
    });
  } catch (error) {
    logger.error('Update patient query error:', error);
    res.status(500).json({ error: 'Failed to update query' });
  }
});

module.exports = router;
