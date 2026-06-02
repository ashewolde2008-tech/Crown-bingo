const cors = require('cors');

const allowedOrigins = {
  development: ['http://localhost:3000', 'http://localhost:5000', 'http://localhost:3001'],
  staging: ['https://staging-admin.crownbingo.com', 'https://staging-agent.crownbingo.com', 'https://staging-play.crownbingo.com'],
  production: ['https://admin.crownbingo.com', 'https://agent.crownbingo.com', 'https://play.crownbingo.com']
};

function createCorsMiddleware() {
  return cors({
    origin: function (origin, callback) {
      const env = process.env.NODE_ENV || 'development';
      const allowed = allowedOrigins[env] || allowedOrigins.development;
      if (!origin || allowed.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('CORS policy violation'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  });
}

module.exports = { createCorsMiddleware };
