import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Chip,
    Typography,
    Paper,
    Grid,
    LinearProgress,
    Tooltip,
    Switch,
    Divider,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Search as SearchIcon,
    Settings as SettingsIcon,
} from '@mui/icons-material';
import { collection, getDocs, updateDoc, deleteDoc, doc, setDoc, increment } from 'firebase/firestore';
import { db, auth, createUserWithEmailAndPassword } from '../../firebase';
import { toast } from 'react-toastify';
import { useFormik } from 'formik';
import * as yup from 'yup';

const getValidationSchema = (isEditing) => yup.object({
    agentName: yup.string('Enter agent name').required('Agent name is required'),
    agentCode: yup.string('Enter agent code').required('Agent code is required'),
    email: yup.string('Enter email').email('Enter a valid email').required('Email is required'),
    phone: yup.string('Enter phone'),
    commissionRate: yup.number('Enter valid commission rate'),
    password: isEditing
        ? yup.string()
        : yup.string('Enter password').required('Password is required').min(6, 'Minimum 6 characters'),
});

export default function AgentManagement() {
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingAgent, setEditingAgent] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [rechargeOpen, setRechargeOpen] = useState(false);
    const [rechargeAgent, setRechargeAgent] = useState(null);
    const [rechargeAmount, setRechargeAmount] = useState('');
    const [rechargeLoading, setRechargeLoading] = useState(false);

    const handleRechargeClick = (agent) => {
        setRechargeAgent(agent);
        setRechargeAmount('');
        setRechargeOpen(true);
    };

    const handleRechargeClose = () => {
        setRechargeOpen(false);
        setRechargeAgent(null);
        setRechargeAmount('');
    };

    const handleRechargeSubmit = async () => {
        const amount = Number(rechargeAmount);
        if (isNaN(amount) || amount <= 0) {
            toast.error('Enter a valid positive amount');
            return;
        }
        if (!rechargeAgent) return;
        setRechargeLoading(true);
        try {
            // Update users/{agentUid}.balance (primary)
            const userRef = doc(db, 'users', rechargeAgent.id);
            await updateDoc(userRef, { balance: increment(amount) });
            // Also try to update agents/{agentUid}.balance for backwards compat
            try {
                await updateDoc(doc(db, 'agents', rechargeAgent.id), { balance: increment(amount) });
            } catch (e) { /* agents doc may not exist */ }
            toast.success(`Recharged $${amount} to ${rechargeAgent.agentName || rechargeAgent.email}`);
            handleRechargeClose();
            fetchAgents();
        } catch (error) {
            toast.error('Recharge failed: ' + error.message);
        } finally {
            setRechargeLoading(false);
        }
    };

    const formik = useFormik({
        initialValues: {
            agentName: '',
            agentCode: '',
            email: '',
            phone: '',
            commissionRate: 5,
            password: '',
        },
        validationSchema: getValidationSchema(editingAgent !== null),
        onSubmit: async (values) => {
            try {
                if (editingAgent) {
                    const { password, ...updateData } = values;
                    const agentRef = doc(db, 'agents', editingAgent.id);
                    await updateDoc(agentRef, updateData);
                    try { await updateDoc(doc(db, 'users', editingAgent.id), updateData); } catch (e) { /* may not exist in users collection */ }
                    toast.success('Agent updated successfully');
                } else {
                    const { password } = values;
                    const userCred = await createUserWithEmailAndPassword(auth, values.email, password);
                    const uid = userCred.user.uid;
                    const agentData = {
                        uid,
                        agentName: values.agentName,
                        agentCode: values.agentCode,
                        email: values.email,
                        phone: values.phone || '',
                        commissionRate: Number(values.commissionRate) || 5,
                        balance: 0,
                        userRole: 'superAgent',
                        role: 'agent',
                        isActive: true,
                        isDisabled: false,
                        walletWithdrawEnabled: false,
                        createdAt: new Date().toISOString(),
                        totalSales: 0,
                        totalEarnings: 0
                    };
                    await setDoc(doc(db, 'users', uid), agentData);
                    await setDoc(doc(db, 'agents', uid), agentData);
                    toast.success('Agent created successfully');
                }
                setOpenDialog(false);
                setEditingAgent(null);
                formik.resetForm();
                fetchAgents();
            } catch (error) {
                toast.error('Error: ' + error.message);
            }
        },
    });

    const fetchAgents = async () => {
        try {
            setLoading(true);
            const agentsSnap = await getDocs(collection(db, 'agents'));
            const agentsData = agentsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setAgents(agentsData);
        } catch (error) {
            toast.error('Error fetching agents: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAgents();
    }, []);

    const handleEdit = (agent) => {
        setEditingAgent(agent);
        formik.setValues({
            agentName: agent.agentName || '',
            agentCode: agent.agentCode || '',
            email: agent.email || '',
            phone: agent.phone || '',
            commissionRate: agent.commissionRate || 5,
        });
        setOpenDialog(true);
    };

    const handleDelete = async (agentId) => {
        if (window.confirm('Are you sure you want to delete this agent?')) {
            try {
                await deleteDoc(doc(db, 'agents', agentId));
                toast.success('Agent deleted successfully');
                fetchAgents();
            } catch (error) {
                toast.error('Error deleting agent: ' + error.message);
            }
        }
    };

    const handleAddNew = () => {
        setEditingAgent(null);
        formik.resetForm();
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        formik.resetForm();
    };

    const handleToggleActive = async (agent) => {
        try {
            const userRef = doc(db, 'users', agent.id);
            await updateDoc(userRef, { isActive: !agent.isActive });
            try {
                await updateDoc(doc(db, 'agents', agent.id), { isActive: !agent.isActive });
            } catch (e) { /* may not exist */ }
            toast.success(`Agent ${!agent.isActive ? 'enabled' : 'disabled'}`);
            fetchAgents();
        } catch (error) {
            toast.error('Failed to update status: ' + error.message);
        }
    };

    const [settingsOpen, setSettingsOpen] = useState(false);
    const [settingsAgent, setSettingsAgent] = useState(null);
    const [editAgentName, setEditAgentName] = useState('');
    const [editAgentCode, setEditAgentCode] = useState('');
    const [editAgentEmail, setEditAgentEmail] = useState('');
    const [editAgentPhone, setEditAgentPhone] = useState('');
    const [editWalletWithdrawEnabled, setEditWalletWithdrawEnabled] = useState(false);
    const [settingsLoading, setSettingsLoading] = useState(false);

    const handleOpenSettings = (agent) => {
        setSettingsAgent(agent);
        setEditAgentName(agent.agentName || '');
        setEditAgentCode(agent.agentCode || '');
        setEditAgentEmail(agent.email || '');
        setEditAgentPhone(agent.phone || '');
        setEditWalletWithdrawEnabled(agent.walletWithdrawEnabled === true);
        setSettingsOpen(true);
    };

    const handleCloseSettings = () => {
        setSettingsOpen(false);
        setSettingsAgent(null);
    };

    const handleSaveAgentSettings = async () => {
        if (!settingsAgent) return;
        setSettingsLoading(true);
        try {
            const updateData = {
                agentName: editAgentName,
                agentCode: editAgentCode,
                email: editAgentEmail,
                phone: editAgentPhone,
                walletWithdrawEnabled: editWalletWithdrawEnabled,
            };
            const userRef = doc(db, 'users', settingsAgent.id);
            await updateDoc(userRef, updateData);
            try {
                await updateDoc(doc(db, 'agents', settingsAgent.id), updateData);
            } catch (e) { /* may not exist */ }
            toast.success('Agent settings updated');
            handleCloseSettings();
            fetchAgents();
        } catch (error) {
            toast.error('Failed to save: ' + error.message);
        } finally {
            setSettingsLoading(false);
        }
    };

    const handleSendAgentPasswordReset = async () => {
        if (!settingsAgent?.email) {
            toast.error('No email on file for this agent');
            return;
        }
        try {
            const { sendPasswordResetEmail } = await import('firebase/auth');
            const { auth } = await import('../../firebase');
            await sendPasswordResetEmail(auth, settingsAgent.email);
            toast.success('Password reset email sent to ' + settingsAgent.email);
        } catch (error) {
            toast.error('Failed to send reset: ' + error.message);
        }
    };

    const filteredAgents = agents.filter((agent) =>
        agent.agentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.agentCode?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Box>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
                Agent Management
            </Typography>

            <Paper sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            placeholder="Search by agent name or code..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: <SearchIcon sx={{ mr: 1, color: '#bdc3c7' }} />,
                            }}
                            size="small"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={handleAddNew}
                            sx={{
                                background: 'linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)',
                            }}
                        >
                            Add New Agent
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            {loading && <LinearProgress />}

            <TableContainer component={Card}>
                <Table>
                    <TableHead sx={{ backgroundColor: '#34495e' }}>
                        <TableRow>
                            <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Agent Name</TableCell>
                            <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Agent Code</TableCell>
                            <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Email</TableCell>
                            <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Commission %</TableCell>
                            <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Sales</TableCell>
                            <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Balance</TableCell>
                            <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Status</TableCell>
                            <TableCell sx={{ color: '#fff', fontWeight: 700 }} align="right">Recharge</TableCell>
                            <TableCell sx={{ color: '#fff', fontWeight: 700 }} align="right">
                                Actions
                            </TableCell>
                            <TableCell sx={{ color: '#fff', fontWeight: 700 }} align="right">
                                Settings
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredAgents.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={10} align="center" sx={{ py: 3 }}>
                                    <Typography color="textSecondary">No agents found</Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredAgents.map((agent) => (
                                <TableRow
                                    key={agent.id}
                                    sx={{
                                        '&:hover': { backgroundColor: '#f5f5f5' },
                                        borderBottom: '1px solid #ecf0f1',
                                    }}
                                >
                                    <TableCell>{agent.agentName || 'N/A'}</TableCell>
                                    <TableCell>
                                        <Chip label={agent.agentCode} size="small" variant="outlined" />
                                    </TableCell>
                                    <TableCell>{agent.email || 'N/A'}</TableCell>
                                    <TableCell>{agent.commissionRate || 0}%</TableCell>
                                    <TableCell>{agent.totalSales || 0}</TableCell>
                                    <TableCell>${agent.balance || 0}</TableCell>
                                    <TableCell>
                                        <Switch
                                            checked={agent.isActive !== false}
                                            onChange={() => handleToggleActive(agent)}
                                            color="success"
                                        />
                                        <Typography variant="caption" sx={{ ml: 1 }}>
                                            {agent.isActive !== false ? 'Active' : 'Inactive'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Button
                                            size="small"
                                            variant="contained"
                                            onClick={() => handleRechargeClick(agent)}
                                            sx={{ background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)' }}
                                        >
                                            Recharge
                                        </Button>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Tooltip title="Edit">
                                            <IconButton
                                                size="small"
                                                onClick={() => handleEdit(agent)}
                                                sx={{ color: '#3498db' }}
                                            >
                                                <EditIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Delete">
                                            <IconButton
                                                size="small"
                                                onClick={() => handleDelete(agent.id)}
                                                sx={{ color: '#e74c3c' }}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Tooltip title="Edit agent settings">
                                            <IconButton
                                                size="small"
                                                onClick={() => handleOpenSettings(agent)}
                                                sx={{ color: '#9b59b6' }}
                                            >
                                                <SettingsIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Dialog for Add/Edit Agent */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ backgroundColor: '#34495e', color: '#fff', fontWeight: 700 }}>
                    {editingAgent ? 'Edit Agent' : 'Add New Agent'}
                </DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            fullWidth
                            label="Agent Name"
                            name="agentName"
                            value={formik.values.agentName}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.agentName && Boolean(formik.errors.agentName)}
                            helperText={formik.touched.agentName && formik.errors.agentName}
                        />
                        <TextField
                            fullWidth
                            label="Agent Code"
                            name="agentCode"
                            value={formik.values.agentCode}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.agentCode && Boolean(formik.errors.agentCode)}
                            helperText={formik.touched.agentCode && formik.errors.agentCode}
                        />
                        <TextField
                            fullWidth
                            label="Email"
                            name="email"
                            type="email"
                            value={formik.values.email}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                        />
                        <TextField
                            fullWidth
                            label="Phone"
                            name="phone"
                            value={formik.values.phone}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                        />
                        <TextField
                            fullWidth
                            label="Commission Rate (%)"
                            name="commissionRate"
                            type="number"
                            value={formik.values.commissionRate}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                        />
                        {!editingAgent && (
                            <TextField
                                fullWidth
                                label="Password"
                                name="password"
                                type="password"
                                value={formik.values.password}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.password && Boolean(formik.errors.password)}
                                helperText={formik.touched.password && formik.errors.password}
                            />
                        )}
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button
                        onClick={formik.handleSubmit}
                        variant="contained"
                        sx={{ background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)' }}
                    >
                        {editingAgent ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={rechargeOpen} onClose={handleRechargeClose} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ backgroundColor: '#34495e', color: '#fff', fontWeight: 700 }}>
                    Recharge Wallet
                </DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    <Typography sx={{ mb: 2 }}>
                        Recharging: <b>{rechargeAgent?.agentName || rechargeAgent?.email}</b>
                    </Typography>
                    <Typography sx={{ mb: 2, color: 'text.secondary' }}>
                        Current balance: ${rechargeAgent?.balance || 0}
                    </Typography>
                    <TextField
                        fullWidth
                        label="Amount"
                        type="number"
                        value={rechargeAmount}
                        onChange={(e) => setRechargeAmount(e.target.value)}
                        autoFocus
                    />
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={handleRechargeClose}>Cancel</Button>
                    <Button
                        onClick={handleRechargeSubmit}
                        variant="contained"
                        disabled={rechargeLoading}
                        sx={{ background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)' }}
                    >
                        {rechargeLoading ? 'Processing...' : 'Recharge'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={settingsOpen} onClose={handleCloseSettings} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ backgroundColor: '#34495e', color: '#fff', fontWeight: 700 }}>
                    Edit Agent: {settingsAgent?.agentName || settingsAgent?.email}
                </DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        <TextField
                            fullWidth label="Agent Name" value={editAgentName}
                            onChange={(e) => setEditAgentName(e.target.value)}
                        />
                        <TextField
                            fullWidth label="Agent Code" value={editAgentCode}
                            onChange={(e) => setEditAgentCode(e.target.value)}
                        />
                        <TextField
                            fullWidth label="Email" type="email" value={editAgentEmail}
                            onChange={(e) => setEditAgentEmail(e.target.value)}
                        />
                        <TextField
                            fullWidth label="Phone" value={editAgentPhone}
                            onChange={(e) => setEditAgentPhone(e.target.value)}
                        />
                        <Divider sx={{ my: 1 }} />
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.5, border: '1px solid rgba(0,0,0,0.12)', borderRadius: 1 }}>
                            <Box>
                                <Typography variant="subtitle1" fontWeight="bold">
                                    Wallet Withdraw
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                    Allow this agent (super agent) to withdraw from user wallets into their own agent wallet.
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="caption" sx={{ fontWeight: 600, color: editWalletWithdrawEnabled ? 'success.main' : 'text.secondary' }}>
                                    {editWalletWithdrawEnabled ? 'Enabled' : 'Disabled'}
                                </Typography>
                                <Switch
                                    checked={editWalletWithdrawEnabled}
                                    onChange={(e) => setEditWalletWithdrawEnabled(e.target.checked)}
                                    color="success"
                                />
                            </Box>
                        </Box>
                        <Divider sx={{ my: 1 }} />
                        <Typography variant="subtitle1" fontWeight="bold">Reset Password</Typography>
                        <Button
                            variant="outlined"
                            color="warning"
                            onClick={handleSendAgentPasswordReset}
                            startIcon={<SettingsIcon />}
                        >
                            Send Password Reset Email
                        </Button>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={handleCloseSettings}>Cancel</Button>
                    <Button
                        onClick={handleSaveAgentSettings}
                        variant="contained"
                        disabled={settingsLoading}
                        sx={{ background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)' }}
                    >
                        {settingsLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
