import React, {
    useState
} from 'react';
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogActions,
    TextField,
    Button,
    Typography,
    Stack
} from '@mui/material';
import axios from 'axios';
import {
    getFirestore,
    updateDoc,
    doc,
    getDoc
} from 'firebase/firestore';
import {
    toast
} from 'react-toastify';

const PhoneVerificationDialog = ({
    isOpen,
    onClose,
    uid
}) => {
    const [initialPhone, setInitialPhone] = useState('');
    const [phone, setPhone] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [actualCode, setActualCode] = useState(null);
    const [isOTPSent, setIsOTPSent] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const db = getFirestore();

    React.useEffect(() => {
        if (isOpen && uid) {
            // Fetch the user's phone number from Firestore
            const fetchUserPhone = async () => {
                try {
                    const userDocRef = doc(db, 'users', uid);
                    const userDoc = await getDoc(userDocRef);
                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        const fetchedPhone = userData.phone || '';
                        setInitialPhone(fetchedPhone);
                        setPhone((prevPhone) => prevPhone || fetchedPhone);
                    } else {
                        toast.error('User not found.');
                        onClose();
                    }
                } catch (error) {
                    console.error('Error fetching user phone:', error);
                    toast.error('An error occurred while fetching user data.');
                }
            };

            fetchUserPhone();
        }
    }, [isOpen, uid, db, onClose]);

    const handleSendOTP = async () => {
        if (phone.length !== 10) {
            toast.error('Phone number must be 10 digits.');
            return;
        }

        setIsLoading(true);
        try {
            const response = await axios.get(
                `https://api.geezsms.com/api/v1/sms/otp?phone=${phone}&token=kRgU9JzGCll8PT0ZGw1bVQG5YHFax6y5`
            );
            if (!response.data.error) {
                toast.success('OTP sent successfully!');
                setActualCode(response.data.code); // Save the OTP code
                setIsOTPSent(true);
            } else {
                toast.error('Failed to send OTP. Please try again.');
            }
        } catch (error) {
            alert('Error')
            console.error('Error sending OTP:', error);
            toast.error('Error sending OTP. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyPhone = async () => {
        if (parseInt(otpCode, 10) === actualCode) {
            toast.success('Phone verified successfully!');
            try {
                const userDocRef = doc(db, 'users', uid);
                const userDoc = await getDoc(userDocRef);

                if (userDoc.exists()) {
                    await updateDoc(userDocRef, {
                        isVerified: true,
                        phone, // Update phone number if it was edited
                    });

                    onClose(); // Close the dialog
                } else {
                    alert('Error')

                    toast.error('User not found.');
                }
            } catch (error) {
                alert('Error')

                console.error('Error verifying phone:', error);
                toast.error('An error occurred during verification.');
            }
        } else {
            alert('Error')

            toast.error('Incorrect OTP. Please try again.');
        }
    };

    return ( <
        Dialog open = {
            isOpen
        }
        onClose = {
            onClose
        } >
        <
        DialogTitle > Phone Verification < /DialogTitle> <
        DialogContent >
        <
        Stack spacing = {
            2
        } >
        <
        Typography variant = "h4" >
        የቢንጎ ሱቁን ባለቤት ስልክ ያስገቡ በስልክ የሚገባዉን OTP ቁጥር አስገብተዉ ያረጋግጡ < /Typography> <
        TextField label = "Phone Number"
        value = {
            phone
        }
        onChange = {
            (e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))
        } // Allow only numeric input
        inputProps = {
            {
                maxLength: 10
            }
        }
        fullWidth margin = "normal" /
        >
        <
        Button variant = "contained"
        onClick = {
            handleSendOTP
        }
        disabled = {
            isOTPSent || isLoading
        } >
        {
            isLoading ? 'Sending OTP...' : isOTPSent ? 'OTP Sent' : 'Send OTP'
        } <
        /Button> {
            isOTPSent && ( <
                >
                <
                TextField label = "Enter OTP"
                value = {
                    otpCode
                }
                onChange = {
                    (e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))
                } // Allow only numeric input
                fullWidth margin = "normal" /
                >
                <
                Button variant = "contained"
                onClick = {
                    handleVerifyPhone
                }
                disabled = {
                    isLoading
                } >
                Verify Phone <
                /Button> <
                />
            )
        } <
        Typography variant = "h6" >
        Prime በሚል ስልክ የተላከዉን ቁጥር ያስገቡ < /Typography> <
        /Stack> <
        /DialogContent> <
        DialogActions >
        <
        Button onClick = {
            onClose
        }
        disabled = {
            isLoading
        } >
        Cancel <
        /Button> <
        /DialogActions> <
        /Dialog>
    );
};

export default PhoneVerificationDialog;