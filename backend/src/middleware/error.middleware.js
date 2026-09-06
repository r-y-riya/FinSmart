import { logger } from '../utils/logger.js';

export function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'An unexpected internal server error occurred.';

  logger.error(`[API Error] ${req.method} ${req.originalUrl} - ${message}`);

  // Never expose sensitive internal traces or passwords in production responses
  res.status(statusCode).json({
    success: false,
    error: {
      message,
      code: err.code || (statusCode === 400 ? 'VALIDATION_ERROR' : 'INTERNAL_ERROR'),
    }
  });
}
