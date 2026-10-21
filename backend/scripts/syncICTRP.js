/**
 * CTRI sync via the WHO ICTRP export (official, no captcha).
 *
 * Why ICTRP: ctri.nic.in requires a CAPTCHA on every search and a login for
 * trial detail pages, so it cannot be scraped unattended. WHO ICTRP mirrors
 * CTRI registrations and publishes them weekly with XML export support.
 *
 * Modes:
 *   node scripts/syncICTRP.js --scan=CTRI/2026/10 --prune
 *   node scripts/syncICTRP.js                      # current + previous month
 *   node scripts/syncICTRP.js --refresh-existing   # re-check trials already in Firestore
 *   node scripts/syncICTRP.js --scan=CTRI/2026/10 --dry-run
 *   node scripts/syncICTRP.js --if-due             # only run when 15 days have passed
 *
 * Rules:
 *   - Only trials with recruitment status "Recruiting" are written.
 *   - With --prune, trials in the scanned CTRI prefix that are no longer in the
 *     recruiting result set are deleted from Firestore.
 *   - With --refresh-existing, every stored trial is re-checked and deleted if
 *     it has moved out of the recruiting phase.
 */
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env.backend') });

const fs = require('fs');
const os = require('os');
const { chromium } = require('playwright');
const { XMLParser } = require('fast-xml-parser');
const { initializeFirebase, getDb } = require('../src/utils/firebase');
const { logger } = require('../src/utils/logger');

const DEFAULT_URL = 'https://trialsearch.who.int/Default.aspx';
const SYNC_INTERVAL_DAYS = 15;
const BATCH_SIZE = 400;
const COLLECTION = 'trials';
const STATE_DOC = { collection: 'syncState', id: 'ctri' };

const args = process.argv.slice(2);
const flags = {
  dryRun: args.includes('--dry-run'),
  prune: args.includes('--prune'),
  refreshExisting: args.includes('--refresh-existing'),
  ifDue: args.includes('--if-due'),
  headed: args.includes('--headed')
};

const getArg = name => {
  const hit = args.find(a => a.startsWith(`--${name}=`));
  return hit ? hit.split('=').slice(1).join('=') : '';
};

const scans = args
  .filter(a => a.startsWith('--scan='))
  .flatMap(a => a.slice('--scan='.length).split(','))
  .map(s => s.trim())
  .filter(Boolean);

const limit = parseInt(getArg('limit')) || 0;
const refreshLimit = parseInt(getArg('refresh-limit')) || 0;

const text = value => (value === null || value === undefined ? '' : String(value));

const decodeEntities = value =>
  text(value)
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ');

const clean = value => decodeEntities(value).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

const parseDate = value => {
  const m = text(value).trim().match(/^(\d{2})-(\d{2})-(\d{4})$/);
  return m ? `${m[3]}-${m[2]}-${m[1]}` : '';
};

const parseRefreshed = value => {
  const since = new Date(text(value).trim());
  return Number.isNaN(since.getTime()) ? '' : since.toISOString();
};

const isRecruiting = value => /^(recruiting|open to recruitment)$/i.test(text(value).trim());

const firstSentence = value => {
  const v = clean(value);
  const cut = v.split(/Method of generating|Method of allocation|Blinding and masking/i)[0];
  return cut.trim();
};

const parseCondition = value =>
  clean(value)
    .replace(/^Health Condition \d+:\s*/i, '')
    .replace(/^[A-Z]\d{2,3}\s*-\s*/i, '')
    .trim();

const parseIntervention = value => {
  const v = clean(value);
  const cut = v.split(/Control Intervention|Intervention\s*2:/i)[0];
  return cut.replace(/^Intervention\s*1:\s*/i, '').trim();
};

const parseOutcome = (value, type) => {
  const v = clean(value);
  if (!v) return null;
  const match = v.match(/Timepoint:\s*(.+)$/i);
  return {
    type,
    name: (match ? v.slice(0, match.index) : v).trim(),
    timeframe: match ? match[1].trim() : ''
  };
};

const joinContactName = raw =>
  [text(raw.Contact_Firstname), text(raw.Contact_Lastname)].map(clean).filter(Boolean).join(' ');

