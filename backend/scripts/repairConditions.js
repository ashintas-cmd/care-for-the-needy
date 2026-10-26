/**
 * Repair the `condition` field of trials already stored in Firestore.
 *
 * The original ICTRP importer only stripped the first "Health Condition 1:"
 * label, so rows were stored with values like:
 *
 *   "- Health Condition 2: - Health Condition 3: C051- Malignant neoplasm of soft palate"
 *
 * This script re-runs the shared parser over every document and writes back the
 * cleaned value. Safe to run repeatedly.
 *
 * Usage (from the `backend` folder):
 *   node scripts/repairConditions.js --dry-run   # preview only
 *   node scripts/repairConditions.js             # apply
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env.backend') });

const { Firestore } = require('@google-cloud/firestore');
const { parseCondition } = require('../src/utils/condition');

const COLLECTION = 'trials';
const BATCH_SIZE = 400;

const dryRun = process.argv.includes('--dry-run');

const projectId = process.env.FIREBASE_PROJECT_ID || 'care-for-the-needy-patients';
const db = new Firestore({ projectId });

const preview = value => {
  const text = String(value);
  return text.length > 90 ? `${text.slice(0, 87)}...` : text;
};

async function main() {
  console.log(`Project: ${projectId}${dryRun ? ' (dry run)' : ''}`);

  const snapshot = await db.collection(COLLECTION).get();
  console.log(`Scanned ${snapshot.size} trial document(s).`);

  const updates = [];
  let alreadyClean = 0;
  let emptied = 0;
  const samples = [];

  snapshot.docs.forEach(doc => {
    const data = doc.data();
    // Re-parse the original export value when we kept one, so repeated runs
    // never compound an earlier (lossy) repair.
    const source = data.conditionRaw || data.condition;
    const current = data.condition || '';
    const repaired = parseCondition(source);

    if (repaired === current) {
      alreadyClean++;
      return;
    }

    if (!repaired) emptied++;
    if (samples.length < 5) samples.push({ before: current, after: repaired });
    updates.push({ ref: doc.ref, condition: repaired, raw: data.conditionRaw || data.condition });
  });

  if (samples.length) {
    console.log('\nExamples:');
    samples.forEach(({ before, after }) => {
      console.log(`  before: ${preview(before)}`);
      console.log(`  after : ${preview(after)}`);
    });
  }

  console.log(
    `\nAlready clean: ${alreadyClean} | To update: ${updates.length} | Emptied: ${emptied}`
  );

  if (dryRun || updates.length === 0) {
    console.log(dryRun ? '\nDry run - nothing written.' : '\nNothing to do.');
    return;
  }

  let written = 0;
  for (let i = 0; i < updates.length; i += BATCH_SIZE) {
    const batch = db.batch();
    const chunk = updates.slice(i, i + BATCH_SIZE);

    chunk.forEach(({ ref, condition, raw }) => {
      const update = { condition, conditionUpdatedAt: new Date().toISOString() };

      // Keep the original export value so the repair stays auditable.
      if (raw && String(raw).trim()) update.conditionRaw = raw;

      batch.update(ref, update);
    });

    await batch.commit();
    written += chunk.length;
    console.log(`  committed ${written}/${updates.length}`);
  }

  console.log(`\nDone. Repaired ${written} document(s).`);
}

if (require.main === module) {
  main().catch(error => {
    console.error('Repair failed:', error.message);
    process.exit(1);
  });
}

module.exports = { main };
