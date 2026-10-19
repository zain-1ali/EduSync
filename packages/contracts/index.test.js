import { describe, expect, it } from 'vitest';
import {
  ACCESS_LEVELS,
  DEFAULT_ROLE_PERMISSIONS,
  MODULES,
  hasRequiredAccess,
} from './index';

describe('hasRequiredAccess', () => {
  it('uses the none, view, manage hierarchy', () => {
    expect(hasRequiredAccess(ACCESS_LEVELS.MANAGE, ACCESS_LEVELS.VIEW)).toBe(true);
    expect(hasRequiredAccess(ACCESS_LEVELS.VIEW, ACCESS_LEVELS.MANAGE)).toBe(false);
    expect(hasRequiredAccess(ACCESS_LEVELS.NONE, ACCESS_LEVELS.VIEW)).toBe(false);
  });

  it('gives instructors attendance management without user administration', () => {
    expect(DEFAULT_ROLE_PERMISSIONS.instructor[MODULES.ATTENDANCE]).toBe(
      ACCESS_LEVELS.MANAGE
    );
    expect(DEFAULT_ROLE_PERMISSIONS.instructor[MODULES.USERS]).toBeUndefined();
  });
});
