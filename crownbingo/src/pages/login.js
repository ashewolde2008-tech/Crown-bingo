import React from 'react';
import { Paper, Typography, TextField, Button } from '@mui/material';
import { signInWithEmailAndPassword } from "firebase/auth";
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import './LoginPage.css';

const LoginPage = () => {
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        const email = e.target.username.value;
        const password = e.target.password.value;

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            const sessionExpiration = new Date().getTime() + 24 * 60 * 60 * 1000;
            localStorage.setItem('uid', user.uid);
            localStorage.setItem('sessionExpiration', sessionExpiration);
            const userDocRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                const userData = userDoc.data();

                if (userData.adminId === 'cfIbY9MiWIezaY3tmBJSqW3sgUo1') {
                    toast.error('Admin access required. Contact Support');
                    return;
                }

                if (userData.isDisabled) {
                    toast.error('Your account has been disabled. Please contact support.');
                    return;
                }

                navigate('/NewGame')
            } else {
                toast.error('User data not found.');
            }
        } catch (error) {
            toast.error('Login failed: ' + error.message);
        }
    };

    const handleLogout = async () => {
        const uid = localStorage.getItem('uid');
        if (uid) {
            const userDocRef = doc(db, 'users', uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                await updateDoc(userDocRef, {
                    isLoggedIn: false
                });
            }

            localStorage.removeItem('uid');
            auth.signOut();
            toast.info('You have been logged out');
            navigate('/login');
        }
    };

    return (
        <div className="video-bg-container">
            <div
                className="login-form-wrap"
                style={{
                    position: 'relative',
                    zIndex: 2,
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <Paper
                    elevation={3}
                    style={{
                        padding: '40px',
                        borderRadius: '12px',
                        backgroundColor: '#ffffff',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        color: '#2c3e50',
                        width: '100%',
                        maxWidth: '420px',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
                    }}
                >
                    <Typography
                        variant="h3"
                        style={{
                            marginBottom: '10px',
                            color: '#2c3e50',
                            fontWeight: 700,
                            fontSize: '2.2rem',
                            textAlign: 'center',
                        }}
                    >
                        Crown Bingo
                    </Typography>
                    <Typography
                        variant="body2"
                        style={{
                            marginBottom: '20px',
                            color: '#7f8c8d',
                            textAlign: 'center',
                            fontSize: '1rem',
                        }}
                    >
                        Login
                    </Typography>
                    <form
                        style={{ width: '100%' }}
                        onSubmit={handleLogin}
                        noValidate
                    >
                        <TextField
                            variant="outlined"
                            margin="normal"
                            required
                            fullWidth
                            id="username"
                            label="Username"
                            name="username"
                            autoComplete="username"
                            autoFocus
                            InputProps={{
                                style: { color: '#2c3e50' },
                            }}
                            InputLabelProps={{
                                style: { color: '#7f8c8d' },
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': {
                                        borderColor: '#bdc3c7',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: '#3498db',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#2c3e50',
                                    },
                                },
                                '& .MuiInputLabel-root.Mui-focused': {
                                    color: '#2c3e50',
                                },
                            }}
                            style={{
                                marginBottom: '20px',
                                backgroundColor: '#ffffff',
                                borderRadius: '5px'
                            }}
                        />
                        <TextField
                            variant="outlined"
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            type="password"
                            id="password"
                            autoComplete="current-password"
                            InputProps={{
                                style: { color: '#2c3e50' },
                            }}
                            InputLabelProps={{
                                style: { color: '#7f8c8d' },
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': {
                                        borderColor: '#bdc3c7',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: '#3498db',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#2c3e50',
                                    },
                                },
                                '& .MuiInputLabel-root.Mui-focused': {
                                    color: '#2c3e50',
                                },
                            }}
                            style={{
                                marginBottom: '20px',
                                backgroundColor: '#ffffff',
                                borderRadius: '5px'
                            }}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            size="large"
                            style={{
                                marginTop: '16px',
                                background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                                color: '#ffffff',
                                padding: '12px',
                                borderRadius: '8px',
                                fontWeight: 'bold',
                            }}
                        >
                            Sign In
                        </Button>
                    </form>
                </Paper>
                <ToastContainer />
            </div>
        </div>
    );
};

export default LoginPage;
