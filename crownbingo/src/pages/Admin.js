import React from 'react';
import {
    Container,
    Typography,
    Button,
    Paper,
    Grid
} from '@mui/material';
import CustomizedTables from '../components/UsersTable';

const AdminPage = () => {
    return ( <
        Container maxWidth = "lg"
        style = {
            {
                marginTop: '8vh'
            }
        } >
        <
        Typography variant = "h4"
        gutterBottom >
        Admin Page <
        /Typography> <
        Grid container spacing = {
            3
        } >
        <
        Grid item xs = {
            12
        }
        md = {
            6
        } >
        <
        Paper style = {
            {
                padding: '20px',
                textAlign: 'center'
            }
        } >
        <
        Button variant = "contained"
        color = "primary" > Add Cashers < /Button> <
        /Paper> <
        /Grid>

        <
        /Grid>

        <
        /Container>
    );
};

export default AdminPage;