import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || 'AIzaSyDPkQnxtMFKApBG5mle9yRsfgxlm5yS3do',
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || 'bingo-27d37-5661f.firebaseapp.com',
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || 'bingo-27d37-5661f',
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || 'bingo-27d37-5661f.firebasestorage.app',
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || '330815222659',
  appId: process.env.REACT_APP_FIREBASE_APP_ID || '1:330815222659:web:4890bf5cddc728bf29bcb6',
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || 'G-CD4DWDC8SW'
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

let analytics = null;
try { analytics = getAnalytics(app); } catch (e) { /* analytics unavailable */ }

export {
  auth, db, storage, analytics,
  onAuthStateChanged, signInWithEmailAndPassword, signOut
};
