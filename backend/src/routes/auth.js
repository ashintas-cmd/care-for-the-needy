const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { getAuth, getDb } = require('../utils/firebase');
const { logger } = require('../utils/logger');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// POST /api/auth/verify - Verify Firebase token and create/update user
router.post('/verify', [
  body('idToken').notEmpty().trim(),
  validate
], async (req, res) => {
  try {
    const { idToken } = req.body;

    // Verify the Firebase ID token
    const decodedToken = await getAuth().verifyIdToken(idToken);

    const userData = {
      email: decodedToken.email,
      displayName: decodedToken.name || decodedToken.email.split('@')[0],
      photoURL: decodedToken.picture || '',
      lastLogin: new Date().toISOString()
    };

    // Check if user exists
    const db = getDb();
    const userSnapshot = await db.collection('users')
      .where('email', '==', userData.email)
      .limit(1)
      .get();

    let user;
    if (userSnapshot.empty) {
      // Create new user
      const userRef = await db.collection('users').add({
        ...userData,
        role: 'user',
        createdAt: new Date().toISOString()
      });
      user = { id: userRef.id, ...userData };
    } else {
      // Update existing user
      const userDoc = userSnapshot.docs[0];
      await db.collection('users').doc(userDoc.id).update(userData);
      user = { id: userDoc.id, ...userDoc.data(), ...userData };
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    logger.error('Auth verify error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
});

// GET /api/auth/me - Get current user profile
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await getAuth().verifyIdToken(token);

    const db = getDb();
    const userSnapshot = await db.collection('users')
      .where('email', '==', decodedToken.email)
      .limit(1)
      .get();

    if (userSnapshot.empty) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userDoc = userSnapshot.docs[0];
    res.json({
      success: true,
      data: { id: userDoc.id, ...userDoc.data() }
    });
  } catch (error) {
    logger.error('Get profile error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
});

module.exports = router;
