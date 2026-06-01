const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const { writeAuditLog } = require('../services/audit');
const { authenticate, requireRole } = require('../middleware/auth');

router.post('/recharge', authenticate, requireRole('SUPER_ADMIN', 'SUPER_AGENT'), async (req, res) => {
  const { userId, amount, description } = req.body;
  const db = admin.firestore();

  try {
    const result = await db.runTransaction(async (transaction) => {
      const userRef = db.collection('users').doc(userId);
      const userSnap = await transaction.get(userRef);
      if (!userSnap.exists) throw new Error('User not found');

      const userData = userSnap.data();
      const balanceBefore = userData.balance || 0;
      const balanceAfter = balanceBefore + Number(amount);

      transaction.update(userRef, { balance: balanceAfter, updatedAt: admin.firestore.FieldValue.serverTimestamp() });

      const txnRef = db.collection('transactions').doc();
      transaction.set(txnRef, {
        userId,
        type: 'RECHARGE',
        amount: Number(amount),
        balanceBefore,
        balanceAfter,
        description: description || 'Wallet recharge',
        agentId: req.user.uid,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        status: 'COMPLETED'
      });

      return { balanceBefore, balanceAfter };
    });

    await writeAuditLog({
      action: 'WALLET_RECHARGED',
      actor: { uid: req.user.uid, email: req.user.email, role: req.user.role },
      target: { uid: userId },
      details: { amount: Number(amount), ...result },
      result: 'SUCCESS',
      ip: req.ip,
      source: 'api'
    });

    res.json({ success: true, data: result });
  } catch (err) {
    await writeAuditLog({
      action: 'WALLET_RECHARGED',
      actor: { uid: req.user.uid, email: req.user.email, role: req.user.role },
      target: { uid: userId },
      details: { amount: Number(amount) },
      result: 'FAILURE',
      error: err.message,
      ip: req.ip,
      source: 'api'
    }).catch(() => {});
    res.status(400).json({ success: false, error: 'RECHARGE_FAILED', message: err.message });
  }
});

module.exports = router;
