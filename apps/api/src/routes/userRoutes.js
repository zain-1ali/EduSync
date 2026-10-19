import { ACCESS_LEVELS, MODULES } from '@school/contracts';
import { Router } from 'express';
import {
  inviteUser,
  listUsers,
  revokeUserSessions,
  updatePermissions,
  updateStaffLink,
  updateUserStatus,
} from '../controllers/userController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { protect, requireAccess } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  inviteUserSchema,
  updatePermissionsSchema,
  updateStaffLinkSchema,
  updateUserStatusSchema,
  userIdSchema,
} from '../validation/userSchemas.js';

export const userRouter = Router();

userRouter.use(protect, requireAccess(MODULES.USERS, ACCESS_LEVELS.MANAGE));
userRouter.get('/', asyncHandler(listUsers));
userRouter.post('/', validate(inviteUserSchema), asyncHandler(inviteUser));
userRouter.put(
  '/:userId/permissions',
  validate(updatePermissionsSchema),
  asyncHandler(updatePermissions)
);
userRouter.patch(
  '/:userId/status',
  validate(updateUserStatusSchema),
  asyncHandler(updateUserStatus)
);
userRouter.patch(
  '/:userId/staff-link',
  validate(updateStaffLinkSchema),
  asyncHandler(updateStaffLink)
);
userRouter.post(
  '/:userId/revoke-sessions',
  validate(userIdSchema),
  asyncHandler(revokeUserSessions)
);
