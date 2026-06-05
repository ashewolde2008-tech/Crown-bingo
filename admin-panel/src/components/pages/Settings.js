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
    Alert,
    LinearProgress,
} from '@mui/material';
import { collection, getDocs, setDoc, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { toast } from 'react-toastify';
import { Save as SaveIcon, Build as BuildIcon } from '@mui/icons-material';

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
    const [patching, setPatching] = useState(false);
    const [patchLog, setPatchLog] = useState('');

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

    const patchMissingRoles = async () => {
        if (!window.confirm('This will update all existing users/agents missing role fields. Continue?')) return;
        setPatching(true);
        setPatchLog('');
        let fixed = 0;
        const addLog = (msg) => setPatchLog(prev => prev + '\n' + msg);

        try {
            addLog('Reading users collection…');
            const usersSnap = await getDocs(collection(db, 'users'));
            addLog('Found ' + usersSnap.size + ' user(s).');

            for (const docSnap of usersSnap.docs) {
                const d = docSnap.data();
                const updates = {};
                if (!d.role && !d.userRole) {
                    updates.role = 'user';
                    updates.isDisabled = d.isDisabled !== undefined ? d.isDisabled : false;
                    addLog('  [USER] ' + (d.email || docSnap.id) + ' → role:user');
                } else if (d.role === 'agent' && !d.userRole) {
                    updates.userRole = 'superAgent';
                    updates.isDisabled = d.isDisabled !== undefined ? d.isDisabled : false;
                    addLog('  [AGENT] ' + (d.email || docSnap.id) + ' → userRole:superAgent');
                } else {
                    addLog('  [OK] ' + (d.email || docSnap.id));
                    continue;
                }
                try { await updateDoc(doc(db, 'users', docSnap.id), updates); fixed++; }
                catch (e) { addLog('  ERROR: ' + e.message); }
            }

            addLog('\nReading agents collection…');
            const agentsSnap = await getDocs(collection(db, 'agents'));
            addLog('Found ' + agentsSnap.size + ' agent(s).');

            for (const agentSnap of agentsSnap.docs) {
                const d = agentSnap.data();
                const userRef = doc(db, 'users', agentSnap.id);
                const userDoc = await getDoc(userRef);
                if (!userDoc.exists()) {
                    addLog('  [MISSING] Agent ' + (d.email || agentSnap.id) + ' not in users → adding…');
                    try {
                        await setDoc(userRef, { ...d, userRole: 'superAgent', role: 'agent', isDisabled: d.isDisabled ?? false });
                        fixed++; addLog('  ✅ Done.');
                    } catch (e) { addLog('  ERROR: ' + e.message); }
                } else if (!userDoc.data().userRole) {
                    addLog('  [PATCH] Agent in users missing userRole: ' + (d.email || agentSnap.id));
                    try {
                        await updateDoc(userRef, { userRole: 'superAgent', role: 'agent', isDisabled: userDoc.data().isDisabled ?? false });
                        fixed++;
                    } catch (e) { addLog('  ERROR: ' + e.message); }
                } else {
                    addLog('  [OK] Agent ' + (d.email || agentSnap.id));
                }
            }

            addLog('\n✅ PATCH COMPLETE — Fixed ' + fixed + ' record(s)');
            toast.success('Patch complete! Fixed ' + fixed + ' record(s).');
        } catch (err) {
            addLog('\nFATAL: ' + err.message);
            toast.error('Patch error: ' + err.message);
        } finally {
            setPatching(false);
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
