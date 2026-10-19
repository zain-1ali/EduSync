import { describe, expect, it } from 'vitest';
import {
  PAYROLL_AVAILABLE,
  buildStaffRecord,
  describeAllocations,
  duplicateEmployeeId,
  filterStaff,
  formatDate,
  linkPatch,
  linkedUser,
  paginate,
  permissionState,
  photoFileError,
  findTimetableConflict,
  scheduleConflicts,
  staffAllocations,
  staffDisplayName,
  staffInitials,
  staffMetrics,
  suggestedAccountRole,
  suggestedUser,
  unlinkPatch,
  validateStaffInput,
  validateStatusChange,
  weeklyHours,
  withStatusChange,
} from './staffModel';

const directory = [
  {
    id: '1',
    firstName: 'Ada',
    lastName: 'Lovelace',
    employeeId: 'E-1',
    email: 'ada@school.edu',
    role: 'instructor',
    status: 'active',
  },
  {
    id: '2',
    name: 'Grace Hopper',
    employeeId: 'e-2',
    email: 'grace@school.edu',
    role: 'support staff',
    status: 'on_leave',
  },
];

describe('staff directory model', () => {
  it('uses a real name, initials, and HR role normalization', () => {
    expect(staffDisplayName({ name: 'Grace Hopper' })).toBe('Grace Hopper');
    expect(staffInitials({ name: 'Grace Hopper' })).toBe('GH');
    expect(filterStaff(directory, { query: 'e-1', role: 'instructor' })).toHaveLength(1);
    expect(filterStaff(directory, { role: 'support_staff', status: 'on_leave' })[0].id).toBe('2');
    expect(staffMetrics(directory)).toEqual({ totalStaff: 2, activeInstructors: 1, onLeaveCount: 1 });
  });

  it('paginates and rejects a duplicate employee ID', () => {
    expect(paginate(['a', 'b', 'c'], 4, 2)).toMatchObject({ page: 2, pageCount: 2, items: ['c'] });
    expect(duplicateEmployeeId(directory, ' e-2 ', '1')?.id).toBe('2');
    expect(validateStaffInput({ ...buildStaffRecord({ firstName: 'Ada', lastName: 'L', employeeId: 'E-1', email: 'new@school.edu', phone: '1', role: 'instructor' }) }, directory, '2').employeeId).toMatch(/already/i);
  });

  it('keeps payroll unavailable and formats stored dates', () => {
    expect(PAYROLL_AVAILABLE).toBe(false);
    expect(formatDate('2022-09-10')).toBe('Sep 10, 2022');
    expect(formatDate('')).toBe('—');
  });

  it('records a status change without dropping earlier history', () => {
    expect(validateStatusChange('active', 'active', 'long enough reason')).toMatch(/different/i);
    expect(validateStatusChange('active', 'on_leave', 'no')).toMatch(/5 characters/i);
    const next = withStatusChange({ status: 'active', statusHistory: [{ status: 'active' }] }, 'inactive', 'Left campus', '2026-01-02T00:00:00.000Z');
    expect(next.statusHistory).toHaveLength(2);
    expect(next.statusHistory[1]).toMatchObject({ status: 'inactive', note: 'Left campus' });
  });

  it('links accounts separately from the HR role', () => {
    expect(suggestedAccountRole('administrator')).toBe('support_staff');
    expect(suggestedAccountRole('teacher')).toBe('instructor');
    const users = [{ _id: 'user-1', email: 'ada@school.edu', name: 'Ada' }];
    expect(suggestedUser(users, directory[0])._id).toBe('user-1');
    expect(linkedUser(users, { ...directory[0], linkedUserId: 'user-1' }).email).toBe('ada@school.edu');
    expect(linkPatch(users[0])).toEqual({ linkedUserId: 'user-1', accountEmail: 'ada@school.edu' });
    expect(unlinkPatch()).toEqual({ linkedUserId: '', accountEmail: '' });
    expect(permissionState({ permissions: { students: 'manage' } }).students).toBe('manage');
    expect(permissionState({ permissions: { students: 'manage' } }).fees).toBe('none');
  });

  it('describes a teacher timetable and overlapping classes', () => {
    const allocations = staffAllocations(
      [
        { id: 'b', staffId: '1', subjectId: 'math', sectionId: 'a', day: 'Monday', startTime: '09:30', endTime: '11:00' },
        { id: 'a', staffId: '1', subjectId: 'math', sectionId: 'b', day: 'Monday', startTime: '09:00', endTime: '10:00' },
        { id: 'c', staffId: '2', subjectId: 'eng', sectionId: 'a', day: 'Tuesday', startTime: '09:00', endTime: '10:00' },
      ],
      '1'
    );
    const described = describeAllocations(allocations, {
      subjects: [{ id: 'math', name: 'Mathematics' }],
      sections: [{ id: 'a', name: 'Section A', programId: 'p1' }, { id: 'b', name: 'Section B', programId: 'p1' }],
      programs: [{ id: 'p1', name: 'Grade 10' }],
    });
    expect(described.map((item) => item.sectionName)).toEqual(['Section B', 'Section A']);
    expect(described[0].programName).toBe('Grade 10');
    expect(described[0].roomLabel).toBe('Room pending');
    expect(weeklyHours(described)).toBe(2.5);
    expect(scheduleConflicts(described)).toHaveLength(1);
    const monday = {
      staffId: 't1',
      sectionId: 's1',
      subjectId: 'math',
      day: 'Monday',
      startTime: '09:00',
      endTime: '10:00',
      room: 'Lab 1',
    };
    expect(findTimetableConflict([monday], { ...monday, day: 'Wednesday' })).toBeNull();
    expect(
      findTimetableConflict([monday], {
        ...monday,
        staffId: 't2',
        subjectId: 'eng',
        startTime: '09:30',
        endTime: '10:30',
        room: 'Lab 2',
      }).reason
    ).toBe('class');
    expect(
      findTimetableConflict([monday], {
        ...monday,
        sectionId: 's2',
        subjectId: 'eng',
        startTime: '09:30',
        room: 'Lab 2',
      }).reason
    ).toBe('teacher');
    expect(
      findTimetableConflict([monday], {
        staffId: 't2',
        sectionId: 's2',
        subjectId: 'eng',
        day: 'Monday',
        startTime: '09:15',
        endTime: '09:45',
        room: 'Lab 1',
      }).reason
    ).toBe('room');
    expect(
      findTimetableConflict([monday], {
        ...monday,
        staffId: 't2',
        startTime: '10:00',
        endTime: '11:00',
      })
    ).toBeNull();
    expect(photoFileError({ type: 'text/plain', size: 10 })).toMatch(/JPG/);
    expect(photoFileError({ type: 'image/png', size: 3 * 1024 * 1024 })).toMatch(/2MB/);
    expect(photoFileError({ type: 'image/gif', size: 20 })).toBe('');
  });
});
