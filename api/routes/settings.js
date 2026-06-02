const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const { authenticate, requireRole } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { updateSettingsSchema } = require('../validation/schemas');

router.get('/', authenticate, requireRole('SUPER_ADMIN'), async (req, res) => {
  const db = admin.firestore();
  const snapshot = await db.collection('settings').get();
  if (snapshot.empty) return res.json({ success: true, data: null });
  const settings = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
  res.json({ success: true, data: settings });
});

router.patch('/', authenticate, requireRole('SUPER_ADMIN'), validate(updateSettingsSchema), async (req, res) => {
  const db = admin.firestore();
  await db.collection('settings').doc('config').set(req.body, { merge: true });
  res.json({ success: true });
});

module.exports = router;
