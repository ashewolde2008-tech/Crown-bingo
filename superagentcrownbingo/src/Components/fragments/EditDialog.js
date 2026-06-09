import React, {
    useState,
    useEffect,
    useCallback
} from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import RefreshIcon from '@mui/icons-material/Refresh';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import {
    getFirestore,
    doc,
    onSnapshot,
    runTransaction,
    increment,
    getDoc,
    collection,
    query,
    where,
    getDocs,
    addDoc
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
    const [remainingPoints, setRemainingPoints] = useState(0);
    const [percent, setPercent] = useState(1);
    const [adminPoints, setAdminPoints] = useState(0);
    const [userName, setUserName] = useState('');
    const [loading, setLoading] = useState(false);
    const [balancesLoading, setBalancesLoading] = useState(true);
    const [balanceError, setBalanceError] = useState(null);
    const [userBalanceLoaded, setUserBalanceLoaded] = useState(false);
    const [adminBalanceLoaded, setAdminBalanceLoaded] = useState(false);

    const loadBalances = useCallback(() => {
        const adminUid = localStorage.getItem('uid');
        if (!adminUid) {
            setBalanceError('Admin UID is missing. Please log in again.');
            setBalancesLoading(false);
            return;
        }

        if (!pointsData?.uid) {
            setBalanceError('User ID is missing.');
            setBalancesLoading(false);
            return;
        }

        setBalancesLoading(true);
        setBalanceError(null);
        setUserBalanceLoaded(false);
        setAdminBalanceLoaded(false);

        const db = getFirestore();
        const userRef = doc(db, 'users', pointsData.uid);
        const adminRef = doc(db, 'users', adminUid);

        // User balance (live, with fallback to legacy /points collection)
        const unsubscribeUser = onSnapshot(userRef, (snap) => {
            if (snap.exists()) {
                const userData = snap.data();
                const balance = userData.balance !== undefined ? userData.balance : null;
                if (balance !== null) {
                    setRemainingPoints(balance);
                    setUserBalanceLoaded(true);
                } else {
                    // Fallback: query legacy /points collection
                    const pointsQuery = query(collection(db, 'points'), where('uid', '==', pointsData.uid));
                    getDocs(pointsQuery).then((qs) => {
                        if (!qs.empty) {
                            setRemainingPoints(qs.docs[0].data().points || 0);
                        } else {
                            setRemainingPoints(0);
                        }
                        setUserBalanceLoaded(true);
                    }).catch((e) => {
                        console.warn('Legacy /points fallback failed:', e);
                        setRemainingPoints(0);
                        setUserBalanceLoaded(true);
                    });
                }
                setUserName(userData.userName || userData.username || userData.email || '');
                setPercent(userData.casher_percent !== undefined ? userData.casher_percent : 1);
            } else {
                console.warn('User document not found at users/' + pointsData.uid);
                // Try legacy /points fallback
                const pointsQuery = query(collection(db, 'points'), where('uid', '==', pointsData.uid));
                getDocs(pointsQuery).then((qs) => {
                    if (!qs.empty) {
                        const d = qs.docs[0].data();
                        setRemainingPoints(d.points || 0);
                        setPercent(d.percent || 1);
                        setUserName(d.userName || d.username || d.email || '');
                    } else {
                        setRemainingPoints(0);
                    }
                    setUserBalanceLoaded(true);
                }).catch((e) => {
                    console.warn('Legacy /points fallback failed:', e);
                    setRemainingPoints(0);
                    setUserBalanceLoaded(true);
                });
            }
            setBalancesLoading(false);
        }, (error) => {
            console.error('User snapshot error:', error);
            // Fallback to legacy
            const pointsQuery = query(collection(db, 'points'), where('uid', '==', pointsData.uid));
            getDocs(pointsQuery).then((qs) => {
                if (!qs.empty) {
                    const d = qs.docs[0].data();
                    setRemainingPoints(d.points || 0);
                    setPercent(d.percent || 1);
                    setUserName(d.userName || d.username || d.email || '');
                }
                setUserBalanceLoaded(true);
            }).catch((e) => {
                console.error('Legacy fallback also failed:', e);
                setBalanceError('Cannot load user balance: ' + (error.message || 'unknown error'));
                setUserBalanceLoaded(true);
            });
            setBalancesLoading(false);
        });

        // Admin balance (live)
        const unsubscribeAdmin = onSnapshot(adminRef, (snap) => {
            if (snap.exists()) {
                const balance = snap.data().balance !== undefined ? snap.data().balance : 0;
                setAdminPoints(balance);
                setAdminBalanceLoaded(true);
            } else {
                console.warn('Admin document not found at users/' + adminUid);
                setAdminPoints(0);
                setAdminBalanceLoaded(true);
            }
        }, (error) => {
            console.error('Admin snapshot error:', error);
            setBalanceError('Cannot load admin balance: ' + (error.message || 'unknown error'));
            setAdminBalanceLoaded(true);
        });

        return () => {
            unsubscribeUser();
            unsubscribeAdmin();
        };
    }, [pointsData]);

    useEffect(() => {
        if (!open) {
            setNewPoints('');
            setBalanceError(null);
            return;
        }
        const cleanup = loadBalances();
        return cleanup;
    }, [open, loadBalances]);

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
        if (!navigator.onLine) {
            toast.error('No internet connection. Please check your network.');
            return;
        }

        if (!newPoints || Number(newPoints) <= 0) {
            toast.error('Please enter a valid amount greater than 0.');
            return;
        }

        if (percent < 0 || percent > 100) {
            toast.error('Percent must be between 0 and 100.');
            return;
        }

        if (!pointsData?.uid) {
            toast.error('Cannot update points: user ID is missing.');
            return;
        }

        const adminUid = localStorage.getItem('uid');
        if (!adminUid) {
            toast.error('Admin UID is missing. Please log in again.');
            return;
        }

        if (Number(newPoints) > adminPoints) {
            toast.warning('Insufficient balance: you have ' + adminPoints + ' points, need ' + newPoints + '.');
            return;
        }

        setLoading(true);

        try {
            const db = getFirestore();
            await runTransaction(db, async (transaction) => {
                const userRef = doc(db, 'users', pointsData.uid);
                const adminRef = doc(db, 'users', adminUid);
                const userSnap = await transaction.get(userRef);
                const adminSnap = await transaction.get(adminRef);

                if (!userSnap.exists()) {
                    throw new Error('User not found in users/' + pointsData.uid);
                }
                if (!adminSnap.exists()) {
                    throw new Error('Admin not found in users/' + adminUid);
                }

                const adminBalance = adminSnap.data().balance !== undefined ? adminSnap.data().balance : 0;
                if (Number(newPoints) > adminBalance) {
                    throw new Error('Insufficient balance. You only have ' + adminBalance + ' points.');
                }

                transaction.update(userRef, {
                    balance: increment(Number(newPoints)),
                    casher_percent: Number(percent)
                });
                transaction.update(adminRef, {
                    balance: increment(-Number(newPoints))
                });
            });

            // Write to history collection (outside the transaction to avoid conflicts)
            try {
                const historyCollection = collection(db, 'history');
                await addDoc(historyCollection, {
                    userId: pointsData.uid,
                    userName: userName || '',
                    adminId: adminUid,
                    pointsAdded: Number(newPoints),
                    percent: Number(percent),
                    transactionType: 'editPoints',
                    date: new Date().toISOString()
                });
            } catch (historyErr) {
                console.warn('Failed to write history record (transaction still succeeded):', historyErr);
            }

            handleSave();
            toast.success('Transferred ' + newPoints + ' points to user successfully');
            handleClose();
        } catch (error) {
            console.error('EditDialog save error details:', {
                code: error.code,
                message: error.message,
                stack: error.stack
            });
            if (error.code === 'permission-denied') {
                toast.error('Permission denied. You may not have access to update this user.');
            } else if (error.code === 'not-found') {
                toast.error('User not found in database.');
            } else if (error.code === 'unavailable') {
                toast.error('Cannot reach database. Please check your connection.');
            } else if (error.message && error.message.includes('Failed to fetch')) {
                toast.error('Network error. Please check your connection and try again.');
            } else {
                toast.error('Update failed: ' + (error.message || 'Unknown error'));
            }
        } finally {
            setLoading(false);
        }
    };

    const handleManualRefresh = () => {
        loadBalances();
    };

    const bothLoaded = userBalanceLoaded && adminBalanceLoaded;

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
            <DialogTitle>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <span>Edit Points</span>
                    <IconButton
                        size="small"
                        onClick={handleManualRefresh}
                        disabled={balancesLoading}
                        title="Refresh balances"
                    >
                        <RefreshIcon />
                    </IconButton>
                </Stack>
            </DialogTitle>
            <DialogContent>
                <DialogContentText sx={{ mb: 2 }}>
                    Transfer points from your Super Agent wallet to {userName || 'this user'}.
                </DialogContentText>

                {balanceError && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {balanceError}
                    </Alert>
                )}

                <TextField
                    margin="dense"
                    label="Super Agent Balance (Live)"
                    type="number"
                    fullWidth
                    value={balancesLoading && !adminBalanceLoaded ? '' : adminPoints}
                    placeholder={balancesLoading ? 'Loading…' : '0'}
                    InputProps={{
                        readOnly: true,
                    }}
                    sx={{
                        mb: 1,
                        '& input': {
                            fontFamily: 'monospace',
                            fontSize: '1.25rem',
                            color: '#b8860b',
                            fontWeight: 600,
                        }
                    }}
                />
                <TextField
                    margin="dense"
                    label="User Remaining Points (Live)"
                    type="number"
                    fullWidth
                    value={balancesLoading && !userBalanceLoaded ? '' : remainingPoints}
                    placeholder={balancesLoading ? 'Loading…' : '0'}
                    InputProps={{
                        readOnly: true,
                    }}
                    sx={{
                        mb: 1,
                        '& input': {
                            fontFamily: 'monospace',
                            fontSize: '1.25rem',
                            color: '#b8860b',
                            fontWeight: 600,
                        }
                    }}
                />
                <TextField
                    margin="dense"
                    label="Points to Transfer"
                    type="number"
                    fullWidth
                    value={newPoints}
                    onChange={handlePointsChange}
                    inputProps={{ min: 0 }}
                    disabled={!bothLoaded}
                />
                <TextField
                    margin="dense"
                    label="Percent"
                    type="number"
                    fullWidth
                    value={percent}
                    onChange={handlePercentChange}
                    inputProps={{ min: 0 }}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button
                    onClick={handleSaveClick}
                    disabled={loading || !bothLoaded}
                    variant="contained"
                >
                    {loading ? <CircularProgress size={24} /> : 'Save'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
