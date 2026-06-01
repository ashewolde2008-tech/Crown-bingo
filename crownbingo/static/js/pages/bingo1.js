import React, {
    useEffect,
    useState
} from 'react';
import {
    Box,
    Typography,
    Paper
} from '@mui/material';
import jack from './jack.png';
import crown from './crown.png';
import {
    doc,
    onSnapshot
} from "firebase/firestore";
import {
    db
} from '../firebase';
import Confetti from 'react-confetti';

const VegasWheel = () => {
    const [jackpotStatus, setJackpotStatus] = useState({
        isClaimed: false,
        winnerName: '',
        prizeAmount: 0
    });

    useEffect(() => {
        // Firestore real-time listener for jackpot status
        const jackpotRef = doc(db, "jackpots", "currentJackpot");

        const unsubscribe = onSnapshot(jackpotRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.data();
                setJackpotStatus({
                    isClaimed: data.isClaimed || false,
                    winnerName: data.winnersName || '',
                    prizeAmount: data.prizeAmount || 0
                });
            } else {
                console.error("Jackpot document does not exist.");
            }
        });

        return () => unsubscribe(); // Cleanup listener on component unmount
    }, []);

    return ( <
        Paper elevation = {
            3
        }
        sx = {
            {
                paddingTopL: 2,
                backgroundColor: '#1e3a8a',
                padding: 3,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'relative',
                overflow: 'hidden',
                width: '100%',
                maxWidth: 1000,
                boxShadow: '0 8px 20px rgba(0, 0, 0, 0.5)',

            }
        } >
        {
            jackpotStatus.isClaimed && ( <
                Confetti numberOfPieces = {
                    300
                }
                gravity = {
                    0.2
                }
                recycle = {
                    false
                }
                width = {
                    600
                }
                height = {
                    400
                }
                />
            )
        } { /* Background gradient */ } <
        Box sx = {
            {
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'linear-gradient(135deg, #845ec2, #1e3a8a)',
                opacity: 0.8,
                animation: 'sparkle 3s infinite',
                transform: 'translate(-50%, -50%)',
                zIndex: 1,
            }
        }
        />

        { /* Wheel graphic */ } <
        Box component = "img"
        src = {
            jack
        }
        alt = "Vegas Wheel"
        sx = {
            {
                width: 200,
                height: 200,
                zIndex: 10,
                animation: jackpotStatus.isClaimed ? 'pulse 3.5s infinite' : 'none',
            }
        }
        /> <
        Box sx = {
            {
                zIndex: 2,
                textAlign: 'center',
                ml: 2
            }
        } > {
            jackpotStatus.isClaimed ? ( <
                >
                <
                Typography variant = "h3"
                fontWeight = "bold"
                color = "#fff"
                sx = {
                    {
                        marginTop: 2,
                        textShadow: '0px 4px 8px rgba(255, 255, 255, 0.6)',
                        animation: 'glow 1.5s infinite',
                    }
                } > 🎉ጃክፖት አሸናፊዉ ታዉቋል!
                <
                /Typography> <
                Typography variant = "h4"
                fontWeight = 'bold'
                color = "#fff"
                sx = {
                    {
                        textShadow: '0px 2px 4px rgba(0, 0, 0, 0.6)',
                        animation: 'bounce 2s infinite',
                    }
                } >
                የ {
                    jackpotStatus.winnerName
                }
                bingo ቤት በጃክፖት {
                    jackpotStatus.prizeAmount
                }
                ብር አሸንፏል!
                <
                /Typography> <
                />
            ) : ( <
                >
                <
                Typography variant = "h3"
                fontWeight = "bold"
                color = "#fff"
                sx = {
                    {
                        marginTop: 2,
                        textShadow: '0px 4px 8px rgba(255, 255, 255, 0.6)',
                        animation: 'glow 1.5s infinite',
                    }
                } >
                የጃክፖቱ አሸናፊ በቅርቡ ይፋ ይሆናል <
                /Typography>

                <
                />
            )
        } <
        /Box>

        { /* Floating gold coins and crown icons */ } <
        Box component = "img"
        src = {
            crown
        }
        alt = "Gold Coin"
        sx = {
            {
                width: 25,
                height: 25,
                position: 'absolute',
                top: 15,
                left: 100,
                zIndex: 2,
            }
        }
        /> <
        Box component = "img"
        src = {
            crown
        }
        alt = "Crown"
        sx = {
            {
                width: 50,
                height: 50,
                position: 'absolute',
                top: 2,
                right: 10,
                zIndex: 10,
                animation: 'spin 2s linear infinite',

            }
        }
        /> { /* Styling Animations */ } <
        style > {
            `
          @keyframes pulse {
            0%, 100% {
              transform: scale(0.3);
            }
            50% {
              transform: scale(1.1);
            }
          }

          @keyframes glow {
            0%, 100% {
              text-shadow: 0 0 10px #fff, 0 0 20px #ff4081, 0 0 30px #ff4081;
            }
            50% {
              text-shadow: 0 0 20px #fff, 0 0 30px #ff4081, 0 0 40px #ff4081;
            }
          }

          @keyframes bounce {
            0%, 100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-10px);
            }
          }

          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }

          @keyframes sparkle {
            0%, 100% {
              transform: scale(1);
              opacity: 0.8;
            }
            50% {
              transform: scale(1.1);
              opacity: 1;
            }
          }
        `
        } <
        /style> <
        /Paper>
    );
};

export default VegasWheel;