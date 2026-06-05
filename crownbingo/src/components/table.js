import React, {
    useState
} from 'react';
import {
    Box,
    Grid,
    Typography
} from '@mui/material';
import {
    styled
} from '@mui/material/styles';

// Styled cell with rectangle card
const Cell = styled(Box)(({
    theme
}) => ({
    width: '10px',
    height: '10px',
    border: '2px solid white',
    borderRadius: '10px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
}));

// Styled circle
const Circle = styled(Box)(({
    theme
}) => ({
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    background: 'red',
}));

const BingoTable = () => {
    const [selectedCells, setSelectedCells] = useState([]);

    // Function to toggle cell selection
    const toggleCell = (row, col) => {
        const cell = `${row}-${col}`;
        if (selectedCells.includes(cell)) {
            setSelectedCells(selectedCells.filter((c) => c !== cell));
        } else {
            setSelectedCells([...selectedCells, cell]);
        }
    };

    // Function to render a single cell
    const renderCell = (row, col) => {
        const cell = `${row}-${col}`;
        const isSelected = selectedCells.includes(cell);
        return ( <
            Cell key = {
                cell
            }
            onClick = {
                () => toggleCell(row, col)
            } > {
                isSelected ? < Circle / > : null
            } <
            /Cell>
        );
    };

    // Function to generate cells for a row
    const generateRowCells = (row) => {
        const cells = [];
        for (let col = 0; col < 5; col++) {
            cells.push(renderCell(row, col));
        }
        return cells;
    };

    // Function to generate rows for the table
    const generateTableRows = () => {
        const rows = [];
        for (let row = 0; row < 5; row++) {
            rows.push( <
                Grid key = {
                    row
                }
                container justifyContent = "center"
                spacing = {
                    2
                } > {
                    generateRowCells(row)
                } <
                /Grid>
            );
        }
        return rows;
    };

    return ( <
        Box >
        <
        Typography variant = "h4"
        align = "center"
        gutterBottom >
        BINGO <
        /Typography> <
        Grid container justifyContent = "center" > {
            generateTableRows()
        } <
        /Grid> <
        /Box>
    );
};

export default BingoTable;