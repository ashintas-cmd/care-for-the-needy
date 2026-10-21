const cron = require('node-cron');
const dataSyncService = require('../services/dataSync');
const { logger } = require('../utils/logger');

const scheduleSync = () => {
  const schedule = process.env.SYNC_CRON_SCHEDULE || '0 2 * * *';

  cron.schedule(schedule, async () => {
    logger.info('Starting scheduled CTRI sync...');
    try {
      const results = await dataSyncService.syncTrials({ fullSync: false });
      logger.info('Scheduled sync completed:', results);
    } catch (error) {
      logger.error('Scheduled sync failed:', error);
    }
  });

  logger.info(`CTRI sync scheduled: ${schedule}`);
};

module.exports = { scheduleSync };
