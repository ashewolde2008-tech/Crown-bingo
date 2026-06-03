import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Paper, Table, TableContainer, TableHead, TableBody,
  TableRow, TableCell, CircularProgress, Alert, Button, Select, MenuItem,
  FormControl, InputLabel, TextField, Chip
} from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import { collection, getDocs, query, orderBy, limit, where } from 'firebase/firestore';
import { db } from '../../firebase';

const ACTION_COLORS = {
  TRANSFER_POINTS: 'primary',
  RECHARGE_WALLET: 'success',
  CREATE_USER: 'info',
  UPDATE_STATUS: 'warning'
};

function AuditLogView() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionFilter, setActionFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const constraints = [orderBy('timestamp', 'desc'), limit(500)];
      if (actionFilter) {
        constraints.push(where('action', '==', actionFilter));
      }
      const q = query(collection(db, 'audit_logs'), ...constraints);
      const snapshot = await getDocs(q);
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate?.() || new Date(doc.data().timestamp)
      }));
      setLogs(items);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [actionFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const getEmail = (actor) => {
    if (!actor) return 'N/A';
    if (typeof actor === 'string') return actor;
    return actor.email || actor.uid || 'N/A';
  };

  const filteredLogs = logs.filter(log => {
    const d = log.timestamp;
    if (dateFrom && d < new Date(dateFrom)) return false;
    if (dateTo) {
      const end = new Date(dateTo);
      end.setDate(end.getDate() + 1);
      if (d >= end) return false;
    }
    return true;
  });

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>Audit Log</Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Action Type</InputLabel>
            <Select value={actionFilter} onChange={e => setActionFilter(e.target.value)} label="Action Type">
              <MenuItem value="">All</MenuItem>
              <MenuItem value="TRANSFER_POINTS">Point Transfers</MenuItem>
              <MenuItem value="RECHARGE_WALLET">Wallet Recharges</MenuItem>
              <MenuItem value="CREATE_USER">User Creation</MenuItem>
              <MenuItem value="UPDATE_STATUS">Status Updates</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="From Date"
            type="datetime-local"
            size="small"
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="To Date"
            type="datetime-local"
            size="small"
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <Button variant="contained" startIcon={<RefreshIcon />} onClick={fetchLogs}>
            Refresh
          </Button>
        </Box>
      </Paper>

      {loading ? (
        <Box sx={{ textAlign: 'center', py: 4 }}><CircularProgress /></Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : filteredLogs.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">No audit logs found</Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell><strong>Timestamp</strong></TableCell>
                <TableCell><strong>Action</strong></TableCell>
                <TableCell><strong>Actor</strong></TableCell>
                <TableCell><strong>Target</strong></TableCell>
                <TableCell><strong>Details</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredLogs.map(log => (
                <TableRow key={log.id} hover>
                  <TableCell>{log.timestamp?.toLocaleString?.() || 'N/A'}</TableCell>
                  <TableCell>
                    <Chip
                      label={log.action}
                      size="small"
                      color={ACTION_COLORS[log.action] || 'default'}
                    />
                  </TableCell>
                  <TableCell>{getEmail(log.actor)}</TableCell>
                  <TableCell>{getEmail(log.target)}</TableCell>
                  <TableCell>
                    {log.details && typeof log.details === 'object'
                      ? JSON.stringify(log.details)
                      : log.details || '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}

export default AuditLogView;
