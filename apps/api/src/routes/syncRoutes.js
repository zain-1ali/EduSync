import { ACCESS_LEVELS, MODULES } from '@school/contracts';
import { Router } from 'express';
import { pull, push } from '../controllers/syncController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { protect, requireAccess } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { pullSchema, pushSchema } from '../validation/syncSchemas.js';

export const syncRouter = Router();

syncRouter.use(protect, requireAccess(MODULES.SYNC, ACCESS_LEVELS.VIEW));
syncRouter.post('/push', validate(pushSchema), asyncHandler(push));
syncRouter.get('/pull', validate(pullSchema), asyncHandler(pull));
