const { getDb } = require('../utils/firebase');
const { logger } = require('../utils/logger');
const ctriScraper = require('./ctriScraper');
const geocodingService = require('./geocoding');

class DataSyncService {
  constructor() {
    this.db = null;
  }

  async init() {
    this.db = getDb();
  }

  async syncTrials(options = {}) {
    const { batchSize = 50, fullSync = false } = options;
    const results = {
      total: 0,
      created: 0,
      updated: 0,
      failed: 0,
      errors: []
    };

    try {
      await this.init();
      logger.info('Starting CTRI data sync...');

      // Get recruiting trials from CTRI
      const ctriResults = await ctriScraper.getRecruitingTrials(batchSize, 0);

      for (const trial of ctriResults.trials) {
        try {
          // Check if trial already exists
          const existingQuery = await this.db.collection('trials')
            .where('ctriNumber', '==', trial.ctriNumber)
            .limit(1)
            .get();

          if (!existingQuery.empty && !fullSync) {
            // Update existing trial
            const existingDoc = existingQuery.docs[0];
            await this.db.collection('trials').doc(existingDoc.id).update({
              ...trial,
              updatedAt: new Date().toISOString(),
              lastChecked: new Date().toISOString()
            });
            results.updated++;
          } else {
            // Create new trial
            await this.db.collection('trials').add({
              ...trial,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              lastChecked: new Date().toISOString(),
              source: 'CTRI',
              sourceUrl: trial.sourceUrl
            });
            results.created++;
          }

          results.total++;
        } catch (error) {
          logger.error(`Failed to sync trial ${trial.ctriNumber}:`, error.message);
          results.failed++;
          results.errors.push({
            ctriNumber: trial.ctriNumber,
            error: error.message
          });
        }

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, parseInt(process.env.REQUEST_DELAY_MS) || 2000));
      }

      // Log sync results
      await this.db.collection('syncLogs').add({
        timestamp: new Date().toISOString(),
        type: 'ctri_sync',
        results
      });

      logger.info('CTRI data sync completed:', results);
      return results;
    } catch (error) {
      logger.error('Data sync failed:', error);
      throw error;
    }
  }

  async syncTrialDetails(trialId) {
    try {
      await this.init();

      const details = await ctriScraper.getTrialDetails(trialId);

      // Geocode sites if addresses available
      if (details.sites) {
        for (const site of details.sites) {
          if (site.address) {
            const geoResult = await geocodingService.geocodeAddress(site.address);
            if (geoResult) {
              site.lat = geoResult.lat;
              site.lng = geoResult.lng;
              site.geoConfidence = geoResult.confidence;
            }
          }
        }
      }

      // Update trial with details
      await this.db.collection('trials').doc(trialId).update({
        ...details,
        detailsLastUpdated: new Date().toISOString()
      });

      return details;
    } catch (error) {
      logger.error(`Failed to sync trial details for ${trialId}:`, error);
      throw error;
    }
  }

  async getSyncStatus() {
    try {
      await this.init();

      const lastSync = await this.db.collection('syncLogs')
        .orderBy('timestamp', 'desc')
        .limit(1)
        .get();

      const totalTrials = await this.db.collection('trials').count().get();
      const recruitingTrials = await this.db.collection('trials')
        .where('recruitmentStatus', '==', 'Recruiting')
        .count()
        .get();

      return {
        lastSync: lastSync.empty ? null : lastSync.docs[0].data(),
        totalTrials: totalTrials.data().count,
        recruitingTrials: recruitingTrials.data().count
      };
    } catch (error) {
      logger.error('Failed to get sync status:', error);
      throw error;
    }
  }
}

module.exports = new DataSyncService();
