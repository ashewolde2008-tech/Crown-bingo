// Import the functions you need from the SDKs you need
import {
    initializeApp,
    getApps
} from "firebase/app";
import {
    getAnalytics
} from "firebase/analytics";
import {
    getFirestore
} from 'firebase/firestore';
import {
    getAuth
} from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyDM_bwlzoRTNBtGTm8WFWfnol_aTA3Or2o",
    authDomain: "bingo-27d37.firebaseapp.com",
    projectId: "bingo-27d37-5661f",
    storageBucket: "bingo-27d37-5661f.firebasestorage.app",
    messagingSenderId: "509582453061",
    appId: "1:509582453061:web:7506bd6e5ff45c5e58b62c",
    measurementId: "G-VTLQ243Q66"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);
const auth = getAuth(app);

export {
    db,
    auth
};