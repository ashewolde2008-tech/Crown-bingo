import React, {
    useState
} from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

export default function EditPhoneDialog({
    open,
    phone,
    handleClose,
    handleSave
}) {
    const [updatedPhone, setUpdatedPhone] = useState(phone);

    const handleSaveClick = () => {
        handleSave(updatedPhone);
    };

    return ( <
        Dialog open = {
            open
        }
        onClose = {
            handleClose
        } >
        <
        DialogTitle > Edit Phone Number < /DialogTitle> <
        DialogContent >
        <
        TextField autoFocus margin = "dense"
        label = "Phone Number"
        type = "text"
        fullWidth value = {
            updatedPhone
        }
        onChange = {
            (e) => setUpdatedPhone(e.target.value)
        }
        /> <
        /DialogContent> <
        DialogActions >
        <
        Button onClick = {
            handleClose
        }
        color = "primary" >
        Cancel <
        /Button> <
        Button onClick = {
            handleSaveClick
        }
        color = "primary" >
        Save <
        /Button> <
        /DialogActions> <
        /Dialog>
    );
}