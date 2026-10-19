import { z } from 'zod';

const mongoId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid identifier');

export const applicationIdSchema = z.object({
  body: z.preprocess((value) => (value == null ? {} : value), z.object({}).passthrough()),
  params: z.object({ schoolId: mongoId }),
  query: z.object({}).optional().default({}),
});

export const rejectApplicationSchema = z.object({
  body: z.object({
    reason: z.string().trim().min(10).max(1_000),
  }),
  params: z.object({ schoolId: mongoId }),
  query: z.object({}),
});

export const tenantStatusSchema = z.object({
  body: z.object({
    status: z.enum(['active', 'suspended']),
    reason: z.string().trim().min(5).max(500),
  }),
  params: z.object({ tenantId: mongoId }),
  query: z.object({}),
});
