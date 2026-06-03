import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';

import AdminLayout from './components/layouts/AdminLayout';
import AdminDashboard from './components/pages/Dashboard';
import UserManagement from './components/pages/UserManagement';
import AgentManagement from './components/pages/AgentManagement';
import SettingsPage from './components/pages/Settings';
import AdminLogin from './components/pages/AdminLogin';
import AuditLogView from './components/pages/AuditLogView';
import LoadingScreen from './components/fragments/LoadingScreen';

const theme = createTheme({
    palette: {
        primary: {
            main: '#2c3e50',
            light: '#34495e',
            dark: '#1a252f',
        },
        secondary: {
            main: '#e74c3c',
            light: '#ec7063',
            dark: '#c0392b',
        },
        background: {
            default: '#f8f9fa',
            paper: '#ffffff',
        },
    },
    typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        h4: {
            fontWeight: 600,
        },
        h5: {
            fontWeight: 600,
        },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    fontWeight: 500,
                },
            },
        },
    },
});

function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                // Check if user is admin (you can add custom claims or check a database)
                const token = await currentUser.getIdTokenResult(true);
                setIsAdmin(token.claims.role === 'SUPER_ADMIN');
            } else {
                setUser(null);
                setIsAdmin(false);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    if (loading) {
        return <LoadingScreen />;
    }

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <BrowserRouter>
                <Routes>
                    <Route path="/admin-login" element={<AdminLogin />} />
                    <Route
                        path="/admin/*"
                        element={
                            user && isAdmin ? (
                                <AdminLayout>
                                    <Routes>
                                        <Route path="/" element={<AdminDashboard />} />
                                        <Route path="/users" element={<UserManagement />} />
                                        <Route path="/agents" element={<AgentManagement />} />
                                        <Route path="/settings" element={<SettingsPage />} />
                                        <Route path="/audit-log" element={<AuditLogView />} />
                                    </Routes>
                                </AdminLayout>
                            ) : (
                                <Navigate to="/admin-login" replace />
                            )
                        }
                    />
                    <Route path="/" element={<Navigate to="/admin" replace />} />
                </Routes>
            </BrowserRouter>
            <ToastContainer
                position="bottom-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={true}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
        </ThemeProvider>
    );
}

export default App;
