import bcrypt from 'bcryptjs';
import { env } from '../config/env.js';
import { RefreshSession } from '../models/RefreshSession.js';
import { SchoolApplication } from '../models/SchoolApplication.js';
import { Tenant } from '../models/Tenant.js';
import { User } from '../models/User.js';
import { sendPasswordReset } from '../services/mailService.js';
import {
  issueAccessToken,
  issueRefreshSession,
  revokeRefreshSession,
  rotateRefreshSession,
} from '../services/tokenService.js';
import { AppError } from '../utils/AppError.js';
import { createOpaqueToken, hashToken } from '../utils/secrets.js';

const REFRESH_COOKIE = 'edusync_refresh';

function refreshCookieOptions(expires, persistent = true) {
  const options = {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: env.COOKIE_SECURE ? 'none' : 'lax',
    path: '/api/auth',
  };
  if (persistent) options.expires = expires;
  return options;
}

function publicUser(user) {
  const value = user.toJSON();
  value.permissions =
    user.permissions instanceof Map ? Object.fromEntries(user.permissions) : user.permissions || {};
  return value;
}

export async function registerSchool(req, res) {
  const application = await SchoolApplication.create(req.validated.body);
  res.status(201).json({
    message: 'School application received',
    data: {
      applicationId: application.id,
      status: application.status,
    },
  });
}

export async function login(req, res) {
  const { email, password, deviceName, rememberDevice = false } = req.validated.body;
  const user = await User.findOne({ email }).select('+passwordHash');

  const valid = user?.passwordHash ? await bcrypt.compare(password, user.passwordHash) : false;
  if (!valid) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect');
  }
  if (user.status !== 'active') {
    throw new AppError(403, 'ACCOUNT_UNAVAILABLE', 'This account is not ready for sign in');
  }
  if (user.role !== 'super_admin') {
    const tenant = await Tenant.findById(user.tenantId);
    if (!tenant || tenant.status !== 'active') {
      throw new AppError(403, 'TENANT_UNAVAILABLE', 'This school account is unavailable');
    }
  }

  user.lastLoginAt = new Date();
  await user.save();

  const accessToken = issueAccessToken(user);
  const refresh = await issueRefreshSession(user, req, deviceName, rememberDevice);
  res.cookie(
    REFRESH_COOKIE,
    refresh.token,
    refreshCookieOptions(refresh.expiresAt, rememberDevice)
  );

  res.json({
    token: accessToken,
    accessToken,
    data: { user: publicUser(user) },
  });
}

export async function setupPassword(req, res) {
  const { token, newPassword } = req.validated.body;
  const user = await User.findOne({
    setupTokenHash: hashToken(token),
    setupTokenExpiresAt: { $gt: new Date() },
    status: 'pending_setup',
  }).select('+setupTokenHash +setupTokenExpiresAt');

  if (!user) {
    throw new AppError(400, 'INVALID_SETUP_TOKEN', 'This setup link is invalid or expired');
  }

  user.passwordHash = await bcrypt.hash(newPassword, 12);
  user.status = 'active';
  user.passwordChangedAt = new Date();
  user.setupTokenHash = undefined;
  user.setupTokenExpiresAt = undefined;
  await user.save();

  res.json({ message: 'Password created successfully' });
}

export async function forgotPassword(req, res) {
  const { email } = req.validated.body;
  const user = await User.findOne({ email, status: 'active' });

  let previewUrl;
  if (user) {
    const token = createOpaqueToken();
    user.resetTokenHash = hashToken(token);
    user.resetTokenExpiresAt = new Date(
      Date.now() + env.RESET_TOKEN_TTL_MINUTES * 60 * 1_000
    );
    await user.save();
    const delivery = await sendPasswordReset({ email: user.email, name: user.name, token });
    previewUrl = delivery.url;
  }

  res.json({
    message: 'If an active account exists, a reset link has been sent',
    ...(previewUrl ? { previewUrl } : {}),
  });
}

export async function resetPassword(req, res) {
  const { token, newPassword } = req.validated.body;
  const user = await User.findOne({
    resetTokenHash: hashToken(token),
    resetTokenExpiresAt: { $gt: new Date() },
    status: 'active',
  }).select('+resetTokenHash +resetTokenExpiresAt');

  if (!user) {
    throw new AppError(400, 'INVALID_RESET_TOKEN', 'This reset link is invalid or expired');
  }

  user.passwordHash = await bcrypt.hash(newPassword, 12);
  user.passwordChangedAt = new Date();
  user.resetTokenHash = undefined;
  user.resetTokenExpiresAt = undefined;
  await user.save();

  await RefreshSession.updateMany(
    { userId: user.id, revokedAt: null },
    { $set: { revokedAt: new Date(), revokeReason: 'password_reset' } }
  );

  res.clearCookie(REFRESH_COOKIE, refreshCookieOptions(new Date(0)));
  res.json({ message: 'Password reset successfully' });
}

export async function refresh(req, res) {
  const rawToken = req.cookies[REFRESH_COOKIE] || req.validated.body.refreshToken;
  const rotated = await rotateRefreshSession(rawToken, req);
  res.cookie(
    REFRESH_COOKIE,
    rotated.refreshToken,
    refreshCookieOptions(rotated.refreshExpiresAt, rotated.persistent)
  );
  res.json({
    token: rotated.accessToken,
    accessToken: rotated.accessToken,
    data: { user: publicUser(rotated.user) },
  });
}

export async function logout(req, res) {
  const rawToken = req.cookies[REFRESH_COOKIE] || req.body?.refreshToken;
  await revokeRefreshSession(rawToken);
  res.clearCookie(REFRESH_COOKIE, refreshCookieOptions(new Date(0)));
  res.status(204).end();
}

export async function me(req, res) {
  res.json({
    data: {
      user: publicUser(req.user),
      tenant: req.tenant || null,
    },
  });
}
