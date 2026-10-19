import { describe, expect, it } from 'vitest';
import { pullSchema } from './syncSchemas.js';

describe('pullSchema', () => {
  it('accepts a GET request that has no body', () => {
    const result = pullSchema.safeParse({
      body: undefined,
      params: {},
      query: { cursor: '0', limit: '250' },
    });

    expect(result.success).toBe(true);
    expect(result.data.query).toEqual({ cursor: 0, limit: 250 });
  });
});
