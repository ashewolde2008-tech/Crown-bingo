const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

router.get('/live', (req, res) => {
  res.json({ status: 'alive', timestamp: new Date().toISOString() });
});

router.get('/ready', async (req, res) => {
  try {
    const db = admin.firestore();
    const healthRef = db.collection('_health').doc('check');
    await healthRef.set({ timestamp: admin.firestore.FieldValue.serverTimestamp() });
    const healthDoc = await healthRef.get();
    if (!healthDoc.exists) {
      throw new Error('Firestore health check failed');
    }
    res.json({
      status: 'ready',
      checks: { firestore: 'healthy', auth: 'healthy' },
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(503).json({
      status: 'not-ready',
      error: err.message,
      timestamp: new Date().toISOString()
    });
  }
});

router.get('/metrics', async (req, res) => {
  let metrics;
  try { metrics = require('../metrics'); } catch (e) { /* metrics not loaded */ }
  if (metrics && metrics.register) {
    res.set('Content-Type', metrics.register.contentType);
    res.end(await metrics.register.metrics());
  } else {
    res.json({ uptime: process.uptime(), memory: process.memoryUsage(), cpu: process.cpuUsage() });
  }
});

module.exports = router;
