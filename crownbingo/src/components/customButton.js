import React from 'react';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import {
    styled
} from '@mui/material/styles';

// StyledButton component with gradient background and border
const StyledButton = styled(Button)(({
    theme
}) => ({
    background: 'primary', // Gradient from top to bottom
    color: '#ebe305',
    borderRadius: 10 // Text color
}));

// CustomButton component
const CustomButton = ({
    children
}) => {
    return ( <
        StyledButton variant = "contained" >
        <
        Typography borderRadius = {
            '.375rem'
        }
        padding = {
            ".5rem"
        }
        fontWeight = {
            'bold'
        } > {
            children
        } <
        /Typography> <
        /StyledButton>
    );
};

export default CustomButton;