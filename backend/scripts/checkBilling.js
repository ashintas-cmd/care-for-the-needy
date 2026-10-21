const { JWT } = require('google-auth-library');
const dotenv = require('dotenv');

dotenv.config();

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

async function checkBillingStatus() {
  const token = await getAccessToken();
  const projectId = process.env.FIREBASE_PROJECT_ID;

  const response = await fetch(
    `https://cloudbilling.googleapis.com/v1/projects/${projectId}/billingInfo`,
    { headers: { 'Authorization': `Bearer ${token}` } }
  );

  const data = await response.json();
  return data;
}

async function listBillingAccounts() {
  const token = await getAccessToken();

  const response = await fetch(
    'https://cloudbilling.googleapis.com/v1/billingAccounts',
    { headers: { 'Authorization': `Bearer ${token}` } }
  );

  const data = await response.json();
  return data;
}

async function linkBillingAccount(billingAccountName) {
  const token = await getAccessToken();
  const projectId = process.env.FIREBASE_PROJECT_ID;

  const response = await fetch(
    `https://cloudbilling.googleapis.com/v1/projects/${projectId}/billingInfo`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ billingAccountName })
    }
  );

  const text = await response.text();
  return { status: response.status, body: text };
}

async function main() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  console.log(`=== Billing Check for ${projectId} ===\n`);

  // Check current billing status
  console.log('1. Checking billing status...');
  try {
    const status = await checkBillingStatus();
    console.log('   Current status:', JSON.stringify(status, null, 2));
  } catch (error) {
    console.log('   Could not check status:', error.message);
  }

  // List available billing accounts
  console.log('\n2. Listing available billing accounts...');
  try {
    const accounts = await listBillingAccounts();
    if (accounts.billingAccounts && accounts.billingAccounts.length > 0) {
      console.log('   Found billing accounts:');
      accounts.billingAccounts.forEach(acc => {
        console.log(`   - ${acc.name} (${acc.displayName}) - ${acc.open ? 'OPEN' : 'CLOSED'}`);
      });

      // Try to link the first open account
      const openAccount = accounts.billingAccounts.find(a => a.open);
      if (openAccount) {
        console.log(`\n3. Linking project to ${openAccount.displayName}...`);
        const result = await linkBillingAccount(openAccount.name);
        console.log('   Link result:', result.status, result.body);
      }
    } else {
      console.log('   No billing accounts found for this account.');
    }
  } catch (error) {
    console.log('   Could not list accounts:', error.message);
  }

  console.log('\n=== Done ===');
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
