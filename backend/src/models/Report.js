const { getDb } = require('../utils/firebase');

const COLLECTION_NAME = 'reports';

class Report {
  constructor(data) {
    this.id = data.id || null;
    this.trialId = data.trialId || '';
    this.trialNumber = data.trialNumber || '';
    this.reason = data.reason || '';
    this.comments = data.comments || '';
    this.reporterEmail = data.reporterEmail || '';
    this.status = data.status || 'pending';
    this.referenceNumber = data.referenceNumber || '';
    this.resolution = data.resolution || '';
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
    this.resolvedAt = data.resolvedAt || null;
  }

  static async create(data) {
    const db = getDb();
    const report = new Report(data);
    const docRef = await db.collection(COLLECTION_NAME).add(report.toJSON());
    return { id: docRef.id, ...report.toJSON() };
  }

  static async findById(id) {
    const db = getDb();
    const doc = await db.collection(COLLECTION_NAME).doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  }

  static async findAll(filters = {}, options = {}) {
    const db = getDb();
    let query = db.collection(COLLECTION_NAME).orderBy('createdAt', 'desc');

    if (filters.status) {
      query = query.where('status', '==', filters.status);
    }
    if (filters.reason) {
      query = query.where('reason', '==', filters.reason);
    }

    const limit = parseInt(options.limit) || 50;
    const offset = parseInt(options.offset) || 0;

    query = query.limit(limit);
    if (offset > 0) {
      const offsetDoc = await db.collection(COLLECTION_NAME).limit(offset).get();
      const lastDoc = offsetDoc.docs[offsetDoc.docs.length - 1];
      if (lastDoc) {
        query = query.startAfter(lastDoc);
      }
    }

    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  static async update(id, data) {
    const db = getDb();
    const updateData = { ...data, updatedAt: new Date().toISOString() };
    await db.collection(COLLECTION_NAME).doc(id).update(updateData);
    return { id, ...updateData };
  }

  static async getStats() {
    const db = getDb();
    const total = await db.collection(COLLECTION_NAME).count().get();
    const pending = await db.collection(COLLECTION_NAME)
      .where('status', '==', 'pending')
      .count()
      .get();
    const resolved = await db.collection(COLLECTION_NAME)
      .where('status', '==', 'resolved')
      .count()
      .get();

    return {
      total: total.data().count,
      pending: pending.data().count,
      resolved: resolved.data().count
    };
  }

  toJSON() {
    return {
      trialId: this.trialId,
      trialNumber: this.trialNumber,
      reason: this.reason,
      comments: this.comments,
      reporterEmail: this.reporterEmail,
      status: this.status,
      referenceNumber: this.referenceNumber,
      resolution: this.resolution,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      resolvedAt: this.resolvedAt
    };
  }
}

module.exports = Report;
