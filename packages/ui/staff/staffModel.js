import { ACCESS_LEVELS, MODULES, STAFF_ROLES } from '@school/contracts';

/** Payroll stays off until a real ledger exists. Screens must not invent salary or bank data. */
export const PAYROLL_AVAILABLE = false;

export const STAFF_ROLE_OPTIONS = [
  { value: STAFF_ROLES.ADMINISTRATOR, label: 'Administrator' },
  { value: STAFF_ROLES.INSTRUCTOR, label: 'Instructor' },
  { value: STAFF_ROLES.SUPPORT_STAFF, label: 'Support staff' },
];

export const STAFF_STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'on_leave', label: 'On leave' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'terminated', label: 'Terminated' },
];

export const ACCOUNT_ROLE_OPTIONS = [
  { value: 'instructor', label: 'Instructor' },
  { value: 'support_staff', label: 'Support staff' },
  { value: 'school_admin', label: 'School administrator' },
];

export const CONTRACT_TYPES = ['Full-time', 'Part-time', 'Contract', 'Temporary'];

export const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export const EDITABLE_MODULES = [
  MODULES.DASHBOARD,
  MODULES.STUDENTS,
  MODULES.ATTENDANCE,
  MODULES.ACADEMICS,
  MODULES.STAFF,
  MODULES.FEES,
  MODULES.REPORTS,
  MODULES.SETTINGS,
  MODULES.SYNC,
];

export const MODULE_DETAILS = {
  [MODULES.DASHBOARD]: { label: 'Dashboard', description: 'Open school-wide summaries.' },
  [MODULES.STUDENTS]: { label: 'Students', description: 'Open and maintain student records.' },
  [MODULES.ATTENDANCE]: { label: 'Attendance', description: 'Mark and review attendance.' },
  [MODULES.ACADEMICS]: { label: 'Academics', description: 'Open classes, subjects, and allocations.' },
  [MODULES.STAFF]: { label: 'Staff', description: 'Open or maintain the HR directory.' },
  [MODULES.FEES]: { label: 'Fees', description: 'Open balances or record payments.' },
  [MODULES.REPORTS]: { label: 'Reports', description: 'Open operational reports.' },
  [MODULES.SETTINGS]: { label: 'Settings', description: 'Change school settings.' },
  [MODULES.SYNC]: { label: 'Sync', description: 'Open sync status and conflicts.' },
};

const ACCESS_LABELS = {
  [ACCESS_LEVELS.NONE]: 'None',
  [ACCESS_LEVELS.VIEW]: 'View',
  [ACCESS_LEVELS.MANAGE]: 'Manage',
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const EMPTY_STAFF_FORM = {
  firstName: '',
  lastName: '',
  employeeId: '',
  email: '',
  phone: '',
  role: '',
  highestEducation: '',
  specialization: '',
  dateOfBirth: '',
  joinedOn: '',
  campus: '',
  address: '',
  emergencyContactName: '',
  emergencyContactRelationship: '',
  emergencyContactPhone: '',
  contractType: '',
  photoDataUrl: '',
};

export function normalizeStaffRole(role) {
  const value = String(role || '')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');
  if (!value) return '';
  if (value === 'admin' || value === 'administrator') return STAFF_ROLES.ADMINISTRATOR;
  if (value === 'teacher' || value === 'instructor') return STAFF_ROLES.INSTRUCTOR;
  if (value === 'support' || value === 'support_staff' || value === 'supportstaff') {
    return STAFF_ROLES.SUPPORT_STAFF;
  }
  return '';
}

export function staffRoleLabel(role) {
  const normalized = normalizeStaffRole(role);
  return STAFF_ROLE_OPTIONS.find((option) => option.value === normalized)?.label || (role ? String(role) : 'Unassigned');
}

export function staffStatusLabel(status) {
  return STAFF_STATUS_OPTIONS.find((option) => option.value === status)?.label || 'Unknown';
}

export function accessLabel(level) {
  return ACCESS_LABELS[level] || 'None';
}

export function splitName(staff) {
  if (staff?.firstName || staff?.lastName) {
    return { firstName: staff.firstName || '', lastName: staff.lastName || '' };
  }
  const parts = String(staff?.name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  return { firstName: parts[0] || '', lastName: parts.slice(1).join(' ') };
}

export function staffDisplayName(staff) {
  const { firstName, lastName } = splitName(staff);
  return `${firstName} ${lastName}`.trim() || 'Unnamed staff';
}

export function staffInitials(staff) {
  const { firstName, lastName } = splitName(staff);
  const letters = `${firstName.charAt(0)}${lastName.charAt(0) || firstName.charAt(1)}`;
  return letters.toUpperCase() || '?';
}

export function suggestedAccountRole(hrRole) {
  return normalizeStaffRole(hrRole) === STAFF_ROLES.INSTRUCTOR ? 'instructor' : 'support_staff';
}

export function formatDate(value) {
  if (!value) return '—';
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value));
  if (!match) return String(value);
  const month = MONTHS[Number(match[2]) - 1];
  if (!month) return String(value);
  return `${month} ${Number(match[3])}, ${match[1]}`;
}

