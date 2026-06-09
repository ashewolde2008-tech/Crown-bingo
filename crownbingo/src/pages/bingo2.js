import React from 'react';
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
    useEffect,
    useState
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

function Carousel({
    images
}) {
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