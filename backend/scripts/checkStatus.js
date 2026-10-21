const fs = require('fs');
const path = require('path');

const CONFIGSTORE = path.join(process.env.USERPROFILE || process.env.HOME, '.config', 'configstore', 'firebase-tools.json');

function getToken() {
  const config = JSON.parse(fs.readFileSync(CONFIGSTORE, 'utf8'));
  return config.tokens.access_token;
}

async function main() {
  const projectId = 'care-for-the-needy-patients';
  const token = getToken();

  console.log(`=== Status Check for ${projectId} ===\n`);

  // Check enabled services
  console.log('1. Enabled services:');
  const svcResponse = await fetch(
    `https://serviceusage.googleapis.com/v1/projects/${projectId}/services?filter=state:ENABLED`,
    { headers: { 'Authorization': `Bearer ${token}` } }
  );
  const svcData = await svcResponse.json();
  if (svcData.services) {
    svcData.services.forEach(s => console.log(`   - ${s.name.split('/').pop()}`));
  }

  // Check billing
  console.log('\n2. Billing status:');
  const billingResponse = await fetch(
    `https://cloudbilling.googleapis.com/v1/projects/${projectId}/billingInfo`,
    { headers: { 'Authorization': `Bearer ${token}` } }
  );
  const billingInfo = await billingResponse.json();
  if (billingInfo.billingAccountName) {
    console.log(`   ENABLED: ${billingInfo.billingAccountName}`);
  } else {
    console.log('   NOT ENABLED - Firestore needs billing');
  }

  // Check Firestore databases
  console.log('\n3. Firestore databases:');
  const dbResponse = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases`,
    { headers: { 'Authorization': `Bearer ${token}` } }
  );
  const dbData = await dbResponse.json();
  if (dbData.databases && dbData.databases.length > 0) {
    dbData.databases.forEach(db => console.log(`   - ${db.name} (${db.locationId})`));
  } else if (dbData.error) {
    console.log(`   Error: ${dbData.error.message}`);
  } else {
    console.log('   No databases found');
  }
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
