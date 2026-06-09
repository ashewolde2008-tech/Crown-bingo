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
    Stack,
    Grid
} from '@mui/material';
import TemporaryDrawer from '../components/drawer';
import {
    getFirestore,
    collection,
    getDocs
} from 'firebase/firestore';
import dayjs from 'dayjs';


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
    const [gameHistories, setGameHistories] = useState([]);
    const [startDate] = useState(dayjs().startOf('day'));
    const [endDate] = useState(dayjs().endOf('day'));

    const fetchUserData = async () => {
        const db = getFirestore();
        const uid = localStorage.getItem('uid');
        if (uid) {
            const historiesCollection = collection(db, 'users', uid, 'histories');
            const historiesSnapshot = await getDocs(historiesCollection);
            const historiesData = historiesSnapshot.docs.map(d => d.data());
            setGameHistories(historiesData);
        }
    };

    useEffect(() => {
        fetchUserData();
    }, []);

    useEffect(() => {
        const today = new Date();
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const todayEnd = new Date(todayStart);
        todayEnd.setDate(todayEnd.getDate() + 1);

        gameHistories
            .filter((history) => history.date.seconds >= todayStart.getTime() / 1000 && history.date.seconds < todayEnd.getTime() / 1000)
            .reduce((acc, curr) => acc + ((curr.betAmount * curr.cahser_percent / 100)), 0);
    
    }, [gameHistories]);
    const uniqueGameHistories = gameHistories.filter(
        (history, index, self) => index === self.findIndex(h => h.date.seconds === history.date.seconds && h.betAmount === history.betAmount)
    );

    const filteredGameHistories = uniqueGameHistories.filter((history) => {
        const historyDate = dayjs.unix(history.date.seconds);
        return historyDate.isAfter(startDate) && historyDate.isBefore(endDate);
    });


    const sortedGameHistories = [...filteredGameHistories].sort((a, b) => {
        const dateA = dayjs.unix(a.date.seconds);
        const dateB = dayjs.unix(b.date.seconds);
        return dateB.isAfter(dateA) ? 1 : -1;
    });
    console.log(filteredGameHistories);

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
        Table stickyHeader aria-label = "customized table" >
        <
        TableHead >
        <
        TableRow >
        <
        StyledTableCell > Date < /StyledTableCell> <
        StyledTableCell align = "right" > Bet Amount < /StyledTableCell> <
        StyledTableCell align = "right" > House Cut % < /StyledTableCell> <
        StyledTableCell align = "right" > Prize (if won) < /StyledTableCell> <
        StyledTableCell align = "right" > Balance After < /StyledTableCell> <
        /TableRow> <
        /TableHead> <
        TableBody > {
            sortedGameHistories.map((history, index) => ( <
                StyledTableRow key = {
                    index
                } >
                <
                StyledTableCell component = "th"
                scope = "row" > {
                    history.date ? dayjs.unix(history.date.seconds).format("DD/MM/YYYY HH:mm") : ''
                } < /StyledTableCell> <
                StyledTableCell align = "right" > {
                    history.betAmount
                } < /StyledTableCell> <
                StyledTableCell align = "right" > {
                    history.cahser_percent
                } < /StyledTableCell> <
                StyledTableCell align = "right" > {
                    ((history.betAmount || 0) * (history.cahser_percent || 0) / 100).toFixed(2)
                } < /StyledTableCell> <
                StyledTableCell align = "right" > {
                    history.points
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