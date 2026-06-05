/* eslint-disable no-undef */
import * as React from 'react';
import {
    useEffect,
    useState,
    useRef,
    useCallback
} from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import Brightness5Icon from '@mui/icons-material/Brightness5';
import {
    Grid,
    Stack,
    Button,
    Slider,
    Divider,
    CircularProgress
} from '@mui/material';
import BasicSelect from '../components/dropdown';
import {
    styled,
    keyframes
} from '@mui/material/styles';
import CustomButton from '../components/customButton';
import CustomBingoText from '../components/customBingoText';
import TemporaryDrawer from '../components/drawer';
import cards from '../constant/constant';
import CustomizedDialogs from '../components/Dialog';
import {
    useLocation,
    useNavigate
} from 'react-router-dom';
import {
    useParams
} from 'react-router-dom';
import gifImage from './Wallet.gif';
import './money.css'
import axios from 'axios';
import {
    arrayUnion,
    getFirestore,
    collection,
    query,
    where,
    getDocs,
    updateDoc,
    Timestamp,
    getDoc
} from 'firebase/firestore';
import {
    runTransaction,
    writeBatch,
    doc,
    increment
} from "firebase/firestore";

import {
    toast
} from 'react-toastify';
import {
    ToastContainer
} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
    addDoc,
    serverTimestamp
} from 'firebase/firestore';
import TextToSpeech from '../components/texttoSpeech';
import BingoTable from '../components/table';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import {
    enableIndexedDbPersistence
} from 'firebase/firestore';
import { useUser } from '../UserContext.js';
import b1Sound from '../assets/bingosound/b1.mp3';
import b2Sound from '../assets/bingosound/b2.mp3';
import b3Sound from '../assets/bingosound/b3.mp3';
import b4Sound from '../assets/bingosound/b4.mp3';
import b5Sound from '../assets/bingosound/b5.mp3';
import b6Sound from '../assets/bingosound/b6.mp3';
import b7Sound from '../assets/bingosound/b7.mp3';
import b8Sound from '../assets/bingosound/b8.mp3';
import b9Sound from '../assets/bingosound/b9.mp3';
import b10Sound from '../assets/bingosound/b10.mp3';
import b11Sound from '../assets/bingosound/b11.mp3';
import b12Sound from '../assets/bingosound/b12.mp3';
import b13Sound from '../assets/bingosound/b13.mp3';
import b14Sound from '../assets/bingosound/b14.mp3';
import b15Sound from '../assets/bingosound/b15.mp3';
import b16Sound from '../assets/bingosound/b16.mp3';
import b17Sound from '../assets/bingosound/b17.mp3';
import b18Sound from '../assets/bingosound/b18.mp3';
import b19Sound from '../assets/bingosound/b19.mp3';
import b20Sound from '../assets/bingosound/b20.mp3';
import b21Sound from '../assets/bingosound/b21.mp3';
import b22Sound from '../assets/bingosound/b22.mp3';
import b23Sound from '../assets/bingosound/b23.mp3';
import b24Sound from '../assets/bingosound/b24.mp3';
import b25Sound from '../assets/bingosound/b25.mp3';
import b26Sound from '../assets/bingosound/b26.mp3';
import b27Sound from '../assets/bingosound/b27.mp3';
import b28Sound from '../assets/bingosound/b28.mp3';
import b29Sound from '../assets/bingosound/b29.mp3';
import b30Sound from '../assets/bingosound/b30.mp3';
import b31Sound from '../assets/bingosound/b31.mp3';
import b32Sound from '../assets/bingosound/b32.mp3';
import b33Sound from '../assets/bingosound/b33.mp3';
import b34Sound from '../assets/bingosound/b34.mp3';
import b35Sound from '../assets/bingosound/b35.mp3';
import b36Sound from '../assets/bingosound/b36.mp3';
import b37Sound from '../assets/bingosound/b37.mp3';
import b38Sound from '../assets/bingosound/b38.mp3';
import b39Sound from '../assets/bingosound/b39.mp3';
import b40Sound from '../assets/bingosound/b40.mp3';
import b41Sound from '../assets/bingosound/b41.mp3';
import b42Sound from '../assets/bingosound/b42.mp3';
import b43Sound from '../assets/bingosound/b43.mp3';
import b44Sound from '../assets/bingosound/b44.mp3';
import b45Sound from '../assets/bingosound/b45.mp3';
import b46Sound from '../assets/bingosound/b46.mp3';
import b47Sound from '../assets/bingosound/b47.mp3';
import b48Sound from '../assets/bingosound/b48.mp3';
import b49Sound from '../assets/bingosound/b49.mp3';
import b50Sound from '../assets/bingosound/b50.mp3';
import b51Sound from '../assets/bingosound/b51.mp3';
import b52Sound from '../assets/bingosound/b52.mp3';
import b54Sound from '../assets/bingosound/b54.mp3';
import b55Sound from '../assets/bingosound/b55.mp3';
import b56Sound from '../assets/bingosound/b56.mp3';
import b57Sound from '../assets/bingosound/b57.mp3';
import b58Sound from '../assets/bingosound/b58.mp3';
import b59Sound from '../assets/bingosound/b59.mp3';
import b60Sound from '../assets/bingosound/b60.mp3';
import b61Sound from '../assets/bingosound/b61.mp3';
import b62Sound from '../assets/bingosound/b62.mp3';
import b63Sound from '../assets/bingosound/b63.mp3';
import b64Sound from '../assets/bingosound/b64.mp3';
import b65Sound from '../assets/bingosound/b65.mp3';
import b66Sound from '../assets/bingosound/b66.mp3';
import b67Sound from '../assets/bingosound/b67.mp3';
import b68Sound from '../assets/bingosound/b68.mp3';
import b69Sound from '../assets/bingosound/b69.mp3';
import b70Sound from '../assets/bingosound/b70.mp3';
import b71Sound from '../assets/bingosound/b71.mp3';
import b72Sound from '../assets/bingosound/b72.mp3';
import b73Sound from '../assets/bingosound/b73.mp3';
import b74Sound from '../assets/bingosound/b74.mp3';
import b75Sound from '../assets/bingosound/b75.mp3';
import b53Sound from '../assets/bingosound/b53.mp3';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import {
    Grid4x4
} from '@mui/icons-material';
import bingo from './bingo.mp3'
import stopBingo from './stop.mp3'
import shuf from './shuffle.mp3'
import {
    Howl,
    Howler
} from 'howler';
import {
    playAudio
} from './PlayAudio'
import AnimatedBackground from './anim';
import './style.css'
import bgimg from './ad.png'
import cashImg from './cash.png'
import LanguageSelector from './LanguageSelector';
import useTranslation from './useTranslation';
import gif from './k.gif'
import happyGuy from './Happy_man.gif'
import VegasWheel from './bingo1';
import BoorioPoker from './bingo2';
import logo from './logo2.png'
import SlidableImageComponent from './banner';
import PhoneVerificationDialog from './phone';

