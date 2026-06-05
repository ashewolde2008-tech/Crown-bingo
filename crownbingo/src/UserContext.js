import React, { createContext, useContext, useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase.js';

const UserContext = createContext(null);

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
    const [userData, setUserData] = useState(null);
    const [authReady, setAuthReady] = useState(false);

    useEffect(() => {
        const auth = getAuth();
        let unsubDoc = null;
        const unsubAuth = onAuthStateChanged(auth, (user) => {
            if (unsubDoc) {
                unsubDoc();
                unsubDoc = null;
            }
            if (!user) {
                setUserData(null);
                setAuthReady(true);
                return;
            }
            const userDocRef = doc(db, 'users', user.uid);
            unsubDoc = onSnapshot(
                userDocRef,
                (snap) => {
                    if (snap.exists()) {
                        setUserData({ id: snap.id, ...snap.data() });
                    } else {
                        setUserData(null);
                    }
                    setAuthReady(true);
                },
                (error) => {
                    console.error('Error listening to user document:', error);
                    setAuthReady(true);
                }
            );
        });
        return () => {
            unsubAuth();
            if (unsubDoc) unsubDoc();
        };
    }, []);

    return (
        <UserContext.Provider value={{ userData, authReady }}>
            {children}
        </UserContext.Provider>
    );
};
