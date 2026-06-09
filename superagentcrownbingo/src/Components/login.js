import React, { useState } from 'react';
import {
    Box,
    Card,
    TextField,
    Button,
    Typography,
    Alert,
    CircularProgress,
    Container,
} from '@mui/material';
import {
    getAuth,
    signInWithEmailAndPassword
} from "firebase/auth";
import {
    ToastContainer,
    toast
} from 'react-toastify';
import {
    useNavigate
} from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import {
    doc,
    getDoc
} from 'firebase/firestore';
import {
    db
} from '../firebase';

const LoginPage = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const auth = getAuth();

            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Get the user's role from Firestore
            console.log(user.uid);
            localStorage.setItem('uid', user.uid);

            const userDocRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
                const userData = userDoc.data();
                const userRole = userData.role;
                console.log(userData);

                // Only allow access for super agents
                if (userData.userRole == 'superAgent') {
                    localStorage.setItem('gametype', userData.gametype);
                    console.log(localStorage.getItem('gametype'));
                    // Save the user's authentication token
                    const token = await user.getIdToken();
                    localStorage.setItem('token', token);

                    console.log('Login successful. Redirecting to /CreateNewGame...');
                    toast.success('Login successful');
                    navigate('/Dashboard'); // Redirect to CreateNewGame upon successful login
                } else {
                    console.error('Unauthorized access. User is not a super agent.');
                    setError('You do not have super agent access. Contact your administrator.');
                    toast.error('Unauthorized access. User is not a super and agent.');
                }
            } else {
                console.error('User data not found.');
                setError('User data not found.');
                toast.error('User data not found.');
            }
        } catch (error) {
            console.error('Login failed:', error.message);
            setError(error.message || 'Login failed');
            toast.error('Login failed: ' + error.message);
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #2c3e50 0%, #3498db 100%)',
            }}
        >
            <Container maxWidth="sm">
                <Card
                    sx={{
                        p: 4,
                        boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                        borderRadius: 2,
                    }}
                >
                    <Typography
                        variant="h4"
                        sx={{
                            textAlign: 'center',
                            fontWeight: 700,
                            mb: 1,
                            color: '#2c3e50',
                        }}
                    >
                        Crown Bingo
                    </Typography>
                    <Typography
                        variant="body2"
                        sx={{
                            textAlign: 'center',
                            mb: 3,
                            color: '#7f8c8d',
                        }}
                    >
                        Super Agent Login
                    </Typography>

                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                    <Box component="form" onSubmit={handleLogin} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            fullWidth
                            label="Email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            variant="outlined"
                        />
                        <TextField
                            fullWidth
                            label="Password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            variant="outlined"
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            size="large"
                            disabled={loading}
                            sx={{
                                background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                                mt: 2,
                            }}
                        >
                            {loading ? (
                                <>
                                    <CircularProgress size={20} sx={{ mr: 1 }} />
                                    Logging in...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </Button>
                    </Box>

                    <Typography
                        variant="caption"
                        sx={{
                            display: 'block',
                            textAlign: 'center',
                            mt: 3,
                            color: '#7f8c8d',
                        }}
                    >
                        Only super agents can access this panel.
                        Contact your system administrator for credentials.
                    </Typography>
                </Card>
            </Container>
            <ToastContainer />
        </Box>
    );
};

export default LoginPage;