import { db } from '../firebase';

// Enable offline persistence with error handling
enableIndexedDbPersistence(db)
    .catch(function(err) {
        if (err.code === 'failed-precondition') {
            // Multiple tabs open, persistence can only be enabled in one tab.
            console.log("Persistence failed - Multiple tabs open");
        } else if (err.code === 'unimplemented') {
            // The current browser does not support persistence.
            console.log("Persistence not supported");
        }
    });


const sizeAnimation = keyframes `
  from {
    font-size: 80px;
  }
  to {
    font-size: 100px;
  }
`;
const blink = keyframes `
  50% {
    opacity: 0;
  }
`;
const style = document.createElement('style');
style.innerHTML = `
  .toggle-color {
    color: red !important;
  }
`;
document.head.appendChild(style);
const gradientStyle = {
    background: 'linear-gradient(to bottom, #ebe305 35%, #623f89 75%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
};



const LastCalledNumbersContainer = styled(Stack)({
    top: 'calc(50% + 90px)', // Adjust the distance from the main circle
    left: '50%',
    transform: 'translateX(-70%)',
    flexDirection: 'row',
    width: 100,
    height: 100
});
const LastCalledNumberContainer = styled(Stack)({
    top: 0,
    right: 10,
    borderRadius: 100,



});

const LastCalledNumberItem = styled(Stack)({
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.25)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    margin: '0 10px',
    background: 'linear-gradient(to bottom right, #cecece, #fff)', // Grey color



});
const audioFiles = [
    b1Sound, b2Sound, b3Sound, b4Sound, b5Sound, b6Sound, b7Sound, b8Sound, b9Sound, b10Sound,
    b11Sound, b12Sound, b13Sound, b14Sound, b15Sound, b16Sound, b17Sound, b18Sound, b19Sound, b20Sound,
    b21Sound, b22Sound, b23Sound, b24Sound, b25Sound, b26Sound, b27Sound, b28Sound, b29Sound, b30Sound,
    b31Sound, b32Sound, b33Sound, b34Sound, b35Sound, b36Sound, b37Sound, b38Sound, b39Sound, b40Sound,
    b41Sound, b42Sound, b43Sound, b44Sound, b45Sound, b46Sound, b47Sound, b48Sound, b49Sound, b50Sound,
    b51Sound, b52Sound, b53Sound, b54Sound, b55Sound, b56Sound, b57Sound, b58Sound, b59Sound, b60Sound,
    b61Sound, b62Sound, b63Sound, b64Sound, b65Sound, b66Sound, b67Sound, b68Sound, b69Sound, b70Sound, b71Sound, b72Sound,
    b73Sound, b74Sound, b75Sound, stopBingo, shuf, bingo
];

const howls = audioFiles.map(sound => new Howl({
    src: [sound]
}));

// Variable to keep track of the currently playing sound
let currentPlayingSound = null;

// Function to play audio by index


// Function to handle playing audio based on number
const handlePlayAudio = (number) => {
    // Adjusting for 1-based index (if necessary)
    const index = number - 1;

    // Play audio based on index
    playAudio(index);
};
// Function to play audio by index

// Function to handle playing audio based on number

const BingoNumbersContainer = styled(Stack)
`
  display: grid;
  grid-template-rows: repeat(5, auto);
  gap: 1vh;
  padding: 10px;
 
  width: 92%;
`;

const BingoRow = styled(Stack)
`
  display: grid;
  grid-template-columns: repeat(15, 1fr);
  gap: 0.5vw; // Adjusted gap for responsiveness
  width: 100%;
  justify-items: center;
`;

const StyledButton = styled(Button)(({
    theme,
    called,
    toggleColor
}) => ({
    fontSize: 'calc(1em + 1vw)', // Responsive font size
    width: '100%', // Fit within cell
    borderRadius: '50%',
    boxShadow: called ?
        '0px 6px 12px rgba(77, 242, 27, 0.6)' :
        '0px 6px 12px rgba(0, 0, 0, 0.6)',
    '&:hover': {
        transform: 'scale(1.1)',
    },
    [`@media (max-width: 600px)`]: {
        fontSize: 'calc(0.8em + 1vw)', // Smaller font for smaller screens
    },
}));