const mapTrial = raw => {
  const eligibility = {
    minAge: clean(raw.Inclusion_agemin),
    maxAge: clean(raw.Inclusion_agemax),
    gender: clean(raw.Inclusion_gender),
    inclusionCriteria: clean(raw.Inclusion_Criteria),
    exclusionCriteria: clean(raw.Exclusion_Criteria)
  };

  const outcomes = [parseOutcome(raw.Primary_outcome, 'Primary'), parseOutcome(raw.Secondary_outcome, 'Secondary')].filter(Boolean);

  const design = clean(raw.Study_design);
  const allocationMatch = design.match(/allocation[^:]*:\s*([^.;]+)/i);
  const maskingMatch = design.match(/(?:masking|blinding)[^:]*:\s*([^.;]+)/i);

  const contactName = joinContactName(raw);
  const address = clean(raw.Contact_Address);

  return {
    ctriNumber: clean(raw.TrialID),
    title: clean(raw.Public_title),
    scientificTitle: clean(raw.Scientific_title),
    phase: clean(raw.Phase),
    condition: parseCondition(raw.Condition),
    intervention: parseIntervention(raw.Intervention),
    sponsor: clean(raw.Primary_sponsor),
    sponsorType: '',
    recruitmentStatus: 'Recruiting',
    enrollmentTarget: parseInt(clean(raw.Target_size), 10) || 0,
    enrolled: 0,
    startDate: parseDate(raw.Date_enrollement),
    completionDate: parseDate(raw.results_date_completed),
    studyType: clean(raw.Study_type),
    studyDesign: firstSentence(raw.Study_design),
    allocation: allocationMatch ? clean(allocationMatch[1]) : '',
    masking: maskingMatch ? clean(maskingMatch[1]) : '',
    principalInvestigator: contactName,
    piAffiliation: clean(raw.Contact_Affiliation),
    sites: address
      ? [{
          name: clean(raw.Contact_Affiliation) || 'Study site',
          address,
          city: '',
          state: '',
          contactPerson: contactName,
          phone: clean(raw.Contact_Tel)
        }]
      : [],
    eligibility,
    outcomes,
    briefSummary: '',
    locations: clean(raw.Countries).split(/[;,]/).map(s => s.trim()).filter(Boolean),
    state: '',
    district: '',
    contactPerson: contactName,
    contactEmail: clean(raw.Contact_Email),
    contactPhone: clean(raw.Contact_Tel),
    ethicsCommittee: '',
    dcgIApproval: '',
    lastUpdated: parseDate(raw.Date_registration),
    sourceUrl: clean(raw.web_address),
    source: 'ICTRP',
    ictrpRefreshedOn: parseRefreshed(raw.Last_Refreshed_on),
    registrationDate: parseDate(raw.Date_registration)
  };
};

async function revealTerms(page) {
  await page.evaluate(() => {
    const fg = document.getElementById('ModalPopupExtender2_foregroundElement');
    const panel = document.getElementById('Panel6');
    if (fg) fg.style.display = 'block';
    if (panel) panel.style.display = 'block';
  });
}

async function exportQuery(page, query, outDir) {
  await page.goto(DEFAULT_URL, { waitUntil: 'networkidle', timeout: 120000 });
  await page.fill('#TextBox1', query);
  await Promise.all([
    page.waitForNavigation({ timeout: 120000 }).catch(() => null),
    page.click('#Button1')
  ]);
  await page.waitForTimeout(2500);

  const body = await page.locator('body').innerText();
  if (/No records found/i.test(body)) return { count: 0, file: null };

  const multiMatch = body.match(/([\d,]+)\s+records?\s+for\s+[\d,]+\s+trials?\s+found/i);
  const singleMatch = body.match(/([\d,]+)\s+trials?\s+found/i);
  const countText = multiMatch ? multiMatch[1] : singleMatch ? singleMatch[1] : '';
  const count = countText ? parseInt(countText.replace(/,/g, ''), 10) : 0;
  if (!count) return { count: 0, file: null };

  console.log(`[export] ${query}: ${count} records`);

  await page.click('#Button8');
  await page.waitForTimeout(1200);
  if (!(await page.locator('#Button13').isVisible().catch(() => false))) {
    await revealTerms(page);
  }
  await page.locator('#Button13').click({ timeout: 30000 });
  await page.waitForTimeout(2500);

  if (!(await page.locator('#Button14').count())) {
    throw new Error(`Export button not available for ${query}`);
  }

  const downloadPromise = page.waitForEvent('download', { timeout: 15 * 60 * 1000 }).catch(() => null);
  await page.click('#Button14');
  const download = await downloadPromise;

  if (!download) throw new Error(`Export timed out for ${query} (${count} records)`);

  const file = path.join(outDir, query.replace(/[^A-Za-z0-9]+/g, '_') + '.xml');
  await download.saveAs(file);
  console.log(`[export] saved ${file} (${fs.statSync(file).size} bytes)`);
  return { count, file };
}

