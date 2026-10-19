import { describe, expect, it } from 'vitest';
import { issueAccessToken, verifyAccessToken } from './tokenService.js';

describe('access tokens', () => {
  it('signs tenant and permission claims with the expected audience', () => {
    const token = issueAccessToken({
      id: '507f1f77bcf86cd799439011',
      tenantId: { toString: () => '507f191e810c19729de860ea' },
      role: 'instructor',
      permissions: new Map([['attendance', 'manage']]),
    });

    const claims = verifyAccessToken(token);
    expect(claims.sub).toBe('507f1f77bcf86cd799439011');
    expect(claims.tenantId).toBe('507f191e810c19729de860ea');
    expect(claims.permissions.attendance).toBe('manage');
  });
});
