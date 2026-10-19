import 'fake-indexeddb/auto';
import { afterEach, describe, expect, it } from 'vitest';
import { createDatabase } from './database.js';
import { createRepository } from './repository.js';

let db;

afterEach(async () => {
  if (db) {
    db.close();
    await db.delete();
    db = null;
  }
});

describe('local-first repository', () => {
  it('writes immediately and coalesces edits into a pending create', async () => {
    db = createDatabase({ tenantId: 'tenant-a', userId: crypto.randomUUID() });
    const students = createRepository({
      db,
      tableName: 'students',
      tenantId: 'tenant-a',
    });

    const created = await students.create({ name: 'Amina Noor', admissionNumber: 'A-1' });
    const updated = await students.update(created.id, { name: 'Amina N.' });
    const queued = await db.outbox.toArray();

    expect(updated.name).toBe('Amina N.');
    expect(updated.syncStatus).toBe('pending');
    expect(queued).toHaveLength(1);
    expect(queued[0].operation).toBe('create');
    expect(queued[0].payload.name).toBe('Amina N.');
  });

  it('removes an unsynced create without producing a delete mutation', async () => {
    db = createDatabase({ tenantId: 'tenant-a', userId: crypto.randomUUID() });
    const students = createRepository({
      db,
      tableName: 'students',
      tenantId: 'tenant-a',
    });
    const created = await students.create({ name: 'Temporary Student' });
    await students.remove(created.id);

    expect(await students.get(created.id)).toBeUndefined();
    expect(await db.outbox.count()).toBe(0);
  });

  it('bulk creates records and outbox mutations atomically', async () => {
    db = createDatabase({ tenantId: 'tenant-a', userId: crypto.randomUUID() });
    const students = createRepository({
      db,
      tableName: 'students',
      tenantId: 'tenant-a',
    });

    const records = await students.bulkCreate([
      { name: 'First Student', admissionNumber: 'A-1' },
      { name: 'Second Student', admissionNumber: 'A-2' },
    ]);

    expect(records).toHaveLength(2);
    expect(await db.students.count()).toBe(2);
    expect(await db.outbox.count()).toBe(2);
  });
});
