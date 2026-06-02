const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const { writeAuditLog } = require('../services/audit');
const { authenticate, requireRole } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { createAgentSchema } = require('../validation/schemas');

router.get('/', authenticate, requireRole('SUPER_ADMIN'), async (req, res) => {
  const db = admin.firestore();
  const snapshot = await db.collection('agents').get();
  const agents = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  res.json({ success: true, data: agents });
});

router.post('/', authenticate, requireRole('SUPER_ADMIN'), validate(createAgentSchema), async (req, res) => {
  const { email, password, username, phone, agentCode, commissionRate } = req.body;
  const db = admin.firestore();
  try {
    const userRecord = await admin.auth().createUser({ email, password });
    await admin.auth().setCustomUserClaims(userRecord.uid, { role: 'SUPER_AGENT' });
    await db.collection('agents').doc(userRecord.uid).set({
      uid: userRecord.uid, email, username, phone: phone || '', agentCode,
      commissionRate: commissionRate || 5, totalSales: 0, totalEarnings: 0,
      isActive: true, createdAt: admin.firestore.FieldValue.serverTimestamp(), createdBy: req.user.uid
    });
    await writeAuditLog({
      action: 'AGENT_CREATED', actor: { uid: req.user.uid, email: req.user.email },
      target: { uid: userRecord.uid, email }, result: 'SUCCESS', ip: req.ip, source: 'api'
    });
    res.status(201).json({ success: true, data: { uid: userRecord.uid } });
  } catch (err) {
    await writeAuditLog({
      action: 'AGENT_CREATED', actor: { uid: req.user.uid, email: req.user.email },
      target: { uid: null, email }, result: 'FAILURE', error: err.message, ip: req.ip, source: 'api'
    }).catch(() => {});
    res.status(500).json({ success: false, error: err.code, message: 'Agent creation failed' });
  }
});

router.patch('/:id', authenticate, requireRole('SUPER_ADMIN'), async (req, res) => {
  const db = admin.firestore();
  await db.collection('agents').doc(req.params.id).update({ ...req.body, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
  res.json({ success: true });
});

router.delete('/:id', authenticate, requireRole('SUPER_ADMIN'), async (req, res) => {
  const db = admin.firestore();
  await db.collection('agents').doc(req.params.id).delete();
  res.json({ success: true });
});

module.exports = router;
