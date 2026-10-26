/**
 * Seed the `siteImages` Firestore collection with the photos used on the
 * website home page.
 *
 * The image files themselves are deployed with Firebase Hosting (they live in
 * `public/images/` and are served from the Firebase CDN). Firestore stores the
 * metadata that the site reads through `GET /api/images` so an image can be
 * re-captioned, re-ordered, re-pointed or hidden without a code change.
 *
 * Usage (from the `backend` folder):
 *   node scripts/seedSiteImages.js
 *
 * The script is idempotent - running it again refreshes the same documents.
 */

const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../../.env.backend') });

const { initializeFirebase, getDb } = require('../src/utils/firebase');

const COLLECTION_NAME = 'siteImages';

const IMAGES = [
  {
    id: 'hero-primary',
    slot: 'hero',
    title: 'People Today. Brighter Tomorrows.',
    alt: 'Collage of clinical trial participants and a doctor with the caption "People Today. Brighter Tomorrows. Clinical trials make a difference."',
    caption: 'Clinical trials make a difference - new treatments, real hope, brighter tomorrows.',
    src: '/images/hero-people-today-brighter-tomorrows.webp',
    storagePath: null,
    width: 1536,
    height: 1024,
    order: 1,
    active: true
  },
  {
    id: 'care-at-home',
    slot: 'care',
    title: 'Care that reaches the bedside',
    alt: 'A family member talking with an elderly patient at home while a nurse adjusts an IV drip.',
    caption: 'Dignified care close to home, with family by your side.',
    src: '/images/care-at-home.webp',
    storagePath: null,
    width: 349,
    height: 195,
    order: 2,
    active: true
  }
];

async function main() {
  initializeFirebase();

  const db = getDb();
  const now = new Date().toISOString();

  for (const { id, ...image } of IMAGES) {
    await db
      .collection(COLLECTION_NAME)
      .doc(id)
      .set({ ...image, updatedAt: now }, { merge: true });

    console.log(`  ✔ ${COLLECTION_NAME}/${id} -> ${image.src}`);
  }

  const total = await db.collection(COLLECTION_NAME).count().get();
  console.log(`\nDone. ${COLLECTION_NAME} now holds ${total.data().count} document(s).`);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Failed to seed site images:', error.message);
    process.exit(1);
  });
