import 'fake-indexeddb/auto';
import { afterEach, describe, expect, it } from 'vitest';
import { createDatabase } from './database.js';
import { createRepository } from './repository.js';
import { SyncEngine } from './syncEngine.js';

let db;

afterEach(async () => {
  if (db) {
    db.close();
    await db.delete();
    db = null;
  }
});

describe('SyncEngine', () => {
  it('replaces a pending record with the canonical accepted record', async () => {
    db = createDatabase({ tenantId: 'tenant-a', userId: crypto.randomUUID() });
    const students = createRepository({ db, tableName: 'students', tenantId: 'tenant-a' });
    const local = await students.create({ name: 'Local Student', admissionNumber: 'A-1' });
    const transport = {
      async push({ mutations }) {
        return {
          accepted: mutations.map((mutation) => ({
            ...mutation,
            record: { ...mutation.payload, version: 1, syncStatus: 'synced' },
          })),
          conflicts: [],
          rejected: [],
        };
      },
      async pull() {
        return { changes: [], nextCursor: 0, hasMore: false };
      },
    };

    await new SyncEngine({ db, transport, tenantId: 'tenant-a' }).sync();

    expect((await db.students.get(local.id)).version).toBe(1);
    expect(await db.outbox.count()).toBe(0);
  });
});
