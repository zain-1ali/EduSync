import {
  ACCESS_LEVELS,
  MODULES,
  SYNC_OPERATION_TYPES,
  hasRequiredAccess,
} from '@school/contracts';
import { SyncMutation } from '../models/SyncMutation.js';
import { nextSyncSequence } from '../models/SyncCounter.js';
import { SyncRecord } from '../models/SyncRecord.js';

const entityModules = {
  students: MODULES.STUDENTS,
  guardians: MODULES.STUDENTS,
  staff: MODULES.STAFF,
  academicYears: MODULES.ACADEMICS,
  programs: MODULES.ACADEMICS,
  sections: MODULES.ACADEMICS,
  subjects: MODULES.ACADEMICS,
  allocations: MODULES.ACADEMICS,
  attendance: MODULES.ATTENDANCE,
  assessments: MODULES.ACADEMICS,
  grades: MODULES.ACADEMICS,
  feeStructures: MODULES.FEES,
  charges: MODULES.FEES,
  payments: MODULES.FEES,
  settings: MODULES.SETTINGS,
  notifications: MODULES.DASHBOARD,
};

function canManage(user, entityType) {
  if (user.role === 'school_admin' || user.role === 'super_admin') return true;
  const moduleName = entityModules[entityType];
  return hasRequiredAccess(user.permissions?.get?.(moduleName), ACCESS_LEVELS.MANAGE);
}

function canonical(record) {
  return {
    ...(record.data || {}),
    id: record.entityId,
    tenantId: record.tenantId.toString(),
    version: record.version,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    deletedAt: record.deletedAt?.toISOString() || null,
  };
}

function conflictResult(mutation, record) {
  return {
    type: 'conflict',
    mutationId: mutation.mutationId,
    entityType: mutation.entityType,
    entityId: mutation.entityId,
    local: mutation.payload,
    server: record ? canonical(record) : null,
  };
}

export function financialError(mutation, current) {
  if (!['payments', 'charges'].includes(mutation.entityType)) return null;
  if (mutation.operation === SYNC_OPERATION_TYPES.DELETE) {
    return {
      code: 'FINANCIAL_DELETE_FORBIDDEN',
      message: 'Financial records must be reversed or voided, not deleted',
    };
  }
  if (mutation.entityType === 'payments') {
    const payload = mutation.payload || {};
    if (!(Number(payload.amount) > 0) || !payload.studentId) {
      return {
        code: 'INVALID_PAYMENT',
        message: 'A payment requires a student and a positive amount',
      };
    }
    if (current) {
      const existing = current.data || {};
      const immutable = ['studentId', 'amount', 'receiptNumber', 'paidAt'];
      if (immutable.some((field) => String(existing[field] ?? '') !== String(payload[field] ?? ''))) {
        return {
          code: 'IMMUTABLE_PAYMENT_FIELDS',
          message: 'Payment identity, amount, receipt number, and payment date are immutable',
        };
      }
    }
  }
  return null;
}

async function claimMutation(tenantId, mutation) {
  const existing = await SyncMutation.findOne({
    tenantId,
    mutationId: mutation.mutationId,
  });
  if (existing?.status === 'completed') return { duplicate: existing.result };
  if (existing) {
    return {
      duplicate: {
        type: 'rejected',
        mutationId: mutation.mutationId,
        entityType: mutation.entityType,
        entityId: mutation.entityId,
        error: { code: 'MUTATION_IN_PROGRESS', message: 'Mutation is already processing' },
      },
    };
  }

  try {
    const claim = await SyncMutation.create({
      tenantId,
      mutationId: mutation.mutationId,
      entityType: mutation.entityType,
      entityId: mutation.entityId,
      status: 'processing',
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1_000),
    });
    return { claim };
  } catch (error) {
    if (error.code !== 11000) throw error;
    const duplicate = await SyncMutation.findOne({ tenantId, mutationId: mutation.mutationId });
    return { duplicate: duplicate?.result };
  }
}

async function complete(claim, result) {
  claim.status = 'completed';
  claim.result = result;
  await claim.save();
  return result;
}

export async function applyMutation({ tenantId, user, mutation }) {
  const claimed = await claimMutation(tenantId, mutation);
  if (claimed.duplicate) return claimed.duplicate;
  const { claim } = claimed;

  try {
    if (!canManage(user, mutation.entityType)) {
      return complete(claim, {
        type: 'rejected',
        mutationId: mutation.mutationId,
        entityType: mutation.entityType,
        entityId: mutation.entityId,
        error: { code: 'INSUFFICIENT_ACCESS', message: 'Manage access is required' },
      });
    }

    const key = {
      tenantId,
      entityType: mutation.entityType,
      entityId: mutation.entityId,
    };
    const current = await SyncRecord.findOne(key);
    const invalidFinancialMutation = financialError(mutation, current);
    if (invalidFinancialMutation) {
      return complete(claim, {
        type: 'rejected',
        mutationId: mutation.mutationId,
        entityType: mutation.entityType,
        entityId: mutation.entityId,
        error: invalidFinancialMutation,
      });
    }

    if (mutation.operation === SYNC_OPERATION_TYPES.CREATE && current) {
      return complete(claim, conflictResult(mutation, current));
    }
    if (
      mutation.operation !== SYNC_OPERATION_TYPES.CREATE &&
      (!current || current.version !== mutation.baseVersion)
    ) {
      return complete(claim, conflictResult(mutation, current));
    }

    const sequence = await nextSyncSequence(tenantId);
    let record;
    if (mutation.operation === SYNC_OPERATION_TYPES.CREATE) {
      record = await SyncRecord.create({
        ...key,
        data: mutation.payload,
        version: 1,
        syncSequence: sequence,
        modifiedBy: user.id,
      });
    } else {
      const deleting = mutation.operation === SYNC_OPERATION_TYPES.DELETE;
      record = await SyncRecord.findOneAndUpdate(
        { ...key, version: mutation.baseVersion },
        {
          $set: {
            data: deleting ? current.data : mutation.payload,
            deletedAt: deleting ? new Date() : null,
            syncSequence: sequence,
            modifiedBy: user.id,
          },
          $inc: { version: 1 },
        },
        { new: true, runValidators: true }
      );
      if (!record) {
        return complete(
          claim,
          conflictResult(mutation, await SyncRecord.findOne(key))
        );
      }
    }

    return complete(claim, {
      type: 'accepted',
      mutationId: mutation.mutationId,
      entityType: mutation.entityType,
      entityId: mutation.entityId,
      record: canonical(record),
    });
  } catch (error) {
    await SyncMutation.deleteOne({ _id: claim.id });
    throw error;
  }
}

export async function pullChanges({ tenantId, cursor, limit }) {
  const records = await SyncRecord.find({
    tenantId,
    syncSequence: { $gt: cursor },
  })
    .sort({ syncSequence: 1 })
    .limit(limit + 1);

  const hasMore = records.length > limit;
  const page = hasMore ? records.slice(0, limit) : records;
  return {
    changes: page.map((record) => ({
      entityType: record.entityType,
      entityId: record.entityId,
      sequence: record.syncSequence,
      record: canonical(record),
    })),
    nextCursor: page.at(-1)?.syncSequence || cursor,
    hasMore,
  };
}
