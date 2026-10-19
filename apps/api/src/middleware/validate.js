import { AppError } from '../utils/AppError.js';

export function validate(schema) {
  return function validateRequest(req, _res, next) {
    const result = schema.safeParse({
      body: req.body ?? {},
      params: req.params ?? {},
      query: req.query ?? {},
    });

    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      }));
      return next(new AppError(400, 'VALIDATION_ERROR', 'Request validation failed', details));
    }

    req.validated = result.data;
    return next();
  };
}
