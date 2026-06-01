const admin = require('firebase-admin');

async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'UNAUTHORIZED', message: 'Missing or invalid token' });
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'INVALID_TOKEN', message: 'Token expired or invalid' });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    const userRole = req.user.role || req.user.custom_claims?.role;
    if (!roles.includes(userRole)) {
      return res.status(403).json({ success: false, error: 'FORBIDDEN', message: `Requires one of: ${roles.join(', ')}` });
    }
    next();
  };
}

module.exports = { authenticate, requireRole };
