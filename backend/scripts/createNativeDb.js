const { JWT } = require('google-auth-library');
const dotenv = require('dotenv');

dotenv.config();

const SCOPES = ['https://www.googleapis.com/auth/cloud-platform'];
const PROJECT_ID = process.env.FIREBASE_PROJECT_ID;

async function getAccessToken() {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
  const client = new JWT({
    email: process.env.FIREBASE_CLIENT_EMAIL,
    key: privateKey,
    scopes: SCOPES
  });
  const token = await client.authorize();
  return token.access_token;
}

async function listDatabases(token) {
  const response = await fetch(
    `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases`,
    { headers: { 'Authorization': `Bearer ${token}` } }
  );
  return response.json();
}

async function createDatabase(token, databaseId, locationId, type) {
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases?databaseId=${encodeURIComponent(databaseId)}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ locationId, type })
  });
  const text = await response.text();
  return { ok: response.ok, status: response.status, body: text };
}

async function main() {
  console.log('=== Firestore Database Setup ===\n');

  let token;
  try {
    token = await getAccessToken();
    console.log('Authenticated with service account.');
  } catch (e) {
    console.error('Auth failed:', e.message);
    process.exit(1);
  }

  console.log('\n1. Existing databases:');
  try {
    const existing = await listDatabases(token);
    if (existing.databases && existing.databases.length > 0) {
      existing.databases.forEach(db => {
        console.log(`   - ${db.name} | location: ${db.locationId} | type: ${db.type} | engine: ${db.engine || 'N/A'}`);
      });
    } else {
      console.log('   (none)');
    }
  } catch (e) {
    console.log('   Could not list:', e.message);
  }

  console.log('\n2. Creating Native mode (default) database...');
  const result = await createDatabase(token, '(default)', 'asia-south1', 'FIRESTORE_NATIVE');
  if (result.ok) {
    console.log('   SUCCESS');
    console.log('   Operation:', result.body.substring(0, 400));
  } else if (result.status === 409) {
    console.log('   Database already exists');
  } else {
    console.log(`   FAILED (${result.status})`);
    console.log('   ', result.body.substring(0, 800));
  }

  console.log('\n=== Done ===');
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
