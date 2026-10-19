import { AppError } from '../utils/AppError.js';
import { applyMutation, pullChanges } from '../services/syncService.js';

function requireTenant(req) {
  if (!req.tenantId) {
    throw new AppError(403, 'TENANT_CONTEXT_REQUIRED', 'School tenant context is required');
  }
}

export async function push(req, res) {
  requireTenant(req);
  const results = [];
  for (const mutation of req.validated.body.mutations) {
    results.push(
      await applyMutation({
        tenantId: req.tenantId,
        user: req.user,
        mutation,
      })
    );
  }

  res.json({
    accepted: results.filter((result) => result?.type === 'accepted'),
    conflicts: results.filter((result) => result?.type === 'conflict'),
    rejected: results.filter((result) => result?.type === 'rejected'),
  });
}

export async function pull(req, res) {
  requireTenant(req);
  const result = await pullChanges({
    tenantId: req.tenantId,
    cursor: req.validated.query.cursor,
    limit: req.validated.query.limit,
  });
  res.json(result);
}
