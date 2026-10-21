const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');

const projectId = 'care-for-the-needy-patients';
const serviceAccountEmail = 'firebase-adminsdk-fbsvc@care-for-the-needy-patients.iam.gserviceaccount.com';
const compromisedKeyId = 'a31050a1f8e3282d0c38d4211ecefb7299bbce52';
const outputPath = path.resolve(__dirname, '..', 'firebase-service-account.json');
const configPath = path.join(process.env.USERPROFILE || process.env.HOME, '.config', 'configstore', 'firebase-tools.json');

function readCliToken() {
  const cliConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  if (!cliConfig.tokens?.access_token || cliConfig.tokens.expires_at < Date.now() + 60_000) {
    throw new Error('Firebase CLI token is expired; refresh it with `npx firebase projects:list` and rerun.');
  }
  return cliConfig.tokens.access_token;
}

async function iamRequest(token, method, url, body) {
  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    ...(body ? { body: JSON.stringify(body) } : {})
  });
  const text = await response.text();
  let data;
  try { data = text ? JSON.parse(text) : {}; } catch { data = {}; }
  if (!response.ok) {
    throw new Error(`IAM request failed (${response.status}): ${data.error?.message || 'permission or API error'}`);
  }
  return data;
}

async function verifyFirestore(serviceAccount) {
  const app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId
  }, `rotation-check-${Date.now()}`);
  try {
    const db = getFirestore(app, '(default)');
    await db.collection('trials').limit(1).get();
  } finally {
    await app.delete();
  }
}

async function main() {
  const token = readCliToken();
  const baseUrl = `https://iam.googleapis.com/v1/projects/-/serviceAccounts/${encodeURIComponent(serviceAccountEmail)}/keys`;

  // Create and store the replacement key locally. Never log its response/body.
  const created = await iamRequest(token, 'POST', baseUrl, {
    privateKeyType: 'TYPE_GOOGLE_CREDENTIALS_FILE',
    keyAlgorithm: 'KEY_ALG_RSA_2048'
  });
  if (!created.privateKeyData) throw new Error('Google did not return a service-account key file.');

  const keyJson = Buffer.from(created.privateKeyData, 'base64').toString('utf8');
  const serviceAccount = JSON.parse(keyJson);
  if (serviceAccount.project_id !== projectId || serviceAccount.client_email !== serviceAccountEmail) {
    throw new Error('Generated service-account key does not match the configured project.');
  }
  fs.writeFileSync(outputPath, `${JSON.stringify(serviceAccount, null, 2)}\n`, { flag: 'wx', mode: 0o600 });

  // Confirm the new credential can access the Native-mode Firestore database before revocation.
  try {
    await verifyFirestore(serviceAccount);
  } catch (error) {
    fs.rmSync(outputPath, { force: true });
    throw new Error(`Replacement key could not access Firestore; old key left untouched. ${error.message}`);
  }

  // Revoke the disclosed key only after the new key has passed the database check.
  const oldKeyUrl = `${baseUrl}/${encodeURIComponent(compromisedKeyId)}`;
  await iamRequest(token, 'DELETE', oldKeyUrl);

  console.log('Key rotation succeeded. Replacement stored locally and tested against Firestore; disclosed key revoked.');
}

main().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
