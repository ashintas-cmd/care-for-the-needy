const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { getDb } = require('../utils/firebase');
const { logger } = require('../utils/logger');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// POST /api/alerts - Create alert subscription
router.post('/', [
  body('email').isEmail().normalizeEmail(),
  body('searchCriteria').isObject(),
  body('consent').isBoolean(),
  validate
], async (req, res) => {
  try {
    const { email, searchCriteria, consent } = req.body;

    if (!consent) {
      return res.status(400).json({ error: 'Consent is required' });
    }

    const db = getDb();

    // Check for existing alert
    const existingSnapshot = await db.collection('alerts')
      .where('email', '==', email)
      .where('searchCriteria', '==', searchCriteria)
      .get();

    if (!existingSnapshot.empty) {
      return res.status(409).json({ error: 'Alert already exists for this search' });
    }

    const alertRef = await db.collection('alerts').add({
      email,
      searchCriteria,
      consent: {
        granted: true,
        timestamp: new Date().toISOString(),
        version: '1.0'
      },
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    res.status(201).json({
      success: true,
      message: 'Alert created successfully',
      data: { id: alertRef.id }
    });
  } catch (error) {
    logger.error('Create alert error:', error);
    res.status(500).json({ error: 'Failed to create alert' });
  }
});

// DELETE /api/alerts/:id - Unsubscribe from alerts
router.delete('/:id', async (req, res) => {
  try {
    const db = getDb();
    const alertRef = db.collection('alerts').doc(req.params.id);
    const alertDoc = await alertRef.get();

    if (!alertDoc.exists) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    await alertRef.update({
      status: 'unsubscribed',
      unsubscribedAt: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'Successfully unsubscribed'
    });
  } catch (error) {
    logger.error('Delete alert error:', error);
    res.status(500).json({ error: 'Failed to unsubscribe' });
  }
});

// GET /api/alerts/verify/:token - Verify alert subscription
router.get('/verify/:token', async (req, res) => {
  try {
    const db = getDb();
    const snapshot = await db.collection('alerts')
      .where('verificationToken', '==', req.params.token)
      .get();

    if (snapshot.empty) {
      return res.status(404).json({ error: 'Invalid verification token' });
    }

    const alertDoc = snapshot.docs[0];
    await db.collection('alerts').doc(alertDoc.id).update({
      verified: true,
      verifiedAt: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error) {
    logger.error('Verify alert error:', error);
    res.status(500).json({ error: 'Failed to verify' });
  }
});

module.exports = router;
