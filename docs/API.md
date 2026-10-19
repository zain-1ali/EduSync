# EduSync API

Base URL: `/api`

All error responses use:

```json
{
  "error": {
    "code": "MACHINE_READABLE_CODE",
    "message": "Human-readable message",
    "details": [],
    "requestId": "uuid"
  }
}
```

## Authentication

- `POST /auth/register` — submit a school application.
- `POST /auth/login` — issue an access token and HTTP-only rotating refresh session.
- `POST /auth/refresh` — rotate the refresh session; requires `x-edusync-client: 1`.
- `POST /auth/logout` — revoke the current refresh session.
- `GET /auth/me` — return current user and tenant.
- `POST /auth/setup-password` — activate an invited account.
- `POST /auth/forgot-password` — request a reset link with a non-enumerating response.
- `POST /auth/reset-password` — replace a password and revoke existing sessions.

Use `Authorization: Bearer <access-token>` for protected requests. Tenant identity is derived from the authenticated user and is never accepted from a client-provided tenant header.

## Platform administration

All routes require a `super_admin` account.

- `GET /admin/schools/pending`
- `POST /admin/approve/:schoolId`
- `POST /admin/schools/:schoolId/reject`
- `GET /admin/tenants`
- `PATCH /admin/tenants/:tenantId/status`

## Tenant user management

All routes require `users: manage` access. School administrators receive an implicit full-access override.

- `GET /users`
- `POST /users`
- `PUT /users/:userId/permissions`
- `PATCH /users/:userId/status`
- `POST /users/:userId/revoke-sessions`

## Health

- `GET /health/live`
- `GET /health/ready`

## Permission model

Modules use `none`, `view`, or `manage`. The API applies authorization independently of frontend route visibility. Platform super administrators can cross tenant boundaries only through platform administration routes.
