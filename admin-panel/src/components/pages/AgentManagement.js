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
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Search as SearchIcon,
} from '@mui/icons-material';
import { collection, getDocs, addDoc, setDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import { toast } from 'react-toastify';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { apiPost } from '../../services/api';

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
                    toast.success('Agent updated successfully');
                } else {
                    const { password, ...agentData } = values;
                    await apiPost('/api/users', {
                        email: values.email,
                        password: values.password,
                        username: values.agentName,
                        phone: values.phone || '',
                        initialBalance: 0,
                        role: 'agent',
                        agentCode: values.agentCode,
                        commissionRate: Number(values.commissionRate) || 5
                    });
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
                            <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Status</TableCell>
                            <TableCell sx={{ color: '#fff', fontWeight: 700 }} align="right">
                                Actions
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredAgents.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
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
                                    <TableCell>
                                        <Chip
                                            label={agent.isActive !== false ? 'Active' : 'Inactive'}
                                            color={agent.isActive !== false ? 'success' : 'error'}
                                            size="small"
                                        />
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
        </Box>
    );
}
