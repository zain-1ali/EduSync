import { ACCESS_LEVELS, hasRequiredAccess } from '@school/contracts';
import { Tenant } from '../models/Tenant.js';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { verifyAccessToken } from '../services/tokenService.js';

function bearerToken(req) {
  const value = req.get('authorization');
  if (!value?.startsWith('Bearer ')) return null;
  return value.slice(7).trim();
}

export async function protect(req, _res, next) {
  try {
    const token = bearerToken(req);
    if (!token) {
      throw new AppError(401, 'AUTHENTICATION_REQUIRED', 'Authentication is required');
    }

    const claims = verifyAccessToken(token);
    const user = await User.findById(claims.sub);

    if (!user || user.status !== 'active') {
      throw new AppError(401, 'ACCOUNT_UNAVAILABLE', 'This account is not active');
    }

    if (
      user.passwordChangedAt &&
      claims.iat * 1_000 + 1_000 < user.passwordChangedAt.getTime()
    ) {
      throw new AppError(401, 'SESSION_STALE', 'Please sign in again');
    }

    if (user.role !== 'super_admin') {
      const tenant = await Tenant.findById(user.tenantId);
      if (!tenant || tenant.status !== 'active') {
        throw new AppError(403, 'TENANT_UNAVAILABLE', 'This school account is unavailable');
      }
      req.tenant = tenant;
      req.tenantId = tenant.id;
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

export function requireAccess(moduleName, requiredLevel = ACCESS_LEVELS.VIEW) {
  return function accessGuard(req, _res, next) {
    if (!req.user) {
      return next(new AppError(401, 'AUTHENTICATION_REQUIRED', 'Authentication is required'));
    }

    if (req.user.role === 'super_admin' || req.user.role === 'school_admin') {
      return next();
    }

    const actual = req.user.permissions?.get?.(moduleName) || ACCESS_LEVELS.NONE;
    if (!hasRequiredAccess(actual, requiredLevel)) {
      return next(
        new AppError(403, 'INSUFFICIENT_ACCESS', 'You do not have access to this operation')
      );
    }

    return next();
  };
}

export function requireSuperAdmin(req, _res, next) {
  if (req.user?.role !== 'super_admin') {
    return next(new AppError(403, 'SUPER_ADMIN_REQUIRED', 'Platform administrator access required'));
  }
  return next();
}
