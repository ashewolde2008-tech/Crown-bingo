import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, collection, getDocs, doc, getDoc, setDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyDM_bwlzoRTNBtGTm8WFWfnol_aTA3Or2o",
  authDomain: "bingo-27d37.firebaseapp.com",
  projectId: "bingo-27d37",
  storageBucket: "bingo-27d37.firebasestorage.app",
  messagingSenderId: "509582453061",
  appId: "1:509582453061:web:7506bd6e5ff45c5e58b62c",
  measurementId: "G-VTLQ243Q66"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

let analytics = null;
try { analytics = getAnalytics(app); } catch (e) { /* analytics unavailable */ }

async function loginUser(email, password) {
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
}

async function logoutUser() {
  await signOut(auth);
}

function setupAuthListener(callback) {
  return onAuthStateChanged(auth, callback);
}

async function isUserAdmin(user) {
  if (!user) return false;
  const tokenResult = await user.getIdTokenResult();
  return tokenResult.claims.role === 'SUPER_ADMIN';
}

async function getAllUsers() {
  const snapshot = await getDocs(collection(db, 'users'));
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

async function addUser(userData) {
  const ref = doc(db, 'users', userData.uid);
  await setDoc(ref, userData);
}

async function updateUser(userId, userData) {
  const ref = doc(db, 'users', userId);
  await updateDoc(ref, userData);
}

async function deleteUser(userId) {
  await deleteDoc(doc(db, 'users', userId));
}

async function getAllAgents() {
  const snapshot = await getDocs(collection(db, 'agents'));
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

async function addAgent(agentData) {
  const ref = doc(db, 'agents', agentData.uid);
  await setDoc(ref, agentData);
}

async function updateAgent(agentId, agentData) {
  const ref = doc(db, 'agents', agentId);
  await updateDoc(ref, agentData);
}

async function deleteAgent(agentId) {
  await deleteDoc(doc(db, 'agents', agentId));
}

async function getSettings() {
  const snapshot = await getDocs(collection(db, 'settings'));
  if (snapshot.empty) return null;
  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
}

async function updateSettings(settingsData) {
  const ref = doc(db, 'settings', 'config');
  await setDoc(ref, settingsData, { merge: true });
}

export {
  auth, db, storage, analytics,
  loginUser, logoutUser, setupAuthListener, isUserAdmin,
  getAllUsers, addUser, updateUser, deleteUser,
  getAllAgents, addAgent, updateAgent, deleteAgent,
  getSettings, updateSettings,
  onAuthStateChanged, signInWithEmailAndPassword, signOut,
  collection, getDocs, doc, getDoc, setDoc, updateDoc, deleteDoc, query, where
};
