import React, {
    useEffect,
    useState
} from 'react';
import {
    styled
} from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, {
    tableCellClasses
} from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import InfoIcon from '@mui/icons-material/Info';
import {
    getFirestore,
    collection,
    getDoc,
    getDocs,
    query,
    where,
    doc,
    updateDoc,
    setDoc,
    runTransaction,
    increment,
    addDoc
} from 'firebase/firestore';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth, db } from '../../firebase';
import EditDialog from './EditDialog'; // Import your EditDialog component
import PhoneIcon from '@mui/icons-material/Phone'; // Import phone icon for editing phone number
import {
    initializeApp
} from "firebase/app";
import {
    getAnalytics
} from "firebase/analytics";
import {
    useNavigate
} from 'react-router-dom';
import {
    EditSharp,
    Block
} from '@mui/icons-material'; // Import Block icon for disabling
import Button from '@mui/material/Button'; // Import Button
import EditPhoneDialog from './editphone';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';

import {
    TextField
} from '@mui/material';
import {
    toast
} from 'react-toastify';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import VerifiedIcon from '@mui/icons-material/Verified';
const StyledTableCell = styled(TableCell)(({
    theme
}) => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: theme.palette.common.black,
        color: theme.palette.common.white,
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 20,
    },
}));

const StyledTableRow = styled(TableRow)(({
    theme
}) => ({
    '&:nth-of-type(odd)': {
        backgroundColor: theme.palette.action.hover,
    },
    '&:last-child td, &:last-child th': {
        border: 0,
    },
}));

