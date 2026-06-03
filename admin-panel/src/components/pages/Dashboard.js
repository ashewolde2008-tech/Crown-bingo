import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Grid,
    Typography,
    Paper,
    LinearProgress,
} from '@mui/material';
import {
    People as PeopleIcon,
    SmartToy as AgentIcon,
    ReceiptLong as BetsIcon,
    TrendingUp as TrendingIcon,
} from '@mui/icons-material';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';

const StatCard = ({ title, value, icon: Icon, color }) => (
    <Card
        sx={{
            height: '100%',
            background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
            color: '#fff',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            transition: 'transform 0.3s ease',
            '&:hover': {
                transform: 'translateY(-5px)',
            },
        }}
    >
        <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
                <Typography color="inherit" sx={{ opacity: 0.8, mb: 1 }}>
                    {title}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {value}
                </Typography>
            </Box>
            <Icon sx={{ fontSize: 50, opacity: 0.3 }} />
        </CardContent>
    </Card>
);

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalAgents: 0,
        activeUsers: 0,
        totalBets: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Fetch users count
                const usersSnap = await getDocs(collection(db, 'users'));
                const totalUsers = usersSnap.docs.length;
                const activeUsers = usersSnap.docs.filter(
                    (doc) => doc.data().isActive !== false
                ).length;

                // Fetch agents count
                const agentsSnap = await getDocs(collection(db, 'agents'));
                const totalAgents = agentsSnap.docs.length;

                // Fetch total bets (if exists)
                const betsSnap = await getDocs(collection(db, 'bets'));
                const totalBets = betsSnap.docs.length;

                setStats({
                    totalUsers,
                    totalAgents,
                    activeUsers,
                    totalBets,
                });
            } catch (error) {
                console.error('Error fetching stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    return (
        <Box>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
                Dashboard
            </Typography>

            {loading && <LinearProgress />}

            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Total Users"
                        value={stats.totalUsers}
                        icon={PeopleIcon}
                        color="#3498db"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Active Users"
                        value={stats.activeUsers}
                        icon={TrendingIcon}
                        color="#2ecc71"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Total Agents"
                        value={stats.totalAgents}
                        icon={AgentIcon}
                        color="#9b59b6"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Total Bets"
                        value={stats.totalBets}
                        icon={BetsIcon}
                        color="#e74c3c"
                    />
                </Grid>
            </Grid>

            {/* Welcome Section */}
            <Paper
                sx={{
                    p: 3,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: '#fff',
                    borderRadius: 2,
                }}
            >
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                    Welcome to Crown Bingo Admin Panel
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Manage your users, agents, settings, and view analytics from this centralized dashboard.
                    Navigate using the menu on the left to access different management sections.
                </Typography>
            </Paper>
        </Box>
    );
}
