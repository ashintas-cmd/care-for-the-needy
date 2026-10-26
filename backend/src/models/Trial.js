const { getDb } = require('../utils/firebase');
const { parseCondition } = require('../utils/condition');

const COLLECTION_NAME = 'trials';

// The registry carries thousands of distinct condition strings, which makes an
// unfiltered list useless for filter chips and dropdowns. The API returns the
// most common ones, ranked by how many trials mention them.
const MAX_CONDITIONS = 100;

// How long an aggregated stats result stays valid for a warm function instance.
const STATS_TTL_MS = 10 * 60 * 1000;
let statsCache = { data: null, expiresAt: 0 };

class Trial {
  constructor(data) {
    this.id = data.id || null;
    this.ctriNumber = data.ctriNumber || '';
    this.title = data.title || '';
    this.scientificTitle = data.scientificTitle || '';
    this.phase = data.phase || '';
    this.condition = data.condition || '';
    this.intervention = data.intervention || '';
    this.sponsor = data.sponsor || '';
    this.sponsorType = data.sponsorType || '';
    this.recruitmentStatus = data.recruitmentStatus || '';
    this.enrollmentTarget = data.enrollmentTarget || 0;
    this.enrolled = data.enrolled || 0;
    this.startDate = data.startDate || '';
    this.completionDate = data.completionDate || '';
    this.studyType = data.studyType || '';
    this.studyDesign = data.studyDesign || '';
    this.allocation = data.allocation || '';
    this.masking = data.masking || '';
    this.principalInvestigator = data.principalInvestigator || '';
    this.piAffiliation = data.piAffiliation || '';
    this.sites = data.sites || [];
    this.eligibility = data.eligibility || {};
    this.outcomes = data.outcomes || [];
    this.briefSummary = data.briefSummary || '';
    this.locations = data.locations || [];
    this.state = data.state || '';
    this.district = data.district || '';
    this.contactPerson = data.contactPerson || '';
    this.contactEmail = data.contactEmail || '';
    this.contactPhone = data.contactPhone || '';
    this.ethicsCommittee = data.ethicsCommittee || '';
    this.dcgIApproval = data.dcgIApproval || '';
    this.lastUpdated = data.lastUpdated || '';
    this.sourceUrl = data.sourceUrl || '';
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  static async findAll(filters = {}, options = {}) {
    const db = getDb();
    let query = db.collection(COLLECTION_NAME);

    // Apply filters
    if (filters.recruitmentStatus) {
      query = query.where('recruitmentStatus', '==', filters.recruitmentStatus);
    }
    if (filters.condition) {
      query = query.where('condition', '==', filters.condition);
    }
    if (filters.state) {
      query = query.where('state', '==', filters.state);
    }
    if (filters.phase) {
      query = query.where('phase', '==', filters.phase);
    }

    // Pagination
    const limit = parseInt(options.limit) || 20;
    const offset = parseInt(options.offset) || 0;

    query = query.limit(limit);
    if (offset > 0) {
      const offsetDoc = await db.collection(COLLECTION_NAME)
        .limit(offset)
        .get();
      const lastDoc = offsetDoc.docs[offsetDoc.docs.length - 1];
      if (lastDoc) {
        query = query.startAfter(lastDoc);
      }
    }

    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  static async findById(id) {
    const db = getDb();
    const doc = await db.collection(COLLECTION_NAME).doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  }

  static async search(searchTerm, filters = {}, options = {}) {
    const db = getDb();
    let query = db.collection(COLLECTION_NAME);

    // Apply filters first
    if (filters.recruitmentStatus) {
      query = query.where('recruitmentStatus', '==', filters.recruitmentStatus);
    }
    if (filters.state) {
      query = query.where('state', '==', filters.state);
    }
    if (filters.phase) {
      query = query.where('phase', '==', filters.phase);
    }

    const limit = parseInt(options.limit) || 20;
    query = query.limit(limit);

    const snapshot = await query.get();
    let results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Client-side search for text fields
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      results = results.filter(t =>
        t.title?.toLowerCase().includes(lowerTerm) ||
        t.condition?.toLowerCase().includes(lowerTerm) ||
        t.intervention?.toLowerCase().includes(lowerTerm) ||
        t.sponsor?.toLowerCase().includes(lowerTerm) ||
        t.scientificTitle?.toLowerCase().includes(lowerTerm)
      );
    }

    return results;
  }

  static async create(data) {
    const db = getDb();
    const trial = new Trial(data);
    const docRef = await db.collection(COLLECTION_NAME).add(trial.toJSON());
    return { id: docRef.id, ...trial.toJSON() };
  }

  static async update(id, data) {
    const db = getDb();
    const updateData = { ...data, updatedAt: new Date().toISOString() };
    await db.collection(COLLECTION_NAME).doc(id).update(updateData);
    return { id, ...updateData };
  }

  static async delete(id) {
    const db = getDb();
    await db.collection(COLLECTION_NAME).doc(id).delete();
    return { id, deleted: true };
  }

  static async bulkCreate(trials) {
    const db = getDb();
    const batch = db.batch();
    const results = [];

    for (const trialData of trials) {
      const trial = new Trial(trialData);
      const docRef = db.collection(COLLECTION_NAME).doc();
      batch.set(docRef, trial.toJSON());
      results.push({ id: docRef.id, ...trial.toJSON() });
    }

    await batch.commit();
    return results;
  }

  static async count(filters = {}) {
    const db = getDb();
    let query = db.collection(COLLECTION_NAME);

    if (filters.recruitmentStatus) {
      query = query.where('recruitmentStatus', '==', filters.recruitmentStatus);
    }

    const snapshot = await query.count().get();
    return snapshot.data().count;
  }

  static async getStats() {
    // The home page calls this on every visit, and the collection is scanned to
    // aggregate conditions, so cache the result per function instance.
    if (statsCache.data && Date.now() < statsCache.expiresAt) {
      return statsCache.data;
    }

    const db = getDb();

    // One field-scoped read instead of three round trips (two count queries
    // plus a full document fetch).
    const snapshot = await db
      .collection(COLLECTION_NAME)
      .select('condition', 'state', 'phase', 'recruitmentStatus')
      .get();

    let total = 0;
    let recruiting = 0;
    const conditionCounts = new Map();
    const states = new Set();
    const phases = new Set();

    snapshot.docs.forEach(doc => {
      const data = doc.data();
      total++;
      if (data.recruitmentStatus === 'Recruiting') recruiting++;

      // Normalise on read as well as on write: rows that predate the parser fix
      // would otherwise keep leaking "Health Condition 2:" fragments.
      const condition = parseCondition(data.condition);
      if (condition) {
        conditionCounts.set(condition, (conditionCounts.get(condition) || 0) + 1);
      }

      if (data.state) states.add(String(data.state).trim());
      if (data.phase) phases.add(String(data.phase).trim());
    });

    const conditions = Array.from(conditionCounts.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, MAX_CONDITIONS)
      .map(([condition]) => condition);

    const stats = {
      total,
      recruiting,
      conditions,
      states: Array.from(states).sort((a, b) => a.localeCompare(b)),
      phases: Array.from(phases).sort((a, b) => a.localeCompare(b))
    };

    statsCache = { data: stats, expiresAt: Date.now() + STATS_TTL_MS };
    return stats;
  }

  toJSON() {
    return {
      ctriNumber: this.ctriNumber,
      title: this.title,
      scientificTitle: this.scientificTitle,
      phase: this.phase,
      condition: this.condition,
      intervention: this.intervention,
      sponsor: this.sponsor,
      sponsorType: this.sponsorType,
      recruitmentStatus: this.recruitmentStatus,
      enrollmentTarget: this.enrollmentTarget,
      enrolled: this.enrolled,
      startDate: this.startDate,
      completionDate: this.completionDate,
      studyType: this.studyType,
      studyDesign: this.studyDesign,
      allocation: this.allocation,
      masking: this.masking,
      principalInvestigator: this.principalInvestigator,
      piAffiliation: this.piAffiliation,
      sites: this.sites,
      eligibility: this.eligibility,
      outcomes: this.outcomes,
      briefSummary: this.briefSummary,
      locations: this.locations,
      state: this.state,
      district: this.district,
      contactPerson: this.contactPerson,
      contactEmail: this.contactEmail,
      contactPhone: this.contactPhone,
      ethicsCommittee: this.ethicsCommittee,
      dcgIApproval: this.dcgIApproval,
      lastUpdated: this.lastUpdated,
      sourceUrl: this.sourceUrl,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = Trial;
