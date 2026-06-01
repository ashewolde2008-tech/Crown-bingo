import * as React from 'react';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PeopleIcon from '@mui/icons-material/People';
import BarChartIcon from '@mui/icons-material/BarChart';
import LayersIcon from '@mui/icons-material/Layers';
import AssignmentIcon from '@mui/icons-material/Assignment';
import LogoutIcon from '@mui/icons-material/Logout';
import {
    Link,
    useNavigate
} from 'react-router-dom';
import {
    signOut,
    getAuth
} from 'firebase/auth';


export const mainListItems = ( <
    React.Fragment >
    <
    ListItemButton component = {
        Link
    }
    to = "/Dashboard" >
    <
    ListItemIcon >
    <
    DashboardIcon / >
    <
    /ListItemIcon> <
    ListItemText primary = "Dashboard" / >
    <
    /ListItemButton> {
        /* <ListItemButton component={Link} to="/bingo-house" >
              <ListItemIcon>
                <ShoppingCartIcon />
              </ListItemIcon>
              <ListItemText primary="Bingo House" />
            </ListItemButton>
            <ListItemButton>
              <ListItemIcon>
                <PeopleIcon />
              </ListItemIcon>
              <ListItemText primary="House Branches" />
            </ListItemButton> */
    } <
    ListItemButton component = {
        Link
    }
    to = "/History" >
    <
    ListItemIcon >
    <
    BarChartIcon / >
    <
    /ListItemIcon> <
    ListItemText primary = "History" / >
    <
    /ListItemButton> <
    ListItemButton component = {
        Link
    }
    to = "/Settings" >
    <
    ListItemIcon >
    <
    BarChartIcon / >
    <
    /ListItemIcon> <
    ListItemText primary = "Settings" / >
    <
    /ListItemButton>

    <
    /React.Fragment>
);

export function LogoutListItem() {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await signOut(getAuth());
            localStorage.clear();
            navigate('/');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <ListItemButton onClick={handleLogout}>
            <ListItemIcon>
                <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
        </ListItemButton>
    );
}