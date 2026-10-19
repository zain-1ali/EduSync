import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLocalData } from '../data/LocalDataProvider';
import { Layout } from '../Layout';

export function SyncConflictPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { db, sync } = useLocalData();
  const [conflict, setConflict] = useState(null);
  const [selection, setSelection] = useState({});
  const [message, setMessage] = useState('');
  const id = searchParams.get('id');

  useEffect(() => {
    if (!db || !id) return;
    db.conflicts.get(id).then(setConflict);
  }, [db, id]);

  const fields = useMemo(() => {
    if (!conflict) return [];
    const ignored = new Set(['tenantId', 'version', 'createdAt', 'updatedAt', 'syncStatus']);
    return [...new Set([
      ...Object.keys(conflict.local || {}),
      ...Object.keys(conflict.server || {}),
    ])].filter((key) => !ignored.has(key));
  }, [conflict]);

  const resolve = async (resolution) => {
    if (!conflict || !sync) return;
    setMessage('');
    try {
      let merged;
      if (resolution === 'merge') {
        merged = Object.fromEntries(
          fields.map((field) => [
            field,
            selection[field] === 'server'
              ? conflict.server?.[field]
              : conflict.local?.[field],
          ])
        );
      }
      await sync.resolveConflict(conflict.id, resolution, merged);
      navigate('/sync');
    } catch (error) {
      setMessage(error.message || 'Conflict could not be resolved.');
    }
  };

  return (
    <Layout title="Sync Management">
      <div className="flex flex-col gap-8 max-w-[1000px] mx-auto w-full p-6 md:p-8 flex-1">
        {!id ? (
          <p className="rounded-xl border border-slate-200 p-8 text-center text-slate-500">Select a conflict from the sync page.</p>
        ) : !conflict ? (
          <p className="p-8 text-center text-slate-500">Loading conflict…</p>
        ) : (
          <>
            <header>
              <p className="text-sm font-black uppercase tracking-widest text-amber-600">{conflict.entityType}</p>
              <h1 className="text-3xl font-black">Resolve data conflict</h1>
              <p className="text-slate-500">Record {conflict.entityId}</p>
            </header>

            <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="grid grid-cols-[minmax(120px,1fr)_2fr_2fr] bg-slate-100 dark:bg-slate-800 p-3 text-xs font-black uppercase">
                <span>Field</span><span>Local value</span><span>Server value</span>
              </div>
              {fields.map((field) => {
                const local = conflict.local?.[field];
                const server = conflict.server?.[field];
                const differs = JSON.stringify(local) !== JSON.stringify(server);
                return (
                  <div key={field} className={`grid grid-cols-[minmax(120px,1fr)_2fr_2fr] gap-2 p-3 border-t border-slate-200 dark:border-slate-800 ${differs ? 'bg-amber-50/60 dark:bg-amber-950/10' : ''}`}>
                    <span className="font-bold break-words">{field}</span>
                    <button type="button" onClick={() => setSelection((current) => ({ ...current, [field]: 'local' }))} className={`text-left rounded p-2 break-all ${selection[field] !== 'server' ? 'ring-2 ring-primary' : ''}`}>
                      {local == null ? '—' : typeof local === 'object' ? JSON.stringify(local) : String(local)}
                    </button>
                    <button type="button" onClick={() => setSelection((current) => ({ ...current, [field]: 'server' }))} className={`text-left rounded p-2 break-all ${selection[field] === 'server' ? 'ring-2 ring-primary' : ''}`}>
                      {server == null ? '—' : typeof server === 'object' ? JSON.stringify(server) : String(server)}
                    </button>
                  </div>
                );
              })}
            </div>

            {message && <p className="text-red-600 font-semibold" role="alert">{message}</p>}
            <footer className="flex flex-wrap justify-end gap-3">
              <button type="button" onClick={() => navigate('/sync')} className="h-11 px-4 rounded-lg border border-slate-300 font-bold">Review later</button>
              <button type="button" onClick={() => resolve('server')} className="h-11 px-4 rounded-lg border border-primary text-primary font-bold">Keep server</button>
              <button type="button" onClick={() => resolve('local')} className="h-11 px-4 rounded-lg border border-primary text-primary font-bold">Keep local</button>
              <button type="button" onClick={() => resolve('merge')} className="h-11 px-5 rounded-lg bg-primary text-white font-bold">Use selected fields</button>
            </footer>
          </>
        )}
      </div>
    </Layout>
  );
}