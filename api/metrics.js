const prometheus = require('prom-client');

prometheus.collectDefaultMetrics({ prefix: 'crown_bingo_' });

const httpRequestDuration = new prometheus.Histogram({
  name: 'crown_bingo_http_request_duration_seconds',
  help: 'HTTP request latency in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5]
});

const dbQueryDuration = new prometheus.Histogram({
  name: 'crown_bingo_db_query_duration_seconds',
  help: 'Firestore query latency in seconds',
  labelNames: ['collection', 'operation'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1]
});

const activeUsers = new prometheus.Gauge({
  name: 'crown_bingo_active_users_total',
  help: 'Total active users'
});

const walletBalance = new prometheus.Gauge({
  name: 'crown_bingo_wallet_balance_total',
  help: 'Total wallet balance across all users'
});

const errorCounter = new prometheus.Counter({
  name: 'crown_bingo_errors_total',
  help: 'Total error count',
  labelNames: ['error_code']
});

function trackHttpDuration(method, route, statusCode, durationSeconds) {
  httpRequestDuration.labels(method, route, String(statusCode)).observe(durationSeconds);
}

function trackDbDuration(collection, operation, durationSeconds) {
  dbQueryDuration.labels(collection, operation).observe(durationSeconds);
}

function incrementError(code) {
  errorCounter.labels(code).inc();
}

module.exports = {
  register: prometheus.register,
  trackHttpDuration,
  trackDbDuration,
  incrementError,
  activeUsers,
  walletBalance
};
