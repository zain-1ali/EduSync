export const ACCESS_LEVELS = Object.freeze({
  NONE: 'none',
  VIEW: 'view',
  MANAGE: 'manage',
});

export const ACCESS_LEVEL_RANK = Object.freeze({
  [ACCESS_LEVELS.NONE]: 0,
  [ACCESS_LEVELS.VIEW]: 1,
  [ACCESS_LEVELS.MANAGE]: 2,
});

export const MODULES = Object.freeze({
  DASHBOARD: 'dashboard',
  STUDENTS: 'students',
  ATTENDANCE: 'attendance',
  ACADEMICS: 'academics',
  STAFF: 'staff',
  FEES: 'fees',
  REPORTS: 'reports',
  SETTINGS: 'settings',
  SYNC: 'sync',
  USERS: 'users',
  PLATFORM: 'platform',
});

export const STAFF_ROLES = Object.freeze({
  ADMINISTRATOR: 'administrator',
  INSTRUCTOR: 'instructor',
  SUPPORT_STAFF: 'support_staff',
});

export const DEFAULT_ROLE_PERMISSIONS = Object.freeze({
  instructor: Object.freeze({
    [MODULES.DASHBOARD]: ACCESS_LEVELS.VIEW,
    [MODULES.STUDENTS]: ACCESS_LEVELS.VIEW,
    [MODULES.ATTENDANCE]: ACCESS_LEVELS.MANAGE,
    [MODULES.ACADEMICS]: ACCESS_LEVELS.VIEW,
    [MODULES.REPORTS]: ACCESS_LEVELS.VIEW,
    [MODULES.SYNC]: ACCESS_LEVELS.VIEW,
  }),
  support_staff: Object.freeze({
    [MODULES.DASHBOARD]: ACCESS_LEVELS.VIEW,
    [MODULES.STUDENTS]: ACCESS_LEVELS.MANAGE,
    [MODULES.ATTENDANCE]: ACCESS_LEVELS.VIEW,
    [MODULES.ACADEMICS]: ACCESS_LEVELS.VIEW,
    [MODULES.STAFF]: ACCESS_LEVELS.VIEW,
    [MODULES.FEES]: ACCESS_LEVELS.MANAGE,
    [MODULES.REPORTS]: ACCESS_LEVELS.VIEW,
    [MODULES.SYNC]: ACCESS_LEVELS.VIEW,
  }),
});

export const SYNC_OPERATION_TYPES = Object.freeze({
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  RESOLVE: 'resolve',
});

export const SYNC_ENTITY_TYPES = Object.freeze([
  'students',
  'guardians',
  'staff',
  'academicYears',
  'programs',
  'sections',
  'subjects',
  'allocations',
  'attendance',
  'assessments',
  'grades',
  'feeStructures',
  'charges',
  'payments',
  'settings',
  'notifications',
]);

export function hasRequiredAccess(actual = ACCESS_LEVELS.NONE, required = ACCESS_LEVELS.VIEW) {
  return ACCESS_LEVEL_RANK[actual] >= ACCESS_LEVEL_RANK[required];
}