const BingoNumbers = React.memo(({
    numbers,
    calledNumbers,
    lastCalledNumber,
    handleClickNumber,
    isToggled
}) => {
    const [isWhite, setIsWhite] = useState(true);

    useEffect(() => {
        const intervalId1 = setInterval(() => {
            setIsWhite((prevState) => !prevState);
        }, 500);
        return () => clearInterval(intervalId1);
    }, []);
    return ( <
        BingoNumbersContainer > {
            numbers.map((row, rowIndex) => ( <
                Stack key = {
                    rowIndex
                }
                direction = "row"
                width = "100%" >
                <
                CustomBingoText > {
                    String.fromCharCode(66 + rowIndex)
                } < /CustomBingoText> <
                Stack direction = "row"
                width = "100%"
                height = {
                    '100%'
                }

                >
                {
                    row.map((number, colIndex) => {
                        const category = number <= 15 ? 'b' : number <= 30 ? 'i' : number <= 45 ? 'n' : number <= 60 ? 'g' : 'o';
                        const isCalled = calledNumbers[category].includes(number);
                        const formattedNumber = number < 10 ? `0${number}` : number;
                        const isLastCalled = lastCalledNumber === number;

                        return ( <
                            StyledButton key = {
                                number
                            }
                            called = {
                                isCalled
                            }
                            // sx={{
                            //   height: '60px',
                            //   fontSize: 'calc(1.5em + 0.5vw)',
                            //   margin: '0.5vw',
                            //   borderRadius: '50%',
                            //   background:
                            //     isToggled ? '#f0fc03' :
                            //     // Blinking effect by toggling colors
                            //        'linear-gradient(145deg, #252525, #1a1a1a)',
                            //   border: '2px solid #444',
                            //   boxShadow: isCalled
                            //     ? '0px 12px 18px rgba(255, 255, 255, 0.9)'
                            //     : '0px 6px 12px rgba(0, 0, 0, 0.6)',
                            // }}
                            >
                            <
                            Typography variant = {
                                isCalled ? 'h3' : "h4"
                            }
                            fontFamily = {
                                'CustomFont'
                            }
                            fontWeight = {
                                isCalled ? 'w600' : 'bold'
                            }
                            sx = {
                                {
                                    color: isToggled ? 'red' : isCalled ? isLastCalled ?
                                        isWhite ? 'white' : '#333' : 'white' : '#2d2d2e',
                                    textShadow: isCalled ?
                                        '0px 0px 5px rgba(255, 255, 255, 0.8)' :
                                        null,
                                }
                            } >
                            {
                                formattedNumber
                            } <
                            /Typography> <
                            /StyledButton>
                        );
                    })
                } <
                /Stack> <
                /Stack>
            ))
        }

        <
        /BingoNumbersContainer>
    );
});




const HomeContainer = styled(Stack)
`
  height: 100vh;
  width: 100%;
  background: black;
`;




const LastCalledNumbers = ({
    lastCalledNumbers
}) => {
    return ( <
        LastCalledNumbersContainer sx = {
            {
                padding: '15px'
            }
        } >

        {
            lastCalledNumbers.map((number, index) => ( <
                StyledButton key = {
                    index
                }
                sx = {
                    {
                        color: 'white',
                        background: 'linear-gradient(145deg, #252525, #1a1a1a)',
                        boxShadow: '0px 6px 12px rgba(255, 255, 255, 0.6)',
                    }
                } >
                <
                Typography fontFamily = {
                    'CustomFont'
                }
                sx = {
                    {
                        color: '#FFE600',
                        textShadow: '0px 0px 5px rgba(255, 255, 255, 0.8)'
                    }
                }


                fontWeight = {
                    'bold'
                }
                variant = "h5"
                color = "white" > {
                    number
                } <
                /Typography> <
                /StyledButton>
            ))
        } <
        Box height = {
            10
        }
        /> <
        /LastCalledNumbersContainer>
    );
};
const LastCalledNumber = ({
    number,
    voice,
    languageCode,
    gameStarted
}) => {
    useEffect(() => {
        if (number !== null) {
            const index = number - 1; {
                gameStarted ? handlePlayAudio(75) : handlePlayAudio(number)
            } // Play the corresponding audio
        }
    }, [number]);

    function getLetter(number) {
        if (number >= 1 && number <= 15) {
            return 'B';
        } else if (number >= 16 && number <= 30) {
            return 'I';
        } else if (number >= 31 && number <= 45) {
            return 'N';
        } else if (number >= 46 && number <= 60) {
            return 'G';
        } else {
            return 'O';
        }
    }
    return ( <
        LastCalledNumberContainer key = {
            number
        } >

        <
        Stack >

        <
        Typography fontSize = {
            100
        }
        alignSelf = "center"
        color = "black"
        fontWeight = "bold" > {
            number
        } <
        /Typography> <
        Typography fontSize = {
            30
        }
        alignSelf = "center"
        color = "black"
        fontWeight = "bold" > {
            getLetter(number)
        } <
        /Typography> <
        /Stack> <
        /LastCalledNumberContainer>
    );
};



// const synthesizeSpeech = async (text) => {
//     const apiKey = 'AIzaSyCJ3eXrf7pHHsll_yGQZMyAzc4kGhTTjf8'; // Replace with your actual API key
//     const requestBody = {
//         input: { text: text },
//         voice: { languageCode: 'en-GB', name: 'en-GB-Standard-A' },
//         audioConfig: { audioEncoding: 'MP3' }
//     };

//     try {
//         const response = await axios.post(
//             `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
//             requestBody,
//             {
//                 headers: {
//                     'Content-Type': 'application/json'
//                 }
//             }
//         );

//         // Assuming your API response contains audio data, you can play it
//         const audioBlob = new Blob([response.data.audioContent], { type: 'audio/mpeg' });
//         const audioUrl = URL.createObjectURL(audioBlob);
//         const audio = new Audio(audioUrl);
//         audio.play();
//     } catch (error) {
//         console.error('Error synthesizing speech:', error);
//     }
// };


