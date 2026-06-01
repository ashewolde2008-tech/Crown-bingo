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
    Typography,
    Stack,
    Button,
    Dialog,
    DialogTitle,
    Grid,
    DialogContent,
    DialogActions
} from '@mui/material';
import TemporaryDrawer from '../components/drawer';
import {
    getFirestore,
    collection,
    query,
    where,
    getDocs
} from 'firebase/firestore';

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

export default function GameHistory() {
    const [jackpotHistories, setJackpotHistories] = useState([]);
    const [open, setOpen] = useState(false);
    const [selectedDetails, setSelectedDetails] = useState(null);

    useEffect(() => {
        const fetchJackpotHistories = async () => {
            const db = getFirestore();
            const uid = localStorage.getItem('uid'); // Get uid from localStorage

            if (uid) {
                try {
                    const jackpotCollection = collection(db, 'jackpotHistory');
                    const jackpotQuery = query(jackpotCollection, where('userId', '==', uid));
                    const jackpotSnapshot = await getDocs(jackpotQuery);

                    const histories = jackpotSnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data(),
                    }));

                    setJackpotHistories(histories);
                } catch (error) {
                    console.error('Error fetching jackpot history:', error);
                }
            }
        };

        fetchJackpotHistories();
    }, []);

    const handleOpenDetails = (details) => {
        setSelectedDetails(details);
        setOpen(true);
    };

    const handleCloseDetails = () => {
        setOpen(false);
        setSelectedDetails(null);
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
        Typography fontWeight = "bold"
        fontSize = {
            35
        } >
        Jackpot History <
        /Typography>

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
        Table stickyHeader aria - label = "customized   table" >
        <
        TableHead >
        <
        TableRow >
        <
        StyledTableCell > Date < /StyledTableCell> <
        StyledTableCell align = "right" > Added Points < /StyledTableCell> <
        StyledTableCell align = "right" > Actions < /StyledTableCell> <
        /TableRow> <
        /TableHead> <
        TableBody > {
            jackpotHistories.map((history, index) => ( <
                StyledTableRow key = {
                    index
                } >
                <
                StyledTableCell component = "th"
                scope = "row" > {
                    history.date ? new Date(history.date).toLocaleString() : 'N/A'
                } <
                /StyledTableCell> <
                StyledTableCell align = "right" > {
                    history.addedPoints
                } < /StyledTableCell> <
                StyledTableCell align = "right" >
                <
                Button variant = "contained"
                color = "primary"
                onClick = {
                    () => handleOpenDetails(history)
                } >
                View Details <
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
            handleCloseDetails
        } >
        <
        DialogTitle > Details < /DialogTitle> <
        DialogContent dividers > {
            selectedDetails ? ( <
                Stack spacing = {
                    1
                } >
                <
                Typography > < strong > Added Points: < /strong> {selectedDetails.addedPoints}</Typography >
                <
                Typography > < strong > Date: < /strong> {new Date(selectedDetails.date).toLocaleString()}</Typography >
                <
                Typography > < strong > User ID: < /strong> {selectedDetails.userId}</Typography >
                <
                /Stack>
            ) : ( <
                Typography > No details available. < /Typography>
            )
        } <
        /DialogContent> <
        DialogActions >
        <
        Button onClick = {
            handleCloseDetails
        }
        color = "primary" >
        Close <
        /Button> <
        /DialogActions> <
        /Dialog> <
        /Stack>
    );
}