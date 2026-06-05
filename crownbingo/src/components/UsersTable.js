import React, {
    useState,
    useEffect
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
import Button from '@mui/material/Button';
import {
    getFirestore,
    collection,
    getDocs,
    updateDoc,
    doc
} from 'firebase/firestore';
import {
    toast,
    ToastContainer
} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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

export default function CustomizedTables() {
    const [users, setUsers] = useState([]);
    const [pointsData, setPointsData] = useState([]);
    const db = getFirestore();

    useEffect(() => {
        const fetchData = async () => {
            const usersCollection = collection(db, 'users');
            const usersSnapshot = await getDocs(usersCollection);
            const usersData = usersSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            setUsers(usersData);

            const initialPointsData = usersData.map(user => ({
                uid: user.uid,
                points: user.balance !== undefined ? String(user.balance) : '',
                casher_percent: user.casher_percent !== undefined ? String(user.casher_percent) : ''
            }));
            setPointsData(initialPointsData);
        };

        fetchData();
    }, [db]);

    const handleChange = (e, index) => {
        const {
            name,
            value
        } = e.target;
        setPointsData(prevData => {
            const newData = [...prevData];
            newData[index][name] = value;
            return newData;
        });
    };

    const handleSubmit = async () => {
        try {
            const updatePromises = pointsData
                .filter(data => data.points !== '' || data.casher_percent !== '')
                .map(async (data, index) => {
                    const userDocId = users[index]?.id;
                    if (!userDocId) return;
                    const userDocRef = doc(db, 'users', userDocId);
                    const update = {};
                    if (data.points !== '') update.balance = Number(data.points);
                    if (data.casher_percent !== '') update.casher_percent = Number(data.casher_percent);
                    if (Object.keys(update).length > 0) {
                        await updateDoc(userDocRef, update);
                    }
                });
            await Promise.all(updatePromises);
            toast.success('Balance and casher percent saved successfully');
        } catch (error) {
            console.error('Error saving balance and casher percent:', error);
            toast.error('Failed to save balance and casher percent');
        }
    };
    console.log(users);
    return ( <
        div >
        <
        TableContainer component = {
            Paper
        } >
        <
        Table sx = {
            {
                minWidth: '100%'
            }
        }
        aria-label = "customized table" >
        <
        TableHead >
        <
        TableRow >
        <
        StyledTableCell > Email < /StyledTableCell> <
        StyledTableCell > Current Balance < /StyledTableCell> <
        StyledTableCell align = "right" > Name < /StyledTableCell> <
        StyledTableCell align = "right" > Balance < /StyledTableCell> <
        StyledTableCell align = "right" > Casher Percent < /StyledTableCell> <
        /TableRow> <
        /TableHead> <
        TableBody > {
            users.map((user, index) => ( <
                StyledTableRow key = {
                    index
                } >
                <
                StyledTableCell component = "th"
                scope = "row" > {
                    user.email
                } <
                /StyledTableCell> <
                StyledTableCell component = "th"
                scope = "row" > {
                    user.balance
                } <
                /StyledTableCell> <
                StyledTableCell align = "right" > {
                    user.userName
                } < /StyledTableCell> <
                StyledTableCell align = "right" >
                <
                input type = "text"
                name = "points"
                value = {
                    pointsData[index].points || ''
                }
                onChange = {
                    (e) => handleChange(e, index)
                }
                /> <
                /StyledTableCell> <
                StyledTableCell align = "right" >
                <
                input type = "text"
                name = "casher_percent"
                value = {
                    pointsData[index].casher_percent || ''
                }
                onChange = {
                    (e) => handleChange(e, index)
                }
                /> <
                /StyledTableCell>

                <
                /StyledTableRow>
            ))
        } <
        /TableBody> <
        /Table> <
        div style = {
            {
                marginTop: '20px',
                textAlign: 'center'
            }
        } >
        <
        Button variant = "contained"
        color = "primary"
        onClick = {
            handleSubmit
        } >
        Submit <
        /Button> <
        /div> <
        /TableContainer> <
        ToastContainer / >
        <
        /div>
    );
}