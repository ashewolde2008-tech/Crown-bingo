import React from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';

export default function BasicSelect({ value, onChange, label, items, ...props }) {
    return (
        <FormControl fullWidth>
            <InputLabel>{label || 'Select'}</InputLabel>
            <Select value={value || ''} onChange={onChange} label={label || 'Select'} {...props}>
                {items && items.map((item, index) => (
                    <MenuItem key={index} value={typeof item === 'object' ? item.value : item}>
                        {typeof item === 'object' ? item.label : item}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
}
