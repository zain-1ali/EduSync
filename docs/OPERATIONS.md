# EduSync Operations

## Deployment

1. Use a supported Node version from `.nvmrc` and run `npm ci`.
2. Create a hosted MongoDB database. The API on Vercel cannot reach `mongodb://127.0.0.1`.
3. Configure production values documented in `.env.example` on the host, not in the web bundle. Required: `MONGODB_URI`, `JWT_ACCESS_SECRET` (at least 32 characters and not the development default), `CLIENT_ORIGINS`, `APP_URL`, and `COOKIE_SECURE=true`. Add SMTP settings before relying on invitations or password resets.
4. Run `npm run check`.
5. Deploy this repository from its root with `vercel.json`. That publishes `apps/web/dist` and the Express API together. The production web build calls `/api` on the same host. Check `/health/ready` after deploy.
6. Seed the super administrator against the hosted database with `npm run seed:super-admin --workspace=api`. Do not commit the seed password.
7. Build and sign Electron installers on the target release platform. Set `VITE_API_URL` to the public API origin, including the `/api` suffix, before `npm run build:desktop`.

Use separate MongoDB credentials and signing secrets per environment. Restrict CORS and trusted-client configuration to the deployed web and desktop origins.

## Backup and restore

- Take encrypted MongoDB snapshots at least daily and before schema migrations.
- Retain daily, weekly, and monthly generations according to the school contract.
- Test restore into an isolated environment regularly.
- After restore, verify tenant counts, users, sync records, payment totals, and audit-event continuity before allowing clients to reconnect.
- A restored server may receive replayed client outboxes; mutation IDs make those retries idempotent.

## Monitoring and recovery

Monitor liveness/readiness, request error rate, authentication failures, sync rejection/conflict rates, outbox age, database storage, and mail delivery. Alert when pending mutations remain above the agreed threshold.

For an incident:

1. Preserve logs and audit events.
2. Disable only the affected capability where possible.
3. Restore service or data from a verified snapshot.
4. Rotate exposed credentials.
5. Reconnect a test client and verify pull cursors, replay deduplication, tenant isolation, and financial totals.
6. Record the incident and remediation.

## Client recovery

Local databases are partitioned by tenant and user. Sign-out does not silently delete unsynced work. Before clearing site data or reinstalling the desktop app, confirm that the outbox is empty or export diagnostic information. Permission elevation and password/session recovery require connectivity.
