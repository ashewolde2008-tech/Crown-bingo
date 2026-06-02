const winston = require('winston');
require('winston-daily-rotate-file');

const fileRotateTransport = new winston.transports.DailyRotateFile({
  filename: 'logs/crown-bingo-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '30d',
  zippedArchive: true
});

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'crown-bingo-api' },
  transports: [
    fileRotateTransport,
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

function logRequest(req, res, durationMs) {
  logger.info('API request', {
    correlationId: req.correlationId,
    method: req.method,
    path: req.path,
    statusCode: res.statusCode,
    durationMs,
    actor: req.user ? { uid: req.user.uid } : null
  });
}

function logError(req, err, durationMs) {
  logger.error('API error', {
    correlationId: req.correlationId,
    method: req.method,
    path: req.path,
    error: { code: err.code, message: err.message, stack: err.stack },
    durationMs,
    actor: req.user ? { uid: req.user.uid } : null
  });
}

module.exports = { logger, logRequest, logError };
