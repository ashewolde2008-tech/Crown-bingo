import React, { useState } from 'react';
import {
    Box,
    Drawer,
    AppBar,
    Toolbar,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    IconButton,
    Menu,
    MenuItem,
    Divider,
    Avatar,
    Typography,
    CssBaseline,
} from '@mui/material';
import {
    Menu as MenuIcon,
    Close as CloseIcon,
    Dashboard as DashboardIcon,
    People as PeopleIcon,
    Settings as SettingsIcon,
    Logout as LogoutIcon,
    SmartToy as AgentIcon,
    Receipt as ReceiptIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';
import { toast } from 'react-toastify';

const drawerWidth = 260;

export default function AdminLayout({ children }) {
    const [open, setOpen] = useState(true);
    const [anchorEl, setAnchorEl] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    const handleDrawerToggle = () => {
        setOpen(!open);
    };

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/admin-login');
            toast.success('Logged out successfully');
        } catch (error) {
            toast.error('Failed to logout: ' + error.message);
        }
    };

    const menuItems = [
        { label: 'Dashboard', icon: <DashboardIcon />, path: '/admin' },
        { label: 'Users', icon: <PeopleIcon />, path: '/admin/users' },
        { label: 'Agents', icon: <AgentIcon />, path: '/admin/agents' },
        { label: 'Settings', icon: <SettingsIcon />, path: '/admin/settings' },
        { label: 'Audit Log', icon: <ReceiptIcon />, path: '/admin/audit-log' },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            {/* AppBar */}
            <AppBar
                position="fixed"
                sx={{
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                    backgroundColor: '#2c3e50',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}
            >
                <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <IconButton
                            color="inherit"
                            onClick={handleDrawerToggle}
                            sx={{ mr: 2 }}
                        >
                            {open ? <CloseIcon /> : <MenuIcon />}
                        </IconButton>
                        <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: 0.5 }}>
                            Crown Bingo Admin
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                            sx={{
                                width: 40,
                                height: 40,
                                bgcolor: '#e74c3c',
                                cursor: 'pointer',
                            }}
                            onClick={handleMenuOpen}
                        >
                            A
                        </Avatar>
                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={handleMenuClose}
                        >
                            <MenuItem onClick={handleMenuClose} disabled>
                                <Typography variant="body2">Admin User</Typography>
                            </MenuItem>
                            <Divider />
                            <MenuItem onClick={handleLogout}>
                                <LogoutIcon sx={{ mr: 1 }} />
                                Logout
                            </MenuItem>
                        </Menu>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Drawer */}
            <Drawer
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: drawerWidth,
                        boxSizing: 'border-box',
                        backgroundColor: '#34495e',
                        color: '#ecf0f1',
                        marginTop: '64px',
                        height: 'calc(100vh - 64px)',
                        transition: 'margin 0.3s ease',
                        transform: open ? 'translateX(0)' : `translateX(-${drawerWidth}px)`,
                    },
                }}
                variant="permanent"
                anchor="left"
            >
                <List sx={{ pt: 2 }}>
                    {menuItems.map((item) => (
                        <ListItem
                            button
                            key={item.label}
                            onClick={() => navigate(item.path)}
                            sx={{
                                backgroundColor: isActive(item.path) ? '#e74c3c' : 'transparent',
                                color: isActive(item.path) ? '#fff' : '#bdc3c7',
                                '&:hover': {
                                    backgroundColor: isActive(item.path) ? '#e74c3c' : '#2c3e50',
                                },
                                mb: 1,
                                mx: 1,
                                borderRadius: 1,
                                transition: 'all 0.3s ease',
                            }}
                        >
                            <ListItemIcon
                                sx={{
                                    color: isActive(item.path) ? '#fff' : '#bdc3c7',
                                    minWidth: 40,
                                }}
                            >
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText
                                primary={item.label}
                                sx={{
                                    '& .MuiListItemText-primary': {
                                        fontWeight: isActive(item.path) ? 600 : 400,
                                    },
                                }}
                            />
                        </ListItem>
                    ))}
                </List>
            </Drawer>

            {/* Main Content */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    marginTop: '64px',
                    width: '100%',
                    backgroundColor: '#f8f9fa',
                    minHeight: 'calc(100vh - 64px)',
                }}
            >
                {children}
            </Box>
        </Box>
    );
}
