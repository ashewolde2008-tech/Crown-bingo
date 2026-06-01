const admin = require('firebase-admin');

async function writeAuditLog({ action, actor, target, details, result, error, ip, source }) {
  const db = admin.firestore();
  await db.collection('auditLogs').add({
    action,
    actor,
    target,
    details,
    result,
    error: error || null,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    ip: ip || null,
    source: source || 'api'
  });
}

module.exports = { writeAuditLog };