export default function CustomizedTables() {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [pointsData, setPointsData] = useState({
        percent: 0,
        points: 0
    });
    const [openDialog, setOpenDialog] = useState(false);
    const [refresh, setRefresh] = useState(false); // Add state for refreshing data
    const [openSettingsModal, setOpenSettingsModal] = useState(false); // State for the settings modal

    const navigate = useNavigate();
    const adminId = localStorage.getItem('uid');
    const [openPhoneDialog, setOpenPhoneDialog] = useState(false); // State for phone dialog
    const [minBetAmount, setMinBetAmount] = useState('');
    const [minPlayers, setMinPlayers] = useState('');
    const [selectedUserForSettings, setSelectedUserForSettings] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [rechargeAmount, setRechargeAmount] = useState('');
    const [editEmail, setEditEmail] = useState('');
    const [editUsername, setEditUsername] = useState('');
    const [editPhone, setEditPhone] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const agentUid = localStorage.getItem('uid');
    const handleSaveUserSettings = async () => {
        if (!selectedUserForSettings) {
            console.error('No user selected for settings update');
            return;
        }

        // Validate minBetAmount
        const betAmount = parseFloat(minBetAmount);
        if (isNaN(betAmount) || betAmount < 10) {
            toast.error('Minimum bet amount must be greater than 10');
            return;
        }

        try {
            setIsLoading(true);
            const db = getFirestore();
            const userDocRef = doc(db, 'users', selectedUserForSettings.uid);

            await updateDoc(userDocRef, {
                minBetAmount: betAmount, // Store as a number
                minPlayers: parseInt(minPlayers, 10) || 0, // Ensure it's a number
            });

            toast.success('User settings saved successfully');
            setOpenSettingsModal(false); // Close the modal after saving
        } catch (error) {
            console.error('Error saving user settings:', error);
            toast.error('Error saving user settings');
        } finally {
            setIsLoading(false);
        }
    };


    const handleEditUserSettingsClick = async (user) => {
        try {
            const db = getFirestore();
            const userDocRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                const userData = userDoc.data();
                setSelectedUserForSettings(user);
                setMinBetAmount(userData.minBetAmount || ''); // Fetch the updated minBetAmount
                setMinPlayers(userData.minPlayers || ''); // Fetch the updated minPlayers
                setEditEmail(userData.email || '');
                setEditUsername(userData.userName || '');
                setEditPhone(userData.phone || '');
            } else {
                toast.error('User data not found');
            }

            setWithdrawAmount('');
            setNewPassword('');
            setOpenSettingsModal(true); // Open the modal
        } catch (error) {
            console.error('Error fetching user data:', error);
            toast.error('Error fetching user data');
        }
    };


    const handleCloseSettingsModal = () => {
        setOpenSettingsModal(false); // Close the modal
        setWithdrawAmount('');
        setRechargeAmount('');
        setEditEmail('');
        setEditUsername('');
        setEditPhone('');
        setNewPassword('');
    };

    const handleWithdraw = async () => {
        if (!selectedUserForSettings) {
            toast.error('No user selected');
            return;
        }
        const amountValue = parseFloat(withdrawAmount);
        if (isNaN(amountValue) || amountValue <= 0) {
            toast.error('Withdraw amount must be greater than 0');
            return;
        }
        if (!agentUid) {
            toast.error('Agent not logged in');
            return;
        }
        try {
            const db = getFirestore();
            const userRef = doc(db, 'users', selectedUserForSettings.uid);
            const agentRef = doc(db, 'users', agentUid);
            await runTransaction(db, async (transaction) => {
                const userSnap = await transaction.get(userRef);
                const agentSnap = await transaction.get(agentRef);
                if (!userSnap.exists()) {
                    throw new Error('User document does not exist');
                }
                if (!agentSnap.exists()) {
                    throw new Error('Agent document does not exist');
                }
                if (agentSnap.data().walletWithdrawEnabled !== true) {
                    throw new Error('Wallet Withdraw is disabled for your account. Ask the admin to enable it in Agent Management → Settings.');
                }
                const userBalance = userSnap.data().balance || 0;
                const newUserBalance = userBalance - amountValue;
                if (newUserBalance < 0) {
                    throw new Error('User has insufficient balance');
                }
                transaction.update(userRef, { balance: increment(-amountValue) });
                transaction.update(agentRef, { balance: increment(amountValue) });
            });
            // History record (outside the transaction)
            try {
                const historyCollection = collection(db, 'history');
                await addDoc(historyCollection, {
                    userId: selectedUserForSettings.uid,
                    userName: selectedUserForSettings.userName || '',
                    adminId: agentUid,
                    pointsAdded: Number(amountValue),
                    percent: 0,
                    transactionType: 'withdraw',
                    date: new Date().toISOString()
                });
            } catch (historyErr) {
                console.warn('Failed to write withdraw history record:', historyErr);
            }
            toast.success(`Withdrew ${amountValue} from ${selectedUserForSettings.userName}`);
            setWithdrawAmount('');
        } catch (error) {
            console.error('Error withdrawing:', error);
            toast.error(error.message || 'Error withdrawing balance');
        }
    };

    const handleRecharge = async () => {
        if (!selectedUserForSettings) {
            toast.error('No user selected');
            return;
        }
        const amountValue = parseFloat(rechargeAmount);
        if (isNaN(amountValue) || amountValue <= 0) {
            toast.error('Recharge amount must be greater than 0');
            return;
        }
        if (!agentUid) {
            toast.error('Agent not logged in');
            return;
        }
        try {
            const db = getFirestore();
            const userRef = doc(db, 'users', selectedUserForSettings.uid);
            const agentRef = doc(db, 'users', agentUid);
            await runTransaction(db, async (transaction) => {
                const userSnap = await transaction.get(userRef);
                const agentSnap = await transaction.get(agentRef);
                if (!userSnap.exists()) {
                    throw new Error('User document does not exist');
                }
                if (!agentSnap.exists()) {
                    throw new Error('Agent (super agent) document does not exist');
                }
                const agentBalance = agentSnap.data().balance || 0;
                if (amountValue > agentBalance) {
                    throw new Error('Insufficient agent balance. You have ' + agentBalance + ' points, need ' + amountValue + '.');
                }
                transaction.update(userRef, { balance: increment(amountValue) });
                transaction.update(agentRef, { balance: increment(-amountValue) });
            });
            // History record (outside the transaction)
            try {
                const historyCollection = collection(db, 'history');
                await addDoc(historyCollection, {
                    userId: selectedUserForSettings.uid,
                    userName: selectedUserForSettings.userName || '',
                    adminId: agentUid,
                    pointsAdded: Number(amountValue),
                    percent: 0,
                    transactionType: 'recharge',
                    date: new Date().toISOString()
                });
            } catch (historyErr) {
                console.warn('Failed to write recharge history record:', historyErr);
            }
            toast.success(`Recharged ${amountValue} to ${selectedUserForSettings.userName}`);
            setRechargeAmount('');
            setRefresh(prev => !prev);
        } catch (error) {
            console.error('Error recharging:', error);
            toast.error(error.message || 'Error recharging balance');
        }
    };

    const handleSaveAccountChanges = async () => {
        if (!selectedUserForSettings) {
            toast.error('No user selected');
            return;
        }
        try {
            const db = getFirestore();
            const userRef = doc(db, 'users', selectedUserForSettings.uid);
            await updateDoc(userRef, {
                email: editEmail,
                userName: editUsername,
                phone: editPhone,
            });
            toast.success('Account changes saved');
            setRefresh(prev => !prev);
        } catch (error) {
            console.error('Error saving account changes:', error);
            toast.error('Error saving account changes');
        }
    };

    const handleSendPasswordReset = async () => {
        const targetEmail = editEmail || (selectedUserForSettings && selectedUserForSettings.email);
        if (!targetEmail) {
            toast.error('No email on file for this user');
            return;
        }
        try {
            await sendPasswordResetEmail(auth, targetEmail);
            toast.success(`Password reset email sent to ${targetEmail}`);
        } catch (error) {
            console.error('Error sending password reset:', error);
            toast.error(error.message || 'Error sending password reset email');
        }
    };

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const db = getFirestore();
                const usersCollection = collection(db, 'users');
                const usersSnapshot = await getDocs(usersCollection);
                const usersData = usersSnapshot.docs.map(doc => ({
                    id: doc.id,
                    uid: doc.id,
                    ...doc.data()
                })); // Include the UID from document id

                const usersWithPoints = await Promise.all(
                    usersData.map(async (user) => {
                        const pointsCollection = collection(db, 'points');
                        const pointsQuery = query(pointsCollection, where('uid', '==', user.uid));
                        const pointsSnapshot = await getDocs(pointsQuery);
                        let points = 0;
                        if (!pointsSnapshot.empty) {
                            points = pointsSnapshot.docs[0].data().points;
                        }
                        return { ...user,
                            points
                        };
                    })
                );

                setUsers(usersWithPoints);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };

        fetchUsers();
    }, [adminId, refresh]); // Fetch users when adminId or refresh state changes
    const handlePhoneClick = (user) => {
        setSelectedUser(user);
        setOpenPhoneDialog(true);
    };

    const handleClosePhoneDialog = () => {
        setOpenPhoneDialog(false);
    }
    const handleInfoClick = async (user) => {
        setSelectedUser(user);
        const db = getFirestore();
        const pointsCollection = collection(db, 'points');
        const pointsQuery = query(pointsCollection, where('uid', '==', user.uid));
        const pointsSnapshot = await getDocs(pointsQuery);
        if (!pointsSnapshot.empty) {
            const pointsData = pointsSnapshot.docs[0].data();
            setPointsData({ ...pointsData,
                uid: user.uid
            }); // Include the UID property
        } else {
            setPointsData({
                percent: 0,
                points: 0,
                uid: user.uid
            }); // Include the UID property
        }
        setOpenDialog(true);
    };
    const handleToggleIsLoggedIn = async (user) => {
        try {
            const db = getFirestore();
            const userDocRef = doc(db, 'users', user.uid);
            const updatedStatus = !user.isLoggedIn;
            await updateDoc(userDocRef, {
                isLoggedIn: updatedStatus
            });
            setRefresh(prev => !prev);
        } catch (error) {
            console.error('Error toggling isLoggedIn:', error);
        }
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setRefresh(prev => !prev); // Trigger data refresh
    };

    const handleDisableUser = async (user) => {
        try {
            const db = getFirestore();
            const userDocRef = doc(db, 'users', user.uid);
            const updatedStatus = !user.isDisabled; // Toggle the user's disabled status
            await updateDoc(userDocRef, {
                isDisabled: updatedStatus
            });
            setRefresh(prev => !prev); // Refresh the data to update the table
        } catch (error) {
            console.error('Error disabling user:', error);
        }
    };

    const handleToggleIsVerified = async (user) => {
        try {
            const db = getFirestore();
            const userDocRef = doc(db, 'users', user.uid);
            const updatedStatus = !user.isVerified; // Toggle the user's verification status
            await updateDoc(userDocRef, {
                isVerified: updatedStatus
            });
            setRefresh(prev => !prev); // Refresh the data to update the table
            toast.success(`User is now ${updatedStatus ? 'Verified' : 'Unverified'}`);
        } catch (error) {
            console.error('Error toggling isVerified:', error);
            toast.error('Error updating verification status');
        }
    };
    const handleSavePhone = async (updatedPhone) => {
        try {
            const db = getFirestore();
            const userDocRef = doc(db, 'users', selectedUser.uid);
            await updateDoc(userDocRef, {
                phone: updatedPhone
            });
            setUsers((prevUsers) =>
                prevUsers.map((user) =>
                    user.uid === selectedUser.uid ? { ...user,
                        phone: updatedPhone
                    } : user
                )
            );
            setOpenPhoneDialog(false);
            setRefresh((prev) => !prev); // Refresh to reflect changes
        } catch (error) {
            console.error('Error updating phone number:', error);
        }
    };
    const handleEditPoints = () => {
        setOpenDialog(false);
        setRefresh(prev => !prev);
    };

    const handleUserDetailsClick = (uid, name) => {
        navigate(`/user-details/${uid}/${name}`);
    };

    return ( <
        div >
        <
        TableContainer component = {
            Paper
        }
        sx = {
            {
                width: '100%'
            }
        } >
        <
        Table sx = {
            {
                minWidth: 1000
            }
        }
        aria-label="customized table" >
        <
        TableHead >
        <
        TableRow >
        <
        StyledTableCell > Email < /StyledTableCell> <
        StyledTableCell align = "right" > Username < /StyledTableCell> <
        StyledTableCell align = "right" > User Role < /StyledTableCell> <
        StyledTableCell align = "right" > Phone < /StyledTableCell> <
        StyledTableCell align = "right" > Toggle Verification < /StyledTableCell> <
        StyledTableCell align = "right" > Wallet < /StyledTableCell> <
        StyledTableCell align = "right" > Edit Settings < /StyledTableCell> <
        StyledTableCell align = "right" > Disable User < /StyledTableCell> <
        StyledTableCell align = "right" > isLoggedIn < /StyledTableCell> <
        /TableRow> <
        /TableHead> <
        TableBody > {
            users.filter((item) => item.adminId === adminId).map((user, index) => ( <
                StyledTableRow key = {
                    index
                } >
                <
                StyledTableCell component = "th"
                scope = "row" > {
                    user.email
                } < /StyledTableCell> <
                StyledTableCell sx = {
                    {
                        fontSize: 30
                    }
                }
                align = "right" > {
                    user.isVerified ? ( <
                        Box sx = {
                            {
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 1
                            }
                        } >
                        <
                        Typography > {
                            user.userName
                        } < /Typography> <
                        VerifiedIcon sx = {
                            {
                                color: 'green'
                            }
                        }
                        /> <
                        /Box>
                    ) : (
                        user.userName
                    )
                } <
                /StyledTableCell>                <StyledTableCell sx={{ fontSize: 30 }} align="right">{user.userRole}</StyledTableCell >
                <
                StyledTableCell align = "right" > {
                    user.phone || 'N/A'
                } < /StyledTableCell> <
                StyledTableCell align = "right" >
                <
                Button variant = "contained"
                color = {
                    user.isVerified ? 'success' : 'warning'
                }
                onClick = {
                    () => handleToggleIsVerified(user)
                }
                startIcon = { < VerifiedIcon / >
                } >
                {
                    user.isVerified ? 'Unverified' : 'Verified'
                } <
                /Button> <
                /StyledTableCell> <
                StyledTableCell align = "right" > {
                    user.balance ?? user.points ?? 0} < /StyledTableCell> {
                    /* <StyledTableCell align="right">
                                      <IconButton onClick={() => handlePhoneClick(user)}>
                                        <PhoneIcon />
                                      </IconButton>
                                    </StyledTableCell> */
                } <
                StyledTableCell align = "right" >
                <
                Button sx = {
                    {
                        backgroundColor: 'blac'
                    }
                }
                variant = "contained"
                onClick = {
                    () => handleEditUserSettingsClick(user)
                } >
                Edit Settings <
                /Button> <
                /StyledTableCell> <
                StyledTableCell align = "right" >
                <
                Button variant = "contained"
                color = {
                    user.isDisabled ? 'secondary' : 'primary'
                }
                onClick = {
                    () => handleDisableUser(user)
                } >
                {
                    user.isDisabled ? 'Enable' : 'Disable'
                } <
                /Button> <
                /StyledTableCell> <
                StyledTableCell align = "right" >
                <
                Button variant = "contained"
                color = {
                    user.isLoggedIn ? 'primary' : 'secondary'
                }
                onClick = {
                    () => handleToggleIsLoggedIn(user)
                } >
                {
                    user.isLoggedIn ? 'Logout' : 'Login'
                } <
                /Button> <
                /StyledTableCell> <
                /StyledTableRow>
            ))
        } <
        /TableBody> <
        /Table> <
        /TableContainer>

        { /* Dialog for Editing User Settings */ }


        {
            selectedUser && ( <
                EditPhoneDialog open = {
                    openPhoneDialog
                }
                phone = {
                    selectedUser.phone || ''
                }
                handleClose = {
                    handleClosePhoneDialog
                }
                handleSave = {
                    handleSavePhone
                }
                />
            )
        }

        <
        EditDialog open = {
            openDialog
        }
        pointsData = {
            pointsData
        }
        handleClose = {
            handleCloseDialog
        }
        handleSave = {
            handleEditPoints
        }
        /> <
        Dialog open = {
            openSettingsModal
        }
        onClose = {
            handleCloseSettingsModal
        }
        fullWidth maxWidth = "sm" >
        <
        DialogTitle > Edit Settings
        for: {
            selectedUserForSettings ?.userName
        } < /DialogTitle> <
        DialogContent >
        <
        TextField label = "Min Bet Amount"
        value = {
            minBetAmount
        }
        onChange = {
            (e) => setMinBetAmount(e.target.value)
        }
        type = "number"
        helperText = "Must be greater than 10"
        fullWidth variant = "outlined"
        style = {
            {
                marginBottom: 10
            }
        }
        error = {
            minBetAmount && parseFloat(minBetAmount) < 10
        }
        />

        <
        TextField label = "Min Players"
        value = {
            minPlayers
        }
        onChange = {
            (e) => setMinPlayers(e.target.value)
        }
        fullWidth variant = "outlined" /
        >

        <
        Divider sx = {
            {
                my: 2
            }
        }
        />

        <
        Box sx = {
            {
                my: 2
            }
        } >
        <
        Typography variant = "subtitle1"
        fontWeight = "bold" > Wallet Recharge < /Typography> <
        TextField label = "Amount"
        value = {
            rechargeAmount
        }
        onChange = {
            (e) => setRechargeAmount(e.target.value)
        }
        type = "number"
        helperText = "Amount to recharge from your Super Agent wallet into this user/agent wallet"
        fullWidth variant = "outlined"
        style = {
            {
                marginTop: 10,
                marginBottom: 10
            }
        }
        /> <
        Button variant = "contained"
        color = "success"
        onClick = {
            handleRecharge
        } > Recharge < /Button> <
        /Box>

        <
        Divider sx = {
            {
                my: 2
            }
        }
        />

        <
        Box sx = {
            {
                my: 2
            }
        } >
        <
        Typography variant = "subtitle1"
        fontWeight = "bold" > Wallet Withdraw < /Typography> <
        TextField label = "Amount"
        value = {
            withdrawAmount
        }
        onChange = {
            (e) => setWithdrawAmount(e.target.value)
        }
        type = "number"
        helperText = "Amount to withdraw from user into agent wallet"
        fullWidth variant = "outlined"
        style = {
            {
                marginTop: 10,
                marginBottom: 10
            }
        }
        /> <
        Button variant = "contained"
        color = "primary"
        onClick = {
            handleWithdraw
        } > Withdraw < /Button> <
        /Box>

        <
        Divider sx = {
            {
                my: 2
            }
        }
        />

        <
        Box sx = {
            {
                my: 2
            }
        } >
        <
        Typography variant = "subtitle1"
        fontWeight = "bold" > Edit User / Agent Account < /Typography> <
        TextField label = "Email"
        value = {
            editEmail
        }
        onChange = {
            (e) => setEditEmail(e.target.value)
        }
        fullWidth variant = "outlined"
        style = {
            {
                marginTop: 10,
                marginBottom: 10
            }
        }
        /> <
        TextField label = "Username"
        value = {
            editUsername
        }
        onChange = {
            (e) => setEditUsername(e.target.value)
        }
        fullWidth variant = "outlined"
        style = {
            {
                marginBottom: 10
            }
        }
        /> <
        TextField label = "Phone"
        value = {
            editPhone
        }
        onChange = {
            (e) => setEditPhone(e.target.value)
        }
        fullWidth variant = "outlined"
        style = {
            {
                marginBottom: 10
            }
        }
        /> <
        Button variant = "contained"
        color = "primary"
        onClick = {
            handleSaveAccountChanges
        } > Save Changes < /Button> <
        /Box>

        <
        Divider sx = {
            {
                my: 2
            }
        }
        />

        <
        Box sx = {
            {
                my: 2
            }
        } >
        <
        Typography variant = "subtitle1"
        fontWeight = "bold" > Reset Password < /Typography> <
        TextField label = "New Password"
        value = {
            newPassword
        }
        onChange = {
            (e) => setNewPassword(e.target.value)
        }
        type = "password"
        helperText = "Min 6 chars. Sends a reset email to the user."
        fullWidth variant = "outlined"
        style = {
            {
                marginTop: 10,
                marginBottom: 10
            }
        }
        /> <
        Button variant = "contained"
        color = "secondary"
        onClick = {
            handleSendPasswordReset
        } > Send Reset Email < /Button> <
        /Box>

        <
        /DialogContent> <
        DialogActions >
        <
        Button onClick = {
            handleCloseSettingsModal
        }
        color = "secondary" >
        Cancel <
        /Button> <
        Button onClick = {
            handleSaveUserSettings
        }
        color = "primary"
        disabled = {
            isLoading
        } > {
            isLoading ? 'Saving...' : 'Save'
        } <
        /Button> <
        /DialogActions> <
        /Dialog> <
        /div>
    );
}



