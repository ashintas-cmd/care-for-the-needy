const fs = require('fs');
const path = require('path');

/**
 * Complete project setup script
 * Uses the Firebase CLI's stored user credentials (which have cloud-platform scope)
 * to enable all required APIs and create the Firestore database.
 */

const CONFIGSTORE = path.join(process.env.USERPROFILE || process.env.HOME, '.config', 'configstore', 'firebase-tools.json');

function getToken() {
  const config = JSON.parse(fs.readFileSync(CONFIGSTORE, 'utf8'));
  if (!config.tokens || !config.tokens.access_token) {
    throw new Error('Firebase CLI not logged in. Run: firebase login');
  }
  return config.tokens.access_token;
}

async function enableService(token, projectId, serviceName) {
  const url = `https://serviceusage.googleapis.com/v1/projects/${projectId}/services/${serviceName}:enable`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  const text = await response.text();
  return { ok: response.ok, status: response.status, body: text };
}

async function waitForOperation(name, token, timeoutMs = 180000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const response = await fetch(`https://serviceusage.googleapis.com/v1/${name}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    if (data.done) {
      return data;
    }
    await new Promise(r => setTimeout(r, 3000));
  }
  throw new Error('Operation timed out');
}

async function createFirestoreDatabase(token, projectId) {
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases?databaseId=${projectId}`;
  const body = {
    locationId: 'asia-south1',
    type: 'FIRESTORE_NATIVE'
  };
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
  const text = await response.text();
  return { ok: response.ok, status: response.status, body: text };
}

async function getFirestoreDatabases(token, projectId) {
  const response = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases`,
    { headers: { 'Authorization': `Bearer ${token}` } }
  );
  return response.json();
}

async function main() {
  const projectId = 'care-for-the-needy-patients';
  console.log(`=== Setting up project: ${projectId} ===\n`);

  let token;
  try {
    token = getToken();
    console.log('Firebase CLI credentials loaded.');
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }

  const services = [
    'firestore.googleapis.com',
    'cloudbilling.googleapis.com',
    'serviceusage.googleapis.com',
    'identitytoolkit.googleapis.com'
  ];

  // Step 1: Enable APIs
  console.log('--- Step 1: Enabling required APIs ---');
  for (const service of services) {
    process.stdout.write(`  Enabling ${service}... `);
    const result = await enableService(token, projectId, service);
    if (result.ok) {
      console.log('OK');
      // Wait for operation to complete
      try {
        const op = JSON.parse(result.body);
        if (op.name) {
          await waitForOperation(op.name, token);
        }
      } catch (e) { /* ignore wait errors */ }
    } else if (result.status === 409) {
      console.log('already enabled');
    } else {
      console.log(`FAILED (${result.status}): ${result.body.substring(0, 200)}`);
    }
    await new Promise(r => setTimeout(r, 2000));
  }

  // Step 2: Check billing status
  console.log('\n--- Step 2: Checking billing status ---');
  const billingResponse = await fetch(
    `https://cloudbilling.googleapis.com/v1/projects/${projectId}/billingInfo`,
    { headers: { 'Authorization': `Bearer ${token}` } }
  );
  const billingInfo = await billingResponse.json();
  console.log('  Billing:', JSON.stringify(billingInfo, null, 2));

  if (billingInfo.billingAccountName) {
    console.log('  Billing is enabled.');
  } else {
    console.log('  WARNING: Billing is not enabled.');
    console.log('  Firestore requires billing to be enabled.');
  }

  // Step 3: Create Firestore database
  console.log('\n--- Step 3: Creating Firestore database ---');
  const existing = await getFirestoreDatabases(token, projectId);
  if (existing.databases && existing.databases.length > 0) {
    console.log('  Firestore database already exists:');
    existing.databases.forEach(db => console.log(`    - ${db.name} (${db.locationId})`));
  } else {
    process.stdout.write('  Creating database... ');
    const result = await createFirestoreDatabase(token, projectId);
    if (result.ok || result.status === 200) {
      console.log('OK');
    } else if (result.status === 409) {
      console.log('already exists');
    } else {
      console.log(`FAILED (${result.status})`);
      console.log('  ', result.body.substring(0, 500));
    }
  }

  console.log('\n=== Setup Complete ===');
}

main().catch(err => {
  console.error('Setup error:', err.message);
  process.exit(1);
});
