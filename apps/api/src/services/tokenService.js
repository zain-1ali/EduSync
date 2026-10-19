import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { RefreshSession } from '../models/RefreshSession.js';
import { Tenant } from '../models/Tenant.js';
import { AppError } from '../utils/AppError.js';
import { createOpaqueToken, hashToken } from '../utils/secrets.js';

function serializePermissions(permissions) {
  if (!permissions) return {};
  if (permissions instanceof Map) return Object.fromEntries(permissions);
  return { ...permissions };
}

export function issueAccessToken(user) {
  return jwt.sign(
    {
      tenantId: user.tenantId?.toString() || null,
      role: user.role,
      permissions: serializePermissions(user.permissions),
    },
    env.JWT_ACCESS_SECRET,
    {
      subject: user.id,
      expiresIn: env.ACCESS_TOKEN_TTL,
      issuer: 'edusync-api',
      audience: 'edusync-client',
    }
  );
}

export function verifyAccessToken(token) {
  try {
    return jwt.verify(token, env.JWT_ACCESS_SECRET, {
      issuer: 'edusync-api',
      audience: 'edusync-client',
    });
  } catch {
    throw new AppError(401, 'INVALID_ACCESS_TOKEN', 'Your session is invalid or has expired');
  }
}

export async function issueRefreshSession(user, request, deviceName, persistent = false) {
  const token = createOpaqueToken();
  const expiresAt = new Date(
    Date.now() + env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1_000
  );

  const session = await RefreshSession.create({
    userId: user.id,
    tenantId: user.tenantId,
    tokenHash: hashToken(token),
    deviceName,
    persistent,
    userAgent: request.get('user-agent'),
    ipAddress: request.ip,
    expiresAt,
    lastUsedAt: new Date(),
  });

  return { token, session, expiresAt };
}

export async function rotateRefreshSession(rawToken, request) {
  if (!rawToken) {
    throw new AppError(401, 'REFRESH_TOKEN_REQUIRED', 'A refresh token is required');
  }

  const session = await RefreshSession.findOneAndUpdate(
    {
      tokenHash: hashToken(rawToken),
      revokedAt: null,
      expiresAt: { $gt: new Date() },
    },
    {
      $set: {
        revokedAt: new Date(),
        revokeReason: 'rotated',
        lastUsedAt: new Date(),
      },
    },
    { new: false }
  )
    .select('+tokenHash')
    .populate('userId');

  if (!session || !session.userId) {
    throw new AppError(401, 'INVALID_REFRESH_TOKEN', 'The refresh session is invalid');
  }

  const user = session.userId;
  if (user.status !== 'active') {
    throw new AppError(403, 'ACCOUNT_UNAVAILABLE', 'This account is not active');
  }
  if (user.role !== 'super_admin') {
    const tenant = await Tenant.findById(user.tenantId);
    if (!tenant || tenant.status !== 'active') {
      throw new AppError(403, 'TENANT_UNAVAILABLE', 'This school account is unavailable');
    }
  }

  const next = await issueRefreshSession(user, request, session.deviceName, session.persistent);
  await RefreshSession.updateOne(
    { _id: session.id },
    { $set: { replacedBySessionId: next.session.id } }
  );

  return {
    user,
    accessToken: issueAccessToken(user),
    refreshToken: next.token,
    refreshExpiresAt: next.expiresAt,
    persistent: session.persistent,
  };
}

export async function revokeRefreshSession(rawToken, reason = 'logout') {
  if (!rawToken) return;
  await RefreshSession.updateOne(
    { tokenHash: hashToken(rawToken), revokedAt: null },
    { $set: { revokedAt: new Date(), revokeReason: reason } }
  );
}
