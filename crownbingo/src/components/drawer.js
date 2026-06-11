import * as React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import MailIcon from '@mui/icons-material/Mail';
import {
    IconButton,
    Typography
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import {
    useNavigate
} from 'react-router-dom';
import CalendarViewMonthIcon from '@mui/icons-material/CalendarViewMonth';
import GiftIcon from '@mui/icons-material/CardGiftcard';
import {
    getAuth,
    signOut
} from 'firebase/auth';
import {
    doc,
    updateDoc,
    getDoc
} from 'firebase/firestore';
import {
    db
} from '../firebase';
import {
    toast
} from 'react-toastify';
export default function TemporaryDrawer() {
    const [open, setOpen] = React.useState(false);
    const [timeLeft, setTimeLeft] = React.useState('');
    const navigate = useNavigate();

    const toggleDrawer = (newOpen) => () => {
        setOpen(newOpen);
    };

    const handleItemClick = async (text) => {
        if (text === 'Logout') {
            const uid = localStorage.getItem('uid');
            if (uid) {
                try {
                    // Get the user's document reference
                    const userDocRef = doc(db, 'users', uid);
                    const userDoc = await getDoc(userDocRef);

                    if (userDoc.exists()) {
                        // Set isLoggedIn to false
                        await updateDoc(userDocRef, {
                            isLoggedIn: false
                        });
                        localStorage.removeItem('uid');
                        localStorage.removeItem('sessionExpiration'); // Clear session expiration as well

                        // Sign the user out from Firebase auth
                        const auth = getAuth();
                        await signOut(auth);

                        toast.info('You have been logged out');
                        navigate('/');
                    } else {
                        toast.error('User document not found');
                    }
                } catch (error) {
                    toast.error('Logout failed: ' + error.message);
                }
            } else {
                toast.error('User is not logged in');
            }
            return;
        }


        const routeMap = {
            'Dboard': '/Dboard',
            'Jackpot History': '/gameHistory',
            'Win History': '/win-history',
            'Choose Cartela': '/NewGame',
            'View Cartela': '/view-cartela',
            'Transaction': '/transaction'
        };

        const route = routeMap[text];
        if (route) navigate(route);
    };

    // Countdown to the next 5:00 AM
    React.useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date();
            let nextFiveAM = new Date(now);
            nextFiveAM.setHours(5, 0, 0, 0);

            if (now >= nextFiveAM) {
                nextFiveAM.setDate(nextFiveAM.getDate() + 1);
            }

            const diff = nextFiveAM - now;
            const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((diff / (1000 * 60)) % 60);
            const seconds = Math.floor((diff / 1000) % 60);

            setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(timer);
    }, []);

    const DrawerList = ( <
        Box sx = {
            {
                width: 350,
                backgroundColor: 'black',
                height: '100%',
                color: 'white',
                paddingTop: 5
            }
        }
        role = "presentation"
        onClick = {
            toggleDrawer(false)
        } >
        <
        List > {
            ['Choose Cartela'].map((text, index) => ( <
                ListItem key = {
                    text
                }
                disablePadding >
                <
                ListItemButton onClick = {
                    () => handleItemClick(text)
                } >
                <
                ListItemIcon sx = {
                    {
                        color: 'yellow'
                    }
                } >
                <
                CalendarViewMonthIcon / >
                <
                /ListItemIcon> <
                Typography variant = 'h4'
                color = {
                    'white'
                } > {
                    text
                } < /Typography> <
                /ListItemButton> <
                /ListItem>
            ))
        } <
        /List> <
        Divider / >

        <
        ListItem disablePadding >
        <
        ListItemButton onClick = {
            () => handleItemClick('Jackpot Gift')
        } >
        <
        ListItemIcon >
        <
        GiftIcon sx = {
            {
                color: 'green'
            }
        }
        /> <
        /ListItemIcon> <
        ListItemText primary = "Jackpot Gift" / >
        <
        /ListItemButton> <
        /ListItem> <
        Typography variant = "body2"
        color = "gray"
        sx = {
            {
                paddingLeft: 2,
                paddingBottom: 2
            }
        } >
        Time left
        for the next jackpot: {
            timeLeft
        } <
        /Typography>

        <
        /Box>
    );

    return ( <
        div >
        <
        IconButton onClick = {
            toggleDrawer(true)
        } >
        <
        MenuIcon sx = {
            {
                color: 'white',
                height: '40px',
                width: '50px'
            }
        }
        /> <
        /IconButton> <
        Drawer open = {
            open
        }
        onClose = {
            toggleDrawer(false)
        } > {
            DrawerList
        } <
        List sx = {
            {
                backgroundColor: 'black',
                color: 'white'
            }
        } > {
            ["Transaction", "Jackpot History", "Dboard", "Logout"].map((text, index) => ( <
                ListItem key = {
                    text
                }
                disablePadding >
                <
                ListItemButton onClick = {
                    () => handleItemClick(text)
                } >
                <
                ListItemIcon > {
                    index % 2 === 0 ? < InboxIcon / > : < MailIcon / >
                } <
                /ListItemIcon> <
                ListItemText primary = {
                    text
                }
                /> <
                /ListItemButton> <
                /ListItem>
            ))
        } <
        /List> <
        /Drawer> <
        /div>
    );
}