function parseXmlFile(file) {
  const xml = fs.readFileSync(file, 'utf8');
  const parser = new XMLParser({
    ignoreAttributes: true,
    trimValues: true,
    parseTagValue: false,
    isArray: name => name === 'Trial'
  });
  const parsed = parser.parse(xml);
  const root = parsed.Trials_downloaded_from_ICTRP;
  if (!root || !root.Trial) return [];
  return Array.isArray(root.Trial) ? root.Trial : [root.Trial];
}

function defaultScanQueries() {
  const now = new Date();
  const months = [now, new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1))];
  return months.map(d => `CTRI/${d.getUTCFullYear()}/${String(d.getUTCMonth() + 1).padStart(2, '0')}`);
}

async function commitBatch(db, ops) {
  let batch = db.batch();
  let count = 0;
  for (const op of ops) {
    if (op.type === 'set') batch.set(op.ref, op.data, { merge: true });
    if (op.type === 'delete') batch.delete(op.ref);
    count++;
    if (count === BATCH_SIZE) {
      await batch.commit();
      batch = db.batch();
      count = 0;
    }
  }
  if (count > 0) await batch.commit();
}

async function main() {
  initializeFirebase();
  const db = getDb();

  const stateRef = db.collection(STATE_DOC.collection).doc(STATE_DOC.id);
  const stateSnap = await stateRef.get();
  const state = stateSnap.exists ? stateSnap.data() : {};

  if (flags.ifDue && state.nextRunAt) {
    const due = new Date(state.nextRunAt).getTime();
    if (Date.now() < due) {
      console.log(`[skip] next run is due at ${state.nextRunAt}`);
      return;
    }
  }

  const queries = scans.length ? scans : defaultScanQueries();
  const outDir = path.join(os.tmpdir(), 'ctri-ictrp-sync');
  fs.mkdirSync(outDir, { recursive: true });

  console.log(`[sync] queries: ${queries.join(', ')}`);
  console.log(`[sync] dryRun=${flags.dryRun} prune=${flags.prune} refreshExisting=${flags.refreshExisting}`);

  const snapshot = await db.collection(COLLECTION).get();
  const existingByCtri = new Map();
  snapshot.docs.forEach(doc => {
    const data = doc.data();
    if (data.ctriNumber) existingByCtri.set(String(data.ctriNumber).trim(), { id: doc.id, ...data });
  });
  console.log(`[sync] existing trials in Firestore: ${existingByCtri.size}`);

  const browser = await chromium.launch({ headless: !flags.headed, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1366, height: 900 },
    acceptDownloads: true
  });
  const page = await context.newPage();

  const seen = new Set();
  const ops = [];
  const stats = { created: 0, updated: 0, skippedStatus: 0, failed: 0, deleted: 0, records: 0 };

  try {
    for (const query of queries) {
      let exported;
      try {
        exported = await exportQuery(page, query, outDir);
      } catch (error) {
        stats.failed++;
        console.error(`[error] export ${query}: ${error.message}`);
        continue;
      }

      if (!exported.file) {
        console.log(`[scan] ${query}: nothing found`);
        continue;
      }

      const rawTrials = parseXmlFile(exported.file);
      console.log(`[scan] ${query}: parsed ${rawTrials.length} records`);

      let processed = 0;
      for (const raw of rawTrials) {
        if (limit && processed >= limit) break;
        processed++;
        stats.records++;

        if (!isRecruiting(raw.Recruitment_Status)) {
          stats.skippedStatus++;
          continue;
        }

        const mapped = mapTrial(raw);
        if (!mapped.ctriNumber) {
          stats.failed++;
          continue;
        }

        seen.add(mapped.ctriNumber);
        const existing = existingByCtri.get(mapped.ctriNumber);

        if (flags.dryRun) {
          if (stats.created + stats.updated < 3) {
            console.log('[dry-run] sample:', JSON.stringify(mapped, null, 1).slice(0, 900));
          }
          existing ? stats.updated++ : stats.created++;
          continue;
        }

        const ref = existing
          ? db.collection(COLLECTION).doc(existing.id)
          : db.collection(COLLECTION).doc();

        ops.push({
          type: 'set',
          ref,
          data: {
            ...mapped,
            updatedAt: new Date().toISOString(),
            lastChecked: new Date().toISOString(),
            ...(existing ? {} : { createdAt: new Date().toISOString() })
          }
        });

        if (existing) stats.updated++;
        else stats.created++;
      }
    }

    // Remove trials in the scanned prefix that are no longer recruiting.
    if (flags.prune && !flags.dryRun) {
      for (const [ctriNumber, doc] of existingByCtri) {
        const inScope = queries.some(q => ctriNumber.startsWith(q));
        if (!inScope) continue;
        if (seen.has(ctriNumber)) continue;

        const status = text(doc.recruitmentStatus);
        const isOurSource = doc.source === 'CTRI' || doc.source === 'ICTRP' || Boolean(doc.sourceUrl);
        if (!isOurSource) continue;

        ops.push({ type: 'delete', ref: db.collection(COLLECTION).doc(doc.id) });
        stats.deleted++;
        console.log(`[prune] delete ${ctriNumber} (status: ${status || 'unknown'})`);
      }
    }

    // Re-check stored trials; delete them if they left the recruiting phase.
    // With --refresh-limit, a rotating cursor checks a slice per run so that
    // large collections are covered over several scheduled runs.
    if (flags.refreshExisting && !flags.dryRun) {
      const candidates = [...existingByCtri.keys()].filter(n => /^CTRI\//i.test(n)).sort();
      let targets = candidates;
      let nextCursor = state.refreshCursor || '';

      if (refreshLimit > 0 && candidates.length > 0) {
        let startIndex = 0;
        if (state.refreshCursor) {
          const idx = candidates.indexOf(state.refreshCursor);
          if (idx >= 0) startIndex = idx + 1;
        }
        const take = Math.min(refreshLimit, candidates.length);
        targets = Array.from({ length: take }, (_, i) => candidates[(startIndex + i) % candidates.length]);
        nextCursor = targets[targets.length - 1];
        console.log(`[refresh] checking ${targets.length} of ${candidates.length} trials (cursor after ${nextCursor})`);
      }

      for (const ctriNumber of targets) {
        const doc = existingByCtri.get(ctriNumber);
        if (!doc) continue;
        try {
          const result = await exportQuery(page, ctriNumber, outDir);
          if (!result.file) {
            ops.push({ type: 'delete', ref: db.collection(COLLECTION).doc(doc.id) });
            stats.deleted++;
            console.log(`[refresh] delete ${ctriNumber} (not found in ICTRP)`);
            continue;
          }
          const rows = parseXmlFile(result.file);
          const raw = rows[0];
          if (!raw) continue;

          if (!isRecruiting(raw.Recruitment_Status)) {
            ops.push({ type: 'delete', ref: db.collection(COLLECTION).doc(doc.id) });
            stats.deleted++;
            console.log(`[refresh] delete ${ctriNumber} (status: ${clean(raw.Recruitment_Status)})`);
            continue;
          }

          ops.push({
            type: 'set',
            ref: db.collection(COLLECTION).doc(doc.id),
            data: { ...mapTrial(raw), updatedAt: new Date().toISOString(), lastChecked: new Date().toISOString() }
          });
          stats.updated++;
        } catch (error) {
          stats.failed++;
          console.error(`[error] refresh ${ctriNumber}: ${error.message}`);
        }
      }

      if (refreshLimit > 0) stats.refreshCursor = nextCursor;
    }

    if (!flags.dryRun) {
      await commitBatch(db, ops);
      console.log(`[sync] committed ${ops.length} operations`);
    }

    const finishedAt = new Date();
    const nextRunAt = new Date(finishedAt.getTime() + SYNC_INTERVAL_DAYS * 24 * 60 * 60 * 1000).toISOString();

    if (!flags.dryRun) {
      await stateRef.set({
        lastRunAt: finishedAt.toISOString(),
        nextRunAt,
        lastQueries: queries,
        source: 'ICTRP',
        ...(stats.refreshCursor ? { refreshCursor: stats.refreshCursor } : {}),
        stats
      }, { merge: true });

      await db.collection('syncLogs').add({
        timestamp: finishedAt.toISOString(),
        type: 'ctri_sync_ictrp',
        queries,
        stats
      });
    }

    console.log('\n=== SYNC SUMMARY ===');
    console.log(JSON.stringify({ ...stats, queries, dryRun: flags.dryRun, nextRunAt }, null, 2));
  } finally {
    await browser.close();
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    logger.error('ICTRP sync failed:', error);
    console.error('SYNC FAILED:', error.message);
    process.exit(1);
  });
