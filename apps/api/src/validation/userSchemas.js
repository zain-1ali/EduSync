import { ACCESS_LEVELS, MODULES } from '@school/contracts';
import { z } from 'zod';

const mongoId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid identifier');
const permissionSchema = z.record(
  z.enum(Object.values(MODULES)),
  z.enum(Object.values(ACCESS_LEVELS))
);

export const inviteUserSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(120),
    email: z.string().trim().toLowerCase().email().max(254),
    role: z.enum(['school_admin', 'instructor', 'support_staff']),
    staffId: z.string().trim().min(1).max(120).optional(),
    permissions: permissionSchema.default({}),
  }),
  params: z.object({}),
  query: z.object({}),
});

export const updateStaffLinkSchema = z.object({
  body: z.object({
    staffId: z.string().trim().min(1).max(120).nullable(),
  }),
  params: z.object({ userId: mongoId }),
  query: z.object({}),
});

export const updatePermissionsSchema = z.object({
  body: z.object({
    permissions: permissionSchema,
  }),
  params: z.object({ userId: mongoId }),
  query: z.object({}),
});

export const updateUserStatusSchema = z.object({
  body: z.object({
    status: z.enum(['active', 'locked', 'disabled']),
    reason: z.string().trim().min(5).max(500),
  }),
  params: z.object({ userId: mongoId }),
  query: z.object({}),
});

export const userIdSchema = z.object({
  body: z.object({}).passthrough(),
  params: z.object({ userId: mongoId }),
  query: z.object({}),
});