export default function Home() {

    const navigate = useNavigate();
    const [age, setAge] = React.useState(10);
    const [isMale, setIsMale] = React.useState('false')
    const [voice, setVoice] = React.useState('MALE');
    const [languageCode, setLanguageCode] = React.useState('am-ET');
    const [openHistoryDialog, setOpenHistoryDialog] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [currentGameDocRef, setCurrentGameDocRef] = useState(null);
    const {
        t
    } = useTranslation();
    const [superAgentName, setSuperAgentName] = useState('');
    const [superAgentPhone, setSuperAgentPhone] = useState('');

    const uid = localStorage.getItem('uid'); // Assuming uid is stored in localStorage
    const { userData } = useUser();

    useEffect(() => {
        const fetchSuperAgent = async () => {
            const db = getFirestore();
            const userQuery = query(collection(db, 'users'), where('uid', '==', uid));
            const userSnapshot = await getDocs(userQuery);
            const userData = userSnapshot.docs[0] ?.data();
            console.log(`userData:${userData.adminId}`);
            if (userData ?.adminId) {
                // Use the adminID as the document ID
                const superAgentDocRef = doc(db, 'users', userData.adminId);
                const superAgentDoc = await getDoc(superAgentDocRef);
                console.log(superAgentDoc);
                if (superAgentDoc.exists()) {
                    setSuperAgentName(superAgentDoc.data().userName);
                    setSuperAgentPhone(superAgentDoc.data().phone);
                }
            }
        };

        fetchSuperAgent();
    }, [uid]);
    const handleOpenHistoryDialog = () => {
        setOpenHistoryDialog(true);
    };
    const handleCloseHistoryDialog = () => {
        setOpenHistoryDialog(false);

    };
    const handleChange = (event) => {
        const selectedValue = event.target.value;
        setAge(selectedValue);

        // Check if the selected value is "Male-Amharic"
        if (selectedValue === 10) {
            // Save the gender in local storage
            setLanguageCode('am-ET')
            setIsMale('True')
            setVoice('MALE')
        } else if (selectedValue === 20) {
            // Clear the gender from local storage if not male
            setIsMale('False')

            setLanguageCode('am-ET')

            setVoice('FEMALE')
        } else if (selectedValue === 30) {
            // Clear the gender from local storage if not male
            setIsMale('False')

            setLanguageCode('en-US')

            setVoice('MALE')
        } else if (selectedValue === 40) {
            // Clear the gender from local storage if not male
            setIsMale('False')

            setLanguageCode('en-US')

            setVoice('FEMALE')
        }
    };

    const [gradientColor, setGradientColor] = useState('');



    const generateRandomGradient = () => {
        const gradientColors = ['#ff5733', '#33ff57', '#5733ff', '#ffff33', '#33ffff'];
        const randomGradient = `linear-gradient(to bottom right, ${gradientColors[Math.floor(Math.random() * gradientColors.length)]}, ${gradientColors[Math.floor(Math.random() * gradientColors.length)]})`;
        setGradientColor(randomGradient);
    };
    const [isGameStarted, setIsGameStarted] = useState(JSON.parse(localStorage.getItem('isGameStarted')) || false);
    const [gender, setGender] = useState('MALE');

    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const clickedNumbersString = queryParams.get('numbers');
    const {
        betAmount
    } = useParams();

    const [isBright, setIsBright] = React.useState(true);
    const [autoCall, setAutoCall] = React.useState(false);
    const [intervalSeconds, setIntervalSeconds] = React.useState(3); // Initial interval is 50 seconds
    const [calledNumbers, setCalledNumbers] = React.useState(() => {
        const storedCalledNumbers = JSON.parse(localStorage.getItem('calledNumbers')) || {
            b: [],
            i: [],
            n: ['free'],
            g: [],
            o: []
        };
        return storedCalledNumbers;
    });
    const [intervalId, setIntervalId] = React.useState(null);

    const [lastCalledNumber, setLastCalledNumber] = React.useState(null);
    const [lastThreeCalledNumbers, setLastThreeCalledNumbers] = React.useState([]);
    const [lastCalledNumbers, setLastCalledNumbers] = React.useState([]);
    useEffect(() => {
        const storedCalledNumbers = JSON.parse(localStorage.getItem('calledNumbers'));
        if (storedCalledNumbers) {
            setCalledNumbers(storedCalledNumbers);
        }
    }, []);
    const [userPhone, setUserPhone] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [actualCode, setActualCode] = useState(null);
    const [isPhoneVerificationDialogOpen, setPhoneVerificationDialogOpen] =
    useState(false);
    // Save calledNumbers and isGameStarted to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('calledNumbers', JSON.stringify(calledNumbers));
        localStorage.setItem('isGameStarted', JSON.stringify(isGameStarted));
    }, [calledNumbers, isGameStarted]);
    useEffect(() => {
        generateRandomGradient();
    }, [lastCalledNumber]);

    const toggleShuffle = () => {
        playAudio(76)
        setIsShuffling(true);
        setTimeout(() => setIsShuffling(false), 3000); // Shuffles colors for 3 seconds
    };
    // In your Home component or wherever you handle fullscreen mode
    const handleFullscreen = () => {
        // Toggle fullscreen mode
        const isInFullScreen = (document.fullscreenElement && document.fullscreenElement !== null) ||
            (document.webkitFullscreenElement && document.webkitFullscreenElement !== null);

        if (!isInFullScreen) {
            // Enter fullscreen
            const element = document.documentElement;
            if (element.requestFullscreen) {
                element.requestFullscreen();
            } else if (element.webkitRequestFullscreen) {
                element.webkitRequestFullscreen();
            }
        } else {
            // Exit fullscreen
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            }
        }
    };


    const handleSunClick = () => {
        setIsBright(prevState => !prevState);
    };

    const numbers = React.useMemo(() => {
        const numbers = [];
        for (let i = 0; i < 5; i++) {
            numbers.push(Array.from({
                length: 15
            }, (_, index) => index + i * 15 + 1));
        }
        return numbers;
    }, []);

    const allNumbers = numbers.flat();

    const callNumber = React.useCallback(async () => {
        const availableNumbers = allNumbers.filter(number => {
            const category = number <= 15 ? 'b' : number <= 30 ? 'i' : number <= 45 ? 'n' : number <= 60 ? 'g' : 'o';
            return !calledNumbers[category] ?.includes(number);
        });
        if (availableNumbers.length > 0) {
            const randomIndex = Math.floor(Math.random() * availableNumbers.length);
            const randomNumber = availableNumbers[randomIndex];
            const category = randomNumber <= 15 ? 'b' : randomNumber <= 30 ? 'i' : randomNumber <= 45 ? 'n' : randomNumber <= 60 ? 'g' : 'o';
            setCalledNumbers(prevCalledNumbers => ({
                ...prevCalledNumbers,
                [category]: [...prevCalledNumbers[category], randomNumber]
            }));
            setLastCalledNumber(randomNumber);

            setLastThreeCalledNumbers(prevCalledNumbers => {
                const updatedNumbers = [randomNumber, ...prevCalledNumbers ?.slice(0, 4)];
                return updatedNumbers;
            });
            setLastCalledNumbers(prevCalledNumbers => {
                const updatedNumbers = [randomNumber, ...prevCalledNumbers];
                return updatedNumbers;
            });
            // synthesizeSpeech(randomNumber.toString()); // Assuming randomNumber is the called number
            // Save the called number to the Firebase document in real-time

            if (currentGameDocRef) {
                try {
                    await updateDoc(currentGameDocRef, {
                        lastCalledNumbers: arrayUnion(randomNumber)
                    });
                    console.log("Number saved:", randomNumber);
                } catch (error) {
                    console.error("Error saving called number:", error);
                }
            }
        }
    }, [allNumbers, calledNumbers, currentGameDocRef]);





    const [gameStarted, setGameStarted] = React.useState(false);

    const requestRef = useRef(null); // Reference for requestAnimationFrame
    const lastCallTimeRef = useRef(0); // Time tracking for interval

    const handleAutoCall = () => {
        setAutoCall(prev => !prev);
        if (!autoCall) setIsGameStarted(true);
        if (autoCall) setIsGameStarted(false)
    };
    const animate = useCallback((timestamp) => {
        if (!lastCallTimeRef.current) {
            lastCallTimeRef.current = timestamp;
        }
        setGameStarted()
        const elapsed = timestamp - lastCallTimeRef.current;

        // Check if elapsed time has passed our interval
        if (elapsed >= intervalSeconds * 1000) {
            callNumber(); // Call a number
            lastCallTimeRef.current = timestamp; // Reset the last call time
        }

        if (autoCall) {
            requestRef.current = requestAnimationFrame(animate);
        }
    }, [autoCall, intervalSeconds, callNumber]);

    // Effect to start/stop the animation loop
    useEffect(() => {
        if (autoCall) {
            requestRef.current = requestAnimationFrame(animate);
        } else {
            cancelAnimationFrame(requestRef.current);
        }

        return () => cancelAnimationFrame(requestRef.current); // Cleanup on unmount or autoCall change
    }, [autoCall, animate]);



    const handleReRoute = async () => {
        setAutoCall(false); // Stop auto calling
        setCalledNumbers({
            b: [],
            i: [],
            n: ['free'],
            g: [],
            o: []
        });
        setLastCalledNumber(null)
        setIsGameStarted(false);
        const uid = localStorage.getItem('uid');
        if (uid) {
            const db = getFirestore();
            const pointsCollection = collection(db, 'points');
            const userPointsQuery = query(pointsCollection, where('uid', '==', uid));
            const userPointsSnapshot = await getDocs(userPointsQuery);
            const userPointsDoc = userPointsSnapshot.docs[0];
            playAudio(stopBingo)


        }
    };

    const handleCallNextNumber = () => {
        callNumber();
        setGameStarted(false)

    };
    const [isShuffling, setIsShuffling] = useState(false);




    const syncWithFirebase = () => {
        const cachedData = getCachedData();
        if (cachedData) {
            // Update Firebase database with cached data
            app.database().ref('path/to/data').set(cachedData)
                .then(() => {
                    console.log('Data synchronized with Firebase');
                })
                .catch(error => {
                    console.error('Error synchronizing data with Firebase:', error);
                });
        }
    };

    // Function to retrieve cached data from localStorage
    const getCachedData = () => {
        const cachedData = localStorage.getItem('cachedData');
        return cachedData ? JSON.parse(cachedData) : null;
    };

    // Effect to sync with Firebase when online
    useEffect(() => {
        const handleOnline = () => {
            console.log('Device is back online');
            syncWithFirebase();
        };

        window.addEventListener('online', handleOnline);

        return () => {
            window.removeEventListener('online', handleOnline);
        };
    }, []);

    // Initial synchronization with Firebase when the app loads
    useEffect(() => {
        syncWithFirebase();
    }, []);
    const [isToggled, setIsToggled] = useState(false);
    const [isBlink, setIsBlinking] = useState(false);
    const [timeLeft, setTimeLeft] = React.useState('');
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
    }, [])
    const toggleColors = async () => {
        playAudio(76)
        let toggle = true;

        for (let i = 0; i < 10; i++) {
            setIsToggled(toggle);
            toggle = !toggle;
            await new Promise(resolve => setTimeout(resolve, 200));
        }
        setIsToggled(false);
    };
    const Blink = async () => {

        let toggle = true;

        for (let i = 0; i < 10; i++) {
            setIsBlinking(toggle);
            toggle = !toggle;
            await new Promise(resolve => setTimeout(resolve, 200));
        }
        setIsToggled(false);
    };


    // Enable offline persistence if not already done





    const handleNewGame = async () => {
        const db = getFirestore();
        const uid = localStorage.getItem('uid');
        setIsLoading(true);

        if (!uid) {
            toast.error('User not authenticated. Please log in.');
            setIsLoading(false);
            return;
        }

        const currentUser = userData;
        if (!currentUser) {
            toast.error('User data not available. Please refresh.');
            setIsLoading(false);
            return;
        }

        // Phone verification gate removed (per user request 2026-06-05) — see docs/superpowers/crownbingo-phone-verification-removal.md
        // Phone is now optional. The /savePhone page and the PhoneVerificationDialog component
        // are still available, but no longer enforced as a gate to start a new game.
        // if (!currentUser.isVerified) {
        //     setUserPhone(currentUser.phone || '');
        //     setPhoneVerificationDialogOpen(true);
        //     setIsLoading(false);
        //     return;
        // }

        const currentBalance = currentUser.balance || 0;
        const casherPercent = currentUser.casher_percent || 0;
        const requiredAmount = betAmount - (betAmount * casherPercent / 100);

        if (currentBalance < requiredAmount) {
            setIsGameStarted(false);
            toast.error('Please Update Points and Try Again');
            alert('You are out of points please update and Try Again');
            setIsLoading(false);
            return;
        }

        const prizeMoney = betAmount * casherPercent / 100;
        const userDocRef = doc(db, 'users', uid);
        const historiesCollection = collection(db, 'users', uid, 'histories');

        try {
            await updateDoc(userDocRef, {
                balance: increment(-prizeMoney)
            });

            await addDoc(historiesCollection, {
                points: currentBalance - prizeMoney,
                betAmount: betAmount,
                cahser_percent: casherPercent,
                date: Timestamp.now(),
            });

            toast.success('Game successfully created!');
            playAudio(77);
            setIsGameStarted(true);
        } catch (err) {
            console.error('Failed to start new game:', err);
            toast.error('Failed to start game: ' + err.message);
        } finally {
            setIsLoading(false);
        }
    }



    const handleClickNumber = (number) => {
        const category = number <= 15 ? 'b' : number <= 30 ? 'i' : number <= 45 ? 'n' : number <= 60 ? 'g' : 'o';
        setCalledNumbers(prevCalledNumbers => ({
            ...prevCalledNumbers,
            [category]: [...prevCalledNumbers[category], number]
        }));
    };
    const inputNumbers = localStorage.getItem('clickedNumbers')
    const selectedCartelas = localStorage.getItem('selectedCartelas');
    let selectedCard = {};
    let selectedCards = [];

    const cleanedInputNumbers = inputNumbers.slice(1, -1).split(',').map(Number);

    const filteredCards = React.useMemo(() => {

        return cards.filter(card => {
            const cardNumber = Number(card.cardname.replace('card', ''));
            return cleanedInputNumbers.includes(cardNumber);
        });
    }, [inputNumbers]);





    const calledNumbersCount = Object.values(calledNumbers).reduce((acc, category) => {
        return acc + category.length;
    }, 0);

    const unlockAllNumbers = () => {
        // Logic to unlock all locked numbers
    };
    const containerStyle = {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
    };

    const numberStyle = {
        margin: '4px', // Adjust the margin as needed
        padding: '8px',
        backgroundColor: '#ffffff', // Example background color
    };


    return ( <
        HomeContainer sx = {
            {
                background: isBright ? 'linear-gradient(to left right, #15153f, #070b17)' : 'red'
            }
        } >
        <
        Stack height = {
            12
        }
        width = "100%"
        sx = {
            {
                backgroundColor: isBright ? '#222222' : 'red'
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
        paddingTop = {
            20
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
        Grid item xs = {
            1
        } > {!autoCall ? < TemporaryDrawer / > : null
        } <
        /Grid>

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
        /Stack>

        <
        Stack direction = {
            'row'
        }
        paddingLeft = {
            10
        }
        paddingTop = {
            12
        }
        spacing = {
            2
        }
        height = {
            70
        }
        justifyContent = {
            'space-between'
        } >



        <
        /Stack>

        <
        Stack height = {
            '60%'
        } >
        <
        Box sx = {
            {
                border: 1, // Adds a border

                borderColor: 'rgba(77, 242, 27, 0.6)',
                width: '90%',
                boxShadow: '15px 6px 12px rgba(77, 242, 27, 0.6)'
            }
        } >
        <
        BingoNumbers numbers = {
            numbers
        }
        calledNumbers = {
            calledNumbers
        }
        handleClickNumber = {
            handleClickNumber
        }
        lastCalledNumber = {
            lastCalledNumber
        }
        isToggled = {
            isToggled
        }
        />

        <
        /Box> <
        Typography style = {
            {
                color: 'white',
                paddingTop: '20px'
            }
        }
        fontWeight = "bold"
        fontSize = {
            {
                xs: '1rem',
                sm: '1.8rem',
                md: '1.55rem'
            }
        } // Responsive font size
        lineHeight = {
            1
        } > {
            superAgentName
        }
        Bingo - {
            superAgentPhone
        } < /Typography>



        <
        Stack direction = "row"
        spacing = {
            3
        }
        mt = {
            {
                xs: 2,
                md: 4
            }
        }
        sx = {
            {
                justifyContent: 'space-evenly',
                position: 'relative',
                zIndex: 2,
                width: '100%',
                height: '100%',
                alignItems: 'center',
            }
        } >

        <
        Stack sx = {
            {
                width: {
                    xs: '80px',
                    md: '120px'
                },
                height: '70%'
            }
        } >
        <
        Box paddingX = {
            {
                xs: 1,
                md: 2
            }
        }
        /> <
        div style = {
            {
                height: '240px',
                width: '240px',
                maxWidth: '320px',
                aspectRatio: '1',
                borderRadius: '50%',
                background: gradientColor,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                boxShadow: '0px 0px 20px rgba(0, 150, 136, 0.5), 0px 0px 40px rgba(0, 150, 136, 0.3)',
                transition: 'transform 0.3s ease-in-out',
            }
        } >
        <
        div style = {
            {
                width: '210px',
                height: '210px',
                aspectRatio: '1',
                borderRadius: '50%',
                background: '#f6f6f6',
                border: '3px solid white',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                boxShadow: 'inset 0px 0px 15px rgba(0, 0, 0, 0.2)',
            }
        } >
        <
        div style = {
            {
                width: '85%',
                aspectRatio: '1',
                borderRadius: '50%',
                background: 'linear-gradient(to bottom right, #cecece, #ffffff)',
                border: '2px solid red',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                boxShadow: '0px 0px 15px rgba(255, 0, 0, 0.4)',
            }
        } >
        {
            lastCalledNumber !== null && ( <
                LastCalledNumber number = {
                    lastCalledNumber
                }
                voice = {
                    voice
                }
                languageCode = {
                    languageCode
                }
                isMale = {
                    isMale
                }
                gameStarted = {
                    gameStarted
                }
                />
            )
        } <
        /div> <
        /div> <
        /div>

        <
        LastCalledNumbers lastCalledNumbers = {
            lastThreeCalledNumbers
        }
        /> <
        /Stack> <
        Stack spacing = {
            3
        }
        width = {
            240
        }
        direction = {
            'row'
        } >
        <
        Stack spacing = {
            3
        }
        width = {
            120
        } >

        {
            isGameStarted ? !autoCall ?

            <
            Button onClick = {
                handleAutoCall
            }
            variant = "contained"
            sx = {
                {
                    background: 'green',
                    borderColor: 'white',
                    fontWeight: 'bold'
                }
            } > Start Auto Call < /Button>

            :
            < Button variant = "contained"
            onClick = {
                () => {
                    playAudio(75);
                    setGameStarted(true);
                    clearInterval(intervalId); // Clear the interval
                    setAutoCall(false); // Set autoCall state to false
                }
            }
            sx = {
                {
                    background: 'linear-gradient(to bottom, #fff521 35%, #9d9302 75%)',
                    color: 'black',
                }
            } >
            <
            Typography fontSize = {
                14
            }
            fontWeight = {
                'bold'
            } > {
                'Stop Auto Call'
            } < /Typography> <
            /Button> :
            isLoading ? < CircularProgress / > : < Button
            variant = "outlined"
            onClick = {
                handleNewGame
            }

            sx = {
                {

                    background: 'linear-gradient(135deg, #8107f2, #8107f2)', // Yellow gradient
                    color: 'black',
                    fontWeight: 'bold',
                    boxShadow: '0px 4px 10px rgba(255, 193, 7, 0.6)', // Yellow glow shadow
                    transition: 'transform 0.2s ease-in-out',
                    ':hover': {
                        background: 'linear-gradient(135deg, #FFC300, #FFB300)', // Slightly darker on hover
                        transform: 'scale(1.05)', // Slight zoom on hover
                        boxShadow: '0px 6px 12px rgba(255, 193, 7, 0.8)',
                    },
                }
            }

            >
            <
            Typography color = {
                'white'
            }
            fontWeight = "bold"
            fontFamily = "sans-serif"
            fontSize = {
                14
            }
            sx = {
                {
                    background: 'none'
                }
            } > {
                t('Create New Game')
            } <
            /Typography> <
            /Button>


        }


        {
            isGameStarted ? < Button variant = "outlined"
            sx = {
                    {
                        background: 'green', // Yellow gradient
                        color: 'black',
                        fontWeight: 'bold',
                        boxShadow: '0px 4px 10px rgba(255, 193, 7, 0.6)', // Yellow glow shadow
                        transition: 'transform 0.2s ease-in-out',
                        ':hover': {
                            background: 'linear-gradient(135deg, #FFC300, #FFB300)', // Slightly darker on hover
                            transform: 'scale(1.05)', // Slight zoom on hover
                            boxShadow: '0px 6px 12px rgba(255, 193, 7, 0.8)',
                        },
                    }
                } >
                <
                Typography color = {
                    'white'
                }
            fontSize = {
                10
            }
            fontWeight = {
                    'bold'
                } > {
                    t("Shuffle")
                } < /Typography> <
                /Button> : <
                Button onClick = {
                    toggleColors
                }
            variant = "outlined"
            sx = {
                    {
                        background: 'linear-gradient(135deg, #8107f2, #8107f2)', // Yellow gradient
                        color: 'black',
                        fontWeight: 'bold',
                        boxShadow: '0px 4px 10px rgba(255, 193, 7, 0.6)', // Yellow glow shadow
                        transition: 'transform 0.2s ease-in-out',
                        ':hover': {
                            background: 'linear-gradient(135deg, #FFC300, #FFB300)', // Slightly darker on hover
                            transform: 'scale(1.05)', // Slight zoom on hover
                            boxShadow: '0px 6px 12px rgba(255, 193, 7, 0.8)',
                        },
                    }
                } >
                <
                Typography color = {
                    'white'
                }
            fontSize = {
                10
            }
            fontWeight = {
                    'bold'
                } > {
                    t("Shuffle")
                } < /Typography> <
                /Button>

        }

        {
            /* {isGameStarted?
            <Button  onClick={handleOpenHistoryDialog}  variant="outlined"   sx={{ color: 'white', borderColor: 'white' }}>
                <Typography fontWeight={'bold'}>show call history</Typography>
            </Button>:null} */
        } <
        useZoom / >

        <
        Dialog onClose = {
            handleCloseHistoryDialog
        }
        aria-labelledby = "first-dialog-title"
        open = {
            openHistoryDialog
        } >
        <
        DialogContent dividers sx = {
            {
                backgroundColor: '#222222'
            }
        } >
        <
        Stack >
        <
        div style = {
            containerStyle
        } > {
            lastCalledNumbers ?.map((number, index) => ( <
                div key = {
                    index
                }
                style = {
                    numberStyle
                } >
                <
                Box sx = {
                    {
                        borderRadius: 15,
                        background: 'white'
                    }
                } >
                <
                Typography variant = 'h5' > {
                    number
                } < /Typography> </Box >
                <
                /div>
            ))
        } <
        /div> <
        /Stack> <
        /DialogContent>

        <
        /Dialog>

        <
        /Stack> <
        Stack spacing = {
            3
        }
        width = {
            120
        } >



        {
            isGameStarted ? autoCall ? < Button onClick = {
                handleCallNextNumber
            }
            variant = "outlined"
            disabled sx = {
                {
                    color: 'white',
                    borderColor: 'white'
                }
            } > < Typography fontSize = {
                10
            }
            fontWeight = {
                'bold'
            } > {
                t("Call Next Number")
            } < /Typography></Button > :
            <
            Button onClick = {
                handleCallNextNumber
            }
            variant = "outlined"
            sx = {
                {
                    color: 'white',
                    borderColor: 'white'
                }
            } > < Typography fontSize = {
                10
            }
            fontWeight = {
                'bold'
            } > {
                t("Call Next Number")
            } < /Typography></Button >
            :
                null
        } {
            isGameStarted ?
                <
                Button onClick = {
                    handleReRoute
                }
            variant = "outlined"
            sx = {
                {
                    color: 'white',
                    borderColor: 'white'
                }
            } > < Typography fontSize = {
                10
            }
            fontWeight = {
                    'bold'
                } > {
                    t("New Game")
                } < /Typography></Button >
                : null
        }

        <
        Button onClick = {
            () => navigate('/NewGame')
        }
        variant = "outlined"
        sx = {
            {
                color: 'white',
                borderColor: 'white',
                fontSize: '10',
                fontWeight: 'bold'
            }
        } > {
            t("Select Cartela")
        } <
        /Button> {
            /* {isGameStarted?
            <Button  onClick={handleOpenHistoryDialog}  variant="outlined"   sx={{ color: 'white', borderColor: 'white' }}>
                <Typography fontWeight={'bold'}>show call history</Typography>
            </Button>:null} */
        } <
        useZoom / >

        <
        Dialog onClose = {
            handleCloseHistoryDialog
        }
        aria-labelledby = "first-dialog-title"
        open = {
            openHistoryDialog
        } >
        <
        DialogContent dividers sx = {
            {
                backgroundColor: '#222222'
            }
        } >
        <
        Stack >
        <
        div style = {
            containerStyle
        } > {
            lastCalledNumbers ?.map((number, index) => ( <
                div key = {
                    index
                }
                style = {
                    numberStyle
                } >
                <
                Box sx = {
                    {
                        borderRadius: 15,
                        background: 'white'
                    }
                } >
                <
                Typography variant = 'h5' > {
                    number
                } < /Typography> </Box >
                <
                /div>
            ))
        } <
        /div> <
        /Stack> <
        /DialogContent>

        <
        /Dialog>

        <
        /Stack> <
        /Stack> <
        Stack spacing = {
            3
        } >
        <
        Box >
        <
        Box width = {
            50
        }
        /> <
        Stack alignItems = {
            'center'
        } >



        <
        /Stack> <
        Box width = {
            50
        }
        />


        <
        Grid item xs = {
            6
        }
        align = "center" >
        <
        Grid item xs = {
            3
        }
        display = "flex"
        width = {
            '100%'
        }
        justifyContent = "start"
        paddingLeft = {
            3
        } >
        <
        LanguageSelector / > < Box >
        <
        IconButton onClick = {
            handleSunClick
        }
        sx = {
            {
                mr: {
                    xs: 1,
                    md: 2
                },
                color: 'primary.main',
            }
        } >
        <
        Brightness5Icon / >
        <
        /IconButton>

        <
        IconButton onClick = {
            handleFullscreen
        }
        sx = {
            {
                color: 'primary.main'
            }
        } >
        <
        FullscreenIcon / >
        <
        /IconButton>

        <
        /Box> <
        /Grid> <
        /Grid> <
        /Box> {
            /* <Stack direction={'row'} paddingLeft={3} alignContent={'center'} spacing={4}>
                       <Typography fontWeight={'bold'} fontSize={20} color={'white'}>{t("Caller Selection")}:</Typography>
                       <Box sx={{ minWidth: 120 , backgroundColor:'white' }}>
                  <FormControl fullWidth>
                    <Select
                      labelId="demo-simple-select-label"
                      id="demo-simple-select"
                      
                      value={age}
                      label="Age"
                      onChange={handleChange}
                    >
                      <MenuItem value={10}>Male-Amharic</MenuItem>
                      <MenuItem value={20}>Female-Amharic</MenuItem>
                      <MenuItem value={30}>Male-English</MenuItem>
                      <MenuItem value={40}>Female-English</MenuItem>

                    </Select>
                  </FormControl>
                </Box>
                     </Stack> */
        } <
        Stack direction = {
            'row'
        }
        paddingLeft = {
            3
        }
        alignContent = {
            'center'
        }
        spacing = {
            4
        } >
        <
        Typography color = {
            'white'
        } > {
            t("Speed")
        }: < /Typography>

        <
        Box sx = {
            {
                width: 300
            }
        } > {
            /* <Slider
                    size="small"
                    defaultValue={70}
                    aria-label="Small"
                    valueLabelDisplay="auto"
                  /> */
        } {
            isGameStarted ?
                <
                Slider
            defaultValue = {
                3
            }
            aria-label = "Default"
            valueLabelDisplay = "auto"
            step = {
                1
            }
            min = {
                1
            }
            max = {
                10
            }
            onChange = {
                (e, value) => setIntervalSeconds(value)
            }
            />: null
        } < /Box>   </Stack >
        <
        Stack direction = {
            'row'
        }
        paddingLeft = {
            3
        }
        alignContent = {
            'center'
        }
        spacing = {
            4
        } >

        {
            isGameStarted ?
            autoCall ? null :
            <
            CustomizedDialogs cards = {
                filteredCards
            }
            calledNumbers = {
                calledNumbers
            }
            unlockAllNumbers = {
                unlockAllNumbers
            } // Pass the function as a prop
            /> : null}

            <
            Typography
            style = {
                gradientStyle
            }
            fontWeight = "bold"
            fontSize = {
                {
                    xs: '1rem',
                    sm: '1.8rem',
                    md: '1.55rem'
                }
            } // Responsive font size
            lineHeight = {
                1
            } >
            CROWN BINGO <
            /Typography> <
            /Stack> <
            /Stack> <
            Stack alignItems = "center"
            mt = {
                2
            } >



            <
            div
            style = {
                {
                    height: '280px',
                    width: '280px',
                    maxWidth: '320px',
                    aspectRatio: '1',
                    borderRadius: '50%',
                    background: gradientColor,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    boxShadow: '0px 0px 20px rgba(0, 150, 136, 0.5), 0px 0px 40px rgba(0, 150, 136, 0.3)',
                    transition: 'transform 0.3s ease-in-out',
                }
            } >
            <
            div
            style = {
                {
                    width: '250px',
                    height: '250px',
                    aspectRatio: '1',
                    borderRadius: '50%',
                    background: '#f6f6f6',
                    border: '3px solid white',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    boxShadow: 'inset 0px 0px 15px rgba(0, 0, 0, 0.2)',
                }
            } >
            <
            div
            style = {
                {
                    width: '90%',
                    aspectRatio: '1',
                    borderRadius: '50%',
                    background: 'linear-gradient(to bottom right, #cecece, #ffffff)',
                    border: '2px solid red',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    boxShadow: '0px 0px 15px rgba(255, 0, 0, 0.4)',
                }
            } >
            <
            Stack alignItems = "center" >
            <
            Stack direction = {
                'row'
            } >
            <
            Typography
            sx = {
                {
                    color: 'black',
                    fontSize: {
                        xs: 40,
                        md: 90
                    },
                    fontWeight: 'bold',
                    textShadow: '2px 2px 4px rgba(34, 185, 4, 0.4)',
                }
            } >
            {
                (betAmount - betAmount * (userData?.casher_percent || 0) / 100).toFixed(0)
            } <
            /Typography> <
            Typography fontSize = {
                25
            } > ብር < /Typography>

            <
            /Stack> <
            /Stack> <
            /div> <
            /div> <
            /div> <
            Stack direction = {
                'row'
            }
            justifyContent = {
                'space-around'
            }
            alignItems = {
                'end'
            } >
            <
            Typography sx = {
                {
                    fontSize: {
                        xs: 10,
                        md: 25
                    },
                    fontWeight: 'bold',
                    color: 'white'
                }
            } > {
                t("Money")
            } <
            /Typography>

            <
            /Stack> <
            /Stack> <
            /Stack> <
            /Stack> <
            PhoneVerificationDialog
            isOpen = {
                isPhoneVerificationDialogOpen
            }
            onClose = {
                () => setPhoneVerificationDialogOpen(false)
            }
            uid = {
                localStorage.getItem('uid')
            }
            /> <
            /HomeContainer>
        );
    }