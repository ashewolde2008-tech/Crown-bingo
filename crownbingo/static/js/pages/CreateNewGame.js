import * as React from 'react';
import {
    useState,
    useEffect
} from 'react';
import {
    Typography,
    TextField,
    Button,
    Grid,
    Stack,
    Box
} from '@mui/material';
import TemporaryDrawer from '../components/drawer';
import {
    useNavigate
} from 'react-router-dom';
import './NumberGenerator.css';
import {
    toast
} from 'react-toastify';
import Switch from '@mui/material/Switch';
import useTranslation from './useTranslation';
import logo from './kkk.jpg'
import VegasWheel from './bingo1';
import BoorioPoker from './bingo2';
import {
    getFirestore,
    doc,
    getDoc
} from 'firebase/firestore';
import {
    db
} from '../firebase';
import UpdatePassword from './updatePass';
export default function NumberGenerator() {
    const [generatedNumbers, setGeneratedNumbers] = useState([]);
    const [checked, setChecked] = React.useState(false);
    const {
        t
    } = useTranslation();

    const handleChange = (event) => {
        setChecked(event.target.checked);
    };
    const [clickedNumbers, setClickedNumbers] = useState(
        JSON.parse(localStorage.getItem('clickedNumbers')) || []
    );
    const [betAmount, setBetAmount] = useState(localStorage.getItem('betAmount') || '');
    const clearGameStorage = () => {
        localStorage.removeItem('isGameStarted');
        localStorage.removeItem('calledNumbers');
    };
    const navigate = useNavigate();
    const [minBetAmount, setMinBetAmount] = useState(null); // Minimum bet amount from Firestore
    const [minPlayers, setMinPlayers] = useState(null); // Minimum players from Firestore
    useEffect(() => {
        // Fetch minBetAmount and minPlayers from Firestore for the logged-in user
        const fetchSettings = async () => {
            try {
                const uid = localStorage.getItem('uid'); // Get UID from localStorage
                if (!uid) {
                    toast.error('User not authenticated. Please log in.');
                    navigate('/login');
                    return;
                }

                const db = getFirestore();
                const userDocRef = doc(db, 'users', uid);
                const userDoc = await getDoc(userDocRef);

                if (userDoc.exists()) {

                    const data = userDoc.data();
                    setMinBetAmount(data.minBetAmount || 10); // Default to 10 if not set
                    setMinPlayers(data.minPlayers || 1); // Default to 1 if not set
                } else {
                    toast.error('User settings not found. Please contact support.');
                }
            } catch (error) {
                console.error('Error fetching user settings:', error);
                toast.error('Error fetching user settings. Please try again later.');
            }
        };

        fetchSettings();
    }, [navigate]);


    const handleGenerateNumbers = () => {
        const uid = localStorage.getItem('uid');

        // Ensure settings are loaded before validation
        if (minBetAmount === null || minPlayers === null) {
            toast.error('Game settings are not loaded. Please try again later.');
            return;
        }
        if (!uid) {
            toast.error('User not authenticated. Please log in again.');
            navigate('/login'); // Navigate to login if UID is missing
            return;
        }

        if (!betAmount || parseFloat(betAmount) < minBetAmount) {
            toast.error(`Please select a bet amount greater than or equal to ${minBetAmount}.`);
            return;
        }

        if (clickedNumbers.length < minPlayers) {
            toast.error(`Please select at least ${minPlayers} numbers.`);
            return;
        }


        if (clickedNumbers.length > 0 && betAmount.trim() !== '') {
            localStorage.setItem('betAmount', betAmount);
            localStorage.setItem('clickedNumbers', JSON.stringify(clickedNumbers));
            localStorage.setItem('selectedCartelas', clickedNumbers.length);
            clearGameStorage();
            setGeneratedNumbers(Array.from({
                length: 100
            }, (_, index) => index + 1));
            navigate(`/home/${betAmount * clickedNumbers.length}`);
        } else {
            alert('Please select at least one number and insert the bet amount.');
        }
    };

    const handleContinue = () => {
        const uid = localStorage.getItem('uid');

        // Ensure settings are loaded before validation
        if (minBetAmount === null || minPlayers === null) {
            toast.error('Game settings are not loaded. Please try again later.');
            return;
        }
        if (clickedNumbers.length > localStorage.getItem('selectedCartelas') || clickedNumbers.length < localStorage.getItem('selectedCartelas')) {
            toast.error('You cant Select a new cartela for continue Please unselect');
            return;
        }
        if (betAmount < 10) {
            toast.error('Please Select bet amount Greater Than 10');
            return;
        }

        if (clickedNumbers.length > 0 && betAmount.trim() !== '') {
            localStorage.setItem('betAmount', betAmount);
            localStorage.setItem('clickedNumbers', JSON.stringify(clickedNumbers));
            localStorage.setItem('selectedCartelas', clickedNumbers.length);
            setGeneratedNumbers(Array.from({
                length: 100
            }, (_, index) => index + 1));
            navigate(`/home/${betAmount * clickedNumbers.length}`);
        } else {
            alert('Please select at least one number and insert the bet amount.');
        }
    };
    const handleSelectRow = (rowNumbers) => {
        const allSelected = rowNumbers.every((number) => clickedNumbers.includes(number));

        const newClickedNumbers = allSelected ?
            clickedNumbers.filter((number) => !rowNumbers.includes(number)) // Unselect all row numbers
            :
            [...clickedNumbers, ...rowNumbers.filter((number) => !clickedNumbers.includes(number))]; // Select all row numbers

        setClickedNumbers(newClickedNumbers);
        localStorage.setItem('clickedNumbers', JSON.stringify(newClickedNumbers));
    };

    const handleClearSelection = () => {
        setClickedNumbers([]);
        localStorage.removeItem('clickedNumbers');
    };

    // Group numbers into rows of 15 (29 rows to cover 1-432)
    const rows = Array.from({
            length: 29
        }, (_, rowIndex) =>
        Array.from({
            length: 20
        }, (_, index) => rowIndex * 20 + index + 1)
    );


    const handleClickNumber = (number) => {
        const updatedClickedNumbers = clickedNumbers.includes(number) ?
            clickedNumbers.filter((clickedNumber) => clickedNumber !== number) :
            [...clickedNumbers, number];
        setClickedNumbers(updatedClickedNumbers);
        localStorage.setItem('clickedNumbers', JSON.stringify(updatedClickedNumbers));
    };


    const numbers = Array.from({
        length: 432
    }, (_, index) => index + 1);

    return ( <
        div className = "dark-theme-bg"
        style = {
            {
                height: '100vh',
                overflowY: 'auto'
            }
        } >
        <
        Grid item xs = {
            3
        } >
        <
        TemporaryDrawer / >
        <
        /Grid>

        <
        Stack height = {
            100
        }
        width = "100%"
        sx = {
            {
                backgroundColor: '#222222'
            }
        }
        direction = "row"
        alignItems = "center" >
        <
        Stack width = {
            '100%'
        }
        direction = {
            'row'
        }
        spacing = {
            2
        }
        height = {
            150
        }
        justifyContent = {
            'space-evenly'
        } >


        <
        VegasWheel / >



        <
        Box width = {
            50
        }
        />

        <
        BoorioPoker / >
        <
        Stack alignItems = {
            'center'
        } >

        <
        Box height = {
            10
        }
        />





        <
        /Stack> <
        Grid item xs = {
            6
        }
        align = "center" >

        <
        /Grid>


        <
        /Stack> <
        /Stack> { /* Fixed container for selected numbers */ } <
        Box sx = {
            {
                position: 'fixed',
                top: '20px',
                right: '20px',
                padding: '20px',
                backgroundColor: '#333',
                color: '#fff',
                borderRadius: '8px',
                zIndex: 1000,
                minWidth: '200px'
            }
        } >

        <
        Typography variant = "h6"
        gutterBottom > {
            t("Selected Cartela")
        } < /Typography> <
        Switch checked = {
            checked
        }
        onChange = {
            handleChange
        }
        inputProps = {
            {
                'aria-label': 'controlled'
            }
        }
        /> {
            checked ? < Stack direction = "row"
            spacing = {
                1
            }
            flexWrap = "wrap" > {
                    clickedNumbers.map((number) => ( <
                        Typography key = {
                            number
                        }
                        variant = "body1"
                        sx = {
                            {
                                backgroundColor: '#17c190',
                                borderRadius: '4px',
                                padding: '5px 10px',
                                color: '#fff'
                            }
                        } > {
                            number
                        } <
                        /Typography>
                    ))
                } <
                /Stack>:<Box/ >
        } <
        /Box>

        { /* Scrollable main content */ } <
        Stack paddingTop = {
            10
        }
        margin = {
            3
        }
        alignItems = "center"
        spacing = {
            3
        } >

        <
        Typography variant = "h5"
        className = "label"
        align = "center" > {
            t("Bet Amount")
        } <
        /Typography> <
        TextField variant = "outlined"
        fullWidth margin = "normal"
        value = {
            betAmount
        }
        onChange = {
            (e) => {
                const sanitizedValue = e.target.value.replace(/[^0-9]/g, '');
                setBetAmount(sanitizedValue);
            }
        }
        InputProps = {
            {
                style: {
                    fontWeight: 'bold',
                    height: '80px',
                    fontSize: '56px',
                    backgroundColor: '#111',
                    color: '#fff',
                    borderRadius: '12px',
                    boxShadow: '0 0 10px #17c190, 0 0 20px #17c190',
                },
                inputProps: {
                    inputMode: 'numeric',
                    pattern: '[0-9]*',
                },
            }
        }
        />

        <
        Stack direction = "row"
        spacing = {
            2
        } >
        <
        Button sx = {
            {
                background: 'linear-gradient(to bottom, #17c190 35%, #17c190 75%)',
                color: 'black',
                height: '60px',
                width: '200px',
                borderRadius: '15px',
                boxShadow: '0px 4px 20px rgba(255, 255, 33, 0.6)',
                '&:hover': {
                    background: 'linear-gradient(to bottom, #9d9302 35%, #fff521 75%)',
                    boxShadow: '0px 4px 20px rgba(255, 133, 33, 0.9)',
                },
            }
        }
        variant = "contained"
        onClick = {
            handleGenerateNumbers
        } >
        <
        Typography fontSize = {
            24
        }
        fontWeight = "bold" > {
            t("Start Game")
        } < /Typography> <
        /Button> <
        Button sx = {
            {
                background: 'linear-gradient(to bottom, #17c190 35%, #17c190 75%)',
                color: 'black',
                height: '60px',
                width: '200px',
                borderRadius: '15px',
                boxShadow: '0px 4px 20px rgba(255, 255, 33, 0.6)',
                '&:hover': {
                    background: 'linear-gradient(to bottom, #9d9302 35%, #fff521 75%)',
                    boxShadow: '0px 4px 20px rgba(255, 133, 33, 0.9)',
                },
            }
        }
        variant = "contained"
        onClick = {
            handleClearSelection
        } >
        <
        Typography fontSize = {
            20
        }
        fontWeight = "bold" > {
            t("Clear Selection")
        } < /Typography> <
        /Button> <
        Button sx = {
            {
                background: 'linear-gradient(to bottom, #17c190 35%, #17c190 75%)',
                color: 'black',
                height: '60px',
                width: '200px',
                borderRadius: '15px',
                boxShadow: '0px 4px 20px rgba(255, 255, 33, 0.6)',
                '&:hover': {
                    background: 'linear-gradient(to bottom, #9d9302 35%, #fff521 75%)',
                    boxShadow: '0px 4px 20px rgba(255, 133, 33, 0.9)',
                },
            }
        }
        variant = "contained"
        onClick = {
            handleContinue
        } >
        <
        Typography fontSize = {
            24
        }
        fontWeight = "bold" > {
            t("Continue")
        } < /Typography> <
        /Button> <
        /Stack>

        <
        Typography variant = "h5"
        gutterBottom className = "label"
        align = "center" > {
            t("Select Cartela")
        } <
        /Typography>

        <
        div className = "numbers-container" > {
            rows.map((row, rowIndex) => ( <
                Box key = {
                    rowIndex
                }
                width = {
                    '100%'
                }
                display = "flex"
                alignItems = "center"
                marginBottom = {
                    2
                } >
                <
                Button variant = "contained"
                onClick = {
                    () => handleSelectRow(row)
                }
                sx = {
                    {
                        marginRight: 2,
                        backgroundColor: '#17c190',
                        color: 'white',
                        '&:hover': {
                            backgroundColor: '#1abc9c',
                        },
                    }
                } >
                {
                    clickedNumbers.some(num => row.includes(num)) ? 'Unselect Row' : 'Select Row'
                } {
                    rowIndex + 1
                } <
                /Button> <
                Grid container spacing = {
                    1
                }
                wrap = "nowrap" > {
                    row.map((number) => ( <
                        Grid item key = {
                            number
                        } >
                        <
                        Stack sx = {
                            {
                                width: '60px',
                                height: '60px',
                                color: clickedNumbers.includes(number) ? 'white' : 'white',
                                backgroundColor: clickedNumbers.includes(number) ? '#3b82f6' : '#222',
                                border: clickedNumbers.includes(number) ? '2px solid #17c190' : '2px solid #555',
                                boxShadow: clickedNumbers.includes(number) ?
                                    '0px 0px 15px #3b82f6, 0px 0px 30px #3b82f6' :
                                    'none',
                                '&:hover': {
                                    backgroundColor: '#3b82f6',
                                    color: 'white',
                                },
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease-in-out',
                            }
                        }
                        onClick = {
                            () => handleClickNumber(number)
                        } >
                        <
                        Typography variant = "h6" > {
                            number
                        } < /Typography> <
                        /Stack> <
                        /Grid>
                    ))
                } <
                /Grid> <
                /Box>
            ))
        } <
        /div> <
        /Stack> <
        /div>
    );
}