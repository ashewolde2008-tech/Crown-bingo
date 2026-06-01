import * as React from 'react';
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
    Card,
    CardContent,
    Grid,
    TextField
} from '@mui/material';
import EditDialog from './EditDialog';
import {
    getFirestore,
    collection,
    getDocs
} from 'firebase/firestore'; // Import Firestore functions
import {
    AdapterDayjs
} from '@mui/x-date-pickers/AdapterDayjs';
import {
    LocalizationProvider
} from '@mui/x-date-pickers/LocalizationProvider';
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
        fontSize: 19,
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

export default function HistoryTable() {
    const [open, setOpen] = React.useState(false);
    const [selectedRow, setSelectedRow] = React.useState(null);
    const [historyData, setHistoryData] = React.useState([]);
    const [startDate, setStartDate] = React.useState(dayjs().startOf('day'));
    const [endDate, setEndDate] = React.useState(dayjs().endOf('day'));
    const adminId = localStorage.getItem('uid');

    // Fetch history data from Firestore
    React.useEffect(() => {
        const fetchHistory = async () => {
            try {
                const db = getFirestore();
                const historyCollection = collection(db, 'history'); // Adjust the collection name
                const historySnapshot = await getDocs(historyCollection);
                const historyData = historySnapshot.docs.map(doc => doc.data());
                setHistoryData(historyData);
            } catch (error) {
                console.error('Error fetching history:', error);
            }
        };

        fetchHistory();
    }, []);

    // Filter history data based on start and end dates
    const filteredHistoryData = historyData.filter(row => {
        if (!startDate || !endDate) return true; // If no date filters are set, return true for all rows
        const rowDate = dayjs(row ?.date);
        console.log(row ?.date);
        return rowDate.isAfter(startDate) && rowDate.isBefore(endDate);
    });


    // Calculate filtered total house earnings
    const filteredTotalEarnings = filteredHistoryData.filter((item) => item.adminId == adminId).reduce((total, row) => {
        // Calculate the earnings for the current row
        const earnings = Math.floor(row.pointsAdded * 100 / row.percent) || 0;

        // Check if earnings is NaN, if so, replace it with 0
        const validEarnings = isNaN(earnings) ? 0 : earnings;

        // Add the valid earnings to the total
        return total + validEarnings;
    }, 0);


    const handleEditClick = (row) => {
        setSelectedRow(row);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleEdit = (editedData) => {
        // Update the row data with editedData
        console.log('Updated row data:', editedData);
    };
    console.log(filteredHistoryData);
    return ( <
            div > { /* Filtered Total Card */ } <
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
            Card sx = {
                {
                    minWidth: 275
                }
            } >
            <
            CardContent >
            <
            Typography variant = "h5"
            component = "div" >
            Filtered Total House Wallet Awarded <
            /Typography> <
            Typography textAlign = {
                'center'
            }
            variant = "h2"
            component = "div" > {
                filteredTotalEarnings.toFixed(2)
            } <
            /Typography> <
            /CardContent> <
            /Card> <
            /Grid> <
            /Grid>

            { /* Date filter */ } <
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
            LocalizationProvider dateAdapter = {
                AdapterDayjs
            } >
            <
            Grid item >
            <
            DatePicker label = "Start Date"
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
                    /LocalizationProvider> <
                    /Grid>

                    <
                    TableContainer component = {
                        Paper
                    } >
                    <
                    Table sx = {
                        {
                            minWidth: 700
                        }
                    }
                    aria-label="customized table" >
                    <
                    TableHead >
                    <
                    TableRow >
                    <
                    StyledTableCell > Date < /StyledTableCell> <
                    StyledTableCell align = "right" > Percent < /StyledTableCell> <
                    StyledTableCell align = "right" > Points Added < /StyledTableCell> <
                    StyledTableCell align = "right" > User Name < /StyledTableCell> <
                    /TableRow> <
                    /TableHead> <
                    TableBody > {
                        filteredHistoryData.filter((item) => item.adminId == adminId).map((row, index) => ( <
                            StyledTableRow key = {
                                index
                            } >
                            <
                            StyledTableCell component = "th"
                            scope = "row" > {
                                dayjs(row ?.date).format('YYYY-MM-DD HH:mm:ss')
                            } <
                            /StyledTableCell>



                            <
                            StyledTableCell align = "right" > {
                                row.percent
                            } < /StyledTableCell> <
                            StyledTableCell align = "right" > {
                                Math.floor(row.pointsAdded * 100 / row.percent)
                            } < /StyledTableCell> <
                            StyledTableCell align = "right" > {
                                row.userName
                            } < /StyledTableCell> <
                            /StyledTableRow>
                        ))
                    } <
                    /TableBody> <
                    /Table> <
                    /TableContainer> <
                    EditDialog open = {
                        open
                    }
                    handleClose = {
                        handleClose
                    }
                    rowData = {
                        selectedRow
                    }
                    handleEdit = {
                        handleEdit
                    }
                    /> <
                    /div>
                );
            }