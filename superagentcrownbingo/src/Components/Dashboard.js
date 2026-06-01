import * as React from 'react';
import {
    styled,
    createTheme,
    ThemeProvider
} from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import MuiDrawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

import Paper from '@mui/material/Paper';
import Link from '@mui/material/Link';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import NotificationsIcon from '@mui/icons-material/Notifications';
import {
    mainListItems,
    LogoutListItem
} from '../listItems';
import Deposits from '../Components/fragments/Cards';
import AddIcon from '@mui/icons-material/Add';
import CustomizedTables from './fragments/DashboardTable';
import AddDialog from './fragments/AddUserDialog';
import AddSubDialog from './fragments/AddSubAgentDialog';

import {
    getFirestore,
    collection,
    query,
    where,
    getDocs
} from 'firebase/firestore';
import {
    useEffect,
    useState
} from 'react';
import {
    db
} from '../firebase';
import {
    Refresh
} from '@mui/icons-material';
import HistoryChart from './fragments/HistoryChart';
import img from './dash.jpg'

function Copyright(props) {
    return ( <
        Typography variant = "body2"
        color = "text.secondary"
        align = "center" { ...props
        } > {
            'Copyright © '
        } <
        Link color = "inherit"
        href = "https://habeshagaming.com/" >
        Habeshagaming.com <
        /Link>{' '} {
            new Date().getFullYear()
        } {
            '.'
        } <
        /Typography>
    );
}

const drawerWidth = 240;

const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
})(({
    theme,
    open
}) => ({
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    }),
}));

const Drawer = styled(MuiDrawer, {
    shouldForwardProp: (prop) => prop !== 'open'
})(
    ({
        theme,
        open
    }) => ({
        '& .MuiDrawer-paper': {
            position: 'relative',
            whiteSpace: 'nowrap',
            width: drawerWidth,
            transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
            }),
            boxSizing: 'border-box',
            ...(!open && {
                overflowX: 'hidden',
                transition: theme.transitions.create('width', {
                    easing: theme.transitions.easing.sharp,
                    duration: theme.transitions.duration.leavingScreen,
                }),
                width: theme.spacing(7),
                [theme.breakpoints.up('sm')]: {
                    width: theme.spacing(9),
                },
            }),
        },
    }),
);

const defaultTheme = createTheme();


