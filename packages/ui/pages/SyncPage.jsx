import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLocalData } from '../data/LocalDataProvider';
import { Layout } from '../Layout';

export function SyncPage() {
  const { db, status, syncNow } = useLocalData();
  const [logs, setLogs] = useState([]);
  const [conflicts, setConflicts] = useState([]);
  const [queue, setQueue] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!db) return;
    Promise.all([
      db.syncLog.orderBy('timestamp').reverse().limit(20).toArray(),
      db.conflicts.where('status').equals('open').toArray(),
      db.outbox.orderBy('createdAt').limit(50).toArray(),
    ]).then(([nextLogs, nextConflicts, nextQueue]) => {
      setLogs(nextLogs);
      setConflicts(nextConflicts);
      setQueue(nextQueue);
    });
  }, [db, status.lastSyncAt, status.conflicts, status.failed, status.pending]);

  const triggerSync = async () => {
    setMessage('');
    try {
      await syncNow();
      setMessage('Synchronization completed.');
    } catch (error) {
      setMessage(error.message || 'Synchronization failed.');
    }
  };

  const retry = async (mutationId) => {
    await db.outbox.update(mutationId, {
      status: 'pending',
      attempts: 0,
      lastError: null,
      updatedAt: new Date().toISOString(),
    });
    await triggerSync();
  };

  const downloadLogs = () => {
    const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), logs }, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `edusync-sync-log-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Layout title="Sync & System Status">
      <div className="p-8 max-w-5xl mx-auto w-full flex flex-col gap-8">
        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <p className={`text-sm font-black uppercase tracking-widest ${status.online ? 'text-emerald-600' : 'text-amber-600'}`}>
              {status.online ? 'Online' : 'Offline'}
            </p>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white mt-1">
              {status.running ? 'Synchronizing changes…' : 'Local-first data is ready'}
            </h1>
            <p className="text-slate-500 mt-2">
              {status.lastSyncAt
                ? `Last successful sync: ${new Date(status.lastSyncAt).toLocaleString()}`
                : 'This device has not completed its first synchronization.'}
            </p>
          </div>
          <button
            type="button"
            onClick={triggerSync}
            disabled={!status.online || status.running || !db}
            className="h-12 px-6 rounded-lg bg-primary text-white font-bold disabled:opacity-50"
          >
            {status.running ? 'Syncing…' : 'Sync now'}
          </button>
          {message && <p className="text-sm font-semibold" role="status">{message}</p>}
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            ['Pending changes', status.pending, 'schedule'],
            ['Failed changes', status.failed, 'error'],
            ['Open conflicts', status.conflicts, 'compare_arrows'],
          ].map(([label, value, icon]) => (
            <div key={label} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
              <span className="material-symbols-outlined text-primary">{icon}</span>
              <p className="mt-3 text-3xl font-black">{value}</p>
              <p className="text-sm text-slate-500">{label}</p>
            </div>
          ))}
        </section>

        {conflicts.length > 0 && (
          <section className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20 p-5">
            <h2 className="font-black text-amber-800 dark:text-amber-300">Conflicts need review</h2>
            <div className="mt-3 space-y-2">
              {conflicts.map((conflict) => (
                <Link
                  key={conflict.id}
                  to={`/sync/conflicts?id=${encodeURIComponent(conflict.id)}`}
                  className="flex items-center justify-between rounded-lg bg-white dark:bg-slate-900 p-3 font-semibold"
                >
                  <span>{conflict.entityType} · {conflict.entityId}</span>
                  <span className="material-symbols-outlined">chevron_right</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
          <header className="p-5 border-b border-slate-200 dark:border-slate-800">
            <h2 className="font-black text-lg">Mutation queue</h2>
          </header>
          {queue.length === 0 ? (
            <p className="p-8 text-center text-slate-500">The local queue is empty.</p>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {queue.map((item) => (
                <li key={item.mutationId} className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div>
                    <p className="font-bold">{item.operation} {item.entityType}</p>
                    <p className="text-xs text-slate-500">{item.entityId} · {item.status} · {item.attempts || 0} attempt(s)</p>
                    {item.lastError && <p className="mt-1 text-xs text-red-600">{typeof item.lastError === 'string' ? item.lastError : item.lastError.message}</p>}
                  </div>
                  {item.status === 'failed' && (
                    <button type="button" disabled={!status.online || status.running} onClick={() => retry(item.mutationId)} className="rounded-lg border border-primary px-3 py-2 text-sm font-bold text-primary disabled:opacity-40">
                      Retry
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
          <header className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
            <h2 className="font-black text-lg">Sync history</h2>
            <button type="button" disabled={!logs.length} onClick={downloadLogs} className="rounded-lg border px-3 py-2 text-sm font-bold disabled:opacity-40">Download log</button>
          </header>
          {logs.length === 0 ? (
            <p className="p-8 text-center text-slate-500">No synchronization attempts recorded.</p>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {logs.map((log) => (
                <li key={log.id} className="p-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-bold capitalize">{log.direction}</p>
                    <p className="text-xs text-slate-500">{new Date(log.timestamp).toLocaleString()}</p>
                  </div>
                  <span className={`text-xs font-black uppercase ${log.status === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>
                    {log.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </Layout>
  );
}