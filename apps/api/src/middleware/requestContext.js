import crypto from 'node:crypto';

export function requestContext(req, res, next) {
  const inboundId = req.get('x-request-id');
  req.id = inboundId?.slice(0, 100) || crypto.randomUUID();
  res.setHeader('x-request-id', req.id);
  next();
}
