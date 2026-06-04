import React, {
    useState
} from 'react';
import {
    Container,
    TextField,
    Button,
    Typography,
    Box,
    Snackbar,
    Alert,
} from '@mui/material';
import {
    getFirestore,
    doc,
    setDoc
} from 'firebase/firestore';
import {
    initializeApp
} from 'firebase/app';

const firebaseConfig = {
    // Add your Firebase configuration here
    apiKey: "AIzaSyDPkQnxtMFKApBG5mle9yRsfgxlm5yS3do",
    authDomain: "bingo-27d37-5661f.firebaseapp.com",
    projectId: "bingo-27d37-5661f",
    storageBucket: "bingo-27d37-5661f.firebasestorage.app",
    messagingSenderId: "330815222659",
    appId: "1:330815222659:web:4890bf5cddc728bf29bcb6",
    measurementId: "G-CD4DWDC8SW"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const SetBetSettings = () => {
    const [minBet, setMinBet] = useState('');
    const [minPlayers, setMinPlayers] = useState('');
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: ''
    });

    const handleSave = async () => {
        const uid = localStorage.getItem('uid');
        if (!uid) {
            setSnackbar({
                open: true,
                message: 'User not logged in!',
                severity: 'error'
            });
            return;
        }

        if (!minBet || !minPlayers || isNaN(minBet) || isNaN(minPlayers)) {
            setSnackbar({
                open: true,
                message: 'Please enter valid numbers!',
                severity: 'error'
            });
            return;
        }

        try {
            await setDoc(doc(db, 'users', uid), {
                minBet: parseFloat(minBet),
                minPlayers: parseInt(minPlayers, 10),
            }, {
                merge: true
            });

            setSnackbar({
                open: true,
                message: 'Settings saved successfully!',
                severity: 'success'
            });
            setMinBet('');
            setMinPlayers('');
        } catch (error) {
            setSnackbar({
                open: true,
                message: 'Error saving settings!',
                severity: 'error'
            });
            console.error(error);
        }
    };

    return ( <
        Container maxWidth = "sm"
        style = {
            {
                marginTop: '2rem'
            }
        } >
        <
        Typography variant = "h5"
        align = "center"
        gutterBottom >
        For All Shops Setting <
        /Typography> <
        Box component = "form"
        noValidate autoComplete = "off"
        sx = {
            {
                mt: 3
            }
        } >
        <
        TextField label = "Minimum Bet Amount"
        variant = "outlined"
        fullWidth margin = "normal"
        value = {
            minBet
        }
        onChange = {
            (e) => setMinBet(e.target.value)
        }
        /> <
        TextField label = "Minimum Players"
        variant = "outlined"
        fullWidth margin = "normal"
        value = {
            minPlayers
        }
        onChange = {
            (e) => setMinPlayers(e.target.value)
        }
        /> <
        Button variant = "contained"
        color = "primary"
        fullWidth style = {
            {
                marginTop: '1rem'
            }
        }
        onClick = {
            handleSave
        } >
        Save <
        /Button> <
        /Box> <
        Snackbar open = {
            snackbar.open
        }
        autoHideDuration = {
            3000
        }
        onClose = {
            () => setSnackbar({ ...snackbar,
                open: false
            })
        } >
        <
        Alert severity = {
            snackbar.severity
        }
        onClose = {
            () => setSnackbar({ ...snackbar,
                open: false
            })
        } > {
            snackbar.message
        } <
        /Alert> <
        /Snackbar> <
        /Container>
    );
};

export default SetBetSettings;