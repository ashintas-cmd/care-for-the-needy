const { getDb, getAuth } = require('../utils/firebase');

const COLLECTION_NAME = 'users';

class User {
  constructor(data) {
    this.id = data.id || null;
    this.email = data.email || '';
    this.displayName = data.displayName || '';
    this.role = data.role || 'user'; // 'user', 'admin', 'moderator'
    this.savedSearches = data.savedSearches || [];
    this.favoriteTrials = data.favoriteTrials || [];
    this.createdAt = data.createdAt || new Date().toISOString();
    this.lastLogin = data.lastLogin || null;
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
      .limit(1)
      .get();
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  }

  static async create(data) {
    const db = getDb();
    const user = new User(data);
    const docRef = await db.collection(COLLECTION_NAME).add(user.toJSON());
    return { id: docRef.id, ...user.toJSON() };
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

  static async saveSearch(userId, searchData) {
    const db = getDb();
    const userRef = db.collection(COLLECTION_NAME).doc(userId);
    const userDoc = await userRef.get();

    if (userDoc.exists) {
      const userData = userDoc.data();
      const savedSearches = userData.savedSearches || [];
      savedSearches.unshift({
        ...searchData,
        savedAt: new Date().toISOString()
      });
      // Keep only last 10 searches
      if (savedSearches.length > 10) savedSearches.pop();
      await userRef.update({ savedSearches });
    }
  }

  static async toggleFavorite(userId, trialId) {
    const db = getDb();
    const userRef = db.collection(COLLECTION_NAME).doc(userId);
    const userDoc = await userRef.get();

    if (userDoc.exists) {
      const userData = userDoc.data();
      const favorites = userData.favoriteTrials || [];
      const index = favorites.indexOf(trialId);

      if (index > -1) {
        favorites.splice(index, 1);
      } else {
        favorites.push(trialId);
      }

      await userRef.update({ favoriteTrials: favorites });
      return { favorite: index === -1, favoriteTrials: favorites };
    }
    return null;
  }

  static async getAll(options = {}) {
    const db = getDb();
    let query = db.collection(COLLECTION_NAME);

    const limit = parseInt(options.limit) || 50;
    query = query.limit(limit);

    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  toJSON() {
    return {
      email: this.email,
      displayName: this.displayName,
      role: this.role,
      savedSearches: this.savedSearches,
      favoriteTrials: this.favoriteTrials,
      createdAt: this.createdAt,
      lastLogin: this.lastLogin
    };
  }
}

module.exports = User;
