import React, { useEffect } from 'react';
import { HashRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
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
import { UserProvider, useUser } from './UserContext.js';
import PrivateRoute from './pages/PrivateRoute';
import Transaction from './components/Transaction.js';

function NavigationListener() {
    const navigate = useNavigate();
    const { userData } = useUser();

    useEffect(() => {
        if (userData && userData.isDisabled) {
            toast.error('Your account has been disabled. Logging out...');
            localStorage.clear();
            navigate('/');
        }
    }, [userData, navigate]);

    return null;
}

function App() {
    return (
        <LanguageProvider>
            <UserProvider>
                <Router>
                    <ToastContainer />
                    <NavigationListener />

                    <Routes>
                        <Route path="/" element={<LoginPage />} />
                        <Route path="/home/:betAmount" element={<PrivateRoute><Home /></PrivateRoute>} />
                        <Route path="/Dboard" element={<PrivateRoute><Dboard /></PrivateRoute>} />
                        <Route path="/NewGame" element={<PrivateRoute><NumberGenerator /></PrivateRoute>} />
                        <Route path="/Admin" element={<PrivateRoute><AdminPage /></PrivateRoute>} />
                        <Route path="/savePhone" element={<PrivateRoute><SavePhoneNumber /></PrivateRoute>} />
                        <Route path="/gameHistory" element={<PrivateRoute><GameHistory /></PrivateRoute>} />
                        <Route path="/transaction" element={<PrivateRoute><Transaction /></PrivateRoute>} />
                    </Routes>
                </Router>
            </UserProvider>
        </LanguageProvider>
    );
}

export default App;
