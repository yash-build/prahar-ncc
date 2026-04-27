/**
 * Global Error Handler
 *
 * Catches all errors thrown via next(error) or unhandled promise rejections.
 * Returns consistent JSON error format throughout the API.
 */

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message    = err.message    || 'Internal Server Error';

  // ── Mongoose Validation Error ─────────────────────────────────────────────
  if (err.name === 'ValidationError') {
    statusCode = 400;
    // Concatenate all validation messages
    message = Object.values(err.errors).map(e => e.message).join('. ');
  }

  // ── Mongoose Duplicate Key (unique constraint violated) ───────────────────
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
  }

  // ── Mongoose Cast Error (invalid ObjectId) ────────────────────────────────
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ID format for field: ${err.path}`;
  }

  // ── JWT Errors ────────────────────────────────────────────────────────────
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token — please log in again';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Session expired — please log in again';
  }

  // Log full error in development only
  if (process.env.NODE_ENV === 'development') {
    console.error('❌ ERROR:', err.stack);
  }

  res.status(statusCode).json({
    success: false,
    message,
    // Only include stack trace in development
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
