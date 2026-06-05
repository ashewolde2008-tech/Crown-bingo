import React, {
    useState
} from 'react';
import {
    Container,
    Paper,
    Typography,
    TextField,
    Button
} from '@mui/material';
import {
    getAuth,
    onAuthStateChanged
} from "firebase/auth";
import {
    getFirestore,
    doc,
    setDoc
} from 'firebase/firestore';
import {
    ToastContainer,
    toast
} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
    useNavigate
} from 'react-router-dom';

// Initialize Firestore
const db = getFirestore();

const SavePhoneNumber = () => {
    const navigate = useNavigate();

    const [phoneNumber, setPhoneNumber] = useState('');
    const auth = getAuth();

    const handlePhoneNumberChange = (e) => {
        setPhoneNumber(e.target.value);
    };

    const handleSavePhoneNumber = async (e) => {
        e.preventDefault();

        if (!phoneNumber) {
            toast.error("Phone number is required");
            return;
        }

        onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    // Save phone number to Firestore with the user's UID as the document ID, merging with existing fields
                    const userDocRef = doc(db, 'users', user.uid);

                    await setDoc(userDocRef, {
                        phone: phoneNumber,
                    }, {
                        merge: true
                    }); // Use merge: true to avoid overwriting other fields

                    toast.success("Phone number saved successfully!");
                    navigate('/NewGame');
                } catch (error) {
                    console.error("Error saving phone number:", error);
                    toast.error("Error saving phone number: " + error.message);
                }
            } else {
                toast.error("User is not authenticated");
            }
        });
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
        የዚህን ሱቅ ባለቤት ስልክ ቁጥር ያስገቡ <
        /Typography> <
        form style = {
            {
                width: '100%',
                marginTop: '16px'
            }
        }
        onSubmit = {
            handleSavePhoneNumber
        }
        noValidate >
        <
        TextField variant = "outlined"
        margin = "normal"
        required fullWidth id = "phone"
        label = "Phone Number"
        name = "phone"
        autoComplete = "phone"
        autoFocus value = {
            phoneNumber
        }
        onChange = {
            handlePhoneNumberChange
        }
        /> <
        Button type = "submit"
        fullWidth variant = "contained"
        color = "primary"
        style = {
            {
                marginTop: '24px'
            }
        } >
        Save Phone Number <
        /Button> <
        /form> <
        /Paper> <
        ToastContainer / >
        <
        /Container>
    );
};

export default SavePhoneNumber;