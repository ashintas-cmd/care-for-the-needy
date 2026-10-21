/**
 * Grant the "admin" role to a Firebase Auth user.
 *
 * Usage (from the backend folder):
 *   node scripts/makeAdmin.js ash.intas@gmail.com
 *
 * If the user does not exist yet, the account is created without a password.
 * The person can then set a password from the admin login page using
 * "Forgot password?".
 */
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env.backend') });

const { initializeFirebase, getAuth } = require('../src/utils/firebase');

const email = process.argv[2];

if (!email) {
  console.error('Usage: node scripts/makeAdmin.js email@example.com');
  process.exit(1);
}

(async () => {
  initializeFirebase();
  const auth = getAuth();

  let user;
  try {
    user = await auth.getUserByEmail(email);
    console.log(`Existing user found: ${user.uid}`);
  } catch (error) {
    if (error.code !== 'auth/user-not-found') throw error;
    user = await auth.createUser({ email, emailVerified: false });
    console.log(`New user created: ${user.uid}`);
  }

  await auth.setCustomUserClaims(user.uid, {
    ...(user.customClaims || {}),
    role: 'admin'
  });

  console.log(`Admin role granted to ${email}.`);
  console.log('The person must sign out and sign in again for the new role to apply.');

  if (process.argv.includes('--link')) {
    const link = await auth.generatePasswordResetLink(email);
    console.log('\nOne-time password reset link:\n' + link);
  }

  process.exit(0);
})().catch(error => {
  console.error('Failed:', error.message);
  process.exit(1);
});
