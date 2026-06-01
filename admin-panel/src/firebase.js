import { initializeApp, getApps } from "firebase/app";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore, collection, getDocs, doc, getDoc, setDoc, updateDoc, deleteDoc, query, where } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDPkQnxtMFKApBG5mle9yRsfgxlm5yS3do",
    authDomain: "bingo-27d37-5661f.firebaseapp.com",
    projectId: "bingo-27d37-5661f",
    storageBucket: "bingo-27d37-5661f.firebasestorage.app",
    messagingSenderId: "330815222659",
    appId: "1:330815222659:web:4890bf5cddc728bf29bcb6",
    measurementId: "G-CD4DWDC8SW"
};

// CrownBingo Firebase config - used for creating users that crownbingo can authenticate
const crownbingoConfig = {
    apiKey: "AIzaSyDM_bwlzoRTNBtGTm8WFWfnol_aTA3Or2o",
    authDomain: "bingo-27d37.firebaseapp.com",
    projectId: "bingo-27d37",
    storageBucket: "bingo-27d37.firebasestorage.app",
    messagingSenderId: "509582453061",
    appId: "1:509582453061:web:7506bd6e5ff45c5e58b62c",
    measurementId: "G-VTLQ243Q66"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Secondary Firebase app matching crownbingo's config (for user creation)
const crownbingoApp = initializeApp(crownbingoConfig, "crownbingo");
const crownbingoAuth = getAuth(crownbingoApp);

// Initialize Analytics (optional)
let analytics;
try {
    analytics = getAnalytics(app);
} catch (e) {
    console.warn('Analytics not available:', e);
}

// ====== HELPER FUNCTIONS ======

/**
 * Login user with email and password
 */
export async function loginUser(email, password) {
    try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        return result.user;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
}

/**
 * Logout current user
 */
export async function logoutUser() {
    try {
        await signOut(auth);
    } catch (error) {
        console.error('Logout error:', error);
        throw error;
    }
}

/**
 * Get all users from Firestore
 */
export async function getAllUsers() {
    try {
        const usersRef = collection(db, "users");
        const snapshot = await getDocs(usersRef);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error getting users:', error);
        throw error;
    }
}

/**
 * Add new user to Firestore
 */
export async function addUser(userData) {
    try {
        const usersRef = collection(db, "users");
        const docRef = await setDoc(doc(usersRef), userData);
        return docRef;
    } catch (error) {
        console.error('Error adding user:', error);
        throw error;
    }
}

/**
 * Update user in Firestore
 */
export async function updateUser(userId, userData) {
    try {
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, userData);
    } catch (error) {
        console.error('Error updating user:', error);
        throw error;
    }
}

/**
 * Delete user from Firestore
 */
export async function deleteUser(userId) {
    try {
        const userRef = doc(db, "users", userId);
        await deleteDoc(userRef);
    } catch (error) {
        console.error('Error deleting user:', error);
        throw error;
    }
}

/**
 * Get all agents from Firestore
 */
export async function getAllAgents() {
    try {
        const agentsRef = collection(db, "agents");
        const snapshot = await getDocs(agentsRef);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error getting agents:', error);
        throw error;
    }
}

/**
 * Add new agent to Firestore
 */
export async function addAgent(agentData) {
    try {
        const agentsRef = collection(db, "agents");
        const docRef = await setDoc(doc(agentsRef), agentData);
        return docRef;
    } catch (error) {
        console.error('Error adding agent:', error);
        throw error;
    }
}

/**
 * Update agent in Firestore
 */
export async function updateAgent(agentId, agentData) {
    try {
        const agentRef = doc(db, "agents", agentId);
        await updateDoc(agentRef, agentData);
    } catch (error) {
        console.error('Error updating agent:', error);
        throw error;
    }
}

/**
 * Delete agent from Firestore
 */
export async function deleteAgent(agentId) {
    try {
        const agentRef = doc(db, "agents", agentId);
        await deleteDoc(agentRef);
    } catch (error) {
        console.error('Error deleting agent:', error);
        throw error;
    }
}

/**
 * Get settings from Firestore
 */
export async function getSettings() {
    try {
        const settingsRef = doc(db, "settings", "config");
        const snapshot = await getDoc(settingsRef);
        return snapshot.exists() ? snapshot.data() : null;
    } catch (error) {
        console.error('Error getting settings:', error);
        throw error;
    }
}

/**
 * Update settings in Firestore
 */
export async function updateSettings(settingsData) {
    try {
        const settingsRef = doc(db, "settings", "config");
        await setDoc(settingsRef, settingsData, { merge: true });
    } catch (error) {
        console.error('Error updating settings:', error);
        throw error;
    }
}

/**
 * Check if user is admin
 */
export async function isUserAdmin(user) {
    try {
        const tokenResult = await user.getIdTokenResult();
        return tokenResult.claims.role === 'SUPER_ADMIN';
    } catch (error) {
        console.error('Error checking admin status:', error);
        return false;
    }
}

/**
 * Setup auth state listener
 */
export function setupAuthListener(callback) {
    return onAuthStateChanged(auth, callback);
}

// ====== EXPORTS ======

export { 
    app, 
    auth,
    crownbingoAuth,
    db, 
    storage, 
    analytics,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
    collection,
    getDocs,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    where
};

// Default export
export default {
    app,
    auth,
    crownbingoAuth,
    db,
    storage,
    analytics,
    loginUser,
    logoutUser,
    getAllUsers,
    addUser,
    updateUser,
    deleteUser,
    getAllAgents,
    addAgent,
    updateAgent,
    deleteAgent,
    getSettings,
    updateSettings,
    isUserAdmin,
    setupAuthListener,
    onAuthStateChanged,
    signOut
};
