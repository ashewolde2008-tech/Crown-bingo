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
    setDoc
} from 'firebase/firestore';
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
            } else {
                toast.error('User data not found');
            }

            setOpenSettingsModal(true); // Open the modal
        } catch (error) {
            console.error('Error fetching user data:', error);
            toast.error('Error fetching user data');
        }
    };


    const handleCloseSettingsModal = () => {
        setOpenSettingsModal(false); // Close the modal
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
            toast.success(`User verification ${updatedStatus ? 'enabled' : 'disabled'}`);
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
    const handleEditPoints = async (newPointsData) => {
        try {
            const db = getFirestore();
            const userPointsQuery = query(collection(db, 'points'), where('uid', '==', selectedUser.uid));
            const userPointsSnapshot = await getDocs(userPointsQuery);

            let remainingPoints = 0;
            let addedPoints = newPointsData; // Initialize addedPoints with newPointsData

            if (!userPointsSnapshot.empty) {
                const userPointsDocRef = userPointsSnapshot.docs[0].ref;
                const userPointsData = userPointsSnapshot.docs[0].data();
                remainingPoints = userPointsData.points; // Set remaining points before updating
                addedPoints -= remainingPoints; // Calculate added points
                await updateDoc(userPointsDocRef, {
                    points: newPointsData
                });
            } else {
                const newUserPointsDocRef = doc(db, 'points', selectedUser.uid);
                await setDoc(newUserPointsDocRef, {
                    points: newPointsData
                });
            }

            const historyDocRef = doc(db, 'histories', `${selectedUser.userName}_${Date.now()}`);
            await setDoc(historyDocRef, {
                Username: selectedUser.userName,
                Points_Transferred: newPointsData - pointsData.points, // Save added points
                Remaining_Points: remainingPoints, // Save remaining points
                Date: new Date().toISOString()
            });

            console.log('Points updated successfully');
            setOpenDialog(false); // Close the dialog after updating
            setRefresh(prev => !prev); // Trigger data refresh
        } catch (error) {
            console.error('Error updating points:', error);
        }
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
        StyledTableCell align = "right" > Phone Verification < /StyledTableCell> <
        StyledTableCell align = "right" > Toggle Verification < /StyledTableCell> <
        StyledTableCell align = "right" > Wallet < /StyledTableCell> { /* <StyledTableCell align="right">Edit Phone</StyledTableCell> */ } <
        StyledTableCell align = "right" > User details < /StyledTableCell>

        <
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
                StyledTableCell align = "right" > {
                    user.isVerified !== undefined ?
                    user.isVerified.toString() == 'true' ? 'Verified' : 'Unverified' // Convert boolean to string (true/false)
                    :
                        'Unverified'
                } <
                /StyledTableCell> <
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
                    user.isVerified ? 'Unverify' : 'Verify'
                } <
                /Button> <
                /StyledTableCell> <
                StyledTableCell align = "right" > {
                    user.points
                } < /StyledTableCell> {
                    /* <StyledTableCell align="right">
                                      <IconButton onClick={() => handlePhoneClick(user)}>
                                        <PhoneIcon />
                                      </IconButton>
                                    </StyledTableCell> */
                } <
                StyledTableCell align = "right" >
                <
                IconButton onClick = {
                    () => handleUserDetailsClick(user.id, user.userName)
                } >
                <
                InfoIcon / >
                <
                /IconButton> <
                /StyledTableCell> <
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