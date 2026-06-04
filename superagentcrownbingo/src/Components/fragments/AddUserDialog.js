import React, {
    useState
} from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import {
    initializeApp
} from 'firebase/app';
import {
    getAnalytics
} from 'firebase/analytics';
import {
    getFirestore,
    collection,
    doc,
    setDoc
} from 'firebase/firestore';
import {
    getAuth,
    createUserWithEmailAndPassword
} from 'firebase/auth';
import {
    toast
} from 'react-toastify';

const firebaseConfig = {
    apiKey: "AIzaSyDPkQnxtMFKApBG5mle9yRsfgxlm5yS3do",
    authDomain: "bingo-27d37-5661f.firebaseapp.com",
    projectId: "bingo-27d37-5661f",
    storageBucket: "bingo-27d37-5661f.firebasestorage.app",
    messagingSenderId: "330815222659",
    appId: "1:330815222659:web:4890bf5cddc728bf29bcb6",
    measurementId: "G-CD4DWDC8SW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

export default function AddDialog({
    open,
    handleClose,
    action
}) {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        userRole: action
    });
    const [loading, setLoading] = useState(false); // State to track loading state of the save button

    const handleChange = (field, value) => {
        setFormData((prevData) => ({
            ...prevData,
            [field]: value,
        }));
    };

    const handleSave = async () => {
        setLoading(true); // Set loading state to true when save button is clicked

        try {
            // Register the user with Firebase Authentication
            const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
            const user = userCredential.user;
            let adminId = localStorage.getItem('uid');
            console.log(localStorage.getItem('gametype'));
            // Add additional user data to Firestore
            await setDoc(doc(db, 'users', user.uid), {
                email: formData.email,
                userName: formData.username,
                phone: formData.phone,
                userRole: 'casher',
                uid: user.uid,
                adminId: adminId,
                gametype: localStorage.getItem('gametype')
            });

            console.log("User registered and data added to Firestore successfully!");
            toast('User registered and data added to Firestore successfully!');
            handleClose(); // Close the dialog after successful registration
        } catch (error) {
            console.error("Error registering user with Firebase Authentication: ", error);
            toast.error("Error registering user. Please try again.");
        } finally {
            setLoading(false); // Set loading state back to false after operation completes
        }
    };

    return ( <
        Dialog open = {
            open
        }
        onClose = {
            handleClose
        } >
        <
        DialogTitle > {
            `Add ${action === 'cashier' ? 'Cashier' : 'Super Admin'}`
        } < /DialogTitle> <
        DialogContent >
        <
        TextField label = "email"
        value = {
            formData.email
        }
        onChange = {
            (e) => handleChange('email', e.target.value)
        }
        fullWidth margin = "normal" /
        >
        <
        TextField label = "username"
        value = {
            formData.username
        }
        onChange = {
            (e) => handleChange('username', e.target.value)
        }
        fullWidth margin = "normal" /
        >
        <
        TextField label = "phone"
        value = {
            formData.phone
        }
        onChange = {
            (e) => handleChange('phone', e.target.value)
        }
        fullWidth margin = "normal" /
        >
        <
        TextField label = "Password"
        value = {
            formData.password
        }
        onChange = {
            (e) => handleChange('password', e.target.value)
        }
        fullWidth margin = "normal" /
        >
        <
        /DialogContent> <
        DialogActions >
        <
        Button onClick = {
            handleClose
        }
        disabled = {
            loading
        } > Cancel < /Button> <
        Button onClick = {
            handleSave
        }
        disabled = {
            loading
        } > {
            loading ? 'Saving...' : 'Save'
        } < /Button> <
        /DialogActions> <
        /Dialog>
    );
}