const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const { writeAuditLog } = require('../services/audit');
const { authenticate, requireRole } = require('../middleware/auth');

router.post('/', authenticate, requireRole('SUPER_ADMIN', 'SUPER_AGENT'), async (req, res) => {
  const { email, password, username, phone, initialBalance, role } = req.body;

  try {
    const userRecord = await admin.auth().createUser({ email, password });
    const db = admin.firestore();
    const targetCollection = role === 'agent' ? 'agents' : 'users';
    const docData = {
      uid: userRecord.uid,
      email,
      username: username || '',
      phone: phone || '',
      balance: initialBalance || 0,
      isActive: true,
      isDisabled: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: req.user.uid
    };
    if (role === 'agent') {
      docData.agentCode = req.body.agentCode || '';
      docData.commissionRate = req.body.commissionRate || 5;
      docData.totalSales = 0;
      docData.totalEarnings = 0;
    }
    await db.collection(targetCollection).doc(userRecord.uid).set(docData);

    await writeAuditLog({
      action: role === 'agent' ? 'AGENT_CREATED' : 'USER_CREATED',
      actor: { uid: req.user.uid, email: req.user.email, role: req.user.role },
      target: { uid: userRecord.uid, email },
      details: { role, initialBalance },
      result: 'SUCCESS',
      ip: req.ip,
      source: 'api'
    });

    res.status(201).json({ success: true, data: { uid: userRecord.uid, ...docData } });
  } catch (err) {
    await writeAuditLog({
      action: role === 'agent' ? 'AGENT_CREATED' : 'USER_CREATED',
      actor: { uid: req.user.uid, email: req.user.email, role: req.user.role },
      target: { uid: null, email },
      details: { role, initialBalance },
      result: 'FAILURE',
      error: err.message,
      ip: req.ip,
      source: 'api'
    }).catch(() => {});
    res.status(500).json({ success: false, error: err.code || 'SERVER_ERROR', message: err.message });
  }
});

module.exports = router;
