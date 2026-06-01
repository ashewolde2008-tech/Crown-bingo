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
import {
    getFirestore,
    collection,
    getDocs,
    query,
    where,
    doc,
    getDoc,
    runTransaction,
    addDoc,
    updateDoc
} from 'firebase/firestore';
import {
    useParams
} from 'react-router-dom';
import dayjs from 'dayjs';
import {
    Grid,
    TextField,
    Typography,
    Container,
    Button,
    Box
} from '@mui/material';
import {
    LocalizationProvider
} from '@mui/x-date-pickers/LocalizationProvider';
import {
    DatePicker
} from '@mui/x-date-pickers/DatePicker';
import {
    AdapterDayjs
} from '@mui/x-date-pickers/AdapterDayjs';
import {
    toast
} from 'react-toastify';
import CircularProgress from '@mui/material/CircularProgress';

const StyledTableCell = styled(TableCell)(({
    theme
}) => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: theme.palette.common.black,
        color: theme.palette.common.white,
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 14,
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

export default function UserDetailsPage() {
    const {
        uid,
        name
    } = useParams();
    const [historyData, setHistoryData] = useState([]);
    const [filteredHistoryData, setFilteredHistoryData] = useState([]);
    const [startDate, setStartDate] = useState(dayjs().startOf('day'));
    const [endDate, setEndDate] = useState(dayjs().endOf('day'));
    const [totalCasherProfit, setTotalCasherProfit] = useState(0);
    const [remainingPoints, setRemainingPoints] = useState(0);
    const [adminPoints, setAdminPoints] = useState(0);
    const [percent, setPercent] = useState(0);
    const [newPoints, setNewPoints] = useState(0);
    const [totalPoints, setTotalPoints] = useState(0);

    const [isLoading, setLoading] = useState(false);
    useEffect(() => {
        const fetchUserAndAdminData = async () => {
            try {
                const db = getFirestore();
                const pointsDocRef = doc(db, 'points', uid);
                const pointsDoc = await getDoc(pointsDocRef);
                if (pointsDoc.exists()) {
                    setRemainingPoints(pointsDoc.data().points || 0);
                    setPercent(pointsDoc.data().percent || 0);
                }

                const adminId = localStorage.getItem('uid');
                if (adminId) {
                    const adminDocRef = doc(db, 'points', adminId);
                    const adminDoc = await getDoc(adminDocRef);
                    if (adminDoc.exists()) {
                        setAdminPoints(adminDoc.data().points || 0);
                    }
                }
            } catch (error) {
                console.error('Error fetching user or admin data:', error);
            }
        };

        const fetchHistory = async () => {
            try {
                const db = getFirestore();
                const pointsCollection = collection(db, 'points');
                const pointsQuery = query(pointsCollection, where('uid', '==', uid));
                const pointsSnapshot = await getDocs(pointsQuery);
                const historiesCollection = collection(pointsSnapshot.docs[0].ref, 'histories');
                const historiesSnapshot = await getDocs(historiesCollection);
                const historiesData = historiesSnapshot.docs.map(doc => doc.data());
                setHistoryData(historiesData);
            } catch (error) {
                console.error('Error fetching history:', error);
            }
        };

        fetchUserAndAdminData();
        fetchHistory();
    }, [uid]);

    const handleAddPoints = async () => { 
        if (percent <= 0) {  
            toast.warn('Percent value must be greater than zero.');  
            return; 
        }

         
        const db = getFirestore(); 
        const adminId = localStorage.getItem('uid'); 
        if (!adminId) {  
            toast.error('Admin ID is not available in local storage. Please log in as an admin.');  
            return; 
        }
        let expectedTotal; 
        try {  
            const requiredAdminPoints = (newPoints * 100) / percent;  
            if (adminPoints < requiredAdminPoints) {   
                toast.error('Insufficient points in admin account to complete this transfer.');   
                return;  
            }

              
            setLoading(true);

              
            await runTransaction(db, async (transaction) => {   
                const userDocRef = doc(db, 'points', uid);   
                const adminDocRef = doc(db, 'points', adminId);

                   
                const adminDoc = await transaction.get(adminDocRef);   
                if (!adminDoc.exists()) {    
                    throw new Error('Admin document does not exist');   
                }

                   
                const currentAdminPoints = adminDoc.data().points || 0;   
                if (currentAdminPoints < requiredAdminPoints) {    
                    throw new Error('Admin does not have enough points for the transfer');   
                }

                   
                let userDoc = await transaction.get(userDocRef);


                   
                const totalNewPoints = (userDoc.exists() ? userDoc.data().points : 0) + (newPoints * 100) / percent;   
                transaction.set(userDocRef, {    
                    points: totalNewPoints,
                        percent: percent,
                        uid: uid,
                        casher_percent: 20,
                       
                });
                expectedTotal = totalNewPoints;   
                const updatedAdminPoints = currentAdminPoints - (newPoints * 100) / percent;   
                transaction.update(adminDocRef, {
                    points: updatedAdminPoints
                });  
            });

               // Verification step to ensure user points were updated
              
            const userDocRef = doc(db, 'points', uid);  
            const userSnapshot = await getDoc(userDocRef);  
            const finalUserPoints = userSnapshot.data().points;  
            const expectedUserPoints = (newPoints * 100) / percent;
            console.log(finalUserPoints);
            console.log(expectedTotal);

              
            if (finalUserPoints == expectedTotal) {   
                toast.success('Points updated successfully');

                   
                const historyDocRef = collection(db, 'history');   
                await addDoc(historyDocRef, {    
                    userId: uid,
                        adminId: adminId,
                        userName: name || 'Unknown User',
                        pointsAdded: newPoints,
                        percent: percent,
                        date: new Date().toISOString(),
                       
                });  
            } else {    // Rollback admin points if verification fails
                   
                const adminDocRef = doc(db, 'points', adminId);   
                await updateDoc(adminDocRef, {
                    points: adminPoints
                });   
                toast.error('Error: Verification failed. Admin points have been rolled back.');  
            } 
        } catch (error) {  
            if (error.message.includes('Admin does not have enough points')) {   
                toast.error('Transfer failed: Insufficient admin points.');  
            } else if (error.message.includes('network')) {   
                toast.error('Network error: Please check your internet connection and try again.');  
            } else if (error.message.includes('Admin document does not exist')) {   
                toast.error('Admin account not found. Please verify admin details.');  
            } else {   
                console.error('Error updating points:', error);   
                toast.error('An unexpected error occurred. Please try again.');  
            } 
        } finally {  
            setLoading(false); 
        }
    };


    // Include the ToastContainer in your JSX

    useEffect(() => {
        const filteredData = historyData.filter(history => {
            const rowDate = dayjs.unix(history.date ? .seconds);
            return rowDate.isAfter(startDate) && rowDate.isBefore(endDate);
        });

        setFilteredHistoryData(filteredData);

        const totalProfit = filteredData.reduce((total, history) => {
            return total + (history.betAmount * history.cahser_percent / 100);
        }, 0);

        setTotalCasherProfit(totalProfit);
    }, [historyData, startDate, endDate]);

    return ( <
            LocalizationProvider dateAdapter = {
                AdapterDayjs
            } >
            <
            div >
            <
            Container sx = {
                {
                    marginBottom: 2,
                    justifyContent: 'space-evenly',
                    alignItems: 'centre'
                }
            } >
            <
            Grid container spacing = {
                2
            }
            justifyContent = "center" >
            <
            Grid item xs = {
                12
            }
            md = {
                6
            } >
            <
            Box sx = {
                {
                    backgroundColor: '#f5f5f5',
                    padding: 2,
                    borderRadius: 2,
                    border: '1px solid #ddd',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }
            } >
            <
            Typography variant = "h6"
            color = "primary" >
            User 's Remaining Points: <
            /Typography> <
            Typography variant = "h6"
            color = "secondary" > {
                remainingPoints
            } <
            /Typography> <
            /Box> <
            /Grid> <
            Grid item xs = {
                12
            }
            md = {
                6
            } >
            <
            Box sx = {
                {
                    backgroundColor: '#f5f5f5',
                    padding: 2,
                    borderRadius: 2,
                    border: '1px solid #ddd',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }
            } >
            <
            Typography variant = "h6"
            color = "primary" >
            Admin 's Points: <
            /Typography> <
            Typography variant = "h6"
            color = "secondary" > {
                adminPoints
            } <
            /Typography> <
            /Box> <
            /Grid> <
            /Grid>

            <
            /Container> <
            Box sx = {
                {
                    display: 'flex',
                    flexDirection: {
                        xs: 'column',
                        md: 'row'
                    },
                    gap: 2,
                    alignItems: 'center',
                    backgroundColor: '#fafafa',
                    padding: 2,
                    borderRadius: 2,
                    border: '1px solid #ddd',
                    marginTop: 2,
                }
            } >
            <
            TextField label = "User Percent"
            type = "number"
            value = {
                percent
            }
            onChange = {
                (e) => {
                    const value = Number(e.target.value);
                    if (value >= 0) { // Prevent negative numbers
                        setPercent(value);
                    }
                }
            }
            fullWidth sx = {
                {
                    marginBottom: {
                        xs: 2,
                        md: 0
                    },
                    '& .MuiOutlinedInput-root': {
                        borderRadius: '8px'
                    }
                }
            }
            /> <
            TextField label = "Add Points to User"
            type = "number"
            value = {
                newPoints
            }
            onChange = {
                (e) => {
                    const value = Number(e.target.value);
                    if (value >= 0) { // Prevent negative numbers
                        setNewPoints(value);
                    }
                }
            }
            fullWidth sx = {
                {
                    marginBottom: {
                        xs: 2,
                        md: 0
                    },
                    '& .MuiOutlinedInput-root': {
                        borderRadius: '8px'
                    },
                }
            }
            />

            {
                isLoading ? < CircularProgress / > :
                    <
                    Button
                variant = "contained"
                onClick = {
                    handleAddPoints
                }
                sx = {
                        {
                            padding: '10px 20px',
                            borderRadius: '8px',
                            fontWeight: 'bold',
                            boxShadow: 3,
                            transition: '0.3s',
                            '&:hover': {
                                backgroundColor: '#0055aa',
                                transform: 'scale(1.05)',
                            },
                        }
                    } >
                    Add Points <
                    /Button>} <
                    /Box> <
                    Grid container spacing = {
                        2
                    }
                justifyContent = "center"
                sx = {
                        {
                            marginBottom: 2
                        }
                    } >
                    <
                    Grid item >
                    <
                    DatePicker
                label = "Start Date"
                value = {
                    startDate
                }
                onChange = {
                    (date) => setStartDate(date.startOf('day'))
                }
                renderInput = {
                    (params) => < TextField { ...params
                    }
                    />} /
                    >
                    <
                    /Grid> <
                    Grid item >
                    <
                    DatePicker
                    label = "End Date"
                    value = {
                        endDate
                    }
                    onChange = {
                        (date) => setEndDate(date.endOf('day'))
                    }
                    renderInput = {
                        (params) => < TextField { ...params
                        }
                        />} /
                        >
                        <
                        /Grid> <
                        /Grid>

                        <
                        TableContainer component = {
                            Paper
                        }
                        sx = {
                            {
                                marginTop: 4
                            }
                        } >
                        <
                        Table sx = {
                            {
                                minWidth: 700
                            }
                        }
                        aria - label = "customized table" >
                        <
                        TableHead >
                        <
                        TableRow >
                        <
                        StyledTableCell > Date < /StyledTableCell> <
                        StyledTableCell align = "right" > Bet Amount < /StyledTableCell> <
                        StyledTableCell align = "right" > Points < /StyledTableCell> <
                        StyledTableCell align = "right" > Percent < /StyledTableCell> <
                        StyledTableCell align = "right" > Casher Profit < /StyledTableCell> <
                        /TableRow> <
                        /TableHead> <
                        TableBody > {
                            filteredHistoryData.map((history, index) => ( <
                                StyledTableRow key = {
                                    index
                                } >
                                <
                                StyledTableCell component = "th"
                                scope = "row" > {
                                    history.date ? new Date(history ? .date ? .seconds * 1000).toLocaleString() : ''
                                } <
                                /StyledTableCell> <
                                StyledTableCell align = "right" > {
                                    history.betAmount
                                } < /StyledTableCell> <
                                StyledTableCell align = "right" > {
                                    history ? .points && history ? .points[0] ? .points * 100
                                } < /StyledTableCell> <
                                StyledTableCell align = "right" > {
                                    history.cahser_percent * 100
                                } < /StyledTableCell> <
                                StyledTableCell align = "right" > {
                                    (history.betAmount * history.cahser_percent / 100).toFixed(2)
                                } < /StyledTableCell> <
                                /StyledTableRow>
                            ))
                        } <
                        /TableBody> <
                        /Table> <
                        /TableContainer>

                        <
                        Typography variant = "h6"
                        align = "right"
                        sx = {
                            {
                                marginTop: 2
                            }
                        } >
                        Total Casher Profit: {
                            totalCasherProfit.toFixed(2)
                        } <
                        /Typography> <
                        /div> <
                        /LocalizationProvider>
                    );
                }