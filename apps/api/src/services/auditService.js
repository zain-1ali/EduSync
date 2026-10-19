import { AuditEvent } from '../models/AuditEvent.js';

export async function recordAudit({
  req,
  action,
  entityType,
  entityId,
  tenantId = req.tenantId,
  metadata = {},
}) {
  return AuditEvent.create({
    tenantId,
    actorUserId: req.user?.id,
    action,
    entityType,
    entityId: String(entityId),
    requestId: req.id,
    ipAddress: req.ip,
    metadata,
  });
}