export function formatTimestamp(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const suffix = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;
  return `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}, ${hour12}:${minutes} ${suffix}`;
}

export function filterStaff(records, { query = '', role = '', status = '' } = {}) {
  const needle = query.trim().toLowerCase();
  return records
    .filter((staff) => {
      const haystack = `${staffDisplayName(staff)} ${staff.employeeId || ''} ${staff.email || ''}`.toLowerCase();
      const matchesQuery = !needle || haystack.includes(needle);
      const matchesRole = !role || normalizeStaffRole(staff.role) === role;
      const matchesStatus = !status || staff.status === status;
      return matchesQuery && matchesRole && matchesStatus;
    })
    .sort((left, right) => staffDisplayName(left).localeCompare(staffDisplayName(right)));
}

export function paginate(records, page, pageSize) {
  const pageCount = Math.max(1, Math.ceil(records.length / pageSize) || 1);
  const current = Math.min(Math.max(page, 1), pageCount);
  const start = (current - 1) * pageSize;
  return {
    page: current,
    pageCount,
    pageSize,
    total: records.length,
    items: records.slice(start, start + pageSize),
  };
}

export function staffMetrics(records) {
  return {
    totalStaff: records.length,
    activeInstructors: records.filter(
      (staff) => normalizeStaffRole(staff.role) === STAFF_ROLES.INSTRUCTOR && staff.status === 'active'
    ).length,
    onLeaveCount: records.filter((staff) => staff.status === 'on_leave').length,
  };
}

export function duplicateEmployeeId(records, employeeId, ignoreId) {
  const needle = String(employeeId || '').trim().toLowerCase();
  if (!needle) return null;
  return (
    records.find(
      (staff) => staff.id !== ignoreId && String(staff.employeeId || '').trim().toLowerCase() === needle
    ) || null
  );
}

function dateInputValue(value) {
  const match = /^(\d{4}-\d{2}-\d{2})/.exec(String(value || ''));
  return match ? match[1] : '';
}

export function formFromStaff(staff) {
  const names = splitName(staff);
  return {
    ...EMPTY_STAFF_FORM,
    firstName: names.firstName,
    lastName: names.lastName,
    employeeId: staff?.employeeId || '',
    email: staff?.email || '',
    phone: staff?.phone || '',
    role: normalizeStaffRole(staff?.role),
    highestEducation: staff?.highestEducation || '',
    specialization: staff?.specialization || '',
    dateOfBirth: dateInputValue(staff?.dateOfBirth),
    joinedOn: dateInputValue(staff?.joinedOn),
    campus: staff?.campus || '',
    address: staff?.address || '',
    emergencyContactName: staff?.emergencyContactName || '',
    emergencyContactRelationship: staff?.emergencyContactRelationship || '',
    emergencyContactPhone: staff?.emergencyContactPhone || '',
    contractType: staff?.contractType || '',
    photoDataUrl: staff?.photoDataUrl || '',
  };
}

