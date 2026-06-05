import React from 'react';
import { Container, Paper, Typography, TextField, Button } from '@mui/material';
import { signInWithEmailAndPassword } from "firebase/auth";
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import { collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';

const LoginPage = () => {
    const navigate = useNavigate();

    //handles Login
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
            const usersCollection = collection(db, 'users');
            const usersQuery = query(usersCollection, where('uid', '==', user.uid));
            const usersSnapshot = await getDocs(usersQuery);

            if (!usersSnapshot.empty) {
                const userDoc = usersSnapshot.docs[0];
                const userData = userDoc.data();

                // Check if the adminId is not equal to the specified ID
                if (userData.adminId === 'cfIbY9MiWIezaY3tmBJSqW3sgUo1') {
                    toast.error('Admin access required. Contact Support');
                    return;
                }

                // Check if the user is disabled
                if (userData.isDisabled) {
                    toast.error('Your account has been disabled. Please contact support.');
                    return;
                }



                // Set isLoggedIn to true and proceed with the login

                navigate('/NewGame')
            } else {
                toast.error('User data not found.');
            }
        } catch (error) {
            toast.error('Login failed: ' + error.message);
        }
    };

    // Function to handle logout and reset isLoggedIn
    const handleLogout = async () => {
        const uid = localStorage.getItem('uid');
        if (uid) {
            const usersCollection = collection(db, 'users');
            const usersQuery = query(usersCollection, where('uid', '==', uid));
            const usersSnapshot = await getDocs(usersQuery);

            if (!usersSnapshot.empty) {
                const userDoc = usersSnapshot.docs[0];
                await updateDoc(userDoc.ref, {
                    isLoggedIn: false
                });
            }

            localStorage.removeItem('uid');
            auth.signOut();
            toast.info('You have been logged out');
            navigate('/login');
        }
    };


    return ( <
        div className = "video-bg-container" > { /* Video Background */ } <
        video autoPlay loop muted className = "video-bg" >
        <
        source src = "/bingo.mp4"
        type = "video/mp4" / >
        <
        /video> { /* Overlay */ } <
        div className = "overlay" > < /div>

        <
        Container component = "main"
        maxWidth = "xs"
        style = {
            {
                position: 'relative',
                zIndex: 2,
                marginTop: '10vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                boxShadow: '0 4px 20px rgba(0, 201, 183, 0.6)', // Bluish glow effect
                borderRadius: '12px'
            }
        } >
        <
        Typography variant = "h3"
        className = "glow-text"
        style = {
            {
                marginBottom: '20px',
                color: '#FFF',
                fontWeight: 'bold',
                fontSize: '2.5rem',
                textAlign: 'center',
            }
        } >
        <
        /Typography> <
        Paper elevation = {
            10
        }
        style = {
            {
                padding: '40px',
                borderRadius: '12px',
                backgroundColor: '#1e1e1e',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                color: '#00c9b7'
            }
        } >
        <
        Typography style = {
            {
                marginBottom: '20px',
                color: '#17c190'
            }
        } >
        Crown Bingo <
        /Typography> <
        Typography component = "h1"
        variant = "h5"
        style = {
            {
                marginBottom: '20px',
                color: '#17c190'
            }
        } >
        Login <
        /Typography> <
        form style = {
            {
                width: '100%'
            }
        }
        onSubmit = {
            handleLogin
        }
        noValidate >
        <
        TextField variant = "outlined"
        margin = "normal"
        required fullWidth id = "username"
        label = "Username"
        name = "username"
        autoComplete = "username"
        autoFocus InputProps = {
            {
                style: {
                    color: '#e0e0e0'
                },
            }
        }
        InputLabelProps = {
            {
                style: {
                    color: '#bb86fc'
                },
            }
        }
        style = {
            {
                marginBottom: '20px',
                backgroundColor: '#2a2a2a',
                borderRadius: '5px'
            }
        }
        /> <
        TextField variant = "outlined"
        margin = "normal"
        required fullWidth name = "password"
        label = "Password"
        type = "password"
        id = "password"
        autoComplete = "current-password"
        InputProps = {
            {
                style: {
                    color: '#e0e0e0'
                },
            }
        }
        InputLabelProps = {
            {
                style: {
                    color: '#bb86fc'
                },
            }
        }
        style = {
            {
                marginBottom: '20px',
                backgroundColor: '#2a2a2a',
                borderRadius: '5px'
            }
        }
        /> <
        Button type = "submit"
        fullWidth variant = "contained"
        style = {
            {
                marginTop: '24px',
                backgroundColor: '#17c190',
                color: '#fff',
                padding: '10px',
                borderRadius: '8px',
                fontWeight: 'bold'
            }
        } >
        Sign In <
        /Button> <
        /form> <
        /Paper> <
        ToastContainer / >
        <
        /Container> <
        /div>
    );
};

export default LoginPage;