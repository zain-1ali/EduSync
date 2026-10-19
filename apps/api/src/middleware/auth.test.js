import { ACCESS_LEVELS, MODULES } from '@school/contracts';
import { describe, expect, it, vi } from 'vitest';
import { requireAccess, requireSuperAdmin } from './auth.js';

function run(middleware, user) {
  const next = vi.fn();
  middleware({ user }, {}, next);
  return next.mock.calls[0]?.[0];
}

describe('authorization guards', () => {
  it('allows school administrators to manage tenant modules', () => {
    expect(
      run(requireAccess(MODULES.STUDENTS, ACCESS_LEVELS.MANAGE), {
        role: 'school_admin',
      })
    ).toBeUndefined();
  });

  it('enforces the configured access hierarchy', () => {
    const error = run(requireAccess(MODULES.FEES, ACCESS_LEVELS.MANAGE), {
      role: 'support_staff',
      permissions: new Map([[MODULES.FEES, ACCESS_LEVELS.VIEW]]),
    });
    expect(error.code).toBe('INSUFFICIENT_ACCESS');
  });

  it('keeps platform administration restricted to super administrators', () => {
    expect(run(requireSuperAdmin, { role: 'school_admin' }).code).toBe(
      'SUPER_ADMIN_REQUIRED'
    );
    expect(run(requireSuperAdmin, { role: 'super_admin' })).toBeUndefined();
  });
});
