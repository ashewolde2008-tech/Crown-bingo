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
    MenuItem,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import TemporaryDrawer from '../components/drawer';
import {
    getFirestore,
    collection,
    getDocs,
    updateDoc,
    doc
} from 'firebase/firestore';
import { useUser } from '../UserContext.js';
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

export default function Dboard() {
    const { userData } = useUser();
    const [gameHistories, setGameHistories] = useState([]);
    const [selectedPercentage, setSelectedPercentage] = useState(1);
    const [todayIncome, setTodayIncome] = useState(0);
    const [startDate, setStartDate] = useState(dayjs().startOf('day'));
    const [endDate, setEndDate] = useState(dayjs().endOf('day'));
    const [open, setOpen] = useState(false); // State for modal
    const [lastCalledNumbers, setLastCalledNumbers] = useState([]);

    const wallet = userData ? (userData.balance ?? 0) : 0;

    const fetchHistories = async () => {
        const db = getFirestore();
        const uid = localStorage.getItem('uid');
        if (!uid) return;
        const historiesCollection = collection(db, 'users', uid, 'histories');
        const historiesSnapshot = await getDocs(historiesCollection);
        const historiesData = historiesSnapshot.docs.map(d => d.data());
        setGameHistories(historiesData);
    };

    useEffect(() => {
        if (userData) {
            if (userData.casher_percent !== undefined && userData.casher_percent !== null) {
                setSelectedPercentage(userData.casher_percent);
            }
            fetchHistories();
        }
    }, [userData]);

    const updatePercentage = async (newPercentage) => {
        const uid = localStorage.getItem('uid');
        if (!uid) return;
        const db = getFirestore();
        const userDocRef = doc(db, 'users', uid);
        await updateDoc(userDocRef, {
            casher_percent: newPercentage
        });
    };

    const handlePercentageChange = (event) => {
        const percent = event.target.value;
        setSelectedPercentage(percent);
        updatePercentage(percent);
    };

    useEffect(() => {
        const today = new Date();
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const todayEnd = new Date(todayStart);
        todayEnd.setDate(todayEnd.getDate() + 1);

        const todayIncomeTotal = gameHistories
            .filter((history) => history.date.seconds >= todayStart.getTime() / 1000 && history.date.seconds < todayEnd.getTime() / 1000)
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
        const historyDateSeconds = history.date?.seconds;
        const startSeconds = startDate.unix();
        const endSeconds = endDate.unix();
        return historyDateSeconds >= startSeconds && historyDateSeconds <= endSeconds;
    });

    const sortedGameHistories = [...filteredGameHistories].sort((a, b) => b.date.seconds - a.date.seconds);

    console.log(filteredGameHistories);
    // Calculate filtered total house earnings
    const filteredTotalHouseEarnings = filteredGameHistories.reduce(
        (acc, curr) => acc + ((parseFloat(curr.betAmount) * parseFloat(curr.cahser_percent) / 100)),
        0
    );


    const handleOpenModal = (lastCalledNumbers) => {
        setLastCalledNumbers(lastCalledNumbers);
        setOpen(true);
    };

    // Function to close modal
    const handleCloseModal = () => {
        setOpen(false);
    };
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
            } > Dboard < /Typography> <
            Typography fontWeight = {
                'bold'
            }
            fontSize = {
                18
            } > Now Playing Game# {
                sortedGameHistories.length
            } < /Typography>

            <
            Stack direction = {
                'row'
            }
            spacing = {
                3
            } >
            <
            Grid sx = {
                {
                    backgroundColor: '#bbf7d0',
                    borderRadius: 3
                }
            } >
            <
            Typography padding = {
                3
            }
            fontWeight = {
                'bold'
            }
            fontSize = {
                18
            } >
            WALLET: {
                Math.floor(wallet)
            } <
            /Typography> <
            /Grid>

            <
            Typography textAlign = {
                'left'
            }
            padding = {
                3
            }
            fontWeight = {
                'bold'
            }
            fontSize = {
                18
            } >
            Percent <
            /Typography> <
            Select value = {
                selectedPercentage
            }
            onChange = {
                handlePercentageChange
            }
            sx = {
                {
                    backgroundColor: '#bbf7d0',
                    borderRadius: 3
                }
            } >
            <
            MenuItem value = {
                20
            } > 20 % < /MenuItem> <
            MenuItem value = {
                25
            } > 25 % < /MenuItem> <
            MenuItem value = {
                30
            } > 30 % < /MenuItem> <
            MenuItem value = {
                35
            } > 35 % < /MenuItem> <
            MenuItem value = {
                40
            } > 40 % < /MenuItem> <
            /Select> 

            <
            Grid sx = {
                {
                    backgroundColor: '#bbf7d0',
                    borderRadius: 3
                }
            } >
            <
            Typography padding = {
                3
            }
            fontWeight = {
                'bold'
            }
            fontSize = {
                18
            } >
            Today 's Income: {Math.floor(todayIncome)} ETB <
            /Typography> <
            /Grid>

            <
            Grid sx = {
                {
                    backgroundColor: '#bbf7d0',
                    borderRadius: 3
                }
            } >
            <
            Typography padding = {
                3
            }
            fontWeight = {
                'bold'
            }
            fontSize = {
                18
            } >
            Filtered Total House Earnings: {
                filteredTotalHouseEarnings
            }
            ETB <
            /Typography> <
            /Grid> <
            /Stack>

            <
            Stack direction = {
                'row'
            }
            spacing = {
                3
            }
            marginTop = {
                3
            } >
            <
            LocalizationProvider dateAdapter = {
                AdapterDayjs
            } >
            <
            DatePicker label = "Start Date"
            value = {
                startDate
            }
            onChange = {
                handleStartDateChange
            }
            renderInput = {
                (params) => < TextField { ...params
                }
                />} /
                >
                <
                DatePicker
                label = "End Date"
                value = {
                    endDate
                }
                onChange = {
                    handleEndDateChange
                }
                renderInput = {
                    (params) => < TextField { ...params
                    }
                    />} /
                    >
                    <
                    /LocalizationProvider> <
                    /Stack>

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
                    StyledTableCell > Points < /StyledTableCell> <
                    StyledTableCell align = "right" > Total Bet Amount < /StyledTableCell> <
                    StyledTableCell align = "right" > Percent < /StyledTableCell> <
                    StyledTableCell align = "right" > Total House Earnings < /StyledTableCell> <
                    StyledTableCell align = "center" > Action < /StyledTableCell>

                    <
                    /TableRow> <
                    /TableHead> <
                    TableBody > {
                        sortedGameHistories.map((history, index) => ( <
                            StyledTableRow key = {
                                index
                            } >
                            <
                            StyledTableCell component = "th"
                            scope = "row" >

                            {
                                history.date ? new Date(history.date.seconds * 1000).toLocaleString() : ''
                            } <
                            /StyledTableCell> <
                            StyledTableCell align = "right" > {
                                history.points
                            } < /StyledTableCell> <
                            StyledTableCell align = "right" > {
                                history.betAmount
                            } < /StyledTableCell> <
                            StyledTableCell align = "right" > {
                                history.cahser_percent
                            } < /StyledTableCell> <
                            StyledTableCell align = "right" > {
                                (history.betAmount * history.cahser_percent / 100).toFixed(2)
                            } < /StyledTableCell> <
                            StyledTableCell align = "center" >
                            <
                            Button variant = "contained"
                            color = "primary"
                            onClick = {
                                () => handleOpenModal(history.lastCalledNumbers)
                            } >
                            View Calls <
                            /Button> <
                            /StyledTableCell> <
                            /StyledTableRow>
                        ))
                    } <
                    /TableBody> <
                    /Table> <
                    /TableContainer> <
                    /Stack> <
                    Dialog open = {
                        open
                    }
                    onClose = {
                        handleCloseModal
                    } >
                    <
                    DialogTitle > Last Called Numbers < /DialogTitle> <
                    DialogContent dividers > {
                        lastCalledNumbers.length > 0 ? ( <
                            Stack spacing = {
                                1
                            } > {
                                lastCalledNumbers.map((number, index) => ( <
                                    Typography key = {
                                        index
                                    } > {
                                        number
                                    } < /Typography>
                                ))
                            } <
                            /Stack>
                        ) : ( <
                            Typography > No numbers called in this game. < /Typography>
                        )
                    } <
                    /DialogContent> <
                    DialogActions >
                    <
                    Button onClick = {
                        handleCloseModal
                    }
                    color = "primary" > Close < /Button> <
                    /DialogActions> <
                    /Dialog> <
                    /Stack>
                );
            }