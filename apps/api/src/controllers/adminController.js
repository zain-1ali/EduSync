import crypto from 'node:crypto';
import { env } from '../config/env.js';
import { SchoolApplication } from '../models/SchoolApplication.js';
import { RefreshSession } from '../models/RefreshSession.js';
import { Tenant } from '../models/Tenant.js';
import { User } from '../models/User.js';
import { recordAudit } from '../services/auditService.js';
import { sendSetupInvitation } from '../services/mailService.js';
import { AppError } from '../utils/AppError.js';
import { createOpaqueToken, hashToken } from '../utils/secrets.js';

function slugify(value) {
  const base = value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-')
    .slice(0, 50);
  return `${base || 'school'}-${crypto.randomBytes(3).toString('hex')}`;
}

export async function listPendingSchools(_req, res) {
  const applications = await SchoolApplication.find({ status: 'pending' })
    .sort({ createdAt: 1 })
    .lean();
  res.json({ data: applications });
}

export async function listTenants(_req, res) {
  const tenants = await Tenant.find().sort({ createdAt: -1 }).lean();
  res.json({ data: tenants });
}

export async function approveSchool(req, res) {
  const { schoolId } = req.validated.params;
  const application = await SchoolApplication.findOneAndUpdate(
    { _id: schoolId, status: 'pending' },
    { $set: { status: 'processing', reviewedBy: req.user.id, reviewedAt: new Date() } },
    { new: true }
  );

  if (!application) {
    throw new AppError(409, 'APPLICATION_NOT_PENDING', 'This application is not pending');
  }

  let tenant;
  let admin;
  try {
    tenant = await Tenant.create({
      name: application.schoolName,
      slug: slugify(application.schoolName),
      approvedAt: new Date(),
      approvedBy: req.user.id,
    });

    const setupToken = createOpaqueToken();
    admin = await User.create({
      tenantId: tenant.id,
      name: application.applicantName,
      email: application.applicantEmail,
      role: 'school_admin',
      status: 'pending_setup',
      setupTokenHash: hashToken(setupToken),
      setupTokenExpiresAt: new Date(Date.now() + env.SETUP_TOKEN_TTL_HOURS * 60 * 60 * 1_000),
    });

    application.status = 'approved';
    application.tenantId = tenant.id;
    await application.save();

    let invitation = { status: 'sent' };
    try {
      const delivery = await sendSetupInvitation({
        email: admin.email,
        name: admin.name,
        token: setupToken,
      });
      invitation = {
        status: 'sent',
        ...(delivery.url ? { previewUrl: delivery.url } : {}),
      };
    } catch (error) {
      req.log?.error({ err: error, userId: admin.id }, 'Setup invitation delivery failed');
      invitation = { status: 'failed' };
    }

    await recordAudit({
      req,
      action: 'school.application.approved',
      entityType: 'SchoolApplication',
      entityId: application.id,
      tenantId: tenant.id,
      metadata: { adminUserId: admin.id, invitationStatus: invitation.status },
    });

    return res.json({
      message: 'School approved and tenant provisioned',
      data: {
        tenant,
        admin: { id: admin.id, email: admin.email, status: admin.status },
        invitation,
      },
    });
  } catch (error) {
    if (admin) await User.deleteOne({ _id: admin.id });
    if (tenant) await Tenant.deleteOne({ _id: tenant.id });
    application.status = 'pending';
    application.reviewedBy = undefined;
    application.reviewedAt = undefined;
    await application.save();
    throw error;
  }
}

export async function rejectSchool(req, res) {
  const { schoolId } = req.validated.params;
  const { reason } = req.validated.body;
  const application = await SchoolApplication.findOneAndUpdate(
    { _id: schoolId, status: 'pending' },
    {
      $set: {
        status: 'rejected',
        decisionReason: reason,
        reviewedBy: req.user.id,
        reviewedAt: new Date(),
      },
    },
    { new: true }
  );

  if (!application) {
    throw new AppError(409, 'APPLICATION_NOT_PENDING', 'This application is not pending');
  }

  await recordAudit({
    req,
    action: 'school.application.rejected',
    entityType: 'SchoolApplication',
    entityId: application.id,
    metadata: { reason },
  });
  res.json({ message: 'School application rejected', data: application });
}

export async function updateTenantStatus(req, res) {
  const { tenantId } = req.validated.params;
  const { status, reason } = req.validated.body;
  const tenant = await Tenant.findByIdAndUpdate(tenantId, { $set: { status } }, { new: true });
  if (!tenant) throw new AppError(404, 'TENANT_NOT_FOUND', 'School tenant not found');
  if (status === 'suspended') {
    await RefreshSession.updateMany(
      { tenantId: tenant.id, revokedAt: null },
      { $set: { revokedAt: new Date(), revokeReason: 'tenant_suspended' } }
    );
  }

  await recordAudit({
    req,
    action: `tenant.${status}`,
    entityType: 'Tenant',
    entityId: tenant.id,
    tenantId: tenant.id,
    metadata: { reason },
  });
  res.json({ message: `Tenant ${status}`, data: tenant });
}
