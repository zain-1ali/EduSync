import { AppError } from '../utils/AppError.js';
import { env } from '../config/env.js';

export function notFound(req, _res, next) {
  next(new AppError(404, 'ROUTE_NOT_FOUND', `No route matches ${req.method} ${req.path}`));
}

export function errorHandler(error, req, res, _next) {
  let normalized = error;

  if (error?.code === 11000) {
    normalized = new AppError(409, 'DUPLICATE_RECORD', 'A record with these values already exists');
  } else if (error?.name === 'ValidationError') {
    normalized = new AppError(
      400,
      'MODEL_VALIDATION_ERROR',
      'Stored data validation failed',
      Object.values(error.errors).map((item) => item.message)
    );
  } else if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    normalized = new AppError(400, 'INVALID_JSON', 'Request body contains invalid JSON');
  }

  const status = normalized.statusCode || 500;
  const operational = Boolean(normalized.isOperational);

  if (!operational) {
    req.log?.error({ err: error, requestId: req.id }, 'Unhandled request error');
  }

  res.status(status).json({
    error: {
      code: normalized.code || 'INTERNAL_ERROR',
      message:
        operational || env.NODE_ENV !== 'production'
          ? normalized.message
          : 'An unexpected error occurred',
      details: operational ? normalized.details : undefined,
      requestId: req.id,
      ...(env.NODE_ENV === 'development' && !operational ? { stack: normalized.stack } : {}),
    },
  });
}
