import React from 'react';
import { Dialog, DialogTitle, DialogContent, Typography, Button, DialogActions } from '@mui/material';
import Confetti from 'react-confetti';

const WinnerPopup = ({ open, onClose, prizeAmount, winnerName }) => {
    return (
        <>
            {open && <Confetti width={window.innerWidth} height={window.innerHeight} />}
            <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ textAlign: 'center', fontSize: '2rem', color: '#gold' }}>
                    Jackpot Winner!
                </DialogTitle>
                <DialogContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" gutterBottom>
                        {winnerName || 'Congratulations!'}
                    </Typography>
                    <Typography variant="h3" sx={{ color: '#e74c3c', fontWeight: 'bold' }}>
                        ${prizeAmount || 0}
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'center' }}>
                    <Button onClick={onClose} variant="contained" size="large">
                        Claim Prize
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default WinnerPopup;
