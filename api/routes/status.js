const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const { writeAuditLog } = require('../services/audit');
const { authenticate, requireRole } = require('../middleware/auth');

router.patch('/:uid/status', authenticate, requireRole('SUPER_ADMIN', 'SUPER_AGENT'), async (req, res) => {
  const { uid } = req.params;
  const { disabled, reason } = req.body;
  const db = admin.firestore();

  try {
    const userRef = db.collection('users').doc(uid);
    const userSnap = await userRef.get();
    if (!userSnap.exists) return res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'User not found' });

    const updateData = {
      isDisabled: !!disabled,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    if (disabled) {
      updateData.disabledReason = reason || 'Account suspended by admin';
      updateData.disabledAt = admin.firestore.FieldValue.serverTimestamp();
    } else {
      updateData.disabledReason = null;
      updateData.disabledAt = null;
    }

    await userRef.update(updateData);

    await writeAuditLog({
      action: disabled ? 'USER_DISABLED' : 'USER_ENABLED',
      actor: { uid: req.user.uid, email: req.user.email, role: req.user.role },
      target: { uid, email: userSnap.data().email || '' },
      details: { reason: updateData.disabledReason },
      result: 'SUCCESS',
      ip: req.ip,
      source: 'api'
    });

    res.json({ success: true, data: { uid, ...updateData } });
  } catch (err) {
    res.status(500).json({ success: false, error: 'SERVER_ERROR', message: err.message });
  }
});

module.exports = router;
