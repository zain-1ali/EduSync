import Dexie from 'dexie';
import { SYNC_ENTITY_TYPES } from '@school/contracts';

export const DOMAIN_TABLES = SYNC_ENTITY_TYPES;

const domainSchema = {
  students:
    '&id, tenantId, admissionNumber, [tenantId+admissionNumber], name, classId, sectionId, status, updatedAt, syncStatus',
  guardians: '&id, tenantId, studentId, name, relationship, updatedAt, syncStatus',
  staff: '&id, tenantId, employeeId, [tenantId+employeeId], name, role, status, updatedAt, syncStatus',
  academicYears: '&id, tenantId, name, status, startDate, updatedAt, syncStatus',
  programs: '&id, tenantId, name, academicYearId, status, updatedAt, syncStatus',
  sections: '&id, tenantId, programId, name, academicYearId, updatedAt, syncStatus',
  subjects: '&id, tenantId, code, name, programId, updatedAt, syncStatus',
  allocations: '&id, tenantId, staffId, subjectId, sectionId, updatedAt, syncStatus',
  attendance: '&id, tenantId, date, sectionId, studentId, [date+sectionId], updatedAt, syncStatus',
  assessments: '&id, tenantId, name, subjectId, sectionId, date, status, updatedAt, syncStatus',
  grades: '&id, tenantId, assessmentId, studentId, [assessmentId+studentId], updatedAt, syncStatus',
  feeStructures: '&id, tenantId, name, academicYearId, status, updatedAt, syncStatus',
  charges: '&id, tenantId, studentId, dueDate, status, updatedAt, syncStatus',
  payments: '&id, tenantId, studentId, receiptNumber, paidAt, status, updatedAt, syncStatus',
  settings: '&id, tenantId, key, updatedAt, syncStatus',
  notifications: '&id, tenantId, userId, readAt, createdAt, syncStatus',
  importJobs: '&id, tenantId, status, createdAt, updatedAt',
};

function safeName(value) {
  return String(value).replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 100);
}

export function createDatabase({ tenantId, userId }) {
  if (!tenantId || !userId) throw new Error('tenantId and userId are required for local storage');
  const db = new Dexie(`edusync_${safeName(tenantId)}_${safeName(userId)}`);
  db.version(1).stores({
    ...Object.fromEntries(
      Object.entries(domainSchema).filter(([tableName]) => tableName !== 'importJobs')
    ),
    outbox: '&mutationId, [status+createdAt], status, entityType, entityId, createdAt',
    conflicts: '&id, [entityType+entityId], status, createdAt',
    syncMeta: '&key',
    syncLog: '++id, timestamp, status, direction',
  });
  db.version(2).stores({
    ...domainSchema,
    outbox: '&mutationId, [status+createdAt], status, entityType, entityId, createdAt',
    conflicts: '&id, [entityType+entityId], status, createdAt',
    syncMeta: '&key',
    syncLog: '++id, timestamp, status, direction',
  });
  return db;
}
