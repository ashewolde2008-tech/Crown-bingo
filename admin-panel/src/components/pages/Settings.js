import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    TextField,
    Button,
    Typography,
    Grid,
    Switch,
    FormControlLabel,
} from '@mui/material';
import { collection, getDocs, setDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import { toast } from 'react-toastify';
import { Save as SaveIcon } from '@mui/icons-material';

export default function SettingsPage() {
    const [settings, setSettings] = useState({
        appName: 'Crown Bingo',
        appVersion: '1.0.0',
        maintenanceMode: false,
        maintenanceMessage: '',
        maxBetAmount: 1000,
        minBetAmount: 10,
        commissionRate: 5,
        supportEmail: 'support@crownbingo.com',
        supportPhone: '+1-234-567-8900',
        siteName: 'Crown Bingo',
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const settingsSnap = await getDocs(collection(db, 'settings'));
                if (settingsSnap.docs.length > 0) {
                    setSettings(prev => ({
                        ...prev,
                        ...settingsSnap.docs[0].data(),
                    }));
                }
            } catch (error) {
                toast.error('Error fetching settings: ' + error.message);
            }
        };
        fetchSettings();
    }, []);

    const handleChange = (field, value) => {
        setSettings({
            ...settings,
            [field]: value,
        });
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            await setDoc(doc(db, 'settings', 'config'), settings, { merge: true });
            toast.success('Settings saved successfully!');
        } catch (error) {
            toast.error('Error saving settings: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
                System Settings
            </Typography>

            <Grid container spacing={3}>
                {/* Application Settings */}
                <Grid item xs={12} md={6}>
                    <Card sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
                            Application Settings
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <TextField
                                fullWidth
                                label="App Name"
                                value={settings.appName}
                                onChange={(e) => handleChange('appName', e.target.value)}
                            />
                            <TextField
                                fullWidth
                                label="App Version"
                                value={settings.appVersion}
                                onChange={(e) => handleChange('appVersion', e.target.value)}
                            />
                            <TextField
                                fullWidth
                                label="Site Name"
                                value={settings.siteName}
                                onChange={(e) => handleChange('siteName', e.target.value)}
                            />
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={settings.maintenanceMode}
                                        onChange={(e) => handleChange('maintenanceMode', e.target.checked)}
                                    />
                                }
                                label="Maintenance Mode"
                            />
                            {settings.maintenanceMode && (
                                <TextField
                                    fullWidth
                                    label="Maintenance Message"
                                    multiline
                                    rows={3}
                                    value={settings.maintenanceMessage}
                                    onChange={(e) => handleChange('maintenanceMessage', e.target.value)}
                                    placeholder="Enter maintenance message"
                                />
                            )}
                        </Box>
                    </Card>
                </Grid>

                {/* Business Settings */}
                <Grid item xs={12} md={6}>
                    <Card sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
                            Business Settings
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <TextField
                                fullWidth
                                label="Min Bet Amount"
                                type="number"
                                value={settings.minBetAmount}
                                onChange={(e) => handleChange('minBetAmount', parseFloat(e.target.value))}
                            />
                            <TextField
                                fullWidth
                                label="Max Bet Amount"
                                type="number"
                                value={settings.maxBetAmount}
                                onChange={(e) => handleChange('maxBetAmount', parseFloat(e.target.value))}
                            />
                            <TextField
                                fullWidth
                                label="Commission Rate (%)"
                                type="number"
                                value={settings.commissionRate}
                                onChange={(e) => handleChange('commissionRate', parseFloat(e.target.value))}
                            />
                        </Box>
                    </Card>
                </Grid>

                {/* Contact Settings */}
                <Grid item xs={12} md={6}>
                    <Card sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
                            Contact Information
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <TextField
                                fullWidth
                                label="Support Email"
                                type="email"
                                value={settings.supportEmail}
                                onChange={(e) => handleChange('supportEmail', e.target.value)}
                            />
                            <TextField
                                fullWidth
                                label="Support Phone"
                                value={settings.supportPhone}
                                onChange={(e) => handleChange('supportPhone', e.target.value)}
                            />
                        </Box>
                    </Card>
                </Grid>

                {/* Quick Stats */}
                <Grid item xs={12} md={6}>
                    <Card sx={{ p: 3, backgroundColor: '#ecf0f1' }}>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
                            Current Configuration
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Typography variant="body2">
                                <strong>Status:</strong> {settings.maintenanceMode ? 'Maintenance Mode' : 'Live'}
                            </Typography>
                            <Typography variant="body2">
                                <strong>Bet Range:</strong> ${settings.minBetAmount} - ${settings.maxBetAmount}
                            </Typography>
                            <Typography variant="body2">
                                <strong>Commission:</strong> {settings.commissionRate}%
                            </Typography>
                        </Box>
                    </Card>
                </Grid>

                {/* Save Button */}
                <Grid item xs={12}>
                    <Button
                        variant="contained"
                        size="large"
                        startIcon={<SaveIcon />}
                        onClick={handleSave}
                        disabled={loading}
                        sx={{
                            background: 'linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)',
                            width: '100%',
                        }}
                    >
                        {loading ? 'Saving...' : 'Save Settings'}
                    </Button>
                </Grid>
            </Grid>
        </Box>
    );
}
