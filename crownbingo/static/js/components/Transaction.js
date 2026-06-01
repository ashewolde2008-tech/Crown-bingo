import * as React from 'react';
import {
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
    Typography,
    TextField,
    Stack,
    Grid,
    Select,
    MenuItem
} from '@mui/material';
import TemporaryDrawer from '../components/drawer';
import {
    getFirestore,
    collection,
    query,
    where,
    getDocs,
    updateDoc,
    doc,
    getDoc
} from 'firebase/firestore';
import {
    LocalizationProvider
} from '@mui/x-date-pickers/LocalizationProvider';
import {
    AdapterDayjs
} from '@mui/x-date-pickers/AdapterDayjs';
import {
    DatePicker
} from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import {
    onSnapshot
} from "firebase/firestore";

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

export default function Transaction() {
    const [userPoints, setUserPoints] = useState([]);
    const [gameHistories, setGameHistories] = useState([]);
    const [selectedPercentage, setSelectedPercentage] = useState(1);
    const [todayIncome, setTodayIncome] = useState(0);
    const [startDate, setStartDate] = useState(dayjs().startOf('day'));
    const [endDate, setEndDate] = useState(dayjs().endOf('day'));
    useEffect(() => {
        const db = getFirestore();
        const uid = localStorage.getItem('uid');
        if (uid) {
            const pointsDoc = doc(db, 'points', uid);
            onSnapshot(pointsDoc, (docSnapshot) => {
                if (docSnapshot.exists()) {
                    const data = docSnapshot.data();
                    setUserPoints(data.points || []);
                    setSelectedPercentage(data.casher_percent || 1);
                }
            });
        }
    }, []);

    const fetchUserData = async () => {
        const db = getFirestore();
        const uid = localStorage.getItem('uid');
        if (uid) {
            const pointsCollection = collection(db, 'history');
            const pointsQuery = query(pointsCollection, where('userId', '==', uid));
            const pointsSnapshot = await getDocs(pointsQuery);
            const pointsData = pointsSnapshot.docs.map(doc => doc.data());
            setGameHistories(pointsData);

            console.log(pointsData);

        }
    };

    useEffect(() => {
        fetchUserData();
    }, []);

    const updatePercentage = async (userUid, newPercentage) => {
        const uid = localStorage.getItem('uid');
        const db = getFirestore();
        const pointsCollection = collection(db, 'points');
        const userQuery = query(pointsCollection, where('uid', '==', uid));
        const userSnapshot = await getDocs(userQuery);

        if (userSnapshot.empty) {
            console.log('No user found with the provided UID');
            return;
        }

        const userDoc = userSnapshot.docs[0];
        const userDocRef = doc(db, 'points', userDoc.id);
        await updateDoc(userDocRef, {
            casher_percent: newPercentage
        });
    };

    const handlePercentageChange = (event) => {
        const percent = event.target.value;
        setSelectedPercentage(percent);
        const uid = localStorage.getItem('uid');
        updatePercentage(uid, percent);
    };

    useEffect(() => {
        const today = new Date();
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const todayEnd = new Date(todayStart);
        todayEnd.setDate(todayEnd.getDate() + 1);

        const todayIncomeTotal = gameHistories
            .filter((history) => history.date ? .seconds >= todayStart.getTime() / 1000 && history.date ? .seconds < todayEnd.getTime() / 1000)
            .reduce((acc, curr) => acc + ((curr.betAmount * curr.cahser_percent / 100)), 0);
        setTodayIncome(todayIncomeTotal);
    }, [gameHistories]);
    const uniqueGameHistories = gameHistories.filter(
        (history, index, self) => index === self.findIndex(h => h.date.seconds === history.date.seconds && h.betAmount === history.betAmount)
    );

    const handleStartDateChange = (newDate) => {
        setStartDate(newDate.startOf('day'));
    };

    const handleEndDateChange = (newDate) => {
        setEndDate(newDate.endOf('day'));
    };

    const filteredGameHistories = uniqueGameHistories.filter((history) => {
        const historyDate = dayjs.unix(history.date ? .seconds);
        return historyDate.isAfter(startDate) && historyDate.isBefore(endDate);
    });


    const sortedGameHistories = [...filteredGameHistories].sort((a, b) => {
        const dateA = dayjs.unix(a.date ? .seconds);
        const dateB = dayjs.unix(b.date ? .seconds);
        return dateB.isAfter(dateA) ? 1 : -1;
    });
    console.log(filteredGameHistories);
    // Calculate filtered total house earnings
    const filteredTotalHouseEarnings = filteredGameHistories.reduce(
        (acc, curr) => acc + ((parseFloat(curr.betAmount) * parseFloat(curr.cahser_percent) / 100)),
        0
    );



    return ( <
        Stack sx = {
            {
                height: '100vh',
                overflow: 'hidden'
            }
        } >
        <
        Grid item xs = {
            3
        }
        sx = {
            {
                backgroundColor: 'black'
            }
        } >
        <
        TemporaryDrawer / >
        <
        /Grid> <
        Stack margin = {
            2
        }
        sx = {
            {
                flex: 1,
                overflow: 'auto'
            }
        } >
        <
        Typography fontWeight = {
            'bold'
        }
        fontSize = {
            35
        } > Transaction History < /Typography>

        {
            /* <Stack direction={'row'} spacing={3}>
                      <Grid sx={{ backgroundColor: '#bbf7d0', borderRadius: 3 }}>
                        <Typography padding={3} fontWeight={'bold'} fontSize={18}>
                          WALLET: {Math.floor(userPoints[0]?.points)}
                        </Typography>
                      </Grid>

                      <Typography textAlign={'left'} padding={3} fontWeight={'bold'} fontSize={18}>
                        Percent
                      </Typography>
                      <Select
                        value={selectedPercentage}
                        onChange={handlePercentageChange}
                        sx={{ backgroundColor: '#bbf7d0', borderRadius: 3 }}
                      >
                        <MenuItem value={20}>20%</MenuItem>
                        <MenuItem value={25}>25%</MenuItem>
                        <MenuItem value={30}>30%</MenuItem>
                        <MenuItem value={35}>35%</MenuItem>
                        <MenuItem value={40}>40%</MenuItem>
                      </Select> 

                      <Grid sx={{ backgroundColor: '#bbf7d0', borderRadius: 3 }}>
                        <Typography padding={3} fontWeight={'bold'} fontSize={18}>
                          Today's Income: {Math.floor(todayIncome)} ETB
                        </Typography>
                      </Grid>

                      <Grid sx={{ backgroundColor: '#bbf7d0', borderRadius: 3 }}>
                        <Typography padding={3} fontWeight={'bold'} fontSize={18}>
                          Filtered Total House Earnings: {filteredTotalHouseEarnings} ETB
                        </Typography>
                      </Grid>
                    </Stack> */
        }

        {
            /* <Stack direction={'row'} spacing={3} marginTop={3}>
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                          label="Start Date"
                          value={startDate}
                          onChange={handleStartDateChange}
                          renderInput={(params) => <TextField {...params} />}
                        />
                        <DatePicker
                          label="End Date"
                          value={endDate}
                          onChange={handleEndDateChange}
                          renderInput={(params) => <TextField {...params} />}
                        />
                      </LocalizationProvider>
                    </Stack> */
        }

        <
        TableContainer component = {
            Paper
        }
        sx = {
            {
                paddingTop: 2,
                maxHeight: '60vh',
                overflow: 'auto'
            }
        } >
        <
        Table stickyHeader aria - label = "customized table" >
        <
        TableHead >
        <
        TableRow >
        <
        StyledTableCell > Date < /StyledTableCell> <
        StyledTableCell > Percent < /StyledTableCell> <
        StyledTableCell align = "right" > Points Added < /StyledTableCell> <
        StyledTableCell align = "right" > UserName < /StyledTableCell> <
        /TableRow> <
        /TableHead> <
        TableBody > {
            gameHistories.map((history, index) => ( <
                StyledTableRow key = {
                    index
                } >
                <
                StyledTableCell component = "th"
                scope = "row" > {
                    dayjs(history.date).format("DD/MM/YYYY HH:mm")
                } { /* Display formatted date */ } <
                /StyledTableCell> <
                StyledTableCell align = "right" > {
                    history.percent
                } < /StyledTableCell> <
                StyledTableCell align = "right" > {
                    history.percent * 100 / history.pointsAdded
                } < /StyledTableCell> <
                StyledTableCell align = "right" > {
                    (history.userName)
                } < /StyledTableCell> <
                /StyledTableRow>
            ))
        } <
        /TableBody> <
        /Table> <
        /TableContainer> <
        /Stack> <
        /Stack>
    );
}