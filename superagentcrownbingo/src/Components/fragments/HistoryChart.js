import React, {
    useEffect,
    useState
} from 'react';
import {
    getFirestore,
    collection,
    getDocs
} from 'firebase/firestore'; // Firestore functions
import {
    Line
} from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Button } from '@mui/material';
import dayjs from 'dayjs';

// Register required Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

export default function HistoryLineChart() {
    const [historyData, setHistoryData] = useState([]);
    const [visible, setVisible] = useState(true);
    const adminId = localStorage.getItem('uid');

    // Fetch history data from Firestore
    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const db = getFirestore();
                const historyCollection = collection(db, 'history'); // Adjust the collection name
                const historySnapshot = await getDocs(historyCollection);
                const historyData = historySnapshot.docs.map((doc) => doc.data());
                setHistoryData(historyData);
            } catch (error) {
                console.error('Error fetching history:', error);
            }
        };

        fetchHistory();
    }, []);

    // Process data for the last 30 days
    const last30DaysData = Array.from({
        length: 30
    }, (_, i) => {
        const date = dayjs().subtract(30 - i, 'day').startOf('day'); // Get start of each day
        const earningsForDate = historyData
            .filter((item) => {
                // Ensure `item.date` is properly formatted as a Day.js object
                const itemDate = dayjs(item.date).startOf('day');
                return item.adminId === adminId && itemDate.isSame(date, 'day');
            })
            .reduce((total, row) => {
                const earnings = Math.floor(row.pointsAdded) || 0;
                return total + (isNaN(earnings) ? 0 : earnings);
            }, 0);

        return {
            date: date.format('YYYY-MM-DD'), // Format date as YYYY-MM-DD for chart labels
            earnings: earningsForDate,
        };
    });


    // Chart Data
    const chartData = {
        labels: last30DaysData.map((data) => data.date), // Dates for the last 30 days
        datasets: [{
            label: 'Earnings',
            data: last30DaysData.map((data) => data.earnings),
            borderColor: 'rgba(255, 99, 132, 1)', // Bright red line
            backgroundColor: 'rgba(255, 99, 132, 0.2)', // Faint red fill
            tension: 0.4, // Smooth line
            fill: true, // Fill area under the line
            pointRadius: 5, // Size of points
            pointHoverRadius: 7, // Size of points on hover
            borderWidth: 2, // Thickness of the line
        }, ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    color: 'white', // Legend text color
                },
            },
            title: {
                display: true,
                text: 'Earnings in the Past 30 Days',
                color: 'white', // Chart title color
                font: {
                    size: 18, // Font size
                },
            },
            tooltip: {
                callbacks: {
                    label: (context) => `Earnings: ${context.raw}`,
                    font: {
                        size: 18, // Font size
                    },
                },
                font: {
                    size: 28, // Font size
                },
                titleColor: 'white',
                bodyColor: 'white',
                backgroundColor: 'rgba(30, 30, 30, 0.8)', // Tooltip background
            },
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Date',
                    color: 'white', // Axis title color
                    font: {
                        size: 25, // Font size
                    },

                },
                ticks: {
                    color: 'white', // Tick text color
                    font: {
                        size: 16, // Font size
                    },

                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.2)', // Grid line color
                },
            },
            y: {
                title: {
                    display: true,
                    text: 'Earnings',
                    color: 'white',
                    font: {
                        size: 30, // Font size
                    },
                    // Axis title color
                },
                ticks: {
                    color: 'white', // Tick text color
                    font: {
                        size: 25, // Font size
                    },
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.2)', // Grid line color
                },
                beginAtZero: true, // Start Y-axis from 0
            },
        },
    };

    return ( <
        div >
        <
        div style = {
            {
                display: 'flex',
                justifyContent: 'flex-end',
                padding: '10px'
            }
        } >
        <
        Button variant = "contained"
        color = {
            visible ? 'primary' : 'secondary'
        }
        onClick = {
            () => setVisible(v => !v)
        } > {
            visible ? 'Hide Chart' : 'View Chart'
        } <
        /Button> <
        /div> {
            visible && ( <
                div style = {
                    {
                        width: '100%',
                        height: '700px',
                        padding: '20px',
                        backgroundColor: '#1e1e1e'
                    }
                } >
                <
                Line data = {
                    chartData
                }
                options = {
                    chartOptions
                }
                /> <
                /div>
            )
        } <
        /div>
    );
}