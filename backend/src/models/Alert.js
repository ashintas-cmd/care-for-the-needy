const { getDb } = require('../utils/firebase');

const COLLECTION_NAME = 'alerts';

class Alert {
  constructor(data) {
    this.id = data.id || null;
    this.email = data.email || '';
    this.searchCriteria = data.searchCriteria || {};
    this.consent = data.consent || {};
    this.status = data.status || 'active';
    this.verified = data.verified || false;
    this.verificationToken = data.verificationToken || '';
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
    this.unsubscribedAt = data.unsubscribedAt || null;
    this.verifiedAt = data.verifiedAt || null;
  }

  static async create(data) {
    const db = getDb();
    const alert = new Alert(data);

    // Generate verification token
    const verificationToken = require('crypto').randomBytes(32).toString('hex');

    const docRef = await db.collection(COLLECTION_NAME).add({
      ...alert.toJSON(),
      verificationToken
    });

    return { id: docRef.id, ...alert.toJSON(), verificationToken };
  }

  static async findById(id) {
    const db = getDb();
    const doc = await db.collection(COLLECTION_NAME).doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  }

  static async findByEmail(email) {
    const db = getDb();
    const snapshot = await db.collection(COLLECTION_NAME)
      .where('email', '==', email)
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  static async update(id, data) {
    const db = getDb();
    const updateData = { ...data, updatedAt: new Date().toISOString() };
    await db.collection(COLLECTION_NAME).doc(id).update(updateData);
    return { id, ...updateData };
  }

  static async unsubscribe(id) {
    const db = getDb();
    await db.collection(COLLECTION_NAME).doc(id).update({
      status: 'unsubscribed',
      unsubscribedAt: new Date().toISOString()
    });
    return { id, status: 'unsubscribed' };
  }

  static async verify(token) {
    const db = getDb();
    const snapshot = await db.collection(COLLECTION_NAME)
      .where('verificationToken', '==', token)
      .get();

    if (snapshot.empty) return null;

    const alertDoc = snapshot.docs[0];
    await db.collection(COLLECTION_NAME).doc(alertDoc.id).update({
      verified: true,
      verifiedAt: new Date().toISOString()
    });

    return { id: alertDoc.id, verified: true };
  }

  toJSON() {
    return {
      email: this.email,
      searchCriteria: this.searchCriteria,
      consent: this.consent,
      status: this.status,
      verified: this.verified,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      unsubscribedAt: this.unsubscribedAt,
      verifiedAt: this.verifiedAt
    };
  }
}

module.exports = Alert;
