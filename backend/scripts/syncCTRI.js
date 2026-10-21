const dataSyncService = require('../src/services/dataSync');
const { logger } = require('../src/utils/logger');

const runSync = async () => {
  try {
    const args = process.argv.slice(2);
    const fullSync = args.includes('--full');
    const batchSize = parseInt(args.find(arg => arg.startsWith('--batch='))?.split('=')[1]) || 50;

    logger.info('Starting CTRI sync script...', { fullSync, batchSize });

    const results = await dataSyncService.syncTrials({ fullSync, batchSize });

    logger.info('Sync completed:', results);
    console.log('Sync Results:', JSON.stringify(results, null, 2));

    process.exit(0);
  } catch (error) {
    logger.error('Sync script failed:', error);
    console.error('Sync failed:', error.message);
    process.exit(1);
  }
};

runSync();
