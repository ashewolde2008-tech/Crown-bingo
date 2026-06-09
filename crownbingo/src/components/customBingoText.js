import React from 'react';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import {
    styled
} from '@mui/material/styles';
import '../pages/NumberGenerator.css'; // Import CSS for additional styles

// StyledButton component with gradient background and border
const StyledButton = styled(Button)(({
    theme
}) => ({
    width: 100,
    border: 5, // Adds a border

    borderColor: 'rgba(77, 242, 27, 0.6)',
    background: '#dbdbdb', // Gradient from top to bottom
    color: 'black', // Text color
}));

// CustomButton component
const CustomBingoText = ({
    children
}) => {
    return ( <
        StyledButton >
        <
        Typography color = "black"
        borderRadius = ".375rem"
        fontWeight = "bold"
        variant = 'h3' > {
            children
        } <
        /Typography> <
        /StyledButton>
    );
};

export default CustomBingoText;