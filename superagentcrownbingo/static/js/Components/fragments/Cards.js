import * as React from 'react';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import Title from '../../Title';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import {
    AdapterDayjs
} from '@mui/x-date-pickers/AdapterDayjs';
import {
    LocalizationProvider
} from '@mui/x-date-pickers/LocalizationProvider';
import {
    DatePicker
} from '@mui/x-date-pickers/DatePicker';

function preventDefault(event) {
    event.preventDefault();
}

export default function Deposits({
    title,
    amount
}) {
    return (

        <
        Grid item xs = {
            12
        }
        md = {
            4
        }
        lg = {
            3
        }
        sx = {
            {
                color: '#0000'
            }
        } >
        <
        Paper sx = {
            {
                background: 'black',
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                borderRadius: '12px',
                width: 300,
                transition: 'box-shadow 0.3s ease-in-out'
            }
        } >
        <
        div style = {
            {
                position: 'relative',
                borderRadius: '12px',
                transition: 'box-shadow 0.3s ease-in-out'
            }
        } >
        <
        div style = {
            {
                display: 'flex',
                alignItems: 'center'
            }
        } >
        <
        Typography sx = {
            {
                fontFamily: 'Helvetica',
                fontSize: '15px',
                color: 'white'
            }
        } > {
            title
        } < /Typography> <
        /div> <
        Stack direction = {
            'row'
        }
        justifyContent = {
            'space-between'
        } >
        <
        Typography component = "p"
        variant = "h3"
        style = {
            {
                marginTop: '36px',
                marginBottom: '8px',
                fontFamily: 'Arial',
                fontWeight: 'bold',
                color: 'green'
            }
        } > {
            Math.floor(amount)
        } < /Typography> <
        Card > < /Card> <
        AccountBalanceIcon sx = {
            {
                fontSize: 30,
                marginRight: '12px',
                alignSelf: 'flex-end',
                color: 'green'
            }
        }
        /> <
        /Stack>

        {
            /* <Typography color="text.secondary" sx={{ flex: 1, fontFamily: 'Arial', fontSize: '16px' }}>
                    on 15 March, 2019
                  </Typography>
                  <div style={{justifyContent:'end'}}>
                  <AccountBalanceIcon sx={{ fontSize: 40, marginRight: '12px', alignSelf:'flex-end'}} />

                  </div> */
        } <
        /div> <
        /Paper> <
        /Grid>

    );
}