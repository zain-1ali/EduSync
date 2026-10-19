import { AppError } from '../utils/AppError.js';

export function requireTrustedClient(req, _res, next) {
  if (req.get('x-edusync-client') !== '1') {
    return next(
      new AppError(403, 'CLIENT_HEADER_REQUIRED', 'This session request is not allowed')
    );
  }
  return next();
}
