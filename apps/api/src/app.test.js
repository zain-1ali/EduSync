import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from './app.js';

describe('API foundation', () => {
  const app = createApp();

  it('serves liveness with security headers', async () => {
    const response = await request(app).get('/health/live').expect(200);
    expect(response.body).toEqual({ status: 'ok' });
    expect(response.headers['x-content-type-options']).toBe('nosniff');
    expect(response.headers['x-request-id']).toBeTruthy();
  });

  it('rejects protected routes without an access token', async () => {
    const response = await request(app).get('/api/auth/me').expect(401);
    expect(response.body.error.code).toBe('AUTHENTICATION_REQUIRED');
  });

  it('rejects cookie-session mutations without the trusted client header', async () => {
    const response = await request(app).post('/api/auth/refresh').send({}).expect(403);
    expect(response.body.error.code).toBe('CLIENT_HEADER_REQUIRED');
  });

  it('returns a structured not-found response', async () => {
    const response = await request(app).get('/missing').expect(404);
    expect(response.body.error.code).toBe('ROUTE_NOT_FOUND');
    expect(response.body.error.requestId).toBeTruthy();
  });
});
