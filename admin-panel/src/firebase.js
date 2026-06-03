import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || 'AIzaSyDPkQnxtMFKApBG5mle9yRsfgxlm5yS3do',
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || 'bingo-27d37.firebaseapp.com',
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || 'bingo-27d37',
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || 'bingo-27d37.firebasestorage.app',
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || '509582453061',
  appId: process.env.REACT_APP_FIREBASE_APP_ID || '1:509582453061:web:7506bd6e5ff45c5e58b62c',
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || 'G-VTLQ243Q66'
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
