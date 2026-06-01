import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

export default function LoadingScreen() {
    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #2c3e50 0%, #3498db 100%)',
                color: '#fff',
            }}
        >
            <CircularProgress sx={{ color: '#fff', mb: 2 }} size={60} />
            <Typography variant="h6">Loading Crown Bingo Admin Panel...</Typography>
        </Box>
    );
}
