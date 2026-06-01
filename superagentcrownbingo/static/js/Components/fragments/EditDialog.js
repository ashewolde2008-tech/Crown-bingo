import React, {
    useState,
    useEffect
} from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import {
    getFirestore,
    collection,
    doc,
    updateDoc,
    setDoc,
    addDoc,
    query,
    where,
    getDocs
} from 'firebase/firestore';
import {
    toast
} from 'react-toastify';

export default function EditDialog({
    open,
    pointsData,
    handleClose,
    handleSave
}) {
    const [newPoints, setNewPoints] = useState('');
    const [remainingPoints, setRemainingPoints] = useState(pointsData ? .points);
    const [percent, setPercent] = useState(pointsData ? .percent || 1);
    const [adminPoints, setAdminPoints] = useState(0);
    const [userName, setUserName] = useState('');
    const [loading, setLoading] = useState(false);

    const adminId = localStorage.getItem('uid');

    useEffect(() => {
        setRemainingPoints(pointsData ? .points);
        setPercent(pointsData ? .percent || 1);

        const fetchAdminPointsAndUserName = async () => {
            try {
                const db = getFirestore();

                if (!adminId) {
                    console.error("Admin ID is undefined.");
                    return;
                }

                const q = query(collection(db, 'points'), where('uid', '==', adminId));
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    const adminDoc = querySnapshot.docs[0];
                    setAdminPoints(adminDoc.data().points);
                } else {
                    console.warn('No matching documents found for admin');
                }

                if (!pointsData ? .uid) {
                    console.error("PointsData UID is undefined.");
                    return;
                }

                const userQuery = query(collection(db, 'users'), where('uid', '==', pointsData.uid));
                const userSnapshot = await getDocs(userQuery);
                if (!userSnapshot.empty) {
                    const userDoc = userSnapshot.docs[0];
                    setUserName(userDoc.data().userName);
                } else {
                    console.warn('No matching documents found for user');
                }
            } catch (error) {
                console.error('Error fetching admin points or user name:', error);
            }
        };

        fetchAdminPointsAndUserName();
    }, [pointsData, adminId]);


    const handlePointsChange = (event) => {
        const value = Number(event.target.value);
        if (value >= 0) {
            setNewPoints(value);
        }
    };

    const handlePercentChange = (event) => {
        const value = Number(event.target.value);
        if (value >= 0) {
            setPercent(value);
        }
    };

    const handleSaveClick = async () => {
        // Check for a stable internet connection
        if (!navigator.onLine) {
            console.error('No internet connection detected.');
            toast.error('Please check your internet connection and try again.');
            return;
        }

        if (!newPoints || percent <= 0) {
            console.error('Invalid points or percentage provided.');
            toast.error('Points and percent must be positive values.');
            return;
        }

        setLoading(true);

        try {
            const updatedUserPoints = remainingPoints + (newPoints * 100) / percent;
            const updatedAdminPoints = adminPoints - (newPoints * 100) / percent;

            if (updatedAdminPoints < 0) {
                toast.error('Insufficient points for admin to give');
                setLoading(false);
                return;
            }

            const db = getFirestore();
            const adminPointsDocRef = doc(db, 'points', adminId);
            const userPointsDocRef = doc(db, 'points', pointsData.uid);

            // Step 1: Deduct points from admin
            await updateDoc(adminPointsDocRef, {
                points: updatedAdminPoints
            });
            console.log('Admin points deducted successfully');

            // Step 2: Try to update user points
            try {
                await setDoc(userPointsDocRef, {
                    points: updatedUserPoints,
                    percent: percent,
                    uid: pointsData.uid,
                    casher_percent: 20
                }, {
                    merge: true
                });
                console.log('User points updated successfully');

                // Step 3: Add to history if user points update is successful
                const historyDocRef = collection(db, 'history');
                await addDoc(historyDocRef, {
                    userId: pointsData.uid,
                    adminId: adminId,
                    userName: userName,
                    pointsAdded: newPoints,
                    percent: percent,
                    date: new Date().toISOString()
                });
                console.log('History saved successfully');

                // Reflect changes in the UI
                handleSave(updatedUserPoints);
                setRemainingPoints(Math.floor(updatedUserPoints));
                setAdminPoints(updatedAdminPoints);
                toast.success('Points Updated Successfully');
                handleClose();
            } catch (userUpdateError) {
                // Rollback admin points if user points update fails
                console.error('Failed to update user points. Rolling back admin points:', userUpdateError);
                await updateDoc(adminPointsDocRef, {
                    points: adminPoints
                });
                toast.error('Failed to update user points. No points deducted from admin.');
            }
        } catch (error) {
            console.error('Error updating points:', error);
            toast.error('Something went wrong. Points were not updated.');
        } finally {
            setLoading(false);
        }
    };





    useEffect(() => {
        if (!open) {
            setNewPoints('');
        }
    }, [open]);

    return ( <
        Dialog open = {
            open
        }
        onClose = {
            handleClose
        } >
        <
        DialogTitle > Edit Points < /DialogTitle> <
        DialogContent >
        <
        DialogContentText >
        Update the points
        for the selected user. <
        /DialogContentText> <
        TextField margin = "dense"
        label = "Remaining Points"
        type = "number"
        fullWidth value = {
            Math.floor(remainingPoints)
        }
        InputProps = {
            {
                readOnly: true,
            }
        }
        /> <
        TextField margin = "dense"
        label = "Add Points"
        type = "number"
        fullWidth value = {
            newPoints
        }
        onChange = {
            handlePointsChange
        }
        inputProps = {
            {
                min: 0
            }
        }
        /> <
        TextField margin = "dense"
        label = "Percent"
        type = "number"
        fullWidth value = {
            percent
        }
        onChange = {
            handlePercentChange
        }
        inputProps = {
            {
                min: 0
            }
        }
        /> <
        /DialogContent> <
        DialogActions >
        <
        Button onClick = {
            handleClose
        } > Cancel < /Button> <
        Button onClick = {
            handleSaveClick
        }
        disabled = {
            loading
        } > {
            loading ? < CircularProgress size = {
                24
            }
            /> : 'Save'} <
            /Button> <
            /DialogActions> <
            /Dialog>
        );
    }