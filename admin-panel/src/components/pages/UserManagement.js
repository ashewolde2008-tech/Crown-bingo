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
import { collection, getDocs, addDoc, setDoc, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { db, auth, crownbingoAuth } from '../../firebase';
import { toast } from 'react-toastify';
import { getAdminCredentials } from '../../authStore';
import { useFormik } from 'formik';
import * as yup from 'yup';

const getValidationSchema = (isEditing) => yup.object({
    username: yup.string('Enter username').required('Username is required'),
    email: yup.string('Enter email').email('Enter a valid email').required('Email is required'),
    phone: yup.string('Enter phone'),
    balance: yup.number('Enter valid balance'),
    password: isEditing
        ? yup.string()
        : yup.string('Enter password').required('Password is required').min(6, 'Minimum 6 characters'),
});

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const formik = useFormik({
        initialValues: {
            username: '',
            email: '',
            phone: '',
            balance: 0,
            password: '',
        },
        validationSchema: getValidationSchema(editingUser !== null),
        onSubmit: async (values) => {
            try {
                if (editingUser) {
                    const { password, ...updateData } = values;
                    const userRef = doc(db, 'users', editingUser.id);
                    await updateDoc(userRef, updateData);
                    toast.success('User updated successfully');
                } else {
                    const { password, ...userData } = values;
                    const userCred = await createUserWithEmailAndPassword(crownbingoAuth, values.email, password);
                    const adminCreds = getAdminCredentials();
                    if (adminCreds) {
                        await crownbingoAuth.signOut();
                        await signInWithEmailAndPassword(auth, adminCreds.email, adminCreds.password);
                    }
                    await setDoc(doc(db, 'users', userCred.user.uid), {
                        uid: userCred.user.uid,
                        ...userData,
                        createdAt: new Date(),
                        isActive: true,
                    });
                    toast.success('User created successfully');
                }
                setOpenDialog(false);
                setEditingUser(null);
                formik.resetForm();
                fetchUsers();
            } catch (error) {
                toast.error('Error: ' + error.message);
            }
        },
    });

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const usersSnap = await getDocs(collection(db, 'users'));
            const usersData = usersSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setUsers(usersData);
        } catch (error) {
            toast.error('Error fetching users: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleEdit = (user) => {
        setEditingUser(user);
        formik.setValues({
            username: user.username || '',
            email: user.email || '',
            phone: user.phone || '',
            balance: user.balance || 0,
        });
        setOpenDialog(true);
    };

    const handleDelete = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await deleteDoc(doc(db, 'users', userId));
                toast.success('User deleted successfully');
                fetchUsers();
            } catch (error) {
                toast.error('Error deleting user: ' + error.message);
            }
        }
    };

    const handleAddNew = () => {
        setEditingUser(null);
        formik.resetForm();
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        formik.resetForm();
    };

    const filteredUsers = users.filter((user) =>
        user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Box>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
                User Management
            </Typography>

            <Paper sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            placeholder="Search by username or email..."
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
                            Add New User
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            {loading && <LinearProgress />}

            <TableContainer component={Card}>
                <Table>
                    <TableHead sx={{ backgroundColor: '#34495e' }}>
                        <TableRow>
                            <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Username</TableCell>
                            <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Email</TableCell>
                            <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Phone</TableCell>
                            <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Balance</TableCell>
                            <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Status</TableCell>
                            <TableCell sx={{ color: '#fff', fontWeight: 700 }} align="right">
                                Actions
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredUsers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                                    <Typography color="textSecondary">No users found</Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredUsers.map((user) => (
                                <TableRow
                                    key={user.id}
                                    sx={{
                                        '&:hover': { backgroundColor: '#f5f5f5' },
                                        borderBottom: '1px solid #ecf0f1',
                                    }}
                                >
                                    <TableCell>{user.username || 'N/A'}</TableCell>
                                    <TableCell>{user.email || 'N/A'}</TableCell>
                                    <TableCell>{user.phone || 'N/A'}</TableCell>
                                    <TableCell>${user.balance || 0}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={user.isActive !== false ? 'Active' : 'Inactive'}
                                            color={user.isActive !== false ? 'success' : 'error'}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <Tooltip title="Edit">
                                            <IconButton
                                                size="small"
                                                onClick={() => handleEdit(user)}
                                                sx={{ color: '#3498db' }}
                                            >
                                                <EditIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Delete">
                                            <IconButton
                                                size="small"
                                                onClick={() => handleDelete(user.id)}
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

            {/* Dialog for Add/Edit User */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ backgroundColor: '#34495e', color: '#fff', fontWeight: 700 }}>
                    {editingUser ? 'Edit User' : 'Add New User'}
                </DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            fullWidth
                            label="Username"
                            name="username"
                            value={formik.values.username}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.username && Boolean(formik.errors.username)}
                            helperText={formik.touched.username && formik.errors.username}
                        />
                        <TextField
                            fullWidth
                            label="Email"
                            name="email"
                            type="email"
                            value={formik.values.email}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.email && Boolean(formik.errors.email)}
                            helperText={formik.touched.email && formik.errors.email}
                            disabled={editingUser !== null}
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
                            label="Balance"
                            name="balance"
                            type="number"
                            value={formik.values.balance}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                        />
                        {!editingUser && (
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
                        {editingUser ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
