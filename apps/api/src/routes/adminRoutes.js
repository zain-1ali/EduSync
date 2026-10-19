import { Router } from 'express';
import {
  approveSchool,
  listPendingSchools,
  listTenants,
  rejectSchool,
  updateTenantStatus,
} from '../controllers/adminController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { protect, requireSuperAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  applicationIdSchema,
  rejectApplicationSchema,
  tenantStatusSchema,
} from '../validation/adminSchemas.js';

export const adminRouter = Router();

adminRouter.use(protect, requireSuperAdmin);
adminRouter.get('/schools/pending', asyncHandler(listPendingSchools));
adminRouter.post('/approve/:schoolId', validate(applicationIdSchema), asyncHandler(approveSchool));
adminRouter.post(
  '/schools/:schoolId/reject',
  validate(rejectApplicationSchema),
  asyncHandler(rejectSchool)
);
adminRouter.get('/tenants', asyncHandler(listTenants));
adminRouter.patch(
  '/tenants/:tenantId/status',
  validate(tenantStatusSchema),
  asyncHandler(updateTenantStatus)
);
