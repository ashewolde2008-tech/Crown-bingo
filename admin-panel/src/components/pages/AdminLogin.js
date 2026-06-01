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
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function AdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const token = await userCredential.user.getIdTokenResult();

            if (token.claims.role === 'SUPER_ADMIN') {
                toast.success('Login successful!');
                navigate('/admin');
            } else {
                setError('You do not have admin access. Contact your administrator.');
                await auth.signOut();
            }
        } catch (err) {
            setError(err.message || 'Login failed');
            toast.error('Login failed: ' + err.message);
        } finally {
            setLoading(false);
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
                        Admin Login
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
                            disabled={loading}
                        />
                        <TextField
                            fullWidth
                            label="Password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            variant="outlined"
                            disabled={loading}
                        />
                        <Button
                            fullWidth
                            variant="contained"
                            size="large"
                            onClick={handleLogin}
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
                        Only administrators can access this panel.
                        Contact your system administrator for credentials.
                    </Typography>
                </Card>
            </Container>
        </Box>
    );
}
