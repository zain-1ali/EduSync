import { createDatabase, createRepository, DOMAIN_TABLES, SyncEngine } from '@school/data';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { apiClient } from '../api/axiosClient';
import { useAuth } from '../auth/AuthProvider';

const LocalDataContext = createContext(null);

const emptyStatus = {
  online: globalThis.navigator?.onLine ?? true,
  running: false,
  pending: 0,
  failed: 0,
  conflicts: 0,
  lastSyncAt: null,
};

export function LocalDataProvider({ children }) {
  const { status: authStatus, user } = useAuth();
  if (authStatus !== 'authenticated' || !user?.tenantId || !(user._id || user.id)) {
    return (
      <LocalDataContext.Provider value={{ status: emptyStatus, syncNow: async () => {}, ready: true }}>
        {children}
      </LocalDataContext.Provider>
    );
  }
  const identity = `${user.tenantId}:${user._id || user.id}`;
  return (
    <ActiveLocalDataProvider key={identity} user={user}>
      {children}
    </ActiveLocalDataProvider>
  );
}

function createRuntime(user) {
  const tenantId = String(user.tenantId);
  const db = createDatabase({ tenantId, userId: user._id || user.id });
  const repositories = Object.fromEntries(
    DOMAIN_TABLES.map((tableName) => [
      tableName,
      createRepository({ db, tableName, tenantId }),
    ])
  );
  const transport = {
    async push(payload) {
      const response = await apiClient.post('/sync/push', payload);
      return response.data;
    },
    async pull(params) {
      const response = await apiClient.get('/sync/pull', { params });
      return response.data;
    },
  };
  const sync = new SyncEngine({ db, transport, tenantId });
  return { db, repositories, sync };
}

function ActiveLocalDataProvider({ children, user }) {
  const [runtime, setRuntime] = useState(null);
  const [syncStatus, setSyncStatus] = useState(emptyStatus);
  const tenantId = String(user.tenantId);
  const userId = String(user._id || user.id);

  useEffect(() => {
    const active = createRuntime({ tenantId, _id: userId });
    let cancelled = false;
    const unsubscribe = active.sync.subscribe((nextStatus) => {
      if (!cancelled) setSyncStatus(nextStatus);
    });
    active.sync.start();
    active.sync.snapshot().then((snapshot) => {
      if (!cancelled) setSyncStatus(snapshot);
    });
    setRuntime(active);

    return () => {
      cancelled = true;
      unsubscribe();
      active.sync.stop();
      active.db.close();
      setRuntime((current) => (current === active ? null : current));
    };
  }, [tenantId, userId]);

  const value = useMemo(
    () => ({
      ...(runtime || {}),
      ready: Boolean(runtime),
      status: syncStatus,
      syncNow: () => runtime?.sync.sync(),
    }),
    [runtime, syncStatus]
  );
  return <LocalDataContext.Provider value={value}>{children}</LocalDataContext.Provider>;
}

export function useLocalData() {
  const value = useContext(LocalDataContext);
  if (!value) throw new Error('useLocalData must be used inside LocalDataProvider');
  return value;
}
