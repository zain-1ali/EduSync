import { SYNC_OPERATION_TYPES } from '@school/contracts';
import { DOMAIN_TABLES } from './database.js';

function newId() {
  return crypto.randomUUID();
}

function now() {
  return new Date().toISOString();
}

export function createRepository({ db, tableName, entityType = tableName, tenantId }) {
  if (!DOMAIN_TABLES.includes(tableName)) throw new Error(`Unknown local table: ${tableName}`);
  const table = db.table(tableName);

  async function pendingFor(entityId) {
    return db.outbox.where('entityId').equals(entityId).filter((item) => item.status === 'pending').toArray();
  }

  return {
    async list(predicate) {
      const records = await table.where('tenantId').equals(tenantId).toArray();
      return predicate ? records.filter(predicate) : records;
    },

    get(id) {
      return table.get(id);
    },

    async create(input) {
      const timestamp = now();
      const record = {
        ...input,
        id: input.id || newId(),
        tenantId,
        version: 0,
        createdAt: input.createdAt || timestamp,
        updatedAt: timestamp,
        deletedAt: null,
        syncStatus: 'pending',
      };
      const mutation = {
        mutationId: newId(),
        entityType,
        entityId: record.id,
        operation: SYNC_OPERATION_TYPES.CREATE,
        baseVersion: 0,
        payload: record,
        status: 'pending',
        attempts: 0,
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      await db.transaction('rw', table, db.outbox, async () => {
        await table.add(record);
        await db.outbox.add(mutation);
      });
      return record;
    },

    async bulkCreate(inputs) {
      const timestamp = now();
      const records = inputs.map((input, index) => ({
        ...input,
        id: input.id || newId(),
        tenantId,
        version: 0,
        createdAt: input.createdAt || timestamp,
        updatedAt: new Date(Date.parse(timestamp) + index).toISOString(),
        deletedAt: null,
        syncStatus: 'pending',
      }));
      const mutations = records.map((record) => ({
        mutationId: newId(),
        entityType,
        entityId: record.id,
        operation: SYNC_OPERATION_TYPES.CREATE,
        baseVersion: 0,
        payload: record,
        status: 'pending',
        attempts: 0,
        createdAt: record.updatedAt,
        updatedAt: record.updatedAt,
      }));

      await db.transaction('rw', table, db.outbox, async () => {
        await table.bulkAdd(records);
        await db.outbox.bulkAdd(mutations);
      });
      return records;
    },

    async update(id, patch) {
      return db.transaction('rw', table, db.outbox, async () => {
        const current = await table.get(id);
        if (!current || current.deletedAt) throw new Error(`${entityType} record not found`);
        const timestamp = now();
        const record = {
          ...current,
          ...patch,
          id,
          tenantId,
          version: current.version || 0,
          updatedAt: timestamp,
          syncStatus: 'pending',
        };
        const queued = await pendingFor(id);
        const coalesced = queued.find((item) =>
          [SYNC_OPERATION_TYPES.CREATE, SYNC_OPERATION_TYPES.UPDATE].includes(item.operation)
        );

        await table.put(record);
        if (coalesced) {
          await db.outbox.update(coalesced.mutationId, {
            payload: record,
            updatedAt: timestamp,
          });
        } else {
          await db.outbox.add({
            mutationId: newId(),
            entityType,
            entityId: id,
            operation: SYNC_OPERATION_TYPES.UPDATE,
            baseVersion: current.version || 0,
            payload: record,
            status: 'pending',
            attempts: 0,
            createdAt: timestamp,
            updatedAt: timestamp,
          });
        }
        return record;
      });
    },

    async remove(id) {
      return db.transaction('rw', table, db.outbox, async () => {
        const current = await table.get(id);
        if (!current) return;
        const queued = await pendingFor(id);
        const pendingCreate = queued.find(
          (item) => item.operation === SYNC_OPERATION_TYPES.CREATE
        );
        if (pendingCreate) {
          await table.delete(id);
          await db.outbox.bulkDelete(queued.map((item) => item.mutationId));
          return;
        }

        const timestamp = now();
        await db.outbox.bulkDelete(queued.map((item) => item.mutationId));
        await table.put({
          ...current,
          deletedAt: timestamp,
          updatedAt: timestamp,
          syncStatus: 'pending',
        });
        await db.outbox.add({
          mutationId: newId(),
          entityType,
          entityId: id,
          operation: SYNC_OPERATION_TYPES.DELETE,
          baseVersion: current.version || 0,
          payload: null,
          status: 'pending',
          attempts: 0,
          createdAt: timestamp,
          updatedAt: timestamp,
        });
      });
    },
  };
}
