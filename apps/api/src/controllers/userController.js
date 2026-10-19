import { DEFAULT_ROLE_PERMISSIONS } from '@school/contracts';
import { env } from '../config/env.js';
import { RefreshSession } from '../models/RefreshSession.js';
import { SyncRecord } from '../models/SyncRecord.js';
import { User } from '../models/User.js';
import { recordAudit } from '../services/auditService.js';
import { sendSetupInvitation } from '../services/mailService.js';
import { AppError } from '../utils/AppError.js';
import { createOpaqueToken, hashToken } from '../utils/secrets.js';

function tenantUser(req, userId) {
  return User.findOne({ _id: userId, tenantId: req.tenantId, role: { $ne: 'super_admin' } });
}

export async function listUsers(req, res) {
  const users = await User.find({ tenantId: req.tenantId, role: { $ne: 'super_admin' } })
    .sort({ name: 1 })
    .lean();
  res.json({ data: users });
}

export async function inviteUser(req, res) {
  const { name, email, role, permissions, staffId } = req.validated.body;
  if (
    staffId &&
    !(await SyncRecord.exists({
      tenantId: req.tenantId,
      entityType: 'staff',
      entityId: staffId,
      deletedAt: null,
    }))
  ) {
    throw new AppError(409, 'STAFF_NOT_SYNCED', 'Synchronize the staff record before inviting a login');
  }
  if (staffId && (await User.exists({ tenantId: req.tenantId, staffId }))) {
    throw new AppError(409, 'STAFF_ACCOUNT_EXISTS', 'That staff record already has a login');
  }
  const setupToken = createOpaqueToken();
  const user = await User.create({
    tenantId: req.tenantId,
    name,
    email,
    role,
    permissions:
      Object.keys(permissions).length > 0 ? permissions : DEFAULT_ROLE_PERMISSIONS[role] || {},
    staffId,
    status: 'pending_setup',
    setupTokenHash: hashToken(setupToken),
    setupTokenExpiresAt: new Date(Date.now() + env.SETUP_TOKEN_TTL_HOURS * 60 * 60 * 1_000),
  });

  let invitation = { status: 'sent' };
  try {
    const delivery = await sendSetupInvitation({ email, name, token: setupToken });
    invitation = { status: 'sent', ...(delivery.url ? { previewUrl: delivery.url } : {}) };
  } catch (error) {
    req.log?.error({ err: error, userId: user.id }, 'User invitation delivery failed');
    invitation = { status: 'failed' };
  }

  await recordAudit({
    req,
    action: 'user.invited',
    entityType: 'User',
    entityId: user.id,
    metadata: { role, invitationStatus: invitation.status },
  });

  res.status(201).json({
    message: 'User invited',
    data: { user, invitation },
  });
}

export async function updateStaffLink(req, res) {
  const { userId } = req.validated.params;
  const { staffId } = req.validated.body;
  const user = await tenantUser(req, userId);
  if (!user) throw new AppError(404, 'USER_NOT_FOUND', 'User account not found');
  if (
    staffId &&
    !(await SyncRecord.exists({
      tenantId: req.tenantId,
      entityType: 'staff',
      entityId: staffId,
      deletedAt: null,
    }))
  ) {
    throw new AppError(404, 'STAFF_NOT_FOUND', 'Staff record not found');
  }
  if (
    staffId &&
    (await User.exists({ tenantId: req.tenantId, staffId, _id: { $ne: user.id } }))
  ) {
    throw new AppError(409, 'STAFF_ACCOUNT_EXISTS', 'That staff record already has a login');
  }
  user.staffId = staffId || undefined;
  await user.save();
  await recordAudit({
    req,
    action: staffId ? 'user.staff.linked' : 'user.staff.unlinked',
    entityType: 'User',
    entityId: user.id,
    metadata: { staffId: staffId || null },
  });
  res.json({ message: staffId ? 'Staff account linked' : 'Staff account unlinked', data: user });
}

export async function updatePermissions(req, res) {
  const { userId } = req.validated.params;
  const user = await tenantUser(req, userId);
  if (!user) throw new AppError(404, 'USER_NOT_FOUND', 'User account not found');
  if (user.role === 'school_admin') {
    throw new AppError(
      409,
      'ADMIN_PERMISSIONS_FIXED',
      'School administrators always have full tenant access'
    );
  }

  user.permissions = req.validated.body.permissions;
  await user.save();
  await recordAudit({
    req,
    action: 'user.permissions.updated',
    entityType: 'User',
    entityId: user.id,
    metadata: { permissions: req.validated.body.permissions },
  });
  res.json({ message: 'Permissions updated', data: user });
}

export async function updateUserStatus(req, res) {
  const { userId } = req.validated.params;
  const { status, reason } = req.validated.body;
  if (userId === req.user.id) {
    throw new AppError(409, 'SELF_STATUS_CHANGE', 'You cannot change your own account status');
  }

  const user = await tenantUser(req, userId);
  if (!user) throw new AppError(404, 'USER_NOT_FOUND', 'User account not found');

  user.status = status;
  await user.save();
  if (status !== 'active') {
    await RefreshSession.updateMany(
      { userId: user.id, revokedAt: null },
      { $set: { revokedAt: new Date(), revokeReason: `account_${status}` } }
    );
  }

  await recordAudit({
    req,
    action: `user.${status}`,
    entityType: 'User',
    entityId: user.id,
    metadata: { reason },
  });
  res.json({ message: `User ${status}`, data: user });
}

export async function revokeUserSessions(req, res) {
  const { userId } = req.params;
  const user = await tenantUser(req, userId);
  if (!user) throw new AppError(404, 'USER_NOT_FOUND', 'User account not found');

  const result = await RefreshSession.updateMany(
    { userId: user.id, revokedAt: null },
    { $set: { revokedAt: new Date(), revokeReason: 'administrator_revoked' } }
  );
  await recordAudit({
    req,
    action: 'user.sessions.revoked',
    entityType: 'User',
    entityId: user.id,
    metadata: { sessionCount: result.modifiedCount },
  });
  res.json({ message: 'Active sessions revoked', data: { count: result.modifiedCount } });
}
