const { JWT } = require('google-auth-library');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

/**
 * Script to enable Cloud Firestore API and create the database
 * This runs once to set up the project
 */

const SCOPES = ['https://www.googleapis.com/auth/cloud-platform'];

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

async function enableService(serviceName) {
  const token = await getAccessToken();
  const projectId = process.env.FIREBASE_PROJECT_ID;

  const url = `https://serviceusage.googleapis.com/v1/projects/${projectId}/services/${serviceName}:enable`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`Failed to enable ${serviceName}: ${response.status} ${text}`);
  }

  return text;
}

async function createFirestoreDatabase() {
  const token = await getAccessToken();
  const projectId = process.env.FIREBASE_PROJECT_ID;

  // Create Firestore database in native mode (default location: nam5)
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases?databaseId=${projectId}`;

  const body = {
    locationId: 'nam5',
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
  if (!response.ok) {
    // 409 = already exists, which is fine
    if (response.status === 409) {
      return { message: 'Firestore database already exists' };
    }
    throw new Error(`Failed to create Firestore database: ${response.status} ${text}`);
  }

  return JSON.parse(text);
}

async function main() {
  console.log('=== Enabling Cloud Firestore ===\n');

  try {
    // Step 1: Enable Firestore API
    console.log('1. Enabling firestore.googleapis.com API...');
    try {
      const result = await enableService('firestore.googleapis.com');
      console.log('   Firestore API enabled successfully');
    } catch (error) {
      if (error.message.includes('already enabled') || error.message.includes('409')) {
        console.log('   Firestore API already enabled');
      } else {
        throw error;
      }
    }

    // Step 2: Wait for propagation
    console.log('2. Waiting for API propagation (30 seconds)...');
    await new Promise(resolve => setTimeout(resolve, 30000));

    // Step 3: Create Firestore database
    console.log('3. Creating Firestore database...');
    const dbResult = await createFirestoreDatabase();
    console.log('   Firestore database ready:', dbResult.name || dbResult.message);

    console.log('\n=== Setup Complete ===');
    console.log('You can now restart the backend server.');
    process.exit(0);
  } catch (error) {
    console.error('Setup failed:', error.message);
    process.exit(1);
  }
}

main();
