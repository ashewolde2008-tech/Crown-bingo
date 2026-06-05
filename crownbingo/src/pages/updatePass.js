import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from '@mui/material';
import { getAuth, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { toast } from 'react-toastify';

const UpdatePassword = ({ open, handleClose }) => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');

    const handleSave = async () => {
        if (newPassword !== confirmNewPassword) {
            toast.error('Passwords do not match');
            return;
        }
        try {
            const auth = getAuth();
            const user = auth.currentUser;
            const credential = EmailAuthProvider.credential(user.email, currentPassword);
            await reauthenticateWithCredential(user, credential);
            await updatePassword(user, newPassword);
            toast.success('Password updated successfully');
            handleClose();
            setCurrentPassword('');
            setNewPassword('');
            setConfirmNewPassword('');
        } catch (error) {
            toast.error('Error: ' + error.message);
        }
    };

    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle>Update Password</DialogTitle>
            <DialogContent>
                <TextField label="Current Password" type="password" fullWidth margin="normal" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                <TextField label="New Password" type="password" fullWidth margin="normal" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                <TextField label="Confirm New Password" type="password" fullWidth margin="normal" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button onClick={handleSave} variant="contained">Save</Button>
            </DialogActions>
        </Dialog>
    );
};

export default UpdatePassword;
