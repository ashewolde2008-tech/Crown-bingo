const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const { writeAuditLog } = require('../services/audit');
const { authenticate, requireRole } = require('../middleware/auth');

router.post('/transfer', authenticate, requireRole('SUPER_ADMIN', 'SUPER_AGENT'), async (req, res) => {
  const { userId, amount, percent } = req.body;
  const db = admin.firestore();

  if (!userId || !amount || amount <= 0 || !percent || percent <= 0) {
    return res.status(400).json({ success: false, error: 'VALIDATION_ERROR', message: 'userId, amount (>0), and percent (>0) are required' });
  }

  const numericAmount = Number(amount);
  const numericPercent = Number(percent);
  if (isNaN(numericAmount) || isNaN(numericPercent) || numericAmount <= 0 || numericPercent <= 0) {
    return res.status(400).json({ success: false, error: 'VALIDATION_ERROR', message: 'Amount and percent must be valid positive numbers' });
  }

  try {
    const result = await db.runTransaction(async (transaction) => {
      const adminRef = db.collection('points').doc(req.user.uid);
      const userRef = db.collection('points').doc(userId);
      const adminSnap = await transaction.get(adminRef);
      const userSnap = await transaction.get(userRef);

      const adminPoints = adminSnap.exists ? (adminSnap.data().points || 0) : 0;
      const userPoints = userSnap.exists ? (userSnap.data().points || 0) : 0;

      if (percent <= 0) throw new Error('Percent must be greater than 0');
      const requiredFromAdmin = Math.ceil((Number(amount) * 100) / Number(percent));
      if (adminPoints < requiredFromAdmin) throw new Error('Insufficient admin points');

      const newUserPoints = userPoints + requiredFromAdmin;
      const newAdminPoints = adminPoints - requiredFromAdmin;

      transaction.set(userRef, { points: newUserPoints, percent: Number(percent), uid: userId, casher_percent: 20 }, { merge: true });
      transaction.set(adminRef, { points: newAdminPoints, uid: req.user.uid }, { merge: true });

      return { balanceBefore: { admin: adminPoints, user: userPoints }, balanceAfter: { admin: newAdminPoints, user: newUserPoints }, transferredAmount: requiredFromAdmin };
    });

    await db.collection('history').add({
      userId,
      adminId: req.user.uid,
      userName: req.body.userName || '',
      pointsAdded: Number(amount),
      percent: Number(percent),
      date: admin.firestore.FieldValue.serverTimestamp()
    });

    await writeAuditLog({
      action: 'POINTS_TRANSFERRED',
      actor: { uid: req.user.uid, email: req.user.email, role: req.user.role },
      target: { uid: userId, email: req.body.userEmail || '' },
      details: { amount: Number(amount), percent: Number(percent), ...result },
      result: 'SUCCESS',
      ip: req.ip,
      source: 'api'
    });

    res.json({ success: true, data: result });
  } catch (err) {
    await writeAuditLog({
      action: 'POINTS_TRANSFERRED',
      actor: { uid: req.user.uid, email: req.user.email, role: req.user.role },
      target: { uid: userId, email: req.body.userEmail || '' },
      details: { amount: Number(amount), percent: Number(percent) },
      result: 'FAILURE',
      error: err.message,
      ip: req.ip,
      source: 'api'
    }).catch(() => {});
    res.status(400).json({ success: false, error: 'TRANSFER_FAILED', message: 'Point transfer failed' });
  }
});

module.exports = router;
