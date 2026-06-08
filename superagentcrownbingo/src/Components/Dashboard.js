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
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Link from '@mui/material/Link';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import StorefrontIcon from '@mui/icons-material/Storefront';
import {
    mainListItems,
    LogoutListItem
} from '../listItems';
import AddIcon from '@mui/icons-material/Add';
import CustomizedTables from './fragments/DashboardTable';
import AddDialog from './fragments/AddUserDialog';
import AddSubDialog from './fragments/AddSubAgentDialog';

import {
    getFirestore,
    collection,
    query,
    where,
    getDocs,
    doc,
    onSnapshot
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

function Copyright(props) {
    return (
        <Typography variant="body2" color="text.secondary" align="center" {...props}>
            {'Copyright © '}
            <Link color="inherit" href="#">
                Crown Bingo
            </Link>{' '}
            {new Date().getFullYear()}
            {'.'}
        </Typography>
    );
}

const CrownLogo = () => (
    <svg width="32" height="32" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: 12 }}>
        <defs>
            <linearGradient id="crownGold" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FFD700" />
                <stop offset="100%" stopColor="#D4AF37" />
            </linearGradient>
        </defs>
        <path
            d="M8 22 L18 36 L32 14 L46 36 L56 22 L52 50 L12 50 Z"
            fill="url(#crownGold)"
            stroke="#B8860B"
            strokeWidth="1.5"
            strokeLinejoin="round"
        />
        <rect x="14" y="48" width="36" height="5" fill="url(#crownGold)" stroke="#B8860B" strokeWidth="1" />
        <circle cx="32" cy="22" r="3" fill="#B8860B" />
    </svg>
);

const drawerWidth = 240;

const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    background: 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)',
    borderBottom: '2px solid #D4AF37',
    boxShadow: '0 4px 20px rgba(212, 175, 55, 0.15)',
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
    ({ theme, open }) => ({
        '& .MuiDrawer-paper': {
            position: 'relative',
            whiteSpace: 'nowrap',
            width: drawerWidth,
            transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
            }),
            boxSizing: 'border-box',
            background: 'linear-gradient(180deg, #0f172a 0%, #1a1a2e 100%)',
            color: '#E5E7EB',
            borderRight: '1px solid rgba(212, 175, 55, 0.2)',
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

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#1e3a8a',
            light: '#3b5fc7',
            dark: '#0f172a',
        },
        secondary: {
            main: '#D4AF37',
            light: '#FFD700',
            dark: '#B8860B',
        },
        background: {
            default: '#0f172a',
            paper: '#1a1a2e',
        },
    },
    typography: {
        fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    },
});

const StatCard = ({ title, amount, icon, gradient }) => (
    <Paper
        sx={{
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            background: 'linear-gradient(135deg, #1a1a2e 0%, #1e3a8a 100%)',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
            transition: 'all 0.3s ease-in-out',
            minWidth: 280,
            '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 10px 30px rgba(212, 175, 55, 0.25)',
                borderColor: 'rgba(212, 175, 55, 0.6)',
            },
        }}
    >
        <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography
                sx={{
                    color: '#FFD700',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase',
                }}
            >
                {title}
            </Typography>
            <Box
                sx={{
                    background: 'linear-gradient(135deg, #D4AF37 0%, #FFD700 100%)',
                    borderRadius: '50%',
                  p: 1.2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#0f172a',
                }}
            >
                {icon}
            </Box>
        </Stack>
        <Typography
            component="p"
            variant="h3"
            sx={{
                mt: 2,
                fontWeight: 800,
                background: gradient,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
            }}
        >
            {Math.floor(amount).toLocaleString()}
        </Typography>
    </Paper>
);


