import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// These are public client identifiers (not secrets). They are safe to ship in
// the browser bundle; access to patient data is controlled by Firebase Auth
// custom claims and the backend API.
const firebaseConfig = {
  apiKey: 'AIzaSyBFKiuuN-Qfw89Zh5_-vp17JFwJOUW5Slo',
  authDomain: 'care-for-the-needy-patients.firebaseapp.com',
  projectId: 'care-for-the-needy-patients',
  storageBucket: 'care-for-the-needy-patients.firebasestorage.app',
  messagingSenderId: '991903040171',
  appId: '1:991903040171:web:a0fe88afb8b9e82f58edee'
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export default app;
