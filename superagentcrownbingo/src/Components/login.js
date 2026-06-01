import React from 'react';
import {
    Container,
    Paper,
    Typography,
    TextField,
    Button
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
    collection,
    query,
    where,
    getDocs
} from 'firebase/firestore';
import {
    db
} from '../firebase';

const LoginPage = () => {
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        const auth = getAuth();
        const email = e.target.username.value;
        const password = e.target.password.value;

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Get the user's role from Firestore
            console.log(user.uid);
            localStorage.setItem('uid', user.uid);

            const usersCollection = collection(db, 'users');
            const usersQuery = query(usersCollection, where('uid', '==', user.uid));
            const usersSnapshot = await getDocs(usersQuery);
            if (!usersSnapshot.empty) {
                const userData = usersSnapshot.docs[0].data();
                const userRole = userData.role;
                console.log(userData);

                // Only allow access for super agents
                if (usersSnapshot.docs[0].data().userRole == 'superAgent') {
                    localStorage.setItem('gametype', usersSnapshot.docs[0].data().gametype);
                    console.log(localStorage.getItem('gametype'));
                    // Save the user's authentication token
                    const token = await user.getIdToken();
                    localStorage.setItem('token', token);

                    console.log('Login successful. Redirecting to /CreateNewGame...');
                    toast.success('Login successful');
                    navigate('/Dashboard'); // Redirect to CreateNewGame upon successful login
                } else {
                    console.error('Unauthorized access. User is not a super agent.');
                    toast.error('Unauthorized access. User is not a super and agent.');
                }
            } else {
                console.error('User data not found.');
                toast.error('User data not found.');
            }
        } catch (error) {
            console.error('Login failed:', error.message);
            toast.error('Login failed: ' + error.message);
        }
    };




    return ( <
        Container component = "main"
        maxWidth = "xs"
        style = {
            {
                marginTop: '8vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
            }
        } >
        <
        Paper elevation = {
            3
        }
        style = {
            {
                padding: '32px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
            }
        } >
        <
        Typography component = "h1"
        variant = "h5" >
        Login <
        /Typography> <
        form style = {
            {
                width: '100%',
                marginTop: '16px'
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
        autoFocus /
        >
        <
        TextField variant = "outlined"
        margin = "normal"
        required fullWidth name = "password"
        label = "Password"
        type = "password"
        id = "password"
        autoComplete = "current-password" /
        >
        <
        Button type = "submit"
        fullWidth variant = "contained"
        color = "primary"
        style = {
            {
                marginTop: '24px'
            }
        } >
        Sign In <
        /Button> <
        /form> <
        /Paper> <
        ToastContainer / >
        <
        /Container>
    );
};

export default LoginPage;