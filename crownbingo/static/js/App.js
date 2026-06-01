import React, { useEffect } from 'react';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/home.js';
import Dboard from './pages/Dashboard.js';
import NumberGenerator from './pages/CreateNewGame.js';
import LoginPage from './pages/login.js';
import AdminPage from './pages/Admin.js';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SavePhoneNumber from './pages/phoneRegistering.js';
import GameHistory from './pages/gameHistory.js';
import { LanguageProvider } from './LanguageContext.js';
import PrivateRoute from './pages/PrivateRoute';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase.js';
import { signOut } from 'firebase/auth';
import Transaction from './components/Transaction.js';
import { useNavigate } from 'react-router-dom';

function NavigationListener() {
    const navigate = useNavigate();

    useEffect(() => {
        const uid = localStorage.getItem('uid'); // Get UID from local storage
        if (!uid) {
            toast.error('User not authenticated. Please log in.');
            navigate('/');
            return;
        }

        const userDocRef = doc(db, 'users', uid);

        // Set up a real-time listener
        const unsubscribe = onSnapshot(
            userDocRef,
            (docSnapshot) => {
                if (docSnapshot.exists()) {
                    const userData = docSnapshot.data();
                    if (userData.isDisabled) {
                        toast.error('Your account has been disabled. Logging out...');
                        localStorage.clear(); // Clear all stored data
                        navigate('/'); // Redirect to login page
                    }
                } else {
                    toast.error('User data not found. Please contact support.');
                    localStorage.clear();
                    navigate('/');
                }
            },
            (error) => {
                console.error('Error listening to user document:', error);
                toast.error('Error monitoring account status. Please try again later.');
            }
        );

        // Cleanup listener on component unmount
        return () => unsubscribe();
    }, [navigate]);

    return null; // This component only handles side effects
}

function App() {
    return ( <
            LanguageProvider >
            <
            Router >
            <
            ToastContainer / >
            <
            NavigationListener / >

            <
            Routes >
            <
            Route path = "/"
            element = { < LoginPage / >
            }
            /> <
            Route path = "/home/:betAmount"
            element = { < PrivateRoute > < Home / > < /PrivateRoute>} /
                >
                <
                Route
                path = "/Dboard"
                element = { < PrivateRoute > < Dboard / > < /PrivateRoute>} /
                    >
                    <
                    Route
                    path = "/NewGame"
                    element = { < PrivateRoute > < NumberGenerator / > < /PrivateRoute>} /
                        >
                        <
                        Route
                        path = "/Admin"
                        element = { < PrivateRoute > < AdminPage / > < /PrivateRoute>} /
                            >
                            <
                            Route
                            path = "/savePhone"
                            element = { < PrivateRoute > < SavePhoneNumber / > < /PrivateRoute>} /
                                >
                                <
                                Route
                                path = "/gameHistory"
                                element = { < PrivateRoute > < GameHistory / > < /PrivateRoute>} /
                                    >
                                    <
                                    Route
                                    path = "/transaction"
                                    element = { < PrivateRoute > < Transaction / > < /PrivateRoute>} /
                                        >
                                        <
                                        /Routes> <
                                        /Router> <
                                        /LanguageProvider>
                                    );
                                }

                                export default App;