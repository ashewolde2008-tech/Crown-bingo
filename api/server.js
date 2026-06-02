require('dotenv').config();
const express = require('express');
const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: process.env.FIREBASE_PROJECT_ID || 'bingo-27d37'
});

const app = express();

// --- Middleware stack ---
const { createCorsMiddleware } = require('./middleware/cors');
const { globalLimiter, apiLimiter } = require('./middleware/rateLimit');
const { correlationId } = require('./middleware/correlationId');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { logRequest, logError } = require('./logger');
const metrics = require('./metrics');

app.use(createCorsMiddleware());
app.use(express.json({ limit: '1mb' }));
app.use(globalLimiter);
app.use(correlationId);

// --- Request logging + metrics ---
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const durationSeconds = duration / 1000;
    const routePath = req.route ? req.route.path : req.path;
    metrics.trackHttpDuration(req.method, routePath, res.statusCode, durationSeconds);
    if (res.statusCode >= 400) {
      metrics.incrementError(`HTTP_${res.statusCode}`);
      logError(req, { code: 'HTTP_ERROR', message: res.statusMessage || '' }, duration);
    } else {
      logRequest(req, res, duration);
    }
  });
  next();
});

// --- Routes ---
app.use('/api/users', require('./routes/users'));
app.use('/api/points', require('./routes/points'));
app.use('/api/wallet', require('./routes/wallet'));
app.use('/api/users', require('./routes/status'));

app.use('/health', require('./routes/health'));
app.use('/api/agents', require('./routes/agents'));
app.use('/api/bets', require('./routes/bets'));
app.use('/api/games', require('./routes/games'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/audit-logs', require('./routes/auditLogs'));

// --- Error handling ---
app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Crown Bingo API running on port ${PORT}`));
