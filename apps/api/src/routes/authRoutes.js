import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import {
  forgotPassword,
  login,
  logout,
  me,
  refresh,
  registerSchool,
  resetPassword,
  setupPassword,
} from '../controllers/authController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { protect } from '../middleware/auth.js';
import { requireTrustedClient } from '../middleware/trustedClient.js';
import { validate } from '../middleware/validate.js';
import {
  forgotPasswordSchema,
  loginSchema,
  refreshSchema,
  registerSchoolSchema,
  resetPasswordSchema,
  setupPasswordSchema,
} from '../validation/authSchemas.js';

const sensitiveLimit = rateLimit({
  windowMs: 15 * 60 * 1_000,
  limit: 20,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many attempts. Please try again later.',
    },
  },
});

export const authRouter = Router();

authRouter.post('/register', sensitiveLimit, validate(registerSchoolSchema), asyncHandler(registerSchool));
authRouter.post('/login', sensitiveLimit, validate(loginSchema), asyncHandler(login));
authRouter.post(
  '/setup-password',
  sensitiveLimit,
  validate(setupPasswordSchema),
  asyncHandler(setupPassword)
);
authRouter.post(
  '/forgot-password',
  sensitiveLimit,
  validate(forgotPasswordSchema),
  asyncHandler(forgotPassword)
);
authRouter.post(
  '/reset-password',
  sensitiveLimit,
  validate(resetPasswordSchema),
  asyncHandler(resetPassword)
);
authRouter.post(
  '/refresh',
  sensitiveLimit,
  requireTrustedClient,
  validate(refreshSchema),
  asyncHandler(refresh)
);
authRouter.post('/logout', requireTrustedClient, asyncHandler(logout));
authRouter.get('/me', protect, asyncHandler(me));
