import { SYNC_OPERATION_TYPES } from '@school/contracts';
import Dexie from 'dexie';
import { DOMAIN_TABLES } from './database.js';

const localLocks = new Map();

async function withSyncLock(name, operation) {
  if (globalThis.navigator?.locks) {
    return navigator.locks.request(name, { ifAvailable: true }, (lock) =>
      lock ? operation() : undefined
    );
  }
  if (localLocks.has(name)) return localLocks.get(name);
  const running = operation().finally(() => localLocks.delete(name));
  localLocks.set(name, running);
  return running;
}

function conflictId(entityType, entityId) {
  return `${entityType}:${entityId}`;
}

export class SyncEngine {
  constructor({ db, transport, tenantId }) {
    this.db = db;
    this.transport = transport;
    this.tenantId = tenantId;
    this.listeners = new Set();
    this.running = false;
    this.online = globalThis.navigator?.onLine ?? true;
    this.onOnline = () => {
      this.online = true;
      this.emit();
      this.sync().catch(() => {});
    };
    this.onOffline = () => {
      this.online = false;
      this.emit();
    };
  }

  start() {
    globalThis.addEventListener?.('online', this.onOnline);
    globalThis.addEventListener?.('offline', this.onOffline);
    this.timer = globalThis.setInterval?.(() => {
      if (this.online) this.sync().catch(() => {});
    }, 30_000);
    if (this.online) this.sync().catch(() => {});
  }

