import React, {
    useState,
    useEffect
} from 'react';
import Button from '@mui/material/Button';
import {
    db
} from "../firebase"; // Firestore instance
import {
    doc,
    getDoc,
    updateDoc,
    onSnapshot
} from "firebase/firestore";

import {
    styled
} from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import {
    Box,
    Stack,
    IconButton
} from '@mui/material';
import {
    toast
} from 'react-toastify';
import Confetti from 'react-confetti';
import useTranslation from '../pages/useTranslation';
import axios from 'axios';
import bingoSound from '../pages/goodBingo.mp3'
import {
    playAudio
} from '../pages/PlayAudio';
import WinnerPopup from './jackpot';
import CloseIcon from '@mui/icons-material/Close';

const CustomDialog = styled(Dialog)(({
    theme
}) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(5),
        justifyContent: 'center'
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(2),
        justifyContent: 'center',
    },
    '& .MuiBackdrop-invisible': {
        backgroundColor: 'transparent',
    },
}));
const audioFile = [];
export default function CustomizedDialogs({
    calledNumbers,
    cards,
    LastCalled,
    unlockAllNumbers
}) {
    const [selectedCard, setSelectedCard] = useState(null);
    const [isBingo, setIsBingo] = useState(false)
    const [inputNumber, setInputNumber] = useState('');
    const [firstDialogOpen, setFirstDialogOpen] = useState(false);
    const [secondDialogOpen, setSecondDialogOpen] = useState(false);
    const [lockedCards, setLockedCards] = useState([]); // State to hold locked card names
    const [matchedDiagonals, setMatchedDiagonals] = useState({
        diagonal1: false,
        diagonal2: false
    });
    const [matchedRows, setMatchedRows] = useState([]);
    const [matchedColumns, setMatchedColumns] = useState([]);
    const [cornersMatched, setCornersMatched] = useState(false);
    const [isCartelaAv, setIsCartelaAv] = useState(false);
    const [winnerId, setWinnerId] = useState(null); // Winner ID fetched from Firestore
    const uid = localStorage.getItem('uid'); // Get UID from local storage
    const [isJack, setisjack] = useState(false); // Winner ID fetched from Firestore
    const [isClaimed, setIsClaimed] = useState(false);
    const [isPopupShown, setIsPopupShown] = useState(false); // Track popup display status
    const [popupVisible, setPopupVisible] = useState(false);
    const [isPageCovered, setIsPageCovered] = useState(false);
    const [isPageCovered1, setIsPageCovered1] = useState(false);

    const [prizeAmount, setPrizeAmount] = useState(0);

    // State to control the page-covering effect
    // Popup visibility // Track popup display status
    // Fetch winnerId when the component loads
    useEffect(() => {
        const fetchWinnerId = async () => {
            try {
                const jackpotDoc = await getDoc(doc(db, "jackpots", "currentJackpot"));
                if (jackpotDoc.exists()) {
                    setWinnerId(jackpotDoc.data().winnerId);
                } else {
                    console.error("No current jackpot found.");
                }
            } catch (error) {
                console.error("Error fetching jackpot: ", error);
            }
        };
        fetchWinnerId();
    }, []);
    const {
        t
    } = useTranslation();
    const handleFirstDialogOpen = () => {
        setFirstDialogOpen(true);
    };

    const handleFirstDialogClose = () => {
        setFirstDialogOpen(false);
    };

    const handleSecondDialogClose = () => {
        setSecondDialogOpen(false);
        setSelectedCard(null); // Reset selected card
        setInputNumber(''); // Clear input field
        // Check if popup should be shown
        // Check if popup should be shown
        if (uid === winnerId && isClaimed && !isPopupShown) {
            setPopupVisible(true);

            // Update Firestore to set `isPopupShown` to true
            const updatePopupShown = async () => {
                try {
                    const jackpotRef = doc(db, "jackpots", "currentJackpot");
                    await updateDoc(jackpotRef, {
                        isPopupShown: true
                    });
                    setIsPopupShown(true);
                } catch (error) {
                    console.error("Error updating isPopupShown:", error);
                }
            };

            updatePopupShown();
        }
    };

    const handleInputChange = (event) => {
        setInputNumber(event.target.value);
    };

    const handleCardSearch = () => {
        const number = parseInt(inputNumber);
        console.log(number);

        const selectedCard = cards.find(card => card.cardname === `card${number}`);
        console.log(cards);
        if (selectedCard) {
            if (lockedCards.includes(selectedCard.cardname)) {
                toast.error("This card is locked!");

            } else {

                setSelectedCard(selectedCard);
                setFirstDialogOpen(false);
                setSecondDialogOpen(true);
            }
        } else {
            // Display an error message or handle invalid input
            toast.error(t("This Cartela is not selected"));
            setIsCartelaAv(true)
            console.error("Card not found.");
        }
    };

    const lockBoard = () => {
        if (selectedCard) {
            setLockedCards([...lockedCards, selectedCard.cardname]);
            setSelectedCard(null);
            setSecondDialogOpen(false);
        }
    };

    useEffect(() => {
        if (selectedCard) {
            // Check if all diagonal numbers are matched for diagonal 1
            const diagonal1Matched = calledNumbers.b.includes(selectedCard.b[0]) &&
                calledNumbers.i.includes(selectedCard.i[1]) &&
                calledNumbers.g.includes(selectedCard.g[3]) &&
                calledNumbers.o.includes(selectedCard.o[4]);
            // Check if all diagonal numbers are matched for diagonal 2
            const diagonal2Matched = calledNumbers.b.includes(selectedCard.b[4]) &&
                calledNumbers.i.includes(selectedCard.i[3]) &&
                calledNumbers.g.includes(selectedCard.g[1]) &&
                calledNumbers.o.includes(selectedCard.o[0]);

            // Update matched diagonals state
            setMatchedDiagonals({
                diagonal1: diagonal1Matched,
                diagonal2: diagonal2Matched
            });

            // Check for matched rows
            const matchedRows = [];
            for (let i = 0; i < selectedCard.b.length; i++) {
                let rowMatched = true;
                for (const column of Object.keys(selectedCard)) {
                    const calledColumn = calledNumbers[column];
                    if (calledColumn && Array.isArray(calledColumn) && selectedCard[column][i] !== 'free' && !calledColumn.includes(selectedCard[column][i])) {
                        rowMatched = false;
                        break;
                    }
                }
                if (rowMatched) {
                    matchedRows.push(i);
                }
            }
            setMatchedRows(matchedRows);

            // Check for matched columns
            const matchedColumns = Object.keys(selectedCard).filter(column => {
                const col = selectedCard[column];
                const numbers = calledNumbers[column];
                if (col && Array.isArray(col)) {
                    if (col.every(num => numbers.includes(num))) {
                        return true; // Column is completely matched
                    }
                }
                return false; // Column is not matched
            });
            setMatchedColumns(matchedColumns);

            // Check if all four corners are matched
            const cornersMatched = calledNumbers.b.includes(selectedCard.b[0]) &&
                calledNumbers.o.includes(selectedCard.o[0]) &&
                calledNumbers.b.includes(selectedCard.b[4]) &&
                calledNumbers.o.includes(selectedCard.o[4]);
            setCornersMatched(cornersMatched);
        }
    }, [selectedCard, calledNumbers]);

    useEffect(() => {
        const hasBingo = matchedRows.length > 0 || matchedColumns.length > 0 || matchedDiagonals.diagonal1 || matchedDiagonals.diagonal2 || cornersMatched;
        if (secondDialogOpen && hasBingo) {
            playAudio(78);
        }
    }, [secondDialogOpen, matchedRows, matchedColumns, matchedDiagonals, cornersMatched]);

    // Check Bingo logic and update `isClaimed` if conditions are met
    useEffect(() => {
        const hasBingo =
            matchedRows.length > 0 ||
            matchedColumns.length > 0 ||
            matchedDiagonals.diagonal1 ||
            matchedDiagonals.diagonal2 ||
            cornersMatched;

        if (secondDialogOpen && hasBingo && uid && uid === winnerId) {

            // Update Firestore to set `isClaimed` to true
            const updateIsClaimed = async () => {
                try {
                    const jackpotRef = doc(db, "jackpots", "currentJackpot");
                    await updateDoc(jackpotRef, {
                        isClaimed: true
                    });
                    console.log("isClaimed updated to true.");
                } catch (error) {
                    console.error("Error updating isClaimed: ", error);
                }
            };

            updateIsClaimed();
        }
    }, [secondDialogOpen, matchedRows, matchedColumns, matchedDiagonals, cornersMatched, uid, winnerId]);
    // Reset `hasPlayedAudio` when bingo conditions are cleared or changed
    useEffect(() => {
        const fetchJackpot = async () => {
            try {
                const jackpotRef = doc(db, "jackpots", "currentJackpot");
                const jackpotDoc = await getDoc(jackpotRef);

                if (jackpotDoc.exists()) {
                    const data = jackpotDoc.data();
                    setWinnerId(data.winnerId);
                    setIsClaimed(data.isClaimed);
                    setPrizeAmount(data.prizeAmount)
                    // Check if the winner should see the jackpot message and if it hasn't been shown before
                    const hasBingo =
                        matchedRows.length > 0 ||
                        matchedColumns.length > 0 ||
                        matchedDiagonals.diagonal1 ||
                        matchedDiagonals.diagonal2 ||
                        cornersMatched;

                    if (secondDialogOpen && hasBingo && uid === data.winnerId && !data.isPageCoveredShown) {

                        setIsPageCovered(true);

                        // Update Firestore to set `isPageCoveredShown` to true
                        await updateDoc(jackpotRef, {
                            isPageCoveredShown: true,
                            isClaimed: true
                        });
                    }
                } else {
                    console.error("No current jackpot found.");
                }
            } catch (error) {
                console.error("Error fetching jackpot data:", error);
            }
        };

        fetchJackpot();
    }, [uid, secondDialogOpen, matchedRows, matchedColumns, matchedDiagonals, cornersMatched]);

    const handleClosePageCover = () => {
        setIsPageCovered(false); // Hide the full-page message
    };
    useEffect(() => {
        const listenToJackpot = () => {
            const jackpotRef = doc(db, "jackpots", "currentJackpot");

            const unsubscribe = onSnapshot(jackpotRef, (snapshot) => {
                if (snapshot.exists()) {
                    const data = snapshot.data();
                    const hasJackpotBeenClaimed = data.isClaimed;
                    const winnerUid = data.winnerId;

                    // Trigger confetti for non-winners
                    if (hasJackpotBeenClaimed && uid !== winnerUid) {
                        setIsPageCovered1(true); // Show confetti
                        setTimeout(() => setIsPageCovered1(false), 5000); // Hide confetti after 5 seconds
                    }
                }
            });

            return unsubscribe; // Clean up the listener
        };

        const unsubscribeJackpotListener = listenToJackpot();

        return () => {
            unsubscribeJackpotListener(); // Clean up the listener when component unmounts
        };
    }, [uid]);
    return ( <
        >

        <
        Button variant = "contained"
        onClick = {
            handleFirstDialogOpen
        }
        sx = {
            {
                background: 'green',
                color: 'black',
                height: '70px',
                width: '200px',
                '&:hover': {
                    background: 'linear-gradient(to bottom, #9d9302 35%, #fff521 75%)',
                }
            }
        } > < Typography fontWeight = {
            'bold'
        }
        color = {
            'white'
        } > {
            t("Check")
        } < /Typography></Button > {
            isPageCovered && ( <
                Box sx = {
                    {
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        zIndex: 9999,
                        backgroundColor: 'rgba(0, 0, 0, 0.85)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'start',
                        alignItems: 'center',
                        color: 'white',
                    }
                } >
                { /* Close Button */ } <
                IconButton sx = {
                    {
                        position: 'fixed',
                        top: 16, // Add spacing from the top
                        right: 16, // Add spacing from the right
                        backgroundColor: '#ff0000',
                        color: 'white',
                        width: 80, // Increase width
                        height: 80, // Increase height
                        '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.4)',
                        },
                        '& .MuiSvgIcon-root': {
                            fontSize: '2rem', // Increase icon size
                        },
                    }
                }
                onClick = {
                    handleClosePageCover
                } >
                <
                CloseIcon sx = {
                    {
                        height: 70,
                        width: 70,
                        stroke: 100
                    }
                }
                /> <
                /IconButton>

                <
                Confetti width = {
                    window.innerWidth
                }
                height = {
                    window.innerHeight
                }
                /> <
                Typography variant = "h1"
                fontWeight = "bold"
                sx = {
                    {
                        paddingTop: 10,
                        color: '#FFD700',
                        textShadow: '0 0 20px #FFA500, 0 0 30px #FF4500',
                        textAlign: 'ce',
                    }
                } >
                🎉እንኳን ደስ አለህ!የ {
                    prizeAmount
                }
                ብር ጃክፖት አሸንፈሀል!🎉
                <
                /Typography> <
                Box sx = {
                    {
                        position: 'fixed',
                        bottom: 0,

                        justifyContent: 'center'
                    }
                } >
                <
                Typography variant = "h4"
                fontWeight = "bold"
                sx = {
                    {
                        paddingTop: 10,
                        color: '#FFD700',
                        textShadow: '0 0 20px #FFA500, 0 0 30px #FF4500',
                    }
                } >
                🎉ካሸነፉት ብር ጋር አብረዉ የጃክፖት ብርዎን ይዉሰዱ🎉 <
                /Typography> <
                /Box> <
                /Box>
            )
        }


        <
        CustomDialog onClose = {
            handleFirstDialogClose
        }
        aria - labelledby = "first-dialog-title"
        open = {
            firstDialogOpen
        }
        sx = {
            {
                '& .MuiPaper-root': {
                    borderRadius: '15px',
                    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.7)', // Soft shadow for depth
                },
            }
        } >

        <
        DialogContent dividers sx = {
            {
                backgroundColor: '#222222',
                padding: 4,
                textAlign: 'center',
                borderBottom: '1px solid #444444',
            }
        } >


        <
        Typography variant = "h3"
        color = "white"
        fontWeight = "bold"
        sx = {
            {
                mb: 2
            }
        } > {
            t("Enter Cartela Number")
        } <
        /Typography>

        <
        TextField autoFocus error = 'This Cartela is Not Selected'
        margin = "dense"
        id = "card-number"
        type = "number"
        fullWidth value = {
            inputNumber
        }
        onChange = {
            (e) => {
                const sanitizedValue = e.target.value.replace(/[^0-9]/g, '');
                setInputNumber(sanitizedValue);
            }
        }
        sx = {
            {
                background: '#ffffff',
                borderRadius: '10px',
                '& .MuiInputBase-input': {
                    height: '90px',
                    fontSize: 70,
                    fontWeight: 'bold',
                    textAlign: 'center',
                    color: '#333333',
                },
                '& .MuiInputLabel-root': {
                    fontSize: '1.2rem',
                    color: '#333333',
                },
            }
        }

        InputProps = {
            {

                inputProps: {

                    inputMode: 'numeric',
                    pattern: '[0-9]*',
                },
            }
        }
        /> <
        Typography textAlign = {
            'left'
        }
        color = {
            'red'
        } > {
            isCartelaAv ? t('This Cartela is not Selected') : null

        } < /Typography> <
        /DialogContent>

        <
        DialogActions sx = {
            {
                backgroundColor: '#222222',
                justifyContent: 'center',
                padding: 3
            }
        } >
        <
        Button onClick = {
            handleCardSearch
        }
        variant = "contained"
        sx = {
            {

                background: 'linear-gradient(135deg, #ffd700, #ffae00)',
                color: 'black',
                fontWeight: 'bold',
                borderRadius: '10px',
                boxShadow: '0px 4px 12px rgba(255, 215, 0, 0.5)',
                ':hover': {
                    background: 'linear-gradient(135deg, #ffae00, #ff8c00)',
                    boxShadow: '0px 6px 15px rgba(255, 140, 0, 0.6)',
                },
            }
        } >
        <
        Typography variant = "h6" > {
            t("Search")
        } < /Typography> <
        /Button> <
        /DialogActions> <
        /CustomDialog>


        <
        CustomDialog maxWidth = {
            '100%'
        }
        onClose = {
            handleSecondDialogClose
        }
        aria - labelledby = "second-dialog-title"
        open = {
            secondDialogOpen
        }
        BackdropProps = {
            {
                invisible: true
            }
        } >


        <
        DialogContent dividers sx = {
            {
                background: '#222222',
                justifyContent: 'center',
                alignItems: 'stretch'
            }
        } >

        {
            (matchedRows.length > 0 || matchedColumns.length > 0 || matchedDiagonals.diagonal1 || matchedDiagonals.diagonal2 || cornersMatched) ? ( <
                Confetti height = {
                    window.innerHeight
                } // Full viewport height
                width = {
                    window.innerWidth
                } // Full viewport width
                />
            ) : ( <
                Box / >
            )
        } <
        Box >
        <
        Grid container direction = "column"
        justifyContent = "center"
        alignItems = "center"
        sx = {
            {
                width: '100%'
            }
        } > { /* Display BINGO letters */ } <
        Grid item container justifyContent = "space-evenly"
        alignItems = "center"
        spacing = {
            1
        } > {
            ['B', 'I', 'N', 'G', 'O'].map((letter, index) => ( <
                Grid key = {
                    index
                }
                item >
                <
                Typography fontFamily = {
                    'CustomFont'
                }
                variant = "h5"
                color = "white" > {
                    letter
                } < /Typography> <
                /Grid>
            ))
        } <
        /Grid> { /* Display card numbers */ } <
        Grid item container justifyContent = "center"
        alignItems = "center"
        spacing = {
            0
        }
        padding = {
            3
        } > {
            selectedCard &&
            Object.keys(selectedCard).map((key) => ( <
                Grid key = {
                    key
                }
                item padding = {
                    0.2
                } > {
                    Array.isArray(selectedCard[key]) ? (
                        selectedCard[key].map((number, index) => {
                            const isCorner = (key === 'b' && (index === 0 || index === 4)) || (key === 'o' && (index === 0 || index === 4));
                            const backgroundColor =
                                matchedDiagonals.diagonal1 &&
                                ((key === 'b' && index === 0) ||
                                    (key === 'i' && index === 1) ||
                                    (key === 'n' && index === 2) ||
                                    (key === 'g' && index === 3) ||
                                    (key === 'o' && index === 4)) ?
                                '#FEE405' :
                                matchedDiagonals.diagonal2 &&
                                ((key === 'b' && index === 4) ||
                                    (key === 'i' && index === 3) ||
                                    (key === 'n' && index === 2) ||
                                    (key === 'g' && index === 1) ||
                                    (key === 'o' && index === 0)) ?
                                '#FEE405' :
                                matchedRows.includes(index) || matchedColumns.includes(key) ?
                                '#FEE405' :
                                calledNumbers[key].includes(number) ?
                                'red' :
                                'black';

                            const textColor =
                                matchedDiagonals.diagonal1 &&
                                ((key === 'b' && index === 0) ||
                                    (key === 'i' && index === 1) ||
                                    (key === 'n' && index === 2) ||
                                    (key === 'g' && index === 3) ||
                                    (key === 'o' && index === 4)) ?
                                'black' :
                                matchedDiagonals.diagonal2 &&
                                ((key === 'b' && index === 4) ||
                                    (key === 'i' && index === 3) ||
                                    (key === 'n' && index === 2) ||
                                    (key === 'g' && index === 1) ||
                                    (key === 'o' && index === 0)) ?
                                'black' :
                                matchedRows.includes(index) || matchedColumns.includes(key) ?
                                'black' :
                                calledNumbers[key].includes(number) ?
                                'white' :
                                'white';

                            return ( <
                                Grid key = {
                                    index
                                }
                                container justifyContent = "center"
                                alignItems = "center"
                                style = {
                                    {
                                        marginBottom: 1.5,
                                        borderRadius: '10%',
                                        height: '80px',
                                        width: '80px', // Adjust the width here

                                        backgroundColor: isCorner && cornersMatched ? '#FEE405' : backgroundColor,
                                        color: isCorner && cornersMatched ? 'black' : textColor,


                                    }
                                } >
                                <
                                Typography fontFamily = {
                                    'CustomFont'
                                }
                                fontWeight = {
                                    'bold'
                                }
                                variant = "h4" > {
                                    number === 'free' ? 'Free' : number
                                } < /Typography> <
                                /Grid>
                            );
                        })
                    ) : null
                } <
                /Grid>
            ))
        }

        <
        /Grid> <
        /Grid> <
        /Box> <
        /DialogContent> <
        Stack sx = {
            {
                backgroundColor: '#9d9302'
            }
        } >
        <
        DialogActions sx = {
            {
                backgroundColor: '#9d9302',
                justifyContent: 'center'
            }
        } >
        <
        Button onClick = {
            lockBoard
        }
        variant = "contained"
        sx = {
            {
                background: 'black'
            }
        } > {
            t("Lock Cartela")
        } <
        /Button> <
        Button onClick = {
            handleSecondDialogClose
        }
        variant = "contained"
        sx = {
            {
                background: 'black'
            }
        } >
        Close <
        /Button> <
        /DialogActions> <
        Stack direction = {
            'row'
        }
        justifyContent = {
            'space-around'
        } >
        <
        Typography variant = "h2"
        fontWeight = "bold"
        sx = {
            {
                mt: 2,
                textAlign: 'center',
                display: 'inline-flex', // Flex to apply styling to each character
                gap: '2px', // Slight spacing between characters
                color: 'black',
                background: 'linear-gradient(90deg, #00BFFF, #1E90FF)',
                WebkitBackgroundClip: 'text',
                textShadow: '2px 2px 8px rgba(30, 144, 255, 0.6)',
            }
        } >
        {
            [...(matchedRows.length > 0 || matchedColumns.length > 0 || matchedDiagonals.diagonal1 || matchedDiagonals.diagonal2 || cornersMatched ? t('Good Bingo') : t('No Bingo'))].map((char, index) => ( <
                span key = {
                    index
                }
                style = {
                    {
                        display: 'inline-block',
                        animation: `longitudinalWave 1.5s ease-in-out ${index * 0.1}s infinite`, // Delayed wave effect
                    }
                } >
                {
                    char
                } <
                /span>
            ))
        } <
        /Typography>

        <
        style > {
            `
    @keyframes longitudinalWave {
      0%, 100% {
        transform: translateY(0);
      }
      50% {
        transform: translateY(-10px); // Moves each character up
      }
    }
  `
        } <
        /style>



        <
        Typography variant = "h2"
        color = {
            'black'
        }
        fontWeight = "bold"
        sx = {
            {
                mt: 2,
                textAlign: 'center'
            }
        } >
        C = {
            inputNumber
        } <
        /Typography> <
        /Stack> <
        /Stack> <
        /CustomDialog> <
        />
    );
}