const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const { writeAuditLog } = require('../services/audit');
const { authenticate, requireRole } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { createGameSchema } = require('../validation/schemas');

router.get('/', authenticate, requireRole('SUPER_ADMIN', 'SUPER_AGENT'), async (req, res) => {
  const db = admin.firestore();
  const snapshot = await db.collection('games').get();
  const games = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  res.json({ success: true, data: games });
});

router.post('/', authenticate, requireRole('SUPER_ADMIN'), validate(createGameSchema), async (req, res) => {
  const db = admin.firestore();
  const gameRef = db.collection('games').doc();
  await gameRef.set({
    ...req.body, status: 'PENDING',
    createdAt: admin.firestore.FieldValue.serverTimestamp(), createdBy: req.user.uid
  });
  res.status(201).json({ success: true, data: { id: gameRef.id } });
});

module.exports = router;
