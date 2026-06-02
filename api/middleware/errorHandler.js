function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const errorResponse = {
    success: false,
    error: err.code || 'SERVER_ERROR',
    message: err.message || 'Internal server error',
    correlationId: req.correlationId
  };
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
  }
  res.status(statusCode).json(errorResponse);
}

function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: 'NOT_FOUND',
    message: `Route ${req.method} ${req.path} not found`,
    correlationId: req.correlationId
  });
}

module.exports = { errorHandler, notFoundHandler };
