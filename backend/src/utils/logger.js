const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'care-for-the-needy-backend' },
  // Cloud Functions filesystems are ephemeral/read-only; emit logs to the
  // platform collector instead of writing credentials or logs to local disk.
  transports: [new winston.transports.Console()]
});

module.exports = { logger };
