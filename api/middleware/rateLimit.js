const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = rateLimit;

const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'RATE_LIMITED', message: 'Too many requests, please slow down' }
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'RATE_LIMITED', message: 'Too many login attempts, try again later' }
});

const apiLimiter = rateLimit({
  keyGenerator: (req) => req.user?.uid || ipKeyGenerator(req),
  windowMs: 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'RATE_LIMITED', message: 'Too many API requests' }
});

module.exports = { globalLimiter, loginLimiter, apiLimiter };
