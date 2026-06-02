const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const { authenticate, requireRole } = require('../middleware/auth');

router.get('/', authenticate, requireRole('SUPER_ADMIN'), async (req, res) => {
  const db = admin.firestore();
  const { limit = 100, startAfter } = req.query;
  let query = db.collection('auditLogs').orderBy('timestamp', 'desc').limit(Number(limit));
  if (startAfter) {
    const startDoc = await db.collection('auditLogs').doc(startAfter).get();
    if (startDoc.exists) query = query.startAfter(startDoc);
  }
  const snapshot = await query.get();
  const logs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  res.json({ success: true, data: logs, hasMore: logs.length === Number(limit) });
});

module.exports = router;