export function buildStaffRecord(input) {
  const firstName = String(input.firstName || '').trim();
  const lastName = String(input.lastName || '').trim();
  return {
    firstName,
    lastName,
    name: `${firstName} ${lastName}`.trim(),
    employeeId: String(input.employeeId || '').trim(),
    email: String(input.email || '').trim().toLowerCase(),
    phone: String(input.phone || '').trim(),
    role: normalizeStaffRole(input.role),
    highestEducation: String(input.highestEducation || '').trim(),
    specialization: String(input.specialization || '').trim(),
    dateOfBirth: input.dateOfBirth || '',
    joinedOn: input.joinedOn || '',
    campus: String(input.campus || '').trim(),
    address: String(input.address || '').trim(),
    emergencyContactName: String(input.emergencyContactName || '').trim(),
    emergencyContactRelationship: String(input.emergencyContactRelationship || '').trim(),
    emergencyContactPhone: String(input.emergencyContactPhone || '').trim(),
    contractType: String(input.contractType || '').trim(),
    photoDataUrl: input.photoDataUrl || '',
  };
}

export function validateStaffInput(input, records, ignoreId) {
  const errors = {};
  if (!String(input.firstName || '').trim()) errors.firstName = 'First name is required.';
  if (!String(input.lastName || '').trim()) errors.lastName = 'Last name is required.';
  if (!String(input.employeeId || '').trim()) errors.employeeId = 'Employee ID is required.';
  else if (duplicateEmployeeId(records, input.employeeId, ignoreId)) {
    errors.employeeId = 'This employee ID is already in use.';
  }
  const email = String(input.email || '').trim();
  if (!email) errors.email = 'Email is required.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Enter a valid email address.';
  if (!String(input.phone || '').trim()) errors.phone = 'Phone number is required.';
  if (!normalizeStaffRole(input.role)) errors.role = 'Choose an HR role.';
  return errors;
}

export function statusNoteError(note) {
  if (String(note || '').trim().length < 5) return 'Enter a reason of at least 5 characters.';
  return '';
}

export function validateStatusChange(currentStatus, nextStatus, note) {
  if (!STAFF_STATUS_OPTIONS.some((option) => option.value === nextStatus)) return 'Choose a valid status.';
  if (nextStatus === currentStatus) return 'Choose a different status.';
  return statusNoteError(note);
}

export function withStatusChange(staff, status, note, at = new Date().toISOString()) {
  const history = Array.isArray(staff.statusHistory) ? staff.statusHistory : [];
  return {
    status,
    statusHistory: [...history, { status, note: String(note || '').trim(), at }],
  };
}

export function photoFileError(file) {
  if (!file) return 'Choose a photo.';
  const allowed = ['image/jpeg', 'image/png', 'image/gif'];
  if (!allowed.includes(file.type)) return 'Use a JPG, PNG, or GIF image.';
  if (file.size > 2 * 1024 * 1024) return 'Photo must be 2MB or smaller.';
  return '';
}

export function userKey(user) {
  return String(user?._id || user?.id || '');
}

export function linkPatch(user) {
  return {
    linkedUserId: userKey(user),
    accountEmail: String(user?.email || '')
      .trim()
      .toLowerCase(),
  };
}

export function unlinkPatch() {
  return { linkedUserId: '', accountEmail: '' };
}

export function linkedUser(users, staff) {
  if (!staff) return null;
  if (staff.linkedUserId) {
    const match = users.find((user) => userKey(user) === String(staff.linkedUserId));
    if (match) return match;
  }
  return users.find((user) => user.staffId && String(user.staffId) === String(staff.id)) || null;
}

export function suggestedUser(users, staff) {
  if (!staff?.email || staff.linkedUserId || linkedUser(users, staff)) return null;
  const email = staff.email.toLowerCase();
  return users.find((user) => String(user.email || '').toLowerCase() === email) || null;
}

export function readPermissions(user) {
  const source = user?.permissions;
  if (!source || Array.isArray(source)) return {};
  if (typeof source.entries === 'function') {
    try {
      return Object.fromEntries(source.entries());
    } catch {
      return {};
    }
  }
  return { ...source };
}

export function isFixedAccessAccount(user) {
  return user?.role === 'school_admin' || user?.role === 'super_admin';
}

