const express = require('express');
const router = express.Router();
const { getDb } = require('../utils/firebase');
const { logger } = require('../utils/logger');

// Site imagery metadata lives in Firestore; the binary files are served by
// Firebase Hosting from the CDN (public/images/**). Keeping the metadata in
// Firestore means a photo can be re-pointed, re-captioned or hidden without
// shipping new code.
const COLLECTION_NAME = 'siteImages';

// GET /api/images - Public list of the images used across the website.
router.get('/', async (req, res) => {
  try {
    const snapshot = await getDb().collection(COLLECTION_NAME).get();

    const images = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(image => image.active !== false && image.src)
      .sort((a, b) => {
        const orderDiff = Number(a.order || 0) - Number(b.order || 0);
        return orderDiff !== 0 ? orderDiff : String(a.id).localeCompare(String(b.id));
      });

    // Metadata changes rarely; let the CDN hold it briefly.
    res.set('Cache-Control', 'public, max-age=300, s-maxage=600');
    res.json({ success: true, data: images });
  } catch (error) {
    logger.error('List site images error:', error);
    res.status(500).json({ error: 'Failed to load site images' });
  }
});

module.exports = router;