  stop() {
    globalThis.removeEventListener?.('online', this.onOnline);
    globalThis.removeEventListener?.('offline', this.onOffline);
    if (this.timer) globalThis.clearInterval?.(this.timer);
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  async snapshot() {
    return {
      online: this.online,
      running: this.running,
      pending: await this.db.outbox.where('status').equals('pending').count(),
      failed: await this.db.outbox.where('status').equals('failed').count(),
      conflicts: await this.db.conflicts.where('status').equals('open').count(),
      lastSyncAt: (await this.db.syncMeta.get('lastSyncAt'))?.value || null,
    };
  }

  emit() {
    return Promise.resolve(this.snapshot())
      .then((snapshot) => {
        for (const listener of this.listeners) listener(snapshot);
      })
      .catch(() => {});
  }

  async sync() {
    if (!this.online) return;
    return withSyncLock(`edusync-sync-${this.tenantId}`, async () => {
      this.running = true;
      this.emit();
      try {
        await this.push();
        await this.pull();
        const timestamp = new Date().toISOString();
        await this.db.syncMeta.put({ key: 'lastSyncAt', value: timestamp });
        await this.db.syncLog.add({
          timestamp,
          status: 'success',
          direction: 'bidirectional',
        });
      } catch (error) {
        await this.db.syncLog.add({
          timestamp: new Date().toISOString(),
          status: 'failed',
          direction: 'bidirectional',
          message: error.message,
        });
        throw error;
      } finally {
        this.running = false;
        this.emit();
      }
    });
  }

  async push() {
    const mutations = await this.db.outbox
      .where('[status+createdAt]')
      .between(['pending', Dexie.minKey], ['pending', Dexie.maxKey])
      .limit(500)
      .toArray()
      .then((items) => {
        const currentTime = Date.now();
        const eligible = items
          .filter((item) => {
            const attempts = Number(item.attempts || 0);
            if (!attempts) return true;
            const delay = Math.min(5 * 60_000, 2 ** Math.min(attempts, 8) * 1_000);
            return currentTime - Date.parse(item.updatedAt || item.createdAt) >= delay;
          });
        const batch = [];
        let bytes = 0;
        for (const item of eligible) {
          const itemBytes = JSON.stringify(item).length;
          if (batch.length && bytes + itemBytes > 750_000) break;
          batch.push(item);
          bytes += itemBytes;
          if (batch.length >= 100) break;
        }
        return batch;
      });
    if (mutations.length === 0) return;

    await this.db.outbox.bulkUpdate(
      mutations.map((item) => ({
        key: item.mutationId,
          changes: {
            status: 'syncing',
            attempts: item.attempts + 1,
            updatedAt: new Date().toISOString(),
          },
      }))
    );

    try {
      const result = await this.transport.push({ mutations });
      await this.db.transaction(
        'rw',
        [...DOMAIN_TABLES.map((name) => this.db.table(name)), this.db.outbox, this.db.conflicts],
        async () => {
          for (const accepted of result.accepted || []) {
            const table = this.db.table(accepted.entityType);
            if (accepted.record?.deletedAt) await table.delete(accepted.entityId);
            else await table.put({ ...accepted.record, syncStatus: 'synced' });
            await this.db.outbox.delete(accepted.mutationId);
          }
          for (const conflict of result.conflicts || []) {
            await this.db.outbox.update(conflict.mutationId, { status: 'conflict' });
            await this.db.conflicts.put({
              id: conflictId(conflict.entityType, conflict.entityId),
              ...conflict,
              status: 'open',
              createdAt: new Date().toISOString(),
            });
          }
          for (const rejected of result.rejected || []) {
            await this.db.outbox.update(rejected.mutationId, {
              status: 'failed',
              lastError: rejected.error,
            });
          }
        }
      );
    } catch (error) {
      await this.db.outbox.bulkUpdate(
        mutations.map((item) => ({
          key: item.mutationId,
          changes: {
            status: 'pending',
            lastError: error.message,
            updatedAt: new Date().toISOString(),
          },
        }))
      );
      throw error;
    }
  }

  async pull() {
    let cursor = (await this.db.syncMeta.get('pullCursor'))?.value || 0;
    let hasMore = true;
    while (hasMore) {
      const result = await this.transport.pull({ cursor, limit: 250 });
      for (const change of result.changes || []) {
        if (!DOMAIN_TABLES.includes(change.entityType)) continue;
        const pending = await this.db.outbox
          .where('entityId')
          .equals(change.entityId)
          .filter((item) => ['pending', 'syncing', 'conflict'].includes(item.status))
          .first();
        if (pending) {
          const local = await this.db.table(change.entityType).get(change.entityId);
          await this.db.conflicts.put({
            id: conflictId(change.entityType, change.entityId),
            entityType: change.entityType,
            entityId: change.entityId,
            mutationId: pending.mutationId,
            local,
            server: change.record,
            status: 'open',
            createdAt: new Date().toISOString(),
          });
          await this.db.outbox.update(pending.mutationId, { status: 'conflict' });
        } else if (change.record?.deletedAt) {
          await this.db.table(change.entityType).delete(change.entityId);
        } else {
          await this.db
            .table(change.entityType)
            .put({ ...change.record, syncStatus: 'synced' });
        }
      }
      cursor = result.nextCursor ?? cursor;
      await this.db.syncMeta.put({ key: 'pullCursor', value: cursor });
      hasMore = Boolean(result.hasMore);
    }
  }

  async resolveConflict(id, resolution, mergedRecord) {
    const conflict = await this.db.conflicts.get(id);
    if (!conflict) throw new Error('Conflict not found');
    const table = this.db.table(conflict.entityType);

    await this.db.transaction('rw', table, this.db.outbox, this.db.conflicts, async () => {
      await this.db.outbox.where('entityId').equals(conflict.entityId).delete();
      if (resolution === 'server') {
        if (conflict.server?.deletedAt) await table.delete(conflict.entityId);
        else await table.put({ ...conflict.server, syncStatus: 'synced' });
      } else {
        const record = resolution === 'merge' ? mergedRecord : conflict.local;
        const timestamp = new Date().toISOString();
        await table.put({ ...record, updatedAt: timestamp, syncStatus: 'pending' });
        await this.db.outbox.add({
          mutationId: crypto.randomUUID(),
          entityType: conflict.entityType,
          entityId: conflict.entityId,
          operation: SYNC_OPERATION_TYPES.RESOLVE,
          baseVersion: conflict.server?.version || 0,
          payload: record,
          status: 'pending',
          attempts: 0,
          createdAt: timestamp,
          updatedAt: timestamp,
        });
      }
      await this.db.conflicts.update(id, {
        status: 'resolved',
        resolution,
        resolvedAt: new Date().toISOString(),
      });
    });
    this.emit();
  }
}