export default function Dashboard() {
    const [open, setOpen] = React.useState(true);
    const [addDialogOpen, setAddDialogOpen] = React.useState(false);
    const [addDialogAction, setAddDialogAction] = React.useState('');
    const [addSubDialogOpen, setAddSubDialogOpen] = React.useState(false);
    const [addSubDialogAction, setAddSubDialogAction] = React.useState('');
    const [superAgentCount, setSuperAgentCount] = React.useState(0); // State to hold the count of super agents
    const [amount, setAmount] = useState(0); // State to hold the amount
    const [userCount, setUserCount] = useState(0); // State to hold user count

    useEffect(() => {
        const fetchUserCount = async () => {
            try {
                const adminId = localStorage.getItem('uid');
                if (!adminId) {
                    console.error('Admin ID not found in localStorage');
                    return;
                }

                const db = getFirestore();
                const usersQuery = query(
                    collection(db, 'users'),
                    where('adminId', '==', adminId)
                );
                const snapshot = await getDocs(usersQuery);
                setUserCount(snapshot.size); // Set user count based on query results
            } catch (error) {
                console.error('Error fetching user count:', error);
            }
        };

        fetchUserCount();
    }, []);
    React.useEffect(() => {
        const fetchSuperAgentsCount = async () => {
            try {
                const db = getFirestore();
                const usersCollection = collection(db, 'users');
                const superAgentsQuery = query(usersCollection, where('userRole', '==', 'superAgent'));
                const superAgentsSnapshot = await getDocs(superAgentsQuery);
                const superAgentsCount = superAgentsSnapshot.size;
                setSuperAgentCount(superAgentsCount);
            } catch (error) {
                console.error('Error fetching super agents count:', error);
            }
        };

        fetchSuperAgentsCount();
    }, []);

    useEffect(() => {
        const fetchAmount = async () => {
            try {
                const adminId = localStorage.getItem('uid');
                if (!adminId) {
                    console.error('Admin ID not found in localStorage');
                    return;
                }

                const q = query(collection(db, 'points'), where('uid', '==', adminId));
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    const doc = querySnapshot.docs[0];
                    setAmount(doc.data().points);
                    console.log(amount);
                } else {
                    console.warn('No matching documents found');
                }
            } catch (error) {
                console.error('Error fetching amount: ', error);
            }
        };

        fetchAmount();
    }, [addDialogOpen]); // Refresh amount state when dialog is closed

    const toggleDrawer = () => {
        setOpen(!open);
    };

    const handleAddCashier = () => {
        setAddDialogAction('cashier');
        setAddDialogOpen(true);
    };
    const handleAddSubCashier = () => {
        setAddSubDialogAction('subAgent');
        setAddSubDialogOpen(true);
    };

    const handleAddSuperAdmin = () => {
        setAddDialogAction('super admin');
        setAddDialogOpen(true);
    };

    const handleAddDialogClose = () => {
        setAddDialogOpen(false);
    };
    const handleAddSubDialogClose = () => {
        setAddSubDialogOpen(false);
    };

    return ( <
        ThemeProvider theme = {
            defaultTheme
        } >
        <
        Box sx = {
            {
                display: 'flex'
            }
        } >
        <
        CssBaseline / >
        <
        AppBar position = "absolute"
        open = {
            open
        }
        sx = {
            {
                backgroundColor: 'black'
            }
        } >
        <
        Toolbar sx = {
            {
                pr: '24px', // keep right padding when drawer closed
            }
        } >
        <
        IconButton edge = "start"
        color = "inherit"
        aria-label="open drawer"
        onClick = {
            toggleDrawer
        }
        sx = {
            {
                marginRight: '36px',
                ...(open && {
                    display: 'none'
                }),
            }
        } >
        <
        MenuIcon / >
        <
        /IconButton> <
        Typography component = "h1"
        variant = "h6"
        color = "inherit"
        noWrap sx = {
            {
                flexGrow: 1
            }
        } >
        Super Agent Dashboard <
        /Typography> <
        IconButton color = "inherit" >

        <
        /IconButton> <
        /Toolbar> <
        /AppBar> <
        Drawer variant = "permanent"
        open = {
            open
        } >
        <
        Toolbar sx = {
            {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                px: [1],
            }
        } >
        <
        IconButton onClick = {
            toggleDrawer
        } >
        <
        ChevronLeftIcon / >
        <
        /IconButton> <
        /Toolbar> <
        Divider / >
        <
        List component = "nav" > {
            mainListItems
        } <
        Divider sx = {
            {
                my: 1
            }
        }
        /> <
        LogoutListItem / >
        <
        Divider sx = {
            {
                my: 1
            }
        }
        /> <
        Stack padding = {
            2
        } >
        <
        img src = {
            img
        }
        width = {
            200
        }
        height = {
            700
        }
        /></Stack >
        <
        /List> <
        /Drawer> <
        Box component = "main"
        sx = {
            {
                backgroundColor: (theme) =>
                    theme.palette.mode === 'light' ?
                    theme.palette.grey[100] :
                    theme.palette.grey[900],
                flexGrow: 1,
                height: '100vh',
                overflow: 'auto',
            }
        } >
        <
        Toolbar / >
        <
        Container maxWidth = {
            false
        } // Disable maxWidth for full width
        sx = {
            {
                mt: 4,
                mb: 4,
                padding: '10px'
            }
        } >
        <
        Grid container spacing = {
            3
        } >
        <
        Stack width = {
            '100%'
        }
        direction = {
            'row'
        }
        justifyContent = {
            'start'
        }
        paddingLeft = {
            5
        }
        paddingTop = {
            3
        } >
        <
        Deposits title = {
            'Wallet Status'
        }
        amount = {
            amount
        }
        /> <
        Deposits title = {
            'Total Shops'
        }
        amount = {
            userCount
        }
        />

        <
        Stack direction = {
            'row'
        }
        height = {
            "50%"
        }
        spacing = {
            4
        } >
        <
        Button sx = {
            {
                backgroundColor: 'black'
            }
        }
        variant = "contained"
        startIcon = { < Refresh / >
        }
        onClick = {
            () => window.location.reload()
        } >
        Refresh <
        /Button> <
        Button sx = {
            {
                backgroundColor: 'black'
            }
        }
        variant = "contained"
        startIcon = { < AddIcon / >
        }
        onClick = {
            handleAddCashier
        } >
        Add Casher <
        /Button> <
        Button sx = {
            {
                backgroundColor: 'black'
            }
        }
        variant = "contained"
        startIcon = { < AddIcon / >
        }
        onClick = {
            handleAddSubCashier
        } >
        Add Sub Agent <
        /Button>

        <
        /Stack>

        <
        /Stack> <
        Grid paddingTop = {
            5
        }
        paddingLeft = {
            10
        }
        paddingRight = {
            10
        }
        width = {
            '100%'
        } > < HistoryChart / > < /Grid>

        <
        Grid item xs = {
            12
        } >
        <
        Paper sx = {
            {
                p: 2,
                display: 'flex',
                flexDirection: 'column'
            }
        } >
        <
        CustomizedTables / >
        <
        /Paper> <
        /Grid> <
        /Grid> <
        Copyright sx = {
            {
                pt: 4
            }
        }
        /> <
        /Container> <
        /Box> <
        /Box> <
        AddDialog open = {
            addDialogOpen
        }
        handleClose = {
            handleAddDialogClose
        }
        action = {
            addDialogAction
        }
        /> <
        AddSubDialog open = {
            addSubDialogOpen
        }
        handleClose = {
            handleAddSubDialogClose
        }
        action = {
            addSubDialogAction
        }
        /> <
        /ThemeProvider>
    );
}