const { onRequest } = require('firebase-functions/v2/https');
const app = require('./src/server');

exports.api = onRequest({
  region: 'asia-south1',
  memory: '512MiB',
  timeoutSeconds: 60,
  maxInstances: 10,
  serviceAccount: 'firebase-adminsdk-fbsvc@care-for-the-needy-patients.iam.gserviceaccount.com'
}, app);
