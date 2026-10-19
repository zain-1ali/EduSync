import { SYNC_ENTITY_TYPES, SYNC_OPERATION_TYPES } from '@school/contracts';
import { z } from 'zod';

const mutation = z
  .object({
    mutationId: z.string().min(8).max(120),
    entityType: z.enum(SYNC_ENTITY_TYPES),
    entityId: z.string().min(1).max(120),
    operation: z.enum(Object.values(SYNC_OPERATION_TYPES)),
    baseVersion: z.number().int().min(0),
    payload: z.record(z.string(), z.unknown()).nullable(),
    createdAt: z.string().datetime().optional(),
  })
  .superRefine((value, context) => {
    const deleting = value.operation === SYNC_OPERATION_TYPES.DELETE;
    if (deleting && value.payload !== null) {
      context.addIssue({ code: 'custom', path: ['payload'], message: 'Delete payload must be null' });
    }
    if (!deleting && value.payload === null) {
      context.addIssue({ code: 'custom', path: ['payload'], message: 'Mutation payload is required' });
    }
  });

export const pushSchema = z.object({
  body: z.object({
    mutations: z.array(mutation).min(1).max(100),
  }),
  params: z.object({}),
  query: z.object({}),
});

export const pullSchema = z.object({
  body: z.preprocess((value) => (value == null ? {} : value), z.object({}).passthrough()),
  params: z.object({}),
  query: z.object({
    cursor: z.coerce.number().int().min(0).default(0),
    limit: z.coerce.number().int().min(1).max(500).default(250),
  }),
});
