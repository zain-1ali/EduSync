# EduSync

EduSync is a local-first, multi-tenant school management system delivered as a web application and an Electron desktop application.

## Workspaces

- `apps/web` — Vite/React web client
- `apps/desktop` — Electron desktop client
- `apps/api` — Express/Mongoose REST API
- `packages/ui` — shared pages, components, routing, and client hooks
- `packages/contracts` — shared roles, permissions, and protocol constants
- `packages/data` — tenant-partitioned IndexedDB repositories, outbox, and sync engine
- `docs/FRONTEND_GAP_AUDIT.md` — frontend completeness checklist

## Requirements

- Node.js 22 or newer
- npm 10 or newer
- MongoDB 7 or newer once the API workspace is enabled

## Setup

```bash
npm install
copy .env.example .env
```

Do not commit `.env` or production secrets.

## Commands

```bash
npm run dev:web
npm run dev:desktop
npm run dev:api
npm run lint
npm run test
npm run build
```

## Architecture rules

- Shared product UI belongs in `packages/ui`; app workspaces only provide platform shells.
- Web and desktop use the same route manifest and domain behavior.
- Domain writes are local-first and synchronize through an idempotent outbox.
- Every tenant-owned server query must be scoped by trusted tenant context.
- Permission checks are enforced on the API even when the UI hides unavailable actions.

## Offline behavior

The web client can reopen offline only after its application shell has previously been loaded and cached. First-time access, authentication, tenant approval, and permission elevation require connectivity.

See `docs/FRONTEND_GAP_AUDIT.md` for the implementation acceptance checklist.
Deployment, backup, restore, monitoring, and incident guidance is in `docs/OPERATIONS.md`.
