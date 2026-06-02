const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const { writeAuditLog } = require('../services/audit');
const { authenticate, requireRole } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { createBetSchema } = require('../validation/schemas');

router.get('/', authenticate, requireRole('SUPER_ADMIN', 'SUPER_AGENT'), async (req, res) => {
  const db = admin.firestore();
  const snapshot = await db.collection('bets').get();
  const bets = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  res.json({ success: true, data: bets });
});

router.post('/', authenticate, requireRole('USER'), validate(createBetSchema), async (req, res) => {
  const db = admin.firestore();
  try {
    const result = await db.runTransaction(async (transaction) => {
      const userRef = db.collection('users').doc(req.body.userId);
      const userSnap = await transaction.get(userRef);
      if (!userSnap.exists) throw new Error('User not found');
      const user = userSnap.data();
      if ((user.balance || 0) < req.body.amount) throw new Error('Insufficient balance');
      transaction.update(userRef, { balance: (user.balance || 0) - req.body.amount });
      const betRef = db.collection('bets').doc();
      transaction.set(betRef, {
        gameId: req.body.gameId, userId: req.body.userId, amount: req.body.amount,
        numbers: req.body.numbers, status: 'ACTIVE',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      return { betId: betRef.id, balanceAfter: (user.balance || 0) - req.body.amount };
    });
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    res.status(400).json({ success: false, error: 'BET_FAILED', message: err.message });
  }
});

module.exports = router;
