import React from 'react';
import Slider from "react-slick";
import {
    Paper
} from '@mui/material';
import Crown2 from './banner24.jpg';
import Crown3 from './banner25.jpg';
import Crown4 from './banner26.jpg';
import Crown5 from './banner27.jpg';
import Crown6 from './banner28.jpg';
import Crown7 from './banner29.jpg';
import Crown8 from './banner30.jpg';
import Crown9 from './banner31.jpg';


import './carousel.css'; // Ensure to import the CSS for styling
import {
    useMediaQuery
} from '@mui/material';
import {
    createTheme
} from '@mui/material/styles';
import {
    useEffect,
    useState,
    useRef,
    useCallback
} from 'react';

const images = [Crown2, Crown3, Crown4, Crown5, Crown6, Crown7, Crown8, Crown9];

const BoorioPoker = () => {
    return ( <
        Paper elevation = {
            3
        }
        sx = {
            {
                width: '100%',
                maxWidth: 1000,
                height: 150, // Fixed height
                position: 'relative',
                padding: 0, // Remove padding
                margin: 0, // Ensure no margin
            }
        } >
        <
        Carousel images = {
            images
        }
        /> <
        /Paper>
    );
};

export default BoorioPoker;
const theme = createTheme({
    palette: {
        primary: {
            main: '#1976d2',
            light: '#63a4ff',
            dark: '#004ba0',
        },
        secondary: {
            main: '#ff4081',
            light: '#ff79b0',
            dark: '#c60055',
        },
    },
    shape: {
        borderRadius: 15,
    },
    typography: {
        fontFamily: 'Roboto, sans-serif',
        h5: {
            fontFamily: 'Source Sans Pro, sans-serif',
            fontWeight: 700,
        },
        body1: {
            fontFamily: 'Source Sans Pro, sans-serif',
        },
    },
    shadows: [
        'none',
        '0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)',
    ],
});

function Carousel({
    images
}) {
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const [height, setHeight] = useState(isSmallScreen ? '100px' : '150px');

    useEffect(() => {
        setHeight(isSmallScreen ? '100px' : '150px');
    }, [isSmallScreen]);

    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 20000);

        return () => clearInterval(intervalId);
    }, [images.length]);

    const slideStyle = {
        transform: `translateX(-${currentIndex * 100}%)`,
        transition: 'transform 0.5s ease-in-out',
        display: 'flex',
    };

    return ( <
        div className = "carousel-container"
        style = {
            {
                height: '100%',
                width: '100%',
                overflow: 'hidden',
                position: 'relative',
            }
        } >
        <
        div className = "carousel-wrapper"
        style = {
            slideStyle
        } > {
            images.map((image, index) => ( <
                img key = {
                    index
                }
                src = {
                    image
                }
                alt = {
                    `Slide ${index}`
                }
                style = {
                    {
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                    }
                }
                />
            ))
        } <
        /div> <
        /div>
    );
}