const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');
const { logger } = require('./logger');

let db = null;

const initializeFirebase = () => {
  try {
    // Check if already initialized
    if (admin.apps.length > 0) {
      const databaseId = process.env.FIRESTORE_DATABASE_ID || '(default)';
      db = getFirestore(admin.app(), databaseId);
      return;
    }

    // Prefer ADC / GOOGLE_APPLICATION_CREDENTIALS; allow a local JSON file path.
    // Never embed service-account secrets in source code or commit them.
    const credential = process.env.GOOGLE_APPLICATION_CREDENTIALS
      ? admin.credential.applicationDefault()
      : admin.credential.applicationDefault();

    admin.initializeApp({
      credential,
      projectId: process.env.FIREBASE_PROJECT_ID
    });

    // Get the Firestore instance for the configured database
    const databaseId = process.env.FIRESTORE_DATABASE_ID || '(default)';
    db = getFirestore(admin.app(), databaseId);

    // Enable timestamps
    db.settings({ ignoreUndefinedProperties: true });

    logger.info(`Firebase initialized successfully (database: ${databaseId})`);
  } catch (error) {
    logger.error('Firebase initialization error:', error);
    throw error;
  }
};

const getDb = () => {
  if (!db) {
    throw new Error('Firebase not initialized. Call initializeFirebase() first.');
  }
  return db;
};

const getAuth = () => admin.auth();

module.exports = { initializeFirebase, getDb, getAuth, admin };
