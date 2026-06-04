import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: 'AIzaSyDPkQnxtMFKApBG5mle9yRsfgxlm5yS3do',
  authDomain: 'bingo-27d37-5661f.firebaseapp.com',
  projectId: 'bingo-27d37-5661f',
  storageBucket: 'bingo-27d37-5661f.firebasestorage.app',
  messagingSenderId: '330815222659',
  appId: '1:330815222659:web:4890bf5cddc728bf29bcb6',
  measurementId: 'G-CD4DWDC8SW'
};

const crownbingoConfig = {
  apiKey: "AIzaSyDM_bwlzoRTNBtGTm8WFWfnol_aTA3Or2o",
  authDomain: "bingo-27d37-5661f.firebaseapp.com",
  projectId: "bingo-27d37-5661f",
  storageBucket: "bingo-27d37-5661f.firebasestorage.app",
  messagingSenderId: "330815222659",
  appId: "1:330815222659:web:4890bf5cddc728bf29bcb6",
  measurementId: "G-CD4DWDC8SW"
};

const app = initializeApp(firebaseConfig);
const crownbingoApp = initializeApp(crownbingoConfig, 'crownbingo');

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const crownbingoAuth = getAuth(crownbingoApp);
const crownbingoDb = getFirestore(crownbingoApp);

let analytics = null;
try { analytics = getAnalytics(app); } catch (e) { /* analytics unavailable */ }

export {
  auth, db, storage, analytics, crownbingoAuth, crownbingoDb,
  onAuthStateChanged, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword
};
