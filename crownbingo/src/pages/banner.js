import React from 'react';
import {
    Box,
    Typography
} from '@mui/material';
import {
    styled
} from '@mui/system';
import SwipeableViews from 'react-swipeable-views';
import a from './ad2.png'
const ImageContainer = styled(Box)({
    width: '89.1%',
    height: '10%',

    position: 'relative',
    overflow: 'hidden',
    borderRadius: '10px',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.5)', // Shadow for glow effect
    border: '4px solid rgba(255, 215, 0, 0.7)', // Border with a semi-transparent gold color
});

const Image = styled('img')({
    width: '100%',
    height: '100%',
    transition: 'transform 0.5s ease',
    '&:hover': {
        transform: 'scale(1.05)',
    },
});

const SlideContainer = styled(Box)({
    display: 'flex',
    justifyContent: 'start',
    alignItems: 'left',
    background: 'black',

    borderRadius: '10px',
});

const SlideableImage = ({
    images
}) => {
    return ( <
        SwipeableViews enableMouseEvents > {
            images.map((src, index) => ( <
                SlideContainer key = {
                    index
                } >
                <
                ImageContainer >
                <
                Image src = {
                    src
                }
                alt = {
                    `Slide ${index + 1}`
                }
                /> <
                /ImageContainer> <
                /SlideContainer>
            ))
        } <
        /SwipeableViews>
    );
};

// Usage example
const images = [
    a, // Replace with your image URLs
    a,
    a,
];

export default function SlidableImageComponent() {
    return ( <
        Box sx = {
            {
                maxWidth: '100%',
                margin: '0 auto'
            }
        } >

        <
        SlideableImage images = {
            images
        }
        /> <
        /Box>
    );
}