export default function Dashboard() {
    const [open, setOpen] = React.useState(true);
    const [addDialogOpen, setAddDialogOpen] = React.useState(false);
    const [addDialogAction, setAddDialogAction] = React.useState('');
    const [addSubDialogOpen, setAddSubDialogOpen] = React.useState(false);
    const [addSubDialogAction, setAddSubDialogAction] = React.useState('');
    const [superAgentCount, setSuperAgentCount] = React.useState(0);
    const [amount, setAmount] = useState(0);
    const [userCount, setUserCount] = useState(0);

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
                setUserCount(snapshot.size);
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
        if (!open) return;
        const adminId = localStorage.getItem('uid');
        if (!adminId) return;
        const userDocRef = doc(db, 'users', adminId);
        const unsub = onSnapshot(userDocRef, (snap) => {
            if (snap.exists()) {
                setAmount(snap.data().balance || 0);
            } else {
                setAmount(0);
            }
        }, (error) => {
            console.error('Error fetching wallet balance:', error);
            setAmount(0);
        });
        return () => unsub();
    }, [addDialogOpen]);

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

    return (
        <ThemeProvider theme={darkTheme}>
            <Box sx={{ display: 'flex' }}>
                <CssBaseline />
                <AppBar position="absolute" open={open} sx={{ background: 'linear-gradient(135deg, #0f172a 0%, #1a1a2e 100%)' }}>
                    <Toolbar sx={{ pr: '24px', minHeight: 96, alignItems: 'center' }}>
                        <IconButton
                            edge="start"
                            color="inherit"
                            aria-label="open drawer"
                            onClick={toggleDrawer}
                            sx={{
                                marginRight: '24px',
                                ...(open && { display: 'none' }),
                            }}
                        >
                            <MenuIcon />
                        </IconButton>
                        <CrownLogo />
                        <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, ml: 2 }}>
                            <Typography
                                component="h1"
                                variant="h6"
                                noWrap
                                sx={{
                                    fontWeight: 700,
                                    letterSpacing: '1px',
                                    background: 'linear-gradient(135deg, #FFD700 0%, #D4AF37 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text',
                                }}
                            >
                                CROWN BINGO · SUPER AGENT
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{
                                    color: '#9CA3AF',
                                    fontSize: '0.85rem',
                                    mt: 0.3,
                                }}
                            >
                                Manage your shops, track your earnings, and grow your Crown Bingo empire.
                            </Typography>
                        </Box>
                        <Box sx={{ display: { xs: 'none', md: 'flex' }, flexDirection: 'column', alignItems: 'flex-end' }}>
                            <Typography
                                variant="subtitle2"
                                sx={{
                                    fontWeight: 700,
                                    background: 'linear-gradient(135deg, #FFD700 0%, #D4AF37 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text',
                                }}
                            >
                                Welcome back, Super Agent
                            </Typography>
                            <Typography
                                variant="caption"
                                sx={{ color: '#9CA3AF', mt: 0.3 }}
                            >
                                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </Typography>
                        </Box>
                    </Toolbar>
                </AppBar>
                <Drawer variant="permanent" open={open}>
                    <Toolbar
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                            px: [1],
                        }}
                    >
                        <IconButton onClick={toggleDrawer} sx={{ color: '#FFD700' }}>
                            <ChevronLeftIcon />
                        </IconButton>
                    </Toolbar>
                    <Divider sx={{ borderColor: 'rgba(212, 175, 55, 0.2)' }} />
                    <List component="nav">
                        {mainListItems}
                        <Divider sx={{ my: 1, borderColor: 'rgba(212, 175, 55, 0.2)' }} />
                        <LogoutListItem />
                        <Divider sx={{ my: 1, borderColor: 'rgba(212, 175, 55, 0.2)' }} />
                    </List>
                </Drawer>
                <Box
                    component="main"
                    sx={{
                        background: 'linear-gradient(135deg, #0f172a 0%, #1a1a2e 100%)',
                        flexGrow: 1,
                        height: '100vh',
                        overflow: 'auto',
                        color: '#E5E7EB',
                    }}
                >
                    <Toolbar sx={{ minHeight: 96 }} />
                    <Container
                        maxWidth={false}
                        sx={{
                            mt: 4,
                            mb: 4,
                            padding: '20px',
                        }}
                    >
                        <Grid container spacing={3} sx={{ mb: 4 }}>
                            <Grid item xs={12} md={6}>
                                <StatCard
                                    title="Wallet Status"
                                    amount={amount}
                                    icon={<AccountBalanceWalletIcon />}
                                    gradient="linear-gradient(135deg, #FFD700 0%, #D4AF37 100%)"
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <StatCard
                                    title="Total Shops"
                                    amount={userCount}
                                    icon={<StorefrontIcon />}
                                    gradient="linear-gradient(135deg, #FFD700 0%, #D4AF37 100%)"
                                />
                            </Grid>
                        </Grid>

                        <Stack
                            direction={{ xs: 'column', sm: 'row' }}
                            spacing={2}
                            sx={{ mb: 4 }}
                        >
                            <Button
                                variant="contained"
                                startIcon={<Refresh />}
                                onClick={() => window.location.reload()}
                                sx={{
                                    background: 'linear-gradient(135deg, #1e3a8a 0%, #2c3e50 100%)',
                                    color: '#FFD700',
                                    fontWeight: 600,
                                    px: 3,
                                    py: 1.2,
                                    boxShadow: '0 4px 12px rgba(30, 58, 138, 0.4)',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #2c3e50 0%, #1e3a8a 100%)',
                                        boxShadow: '0 6px 18px rgba(212, 175, 55, 0.3)',
                                        transform: 'translateY(-2px)',
                                    },
                                }}
                            >
                                Refresh
                            </Button>
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={handleAddCashier}
                                sx={{
                                    background: 'linear-gradient(135deg, #D4AF37 0%, #FFD700 100%)',
                                    color: '#0f172a',
                                    fontWeight: 700,
                                    px: 3,
                                    py: 1.2,
                                    boxShadow: '0 4px 12px rgba(212, 175, 55, 0.4)',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #FFD700 0%, #D4AF37 100%)',
                                        boxShadow: '0 6px 18px rgba(212, 175, 55, 0.5)',
                                        transform: 'translateY(-2px)',
                                    },
                                }}
                            >
                                Add Cashier
                            </Button>
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={handleAddSubCashier}
                                sx={{
                                    background: 'linear-gradient(135deg, #1e3a8a 0%, #3b5fc7 100%)',
                                    color: '#FFD700',
                                    fontWeight: 700,
                                    px: 3,
                                    py: 1.2,
                                    boxShadow: '0 4px 12px rgba(30, 58, 138, 0.4)',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #3b5fc7 0%, #1e3a8a 100%)',
                                        boxShadow: '0 6px 18px rgba(212, 175, 55, 0.3)',
                                        transform: 'translateY(-2px)',
                                    },
                                }}
                            >
                                Add Sub Agent
                            </Button>
                        </Stack>

                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <Paper
                                    sx={{
                                        p: 2,
                                        background: 'linear-gradient(135deg, #1a1a2e 0%, #0f172a 100%)',
                                        border: '1px solid rgba(212, 175, 55, 0.2)',
                                        borderRadius: 3,
                                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                                    }}
                                >
                                    <CustomizedTables />
                                </Paper>
                            </Grid>
                        </Grid>
                        <Copyright sx={{ pt: 4, color: '#9CA3AF' }} />
                    </Container>
                </Box>
            </Box>
            <AddDialog
                open={addDialogOpen}
                handleClose={handleAddDialogClose}
                action={addDialogAction}
            />
            <AddSubDialog
                open={addSubDialogOpen}
                handleClose={handleAddSubDialogClose}
                action={addSubDialogAction}
            />
        </ThemeProvider>
    );
}
