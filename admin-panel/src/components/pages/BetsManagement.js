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
    TextField,
    Typography,
    Paper,
    Grid,
    LinearProgress,
} from '@mui/material';
import {
    Search as SearchIcon,
} from '@mui/icons-material';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';

export default function BetsManagement() {
    const [bets, setBets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchBets = async () => {
        try {
            setLoading(true);
            const usersSnap = await getDocs(collection(db, 'users'));
            const allUsers = usersSnap.docs
                .map(d => ({ id: d.id, ...d.data() }))
                .filter(u => u.role === 'user');

            const allBets = [];
            for (const user of allUsers) {
                const historiesSnap = await getDocs(
                    collection(db, 'users', user.id, 'histories')
                );
                historiesSnap.docs.forEach(doc => {
                    const data = doc.data();
                    allBets.push({
                        id: doc.id,
                        username: user.username || user.email || 'Unknown',
                        betAmount: Number(data.betAmount) || 0,
                        points: Number(data.points) || 0,
                        houseCut: data.cahser_percent || 0,
                        date: data.date?.toDate() || new Date(0),
                    });
                });
            }

            allBets.sort((a, b) => b.date - a.date);
            setBets(allBets);
        } catch (error) {
            console.error('Error fetching bets:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBets();
    }, []);

    const filteredBets = bets.filter(bet =>
        bet.username?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalBets = filteredBets.length;
    const totalBetAmount = filteredBets.reduce((sum, bet) => sum + bet.betAmount, 0);

    return (
        <Box>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
                Bets Management
            </Typography>

            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ p: 3, background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)', color: '#fff' }}>
                        <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>Total Bets</Typography>
                        <Typography variant="h4" sx={{ fontWeight: 700 }}>{totalBets}</Typography>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ p: 3, background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)', color: '#fff' }}>
                        <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>Total Bet Amount</Typography>
                        <Typography variant="h4" sx={{ fontWeight: 700 }}>${totalBetAmount.toFixed(2)}</Typography>
                    </Card>
                </Grid>
            </Grid>

            <Paper sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            placeholder="Search by username..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: <SearchIcon sx={{ mr: 1, color: '#bdc3c7' }} />,
                            }}
                            size="small"
                        />
                    </Grid>
                </Grid>
            </Paper>

            {loading && <LinearProgress />}

            <TableContainer component={Card}>
                <Table>
                    <TableHead sx={{ backgroundColor: '#34495e' }}>
                        <TableRow>
                            <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Username</TableCell>
                            <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Bet Amount</TableCell>
                            <TableCell sx={{ color: '#fff', fontWeight: 700 }}>House Cut %</TableCell>
                            <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Balance After</TableCell>
                            <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Date</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredBets.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                                    <Typography color="textSecondary">
                                        {loading ? 'Loading...' : 'No bets found'}
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredBets.map((bet) => (
                                <TableRow
                                    key={bet.id}
                                    sx={{
                                        '&:hover': { backgroundColor: '#f5f5f5' },
                                        borderBottom: '1px solid #ecf0f1',
                                    }}
                                >
                                    <TableCell>{bet.username}</TableCell>
                                    <TableCell>${bet.betAmount.toFixed(2)}</TableCell>
                                    <TableCell>{bet.houseCut}%</TableCell>
                                    <TableCell>{bet.points.toFixed(2)}</TableCell>
                                    <TableCell>{bet.date.toLocaleDateString()}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}