export function permissionState(user) {
  const stored = readPermissions(user);
  return Object.fromEntries(
    EDITABLE_MODULES.map((moduleName) => [moduleName, stored[moduleName] || ACCESS_LEVELS.NONE])
  );
}

export function effectiveLevel(user, moduleName) {
  if (isFixedAccessAccount(user)) return ACCESS_LEVELS.MANAGE;
  return permissionState(user)[moduleName] || ACCESS_LEVELS.NONE;
}

export function staffAllocations(allocations, staffId) {
  const rank = (day) => {
    const index = WEEKDAYS.indexOf(day);
    return index === -1 ? WEEKDAYS.length : index;
  };
  return allocations
    .filter((item) => item.staffId === staffId)
    .sort((left, right) => {
      const byDay = rank(left.day) - rank(right.day);
      if (byDay !== 0) return byDay;
      return String(left.startTime || '').localeCompare(String(right.startTime || ''));
    });
}

export function describeAllocations(allocations, lookups = {}) {
  const subjects = lookups.subjects || [];
  const sections = lookups.sections || [];
  const programs = lookups.programs || [];
  return allocations.map((item) => {
    const subject = subjects.find((value) => value.id === item.subjectId);
    const section = sections.find((value) => value.id === item.sectionId);
    const program = programs.find((value) => value.id === (section?.programId || subject?.programId));
    return {
      ...item,
      subjectName: subject?.name || 'Subject',
      sectionName: section?.name || 'Section',
      programName: program?.name || '',
      roomLabel: item.room ? item.room : 'Room pending',
    };
  });
}

export function groupByDay(allocations) {
  return WEEKDAYS.map((day) => ({
    day,
    items: allocations
      .filter((item) => item.day === day)
      .sort((left, right) => String(left.startTime || '').localeCompare(String(right.startTime || ''))),
  }));
}

function minutesBetween(start, end) {
  const startMatch = /^(\d{2}):(\d{2})/.exec(start || '');
  const endMatch = /^(\d{2}):(\d{2})/.exec(end || '');
  if (!startMatch || !endMatch) return 0;
  return (
    Number(endMatch[1]) * 60 +
    Number(endMatch[2]) -
    (Number(startMatch[1]) * 60 + Number(startMatch[2]))
  );
}

export function sessionLength(start, end) {
  const minutes = minutesBetween(start, end);
  if (minutes <= 0) return '';
  const hours = Math.round((minutes / 60) * 10) / 10;
  return `${hours}h`;
}

export function weeklyHours(items) {
  const minutes = items.reduce((total, item) => {
    const span = minutesBetween(item.startTime, item.endTime);
    return total + (span > 0 ? span : 0);
  }, 0);
  return Math.round((minutes / 60) * 10) / 10;
}

export function timesOverlap(startA, endA, startB, endB) {
  return Boolean(startA && endA && startB && endB) && startA < endB && startB < endA;
}

export function findTimetableConflict(existing, candidate) {
  const overlapping = (existing || []).filter(
    (item) =>
      !item.deletedAt &&
      item.day === candidate.day &&
      timesOverlap(item.startTime, item.endTime, candidate.startTime, candidate.endTime)
  );
  const classClash = overlapping.find((item) => item.sectionId && item.sectionId === candidate.sectionId);
  if (classClash) return { reason: 'class', item: classClash };
  const teacherClash = overlapping.find((item) => item.staffId && item.staffId === candidate.staffId);
  if (teacherClash) return { reason: 'teacher', item: teacherClash };
  const roomClash = overlapping.find(
    (item) => candidate.room && item.room && item.room === candidate.room
  );
  if (roomClash) return { reason: 'room', item: roomClash };
  return null;
}

export function scheduleConflicts(items) {
  const conflicts = [];
  groupByDay(items).forEach(({ day, items: dayItems }) => {
    for (let index = 1; index < dayItems.length; index += 1) {
      const previous = dayItems[index - 1];
      const current = dayItems[index];
      if (!previous.startTime || !previous.endTime || !current.startTime) continue;
      if (current.startTime < previous.endTime) {
        conflicts.push({ day, previous, current });
      }
    }
  });
  return conflicts;
}
